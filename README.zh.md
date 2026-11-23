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
| [全球总决赛主题曲](plugins/worlds-anthems/README.zh.md) | 通过 SoundCloud 播放八首全球总决赛主题曲及官方改编版本 | PenguinHarness 示例任务 |

原始代码中的提交记录保留了 Yaowei Zheng（hiyouga）及社区贡献者的署名。各包保留原有许可证、致谢、包名和工作台标识。角色对话依赖宿主的[应用数据目录](https://github.com/Prism-Shadow/penguin-harness/pull/1579)与[禁用工具的会话](https://github.com/Prism-Shadow/penguin-harness/pull/1588)，旧角色卡和记忆本的迁移方式见其说明。

[街机游戏](arcade/README.md)收录了三款可选工作台：[运输船](plugins/harbor-pulse/README.zh.md)、[极光漂移 3D](plugins/aurora-drift/README.zh.md)和[鹈鹕骑行](plugins/pelican-post/README.zh.md)。

## 打包

使用 Node 24 和 npm 运行 `npm ci`、`npm test`。用 `npm run pack:plugins -- character-chat` 打包一个插件，或用 `npm run pack:plugins` 打包全部插件。每个插件提供声明内容的静态 `ifaces.json`、工作台源文件与双语说明。打包后会显示包名、版本、路径和 SHA-512 摘要。可安装的压缩包位于 `archives/<插件标识>-<版本>.tgz`。拉取请求还会运行 `npm run format:check`、`npm run typecheck` 和 `npm run release:check`，最后一项会把每个插件打包两次，并与已提交的压缩包逐字节比对。

新版本提交压缩包后，将固定提交的 GitHub 下载地址和摘要登记到[官方插件目录](https://github.com/Prism-Shadow/penguin-harness-plugins)。应用安装时校验摘要。目录发布后，新版本就会出现在插件市场。目录固定了每个已提交压缩包的字节，所以压缩包提交后不再改动；插件有改动就发新版本。

## 发布

各插件的版本号互相独立，所以发布以日期命名：标签为 `v<YYYY.MM.DD>`，同一天再次发布时写作 `v<YYYY.MM.DD.N>`。一次发布附带全部插件的压缩包。

1. 把版本号的提升和对应的压缩包合并进 `main`，并把 `CHANGELOG.md` 里的 `## [Unreleased]` 改成发布日期，例如 `## [2026.11.21]`。
2. 在 `main` 的提交上打标签并推送：`git fetch origin && git tag v2026.11.21 origin/main && git push origin v2026.11.21`。
3. [发布工作流](.github/workflows/release.yml)会运行测试、重新构建街机游戏、把每个插件打包两次，并确认两次结果都与已提交的压缩包一致。随后它创建一个 GitHub Release，附上全部插件的压缩包，以 CHANGELOG 中对应的一节作为说明；最后把 npm 上还没有的版本带出处证明（provenance）发布到 npm。只要有哪个版本的字节会与 `archives/` 或 npm 上的不同，工作流就会在发布任何内容之前失败。

Release 附件和 npm 提供的都是 `archives/` 里的同一份字节，因此插件目录的条目可以把它们登记为同一 `integrity` 下的其他渠道。

### 首次发布到 npm

npm 的可信发布（trusted publishing）只能为已经存在的包配置，所以每个包的第一个版本要手工发布：

1. 用有权发布 `@penguinharness` 作用域的账号执行 `npm login`，然后发布已提交的压缩包，而不是重新打包，这样 npm 上的字节才与目录固定的一致：`npm publish archives/<插件标识>-<版本>.tgz --access public`。
2. 在 npmjs.com 打开该包的 **Settings**，添加可信发布者：选择 GitHub Actions，组织填 `Prism-Shadow`，仓库填 `penguin-harness-apps`，工作流填 `release.yml`，环境留空。
3. 所有包都配置好可信发布者后，在 **Settings → Secrets and variables → Actions → Variables** 中把仓库变量 `NPM_TRUSTED_PUBLISHING` 设为 `true`。在此之前，工作流会跳过 npm。变量设为 `true` 后，只要 npm 上还没有某个包，发布就会在发布任何内容之前失败，所以新插件要先手工发布第一个版本，再打标签。
