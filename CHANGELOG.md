# Changelog

Release tags group the plugin versions listed in each section. A GitHub prerelease uses `vYYYY.MM.DD-rc.N` and attaches the installable tarballs and their SHA-512 catalog.

## [Unreleased]

### @penguinharness/worlds-anthems 0.1.0-rc.1

Worlds Anthems is an optional player for eight League of Legends Worlds tracks. Its season playlist drives the official SoundCloud widget, with transport, volume, seeking and direct links to each recording.

### @penguinharness/midnight-rhythm 0.1.0-rc.1

Midnight Rhythm adds an optional two-lane penguin rhythm game with the original instrumental track *Last Train After Midnight*. Play with the keyboard or touch pads, pause and resume, and replay the track after the scorecard.

## [2026.11.23-rc.1]

This first GitHub prerelease includes the optional workbench packages below. Each tarball matches the SHA-512 digest in the attached `packages.json`.

### @penguinharness/harbor-pulse 1.2.0

Transport Ship plays in one click. The workbench opens the author’s own online game, with mouse capture, and still contains no game code. When the game’s website cannot be reached, the workbench says so and offers to try again, open the game in the browser, or play offline. Playing offline from a local game file moves behind the **Play offline: choose a local file** link, and a remembered file opens with **Play offline**.

### @penguinharness/kaoyan-flashcards 0.2.20

During a quiz, Enter and Space activate the focused answer or toolbar button. Filters and Import keep keyboard input while open. Escape closes the panel and returns focus to the control that opened it.

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

### @penguinharness/perler-studio 0.2.20

The legend has separate buttons to highlight a colour and replace its beads. The replacement button stays visible on touchscreens. After a swap, keyboard focus moves to the replacement colour.
