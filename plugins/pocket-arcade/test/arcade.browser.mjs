import assert from "node:assert/strict";
import { before, after, test } from "node:test";
import { chromium } from "playwright-core";
import { games } from "../src/catalog.mjs";

const shelf = new URL(
  "../workbenches/pocket-arcade/ui/index.html",
  import.meta.url,
).href;
let browser;
before(async () => {
  browser = await chromium.launch({ channel: "chromium" });
});
after(async () => {
  await browser?.close();
});
const keyboards = {
  L: "ArrowLeft",
  R: "ArrowRight",
  U: "ArrowUp",
  D: "ArrowDown",
  A: "Space",
};
function solveSlide(board) {
  const target = "123456780",
    todo = [[board.join(""), []]],
    known = new Set();
  for (let n = 0; n < todo.length; n++) {
    const [state, path] = todo[n];
    if (state === target) return path;
    if (known.has(state)) continue;
    known.add(state);
    const empty = state.indexOf("0");
    for (const k of [-3, 3, -1, 1]) {
      const at = empty + k;
      if (
        at < 0 ||
        at > 8 ||
        (Math.abs(k) === 1 && Math.floor(at / 3) !== Math.floor(empty / 3))
      )
        continue;
      const next = [...state];
      [next[at], next[empty]] = [next[empty], next[at]];
      if (!known.has(next.join(""))) todo.push([next.join(""), [...path, at]]);
    }
  }
  throw Error("The shuffled yard cannot be solved");
}
async function finish(page, id, touch) {
  const cell = page.locator("#grid button"),
    pad = (k) => page.locator('[data-key="' + k + '"]');
  const move = (k) =>
    touch ? pad(k).tap() : page.keyboard.press(keyboards[k] ?? k);
  const pick = (i) => (touch ? cell.nth(i).tap() : cell.nth(i).click());
  switch (id) {
    case "cargo-shift":
      for (const key of ["R", "R", "U", "L", "U", "U", "R", "R", "D", "D"])
        await move(key);
      break;
    case "switchyard": {
      const board = (await cell.allTextContents()).map((n) => Number(n) || 0);
      for (const i of solveSlide(board)) await pick(i);
      break;
    }
    case "signal-field":
      for (
        let i = 0;
        i < 25 && (await page.locator("#overlay").isHidden());
        i++
      )
        await pick(i);
      break;
    case "tile-foundry":
      for (
        let i = 0;
        i < 250 && (await page.locator("#overlay").isHidden());
        i++
      )
        await move(["L", "D", "R", "U"][i % 4]);
      break;
    case "echo-cards": {
      const remembered = new Map(),
        claimed = new Set();
      for (
        let turn = 0;
        turn < 8 && (await page.locator("#overlay").isHidden());
        turn++
      ) {
        const available = Array.from({ length: 8 }, (_, i) => i).filter(
          (i) => !claimed.has(i),
        );
        let first = available.find((i) => !remembered.has(i)) ?? available[0];
        for (const i of available)
          if (
            available.some(
              (j) =>
                i !== j &&
                remembered.has(i) &&
                remembered.get(j) === remembered.get(i),
            )
          ) {
            first = i;
            break;
          }
        await pick(first);
        const v = await cell.nth(first).textContent();
        remembered.set(first, v);
        const second =
          available.find((i) => i !== first && remembered.get(i) === v) ??
          available.find((i) => i !== first && !remembered.has(i)) ??
          available.find((i) => i !== first);
        await pick(second);
        const v2 = await cell.nth(second).textContent();
        remembered.set(second, v2);
        if (v === v2) {
          claimed.add(first);
          claimed.add(second);
        } else if (turn < 7)
          await page.waitForFunction(
            (i) =>
              document.querySelectorAll("#grid button")[i].textContent === "?",
            first,
          );
      }
      break;
    }
    case "tape-loop": {
      await page.waitForFunction(() =>
        document.querySelector('#grid button[data-tone="warm"]'),
      );
      const shown = await cell.evaluateAll((c) =>
        c.findIndex((n) => n.dataset.tone === "warm"),
      );
      await page.waitForFunction(() =>
        document.querySelector("#status").textContent.includes("Your turn"),
      );
      await move(String(((shown + 1) % 4) + 1));
      break;
    }
    case "canal-snake":
      await move("U");
      break;
    case "roof-hop":
      await move("A");
      break;
    case "prism-break":
      if (touch)
        await page.locator("canvas").tap({ position: { x: 12, y: 32 } });
      else await move("L");
      break;
    case "orbit-watch":
      await move("A");
      break;
  }
  await page
    .getByRole("button", { name: "Play again", exact: true })
    .waitFor({ timeout: 65000 });
  assert.match(await page.locator("#caption").textContent(), /Score \d+/);
  if (["switchyard", "cargo-shift"].includes(id))
    assert.equal(await page.locator("#heading").textContent(), "Game clear");
}
for (const touch of [false, true])
  test(
    touch ? "Phone cabinets" : "Desktop cabinets",
    { concurrency: 4 },
    async (t) => {
      await Promise.all(
        games.map((game) =>
          t.test(game.en, async () => {
            const context = await browser.newContext({
              viewport: touch
                ? { width: 390, height: 844 }
                : { width: 1070, height: 760 },
              hasTouch: touch,
              locale: "en-US",
              offline: true,
            });
            try {
              const page = await context.newPage(),
                errors = [];
              page.on("pageerror", (e) => errors.push(e.message));
              await page.goto(shelf);
              const carts = page.locator(".cart");
              assert.equal(await carts.count(), 10);
              const link = carts.filter({
                has: page.getByText(game.en, { exact: true }),
              });
              await (touch ? link.tap() : link.click());
              await page.waitForURL(
                new RegExp("/games/" + game.id + "/index.html$"),
              );
              const start = page.getByRole("button", {
                name: "Start game",
                exact: true,
              });
              await (touch ? start.tap() : start.click());
              const pause = page.getByRole("button", {
                name: "Pause",
                exact: true,
              });
              await (touch ? pause.tap() : pause.click());
              const resume = page.getByRole("button", {
                name: "Resume",
                exact: true,
              });
              await (touch ? resume.tap() : resume.click());
              await finish(page, game.id, touch);
              const again = page.getByRole("button", {
                name: "Play again",
                exact: true,
              });
              await (touch ? again.tap() : again.click());
              assert.equal(await page.locator("#overlay").isHidden(), true);
              assert.equal(
                await page.locator("#score").textContent(),
                "Score 0",
              );
              await page.getByRole("link", { name: "All games" }).click();
              assert.equal(await page.locator(".cart").count(), 10);
              assert.deepEqual(errors, []);
            } finally {
              await context.close();
            }
          }),
        ),
      );
    },
  );

test("a vertical swipe moves the foundry without scrolling its phone page", async () => {
  const context = await browser.newContext({
    viewport: { width: 360, height: 395 },
    hasTouch: true,
    isMobile: true,
    locale: "en-US",
  });
  try {
    const page = await context.newPage();
    await page.goto(new URL("games/tile-foundry/index.html", shelf).href);
    await page.locator("#start").tap();
    const box = await page.locator("#grid").boundingBox();
    const x = Math.round(box.x + box.width / 2),
      y = Math.round(box.y + box.height * 0.75);
    const previous = await page.evaluate(() => scrollY);
    const cdp = await context.newCDPSession(page);
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x, y }],
    });
    for (const dy of [20, 40, 70, 100])
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x, y: y - dy }],
      });
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await page.waitForFunction(() =>
      document.querySelector("#status").textContent.includes("49"),
    );
    assert.equal(await page.evaluate(() => scrollY), previous);
  } finally {
    await context.close();
  }
});
