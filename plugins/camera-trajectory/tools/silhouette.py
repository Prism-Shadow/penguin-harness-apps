"""Project a human height prior using visible ends of a silhouette."""

import cv2
import numpy as np

from foreground import subject_mask


def size_and_center(a, b, metric, up, k, fraction):
    invf = 1/k.diagonal()[:2]
    top = (a-k[:2,2])*invf
    bottom = (b-k[:2,2])*invf
    separation = bottom[1]-top[1]
    if separation < .008:
        return None
    depth_bottom = metric*(up[2]*top[1]-up[1])/separation
    point = depth_bottom*np.r_[bottom,1.] + fraction*metric*up
    if point[2]<.4 or not np.isfinite(point).all():
        return None
    return np.r_[point[:2]/point[2]/invf+k[:2,2],point[2]]


def silhouette_anchor(image, box, k, orientation, height):
    x,y,w,h = box
    center = x+w*.5
    up = orientation[2,:]
    ih,iw = image.shape[:2]
    left = max(0,round(center-min(.49*w,.085*iw)))
    right = min(iw,round(center+min(.49*w,.085*iw)))
    top = max(0,round(y)-2)
    bottom = min(ih,round(y+.67*h))
    if bottom-top<18 or right-left<8:
        return None
    mask = subject_mask(image[top:bottom,left:right])>0
    rows = cv2.GaussianBlur(mask.sum(axis=1).astype(np.float32),(1,5),1.2).ravel()
    occupied = np.flatnonzero(rows >= max(3,.065*(right-left)))
    if len(occupied)<12:
        return None
    start = occupied[0]
    n = len(rows)
    # A head widens above a narrow neck before the silhouette widens at the shoulders.
    stops = np.arange(start+max(8,round(.09*h)),min(n-6,start+round(.46*h)))
    head = None
    if len(stops):
        prefix = np.maximum.accumulate(rows)
        suffix = np.maximum.accumulate(rows[::-1])[::-1]
        peak = prefix[stops-3]
        tests = (rows[stops] < .85*peak) & (suffix[stops+4] > 1.26*peak)
        merits = rows[stops]/np.maximum(peak,1) + .35*np.abs((stops-start)/h-.18)
        if tests.any():
            end = stops[np.argmin(np.where(tests,merits,np.inf))]
            coord = np.where(mask[start:end])
            if len(coord[1]):
                hx = float(np.median(coord[1])+left)
                head = size_and_center(np.array([hx,top+start]),
                                       np.array([hx,top+end]), .151*height, up,k,-1.91)
    body = size_and_center(np.array([center,top+start]),
                           np.array([center,y+h]),height,up,k,.54)
    if body is None:
        return head
    if head is not None and np.allclose(head[2],body[2],rtol=.38):
        weight = .86 if y+h>=ih-3 else .25
        return (1-weight)*body+weight*head
    if y+h>=ih-3 and head is not None and .34*body[2]<head[2]<1.05*body[2]:
        return head
    if y+h>=ih-3:
        # A cropped measurement is an upper bound; shorten the effective height.
        visible = np.clip((ih-top)/max(.44*ih, 1), .55, 1.4)
        depth = body[2] * np.clip(.52+.24*visible,.63,.87)
        return np.array([center,top+(y+h-top)*.57,depth])
    return body
