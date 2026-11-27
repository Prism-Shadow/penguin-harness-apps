# 相机轨迹反求

[English](README.md)

将单目视频或 PNG 序列变成 Blender 相机动画。默认与验收使用最新正式版 Blender 5.3，兼容 4.2 和 4.5 LTS。工作台默认在本地用 CPU 和包内权重处理视频，也可交给项目配置的 Agent 调用本地工具。

## 安装

1. 从插件 tarball 解压，或在本仓库用 Node 24 执行 `npm ci` 和 `npm run build:desks`，得到 `plugins/camera-trajectory`。使用 `penguin plugin install /absolute/path/to/package` 将解压目录或源码包目录注册到 PenguinHarness 的插件库。在目标 Agent 的「插件」中从插件库安装相机轨迹反求，应用中心随后显示工作台。
2. 在应用中心打开工作台，查看「环境自检」。服务端优先使用 `PENGUIN_CAMERA_PYTHON`。默认在 Windows 查找 `python` 再找 `python3`，其他平台顺序相反。支持 Python 3.10 或更高版本。缺少 `numpy` 或 `cv2`，或 OpenCV 低于 4.10 时，点「一键准备环境」。这一步只做一次，只在装依赖时联网。服务端建立该项目的虚拟环境，优先用 `uv`，没有时用 `pip`。通过导入检查后自动保存并启用解释器路径。
3. 如需直接下载 `.blend`，在服务端安装 Blender 5.3。Linux 等平台从服务端 `PATH` 先查找 `blender-5.3`，再查找 `blender`。Windows 依次检查 Program Files 下 Blender 5.3、4.5、4.2 的官方安装目录，再查询 `PATH`。可用 `PENGUIN_CAMERA_BLENDER` 指定可执行文件的绝对路径，修改服务端环境后需重启服务。安装后点「重新检查」。如需在 4.2 或 4.5 LTS 中使用，可用对应版本从同一份轨迹 JSON 导出。

## 使用

打开应用中心中的「相机轨迹反求」，选择「视频」或「PNG 序列 + 内参」。视频支持 MP4、MOV、WebM，上传上限 48 MiB。PNG 序列按文件名的数字顺序处理，需上传 `intrinsics.json`，总上限 1 GiB。两种输入最多 3,000 帧。序列可选「标定 · 动态朝向」「标定 · 历史对照」或「电影跟踪」。填写主体身高，按需勾选「生成 .blend」。

- 点击「反求轨迹」可离线直跑。
- 点击「交给 Agent 运行」会调用项目默认模型。工作台显示 Agent 回复和工具进度，跟踪和导出在宿主本机执行。模型接收任务指令和文件路径。

任务完成后可播放视频或拖动序列帧进度条、点击曲线选时，检查俯视轨迹、背景残差和主体覆盖，再下载轨迹 JSON、Blender 脚本和已生成的 `.blend`。执行脚本时将 `trajectory.json` 放在 `build_camera_in_blender.py` 旁边。[Agent 指令模板](skills/camera-trajectory/SKILL.md)

在工作台底部展开「优化记录」，可查看各轮假设、候选、得分、淘汰结果及冻结留出验收。[原始轮次数据](docs/evolution.json)

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

标定输入默认使用 `views-review`，结合人体地标与背景的完整旋转估计朝向，以动态头胸目标作弱约束。地面几何和足部接触提供米制尺度证据。无内参视频默认使用 `movie`。地标模型在程序化人形上训练。标定帧的默认身高为 1.65 m，可用 `--subject-height` 覆盖。

CPU 容器可在构建完成后断网运行：

```bash
docker build -t camera-trajectory-cpu tools
docker run --rm --network none -v /path/job:/job camera-trajectory-cpu \
  --images /job/images --intrinsics /job/intrinsics.json --out /job/trajectory.json
```

## 指标和局限

| 输入 | 段数 | ATE cm | RotErr ° | RPE | CPU ms/帧 |
|---|---:|---:|---:|---:|---:|
| 历史留出冻结版 | 20 | 20.26 | 2.83 | 2.87 | 5.01 |
| 留出 v2 原标定分支 | 20 | 105.63 | 14.95 | 18.35 | 4.54 |
| 留出 v2 冻结标定分支 | 20 | 44.69 | 8.10 | 6.99 | 7.75 |
| 留出 v2 原电影分支 | 20 | 116.60 | 52.26 | 11.57 | 11.33 |
| 留出 v2 冻结电影分支 | 20 | 176.01 | 38.91 | 18.72 | 4.94 |
| 十段电影切片 | 10 | — | — | — | 4.88–6.54 |

Intel Core Ultra 9 285K 单核、OpenCV 单线程，解码及写盘单列。留出 v2 只验收一次。标定分支的旋转和耗时达标，ATE 超出 20 cm 目标。未标定电影分支仍有距离、快速运镜和构图误差，十段电影中部分构图退化。

[原片与 Blender 代理的历史对照](docs/film-preview.jpg)
