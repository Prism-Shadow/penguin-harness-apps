# 第三方姿态权重

权重来自 OpenCV Zoo 的 MediaPipe 和 NanoDet 目录，按 Apache-2.0 分发。

- 人体检测，3,482,053 字节，SHA-256 `c5ed8c00c028b98e5d2c55b920a6e975af6c4cd538cfeea7c054f4fbbd8b9075`。[来源](https://github.com/opencv/opencv_zoo/tree/main/models/person_detection_mediapipe)
- 姿态估计，1,694,896 字节，SHA-256 `1848ea80f657f4620e0de160594f598ed8107c9e7785d0be74f65cf15aa6deb1`。[来源](https://github.com/opencv/opencv_zoo/tree/main/models/pose_estimation_mediapipe)

- NanoDet 人框，1,123,958 字节，SHA-256 `8a2c877cc6f09e7dfac7a9066e33ee5ae68de530b3b994f6ee9125cff6e34d3f`。[来源](https://github.com/opencv/opencv_zoo/tree/main/models/object_detection_nanodet)

推理从包内加载，OpenCV DNN 显式使用 CPU。

## 标定素模人体地标

`pelvis-landmarks.onnx` 与 `pelvis-landmarks-views.onnx` 使用本工作区的程序化 Blender 训练数据训练，随插件按 Apache-2.0 分发。前者用于训练折消融，后者用于标定图像默认路径。两者都小于 0.81 MB。训练由 `eval/train_precision_pose.py` 复现，输入双尺度人物 RGB 裁剪，输出 13 个二维地标及朝向、俯仰、距离先验。
