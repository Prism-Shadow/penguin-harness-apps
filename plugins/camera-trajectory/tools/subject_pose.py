"""Sparse CPU BlazePose measurements for unconstrained people."""

import base64
from pathlib import Path

import cv2
import numpy as np

MODELS = Path(__file__).resolve().parent / "models"
JOINTS = np.array([0,7,8,11,12,13,14,15,16,23,24,25,26,27,28,31,32])


def sigmoid(v):
    return 1/(1+np.exp(-np.clip(v,-60,60)))


def anchors():
    grids = []
    for width,repeats in ((28,2),(14,2),(7,6)):
        cell = (np.arange(width,dtype=np.float32)+.5)/width
        x,y = np.meshgrid(cell,cell)
        grids.append(np.repeat(np.stack((x,y),axis=-1).reshape(-1,2),repeats,axis=0))
    return np.vstack(grids)


def load_network(filename):
    path = MODELS/filename
    if path.is_file():
        net = cv2.dnn.readNetFromONNX(str(path))
    else:
        # PenguinHarness installs UTF-8 source assets into an Agent workbench.
        encoded = path.with_name(path.name+".b64").read_bytes()
        weights = np.frombuffer(base64.b64decode(encoded),dtype=np.uint8)
        net = cv2.dnn.readNetFromONNX(weights)
    net.setPreferableBackend(cv2.dnn.DNN_BACKEND_OPENCV)
    net.setPreferableTarget(cv2.dnn.DNN_TARGET_CPU)
    return net,net.getUnconnectedOutLayersNames()


def forward(model, blob):
    net,names = model
    net.setInput(blob)
    return net.forward(names)


class SubjectPose:
    def __init__(self, fps, detect_always=False):
        self.detector = load_network("person_detection_mediapipe_2023mar_int8bq.onnx")
        self.model = load_network("pose_estimation_mediapipe_2023mar_int8bq.onnx")
        self.anchors = anchors()
        self.detect_interval = max(5,round(.51*fps))
        self.pose_interval = max(3,round(.19*fps))
        self.roi = None
        self.detection = None
        self.last = None
        self.last_index = -10000
        self.detect_always = detect_always

    def detect(self, image, origin=None, full_size=None):
        h,w = image.shape[:2]
        scale = 224/max(h,w)
        dw,dh = round(w*scale),round(h*scale)
        x,y = (224-dw)//2,(224-dh)//2
        pixels = cv2.resize(image,(dw,dh),interpolation=cv2.INTER_AREA)
        blob = np.zeros((224,224,3),np.float32)
        blob[y:y+dh,x:x+dw] = pixels[:,:,::-1]*(2./255.)-1
        regression,raw = forward(self.detector,blob.transpose(2,0,1)[None])
        scores = sigmoid(raw[0,:,0])
        choose = np.flatnonzero(scores>.31)
        if not len(choose):
            return None
        points = ((regression[0,choose,4:8].reshape(-1,2,2) +
                   224*self.anchors[choose,None,:])-np.array([x,y]))/scale
        if origin is not None:
            points += origin
            w,h = full_size
        center,upper = points.transpose(1,0,2)
        extent = np.linalg.norm(upper-center,axis=1)
        valid = ((extent>9) & (extent<1.08*max(h,w)) &
                 (center[:,0]>-.1*w)&(center[:,0]<1.1*w)&
                 (center[:,1]>-.1*h)&(center[:,1]<1.28*h))
        prefer = scores[choose] + .10*np.log(np.maximum(9,extent)/max(h,w))
        if self.roi is not None:
            prefer -= .25*np.linalg.norm(center-self.roi[0],axis=1)/max(h,w)
        prefer -= .30*np.abs(center[:,0]/w-.5)
        if not valid.any():
            return None
        best = np.argmax(np.where(valid,prefer,-np.inf))
        return (center[best],extent[best],upper[best]-center[best])

    def landmarks(self,image,roi):
        center,radius,up = roi
        angle = np.degrees(np.arctan2(up[0], -up[1]))
        affine = cv2.getRotationMatrix2D(tuple(center),float(angle),128/max(radius,7))
        affine[:,2] += 128-center
        crop = cv2.warpAffine(image,affine,(256,256),flags=cv2.INTER_LINEAR)
        blob = np.ascontiguousarray(crop[None,:,:,::-1],dtype=np.float32)/255
        key,conf,_,_,world = forward(self.model,blob)
        if conf.item()<.52:
            return None
        key = key.reshape(-1,5)
        key[:,3:] = sigmoid(key[:,3:])
        inv = cv2.invertAffineTransform(affine)
        pixels = key[:,:2]@inv[:,:2].T+inv[:,2]
        world = world.reshape(-1,3)
        world[:,:2] = world[:,:2]@inv[:,:2].T*np.linalg.norm(affine[0,:2])
        return pixels,np.min(key[:,3:],axis=1),world

    def sample(self, image, k, height, index, hint, external_roi=None):
        h,w = image.shape[:2]
        self.detection = None
        if external_roi is not None:
            self.roi = external_roi
        elif index%self.detect_interval==0 and (self.detect_always or hint is None or index-self.last_index>self.detect_interval):
            found = self.detect(image)
            if found is None and self.detect_always and index-self.last_index>self.detect_interval:
                left,right = round(.22*w),round(.78*w)
                top,bottom = round(.10*h),round(.95*h)
                found = self.detect(image[top:bottom,left:right],np.array([left,top]),(w,h))
            if found is not None:
                self.roi = found
                self.detection = found
        if index%self.pose_interval:
            return None
        roi = self.roi
        if hint is not None and (roi is None or not self.detect_always):
            x,y,bw,bh = hint
            roi = (np.array([x+.5*bw,y+.51*bh]),max(12,.67*bh),np.array([0.,-1.]))
        if roi is None:
            return None
        detection = self.landmarks(image,roi)
        if detection is None:
            return None
        pixels,conf,world = detection
        hips,shoulders = np.array([23,24]),np.array([11,12])
        fit = JOINTS[(conf[JOINTS]>.42)&np.all(pixels[JOINTS]>[-.04*w,-.04*h],axis=1)&
                     np.all(pixels[JOINTS]<[1.04*w,1.04*h],axis=1)]
        if len(fit)<5 or conf[np.r_[hips,shoulders]].mean()<.35:
            return None
        center = pixels[hips].mean(axis=0)
        chest = pixels[shoulders].mean(axis=0)
        span = np.linalg.norm(chest-center)
        if span<4 or not (-.14*w<center[0]<1.14*w and -.06*h<center[1]<1.58*h):
            return None
        hip = world[hips].mean(axis=0)
        torso = np.linalg.norm(world[shoulders].mean(axis=0)-hip)
        torso_m = .265*height
        xyz = (world-hip)*np.clip(torso_m/max(torso,.15),.64,1.55)
        ok,rvec,tvec,inliers = cv2.solvePnPRansac(xyz[fit],pixels[fit],k,None,
                                                iterationsCount=25,reprojectionError=4.5,
                                                confidence=.95,flags=cv2.SOLVEPNP_EPNP)
        depth = np.clip(k[1,1]*torso_m*.86/span,.55,120.)
        lateral = None
        if ok and len(inliers)>=max(5,.62*len(fit)) and .42*depth<tvec[2,0]<2.3*depth:
            depth = .80*tvec[2,0]+.20*depth
            if np.linalg.norm(rvec)<.70 and min(conf[23],conf[24])>.43:
                hips_axis = xyz[23]-xyz[24]
                shoulder_axis = xyz[11]-xyz[12]
                a = hips_axis/np.maximum(np.linalg.norm(hips_axis),1e-6)
                b = shoulder_axis/np.maximum(np.linalg.norm(shoulder_axis),1e-6)
                if a@b>.30:
                    lateral = cv2.Rodrigues(rvec)[0]@(.65*hips_axis+.35*shoulder_axis)
        visible = pixels[fit]
        lo,hi = np.percentile(visible,[1,99],axis=0)
        # Add a small margin for the silhouette outside the anatomical points.
        margin = np.maximum((hi-lo)*.12,3.)
        box = np.r_[lo-margin,hi-lo+2*margin]
        self.roi = (center,np.clip(max(span*2.25,np.linalg.norm(hi-lo)*.58),12,1.1*max(w,h)),
                    chest-center)
        self.last = (box,np.r_[center,depth],lateral,float(conf[fit].mean()))
        self.last_index = index
        return self.last
