# Pocket Arcade

Choose one of ten original arcade and puzzle games from the cartridge shelf. Each cabinet has its own rules, scoring and finish screen. Play with the keyboard, on-screen controls or by touching the board.

An administrator installs the optional package, then a Project member adds the workbench to an Agent. To play offline in a browser, open `workbenches/pocket-arcade/ui/index.html` from the unpacked package. Each game also runs directly from its own `games/<name>/index.html`.

After editing the cabinet, catalog or games in `src/`, run `node plugins/pocket-arcade/src/build.mjs` from the repository root to regenerate the standalone pages.
