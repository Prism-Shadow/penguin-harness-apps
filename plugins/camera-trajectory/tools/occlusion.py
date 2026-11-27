"""Fuse grayscale body support with metric innovation and background geometry."""

import cv2
import numpy as np

from subject_pose import forward, sigmoid
from temporal import median_window


def presence_score(network, patch):
    grayscale=np.stack([cv2.cvtColor(np.ascontiguousarray(patch[i:i+3].transpose(1,2,0)),
                                     cv2.COLOR_BGR2GRAY) for i in (0,3)])
    return float(sigmoid(forward(network,grayscale[None].astype(np.float32)/255-.5)[0].item()))


def visibility_state(body, shape, log_depth, landmarks, frames, fps):
    # A low body likelihood can be trusted when it persists; one-frame weak
    # measurements preserve the previous state unless the metric prediction
    # also contradicts the nearby poses while background flow stays coherent.
    samples=np.c_[log_depth,landmarks[:,0]]
    center=median_window(samples,max(2,round(.16*fps)))
    deviation=np.linalg.norm((samples-center)/[.12,.06,.09],axis=1)
    confidence=body*.86+shape*.14
    matches=np.array([f["background"]["inliers"] for f in frames])
    errors=[f["background"]["error_px_working"] for f in frames]
    residual=np.array([2. if error is None else error for error in errors])
    geometry=np.clip((matches-20)/62,0.,1.)*np.exp(-.7*residual)
    confidence-=.17*geometry*np.clip(deviation,0,1)*(1-body)
    sustained=median_window(confidence[:,None],1).ravel()
    # Shape confidence never vetoes a bright or gray foreground by itself.
    # A near-certain loss is allowed immediately for a single-frame cover.
    # Otherwise the median avoids flicker during a weak, but visible, pose.
    combined=np.where(body<.001,np.minimum(confidence,sustained),sustained)
    return combined>.45,combined
