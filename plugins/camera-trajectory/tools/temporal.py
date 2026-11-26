"""Interpolate weak observations and smooth metric rays and unit quaternions."""

import numpy as np


def median_window(values, radius):
    padded = np.pad(values,((radius,radius),(0,0)),mode="edge")
    stack = np.lib.stride_tricks.sliding_window_view(padded,2*radius+1,axis=0)
    return np.median(stack,axis=-1)


def gaussian(values, sigma):
    radius = max(1,round(3*sigma))
    weights = np.exp(-.5*(np.arange(-radius,radius+1)/sigma)**2)
    weights /= weights.sum()
    padded = np.pad(values,((radius,radius),(0,0)),mode="edge")
    return np.column_stack([np.convolve(x,weights,mode="valid") for x in padded.T])


def stabilize(frames, k, size, fps, use_heading=False, movie=False):
    t = np.arange(len(frames))
    ray = np.array([f["subject"]["anchor"] for f in frames])
    depth = np.log([f["subject"]["depth_m"] for f in frames])
    samples = np.c_[ray,depth]
    observed = np.array([f["subject"]["observed"] for f in frames])
    radius = max(2,round(.23*fps))
    center = median_window(samples,radius)
    delta = np.abs(samples-center)
    mad = median_window(delta,radius)
    valid = observed & np.all(delta<np.maximum(4*mad,[.021,.042,.13]),axis=1)
    if valid.sum()<max(2,.4*observed.sum()):
        valid = observed
    if valid.any():
        samples = np.column_stack([np.interp(t,t[valid],x[valid]) for x in samples.T])
    if movie:
        depth = samples[:,2:3]
        stable_depth = median_window(depth,max(3,round(.65*fps)))
        depth[:] = stable_depth + np.clip(depth-stable_depth,-.18,.18)
    samples = gaussian(samples,max(1.,fps*.13))
    quats = np.array([f["quaternion"] for f in frames])
    quats = gaussian(quats,max(1.,fps*.088))
    quats /= np.linalg.norm(quats,axis=1)[:,None]
    if use_heading:
        heading = np.array([f["subject"]["heading_rad"] if f["subject"]["heading_rad"] is not None
                            else np.nan for f in frames])
        mask = np.isfinite(heading)
        if mask.sum()>=max(4,len(frames)*.055):
            yaw_samples = np.unwrap(heading[mask])
            robust = median_window(yaw_samples[:,None],2).ravel()
            good = np.abs(robust-yaw_samples)<.7
            if good.sum()>=4:
                yaw = np.interp(t,t[mask][good],yaw_samples[good])
                if movie:
                    reference = np.median(yaw[:max(1,len(yaw)//9)])
                    # Preserve background-led orbit when intermittently visible hips disagree.
                    step = np.diff(yaw,prepend=yaw[0])
                    yaw = reference + .55*(np.cumsum(np.clip(step,-1.65/fps,1.65/fps))+yaw[0]-reference)
                d = -gaussian(yaw[:,None],max(1.,fps*.25)).ravel()/2
                w,x,y,z = quats.T
                c,s = np.cos(d),np.sin(d)
                quats = np.column_stack((c*w-s*z,c*x-s*y,c*y+s*x,c*z+s*w))
    axes = np.c_[(samples[:,:2]*size-k[:2,2])/k.diagonal()[:2],np.ones(len(samples))]
    axes *= np.exp(samples[:,2,None])
    axes[:,1:] *= -1
    xyz = axes + 2*np.cross(quats[:,1:],np.cross(quats[:,1:],axes) + quats[:,:1]*axes)
    for i,f in enumerate(frames):
        f["position"] = (-xyz[i]).tolist()
        f["quaternion"] = quats[i].tolist()
        f["subject"]["anchor"] = samples[i,:2].tolist()
        f["subject"]["depth_m"] = float(np.exp(samples[i,2]))
