# Camera Trajectory

[简体中文](README.zh.md)

Recover a subject-relative animated camera from a monocular video. The workbench runs OpenCV and the bundled weights locally, validates the trajectory, and exports a Blender 4.2 camera.

## Install and run

1. Extract the plugin tarball or run `npm ci` and `npm run build:desks` in this repository. Install the resulting package directory with `penguin plugin install /absolute/path/to/package`. In the target Agent’s Plugins settings, install Camera Trajectory from the library to add its App Center shortcut.
2. Open the workbench in App Center and review **Environment check**. The server checks `PENGUIN_CAMERA_PYTHON` or `python3`. Python 3.13 is recommended. If `numpy` or `cv2` is missing, select **Set up environment** once. The server creates a project virtual environment, prefers `uv` when available, and activates the interpreter after verifying both imports. Internet access is used during dependency installation. Local tracking runs offline.
3. To download `.blend` files, install Blender 4.2 on the server. The service looks up `blender` on `PATH` or uses the executable configured by `PENGUIN_CAMERA_BLENDER`. Select **Check again** once it is available. JSON and script downloads are available independently.

Open Camera Trajectory in App Center and choose an MP4, MOV or WebM clip of up to 48 MiB and 3,000 frames. Set the estimated subject height and select Build .blend if needed. **Track video** runs locally and works offline. **Run with Agent** uses the Project’s default model to call the local tools and streams the Agent’s progress. The model receives the task instructions and file paths.

Review the original video, top view, elevation curve and diagnostics after tracking. Download the generated `.blend`, or save the JSON and Blender script side by side and run the script in Blender’s Scripting workspace.

For command-line use, use the interpreter shown by **Environment check** or install `tools/requirements.txt` into a separate virtual environment.

```bash
CUDA_VISIBLE_DEVICES="" python tools/track.py \
  --images /path/images --intrinsics /path/intrinsics.json --out /path/trajectory.json
python tools/verify_trajectory.py /path/trajectory.json
blender -b --python-exit-code 1 -P tools/blender_export.py -- \
  --trajectory /path/trajectory.json --blend /path/camera.blend
```

To track a video, use `--video /path/shot.mp4`. Intrinsics can be supplied for either input and use image dimensions, `fx/fy/cx/cy`, and `fps`. The output is a metric camera-to-subject transform with unit `wxyz` quaternions, Blender Z-up and camera -Z forward.

For calibrated image sequences, the default uses 2D body landmarks for pelvis heading, with vanishing points, a ground homography, and foot contact supplying pose and scale constraints where visible. The landmark model was trained on procedural characters. The calibrated image path assumes a 1.65 m subject by default. Adjust it with `--subject-height`.

The CPU-only container also runs with networking disabled after the build:

```bash
docker build -t camera-trajectory-cpu tools
docker run --rm --network none -v /path/job:/job camera-trajectory-cpu \
  --images /job/images --intrinsics /job/intrinsics.json --out /job/trajectory.json
```

## Measurements

| Input | Clips | ATE cm | RotErr ° | CPU ms/frame |
|---|---:|---:|---:|---:|
| Calibrated synthetic training | 65 | 13.41 | 2.00 | 5.04 |
| Independent synthetic holdout, geometry baseline | 20 | 69.91 | 37.98 | 3.72 |
| Independent synthetic holdout, frozen candidate | 20 | 20.26 | 2.83 | 5.01 |
| Film footage | 10 | — | — | 11.88–14.95 |

The Intel Core Ultra 9 285K benchmark uses one logical core, with decoding and serialization outside the measured interval. The single holdout run exceeded the 20 cm ATE target by 0.26 cm and met the rotation and CPU targets. All frames in the ten movie tracks and subject observations matched the baseline exactly. Four clips matched the main motion cues, five partially matched, and one had a filename cue inconsistent with the footage. Strong perspective, tight crops, and unknown intrinsics can reduce metric and heading accuracy.

[Source frames and Blender proxies](docs/film-preview.jpg)
