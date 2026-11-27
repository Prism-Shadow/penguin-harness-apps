"""Associate sparse body observations with the foreground part of a shared LK pass."""

import cv2
import numpy as np

from subject_pose import SubjectPose


def foreground_features(gray, box):
    if box is None:
        return np.empty((0, 2), np.float32)
    x, y, w, h = box
    lo = np.maximum(0, np.floor([x + .16*w, y + .10*h])).astype(int)
    hi = np.minimum(gray.shape[::-1], np.ceil([x + .84*w, y + .78*h])).astype(int)
    if np.any(hi - lo < 9):
        return np.empty((0, 2), np.float32)
    roi = gray[lo[1]:hi[1], lo[0]:hi[0]]
    points = cv2.goodFeaturesToTrack(roi, 29, .012, 4, blockSize=5)
    if points is None:
        return np.empty((0, 2), np.float32)
    return (points.reshape(-1, 2) + lo).astype(np.float32)


def propagate(previous, current, box, anchor, shape):
    if len(previous) < 6 or box is None:
        return None
    affine, inliers = cv2.estimateAffinePartial2D(
        previous, current, method=cv2.RANSAC, ransacReprojThreshold=1.8,
        maxIters=24, confidence=.92, refineIters=2,
    )
    if affine is None or inliers.sum() < max(5, .55*len(previous)):
        return None
    factor = np.linalg.norm(affine[0, :2])
    h, w = shape
    pixel = affine[:, :2] @ anchor[:2] + affine[:, 2]
    delta = pixel - anchor[:2]
    if not (.80 < factor < 1.25 and np.linalg.norm(delta) < .19*max(shape)):
        return None
    if not (-.25*w < pixel[0] < 1.25*w and -.3*h < pixel[1] < 2.2*h):
        return None
    box = np.r_[box[:2]+delta-(factor-1)*box[2:]*.5, box[2:]*factor]
    # Scale inferred from LK can drift when the ROI admits background. Reduce
    # its weight when the inliers do not cover both torso axes.
    support = previous[inliers.ravel()>0]
    coverage = np.ptp(support,axis=0) / np.maximum(1.,box[2:])
    scale_quality = min(1., float(np.min(coverage/[.43,.35])))
    return box, np.r_[pixel, anchor[2]/factor**scale_quality], delta, float(factor)


def motion_region(previous, gray, before, after, anchor):
    if len(before)<22:
        return None
    affine,inliers=cv2.estimateAffinePartial2D(before,after,cv2.RANSAC,
        ransacReprojThreshold=1.9,maxIters=26,confidence=.90,refineIters=1)
    if affine is None or inliers.sum() < .62*len(before):
        return None
    h,w = gray.shape
    size=(w//2,h//2)
    affine[:,2]*=.5
    warped=cv2.warpAffine(cv2.resize(previous,size,interpolation=cv2.INTER_AREA),
                         affine,size,borderMode=cv2.BORDER_REPLICATE)
    diff=cv2.absdiff(cv2.resize(gray,size,interpolation=cv2.INTER_AREA),warped)
    blur=cv2.GaussianBlur(diff,(5,5),0)
    cutoff=max(12.,float(np.mean(blur)+1.7*np.std(blur)))
    region=(blur>cutoff).astype(np.uint8)
    region[:size[1]//8]=0
    margin=size[0]//6
    region[:,:margin]=0
    region[:,-margin:]=0
    region=cv2.morphologyEx(region,cv2.MORPH_CLOSE,np.ones((5,5),np.uint8))
    _,_,stats,_=cv2.connectedComponentsWithStats(region)
    x,y,bw,bh,area=stats[1:].T*2
    centers=np.c_[x+.5*bw,y+.5*bh]
    reference=np.array([.5*w,.57*h]) if anchor is None else anchor[:2]
    distance=np.linalg.norm((centers-reference)/[w,h],axis=1)
    valid=(area>=46)&(bh>.09*h)&(bh<.70*h)&(bw<min(.33*w,.42*h))&(bw<1.2*bh)&(distance<.32)
    if not valid.any():
        return None
    best=np.argmax(np.where(valid,np.log(np.maximum(1,area))-9*distance,-np.inf))
    return np.array([x[best],y[best],bw[best],bh[best]],float),centers[best]


class MovieSubject:
    def __init__(self, fps, detection_period=.91, pose_period=.36):
        self.model = SubjectPose(fps)
        self.detection_stride = max(9, round(detection_period*fps))
        self.pose_stride = max(4, round(pose_period*fps))
        self.reset()

    def reset(self):
        self.box = self.anchor = self.roi = None
        self.last_scan = self.last_pose = -10000
        self.inferred_confidence = 0.
        self.upper_scale = None
        self.extension = None

    def estimate_pose(self, image, k, height, index):
        evidence = self.model.landmarks(image, self.roi)
        if evidence is None:
            return None
        points, conf, _ = evidence
        h, w = image.shape[:2]
        hips = points[23:25].mean(axis=0)
        upper = points[11:13].mean(axis=0)
        head = np.average(points[[0, 7, 8]], axis=0, weights=np.maximum(.05, conf[[0, 7, 8]]))
        direction = upper - head
        span = np.linalg.norm(direction)
        quality = min(float(conf[11:13].mean()), float(conf[[0, 7, 8]].mean()))
        hips_visible = (min(conf[23:25]) > .43 and -.03*h < hips[1] < .96*h
                        and -.05*w < hips[0] < 1.05*w)
        full = self.model.measure(evidence, k, height, index, (h, w)) if hips_visible else None
        if full is not None:
            box, anchor, lateral, confidence = full
            if quality > .48 and span >= 3:
                scale = span*anchor[2]/k[1, 1]
                ratio = np.dot(anchor[:2]-upper, direction)/span**2
                if .047*height < scale < .30*height and .8 < ratio < 4.4:
                    self.upper_scale = scale if self.upper_scale is None else .78*self.upper_scale + .22*scale
                    self.extension = ratio if self.extension is None else .78*self.extension + .22*ratio
            self.roi = self.model.roi
            return box, anchor, lateral, confidence
        if quality < .42 or span < 4 or direction[1] < .3*span:
            return None
        ratio = self.extension if self.extension is not None else 2.12
        length = self.upper_scale if self.upper_scale is not None else .13*height
        pixel = upper + ratio*direction
        depth = k[1, 1]*length/span
        radius = max(span*(ratio + 1.6), np.linalg.norm(points[11]-points[12])*1.45)
        width = max(2.7*span, np.linalg.norm(points[11]-points[12])*1.28)
        box = np.r_[head[0]-.5*width, head[1]-.68*span, width, 1.72*radius]
        self.roi = pixel, radius, upper-pixel
        return box, np.r_[pixel, depth], None, .78*quality

    def update(self, image, gray, k, height, index, previous, current, background=None):
        predicted = propagate(previous, current, self.box, self.anchor, gray.shape)
        if predicted is not None:
            self.box, self.anchor, delta, factor = predicted
            if self.roi is not None:
                center, radius, upper = self.roi
                self.roi = center+delta, radius*factor, upper*factor
        self.inferred_confidence *= .95 if predicted is not None else .79
        detection = None
        if index-self.last_scan >= self.detection_stride:
            self.last_scan = index
            self.model.roi = self.roi
            detection = self.model.detect(image)
            if detection is not None:
                self.roi = detection
        pose = None
        if (self.roi is not None and index-self.last_pose >= self.pose_stride
                and (detection is None or self.anchor is None or self.inferred_confidence < .23)):
            self.last_pose = index
            pose = self.estimate_pose(image, k, height, index)
        lateral = None
        if pose is not None:
            box, anchor, lateral, confidence = pose
            if predicted is not None and self.inferred_confidence >= .23:
                prior = self.anchor
                distance = np.linalg.norm((anchor[:2]-prior[:2])/gray.shape[::-1])
                support = self.inferred_confidence*np.exp(-.5*(distance/.14)**2)
                if lateral is None:
                    # Metric depth from the old torso scale remains useful during crop transitions.
                    delta = np.log(max(.1, anchor[2])/prior[2])
                    anchor[2] = prior[2]*np.exp(delta*(1-.64*support))
                anchor[:2] = (1-.24*support)*anchor[:2]+.24*support*prior[:2]
            self.box, self.anchor = box, anchor
            self.inferred_confidence = min(1., max(self.inferred_confidence, confidence))
            method = "upper-body" if lateral is None else "pose"
        elif detection is not None:
            center, radius, _ = detection
            depth = k[1, 1]*.48*height/max(1., radius)
            box = np.array([center[0]-.39*radius, center[1]-.85*radius, .78*radius, 1.74*radius])
            if self.anchor is None or self.inferred_confidence < .24:
                self.box, self.anchor = box, np.r_[center, depth]
            elif predicted is not None and np.linalg.norm(center-self.anchor[:2]) < .20*max(gray.shape):
                self.box = .76*self.box+.24*box
                self.anchor[:2] = .81*self.anchor[:2]+.19*center
            self.inferred_confidence = max(.54, self.inferred_confidence)
            method = "detector"
        elif background is not None and self.inferred_confidence < .32 and index % 3 == 0:
            observation=motion_region(background[0],gray,*background[1:],self.anchor)
            if observation is not None:
                region,center=observation
                if self.anchor is None or self.inferred_confidence < .13:
                    depth=k[1,1]*height/max(1.,1.40*region[3])
                    if self.anchor is not None:
                        depth=.62*self.anchor[2]+.38*depth
                    self.anchor=np.r_[center,depth]
                    self.box=region
                else:
                    self.anchor[:2]=.66*self.anchor[:2]+.34*center
                    self.box=.65*self.box+.35*region
                if self.roi is None:
                    self.roi=(self.anchor[:2],max(.8*region[3],.69*region[2]),np.array([0.,-1.]))
                self.inferred_confidence=max(.37,self.inferred_confidence)
                method="motion"
            else:
                method="weak-flow" if predicted is not None else "carry"
        elif predicted is not None:
            method = "flow" if self.inferred_confidence >= .16 else "weak-flow"
        else:
            method = "carry"
        if self.anchor is not None:
            self.anchor[2] = np.clip(self.anchor[2], .55, 120.)
        return self.box, self.anchor, lateral, method
