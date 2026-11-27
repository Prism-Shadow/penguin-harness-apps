"""Build camera orientation from position and a pelvis-relative aim point."""

import numpy as np

from temporal import gaussian


def fit_range(positions, vertical_ray, observed, height, fps):
    # For a camera at s * C aiming at (0,0,h), the pelvis has image y/fy
    # equal to h * hypot(C.x,C.y) / (s * dot(C,C) - h * C.z).
    horizontal = np.linalg.norm(positions[:, :2], axis=1)
    norm2 = np.sum(positions**2, axis=1)
    safe_ray = np.maximum(vertical_ray, .025)
    ratio = height * (horizontal / safe_ray + positions[:, 2]) / np.maximum(norm2, 1e-9)
    valid = observed & (vertical_ray > .025) & (ratio > .4) & (ratio < 2.5)
    if np.count_nonzero(valid) < max(3, .3 * len(positions)):
        return positions.copy()
    t = np.arange(len(positions))
    log_ratio = np.interp(t, t[valid], np.log(ratio[valid]))
    log_ratio = np.clip(log_ratio, np.log(.65), np.log(1.55))
    adjustment = gaussian(log_ratio[:, None], max(1., .22 * fps))
    return positions * np.exp(.55 * adjustment)


def camera_rotations(positions, prior, height, roll_weight=0.):
    return aim_rotations(positions, prior, np.array([0., 0., height]), roll_weight, .087)


def aim_rotations(positions, prior, targets, roll_weight=0., roll_limit=np.pi):
    """Return Blender camera-to-root rotations and an observability mask."""
    back = positions - targets
    right = np.column_stack((-back[:, 1], back[:, 0], np.zeros(len(positions))))
    right_norm = np.linalg.norm(right, axis=1)
    back_norm = np.linalg.norm(back, axis=1)
    usable = (right_norm > 1e-6) & (back_norm > 1e-6)
    right /= np.maximum(right_norm[:, None], 1e-6)
    back /= np.maximum(back_norm[:, None], 1e-6)
    up = np.cross(back, right)
    if roll_weight:
        old_right = prior[:, :, 0]
        angle = np.arctan2(np.sum(old_right * up, axis=1), np.sum(old_right * right, axis=1))
        c = np.cos(np.clip(roll_weight * angle, -roll_limit, roll_limit))[:, None]
        s = np.sin(np.clip(roll_weight * angle, -roll_limit, roll_limit))[:, None]
        right = c * right + s * up
        up = np.cross(back, right)
    matrices = np.stack((right, up, back), axis=2)
    matrices[~usable] = prior[~usable]
    return matrices, usable
