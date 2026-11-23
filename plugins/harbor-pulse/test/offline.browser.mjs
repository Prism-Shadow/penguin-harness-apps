import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import test from "node:test";
import { chromium } from "playwright-core";

const ui = new URL("../workbenches/harbor-pulse/ui/", import.meta.url);

test("a fresh installation plays and mutes the included game with external requests blocked", async (t) => {
  const server = createServer(async (req, res) => {
    const name =
      new URL(req.url, "http://localhost").pathname.slice(1) || "index.html";
    if (!/^[\w.-]+$/.test(name)) return res.writeHead(404).end();
    try {
      const file = await readFile(new URL(name, ui));
      const mime = name.endsWith(".js")
        ? "text/javascript"
        : name.endsWith(".css")
          ? "text/css"
          : "text/html";
      res
        .writeHead(200, { "Content-Type": mime, "Cache-Control": "no-store" })
        .end(file);
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const origin = "http://127.0.0.1:" + server.address().port;
  const browser = await chromium.launch({
    channel: "chromium",
    args: ["--enable-unsafe-swiftshader"],
  });
  t.after(() => browser.close());
  const context = await browser.newContext({
    locale: "en-US",
    serviceWorkers: "block",
  });
  const external = [];
  await context.route(/^https?:/, (route) => {
    if (new URL(route.request().url()).origin === origin)
      return route.continue();
    external.push(new URL(route.request().url()).origin);
    return route.abort();
  });
  const page = await context.newPage();
  await page.goto(origin);
  const game = page.frameLocator("iframe");
  await game.locator("#btnStart").click({ timeout: 45000 });
  const child = page
    .frames()
    .find((frame) => frame.parentFrame() === page.mainFrame());
  await child.waitForFunction(
    () => window.__game?.playing && !window.__game.paused,
  );
  const before = await child.evaluate(() => window.__game.player.pos.toArray());
  await page.keyboard.down("w");
  try {
    await child.waitForFunction(
      (previous) =>
        window.__game.player.pos.distanceTo({
          x: previous[0],
          y: previous[1],
          z: previous[2],
        }) > 0.3,
      before,
    );
  } finally {
    await page.keyboard.up("w");
  }
  await child.evaluate(() => {
    const ctx = window.__game.audio.ctx;
    const analyser = ctx.createAnalyser();
    window.penguinGameAudio.output(ctx).connect(analyser);
    window.measurePeak = () => {
      const samples = new Float32Array(analyser.fftSize);
      analyser.getFloatTimeDomainData(samples);
      return samples.reduce((max, v) => Math.max(max, Math.abs(v)), 0);
    };
  });
  await child.waitForFunction(() => window.measurePeak() > 0.001);
  await child.evaluate(() => document.exitPointerLock());
  await game.locator("#btnResume").waitFor({ state: "visible" });
  await page.getByRole("button", { name: "Mute", exact: true }).click();
  await child.waitForFunction(() => window.measurePeak() < 0.00001);
  await page.getByRole("button", { name: "Unmute", exact: true }).click();
  await game.locator("#btnResume").click();
  await child.waitForFunction(
    () => !window.__game.paused && window.measurePeak() > 0.001,
  );
  assert.deepEqual(external, []);
});
