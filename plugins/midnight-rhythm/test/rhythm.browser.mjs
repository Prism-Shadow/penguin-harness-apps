import assert from "node:assert/strict";
import test from "node:test";
import { chromium, devices } from "playwright-core";

const entry = new URL(
  "../workbenches/midnight-rhythm/ui/index.html",
  import.meta.url,
).href;

// Watch the browser's running audio clock. Hits still use the keyboard and the visible pads.
async function atBeat(page, beat) {
  await page.waitForFunction(
    (target) => elapsed() >= (target * 60) / 112,
    beat,
  );
}

test("play the track, pause without losing a note, miss, finish and retry", async (t) => {
  const browser = await chromium.launch({ channel: "chromium" });
  t.after(() => browser.close());
  const page = await browser.newPage({
    viewport: { width: 1040, height: 710 },
    locale: "en-US",
  });
  await page.goto(entry);
  await page.getByRole("button", { name: "Play track" }).click();
  await atBeat(page, 2);
  await page.keyboard.press("f");
  assert.equal(await page.locator("#score").textContent(), "120");
  const audible = await page.evaluate(async () => {
    const probe = audio.createAnalyser();
    bus.connect(probe);
    await new Promise((resolve) => setTimeout(resolve, 80));
    const samples = new Float32Array(probe.fftSize);
    probe.getFloatTimeDomainData(samples);
    bus.disconnect(probe);
    return samples.some((sample) => Math.abs(sample) > 0.005);
  });
  assert.ok(audible, "the original arrangement reaches the audio output");
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  const paused = await page.evaluate(() => elapsed());
  await page.waitForTimeout(320);
  assert.equal(await page.evaluate(() => elapsed()), paused);
  await page.getByRole("button", { name: "Resume" }).click();
  await atBeat(page, 4.31);
  await page.keyboard.press("j");
  assert.equal(await page.locator("#combo").textContent(), "2×");
  await atBeat(page, 7);
  assert.equal(await page.locator("#combo").textContent(), "0×");
  await page
    .getByRole("heading", { name: "Track complete" })
    .waitFor({ timeout: 44000 });
  const results = await page.locator("#results span").allTextContents();
  assert.match(results[0], /Perfect · 1/);
  assert.match(results[1], /Great · 1/);
  assert.match(results[2], /Miss · [1-9]/);
  assert.match(results[3], /Best combo · 2/);
  await page.getByRole("button", { name: "Play again" }).click();
  assert.equal(await page.locator("#score").textContent(), "0");
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.getByRole("button", { name: "Restart", exact: true }).click();
  await atBeat(page, 2);
  await page.keyboard.press("ArrowUp");
  assert.equal(await page.locator("#score").textContent(), "120");
});

test("both touch lanes fit in portrait and landscape", async (t) => {
  const browser = await chromium.launch({ channel: "chromium" });
  t.after(() => browser.close());
  const page = await browser.newPage({
    ...devices["Pixel 7"],
    locale: "en-US",
  });
  await page.goto(entry);
  await page.getByRole("button", { name: "Play track" }).tap();
  await atBeat(page, 2);
  await page.getByRole("button", { name: /Take flight/ }).tap();
  await page.setViewportSize({ width: 780, height: 360 });
  await atBeat(page, 4);
  await page.getByRole("button", { name: /Ride the sled/ }).tap();
  assert.equal(await page.locator("#combo").textContent(), "2×");
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
});

async function watchRider(page) {
  await page.evaluate(() => {
    window.moves = [];
    const rider = document.getElementById("rider");
    function sample() {
      const box = rider.getBoundingClientRect();
      return {
        pose: rider.dataset.pose,
        y: box.y + box.height / 2,
        score: document.getElementById("score").textContent,
      };
    }
    window.riderNow = sample;
    for (const type of ["keydown", "pointerdown"]) {
      document.addEventListener(type, (event) => {
        if (type === "pointerdown" && !event.target.closest(".pad")) return;
        const move = { type, first: sample(), next: null };
        window.moves.push(move);
        requestAnimationFrame(() => {
          move.next = sample();
        });
      });
    }
  });
}

test("the first paint follows off-beat keys and touch, including reduced motion", async (t) => {
  const browser = await chromium.launch({ channel: "chromium" });
  t.after(() => browser.close());
  for (const mobile of [false, true]) {
    const page = await browser.newPage(
      mobile
        ? {
            ...devices["Pixel 7"],
            locale: "zh-CN",
            reducedMotion: "reduce",
            colorScheme: "light",
          }
        : {
            viewport: { width: 970, height: 710 },
            locale: "en-US",
            colorScheme: "dark",
          },
    );
    await page.goto(entry);
    await watchRider(page);
    await page.locator("#start").click();
    const start = await page.evaluate(() => window.riderNow());
    const cdp = await page.context().newCDPSession(page);
    for (const [i, key] of ["ArrowUp", "ArrowDown", "ArrowUp"].entries()) {
      const lane = i % 2;
      if (mobile) {
        const box = await page.locator(lane ? "#low" : "#high").boundingBox();
        await cdp.send("Input.dispatchTouchEvent", {
          type: "touchStart",
          touchPoints: [
            { x: box.x + box.width / 2, y: box.y + box.height / 2 },
          ],
        });
        await cdp.send("Input.dispatchTouchEvent", {
          type: i === 0 ? "touchCancel" : "touchEnd",
          touchPoints: [],
        });
      } else {
        await page.keyboard.down(key);
        await page.keyboard.up(key);
      }
      await page.waitForFunction((index) => window.moves[index]?.next, i);
      const { first, next } = await page.evaluate(
        (index) => window.moves[index],
        i,
      );
      for (const painted of [first, next]) {
        assert.equal(painted.pose, lane ? "carve" : "flight");
        assert.ok(lane ? painted.y > start.y + 2 : painted.y < start.y - 35);
        assert.equal(painted.score, "0");
      }
    }
    // Hold across the first note. Neither key autorepeat nor the touch release can strike it.
    if (mobile) {
      const box = await page.locator("#high").boundingBox();
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x: box.x + box.width / 2, y: box.y + box.height / 2 }],
      });
    } else {
      await page.keyboard.down("ArrowUp");
    }
    await atBeat(page, 2);
    if (mobile) {
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchEnd",
        touchPoints: [],
      });
    } else {
      await page.keyboard.down("ArrowUp");
      await page.keyboard.up("ArrowUp");
    }
    assert.equal(await page.locator("#score").textContent(), "0");
    assert.notEqual(
      (await page.evaluate(() => window.riderNow())).pose,
      "flight",
    );
    await page.locator("#pause").click();
    const paused = await page.evaluate(() => window.riderNow());
    await page.keyboard.press("ArrowDown");
    assert.deepEqual(await page.evaluate(() => window.riderNow()), paused);
    await page.locator("#retry").click();
    assert.equal((await page.evaluate(() => window.riderNow())).pose, "coast");
    await page.close();
  }
});
