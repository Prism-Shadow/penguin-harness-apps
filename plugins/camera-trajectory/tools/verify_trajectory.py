"""Validate a trajectory file before handing it to Blender."""

import argparse
import json
import math
from pathlib import Path


def verify(path):
    data = json.loads(Path(path).read_text())
    if data.get("coordinate_system")!="blender_z_up_camera_to_subject_root_quaternion_wxyz":
        raise ValueError("Unexpected coordinate system")
    fps = data["fps"]
    frames = data["frames"]
    if not isinstance(fps,(int,float)) or not math.isfinite(fps) or fps<=0 or len(frames)<2:
        raise ValueError("Missing frame rate or poses")
    for i,f in enumerate(frames):
        p,q = f["position"],f["quaternion"]
        if (f["frame"]!=i or not math.isclose(f["t"],i/fps,abs_tol=1e-6) or
                len(p)!=3 or len(q)!=4 or not all(math.isfinite(v) for v in (*p,*q)) or
                not math.isclose(sum(v*v for v in q),1,abs_tol=1e-4)):
            raise ValueError(f"Invalid pose at frame {i}")
    d = data["diagnostics"]
    summary = {**d, "frames":len(frames), "fps":fps,"intrinsics":data["intrinsics"],
               "duration_s":len(frames)/fps}
    return summary


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("trajectory",type=Path)
    p.add_argument("--summary",type=Path)
    a = p.parse_args()
    result = json.dumps(verify(a.trajectory),ensure_ascii=False,allow_nan=False)+"\n"
    if a.summary:
        a.summary.write_text(result)
    print(result,end="")


if __name__=="__main__":
    main()
