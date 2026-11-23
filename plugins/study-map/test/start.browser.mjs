import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { chromium } from "playwright-core";

const ui = new URL("../workbenches/study-map/ui/", import.meta.url);
const entry = "http://localhost/study-map/ui/index.html";

async function openWorkbench(t, options = {}) {
  const browser = await chromium.launch({ channel: "chromium" });
  t.after(() => browser.close());
  const page = await browser.newPage({ locale: "en-US", ...options });
  page.setDefaultTimeout(8000);
  const requests = [];
  page.on("request", (r) => {
    if (r.url().includes("/api/") || r.url().includes("api.github.com"))
      requests.push(r.url());
  });
  await page.route("http://localhost/study-map/ui/**", (route) => {
    const path = new URL(route.request().url()).pathname.slice(
      "/study-map/ui/".length,
    );
    return route.fulfill({ path: fileURLToPath(new URL(path, ui)) });
  });
  await page.goto(entry);
  return { page, requests };
}

test("opens on input, saves a study and reopens at the selected node only when asked", async (t) => {
  const { page, requests } = await openWorkbench(t);
  const input = page.getByRole("textbox", {
    name: "What would you like to study?",
  });
  const button = page.getByRole("button", { name: "Create study map" });
  await input.waitFor();
  assert.equal(await button.isDisabled(), true);
  const examples = page.getByRole("heading", { name: "Examples" });
  assert.ok((await input.boundingBox()).y < (await examples.boundingBox()).y);
  assert.equal(await page.locator("iframe").count(), 0);
  assert.deepEqual(requests, []);
  await input.fill("  ");
  assert.equal(await button.isDisabled(), true);
  await input.fill(
    "# A reading journal\n\nNotes from our class.\n\n## Second reading\n\nCompare the two accounts.",
  );
  await button.press("Enter");
  await page.waitForFunction(
    () =>
      document.querySelector("#library option:checked")?.textContent ===
      "A reading journal",
  );
  const nodes = page.getByRole("combobox", { name: "Jump to a node" });
  const savedNode = await nodes
    .locator("option")
    .filter({ hasText: "Second reading" })
    .getAttribute("value");
  await nodes.selectOption(savedNode);
  await page.getByRole("button", { name: "Back to studies" }).click();
  await page.reload();
  await input.waitFor();
  assert.equal(await page.locator("iframe").count(), 0);
  await page
    .getByRole("button", { name: "A reading journal", exact: true })
    .click();
  assert.equal(await nodes.inputValue(), savedNode);
  const id = await page.locator("#library").inputValue();
  await page.goto(entry + "?study=" + encodeURIComponent(id));
  await nodes.waitFor();
  assert.equal(await nodes.inputValue(), savedNode);
  assert.deepEqual(requests, []);
});

test("opens a built-in reading on tap and keeps a failed repository available to correct", async (t) => {
  const { page, requests } = await openWorkbench(t, {
    locale: "zh-CN",
    viewport: { width: 360, height: 740 },
    hasTouch: true,
    isMobile: true,
  });
  const input = page.getByRole("textbox", { name: "你想学什么？" });
  await input.waitFor();
  const sample = page.getByRole("button", { name: "潮池的一天" });
  assert.equal(await sample.isVisible(), true);
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
  );
  assert.deepEqual(requests, []);
  await sample.tap();
  await page.getByRole("button", { name: "返回学习首页" }).waitFor();
  await page.getByRole("button", { name: "原文", exact: true }).tap();
  await page.getByRole("combobox", { name: "原文" }).waitFor();
  await page.getByRole("button", { name: "返回学习首页" }).tap();
  const url = "https://github.com/owner/missing-study";
  await page.route("https://api.github.com/repos/owner/missing-study", (r) =>
    r.fulfill({ status: 404, body: "{}" }),
  );
  await input.fill(url);
  await page.getByRole("button", { name: "生成学习框图" }).tap();
  await page.getByText(/无法读取这个仓库/).waitFor();
  assert.equal(await input.inputValue(), url);
  assert.equal(await input.evaluate((e) => document.activeElement === e), true);
  await input.fill("# 班级笔记\n\n## 海岸\n\n岩石围成了潮池。");
  await page.getByRole("button", { name: "生成学习框图" }).tap();
  await page.waitForFunction(
    () =>
      document.querySelector("#library option:checked")?.textContent ===
      "班级笔记",
  );
  assert.deepEqual(requests, [
    "https://api.github.com/repos/owner/missing-study",
  ]);
});
