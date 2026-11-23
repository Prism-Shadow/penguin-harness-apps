# 口袋街机厅

在卡带架上挑选十款原创街机与解谜游戏。每台街机都有自己的规则、计分和结算画面，支持键盘、屏幕按键与触摸。

管理员安装这个可选插件后，Project 成员可以为 Agent 添加工作台。在浏览器中离线游玩时，解包后打开 `workbenches/pocket-arcade/ui/index.html`。也可直接打开每款游戏自己的 `games/<name>/index.html`。

修改 `src/` 中的机台、目录或游戏源码后，在仓库根目录运行 `node plugins/pocket-arcade/src/build.mjs` 重新生成独立页面。
