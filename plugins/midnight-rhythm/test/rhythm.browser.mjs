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
