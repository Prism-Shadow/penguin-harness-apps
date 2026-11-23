import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { chromium } from "playwright-core";
import game from "../workbenches/harbor-pulse/ui/game-config.js";

const ui = new URL("../workbenches/harbor-pulse/ui/", import.meta.url);
// Exercise each adapter insertion point without redistributing the original game.
const fixture = `<html><head><title>Offline fixture</title></head><body><button>Enter deck</button>
<script>class Deck { startAmbient() {} lock(){} onLockChange(){} playShot(kind,pos,options){} }
function connect(node,ctx){node.connect(ctx.destination)} function announce(engine,text){engine.speak(text)}</script></body></html>`;
const integrity =
  "sha256-" + createHash("sha256").update(fixture).digest("base64");

async function listen(server, t) {
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  return "http://127.0.0.1:" + server.address().port;
}

test("rejects modified author downloads, retries and keeps the verified copy across browser restarts", async (t) => {
  let downloads = 0,
    valid = false;
  const author = await listen(
    createServer((_, res) => {
      downloads++;
      res.writeHead(200, {
        "Content-Type": "text/html",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store",
      });
      res.end(valid ? fixture : fixture.replace("Enter deck", "Unverified"));
    }),
    t,
  );
  const origin = await listen(
    createServer(async (req, res) => {
      const name =
        new URL(req.url, "http://localhost").pathname.slice(1) || "index.html";
      if (!/^[\w.-]+$/.test(name)) {
        res.writeHead(404).end();
        return;
      }
      try {
        const content =
          name === "game-config.js"
            ? "export default " +
              JSON.stringify({ ...game, url: author, integrity })
            : await readFile(new URL(name, ui));
        res
          .writeHead(200, {
            "Content-Type": name.endsWith(".js")
              ? "text/javascript"
              : name.endsWith(".css")
                ? "text/css"
                : "text/html",
            "Cache-Control": "no-store",
          })
          .end(content);
      } catch {
        res.writeHead(404).end();
      }
    }),
    t,
  );
  const profile = await mkdtemp(join(tmpdir(), "transport-browser-"));
  const launch = () =>
    chromium.launchPersistentContext(profile, {
      channel: "chromium",
      locale: "en-US",
      serviceWorkers: "block",
    });
  let context = await launch();
  t.after(async () => {
    await context.close();
    await rm(profile, { recursive: true, force: true });
  });
  let page = context.pages()[0];
  const saved = (key) =>
    page.waitForFunction(
      (key) =>
        new Promise((resolve) => {
          const op = indexedDB.open("penguin.arcade.local-games");
          op.onsuccess = () => {
            const db = op.result;
            const get = db.transaction("files").objectStore("files").get(key);
            get.onsuccess = () => {
              db.close();
              resolve(typeof get.result === "string");
            };
          };
        }),
      key,
    );
  await page.goto(origin);
  await page.getByRole("button", { name: "Try again" }).waitFor();
  assert.equal(await page.locator("iframe").count(), 0);
  assert.equal(downloads, 1);
  valid = true;
  await page.getByRole("button", { name: "Try again" }).click();
  const button = () =>
    page.frameLocator("iframe").getByRole("button", { name: "Enter deck" });
  await button().waitFor();
  await saved(game.id + ":" + integrity);
  assert.equal(downloads, 2);
  assert.equal(await page.locator("iframe").getAttribute("src"), null);
  await context.close();
  context = await launch();
  let foreign = 0;
  await context.route("**/*", (route) => {
    if (new URL(route.request().url()).origin === origin)
      return route.continue();
    foreign++;
    return route.abort();
  });
  page = context.pages()[0];
  await page.goto(origin);
  await button().click();
  assert.equal(foreign, 0);
  await page.evaluate(
    (key) =>
      new Promise((resolve, reject) => {
        const op = indexedDB.open("penguin.arcade.local-games");
        op.onsuccess = () => {
          const db = op.result;
          const tx = db.transaction("files", "readwrite");
          tx.objectStore("files").put("truncated", key);
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
          tx.onerror = () => reject(tx.error);
        };
      }),
    game.id + ":" + integrity,
  );
  await page.reload();
  await page.getByRole("button", { name: "Try again" }).waitFor();
  assert.equal(foreign, 1);
  await context.unrouteAll();
  await page.getByRole("button", { name: "Try again" }).click();
  await button().waitFor();
  assert.equal(downloads, 3);
  const custom =
    "<html><head></head><body><h1>Personal copy</h1><script></script></body></html>";
  await page.locator('input[type="file"]').setInputFiles({
    name: "own.html",
    mimeType: "text/html",
    buffer: Buffer.from(custom),
  });
  await page
    .frameLocator("iframe")
    .getByRole("heading", { name: "Personal copy" })
    .waitFor();
  await saved(game.id);
  await page.reload();
  await page
    .frameLocator("iframe")
    .getByRole("heading", { name: "Personal copy" })
    .waitFor();
  assert.equal(foreign, 1);
  assert.equal(downloads, 3);
});
