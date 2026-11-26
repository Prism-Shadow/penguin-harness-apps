# 第三方姿态权重

权重来自 OpenCV Zoo 的 MediaPipe 和 NanoDet 目录，按 Apache-2.0 分发。

- 人体检测，3,482,053 字节，SHA-256 `c5ed8c00c028b98e5d2c55b920a6e975af6c4cd538cfeea7c054f4fbbd8b9075`。[来源](https://github.com/opencv/opencv_zoo/tree/main/models/person_detection_mediapipe)
- 姿态估计，1,694,896 字节，SHA-256 `1848ea80f657f4620e0de160594f598ed8107c9e7785d0be74f65cf15aa6deb1`。[来源](https://github.com/opencv/opencv_zoo/tree/main/models/pose_estimation_mediapipe)

- NanoDet 人框，1,123,958 字节，SHA-256 `8a2c877cc6f09e7dfac7a9066e33ee5ae68de530b3b994f6ee9125cff6e34d3f`。[来源](https://github.com/opencv/opencv_zoo/tree/main/models/object_detection_nanodet)

推理从包内加载，OpenCV DNN 显式使用 CPU。
