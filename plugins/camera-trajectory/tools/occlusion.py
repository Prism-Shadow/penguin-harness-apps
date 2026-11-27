"""Fuse grayscale body support with metric innovation and background geometry."""

import cv2
import numpy as np

from subject_pose import forward, sigmoid
from temporal import median_window


def presence_score(network, patch):
    grayscale=np.stack([cv2.cvtColor(np.ascontiguousarray(patch[i:i+3].transpose(1,2,0)),
                                     cv2.COLOR_BGR2GRAY) for i in (0,3)])
    return float(sigmoid(forward(network,grayscale[None].astype(np.float32)/255-.5)[0].item()))


def visibility_state(body, shape, log_depth, landmarks, pose_disagreement, frames, fps):
    """Keep an unconfirmed foreground out of an occlusion gap."""
    samples=np.c_[log_depth,landmarks[:,0]]
    center=median_window(samples,max(2,round(.16*fps)))
    normalizer=np.array([.12,.06,.09])
    deviation=np.linalg.norm((samples-center)/normalizer,axis=1)
    confidence=.86*body+.14*shape
    matches=np.array([f["background"]["inliers"] for f in frames])
    errors=[f["background"]["error_px_working"] for f in frames]
    residual=np.array([2. if error is None else error for error in errors])
    geometry=np.clip((matches-20)/62,0.,1.)*np.exp(-.7*residual)
    confidence-=.17*geometry*np.clip(deviation,0,1)*(1-body)
    strength=median_window(confidence[:,None],1).ravel()
    strength=np.where(body<.001,np.minimum(confidence,strength),strength)

    background=(matches>=28)&(residual<.68)
    missing=(body<.26)|((pose_disagreement>.026)&(body<.78))
    depth_jump=np.abs(samples[:,0]-center[:,0])>.105
    votes=background.astype(np.uint8)+missing+depth_jump
    hidden=(body<.001)|((votes>=2)&missing&(strength<.64))
    positive=(strength>.45)&~hidden

    confirmed=np.zeros(len(body),dtype=bool)
    recovery=min(len(body),max(2,round(.20*fps)))
    run=0
    present=False
    for i,valid in enumerate(positive):
        if not valid:
            present=False
            run=0
        elif present:
            confirmed[i]=True
        else:
            run+=1
            if run>=recovery:
                # This is a batch estimator; retain the supported start of a
                # confirmed run without accepting shorter false appearances.
                confirmed[i-run+1:i+1]=True
                present=True
    return confirmed,strength,votes
