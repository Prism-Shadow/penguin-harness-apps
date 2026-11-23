import { readFile, writeFile, mkdir } from "node:fs/promises";
import { format } from "prettier";
import { games } from "./catalog.mjs";
const file = (path) => new URL(path, import.meta.url);
const ui = file("../workbenches/pocket-arcade/ui/");
const [css, base] = await Promise.all([
  readFile(file("cabinet.css"), "utf8"),
  readFile(file("cabinet.js"), "utf8"),
]);
const html = async (title, body, js) =>
  format(
    '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>' +
      title +
      "</title><style>" +
      css +
      "</style></head><body>" +
      body +
      "<script>" +
      js +
      "</script></body></html>",
    { parser: "html" },
  );
const chrome =
  '<main class="machine"><header><div><a class="back" id="back" href="../../index.html">All games</a><h1 id="title" class="wordmark"></h1></div><div class="actions"><button type="button" class="menu" id="pause">Pause</button><button type="button" class="menu" id="reset">Restart</button></div></header><div class="unit"><div class="line hud"><b id="score"></b><time id="time">0:00</time></div><section class="display" id="stage" tabindex="-1"><canvas id="canvas" class="screen" width="320" height="200"></canvas><div id="grid" class="grid" hidden></div><div id="overlay" class="overlay"><div><h2 id="heading"></h2><p id="caption"></p><button type="button" id="start" class="primary"></button></div></div></section><div id="pad" class="pad"></div><div class="live" id="status" role="status"></div></div><p class="hint" id="how"></p></main>';
for (const g of games) {
  const js = (await readFile(file("games/" + g.id + ".js"), "utf8")).replace(
    "export default function",
    "function",
  );
  const dir = new URL("games/" + g.id + "/", ui);
  await mkdir(dir, { recursive: true });
  await writeFile(
    new URL("index.html", dir),
    await html(
      g.en,
      chrome,
      "const info=" + JSON.stringify(g) + ";\n" + js + "\n" + base,
    ),
  );
}
const gallery =
  '<main><header><div><h1 id="title" class="wordmark">Pocket Arcade</h1><p class="hint" id="sub"></p></div></header><div class="games" id="games"></div></main>';
const index = await readFile(file("index.js"), "utf8");
await writeFile(
  new URL("index.html", ui),
  await html(
    "Pocket Arcade",
    gallery,
    "const games=" + JSON.stringify(games) + ";\n" + index,
  ),
);
