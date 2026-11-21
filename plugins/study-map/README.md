# Study Map

Open Study Map from the Agent’s App Center. It opens on an example. Choose **Import** to read a code folder, individual source or text documents (including Markdown), text you paste, or a public GitHub repository. Private repositories can be opened from a local checkout. A GitHub import records the commit and links to the exact lines on GitHub. If an import fails, the dialog opens again with what you entered and the reason.

The overview opens with all included files and their import links, the main sections of a reading, or the concepts in an AI diagram. Zoom or scroll a large diagram. Select a node to see the matching source lines and explanation. Click a linked line number to find its node. Follow a connection with **Explore this node**, or use the node selector to move across the study. On a phone, **Diagram** and **Source** switch between the views.

The local outline recognizes headings, plain-text paragraphs, common declarations and relative JavaScript or TypeScript imports. It shows up to 24 sections per file. Repositories are sampled in a stable order, favoring entry points and README files. Up to 64 supported text files of at most 192 KiB each fit in a 2 MiB study. The interface reports the actual number included. For another part of a large repository, import that subfolder. Binary office documents and PDFs are skipped. GitHub’s public API may rate-limit anonymous requests.

**Explain with AI** previews how many source lines will be submitted to the Agent’s configured chat model. It uses a PenguinHarness Session that denies all tool calls. A model-generated node needs a path, numbered line and a matching quotation. A rejected result leaves the original map intact. Review the interpretation against the source.

Studies are saved in this browser, scoped to this workbench. Pick one from **Studies** to reopen it, or **Remove** it beside the list. **Export HTML** downloads a self-contained, interactive reader containing the study’s source files and displayed diagram. The local reader and exported file work without a model or external scripts.

## Archify

Study Map renders Archify 3.2.0 Architecture and Tree IR locally, with the official routing, semantic node icons, typography, colors, theme and interactive HTML viewer. Select a node in the diagram or through Archify’s finder to reveal its source. Use the reader’s route tool to trace dependencies and collapse branches in a document. Large repositories open on a map of connected modules; select a module to inspect the files inside. The source selector remains available for every included item.

The [upstream source](https://github.com/tt-a1i/archify/tree/44781293f38728baf04dbad33ce1a0cef8c39cca/archify) is pinned to a commit. The shipped browser build replaces command-line file I/O and bundles the official standalone HTML, English/Chinese catalogs and required notices. Rebuild with `node scripts/build-study-map-archify.mjs /path/to/clean/pinned/archify` from the Apps repository after installing development dependencies.
