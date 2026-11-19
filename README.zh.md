# PenguinHarness 工作台

[English](README.md)

这里的工作台都按需安装。管理员在插件市场通过 GitHub 渠道安装软件包，项目成员再从插件库把工作台添加到 Agent，即可从应用中心打开。

| 工作台 | 用途 | 原始贡献 |
| --- | --- | --- |
| [考研记忆卡](plugins/kaoyan-flashcards/README.zh.md) | 考研题库、间隔复习与背诵资料 | [PenguinHarness #1586](https://github.com/Prism-Shadow/penguin-harness/pull/1586) |
| [英语学习工作台](plugins/english-workbench/README.zh.md) | 点读、收藏词句、间隔复习和跟读练习 | [PenguinHarness #1587](https://github.com/Prism-Shadow/penguin-harness/pull/1587) |
| [AI 角色对话](plugins/character-chat/README.zh.md) | 与四位原创立绘角色聊天，编辑角色卡和各自的记忆本 | [PenguinHarness #1590](https://github.com/Prism-Shadow/penguin-harness/pull/1590) |
| [拼豆创作工作台](plugins/perler-studio/README.zh.md) | 把图片转为拼豆图纸，编辑色卡，导出或打印 | [PenguinHarness #1586](https://github.com/Prism-Shadow/penguin-harness/pull/1586) |
| [猪猪的摸鱼小世界](plugins/piglet-stickers/README.zh.md) | 布置贴纸场景，挑战主题关卡，保存自己的作品 | [PenguinHarness #1587](https://github.com/Prism-Shadow/penguin-harness/pull/1587) |
| [学习框图](plugins/study-map/README.zh.md) | 把代码或文档变成可逐行核对的交互框图 | [Archify](https://github.com/tt-a1i/archify) |

原始代码中的提交记录保留了 Yaowei Zheng（hiyouga）及社区贡献者的署名。各包保留原有许可证、致谢、包名和工作台标识。角色对话依赖宿主的[应用数据目录](https://github.com/Prism-Shadow/penguin-harness/pull/1579)与[禁用工具的会话](https://github.com/Prism-Shadow/penguin-harness/pull/1588)，旧角色卡和记忆本的迁移方式见其说明。

[街机游戏](arcade/README.md)收录了三款可选工作台：[运输船](plugins/harbor-pulse/README.zh.md)、[极光漂移 3D](plugins/aurora-drift/README.zh.md)和[鹈鹕骑行](plugins/pelican-post/README.zh.md)。

## 打包

使用 Node 24 和 npm 运行 `npm ci`、`npm test`。用 `npm run pack:plugins -- character-chat` 打包一个插件，或用 `npm run pack:plugins` 打包全部插件。每个插件提供声明内容的静态 `ifaces.json`、工作台源文件与双语说明。打包后会显示包名、版本、路径和 SHA-512 摘要。可安装的压缩包位于 `archives/<插件标识>-<版本>.tgz`。

新版本提交压缩包后，将固定提交的 GitHub 下载地址和摘要登记到[官方插件目录](https://github.com/Prism-Shadow/penguin-harness-plugins)。应用安装时校验摘要。目录发布后，新版本就会出现在插件市场。
