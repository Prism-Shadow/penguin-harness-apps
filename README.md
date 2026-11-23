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
| [Study Map](plugins/study-map) | Explore a repository or reading as a diagram with clickable source citations | [Archify](https://github.com/tt-a1i/archify) |
| [Worlds Anthems](plugins/worlds-anthems) | Play eight Worlds songs and official arrangements through SoundCloud | PenguinHarness example task |

The linked source revisions retain contributor history, including Yaowei Zheng (hiyouga) and the original community submissions. Each package keeps its license, acknowledgments, package and workbench IDs. Character Chat needs the host’s [persistent app directories](https://github.com/Prism-Shadow/penguin-harness/pull/1579) and [talk-only Sessions](https://github.com/Prism-Shadow/penguin-harness/pull/1588). Its README explains how existing cards and memories move.

[Arcade](arcade/README.md) collects three more optional workbenches: [Transport Ship](plugins/harbor-pulse), [Aurora Drift 3D](plugins/aurora-drift) and [Pelican Bike](plugins/pelican-post).

## Packaging

With Node 24 and npm installed, run `npm ci`, then `npm test`. Run `npm run pack:plugins -- character-chat` to pack one plugin, or `npm run pack:plugins` to pack all. Each package supplies a static `ifaces.json` describing its content, its own workbench source and bilingual instructions. The packer prints the npm name, version, path and SHA-512 digest. Its output is the installable `archives/<slug>-<version>.tgz`. Pull requests also run `npm run format:check`, `npm run typecheck` and `npm run release:check`. The last one packs every plugin twice and compares both packs with the committed archives.

For a new version, commit the archive and register its immutable GitHub raw URL and digest with the [official plugin directory](https://github.com/Prism-Shadow/penguin-harness-plugins). The App verifies the digest when it installs the package. The published directory controls when new entries appear in the marketplace. A committed archive never changes, because the directory pins its bytes. A plugin that changes gets a new version.

## Releasing

Plugins keep their own versions, so a release is named after its date. Its tag is `v<YYYY.MM.DD>`, or `v<YYYY.MM.DD.N>` for another release on the same day. One release carries every plugin's tarball.

1. Merge the version bumps and their archives into `main`. In `CHANGELOG.md`, rename `## [Unreleased]` to the release date, for example `## [2026.11.21]`.
2. Tag the commit on `main` and push the tag: `git fetch origin && git tag v2026.11.21 origin/main && git push origin v2026.11.21`.
3. The [release workflow](.github/workflows/release.yml) runs the tests, rebuilds the arcade games, packs every plugin twice and checks that both packs equal the committed archives. It then creates one GitHub release with every plugin's tarball and the CHANGELOG section as its notes. Finally it publishes each version that npm does not have yet, with provenance. If a version would get different bytes from those in `archives/` or on npm, the workflow fails before it publishes anything.

The release assets and npm serve the bytes in `archives/`, so a directory entry can list them as further channels under the same `integrity`.

### First npm publish of a package

Trusted publishing can only be set up for a package that already exists on npm, so the first version of each package is published by hand:

1. Run `npm login` with an account that can publish to the `@penguinharness` scope. Then publish the committed archive rather than a fresh pack, so that npm has the bytes the directory pins: `npm publish archives/<slug>-<version>.tgz --access public`.
2. On npmjs.com, open the package's **Settings** and add a trusted publisher. Choose GitHub Actions, organization `Prism-Shadow`, repository `penguin-harness-apps` and workflow `release.yml`, and leave the environment empty.
3. When every package has a trusted publisher, set the repository variable `NPM_TRUSTED_PUBLISHING` to `true` under **Settings → Secrets and variables → Actions → Variables**. Until then the workflow skips npm. Once the variable is `true`, a release fails before publishing anything if npm does not know one of the packages, so publish a new plugin's first version by hand before you tag.
