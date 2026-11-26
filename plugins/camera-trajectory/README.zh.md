# 相机轨迹反求

[English](README.md)

将一段单目视频变成可以在 Blender 4.2 使用的相机动画。工作台的本地任务循环处理上传、CPU 跟踪、校验和可选导出。推理使用包内权重与 OpenCV，不需要网络或模型服务账户。

## 安装

1. 从插件 tarball 解压，或在本仓库用 Node 24 执行 `npm ci` 和 `npm run build:desks`，得到 `plugins/camera-trajectory`。使用 `penguin plugin install /absolute/path/to/package` 将解压目录或源码包目录注册到 PenguinHarness 的插件库。在目标 Agent 的「插件」中从插件库安装相机轨迹反求，应用中心随后显示工作台。
2. 在 PenguinHarness 服务端准备 Python 3.13：`python3 -m venv camera-venv`，然后执行 `camera-venv/bin/python -m pip install -r tools/requirements.txt`。启动服务时将 `PENGUIN_CAMERA_PYTHON` 设置为该解释器的绝对路径。服务端默认寻找 `python3`。
3. 可选安装 Blender 4.2，将 `PENGUIN_CAMERA_BLENDER` 设置为 Blender 可执行文件的绝对路径。服务端默认寻找 `blender`。

## 使用

打开应用中心 → 相机轨迹反求 → 选视频 → 反求轨迹。支持 MP4、MOV 和 WebM，上传上限 48 MiB，最多 3,000 帧。可调整主体身高，按需生成 `.blend`。任务完成后，播放视频并用曲线选时，检查俯视轨迹、背景残差和主体覆盖，下载 JSON 与 Blender 脚本。执行脚本时将 `trajectory.json` 放在 `build_camera_in_blender.py` 旁边。

### 命令行

```bash
CUDA_VISIBLE_DEVICES="" python tools/track.py \
  --images /path/images --intrinsics /path/intrinsics.json --out /path/trajectory.json
python tools/verify_trajectory.py /path/trajectory.json
blender -b --python-exit-code 1 -P tools/blender_export.py -- \
  --trajectory /path/trajectory.json --blend /path/camera.blend
```

视频输入使用 `--video /path/shot.mp4`，可与 `--intrinsics` 同用。内参包括像素尺寸、`fx/fy/cx/cy` 和 `fps`。逐帧输出米制平移和 `wxyz` 单位四元数，使用 Blender Z 向上、相机局部 -Z 朝前、人物根节点为原点的坐标约定。

CPU 容器可在构建完成后断网运行：

```bash
docker build -t camera-trajectory-cpu tools
docker run --rm --network none -v /path/job:/job camera-trajectory-cpu \
  --images /job/images --intrinsics /job/intrinsics.json --out /job/trajectory.json
```

## 指标和局限

| 输入 | 段数 | ATE cm | RotErr ° | CPU ms/帧 |
|---|---:|---:|---:|---:|
| 标定合成调参集 | 45 | 45.92 | 42.82 | 3.33 |
| 独立合成留出集 | 20 | 69.91 | 37.98 | 3.72 |
| 电影切片 | 10 | — | — | 12.02–14.88 |

延迟在 Intel Core Ultra 9 285K 的单核上测量，含前景、背景几何和时序处理，解码和输出写盘单列。电影复核有四段符合主要方向与构图、五段部分符合、一段文件名语义待核。相机与人同时快速转动、近景缺少骨盆、镜头内参未知时，方位角、距离容易漂移。米制尺度依赖输入身高，低观测段建议对照原片。

[十段原片与 Blender 代理对照](docs/film-preview.jpg)
