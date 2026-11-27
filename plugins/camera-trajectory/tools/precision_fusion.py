"""Confidence weighting, anatomical scale and global support-plane fusion."""

import numpy as np

from temporal import gaussian, median_window


def foreground_evidence(patch):
    # The calibrated character crops place upper-body features in the central band.
    # Use chroma support to detect large occluders over the torso and hips.
    _,h,w=patch.shape
    roi=patch[3:6,round(.34*h):round(.69*h),round(.41*w):round(.59*w)]
    chroma=roi.max(axis=0)-roi.min(axis=0)
    value=roi.mean(axis=0)
    return float(np.mean((chroma>19)&(value>37)))


def fill_occlusion(values, observed, yaw, visual, reference, fps):
    t=np.arange(len(yaw))
    if np.count_nonzero(observed)<max(5,.23*len(yaw)):
        return values,yaw
    # Use reliable observations on both sides and preserve reliable short-term
    # visual changes where the torso disappears. Interpolation uses no labels.
    at=t[observed]
    filled=values.copy()
    for col in range(values.shape[1]):
        fitted=np.interp(t,at,values[observed,col])
        filled[~observed,col]=fitted[~observed]
    offset=np.unwrap(yaw-visual)
    angle=np.interp(t,at,yaw[observed])
    correction=np.interp(t,at,offset[observed])
    guess=visual+correction
    dominance=np.clip((.33-np.abs(guess-angle))/.30,0,1)*reference*.50
    angle=np.where(observed,yaw,(1-dominance)*angle+dominance*guess)
    return filled,gaussian(angle[:,None],max(1.,.11*fps)).ravel()


def anatomical_scale(radii, pitch, landmarks, length_factor, fps, observed):
    """Estimate relative metric depth using projected upper-body joint spans."""
    rays=landmarks[:,:,1]
    phases=landmarks[:,:,0]
    cos,sin=np.cos(pitch),np.sin(pitch)
    root=np.maximum(.4,np.sqrt(1+rays[:,0]**2+phases[:,0]**2))
    estimates=[]; weights=[]
    for upper,lower,high,low,weight in ((5,0,.625,0.,1.0),
                                      (8,0,.757,0.,1.0),
                                      (5,7,.625,.245,.8),
                                      (8,7,.757,.245,.9)):
        separation=rays[:,lower]-rays[:,upper]
        depth=(high-low)*length_factor*(cos-sin*rays[:,upper])/np.maximum(separation,.027)
        candidate=(depth+low*length_factor*sin)*root
        ratio=candidate/radii
        valid=(separation>.047)&(ratio>.76)&(ratio<1.26)&observed
        estimates.append(np.where(valid,np.log(np.clip(ratio,.76,1.26)),0))
        weights.append(valid*weight)
    estimate=np.sum(np.array(weights)*estimates,axis=0)/np.maximum(.8,np.sum(weights,axis=0))
    filtered=gaussian(median_window(estimate[:,None],3),max(1.,.22*fps)).ravel()
    return radii * np.exp(.45*filtered)


def plane_chain(original, edges, observed, strength):
    """Solve a metric camera-height chain with homography ratios on its edges."""
    if len(edges)<4:
        return original
    indices=np.unique([i for e in edges for i in e[:2]])
    first,last=indices[0],indices[-1]
    by_index={i:j for j,i in enumerate(indices.tolist())}
    height=original[indices]
    anchors=(height>.15)
    if anchors.sum()<5:
        return original
    safe=np.maximum(height,.15)
    log_h=np.log(safe)
    unary=np.where(observed[indices],1.,.37)
    diag=unary.copy()
    upper=np.zeros(len(indices)-1)
    rhs=unary*log_h
    for i,j,ratio,confidence,_ in edges:
        left,right=by_index[i],by_index[j]
        if right!=left+1 or not (anchors[left] and anchors[right]):
            continue
        delta=np.log(ratio)
        discrepancy=delta-log_h[right]+log_h[left]
        if abs(discrepancy)>.22:
            continue
        weight=strength*confidence*np.exp(-.5*(discrepancy/.12)**2)
        diag[left]+=weight
        diag[right]+=weight
        upper[left]-=weight
        rhs[left]-=weight*delta
        rhs[right]+=weight*delta
    # Solve the symmetric tridiagonal normal equations.
    for i in range(1,len(indices)):
        alpha=upper[i-1]/diag[i-1]
        diag[i]-=alpha*upper[i-1]
        rhs[i]-=alpha*rhs[i-1]
    fitted=np.empty(len(indices))
    fitted[-1]=rhs[-1]/diag[-1]
    for i in range(len(indices)-2,-1,-1):
        fitted[i]=(rhs[i]-upper[i]*fitted[i+1])/diag[i]
    ratio=np.clip(fitted-log_h,-.33,.33)
    change=np.interp(np.arange(len(original)),indices,ratio)
    change[:first]=0
    change[last+1:]=0
    return np.where(original>.16,original*np.exp(change),original)


def fuse_visual_residual(yaw, visual, observed, inliers, residual, fps):
    """Let stable optical flow correct small high-frequency heading residuals."""
    sigma=max(1.,fps*.29)
    pose_lag=yaw-gaussian(yaw[:,None],sigma).ravel()
    background_lag=visual-gaussian(visual[:,None],sigma).ravel()
    discrepancy=background_lag-pose_lag
    confidence=np.clip((inliers-18)/80,0,1)*np.exp(-.5*(residual/.80)**2)
    agreement=np.clip(1-np.abs(discrepancy)/.105,0,1)
    weight=confidence*agreement*np.where(observed,.15,.22)
    return yaw+weight*discrepancy,float(weight.mean())
