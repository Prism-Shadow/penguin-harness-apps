"""Color-independent silhouette and temporal evidence for candidate subjects."""

import cv2
import numpy as np

CLOSE = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 7))


def foreground_probability(image):
    # Compare against a spatial background estimate from the two border strips.
    values = image.astype(np.float32)
    h, w = values.shape[:2]
    strips = max(2, w//8)
    left = np.median(values[:, :strips], axis=1)
    right = np.median(values[:, -strips:], axis=1)
    mix = np.linspace(0, 1, w, dtype=np.float32)[None, :, None]
    background = left[:, None]*(1-mix) + right[:, None]*mix
    difference = values-background
    luma = np.abs(difference @ np.array([.114, .587, .299], np.float32))
    chroma = np.ptp(difference, axis=2)
    return np.clip((luma + .18*chroma - 6.) / 32., 0., 1.)


def subject_mask(image):
    probability = foreground_probability(image)
    mask = (probability >= .31).astype(np.uint8)
    return cv2.morphologyEx(mask, cv2.MORPH_CLOSE, CLOSE)


def foreground_box(image, allow_crop=False, previous_box=None):
    h, w = image.shape[:2]
    x0, x1 = int(.25*w), int(.75*w)
    y0 = int((.07 if allow_crop else .22)*h)
    mask = subject_mask(image[y0:, x0:x1])
    _, _, stats, _ = cv2.connectedComponentsWithStats(mask)
    x, y, bw, bh, area = stats[1:].T
    center = (x+bw*.5+x0)/w
    peak = (y+y0)/h
    density = area/np.maximum(1, bw*bh)
    valid = (area > 22) & (bh > .13*h) & (bh < .90*h) & (bw < .83*bh) & (bw > .055*bh)
    valid &= (peak < .66) & (bw < .31*w) & (density > .12)
    if not valid.any():
        return None
    interest = .5 if previous_box is None else (previous_box[0]+previous_box[2]*.5)/w
    scores = bh/h - 2.9*np.abs(center-interest) - 1.15*np.abs(peak-.35)
    scores += .22*np.minimum(1., density/.48)
    keep = np.argmax(np.where(valid, scores, -np.inf))
    return np.array([x[keep]+x0, y[keep]+y0, bw[keep], bh[keep]], dtype=float)


def torso_evidence(patch, landmarks, previous=None):
    # Measure support in a keypoint-defined torso and in paired side regions.
    # Absolute temporal differences cancel camera motion poorly, so compare the
    # torso change with its surrounding background and give it limited weight.
    bgr = patch[:3].transpose(1, 2, 0)
    h, w = bgr.shape[:2]
    points = (landmarks*np.array([w, h])/.77 + [w*.5, h*(.5-.14/.77)]).astype(int)
    pelvis, shoulders, neck = points[0], points[3:5], points[5]
    middle = shoulders.mean(axis=0)
    span = np.linalg.norm(middle-pelvis)
    if span < 3 or not (0 <= middle[0] < w and 1 <= middle[1] < h-1):
        return 0.
    center = .64*middle+.36*pelvis
    half = int(np.clip(max(.28*np.linalg.norm(shoulders[0]-shoulders[1]), .24*span), 2, w/7))
    lo = np.maximum(0, np.rint(center-[half*3, .41*span]).astype(int))
    hi = np.minimum([w,h], np.rint(center+[half*3, .41*span+1]).astype(int))
    if np.any(hi-lo < [8,4]):
        return 0.
    x0,y0 = lo
    x1,y1 = hi
    roi = bgr[y0:y1,x0:x1]
    probability = foreground_probability(roi)
    left = max(1, int(center[0])-half-x0)
    right = min(roi.shape[1]-1, int(center[0])+half-x0+1)
    if left >= right:
        return 0.
    base = float(probability[:,left:right].mean())
    surround = .5*(probability[:,:left].mean()+probability[:,right:].mean())
    support = .67*base + .33*max(0., base-surround)
    if previous is not None:
        old = previous[:3,y0:y1,x0:x1].transpose(1,2,0)
        motion = cv2.absdiff(roi, old).mean(axis=2)
        contrast = motion[:,left:right].mean()-.5*(motion[:,:left].mean()+motion[:,right:].mean())
        support += .11*np.clip(contrast/21., 0., 1.)
    # A plausible head and shoulder ordering downweights a vertical post.
    shape = np.clip((middle[1]-neck[1])/max(3, span)*3.2, .12, 1.)
    return float(np.clip(support*(.55+.45*shape), 0., 1.))
