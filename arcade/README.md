# Arcade games / 游戏工作台

| App Center | Game / 游戏 | Availability / 如何游玩 |
| --- | --- | --- |
| [Transport Ship · 运输船](../plugins/harbor-pulse/) | The original 3D team game on the cargo deck. / 原版 3D 运输船团队游戏。 | Downloads the original once from the author, then plays offline. / 首次从作者网站下载，之后即可离线游玩。 |
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

Transport Ship fetches the original single-file game from the [author’s site](https://claude-opus-5-5-cf-transport-ship.pages.dev/) on first launch. The workbench checks its SHA-256 against the build of the [pinned source](https://github.com/riba2534/claude-opus-5-5-demo/tree/54adc1fb64155f9dd7c1c90ecae7b8185ac540b8/cf-transport-ship), saves it in this browser’s site data and applies its local sound controls. Later launches play from that copy. A game HTML you previously imported still opens first.

To play on a computer that has no internet connection even on first launch, prepare a private workbench on a connected computer from this repository:

```sh
python3 arcade/transport/pack-workbench.py --from-author Transport-Ship.zip
```

Transfer the ZIP to the offline computer. In the Agent’s **Settings → Workbenches → Import workbench**, select the ZIP, then open **Transport Ship** in the App Center. The ZIP contains your verified copy and the sound controls. To package a different self-contained HTML that you already have, replace `--from-author` with its file path. For a source build, `node arcade/audio/local-transport.mjs /path/to/cf-transport-ship /path/to/Transport-Ship.html` adds the sound controls before you import or package it.
