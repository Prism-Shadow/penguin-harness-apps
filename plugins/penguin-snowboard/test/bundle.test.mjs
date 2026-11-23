import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { rolldown } from "rolldown";
import { expect, it } from "vitest";

it("ships the current game as a classic script for an unpacked offline course", async () => {
  const ui = new URL("../workbenches/penguin-snowboard/ui/", import.meta.url);
  const bundle = await rolldown({
    input: fileURLToPath(new URL("game.js", ui)),
    platform: "browser",
  });
  try {
    const { output } = await bundle.generate({ format: "iife", minify: true });
    expect(await readFile(new URL("frostline.js", ui), "utf8")).toBe(
      output[0].code,
    );
    expect(await readFile(new URL("index.html", ui), "utf8")).toContain(
      '<script src="frostline.js"></script>',
    );
  } finally {
    await bundle.close();
  }
});
