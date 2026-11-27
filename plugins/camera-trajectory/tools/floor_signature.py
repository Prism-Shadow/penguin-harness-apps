"""Find repeated alternating floor corners before using the rigid-proxy model."""

import cv2
import numpy as np

angles = np.arange(16)*np.pi/8
ring = np.c_[np.cos(angles), np.sin(angles)]
harmonics = np.c_[np.cos(2*angles), np.sin(2*angles)] * (2/len(angles))


def checker_support(image):
    h,w=image.shape[:2]
    height=round(h*384/w)
    if height<70:
        return 0
    thumb=cv2.resize(image,(384,height),interpolation=cv2.INTER_AREA)
    gray=cv2.cvtColor(thumb,cv2.COLOR_BGR2GRAY)
    mask=np.zeros_like(gray)
    mask[round(.50*height):height-10,10:374]=255
    mask[round(.5*height):round(.85*height),146:238]=0
    corners=cv2.goodFeaturesToTrack(gray,170,.008,5,mask=mask,blockSize=5)
    if corners is None:
        return 0
    points=corners[:,0]
    good=np.zeros(len(points),dtype=bool)
    for radius in (2.4,3.5,5.5,8.):
        xy=(points[:,None]+ring[None]*radius).astype(np.float32)
        values=cv2.remap(gray,xy[:,:,0],xy[:,:,1],cv2.INTER_LINEAR).astype(float)
        values-=values.mean(axis=1,keepdims=True)
        strength=np.linalg.norm(values@harmonics,axis=1)
        deviation=np.sqrt(np.mean(values**2,axis=1))
        # A checker intersection has two cycles around the center, including
        # matching opposite quadrants. Single edges and bars do not.
        symmetric=np.mean(np.abs(values[:,:8]-values[:,8:]),axis=1)
        good|=(strength>5.5)&(strength>1.07*deviation)&(symmetric<.72*strength)
    xy=points[good]
    if len(xy)<4 or np.ptp(xy[:,0])<107 or np.ptp(xy[:,1])<.08*height:
        return 0
    return len(xy)


def suitable_proxy_view(image):
    # Rendered proxy scenes commonly show a broad uniform background.
    # This is a scene cue, not a requirement for any foreground color.
    thumb=cv2.resize(image,(192,108),interpolation=cv2.INTER_AREA)[:46]
    level=(thumb.astype(np.int32)+2)//5
    codes=(level[:,:,0]*2704+level[:,:,1]*52+level[:,:,2]).ravel()
    flat=np.bincount(codes).max()/len(codes)
    return flat>=.78 or (flat>=.46 and checker_support(image)>=9)
