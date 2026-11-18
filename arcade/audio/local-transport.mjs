import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { adaptAudio } from "./adapt-audio.mjs";

// The caller supplies the author's locally built game. Only this adapter is distributed.
const [source, output] = process.argv.slice(2);
if (!source || !output)
  throw new Error(
    "Usage: node arcade/audio/local-transport.mjs path/to/cf-transport-ship /path/to/local-game.html",
  );
const html = adaptAudio(
  await readFile(path.join(source, "dist/index.html"), "utf8"),
  "cf-transport-ship",
);
const notice = await readFile(
  path.join(source, "node_modules/three/LICENSE"),
  "utf8",
);
const credit = `<script>addEventListener("DOMContentLoaded", () => {
 const link = document.createElement("a");
 link.href = "https://x.com/riba2534/status/2102657259197403463"; link.target = "_blank"; link.rel = "noopener noreferrer";
 link.lang = /^zh/i.test(navigator.language) ? "zh" : "en";
 link.textContent = link.lang === "zh" ? "创意来自 riba2534" : "Original idea by riba2534";
 (document.querySelector("#menu .mlinks") || document.querySelector("#menu") || document.body).append(link);
});</script>`;
await writeFile(
  output,
  html.replace(
    "</head>",
    () =>
      credit +
      '<script type="text/plain" id="third-party-notices">' +
      notice +
      "</script></head>",
  ),
);
