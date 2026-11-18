# Arcade games / 游戏工作台

| App Center | Game / 游戏 | Availability / 如何游玩 |
| --- | --- | --- |
| [Transport Ship · 运输船](../plugins/harbor-pulse/) | The original 3D team game on the cargo deck. / 原版 3D 运输船团队游戏。 | Opens the [author’s game](https://claude-opus-5-5-cf-transport-ship.pages.dev/). Import your sound-fixed HTML for the revised audio offline. / 作者托管版使用原声，导入本地音效修复版 HTML 即可离线游玩修复版。 |
| [Aurora Drift 3D · 极光漂移 3D](../plugins/aurora-drift/) | Four tracks, kart selection, AI racers, drift, nitro and item races. / 四条赛道、赛车选择、AI 对手、漂移、氮气与道具赛。 | The game runs offline after installation. / 安装后离线可玩。 |
| [Pelican Bike · 鹈鹕骑行](../plugins/pelican-post/) | Cycle, catch fish, shift gears and switch cameras on the coastal road. / 沿海骑行、抓鱼、变速，切换不同运镜。 | The game runs offline after installation. / 安装后离线可玩。 |

[Original idea by riba2534 · 创意来自 riba2534](https://x.com/riba2534/status/2102657259197403463). The original [game sources](https://github.com/riba2534/claude-opus-5-5-demo/tree/54adc1fb64155f9dd7c1c90ecae7b8185ac540b8), in-game links and authorship are retained. See the [upstream licenses](upstream/README.md) and the distributed packages’ notices.

### Building the bundled games

Use Node 24 and run the following commands at the repository root. The two upstream projects use different Three.js revisions. Each lockfile pins the revision used to build its game.

```sh
npm ci
npm ci --prefix arcade/upstream/qq-speed --omit=dev
npm ci --prefix arcade/upstream/pelican-bike --omit=dev
node arcade/build.mjs
npm test
npm run pack:plugins -- harbor-pulse aurora-drift pelican-post
```

The Transport Ship plugin includes a launcher and a local-file picker. If you have built the original game yourself, run `node arcade/audio/local-transport.mjs /path/to/cf-transport-ship /path/to/Transport-Ship.html` to apply the workbench audio adapter to your local build. Open that HTML directly, or choose **Open local HTML** in Transport Ship. The imported file stays in that browser.
