"""Measure gravity and camera-height changes from a visible static floor."""

import cv2
import numpy as np


def floor_normal(gray, mask, k, pitch, detector):
    """Vote for a horizontal horizon using two orthogonal line families."""
    h,w = gray.shape
    offset = round(.40*h)
    lines = detector.detect(gray[offset:])[0]
    if lines is None:
        return None
    lines = lines[:,0].reshape(-1,2,2)
    lines[:,:,1] += offset
    distance = np.linalg.norm(lines[:,1]-lines[:,0],axis=1)
    p = np.rint(lines).astype(int).clip([0,0],[w-1,h-1])
    keep = (mask[p[:,:,1],p[:,:,0]].min(axis=1)>0)&(distance>=7)
    chosen = np.flatnonzero(keep)
    if len(chosen)<14:
        return None
    chosen = chosen[np.argsort(distance[chosen])[-105:]]
    xy = (lines[chosen]-k[:2,2])/k.diagonal()[:2]
    rays = np.concatenate((xy,np.ones((*xy.shape[:2],1))),axis=2)
    planes = np.cross(rays[:,0],rays[:,1])
    planes /= np.maximum(1e-8,np.linalg.norm(planes,axis=1)[:,None])
    a,b,c = planes.T
    # Each line intersects the proposed floor normal along a direction in the floor.
    window = np.arange(-24.,24.001,.65)*np.pi/180
    candidates = np.clip(pitch+window,-.57,1.08)
    tangent = np.sin(candidates[:,None])*b - np.cos(candidates[:,None])*c
    denom = tangent*tangent+a*a
    cone = (a[None,:]+1j*tangent)**4/np.maximum(denom*denom,.00008)
    weights = np.sqrt(np.minimum(distance[chosen],45.))
    support = (denom>.014)*weights
    mode = (cone*support).sum(axis=1)
    direction = np.angle(mode)*.25
    circular = np.abs(np.angle(cone*np.exp(-4j*direction[:,None])))*.25
    inlier = (circular<.083) & (denom>.014)
    first = (a[None,:]*np.cos(direction[:,None])+tangent*np.sin(direction[:,None]))**2 > .5*denom
    u = ((inlier & first)*weights).sum(axis=1)
    v = ((inlier & ~first)*weights).sum(axis=1)
    strength = (inlier*weights*np.maximum(0.,1-circular/.115)).sum(axis=1)
    weights_both = np.minimum(u,v)/np.maximum(1,u+v)
    merit = strength*(.42+.58*np.sqrt(2*weights_both))
    merit *= np.exp(-.5*(window/.42)**2)
    i = int(np.argmax(merit))
    if (min(u[i],v[i])<15 or inlier[i].sum()<12 or
            np.ptp(lines[chosen[inlier[i]],:,0])<.33*w or
            np.ptp(lines[chosen[inlier[i]],:,1])<.09*h):
        return None
    ratio = (u[i]+v[i])/weights.sum()
    if ratio<.38:
        return None
    confidence = min(1.,.35+1.25*(ratio-.38)+.20*weights_both[i])
    return float(candidates[i]), float(confidence), float(direction[i])


def ground_motion(before, after, old_mask, mask, k, pitch):
    """Estimate the signed plane-distance ratio using calibrated homography."""
    h,w = before.shape
    support = old_mask.copy()
    horizon = k[1,2]-k[1,1]*np.tan(pitch)
    support[:int(np.clip(max(.43*h,horizon+.035*h),0,h))] = 0
    features = cv2.goodFeaturesToTrack(before,140,.0035,6,mask=support,blockSize=5)
    if features is None or len(features)<18:
        return None
    options = dict(winSize=(19,19),maxLevel=3,
                   criteria=(cv2.TERM_CRITERIA_COUNT|cv2.TERM_CRITERIA_EPS,20,.025))
    other,status,_ = cv2.calcOpticalFlowPyrLK(before,after,features,None,**options)
    again,back_status,_ = cv2.calcOpticalFlowPyrLK(after,before,other,None,**options)
    a,b = features[:,0],other[:,0]
    good = ((status[:,0]>0)&(back_status[:,0]>0)&
            (np.linalg.norm(again[:,0]-a,axis=1)<.75)&
            (b[:,0]>=1)&(b[:,0]<w-2)&(b[:,1]>=1)&(b[:,1]<h-2))
    xy = np.rint(b[good]).astype(int)
    valid = mask[xy[:,1],xy[:,0]]>0
    a,b = a[good][valid],b[good][valid]
    if len(a)<18:
        return None
    matrix,inside = cv2.findHomography(a,b,cv2.RANSAC,1.05,maxIters=60,confidence=.985)
    if matrix is None:
        return None
    i = inside[:,0]>0
    if i.sum()<max(17,.65*len(a)) or np.ptp(a[i,0])<.37*w or np.ptp(a[i,1])<.09*h:
        return None
    g = np.linalg.solve(k,matrix@k)
    u = g[:,0]
    v = g @ [0.,-np.sin(pitch),np.cos(pitch)]
    lu,lv = np.linalg.norm(u),np.linalg.norm(v)
    if min(lu,lv)<.25 or abs(lu/lv-1)>.15 or abs(u@v)/(lu*lv)>.12:
        return None
    ratio = np.linalg.det(g/(.5*(lu+lv)))
    if not .68<ratio<1.47:
        return None
    right_next=u/lu
    next_forward=v-(right_next@v)*right_next
    next_forward/=np.linalg.norm(next_forward)
    normal_next=np.cross(right_next,next_forward)
    if normal_next[1]>-.43 or abs(normal_next[0])>.15:
        return None
    next_pitch=np.arctan2(-normal_next[2],-normal_next[1])
    horizontal=np.array([0.,-np.sin(next_pitch),np.cos(next_pitch)])
    yaw=np.arctan2(-(right_next@horizontal),right_next[0])
    if abs(yaw)>.65 or abs(next_pitch-pitch)>.26:
        return None
    return float(ratio),float(i.mean()),float(yaw)
