# Arcade showcases

Each game is an independent, optional PenguinHarness workbench. Its entry page, controls, canvas scene and audio run locally in the browser. The interface follows the host’s language. The best score and sound preference belong to the current browser.

| Game | Reference case | Play |
| --- | --- | --- |
| [Harbor Pulse](../plugins/harbor-pulse/) · 港湾脉冲 | [Cargo deck](https://github.com/riba2534/claude-opus-5-5-demo/tree/54adc1fb64155f9dd7c1c90ecae7b8185ac540b8/cf-transport-ship) | Tag moving buoys and build a three-hit streak. [Hear the sound check](../previews/harbor-pulse/sound-check.wav) |
| [Aurora Drift](../plugins/aurora-drift/) · 极光漂移 | [Drift racing](https://github.com/riba2534/claude-opus-5-5-demo/tree/54adc1fb64155f9dd7c1c90ecae7b8185ac540b8/qq-speed) | Charge a drift and pass through gates on a three-lap night circuit. |
| [Pelican Post](../plugins/pelican-post/) · 鹈鹕邮路 | [Seaside cycling](https://github.com/riba2534/claude-opus-5-5-demo/tree/54adc1fb64155f9dd7c1c90ecae7b8185ac540b8/pelican-bike) | Collect letters, hop crates and deliver a full satchel to the postbox. |

All game code, illustrations, geometry, icons and audio are original to these packages and licensed under Apache-2.0. Each package has an English and a Chinese README with its controls and reference.

The game-specific sources live in each workbench’s `ui/game.js`. Edit shared controls and layout under `arcade/shared/`, then run `node arcade/build.mjs` at the repository root to refresh the standalone packages. Run `npm test` to check the scoring, rounds and audio. `node arcade/sound-check.mjs` renders the same stereo sequence as Harbor Pulse’s sound-check button.
