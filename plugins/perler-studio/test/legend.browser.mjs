/**
 * On a generated pattern, the legend can highlight a colour or swap its beads by keyboard.
 * On a touch screen the replacement action is visible and works on the first tap.
 * Run with node --test plugins/perler-studio/test/*.browser.mjs after npx playwright-core install chromium.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { chromium, devices } from "playwright-core";

const workbench = new URL("../workbenches/perler-studio/ui/index.html", import.meta.url);
test("the legend replaces and highlights colours independently", async (t) => {
  const browser = await chromium.launch({ channel: "chromium" });
  t.after(() => browser.close());
  await t.test("using the keyboard", async () => {
    const page = await browser.newPage({ locale: "en-US" });
    await page.goto(workbench.href);
    const row = page.locator("#legendList li").first();
    const replace = row.getByRole("button", { name: /^Replace / });
    await replace.waitFor();
    const label = await replace.getAttribute("aria-label");
    const highlight = row.getByRole("button", { pressed: false }).first();
    await highlight.press("Space");
    assert.equal(
      await page.locator("#legendList").getByRole("button", { pressed: true }).count(),
      1,
    );
    await replace.press("Enter");
    const dialog = page.getByRole("dialog");
    assert.equal(await dialog.isVisible(), true);
    await page.keyboard.press("Escape");
    assert.equal(await replace.evaluate((el) => el === document.activeElement), true);
    await replace.press("Space");
    const choice = dialog.locator("#replaceList button").first();
    const code = (await choice.locator(".rp-name").innerText()).split(" ")[0];
    await choice.press("Enter");
    assert.equal(await dialog.isVisible(), false);
    assert.equal(await page.getByRole("button", { name: label, exact: true }).count(), 0);
    assert.equal(await page.locator(":focus").getAttribute("aria-label"), "Replace " + code);
    await page.close();
  });
  await t.test("using touch", async () => {
    const page = await browser.newPage({ ...devices["Pixel 7"], locale: "en-US" });
    await page.goto(workbench.href);
    const replace = page.getByRole("button", { name: /^Replace / }).first();
    await replace.waitFor();
    assert.equal(
      await replace.evaluate((el) => el.checkVisibility({ opacityProperty: true })),
      true,
    );
    await replace.tap();
    assert.equal(await page.getByRole("dialog").isVisible(), true);
    await page.close();
  });
});
