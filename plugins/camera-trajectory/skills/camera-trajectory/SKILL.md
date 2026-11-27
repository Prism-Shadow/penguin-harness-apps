---
name: camera-trajectory
description: 从视频或标定帧序列以离线 CPU 反求相对主体骨盆的相机轨迹，并校验、导出到 Blender。
version: 2026.11.27.5
---

# 相机轨迹反求

在应用中心打开「相机轨迹反求」，选一段视频或 PNG 序列与内参，并填写主体身高。「反求轨迹」默认在工作台用本地工具跟踪、校验和导出。「交给 Agent 运行」使用项目默认模型创建独立 Session，由 Agent 在本机调用相同的工具。勾选「生成 .blend」让本次任务完成时即可下载，两条路径共用预览、历史和下载。

「环境自检」显示 Python、numpy、cv2 和 Blender 的可用性。缺少 Python 依赖时点「一键准备环境」，这一步只做一次，只在装依赖时联网。之后两条路径都使用工作台保存的项目解释器。缺 Blender 时可在服务端安装后点「重新检查」，或先导出 JSON 与脚本。

## 工作台交给 Agent 的指令模板

工作台填入上传后实际的视频绝对路径、经校验的身高和独立输出目录。每个命令数组的第一项是可执行文件，后续各项是独立的参数。以 `output` 为工作目录，用本机 shell 规则正确引用路径。

```text
完成工作台的 camera-trajectory 任务。调用本机 exec_command 执行命令并检查结果。
{
  "video": "<VIDEO>",
  "height": <HEIGHT_M>,
  "output": "<OUTPUT_DIR>",
  "trajectory": "<OUTPUT_DIR>/trajectory.json",
  "blend": "<OUTPUT_DIR>/camera.blend",
  "maxFrames": 3000,
  "track": ["<PYTHON>", "-B", "<TOOLS>/track.py", "--video", "<VIDEO>",
            "--subject-height", "<HEIGHT_M>", "--max-frames", "3001",
            "--out", "<OUTPUT_DIR>/trajectory.json"],
  "verify": ["<PYTHON>", "-B", "<TOOLS>/verify_trajectory.py", "<OUTPUT_DIR>/trajectory.json"],
  "export": ["<BLENDER>", "-b", "--threads", "2", "--python-exit-code", "1",
             "-P", "<TOOLS>/blender_export.py", "--", "--trajectory",
             "<OUTPUT_DIR>/trajectory.json", "--blend", "<OUTPUT_DIR>/camera.blend"]
}
保留 Python 的 -B 参数。执行 track 时设置 CUDA_VISIBLE_DEVICES 为空，OPENBLAS_NUM_THREADS 和 OMP_NUM_THREADS 为 1。
按顺序执行已提供的 track、verify、export。track 省略时复用已有轨迹。
verify 成功且 frames 不超过 maxFrames 才继续执行 export。
仅处理指定的本机路径，保持原视频和插件完整。视频在本地处理，不上传或读入模型。
工具返回运行中的进程时等待它完成。结束后回复实际产物路径；失败时回复工具错误。
```

PNG 序列任务将 `video` 替换为 `images` 与 `intrinsics`，对应命令参数为 `--images <IMAGES_DIR> --intrinsics <JSON> --variant <VARIANT>`。保持原始帧和内参完整，文件内容留在本机。

仅请求 JSON 时省略 `blend` 和 `export`。为已有轨迹补导出时省略 `track`。工作台先调用 `host.createSession` 和 `host.subscribe`，随后通过 `host.run` 发送上述文本并回显事件。会话结束后读 `host.sessionResult`，工作台独立验收轨迹文件，再发布下载。

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

4. 如果 Blender 可执行文件缺失，保留已校验的 JSON，使用脚本在装有 Blender 5.3 的机器中导入，也兼容 4.2 和 4.5 LTS。工作台默认从服务端 `PATH` 查找 `blender-5.3`，然后查找 `blender`。配置 `PENGUIN_CAMERA_BLENDER` 的绝对路径可覆盖查找结果。如果轨迹主体丢失，优先缩短到可见的单镜头、补准确内参与身高，然后重新运行。若旋转或构图仍漂移，注明低置信时间段后交给使用者复核。标定帧序列默认用 `views-review` 融合动态人体地标和背景几何，参考身高 1.65 m。用 `--variant smooth` 可复现纯几何基线。
