# 遥测与外传检测 (Telemetry Inspector)

**遥测与外传检测**（`@penguinharness/privacy-guard`）是一款运行在 macOS 本地的桌面应用隐私与外传检测工作台。从 Agent 的应用中心打开后，无需配置抓包代理或安装根证书，即可在本地直接拆解应用包并监测实时网络连接。

## 主要功能

- **三类数据外传行为分级核查**：
  1. **统计数据遥测（01 / Telemetry）**：识别应用内嵌的 PostHog、Sentry、Mixpanel、Amplitude、Segment、VS Code 遥测、AppCenter、Datadog、神策、Bugly 等统计与崩溃上报组件，以及 `product.json` 中默认开启的 `enableTelemetry` 开关。
  2. **会话历史上传（02 / Session History）**：排查是否存在将本地多轮对话记录、提示词同步或回传至远端服务器的接口特征。
  3. **本地代码库上传（03 / Codebase Exfiltration）**：重点预警后台静默遍历、索引或打包上传本地代码仓库及调用系统钥匙串（`keytar`）的高危特征。
- **静态应用包解包与权限审计**：支持一键扫描 `/Applications`、`~/Applications` 及任意自定义 `.app` 路径，自动解析 `Info.plist` 敏感权限声明（麦克风、摄像头、录屏、桌面/文稿/下载目录访问等）、Electron 未打包目录及 `.asar` 归档头部与主进程特征。
- **实时联网与上传流量监控**：结合 macOS 原生 `lsof -i` 与 `nettop`，展示当前活跃外部连接与各进程累计上传/下载字节数，及时发现后台异常上行流量。
- **三类遥测风险标本对照**：内置两份典型特征标本（轻度统计遥测 vs. 静默上传会话历史与本地代码库），直观呈现风险边界与证据链。
- **一键防护规则、报告导出与 AI 顾问解读**：为检出遥测域名的应用生成 `/etc/hosts` 屏蔽规则与终端防火墙命令，支持导出完整 Markdown 体检报告（`GET /export-report`），并可调用禁用工具（`deny-all`）的 PenguinHarness 会话生成通俗易懂的解读建议。

## 运行范围与隐私说明

所有 `.asar` 解包、配置文件审计与 `lsof`/`nettop` 流量采样均在本地只读完成，不向任何外部服务器发送数据。仅在你主动点击「请 AI 深度解读此应用」时，工作台才会将该应用的体检摘要发往当前 Agent 配置的对话模型。
