"""Estimate metric camera poses relative to a moving subject, on CPU."""

import argparse
import json
import math
import os
from pathlib import Path
from time import perf_counter_ns, process_time_ns

for variable in ("OPENBLAS_NUM_THREADS", "OMP_NUM_THREADS", "MKL_NUM_THREADS"):
    os.environ[variable] = "1"

import cv2
import numpy as np

from ground import ground_step, vanishing_axes
from movie_subject import MovieSubject, refine_backwards
from silhouette import silhouette_anchor
from subject_pose import SubjectPose
from temporal import stabilize

cv2.setNumThreads(1)
cv2.ocl.setUseOpenCL(False)

CV_TO_BLENDER = np.diag([1.,-1.,-1.])
LEVEL = np.array([[1.,0.,0.],[0.,0.,1.],[0.,-1.,0.]])
LK_OPTIONS = dict(winSize=(17,17), maxLevel=2,
                  criteria=(cv2.TERM_CRITERIA_COUNT | cv2.TERM_CRITERIA_EPS,18,.03))


def matrix(k):
    return np.array([[k["fx"],0,k["cx"]],[0,k["fy"],k["cy"]],[0,0,1.]],dtype=np.float64)


def quaternion(rotation):
    diagonal = rotation.diagonal()
    magnitude = np.sqrt(np.maximum(0., 1 + np.r_[diagonal.sum(), 2*diagonal-diagonal.sum()]))
    w, x, y, z = np.argmax(magnitude) == np.arange(4)
    a, b, c = rotation
    axis = magnitude.max() * 2
    if w:
        q = np.array([axis/4,(c[1]-b[2])/axis,(a[2]-c[0])/axis,(b[0]-a[1])/axis])
    elif x:
        q = np.array([(c[1]-b[2])/axis,axis/4,(a[1]+b[0])/axis,(a[2]+c[0])/axis])
    elif y:
        q = np.array([(a[2]-c[0])/axis,(a[1]+b[0])/axis,axis/4,(b[2]+c[1])/axis])
    else:
        q = np.array([(b[0]-a[1])/axis,(a[2]+c[0])/axis,(b[2]+c[1])/axis,axis/4])
    return q/np.linalg.norm(q)


def rotate(vector):
    return cv2.Rodrigues(np.asarray(vector,dtype=np.float64))[0]


def image_reader(directory):
    paths = sorted(p for p in Path(directory).iterdir() if p.suffix.lower() in (".png",".jpg",".jpeg"))
    for path in paths:
        frame = cv2.imread(str(path))
        if frame is None:
            raise ValueError(f"Unreadable image: {path.name}")
        yield frame


def video_open(path):
    capture = cv2.VideoCapture(str(path),cv2.CAP_FFMPEG,[cv2.CAP_PROP_N_THREADS,1])
    if not capture.isOpened():
        capture.release()
        capture = cv2.VideoCapture(str(path))
    w = int(capture.get(cv2.CAP_PROP_FRAME_WIDTH))
    h = int(capture.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = capture.get(cv2.CAP_PROP_FPS)
    if not capture.isOpened() or min(w,h,fps) <= 0:
        capture.release()
        raise ValueError("Video has no readable stream")

    def frames():
        try:
            while True:
                ok, frame = capture.read()
                if not ok:
                    break
                yield frame
        finally:
            capture.release()

    return frames(), {"width":w,"height":h,"fx":w*35/36,"fy":w*35/36,
                      "cx":w/2,"cy":h/2,"fps":fps,"estimated":True}


def chromatic_subject(image, allow_crop=False):
    h,w = image.shape[:2]
    low, high = int(.26*w), int(.74*w)
    top = int((.12 if allow_crop else .24)*h)
    hsv = cv2.cvtColor(image[top:,low:high],cv2.COLOR_BGR2HSV)
    mask = cv2.inRange(hsv,(0,73,30),(179,255,255))
    mask = cv2.morphologyEx(mask,cv2.MORPH_CLOSE,np.ones((7,5),np.uint8))
    _, _, stats, _ = cv2.connectedComponentsWithStats(mask)
    x,y,bw,bh,area = stats[1:].T
    center = (x+bw*.5+low)/w
    peak = (y+top)/h
    min_top,max_height = (.12,.89) if allow_crop else (.26,.78)
    valid = (area>18) & (bh>h*.08) & (bh<max_height*h) & (bw<bh*1.42) & (peak>=min_top) & (peak<.63)
    desirability = (np.minimum(bh/h,.6)-2.2*np.abs(center-.5)-1.2*np.abs(peak-.40)
                    +.13*np.minimum(1.,bh/np.maximum(1,bw)))
    if not valid.any():
        return None
    idx = np.argmax(np.where(valid,desirability,-np.inf))
    return np.array([x[idx]+low,y[idx]+top,bw[idx],bh[idx]],dtype=np.float64)


def box_anchor(box, k, height):
    x,y,w,h = box
    depth = np.clip(k[1,1]*height/max(h,1),.55,120.)
    return np.array([x+w*.5,y+h*.535,depth])


def background_mask(gray, box):
    mask = np.full(gray.shape,255,np.uint8)
    x,y,w,h = box
    x0,y0 = max(0,int(x-.22*w-5)),max(0,int(y-.12*h-5))
    x1,y1 = min(gray.shape[1],int(x+1.22*w+5)),min(gray.shape[0],int(y+1.12*h+5))
    mask[y0:y1,x0:x1] = 0
    return mask


def features(gray, mask, count=185):
    corners = cv2.goodFeaturesToTrack(gray,count,.009,7,mask=mask,blockSize=5)
    return np.empty((0,2),np.float32) if corners is None else corners.reshape(-1,2)


def follow(previous, gray, points, mask):
    if not len(points):
        return np.empty(0,dtype=int),points
    current, status, _ = cv2.calcOpticalFlowPyrLK(previous,gray,points,None,**LK_OPTIONS)
    backwards, back_status, _ = cv2.calcOpticalFlowPyrLK(gray,previous,current,None,**LK_OPTIONS)
    x,y = np.clip(np.rint(current),[0,0],[gray.shape[1]-1,gray.shape[0]-1]).astype(int).T
    inside = ((current[:,0]>=1)&(current[:,0]<gray.shape[1]-1)&
              (current[:,1]>=1)&(current[:,1]<gray.shape[0]-1))
    ok = (inside & (status[:,0]>0) & (back_status[:,0]>0)
          & (np.linalg.norm(backwards-points,axis=1)<.9) & (mask[y,x]>0))
    return np.flatnonzero(ok),current[ok]


def normalized(points, k):
    rays = np.c_[(points-k[:2,2])/k.diagonal()[:2],np.ones(len(points))]
    return rays/np.linalg.norm(rays,axis=1)[:,None]


def polar(array):
    u,_,v = np.linalg.svd(array)
    u[:,-1] *= np.linalg.det(u@v)
    return u@v


def relative_pose(a,b,k):
    if len(a)<12:
        return None,None
    essential, mask = cv2.findEssentialMat(a,b,k,cv2.RANSAC,.995,1.05,55)
    if essential is not None and essential.shape == (3,3):
        good, rotation, _, inliers, _ = cv2.recoverPose(essential,a,b,k,distanceThresh=200.,mask=mask)
        if good >= max(10,len(a)*.22) and np.trace(rotation)>2.982:
            # Sampson distance is reported in pixels at the working resolution.
            kinv = np.linalg.inv(k)
            f = kinv.T @ essential @ kinv
            aa, bb = np.c_[a,np.ones(len(a))],np.c_[b,np.ones(len(b))]
            fb, fa = aa@f.T,bb@f
            use = inliers.ravel()>0
            dist = np.abs(np.sum(bb*fb,axis=1))/np.sqrt(
                np.maximum(1e-12,np.sum(fb[:,:2]**2 + fa[:,:2]**2,axis=1)))
            return rotation,("essential",float(np.median(dist[use])),good)
    u,v = normalized(a,k), normalized(b,k)
    guess = polar(v.T@u)
    residual = np.linalg.norm(u@guess.T-v,axis=1)
    use = residual<=np.percentile(residual,58)
    r = polar(v[use].T@u[use])
    if np.trace(r)>2.974:
        return r,("bearing",float(np.median(residual[use])*k[0,0]),int(use.sum()))
    return None,None


def track(images, intrinsics, variant="smooth", subject_height=1.74):
    use_ground = variant != "baseline"
    use_silhouette = variant not in ("baseline","ground")
    use_smoothing = variant not in ("baseline","ground","silhouette")
    use_axes = variant in ("axes","axes-pose")
    use_pose = variant in ("pose","axes-pose","movie")
    use_movie = variant == "movie"
    lines = cv2.createLineSegmentDetector(cv2.LSD_REFINE_STD) if use_axes else None
    k0 = matrix(intrinsics)
    fps = float(intrinsics["fps"])
    if (not np.isfinite(k0).all() or not math.isfinite(fps) or not math.isfinite(subject_height)
            or min(k0[0,0],k0[1,1],fps,subject_height)<=0):
        raise ValueError("Intrinsics, frame rate and subject height must be positive and finite")
    predictor = SubjectPose(fps) if use_pose and not use_movie else None
    movie = MovieSubject(fps) if use_movie else None
    previous_gray = None
    orientation = LEVEL @ rotate([-.095 if use_ground else .095,0,0])
    frames, times, wall, reprojection = [], [], [], []
    previous_box = None
    shot = 0
    grey_history = []
    for index, image in enumerate(images):
        start, elapsed = process_time_ns(),perf_counter_ns()
        h,w = image.shape[:2]
        if index == 0:
            if intrinsics.get("width",w)!=w or intrinsics.get("height",h)!=h:
                raise ValueError("Image dimensions do not match intrinsics")
            size = (w,h)
            scale = min(1.,400/max(size))
            target = tuple(round(x*scale) for x in size)
            k = np.diag([target[0]/w,target[1]/h,1.]) @ k0
        if (w,h)!=size:
            raise ValueError("Image size changed within the clip")
        image = cv2.resize(image,target,interpolation=cv2.INTER_AREA) if target!=size else image
        gray = cv2.cvtColor(image,cv2.COLOR_BGR2GRAY)
        movie_anchor, movie_axis, movie_method = None, None, None
        box = None
        if movie:
            grey_history.append(gray)
            warp = None
            if previous_gray is not None:
                all_valid = np.full(gray.shape,255,np.uint8)
                ids, flow = follow(previous_gray,gray,points,all_valid)
                if len(ids)<max(10,.15*len(points)) and np.mean(cv2.absdiff(gray,previous_gray))>32:
                    movie.reset()
                    previous_gray = None
                    orientation = LEVEL @ rotate([-.095,0,0])
                    previous_box = None
                    shot += 1
                elif len(ids)>=14:
                    warp, _ = cv2.findHomography(points[ids],flow,cv2.RANSAC,2.,maxIters=45,confidence=.95)
                    if warp is not None and (not np.isfinite(warp).all() or abs(warp[2,2])<.001):
                        warp = None
            box,movie_anchor,movie_axis,movie_method = movie.update(image,gray,k,subject_height,index,warp)
        else:
            box = chromatic_subject(image,use_silhouette)
        observed = box is not None and movie_method not in ("carry","weak-flow")
        pose = predictor.sample(image,k,subject_height,index,box) if predictor else None
        recent = predictor.last if predictor and index-predictor.last_index<.30*fps else None
        if pose is not None:
            box, observed = pose[0], True
        elif recent is not None and not observed:
            box, observed = recent[0], False
        if box is None:
            box = previous_box if previous_box is not None else np.array([.40*target[0],.37*target[1],.2*target[0],.52*target[1]])
        mask = background_mask(gray,box)
        measurement = None
        if previous_gray is not None:
            if movie:
                pix = np.rint(flow).astype(int)
                keep = mask[pix[:,1],pix[:,0]]>0
                kept,moved = ids[keep],flow[keep]
            else:
                kept,moved = follow(previous_gray,gray,points,mask)
            planar = ground_step(points[kept],moved,k,orientation,target[1]) if use_ground else None
            if planar is not None:
                orientation,measurement = planar
            else:
                step,measurement = relative_pose(points[kept],moved,k)
                if step is not None and np.linalg.norm(step@step.T-np.eye(3))<1e-5:
                    orientation = orientation @ step.T
        if use_axes and index%7==0:
            fixed = vanishing_axes(gray,mask,k,orientation,lines)
            if fixed is not None:
                drift = cv2.Rodrigues(fixed @ orientation.T)[0].ravel()
                orientation = rotate(np.clip(drift,-.35,.35)*.55) @ orientation
        points = features(gray,mask)
        previous_gray,previous_box = gray,box
        heading = None
        if movie_anchor is not None:
            anchor = movie_anchor
            if movie_axis is not None:
                lateral = orientation @ movie_axis
                if np.linalg.norm(lateral[:2])>.12:
                    heading = math.atan2(lateral[1],lateral[0])
        elif pose is not None:
            anchor = pose[1]
            if pose[2] is not None:
                lateral = orientation @ pose[2]
                if np.linalg.norm(lateral[:2])>.12:
                    heading = math.atan2(lateral[1],lateral[0])
        elif recent is not None and not observed:
            anchor = recent[1]
        else:
            anchor = silhouette_anchor(image,box,k,orientation,subject_height) if observed and use_silhouette else None
        if anchor is None:
            anchor = box_anchor(box,k,subject_height)
        ray = np.r_[(anchor[:2]-k[:2,2])/k.diagonal()[:2],1.]
        position = -orientation @ ray * anchor[2]
        q = quaternion(orientation @ CV_TO_BLENDER)
        if frames and q @ frames[-1]["quaternion"] < 0:
            q = -q
        mode,error,inliers = measurement or ("unobserved",None,0)
        if error is not None:
            reprojection.append(error)
        frames.append({"frame":index,"t":index/fps,"shot":shot,"position":position.tolist(),"quaternion":q.tolist(),
                       "subject":{"box":(box/np.array([*target,*target])).tolist(),
                                  "anchor":(anchor[:2]/target).tolist(),"depth_m":float(anchor[2]),
                                  "observed":observed,
                                  "method":movie_method or ("pose" if pose is not None else ("silhouette" if observed else "carry")),
                                  "heading_rad":heading},
                       "background":{"mode":mode,"error_px_working":error,"inliers":int(inliers)}})
        times.append((process_time_ns()-start)/1e6)
        wall.append((perf_counter_ns()-elapsed)/1e6)
    if len(frames)<2:
        raise ValueError("Video or image sequence needs at least two frames")
    if use_smoothing:
        start,elapsed = process_time_ns(),perf_counter_ns()
        if movie:
            refine_backwards(frames,grey_history,np.array(target),fps)
        breaks = [0] + [i for i in range(1,len(frames)) if frames[i]["shot"]!=frames[i-1]["shot"]] + [len(frames)]
        for lo,hi in zip(breaks,breaks[1:]):
            stabilize(frames[lo:hi],k,np.array(target),fps,use_pose,use_movie)
        times[-1] += (process_time_ns()-start)/1e6
        wall[-1] += (perf_counter_ns()-elapsed)/1e6
    q = np.asarray([f["quaternion"] for f in frames])
    same_shot = np.diff([f["shot"] for f in frames])==0
    steps = 2*np.degrees(np.arccos(np.clip(np.abs(np.sum(q[:-1]*q[1:],axis=1)),0.,1.)))
    hf = np.diff(steps)[same_shot[:-1]&same_shot[1:]]
    return {"version":1,"fps":fps,
            "coordinate_system":"blender_z_up_camera_to_subject_root_quaternion_wxyz",
            "intrinsics":{**intrinsics,"width":size[0],"height":size[1]},
            "subject_height_m":subject_height,"frames":frames,
            "diagnostics":{"variant":variant,"latency_ms":float(np.mean(times)),
                           "wall_latency_ms":float(np.mean(wall)),
                           "working_width":target[0],"working_height":target[1],
                           "background_residual_px":float(np.median(reprojection)) if reprojection else None,
                           "background_coverage":len(reprojection)/len(frames),
                           "shots":shot+1,
                           "rotation_high_frequency_deg2":float(np.mean(hf**2)) if len(hf) else None,
                           "pose_coverage":sum(f["subject"]["method"]=="pose" for f in frames)/len(frames),
                           "subject_coverage":np.mean([x["subject"]["observed"] for x in frames]).item()}}


def main():
    p = argparse.ArgumentParser(description=__doc__)
    group = p.add_mutually_exclusive_group(required=True)
    group.add_argument("--images",type=Path)
    group.add_argument("--video",type=Path)
    p.add_argument("--intrinsics",type=Path)
    p.add_argument("--subject-height",type=float,default=1.74)
    p.add_argument("--out",type=Path,required=True)
    p.add_argument("--variant",choices=("baseline","ground","silhouette","smooth","axes","pose","axes-pose","movie"))
    p.add_argument("--max-frames",type=int)
    args = p.parse_args()
    if args.images:
        if not args.intrinsics:
            p.error("--images requires --intrinsics")
        images,k = image_reader(args.images),{}
    else:
        images,k = video_open(args.video)
    if args.intrinsics:
        k.update(json.loads(args.intrinsics.read_text()))
        k["estimated"] = False
    if args.max_frames is not None:
        if args.max_frames < 2:
            p.error("--max-frames must be at least two")
        from itertools import islice
        images = islice(images,args.max_frames)
    result = track(images,k,args.variant or ("movie" if args.video else "smooth"),args.subject_height)
    args.out.parent.mkdir(parents=True,exist_ok=True)
    temporary = args.out.with_name(args.out.name+".part")
    temporary.write_text(json.dumps(result,ensure_ascii=False,allow_nan=False)+"\n")
    temporary.replace(args.out)
    print(json.dumps(result["diagnostics"],ensure_ascii=False))


if __name__ == "__main__":
    main()
