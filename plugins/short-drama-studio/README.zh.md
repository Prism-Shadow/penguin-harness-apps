# AI 短剧分镜与视频工作台

面向 PenguinHarness 的 AI 短剧分镜拆解、单镜头无损重做与成片合成工作台，融合《DeepSeek Harness 实战》第 8 章[《纸箱小屋》](https://dshbook.penguin.ooo/chapter8/)工程范式与 [`drama-skills`](https://github.com/zenstory-ai/drama-skills) 十二阶段短剧方法论。

从智能体的应用中心打开「**AI 短剧分镜与视频工作台**」即可体验全流程闭环：

1. **AI 剧本拆解与可编辑分镜表**：支持一键加载内置《纸箱小屋》（EP001《雨夜来客》）或导入自定义单集剧本，调用 PenguinHarness Agent 或内置结构化拆解引擎生成**角色设定卡（含跨镜外貌一致性锚点与造型变体）**、**场景光影设定**与**逐镜分镜表**（含镜头号、出场角色、场景、景别/运镜/起止动作描述、画面字幕与文生视频 Prompt）。所有字段均可直接在界面修改，并与对应视频片段绑定。
2. **真实视频生成接入与单镜头无损重做**：支持通过环境变量或界面配置接入**火山方舟 Seedance**（`ARK_API_KEY` + `SEEDANCE_MODEL`）、**MiniMax 海螺视频 H3**（`MINIMAX_API_KEY` + `MINIMAX_VIDEO_MODEL`）、OpenAI 兼容视频接口，以及内置 **FFmpeg 动态镜头渲染引擎**。支持确认后逐镜生成与失败单独重试；当修改单个镜头的 Prompt 并重新生成时，仅更新该镜头对应的 `.mp4` 文件与版本号，其余已生成镜头的文件哈希与时间轴顺序保持原样，不重跑整集。
3. **时间轴按序连播与 MP4 成片导出**：支持按分镜时间轴顺序连播预览，调用 FFmpeg 将全部镜头无损拼接为标准可播放的 `.mp4` 成片并一键下载，同时留存每次单镜头重做与成片导出的校验记录。

[English](README.md)
