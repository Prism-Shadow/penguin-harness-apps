"""Calibrated person crops used by offline training and CPU inference."""

import cv2
import numpy as np

PATCH_SIZE = 96
REFERENCE_HEIGHT = 1.65
# Left and right are anatomical labels on the pelvis model.
JOINTS = np.array([
    [0,0,0], [.103,0,-.035], [-.103,0,-.035],
    [.174,0,.39], [-.174,0,.39], [0,0,.625], [0,-.09,.625],
    [0,0,.245], [0,0,.757], [.118,-.041,-.835], [-.118,-.041,-.835],
    [.118,-.165,-.835], [-.118,-.165,-.835],
], dtype=float)
MIRROR = np.array([0,2,1,4,3,5,6,7,8,10,9,12,11])


def pose_patch(image, k):
    crops = []
    for width, offset_y in ((.77,.14),(.425,.01)):
        step = PATCH_SIZE / width
        ax,ay = step / k[0,0], step / k[1,1]
        transform = np.array([[ax,0.,PATCH_SIZE*.5 - ax*k[0,2]],
                              [0.,ay,PATCH_SIZE*.5 - ay*k[1,2] - offset_y*step]])
        crops.append(cv2.warpAffine(image,transform,(PATCH_SIZE,PATCH_SIZE),
                                    flags=cv2.INTER_LINEAR,borderMode=cv2.BORDER_REPLICATE))
    return np.concatenate(crops,axis=2).transpose(2,0,1)
