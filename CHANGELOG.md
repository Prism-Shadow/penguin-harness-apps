# Changelog

Each release is tagged with its date, `v<YYYY.MM.DD>`, and has a section here headed by that date without the `v`: `## [2026.11.21]` for `v2026.11.21`. A second release on the same day adds a counter, as in `v2026.11.21.2` and `## [2026.11.21.2]`. The release workflow publishes the section as the release notes and appends the list of package tarballs the release carries. Within a section, give each plugin with a new version a `### @penguinharness/<slug> <version>` subsection.

Notes for the next release collect under `## [Unreleased]`. Rename that heading to the release's date before tagging.

## [Unreleased]

The first release from this repository. Every plugin is published to npm at its current version, and the release carries the same tarballs. Their bytes are those of `archives/`, which the plugin index already lists.

### @penguinharness/harbor-pulse 1.2.0

Transport Ship plays in one click. The workbench opens the author’s own online game, with mouse capture, and still contains no game code. When the game’s website cannot be reached, the workbench says so and offers to try again, open the game in the browser, or play offline. Playing offline from a local game file moves behind the **Play offline: choose a local file** link, and a remembered file opens with **Play offline**.
