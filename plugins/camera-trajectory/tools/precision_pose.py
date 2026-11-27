"""Pelvis facing, metric pose and confidence fusion for calibrated character clips."""

from time import perf_counter_ns, process_time_ns

import cv2
import numpy as np

from floor_pose import floor_normal, ground_motion
from look_at import camera_rotations
from pose_crop import JOINTS, MIRROR, REFERENCE_HEIGHT, pose_patch
from precision_fusion import (anatomical_scale, fill_occlusion, foreground_evidence,
                              fuse_visual_residual, plane_chain)
from subject_pose import forward, load_network
from temporal import gaussian, median_window

VIEW_VARIANTS = ("views-keypoints", "views-fusion", "views-grid", "views-visible",
                 "views-vertical", "views-metric", "views-confidence")
VARIANTS = ("facing", "keypoints", "floor", "contact", "precision", "fusion", "fusion-strong",
            *VIEW_VARIANTS)


def sample_values(samples, count):
    clock = np.arange(count)
    at = np.asarray([i for i,_ in samples])
    values = np.asarray([v for _,v in samples])
    return np.column_stack([np.interp(clock,at,v) for v in values.T])


def smooth(values, sigma):
    return gaussian(median_window(values,2),sigma)


def circular_mean(a, w):
    return np.arctan2(np.sum(w*np.sin(a)),np.sum(w*np.cos(a)))


def wrapped(a):
    return np.arctan2(np.sin(a),np.cos(a))


def vector_position(yaw,pitch,radius,aim):
    along = np.sqrt(np.maximum(.04,radius**2-(aim*np.cos(pitch))**2)) - aim*np.sin(pitch)
    horizontal = along*np.cos(pitch)
    return np.column_stack((horizontal*np.sin(yaw),-horizontal*np.cos(yaw),along*np.sin(pitch)+aim))


def camera_angles(positions, aim):
    x,y,z = positions.T
    return np.arctan2(x,-y),np.arctan2(z-aim,np.hypot(x,y)),np.linalg.norm(positions,axis=1)


def camera_ray(positions,rotations):
    points = -np.einsum("ni,nij->nj",positions,rotations)
    depth = np.maximum(-points[:,2],.25)
    return np.column_stack((points[:,0]/depth,-points[:,1]/depth)),depth


def anatomical_yaw(yaw, pitch, radii, landmarks, size):
    # Compare left/right hips and shoulders and the projected nose direction.
    # The nose and toes disambiguate a half-turn when bilateral widths are small.
    distance = np.maximum(radii,1.)
    x = landmarks[:,:,0]
    hip = (x[:,1]-x[:,2])*distance/(.206*size)
    shoulder = (x[:,3]-x[:,4])*distance/(.348*size)
    nose = (x[:,5]-x[:,6])*distance/(.09*size)
    toes = ((x[:,9]-x[:,11])+(x[:,10]-x[:,12]))*.5*distance/(.124*size)
    lateral = .42*np.clip(hip,-1.2,1.2)+.58*np.clip(shoulder,-1.2,1.2)
    toes_ok = (landmarks[:,9:13,1].max(axis=1)<.49)&(np.abs(toes)<1.4)
    front = .70*np.clip(nose,-1.25,1.25)+.30*np.where(toes_ok,np.clip(toes,-1.2,1.2),np.clip(nose,-1.25,1.25))
    magnitude = np.hypot(lateral,front)
    cue = np.arctan2(front,lateral)
    discrepancy = wrapped(cue-yaw)
    weight = np.clip((magnitude-.35)*.35,0.,.30)*np.clip(1-np.abs(discrepancy)/.88,0.,1.)
    weight *= np.cos(pitch)**2
    return np.unwrap(yaw+weight*discrepancy),weight


def blend_step_yaw(measured, visual, confidence, fps):
    # Fuse rotation increments only where they agree with anatomical observations.
    # The global offset is a circular vote in the subject's own coordinates.
    offset = wrapped(measured-visual)
    center = circular_mean(offset,np.maximum(.08,confidence))
    residual = wrapped(offset-center)
    stable = np.median(np.abs(residual)) < .19
    local = gaussian(residual[:,None],max(1.,.52*fps)).ravel()
    proposal = visual+center+local
    agreement = np.exp(-.5*((residual-local)/.17)**2)
    weight = (.31 if stable else .15)*agreement*confidence
    return measured+weight*wrapped(proposal-measured)


def support_scale(position, attitude, landmarks, pelvis_height, size, limit):
    """Estimate metric depth from whichever foot plausibly contacts the floor."""
    cam_up = attitude[:,2,:]*[1.,-1.,-1.]
    reference = JOINTS[[9,10]]*size
    vertical = np.einsum("ni,nki->nk",cam_up,
                         np.concatenate((landmarks[:,[9,10]],np.ones((len(position),2,1))),axis=2))
    root_ray = np.c_[landmarks[:,0],np.ones(len(position))]
    root_height = np.sum(root_ray*cam_up,axis=1)
    optical = -attitude[:,:,2]
    relative_depth = optical @ reference.T
    denominators = vertical-root_height[:,None]
    root_depth = (-.84*size-relative_depth*vertical)/np.minimum(denominators,-.025)
    # A visible lower foot is a stronger contact cue than the other swinging foot.
    foot = np.argmin(vertical,axis=1)
    i = np.arange(len(position))
    d = root_depth[i,foot]
    _,model_depth = camera_ray(position,attitude)
    foot_y = landmarks[i,9+foot,1]
    scale = d/model_depth
    valid = (foot_y < limit-.018)&(foot_y>-limit)&(scale>.70)&(scale<1.34)
    scale = np.where(valid,scale,1.)
    ground_height = pelvis_height-d*root_height
    return scale,ground_height,valid


def refine_height(original, anchors, ratios, fps):
    if not ratios:
        return original
    # Estimate one metric datum per short window from body contact and propagate
    # local changes through the plane. Distant gaps never integrate unchecked.
    sums = np.zeros(len(original))
    weights = np.zeros(len(original))
    for i,j,ratio,confidence,_ in ratios:
        if original[i]<.12 or original[j]<.12:
            continue
        target = np.log(ratio)
        measured = np.log(original[j]/original[i])
        if abs(target-measured)>.38:
            continue
        current = np.linspace(np.log(original[i]),np.log(original[j]),j-i+1)
        change = np.linspace(-.5,.5,j-i+1)*(target-measured)
        sums[i:j+1] += confidence*(current+change)
        weights[i:j+1] += confidence
    valid = weights>0
    output = original.copy()
    output[valid] = np.exp(sums[valid]/weights[valid])
    weights = np.minimum(1.,weights)*np.where(anchors,.44,.63)
    filtered = gaussian(((output-original)*weights)[:,None],max(1.,.13*fps)).ravel()
    return original+filtered


def optical_yaw(frames):
    w,x,y,z=np.asarray([f["quaternion"] for f in frames]).T
    return np.unwrap(np.arctan2(2*(x*z+w*y),-2*(y*z-w*x)))


def reconstruct_yaw(measured, frames, edges, confidence, fps, strong, grid):
    """Combine a global pelvis-facing vote with reliable background increments."""
    visual=optical_yaw(frames)
    support=np.array([f["background"]["inliers"] for f in frames])
    evidence=np.clip((support-20)/60,0.,1.)
    floor=np.array([f["background"]["mode"]=="ground" for f in frames])
    n=len(visual)
    increments=np.diff(visual,prepend=visual[0])
    for lo,hi,_,weight,step in edges:
        delta=visual[hi]-visual[lo]
        error=step-delta
        if abs(error)<.34:
            increments[lo+1:hi+1]+=weight*error/(hi-lo)
            evidence[lo:hi+1]=np.maximum(evidence[lo:hi+1],weight)
    visual=visual[0]+np.cumsum(increments)
    if len(grid)>=4:
        at=np.array([i for i,_ in grid])
        infos=np.array([v for _,v in grid])
        weight=infos[:,1]
        # A Manhattan floor fixes yaw modulo a quarter-turn. Use its continuous
        # deviation from the odometry instead of snapping to one of four axes.
        modulo=wrapped(4*(infos[:,2]-visual[at]))
        center=circular_mean(modulo,weight)
        delta=wrapped(modulo-center)*.25
        use=(np.abs(delta)<.25)&(weight>.46)
        if use.sum()>=max(4,.52*len(grid)):
            t=np.arange(n)
            patch=np.interp(t,at[use],delta[use])
            distance=np.min(np.abs(t[:,None]-at[use]),axis=1)
            patch*=np.clip(1-distance/(.55*fps),0,1)
            visual+=.75*smooth(patch[:,None],max(1.,.16*fps)).ravel()
    deviation=wrapped(measured-visual)
    frontal=np.clip((np.cos(measured)+.8)/1.8,.18,1.)
    weight=confidence*frontal*(.35+.65*evidence)
    offset=circular_mean(deviation,np.maximum(.06,weight))
    for _ in range(3):
        residual=wrapped(deviation-offset)
        offset=circular_mean(deviation,np.maximum(.06,weight)/(1+(residual/.26)**2))
    deviation=wrapped(deviation-offset)
    yaw_support=np.median(evidence)
    dispersion=np.median(np.abs(deviation))
    use_local=(yaw_support>.38 and (np.mean(floor)>.34 or len(edges)>n/(.82*fps))
               and dispersion<.51)
    if not use_local:
        return smooth(measured[:,None],max(1.,.23*fps)).ravel(),False
    max_offset=.37 if strong else .50
    observed=np.clip(deviation,-max_offset,max_offset)
    patch=smooth(observed[:,None],max(1.,fps*(.30 if strong else .25))).ravel()
    gain=.55 if strong else .84
    fitted=visual+offset+gain*patch
    fitted=smooth(fitted[:,None],max(1.,.093*fps)).ravel()
    return fitted,True


def precise_track(images, intrinsics, variant, height, baseline, to_quaternion, make_k,
                  base_mask, detect_box):
    fps=float(intrinsics["fps"])
    aim=.46*height/REFERENCE_HEIGHT
    k=make_k(intrinsics)
    model_file="pelvis-landmarks-views.onnx" if variant in VIEW_VARIANTS else "pelvis-landmarks.onnx"
    pose=load_network(model_file)
    samples,floor,ratios,visibility=[],[],[],[]
    total_cpu=total_wall=0
    fused=variant in ("fusion","fusion-strong","views-fusion","views-grid")
    strong=variant in ("fusion-strong","views-fusion","views-grid")
    adjust_vertical=variant in ("views-vertical","views-metric","views-confidence")
    visible=variant=="views-visible" or adjust_vertical
    use_contact=variant in ("contact","precision") or fused or adjust_vertical
    detector=cv2.createLineSegmentDetector(cv2.LSD_REFINE_STD,.75,.6,1.) if variant in (
        "floor","contact","precision") or fused or adjust_vertical else None
    prev_floor=None
    stride=max(1,round(fps/14))
    floor_stride=max(3,round(fps/5))
    last=None

    def observe():
        nonlocal total_cpu,total_wall,prev_floor,last
        for i,image in enumerate(images):
            tc,tw=process_time_ns(),perf_counter_ns()
            if i%stride==0:
                patch=np.ascontiguousarray(pose_patch(image,k)[None],dtype=np.float32)
                last=forward(pose,patch/255-.5)[0].ravel()
                if visible:
                    mirrored=forward(pose,np.ascontiguousarray(patch[:,:,:,::-1])/255-.5)[0].ravel()
                    mirror=mirrored[:-4].reshape(len(JOINTS),2)
                    mirror[:,0]*=-1
                    mirrored=np.r_[mirror[MIRROR].ravel(),-mirrored[-4],mirrored[-3:]]
                    last=(last+mirrored)*.5
                    visibility.append((i,[foreground_evidence(patch[0])]))
                samples.append((i,last))
            if detector is not None and i%floor_stride==0:
                h,w=image.shape[:2]
                target=(round(w*min(1.,400/max(h,w))),round(h*min(1.,400/max(h,w))))
                small=cv2.resize(image,target,interpolation=cv2.INTER_AREA)
                gray=cv2.cvtColor(small,cv2.COLOR_BGR2GRAY)
                kk=np.diag([target[0]/w,target[1]/h,1.])@k
                box=detect_box(small,True)
                if box is None:
                    box=np.array([.38*target[0],.26*target[1],.24*target[0],.68*target[1]])
                mask=base_mask(gray,box)
                prior=np.arcsin(np.clip(last[-2],-.94,.94))
                seen=floor_normal(gray,mask,kk,prior,detector)
                if seen is not None:
                    floor.append((i,seen))
                if prev_floor is not None and use_contact:
                    j,previous,previous_mask,previous_pitch=prev_floor
                    change=ground_motion(previous,gray,previous_mask,mask,kk,previous_pitch)
                    if change is not None:
                        ratios.append((j,i,*change))
                prev_floor=i,gray,mask,seen[0] if seen is not None else prior
            total_cpu+=process_time_ns()-tc
            total_wall+=perf_counter_ns()-tw
            yield image

    result=baseline(observe(),intrinsics,"smooth",height)
    tc,tw=process_time_ns(),perf_counter_ns()
    frames=result["frames"]
    dimensions=result["intrinsics"]
    n=len(frames)
    base_positions=np.asarray([f["position"] for f in frames])
    base_yaw,_,_=camera_angles(base_positions,aim)
    base_yaw=np.unwrap(base_yaw)
    values=sample_values(samples,n)
    infos=smooth(values,max(1.,.12*fps))
    landmarks=infos[:,:-4].reshape(n,len(JOINTS),2)
    yaw=np.unwrap(np.arctan2(infos[:,-4],infos[:,-3]))
    pitch=np.arcsin(np.clip(infos[:,-2],-.93,.93))
    radius=np.clip(np.exp(infos[:,-1])*4,1.15,10.)*height/REFERENCE_HEIGHT
    size=height/REFERENCE_HEIGHT
    yaw,heading_support=anatomical_yaw(yaw,pitch,radius,landmarks,size)
    confidence=np.clip(np.linalg.norm(infos[:,-4:-2],axis=1),0.,1.)
    fused_visual=False
    flow_residual_weight=0.
    observed=np.ones(n,dtype=bool)
    if visible:
        foreground=sample_values(visibility,n).ravel()
        threshold=np.clip(.52*np.percentile(foreground,65),.085,.45)
        strength=smooth(foreground[:,None],max(1.,fps*.065)).ravel()
        observed=strength>threshold
        if np.count_nonzero(observed)>=.27*n:
            joined=np.c_[pitch,radius]
            joined,yaw=fill_occlusion(joined,observed,yaw,optical_yaw(frames),
                                      np.array([f["background"]["inliers"]>=30 for f in frames]),fps)
            pitch,radius=joined.T
        radius=smooth(radius[:,None],max(1.,.19*fps)).ravel()
        pitch=smooth(pitch[:,None],max(1.,.16*fps)).ravel()
    if variant=="facing":
        offset=circular_mean(wrapped(yaw-base_yaw),confidence)
        c,s=np.cos(offset),np.sin(offset)
        r=np.array([[c,-s,0.],[s,c,0.],[0.,0.,1.]])
        for f,point in zip(frames,base_positions@r.T):
            q=np.array(f["quaternion"])
            w,x,y,z=q
            c1,s1=np.cos(offset*.5),np.sin(offset*.5)
            f["position"]=point.tolist()
            f["quaternion"]=[c1*w-s1*z,c1*x-s1*y,c1*y+s1*x,c1*z+s1*w]
        contact_valid=np.zeros(n,dtype=bool)
    else:
        if floor:
            at=np.array([i for i,_ in floor])
            obs=np.array([v for _,v in floor])
            difference=np.clip(obs[:,0]-pitch[at],-.27,.27)
            correction=np.interp(np.arange(n),at,difference*obs[:,1])
            support=np.min(np.abs(np.arange(n)[:,None]-at),axis=1)
            correction*=np.clip(1-support/(2.3*floor_stride),0,1)
            gain=1. if adjust_vertical else .57
            pitch+=gain*smooth(correction[:,None],max(1.,fps*.15)).ravel()
        if fused:
            yaw,fused_visual=reconstruct_yaw(yaw,frames,ratios,confidence,fps,strong,
                                                  floor if variant=="views-grid" else [])
            radius=smooth(radius[:,None],max(1.,.17*fps)).ravel()
            pitch=smooth(pitch[:,None],max(1.,.15*fps)).ravel()
        if variant=="precision":
            available=np.array([f["background"]["inliers"] for f in frames])
            flow_confidence=np.clip((available-20)/65,0.,1.)
            yaw=blend_step_yaw(yaw,base_yaw,flow_confidence,fps)
        if variant=="views-confidence":
            matches=np.array([f["background"]["inliers"] for f in frames])
            residual=np.array([f["background"]["error_px_working"]
                               if f["background"]["error_px_working"] is not None else 4.
                               for f in frames])
            yaw,flow_residual_weight=fuse_visual_residual(
                yaw,optical_yaw(frames),observed,matches,residual,fps)
        if variant in ("views-metric","views-confidence"):
            radius=anatomical_scale(radius,pitch,landmarks,size,fps,observed)
        positions=vector_position(yaw,pitch,radius,aim)
        attitudes,_=camera_rotations(positions,np.broadcast_to(np.eye(3),(n,3,3)),aim)
        contact_valid=np.zeros(n,dtype=bool)
        if use_contact:
            correction,height_obs,contact_valid=support_scale(
                positions,attitudes,landmarks,.89*size,size,
                min(k[1,2],dimensions["height"]-k[1,2])/k[1,1])
            radii=radius*np.exp(.19*smooth(np.log(correction[:,None]),max(1.,fps*.23)).ravel())
            positions=vector_position(yaw,pitch,radii,aim)
            camera_height=positions[:,2]+.89*size
            contact_height=np.where(contact_valid,
                                    np.clip(height_obs-camera_height,-.25,.25)*.16,0.)
            if adjust_vertical:
                height_fit=plane_chain(camera_height+contact_height,observed=observed & contact_valid,
                                       edges=ratios,strength=110.)
                positions[:,2]=height_fit-.89*size
                horizontal=np.sqrt(np.maximum(.3,radii**2-positions[:,2]**2))
                positions[:,:2]=horizontal[:,None]*np.column_stack((np.sin(yaw),-np.cos(yaw)))
            else:
                positions[:,2]=refine_height(camera_height+contact_height,contact_valid,ratios,fps)-.89*size
            attitudes,_=camera_rotations(positions,attitudes,aim)
        anchors,depth=camera_ray(positions,attitudes)
        pixels=(anchors*k.diagonal()[:2]+k[:2,2])/[dimensions["width"],dimensions["height"]]
        previous=None
        for f,position,attitude,pixel,d in zip(frames,positions,attitudes,pixels,depth):
            q=to_quaternion(attitude)
            if previous is not None and q@previous<0:
                q=-q
            f["position"],f["quaternion"]=position.tolist(),q.tolist()
            f["subject"]["anchor"],f["subject"]["depth_m"]=pixel.tolist(),float(d)
            f["subject"]["method"]="calibrated-landmarks"
            previous=q
    d=result["diagnostics"]
    q=np.array([f["quaternion"] for f in frames])
    step=2*np.degrees(np.arccos(np.clip(np.abs(np.sum(q[1:]*q[:-1],axis=1)),0,1)))
    d.update(variant=variant,floor_observations=len(floor),ground_height_pairs=len(ratios),
             background_facing_fusion=fused_visual,torso_observed=float(observed.mean()),
             background_residual_weight=flow_residual_weight,
             foot_contact_coverage=float(contact_valid.mean()),anatomical_heading_weight=float(heading_support.mean()),
             rotation_high_frequency_deg2=float(np.mean(np.diff(step)**2)) if n>2 else None)
    d["latency_ms"]+=(total_cpu+process_time_ns()-tc)/1e6/n
    d["wall_latency_ms"]+=(total_wall+perf_counter_ns()-tw)/1e6/n
    return result
