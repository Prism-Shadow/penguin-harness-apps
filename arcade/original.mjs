import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { adaptAudio } from "./audio/adapt-audio.mjs";
import { english } from "./english.mjs";

const base = fileURLToPath(new URL(".", import.meta.url));
export async function buildOriginal(game, ui) {
  const source = path.join(base, "upstream", game.source);
  execFileSync(process.execPath, ["build.mjs"], {
    cwd: source,
    stdio: "inherit",
  });
  const original = await readFile(path.join(source, "dist/index.html"), "utf8");
  const originalTitle =
    original.match(/<title>([^<]*)<\/title>/i)?.[1] || game.zh;
  const words =
    game.source === "qq-speed"
      ? {
          ...english,
          [game.zh]: game.name,
          "漂移 · 集气 · 小喷 · 双喷 · 氮气":
            "Drift · Charge · Mini boost · Double boost · Nitro",
          "游戏中的模型、贴图和音乐均实时生成。":
            "Models, textures and music are generated live.",
        }
      : english;
  const lang = (await readFile(path.join(base, "shared/localize.js"), "utf8"))
    .replace("TRANSLATIONS", () => JSON.stringify(words))
    .replace("GAME_TITLE", () => JSON.stringify(game.name))
    .replace("ORIGINAL_TITLE", () => JSON.stringify(originalTitle));
  const notices = [
    "Original by riba2534 · https://github.com/riba2534/claude-opus-5-5-demo/tree/54adc1fb64155f9dd7c1c90ecae7b8185ac540b8/" +
      game.source,
    await readFile(path.join(base, "upstream/LICENSE-ISC.txt"), "utf8"),
    "Three.js",
    await readFile(path.join(source, "node_modules/three/LICENSE"), "utf8"),
  ];
  if (game.source === "pelican-bike")
    notices.push(
      "lil-gui",
      await readFile(
        path.join(source, "node_modules/lil-gui/LICENSE.md"),
        "utf8",
      ),
    );
  const license = notices.map((n) => n.trimEnd()).join("\n\n") + "\n";
  const html = adaptAudio(original, game.source).replace(
    "</head>",
    () =>
      "<script>\n" +
      lang +
      '\n</script>\n<script type="text/plain" id="third-party-notices">' +
      license +
      "</script></head>",
  );
  await writeFile(path.join(ui, "game.html"), html);
  await writeFile(path.join(ui, "../../../THIRD-PARTY-NOTICES.txt"), license);
}
