"""Associate sparse pose measurements with inexpensive local foreground flow."""

import cv2
import numpy as np

from person_box import PersonBox
from subject_pose import SubjectPose


def propagate(previous,gray,box,anchor):
    if previous is None or box is None or anchor is None:
        return None
    h,w = gray.shape
    x,y,bw,bh = box
    lo = np.maximum([0,0],np.floor([x+.13*bw,y+.09*bh])).astype(int)
    hi = np.minimum([w,h],np.ceil([x+.87*bw,y+.80*bh])).astype(int)
    if np.any(hi-lo<9):
        return None
    roi = previous[lo[1]:hi[1],lo[0]:hi[0]]
    points = cv2.goodFeaturesToTrack(roi,42,.012,4,blockSize=5)
    if points is None or len(points)<7:
        return None
    points = (points.reshape(-1,2)+lo).astype(np.float32)
    moved,ok,_ = cv2.calcOpticalFlowPyrLK(previous,gray,points,None,winSize=(15,15),maxLevel=2)
    back,back_ok,_ = cv2.calcOpticalFlowPyrLK(gray,previous,moved,None,winSize=(15,15),maxLevel=2)
    good = (ok.ravel()>0)&(back_ok.ravel()>0)&(np.linalg.norm(back-points,axis=1)<.85)
    if good.sum()<7:
        return None
    a,b = points[good],moved[good]
    warp,inliers = cv2.estimateAffinePartial2D(a,b,method=cv2.RANSAC,ransacReprojThreshold=2.,
                                              maxIters=45,confidence=.95,refineIters=4)
    if warp is None or inliers.sum()<max(6,.50*len(a)):
        return None
    factor = np.linalg.norm(warp[0,:2])
    if not .83<factor<1.20 or abs(warp[1,0])>.18:
        return None
    pixel = warp[:,:2]@anchor[:2]+warp[:,2]
    if not (-.15*w<pixel[0]<1.15*w and -.15*h<pixel[1]<1.65*h):
        return None
    delta = pixel-anchor[:2]
    if np.linalg.norm(delta)>.19*max(w,h):
        return None
    box = np.r_[box[:2]+delta-(factor-1)*box[2:]*.5,box[2:]*factor]
    depth = np.clip(anchor[2]/factor,.62,100.)
    return box,np.r_[pixel,depth],delta,float(factor)


class MovieSubject:
    def __init__(self,fps):
        self.model = SubjectPose(fps,detect_always=True)
        self.fps = fps
        self.people = PersonBox()
        self.reset()

    def reset(self):
        self.gray = None
        self.box = None
        self.anchor = None
        self.model.roi = None
        self.model.last = None
        self.model.last_index = -10000
        self.last_supported = -10000
        self.radius_scale = None
        self.last_box_scan = -10000

    def moving_region(self,gray,bg_motion,k,height):
        if self.gray is None or bg_motion is None:
            return None
        h,w = gray.shape
        warped = cv2.warpPerspective(self.gray,bg_motion,(w,h))
        inside = cv2.warpPerspective(np.ones_like(gray),bg_motion,(w,h),flags=cv2.INTER_NEAREST)
        diff = cv2.absdiff(gray,warped)
        blur = cv2.GaussianBlur(diff,(5,5),0)
        threshold = max(12.,float(np.percentile(blur,73))*1.8)
        mask = ((blur>threshold)&(inside>0)).astype(np.uint8)
        mask[:round(.12*h)] = 0
        mask[:,:round(.16*w)] = 0
        mask[:,round(.84*w):] = 0
        mask = cv2.morphologyEx(mask,cv2.MORPH_CLOSE,np.ones((7,7),np.uint8))
        _,_,stats,_ = cv2.connectedComponentsWithStats(mask)
        if len(stats)<2:
            return None
        x,y,bw,bh,area = stats[1:].T
        centers = np.column_stack((x+.5*bw,y+.5*bh))
        reference = np.array([.5*w,.58*h]) if self.anchor is None else self.anchor[:2]
        proximity = np.linalg.norm((centers-reference)/[w,h],axis=1)
        valid = ((area>=40)&(area<.055*w*h)&(bh>.06*h)&(bh<.67*h)&(bw<.31*w)&
                 (bw>.025*w)&(proximity<.35))
        if not valid.any():
            return None
        best = np.argmax(np.where(valid,np.log(area)-7*proximity,-np.inf))
        full = np.array([x[best],y[best],bw[best],bh[best]],dtype=float)
        # Motion usually covers only part of the body.
        full[2:] *= 1.33
        full[:2] -= .165*full[2:]
        depth = np.clip(k[1,1]*height/full[3],.62,75.)
        return full,np.r_[centers[best],depth]

    def update(self,image,gray,k,height,index,bg_motion):
        propagated = propagate(self.gray,gray,self.box,self.anchor)
        if propagated is not None and self.model.roi is not None:
            _,_,delta,factor = propagated
            center,radius,axis = self.model.roi
            self.model.roi = center+delta,radius*factor,axis
        hint = None
        box_measurement = None
        if index-self.last_box_scan>=max(9,round(.55*self.fps)):
            self.last_box_scan = index
            reference = propagated[1] if propagated is not None else self.anchor
            box_measurement = self.people.detect(image,reference)
        if box_measurement is not None:
            x,y,w,h = box_measurement
            hint = np.array([x+.5*w,y+.52*h]),max(.65*h,.56*w),np.array([0.,-1.])
        pose = self.model.sample(image,k,height,index,None,hint)
        detected = self.model.detection
        complete = False
        if box_measurement is not None:
            x,y,w,h = box_measurement
            complete = y>3 and y+h<gray.shape[0]-4 and h>1.35*w
            size_prior = .92*height if complete else .62*height
            box_anchor = np.r_[hint[0],np.clip(k[1,1]*size_prior/max(h,1),.62,100.)]
            if not complete:
                box_anchor[1] = y+.73*h
                if propagated is not None and .48 < propagated[1][2]/box_anchor[2] < 2.05:
                    box_anchor[2] = .42*box_anchor[2]+.58*propagated[1][2]
        axis = None
        if pose is not None:
            box,anchor,axis,_ = pose
            if propagated is not None:
                prior = propagated[1]
                if np.linalg.norm(prior[:2]-anchor[:2])<.15*max(gray.shape) and .62<prior[2]/anchor[2]<1.6:
                    anchor = .76*anchor+.24*prior
            if detected is not None:
                ratio = anchor[2]*detected[1]/k[1,1]
                if .33<ratio<1.8:
                    self.radius_scale = ratio if self.radius_scale is None else .75*self.radius_scale+.25*ratio
            if box_measurement is not None:
                close = np.linalg.norm(anchor[:2]-box_anchor[:2]) < .18*max(gray.shape)
                if close:
                    weight = .65 if complete else .27
                    anchor = (1-weight)*anchor+weight*box_anchor
                else:
                    anchor,axis = box_anchor,None
                box = box_measurement
            method = "pose"
        elif box_measurement is not None:
            box,anchor = box_measurement,box_anchor
            method = "detector"
        elif detected is not None:
            center,radius,_ = detected
            reference = propagated[1] if propagated is not None else self.anchor
            if reference is None or np.linalg.norm(center-reference[:2])<max(35,radius*.62):
                prior = self.radius_scale or .48*height
                depth = np.clip(k[1,1]*prior/radius,.62,100.)
                box = np.array([center[0]-.39*radius,center[1]-.85*radius,.78*radius,1.74*radius])
                anchor = np.r_[center,depth]
                if propagated is not None:
                    box = .55*box+.45*propagated[0]
                    anchor = .54*anchor+.46*propagated[1]
                method = "detector"
            else:
                method = None
        else:
            method = None
        if method in ("pose","detector"):
            self.last_supported = index
        elif propagated is not None and index-self.last_supported<.82*self.fps:
            box,anchor = propagated[:2]
            method = "flow"
        else:
            candidate = self.moving_region(gray,bg_motion,k,height)
            if candidate is not None:
                box,anchor = candidate
                if propagated is not None and np.linalg.norm(anchor[:2]-propagated[1][:2])<.14*max(gray.shape):
                    box = .25*box+.75*propagated[0]
                    anchor = .33*anchor+.67*propagated[1]
                method = "motion"
                self.last_supported = index-round(.45*self.fps)
            elif propagated is not None:
                box,anchor = propagated[:2]
                method = "weak-flow"
            else:
                box,anchor = self.box,self.anchor
                method = "carry"
        self.gray,self.box,self.anchor = gray,box,anchor
        return box,anchor,axis,method


def refine_backwards(frames, greys, size, fps):
    """Fill weak forward observations from a nearby independently measured subject."""
    shape = np.array([*size,*size])
    forward = np.full(len(frames),np.inf)
    last = -10000
    for i,f in enumerate(frames):
        if i and f["shot"]!=frames[i-1]["shot"]:
            last = -10000
        if f["subject"]["method"] in ("pose","detector"):
            last = i
        forward[i] = i-last
    anchor, box, previous, seed = None,None,None,len(frames)+10000
    for i in range(len(frames)-1,-1,-1):
        f = frames[i]
        subject = f["subject"]
        if i+1<len(frames) and f["shot"]!=frames[i+1]["shot"]:
            anchor,box,previous = None,None,None
        if subject["method"] in ("pose","detector"):
            box = np.array(subject["box"])*shape
            anchor = np.r_[np.array(subject["anchor"])*size,subject["depth_m"]]
            seed = i
        elif anchor is not None and seed-i < 1.65*fps:
            moved = propagate(previous,greys[i],box,anchor)
            if moved is not None:
                box,anchor = moved[:2]
                center = np.array(subject["anchor"])*size
                distance = np.linalg.norm((anchor[:2]-center)/size)
                use = (subject["method"] in ("carry","weak-flow","motion") or
                       forward[i]>max(.53*fps,1.4*(seed-i)))
                trusted = frames[seed]["subject"]["method"]=="pose" or distance<.115
                if use and trusted and (distance<.39 or forward[i]>1.3*fps):
                    factor = .85 if subject["method"] in ("carry","weak-flow") else .64
                    subject["anchor"] = ((factor*anchor[:2]+(1-factor)*center)/size).tolist()
                    subject["depth_m"] = float(np.exp(factor*np.log(anchor[2])+
                                                       (1-factor)*np.log(subject["depth_m"])))
                    subject["box"] = (.64*box/shape+.36*np.array(subject["box"])).tolist()
                    subject["method"] = "backward-flow"
                    subject["observed"] = True
            else:
                anchor,box = None,None
        previous = greys[i]
