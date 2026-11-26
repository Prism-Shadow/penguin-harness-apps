"""Detect the primary person on sparse keyframes with a CPU NanoDet model."""

import cv2
import numpy as np

from subject_pose import forward, load_network


class PersonBox:
    def __init__(self):
        self.model = load_network("object_detection_nanodet_2022nov_int8bq.onnx")
        self.strides = (8,16,32,64)
        self.grids = []
        for stride in self.strides:
            coords = np.arange(416//stride)*stride + .5*(stride-1)
            x,y = np.meshgrid(coords,coords)
            self.grids.append(np.c_[x.ravel(),y.ravel()])

    def detect(self,image,prior):
        h,w = image.shape[:2]
        scale = 416/max(h,w)
        dw,dh = round(w*scale),round(h*scale)
        x,y = (416-dw)//2,(416-dh)//2
        padded = np.full((416,416,3),114,np.float32)
        padded[y:y+dh,x:x+dw] = cv2.resize(image,(dw,dh),interpolation=cv2.INTER_LINEAR)
        blob = ((padded - [103.53,116.28,123.675])/[57.375,57.12,58.395]).astype(np.float32)
        outputs = forward(self.model,np.ascontiguousarray(blob.transpose(2,0,1)[None]))
        selected = []
        for scores,distribution,stride,grid in zip(outputs[::2],outputs[1::2],self.strides,self.grids):
            scores = scores.reshape(-1,80)[:,0]
            top = np.argsort(scores)[-18:]
            top = top[scores[top]>.28]
            if not len(top):
                continue
            xys = grid[top]
            logits = distribution.reshape(-1,4,8)[top]
            dist = np.exp(logits-logits.max(axis=-1,keepdims=True))
            extent = (dist@np.arange(8))/dist.sum(axis=-1)*stride
            lo = (xys-extent[:,:2]-[x,y])/scale
            hi = (xys+extent[:,2:]-[x,y])/scale
            boxes = np.c_[lo,hi-lo]
            center = (lo+hi)/2
            valid = ((center[:,0]>.03*w)&(center[:,0]<.97*w)&(center[:,1]>.06*h)&
                     (center[:,1]<1.08*h)&(boxes[:,3]>.075*h))
            merits = scores[top]+.13*np.log(np.maximum(.05,boxes[:,3]/h))-.31*np.abs(center[:,0]/w-.5)
            if prior is not None:
                merits -= .25*np.linalg.norm((center-prior[:2])/[w,h],axis=1)
            if valid.any():
                i = np.argmax(np.where(valid,merits,-np.inf))
                selected.append((float(merits[i]),boxes[i]))
        if not selected:
            return None
        _,box = max(selected,key=lambda x:x[0])
        lo = np.clip(box[:2],[0,0],[w,h])
        hi = np.clip(box[:2]+box[2:],[0,0],[w,h])
        return np.r_[lo,hi-lo]
