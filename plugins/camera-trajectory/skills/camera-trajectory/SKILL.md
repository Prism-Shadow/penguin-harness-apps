---
name: camera-trajectory
description: 从视频或标定帧序列以离线 CPU 反求相对主体骨盆的相机轨迹，并校验、导出到 Blender。
version: 2026.11.27.2
---

# 相机轨迹反求

在应用中心打开「相机轨迹反求」，选一段视频并填写主体身高，再点击「反求轨迹」。工作台用本地任务循环依次处理跟踪、校验和可选 Blender 导出。读取分析结果与预览使用同一工作台历史记录。

## 命令行输入

从已安装包的根目录运行，选用已安装 `tools/requirements.txt` 的本地 Python。把输入放在本机，输出放在可写任务目录。

```bash
CUDA_VISIBLE_DEVICES="" python tools/track.py \
  --video /path/shot.mp4 --subject-height 1.74 --out /path/job/trajectory.json
```

标定帧序列用 `--images /path/images --intrinsics /path/intrinsics.json` 代替 `--video`。帧文件名按时间排序。内参 JSON 写入 `width`、`height`、`fx`、`fy`、`cx`、`cy`、`fps`。视频也可用 `--intrinsics` 覆盖估计值。优先选择连续单镜头，并按可见主体填写身高以锚定米制尺度。

## 校验和导出

1. 执行 `python tools/verify_trajectory.py /path/job/trajectory.json`。检查帧数、时间戳、单位四元数、背景残差、主体观测覆盖和旋转高频能量。电影无真值时，自检指标用于排序和检查低置信段。
2. 先在工作台同步检查视频、俯视路径和仰角曲线。特别检查切镜、主体遮挡、身体裁切和锐利扫镜附近。
3. 工作台可直接下载 JSON、`build_camera_in_blender.py` 及可选 `.blend`。将 JSON 和脚本放在同一目录，从 Blender 的 Scripting 工作区打开脚本并执行 Run Script。命令行也可运行：

   ```bash
   blender -b --python-exit-code 1 -P tools/blender_export.py -- \
     --trajectory /path/job/trajectory.json --blend /path/job/camera.blend
   ```

4. 如果 Blender 可执行文件缺失，保留已校验的 JSON，使用脚本在装有 Blender 4.2 的机器中导入。如果轨迹主体丢失，优先缩短到可见的单镜头、补准确内参与身高，然后重新运行。若旋转或构图仍漂移，注明低置信时间段后交给使用者复核。标定帧序列默认用人体地标和地面几何，参考身高 1.65 m。用 `--variant smooth` 可复现纯几何基线。
