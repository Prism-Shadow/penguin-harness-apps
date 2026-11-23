import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { once } from "node:events";
import { before, after, test } from "node:test";
import { chromium } from "playwright-core";

const ui = new URL("../workbenches/worlds-anthems/ui/", import.meta.url);
let browser, server, url;
before(async () => {
  server = createServer(async (req, res) => {
    const name =
      new URL(req.url, "http://localhost").pathname.slice(1) || "index.html";
    if (!/^[\w.-]+$/.test(name)) return res.writeHead(404).end();
    try {
      const types = {
        html: "text/html",
        js: "text/javascript",
        css: "text/css",
      };
      const bytes = await readFile(new URL(name, ui));
      res
        .writeHead(200, {
          "content-type": types[name.split(".").pop()],
          "content-length": bytes.length,
        })
        .end(bytes);
    } catch {
      res.writeHead(404).end();
    }
  }).listen(0, "127.0.0.1");
  await once(server, "listening");
  url = "http://127.0.0.1:" + server.address().port;
  browser = await chromium.launch({ channel: "chromium" });
});
after(async () => {
  await browser?.close();
  server?.close();
});

for (const touch of [false, true]) {
  test(
    "play, scrub and repeat actual offline audio using " +
      (touch ? "touch" : "the keyboard"),
    async () => {
      const context = await browser.newContext({
        viewport: { width: touch ? 375 : 1024, height: 780 },
        hasTouch: touch,
      });
      try {
        await context.addInitScript(() =>
          Object.defineProperty(navigator, "onLine", { get: () => false }),
        );
        const page = await context.newPage(),
          outside = [];
        page.on("request", (r) => {
          if (r.url().startsWith("https:")) outside.push(r.url());
        });
        await page.goto(url);
        const press = async (locator) =>
          touch ? locator.tap() : locator.press("Enter");
        assert.equal(
          await page.locator("#track-title").innerText(),
          "Northbound",
        );
        assert.equal(await page.locator("#tracks .track").count(), 8);
        await page.waitForFunction(
          () => !document.querySelector("#play").disabled,
        );
        await press(page.locator("#play"));
        await page.waitForFunction(
          () => document.querySelector("#position").textContent !== "0:00",
        );
        await press(page.locator("#play"));
        await page.waitForFunction(
          () => document.querySelector("#status").textContent === "Paused",
        );
        const seek = page.locator("#seek");
        if (touch) {
          const b = await seek.boundingBox();
          await page.touchscreen.tap(b.x + b.width * 0.7, b.y + b.height / 2);
        } else await seek.press("ArrowRight");
        assert(Number(await seek.inputValue()) > 1000);
        await seek.press("End");
        await seek.press("ArrowLeft");
        await press(page.locator("#play"));
        await page.waitForFunction(
          () =>
            document.querySelector("#status").textContent === "Playing" &&
            Number(document.querySelector("#seek").value) < 2500,
        );
        assert.equal(
          await page.locator("#track-title").innerText(),
          "Afterglow",
        );
        await press(page.locator("#repeat"));
        await seek.press("End");
        await page.waitForFunction(
          () =>
            document.querySelector("#track-title").textContent ===
              "Northbound" &&
            document.querySelector("#status").textContent === "Playing",
        );
        await press(page.locator("#repeat"));
        await page.locator("#offline-tracks .track").last().click();
        await page.waitForFunction(
          () => document.querySelector("#status").textContent === "Playing",
        );
        await seek.press("End");
        await page.waitForFunction(
          () => document.querySelector("#status").textContent === "Finished",
        );
        assert.deepEqual(outside, []);
      } finally {
        await context.close();
      }
    },
  );
}

test("official track completion advances once and repeat returns to the first anthem", async () => {
  const context = await browser.newContext({ locale: "en-US" });
  try {
    // The official event bridge runs unchanged. Only the publisher's iframe and SDK are
    // fixtures, so finish and late events can be exercised without network timing.
    await context.route("https://w.soundcloud.com/player/?**", (route) =>
      route.fulfill({ body: "" }),
    );
    await context.route("https://w.soundcloud.com/player/api.js", (route) =>
      route.fulfill({
        contentType: "text/javascript",
        body: `const callbacks = {};
        const Widget = () => ({
          bind(key, callback) { callbacks[key] = callback; if (key === "READY") setTimeout(callback, 5); },
          getDuration(fn) { fn(200000); }, setVolume() {}, seekTo() {},
          play() { callbacks.PLAY(); }, pause() { callbacks.PAUSE(); }
        });
        Widget.Events = Object.fromEntries(["READY","PLAY","PAUSE","FINISH","ERROR","PLAY_PROGRESS","SEEK"].map(k => [k,k]));
        window.SC = { Widget };
        window.completeTrack = () => callbacks.FINISH();`,
      }),
    );
    const page = await context.newPage();
    await page.goto(url);
    const tracks = page.locator("#tracks .track");
    const title = async (i) => tracks.nth(i).locator(".name").innerText();
    const ready = () =>
      page.waitForFunction(() => !document.querySelector("#play").disabled);
    async function complete() {
      await ready();
      const bridge = page
        .frames()
        .find((frame) => frame.url().startsWith("data:text/html"));
      assert(bridge);
      await bridge.evaluate(() => window.completeTrack());
    }
    await complete();
    await page.waitForFunction(
      (t) => document.querySelector("#track-title").textContent === t,
      await title(1),
    );
    await tracks.last().click();
    await complete();
    await page.waitForFunction(
      () => document.querySelector("#status").textContent === "Finished",
    );
    await page.locator("#repeat").click();
    await page.locator("#play").click();
    await complete();
    await page.waitForFunction(
      (t) => document.querySelector("#track-title").textContent === t,
      await title(0),
    );
    await ready();
    assert.match(
      await page.locator("#origin").getAttribute("href"),
      /^https:\/\/soundcloud\.com\//,
    );
  } finally {
    await context.close();
  }
});
