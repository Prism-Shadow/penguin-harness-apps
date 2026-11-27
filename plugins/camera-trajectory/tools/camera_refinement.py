"""Constrain local camera translations and unsupported orbital heading changes."""

import numpy as np

from temporal import gaussian, median_window


def plane_observations(frames):
    raw=[f["background"] for f in frames]
    steps=np.asarray([b.get("plane_translation_over_height") or [0.,0.,0.] for b in raw])
    counts=np.asarray([b["inliers"] for b in raw])
    errors=np.asarray([b["error_px_working"] if b["error_px_working"] is not None else 4. for b in raw])
    ground=np.asarray([b.get("plane_translation_over_height") is not None for b in raw])
    return steps,counts,errors,ground


def heading(points):
    return np.unwrap(np.arctan2(points[:,0],-points[:,1]))


def rapid_orbit(yaw, fps):
    # Require both a substantial arc and a fast interval, not a slow pan.
    speed=np.abs(np.diff(yaw))*fps
    return np.ptp(yaw)>1.75 and np.count_nonzero(speed>1.9)>=max(3,round(fps*.13))


def orbit_heading(yaw, geometry, observations, fps):
    """Replace unsupported endpoint turns with the low-speed background motion."""
    steps, counts, errors, ground=observations
    background_yaw=heading(geometry[:,:,2])
    visual=np.diff(background_yaw,prepend=background_yaw[0])
    measured=np.diff(yaw,prepend=yaw[0])
    quiet=ground & (counts>=35) & (errors<.65) & (np.linalg.norm(steps,axis=1)*fps<.65)
    quiet &= np.abs(visual)*fps<.72
    innovation=measured-visual
    suspect=quiet & (np.abs(innovation)*fps>1.8)
    # On an orbit endpoint a genuine large turn should also move background
    # geometry. Isolated body observations remain admissible.
    tail=np.flatnonzero(~quiet)
    start=tail[-1]+1 if len(tail) else 1
    flags=np.flatnonzero(suspect[start:])
    if len(flags)<2 or flags[-1]<len(yaw)-start-3:
        return yaw
    first=start+flags[0]
    if not np.any(suspect[first:-1]&suspect[first+1:]):
        return yaw
    while first>start and abs(innovation[first-1])*fps>.95 and innovation[first-1]*innovation[first]>0:
        first-=1
    result=yaw.copy()
    result[first:]=yaw[first-1]+np.cumsum(visual[first:])
    return result


def refine_camera_translation(positions, attitude, geometry, target, observed, observations, size, fps):
    """Use floor transport as a local motion measurement with a position prior."""
    steps,counts,errors,ground=observations
    usable=ground & (counts>=24) & (errors<.65)
    deformation=np.linalg.norm(target-np.median(target,axis=0),axis=1)
    radial=np.ptp(heading(positions))<.48 and np.ptp(np.linalg.norm(positions,axis=1))>1.2*size
    # Cropped dolly shots and partly hidden bodies already use the existing
    # scale tracker; floor motion does not improve their absolute anchors.
    if (usable.mean()<.56 or observed.mean()<.97 or radial
            or np.percentile(deformation,80)<.095*size):
        return positions,False

    # Express the previously estimated planar displacement in sensor axes,
    # then transport it into the calibrated frame at the same time.
    sensor_step=np.einsum("nij,ni->nj",geometry[:-1],steps[1:])
    height=np.maximum(.18*size,positions[:-1,2]+.89*size)
    world=np.einsum("nij,nj->ni",attitude[:-1],sensor_step)*height[:,None]
    usable=usable[1:] & (np.linalg.norm(world,axis=1)*fps<8.5*size)
    trust=usable*np.clip((counts[1:]-15)/50,.2,1.)
    residual=(world-np.diff(positions,axis=0))*trust[:,None]
    residual*=np.minimum(1.,.20*size/np.maximum(1e-6,np.linalg.norm(residual,axis=1)))[:,None]
    accumulated=np.vstack(([0.,0.,0.],np.cumsum(residual,axis=0)))
    # Windowed metric observations retain the translation datum and bound
    # accumulation of any pelvis rotation or plane-scale error.
    correction=accumulated-gaussian(accumulated,max(1.,fps*1.0))
    return positions+.65*correction,True
