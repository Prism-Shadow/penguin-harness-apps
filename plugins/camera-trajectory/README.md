# Camera Trajectory

[简体中文](README.zh.md)

Recover a subject-relative animated camera from a monocular video. The workbench queues an offline CPU job, validates the estimated poses, and exports a Blender 4.2 camera. It runs OpenCV and the bundled local weights.

## Install and run

1. Extract the plugin tarball or run `npm ci` and `npm run build:desks` in this repository. Install the resulting package directory with `penguin plugin install /absolute/path/to/package`. In the target Agent’s Plugins settings, install Camera Trajectory from the library to add its App Center shortcut.
2. On the PenguinHarness server, create a Python 3.13 virtual environment and install `tools/requirements.txt`. Set `PENGUIN_CAMERA_PYTHON` to its Python executable when starting the server. It defaults to `python3`.
3. To generate `.blend` files on the server, install Blender 4.2 and set `PENGUIN_CAMERA_BLENDER` to its executable. It defaults to `blender`.

Open Camera Trajectory in App Center, choose an MP4, MOV or WebM video, and select Track video. The upload accepts up to 48 MiB and 3,000 frames. Adjust estimated subject height for metric scale. Review the original video, top view, elevation curve and diagnostics. Download the JSON and Blender script side by side and run the script in Blender’s Scripting workspace, or request a `.blend` from the workbench.

```bash
CUDA_VISIBLE_DEVICES="" python tools/track.py \
  --images /path/images --intrinsics /path/intrinsics.json --out /path/trajectory.json
python tools/verify_trajectory.py /path/trajectory.json
blender -b --python-exit-code 1 -P tools/blender_export.py -- \
  --trajectory /path/trajectory.json --blend /path/camera.blend
```

To track a video, use `--video /path/shot.mp4`. Intrinsics can be supplied for either input and use image dimensions, `fx/fy/cx/cy`, and `fps`. The output is a metric camera-to-subject transform with unit `wxyz` quaternions, Blender Z-up and camera -Z forward.

The CPU-only container also runs with networking disabled after the build:

```bash
docker build -t camera-trajectory-cpu tools
docker run --rm --network none -v /path/job:/job camera-trajectory-cpu \
  --images /job/images --intrinsics /job/intrinsics.json --out /job/trajectory.json
```

## Measurements

| Input | Clips | ATE cm | RotErr ° | CPU ms/frame |
|---|---:|---:|---:|---:|
| Calibrated synthetic tuning | 45 | 45.92 | 42.82 | 3.33 |
| Independent synthetic holdout | 20 | 69.91 | 37.98 | 3.72 |
| Film footage | 10 | — | — | 12.02–14.88 |

The Intel Core Ultra 9 285K benchmark uses one logical core, with decoding and serialization outside the measured interval. Four movie clips matched the main motion cues, five partially matched, and one had a filename cue that could not be verified from the footage. Fast independent actor motion, tight crops, and unknown intrinsics reduce metric and heading accuracy. Compare low-coverage intervals against the source before using a track.

[Source frames and Blender proxies](docs/film-preview.jpg)
