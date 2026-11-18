# PenguinHarness Apps

[中文](README.zh.md)

These optional workbenches appear in the PenguinHarness App Center after installation. An administrator installs a package from the plugin marketplace’s GitHub channel. Then a Project member adds its workbench to an Agent from the plugin library.

| Workbench | Contents | Original contribution |
| --- | --- | --- |
| [Kaoyan Flashcards](plugins/kaoyan-flashcards) | Question banks, spaced review and recitation notes for the postgraduate entrance exam | [PenguinHarness #1586](https://github.com/Prism-Shadow/penguin-harness/tree/34b5620de564b09eb8192de9fd3383499109037e/plugins/kaoyan-flashcards) |
| [English Learning Workbench](plugins/english-workbench) | Annotated reading, vocabulary review and speaking practice | [PenguinHarness #1587](https://github.com/Prism-Shadow/penguin-harness/tree/f28cea044d819dfac1041958f4b64581e4547635/plugins/english-workbench) |
| [AI Character Chat](plugins/character-chat) | Four illustrated original characters, character cards and individual memory books | [PenguinHarness #1590](https://github.com/Prism-Shadow/penguin-harness/tree/5aa4789c7f8992bb11ba0be1d4f0e8de1d2d3364/plugins/character-chat) |
| [Perler Studio](plugins/perler-studio) | Image-to-bead charts, palettes and printable patterns | [PenguinHarness #1586](https://github.com/Prism-Shadow/penguin-harness/tree/34b5620de564b09eb8192de9fd3383499109037e/plugins/perler-studio) |
| [Piggy Sticker World](plugins/piglet-stickers) | Sticker scenes, themed challenges and saved compositions | [PenguinHarness #1587](https://github.com/Prism-Shadow/penguin-harness/tree/f28cea044d819dfac1041958f4b64581e4547635/plugins/piglet-stickers) |

The linked source revisions retain contributor history, including Yaowei Zheng (hiyouga) and the original community submissions. Each package keeps its license, acknowledgments, package and workbench IDs. Character Chat needs the host’s [persistent app directories](https://github.com/Prism-Shadow/penguin-harness/pull/1579) and [talk-only Sessions](https://github.com/Prism-Shadow/penguin-harness/pull/1588). Its README explains how existing cards and memories move.

[Arcade](arcade/README.md) collects three more optional workbenches: [Harbor Pulse](plugins/harbor-pulse), [Aurora Drift](plugins/aurora-drift) and [Pelican Post](plugins/pelican-post).

## Packaging

With Node 24 and npm installed, run `npm ci`, then `npm test`. Run `npm run pack:plugins -- character-chat` to pack one plugin, or `npm run pack:plugins` to pack all. Each package supplies a static `ifaces.json` describing its content, its own workbench source and bilingual instructions. The packer prints the npm name, version, path and SHA-512 digest. Its output is the installable `archives/<slug>-<version>.tgz`.

For a new version, commit the archive and register its immutable GitHub raw URL and digest with the [official plugin directory](https://github.com/Prism-Shadow/penguin-harness-plugins). The App verifies the digest when it installs the package. The published directory controls when new entries appear in the marketplace.
