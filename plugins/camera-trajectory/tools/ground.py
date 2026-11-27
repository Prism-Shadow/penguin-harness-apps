"""Planar background rotation and scale constraints."""

import cv2
import numpy as np


def rotation(vector):
    return cv2.Rodrigues(np.asarray(vector,dtype=np.float64))[0]


def ground_step(a, b, k, orientation, h, motion=False):
    # Use points with a plausible intersection below the camera.
    ground = (a[:,1]>.46*h) & (b[:,1]>.46*h)
    if ground.sum()<22:
        return None
    a,b = a[ground],b[ground]
    homography, mask = cv2.findHomography(a,b,cv2.RANSAC,1.,maxIters=65,confidence=.99)
    if homography is None:
        return None
    use = mask.ravel()>0
    if use.sum()<max(20,.66*len(a)) or np.ptp(a[use,0])<.68*k[0,2] or np.ptp(a[use,1])<.1*h:
        return None
    shift = np.linalg.norm(a[use]-b[use],axis=1)
    g = np.linalg.solve(k,homography@k)
    if not np.isfinite(g).all() or np.linalg.norm(g-np.eye(3))>.55 or np.linalg.det(g)<.5:
        return None
    normal = -orientation[2,:]
    normal /= np.linalg.norm(normal)
    correction = np.eye(3)
    if np.median(shift)>.5:
        _, attitudes, _, directions = cv2.decomposeHomographyMat(homography,k)
        choices = [(r,n.ravel()) for r,n in zip(attitudes,directions)
                   if np.trace(r)>2.988 and n[1,0]>.7 and abs(n[0,0])<.25
                   and .98<np.linalg.norm(n)<1.02]
        if choices:
            rough, candidate = max(choices,key=lambda x: ((x[1]@normal)+.17*np.trace(x[0])))
            if candidate @ normal > .94:
                normal = normal*.72 + candidate*.28
                normal /= np.linalg.norm(normal)
                axis = np.cross(orientation@candidate,[0.,0.,-1.])
                correction = rotation(.08*axis)
    u = np.cross(normal,[0.,0.,1.])
    u /= np.linalg.norm(u)
    v = np.cross(normal,u)
    ux,vx = g @ u, g @ v
    scale = .5*(np.linalg.norm(ux)+np.linalg.norm(vx))
    if np.linalg.norm(ux)<.25:
        return None
    ux /= np.linalg.norm(ux)
    vx -= (ux@vx)*ux
    if np.linalg.norm(vx)<.25:
        return None
    vx /= np.linalg.norm(vx)
    relative = np.column_stack((ux,vx,np.cross(ux,vx))) @ np.vstack((u,v,normal))
    if not np.isfinite(relative).all() or np.trace(relative)<2.982 or np.linalg.norm(relative@relative.T-np.eye(3))>1e-5:
        return None
    projected = cv2.perspectiveTransform(a[use,None,:],homography)[:,0,:]
    error = np.linalg.norm(projected-b[use],axis=1)
    attitude = correction @ orientation @ relative.T
    measurement = ("ground",float(np.median(error)),int(use.sum()))
    if motion:
        translation = g @ normal / scale - relative @ normal
        metric = -orientation @ relative.T @ translation
        return attitude, measurement, metric
    return attitude, measurement


def vanishing_axes(gray, mask, k, reference, detector):
    # Estimate two orthogonal directions from line segments below the optical center.
    offset = round(.43*gray.shape[0])
    found = detector.detect(gray[offset:])[0]
    if found is None:
        return None
    lines = found[:,0,:].reshape(-1,2,2)
    lines[:,:,1] += offset
    length = np.linalg.norm(lines[:,1]-lines[:,0],axis=1)
    pixels = np.clip(np.rint(lines).astype(int),[0,0],[gray.shape[1]-1,gray.shape[0]-1])
    valid = (length>=8) & (mask[pixels[:,:,1],pixels[:,:,0]].min(axis=1)>0)
    if valid.sum()<22:
        return None
    indices = np.flatnonzero(valid)
    indices = indices[np.argsort(length[indices])[-75:]]
    xy = (lines[indices]-k[:2,2])/k.diagonal()[:2]
    rays = np.concatenate((xy,np.ones_like(xy[:,:,:1])),axis=2)
    planes = np.cross(rays[:,0],rays[:,1])
    planes /= np.maximum(1e-8,np.linalg.norm(planes,axis=1)[:,None])
    i,j = np.triu_indices(len(planes),1)
    candidates = np.cross(planes[i],planes[j])
    norms = np.linalg.norm(candidates,axis=1)
    candidates = candidates[norms>.025]/norms[norms>.025,None]
    if len(candidates)<15:
        return None
    residual = np.abs(candidates@planes.T)
    weights = np.sqrt(np.minimum(length[indices],55))
    support = (residual<.014) * weights
    strengths = support.sum(axis=1)
    ranked = np.argsort(strengths)[::-1]
    distinct = []
    for idx in ranked:
        if len(distinct)==21 or strengths[idx]<22:
            break
        if not distinct or np.max(np.abs(candidates[distinct]@candidates[idx]))<.988:
            distinct.append(idx)
    if len(distinct)<2:
        return None
    d = candidates[distinct]
    weight = strengths[distinct]
    ni,nj = np.triu_indices(len(d),1)
    error = np.abs(np.sum(d[ni]*d[nj],axis=1))
    normals = np.cross(d[ni],d[nj])
    norms = np.linalg.norm(normals,axis=1)
    normals /= np.maximum(norms[:,None],1e-8)
    vertical = normals@reference[2]
    total = (weight[ni]+weight[nj])*(.5+.5*np.abs(vertical)) - 85*error
    good = (error<.085) & (np.abs(vertical)>.84) & (np.abs(normals[:,0])<.15)
    if not good.any():
        return None
    best = np.argmax(np.where(good,total,-np.inf))
    axes = []
    for ix in (ni[best],nj[best]):
        chosen = distinct[ix]
        take = residual[chosen]<.014
        if take.sum()<6 or np.ptp(lines[indices[take],:,0])<.21*gray.shape[1]:
            return None
        a = planes[take]*weights[take,None]
        _,_,vt = np.linalg.svd(a,full_matrices=False)
        axes.append(vt[-1])
    a,b = axes
    up = np.cross(a,b)
    up /= max(np.linalg.norm(up),1e-8)
    if up@reference[2]<0:
        up = -up
    if up@reference[2]<.89 or abs(up[0])>.13:
        return None
    x = max((a,-a,b,-b),key=lambda axis:axis@reference[0])
    x = np.cross(np.cross(up,x),up)
    x /= np.linalg.norm(x)
    return np.stack((x,np.cross(up,x),up))
