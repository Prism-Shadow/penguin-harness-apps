# Changelog

Each release is tagged with its date, `v<YYYY.MM.DD>`, and has a section here headed by that date without the `v`: `## [2026.11.21]` for `v2026.11.21`. A second release on the same day adds a counter, as in `v2026.11.21.2` and `## [2026.11.21.2]`. The release workflow publishes the section as the release notes and appends the list of package tarballs the release carries. Within a section, give each plugin with a new version a `### @penguinharness/<slug> <version>` subsection.

Notes for the next release collect under `## [Unreleased]`. Rename that heading to the release's date before tagging.

## [Unreleased]

The first release from this repository. Every plugin is published to npm at its current version, and the release carries the same tarballs. Their bytes are those of `archives/`, which the plugin index already lists.

### @penguinharness/harbor-pulse 1.2.0

Transport Ship plays in one click. The workbench opens the author’s own online game, with mouse capture, and still contains no game code. When the game’s website cannot be reached, the workbench says so and offers to try again, open the game in the browser, or play offline. Playing offline from a local game file moves behind the **Play offline: choose a local file** link, and a remembered file opens with **Play offline**.

### @penguinharness/study-map 1.1.0

- Source lines are readable inside PenguinHarness, and the page and its diagram follow the app's light or dark look instead of only the system's.
- The example says what to do first, and **Import** is the main button. **Import** also takes pasted text.
- A failed import reopens the dialog with what you entered and the reason. Pressing Enter in the address field no longer reopens the dialog over the import. Addresses without `https://`, ending in `.git` or pointing into the tree are accepted.
- The note about files left out appears only when readable files did not fit. A complete study shows its file count.
- Documents wrap in the source pane and their nodes are described as sections. AI and error messages use everyday words and name the Models page. **Remove** sits beside the **Studies** list.

### @penguinharness/english-workbench 0.3.0

- Annotated words are boxed in the text as the reader promises, including inflected forms and phrases, and any word of a boxed phrase opens the phrase's note.
- An empty library offers **Start reading**, and an empty review links back to reading and says when the next word comes up.
- A browser without an English voice says so once, instead of asking you to click again.
- The lesson picture on **Today** is shaded in dark mode.
