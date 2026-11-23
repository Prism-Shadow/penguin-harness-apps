// Keep the installed workbench and an unpacked, offline index.html on the same entry point.
import { fileURLToPath } from "node:url";
import { rolldown } from "rolldown";

const ui = new URL(
  "../plugins/penguin-snowboard/workbenches/penguin-snowboard/ui/",
  import.meta.url,
);
const bundle = await rolldown({
  input: fileURLToPath(new URL("game.js", ui)),
  platform: "browser",
});
try {
  await bundle.write({
    file: fileURLToPath(new URL("frostline.js", ui)),
    format: "iife",
    minify: true,
  });
} finally {
  await bundle.close();
}
