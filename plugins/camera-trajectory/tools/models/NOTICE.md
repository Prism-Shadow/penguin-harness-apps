# 第三方姿态权重

权重来自 OpenCV Zoo 的 MediaPipe 目录，按 Apache-2.0 分发。

- 人体检测，3,482,053 字节，SHA-256 `c5ed8c00c028b98e5d2c55b920a6e975af6c4cd538cfeea7c054f4fbbd8b9075`。[来源](https://github.com/opencv/opencv_zoo/tree/main/models/person_detection_mediapipe)
- 姿态估计，1,694,896 字节，SHA-256 `1848ea80f657f4620e0de160594f598ed8107c9e7785d0be74f65cf15aa6deb1`。[来源](https://github.com/opencv/opencv_zoo/tree/main/models/pose_estimation_mediapipe)

推理从包内加载，OpenCV DNN 显式使用 CPU。

## 标定素模人体地标

`pelvis-landmarks.onnx` 与 `pelvis-landmarks-views.onnx` 使用本工作区的程序化 Blender 训练数据训练，随插件按 Apache-2.0 分发。这两个历史权重保留用于显式对照。新默认权重 `pelvis-landmarks-review.onnx` 增加动态头胸目标和朝向偏移的输出，由 `eval/train_review_pose.py` 复现。模型输入为双尺度人物 RGB 裁剪。

当前标定权重的独立平移头由 `eval/train_translation_head.py` 在冻结原地标与旋转权重的前提下拟合。
`proxy-presence.onnx` 使用灰度人体裁剪和 Blender 实际遮挡标注，由 `eval/train_occlusion.py` 拟合，随插件按 Apache-2.0 分发。
