# 相机轨迹反求

[English](README.md)

将一段单目视频变成可以在 Blender 4.2 使用的相机动画。工作台默认在本地用 CPU 和包内权重处理视频，也可交给项目配置的 Agent 调用本地工具。

## 安装

1. 从插件 tarball 解压，或在本仓库用 Node 24 执行 `npm ci` 和 `npm run build:desks`，得到 `plugins/camera-trajectory`。使用 `penguin plugin install /absolute/path/to/package` 将解压目录或源码包目录注册到 PenguinHarness 的插件库。在目标 Agent 的「插件」中从插件库安装相机轨迹反求，应用中心随后显示工作台。
2. 在应用中心打开工作台，查看「环境自检」。服务端从 `PENGUIN_CAMERA_PYTHON` 或 `python3` 检查 Python，推荐 Python 3.13。缺少 `numpy` 或 `cv2` 时，点「一键准备环境」。这一步只做一次，只在装依赖时联网。服务端建立该项目的虚拟环境，优先用 `uv`，没有时用 `pip`。通过导入检查后自动保存并启用解释器路径。
3. 如需直接下载 `.blend`，在服务端安装 Blender 4.2。可在启动服务时将 `PENGUIN_CAMERA_BLENDER` 设为 Blender 可执行文件的绝对路径，默认从 `PATH` 查找 `blender`。安装后点「重新检查」。轨迹 JSON 和可在 Blender 中执行的脚本可独立下载。

## 使用

打开应用中心中的「相机轨迹反求」，选择 MP4、MOV 或 WebM。上传上限 48 MiB，最多 3,000 帧。填写主体身高，按需勾选「生成 .blend」。

- 点击「反求轨迹」可离线直跑。
- 点击「交给 Agent 运行」会调用项目默认模型。工作台显示 Agent 回复和工具进度，跟踪和导出在宿主本机执行。模型接收任务指令和文件路径。

任务完成后可播放视频、点击曲线选时，检查俯视轨迹、背景残差和主体覆盖，再下载轨迹 JSON、Blender 脚本和已生成的 `.blend`。执行脚本时将 `trajectory.json` 放在 `build_camera_in_blender.py` 旁边。[Agent 指令模板](skills/camera-trajectory/SKILL.md)

### 命令行

命令行运行可复用自检中显示的解释器，或在独立虚拟环境用 `python -m pip install -r tools/requirements.txt` 安装两个依赖。`cv2` 由 `opencv-python-headless` 提供。

```bash
CUDA_VISIBLE_DEVICES="" python tools/track.py \
  --images /path/images --intrinsics /path/intrinsics.json --out /path/trajectory.json
python tools/verify_trajectory.py /path/trajectory.json
blender -b --python-exit-code 1 -P tools/blender_export.py -- \
  --trajectory /path/trajectory.json --blend /path/camera.blend
```

视频输入使用 `--video /path/shot.mp4`，可与 `--intrinsics` 同用。内参包括像素尺寸、`fx/fy/cx/cy` 和 `fps`。逐帧输出米制平移和 `wxyz` 单位四元数，使用 Blender Z 向上、相机局部 -Z 朝前、人物根节点为原点的坐标约定。

标定帧序列默认用二维人体地标估计骨盆航向，并在地面证据充足时用消失点、地面单应和足部接触约束姿态与尺度。地标模型在程序化人形上训练。标定帧的默认身高为 1.65 m，可用 `--subject-height` 覆盖。

CPU 容器可在构建完成后断网运行：

```bash
docker build -t camera-trajectory-cpu tools
docker run --rm --network none -v /path/job:/job camera-trajectory-cpu \
  --images /job/images --intrinsics /job/intrinsics.json --out /job/trajectory.json
```

## 指标和局限

| 输入 | 段数 | ATE cm | RotErr ° | CPU ms/帧 |
|---|---:|---:|---:|---:|
| 标定合成训练集 | 65 | 13.41 | 2.00 | 5.04 |
| 独立合成留出集，历史几何基线 | 20 | 69.91 | 37.98 | 3.72 |
| 独立合成留出集，冻结版 | 20 | 20.26 | 2.83 | 5.01 |
| 电影切片 | 10 | — | — | 11.88–14.95 |

延迟在 Intel Core Ultra 9 285K 的单核上测量，含前景、背景几何和时序处理，解码和输出写盘单列。冻结后验收一次留出，ATE 超过 20 cm 门槛 0.26 cm，RotErr 和 CPU 耗时通过。十段电影的轨迹和主体观测逐帧一致，四段符合主要方向与构图、五段部分符合、一段文件名标注与画面不符。强透视、近景缺少骨盆或内参未知时，方位角和距离仍可能漂移。

[十段原片与 Blender 代理对照](docs/film-preview.jpg)
