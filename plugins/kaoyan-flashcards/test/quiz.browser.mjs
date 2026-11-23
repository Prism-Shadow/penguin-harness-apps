/**
 * In Quiz, Enter and Space belong to the focused button. A drawer or import dialog
 * holds keyboard input until it closes. With focus on the page, quiz shortcuts still work.
 * Run with node --test plugins/kaoyan-flashcards/test/*.browser.mjs after npx playwright-core install chromium.
 */
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { chromium } from "playwright-core";

test("quiz controls, overlays and the card respond to their own keyboard actions", async (t) => {
  const browser = await chromium.launch({ channel: "chromium" });
  t.after(() => browser.close());
  const page = await browser.newPage({ locale: "en-US" });
  const ui = new URL("../workbenches/kaoyan-flashcards/ui/", import.meta.url);
  await page.route("http://quiz.test/**", (route) => {
    const asset = new URL(route.request().url()).pathname.slice(1);
    return route.fulfill({ path: fileURLToPath(new URL(asset, ui)) });
  });
  await page.goto("http://quiz.test/index.html");
  await page.locator("#btnStartToday").click();
  const card = page.locator("#cardArea .q");
  const question = await card.innerText();
  const filters = page.locator("#btnFilter");
  await filters.press("Enter");
  const drawer = page.getByRole("dialog", { name: "Filters and settings" });
  assert.equal(await drawer.isVisible(), true);
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Escape");
  assert.equal(await drawer.isVisible(), false);
  assert.equal(await filters.evaluate((el) => el === document.activeElement), true);
  const openImport = page.locator("#btnImportTop");
  await openImport.press("Space");
  await page.locator("#btnSample").press("ArrowRight");
  await page.locator("#pasteArea").press("Escape");
  assert.equal(await openImport.evaluate((el) => el === document.activeElement), true);
  assert.equal(await card.innerText(), question);
  assert.equal(await page.locator("#btnReveal").isVisible(), true);
  await page.locator("#tabDeck").press("Space");
  assert.equal(await page.locator("#deckView").isVisible(), true);
  await page.locator("#tabQuiz").click();
  await page.locator("#tabQuiz").blur();
  await page.keyboard.press("Space");
  assert.equal(await page.locator("#cardArea .answer").isVisible(), true);
  await page.keyboard.press("3");
  assert.notEqual(await card.innerText(), question);
  await page.locator("#cardArea .opt").first().press("Enter");
  assert.equal(await page.locator("#cardArea .verdict").isVisible(), true);
});
