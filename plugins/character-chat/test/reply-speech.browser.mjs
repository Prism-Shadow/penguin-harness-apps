import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { chromium } from "playwright-core";

const ui = new URL("../workbenches/characters/ui/", import.meta.url);
const project = "https://host.test/server/paired/api/projects/letters";
const workbench = project + "/agents/pip/workbenches/characters";
const spoken = "First paragraph.\n\nWaves hello. Last paragraph.";

function character(id) {
  const at = "2026-11-14T12:00:00Z";
  return {
    id,
    meta: {
      id,
      name: id,
      nameZh: id,
      hello: "Written greeting",
      portrait: id,
      scene: "plain",
      scenes: [],
    },
    bond: { points: 0, days: 0, level: 1 },
    choices: [],
    memory: [],
    mood: "neutral",
    sessionId: null,
    running: false,
    lines: [
      { role: "user", text: "My private question.", at },
      {
        role: "character",
        text:
          id === "pip" ? "First paragraph.\n\n*Waves hello.* Last paragraph." : "Other character.",
        at,
      },
      { role: "note", text: "chapter", at },
    ],
  };
}

// Enough PCM for a real Audio element to keep playing while the second control is pressed.
function wav() {
  const frames = 24000;
  const data = Buffer.alloc(44 + 2 * frames);
  data.write("RIFF");
  data.writeUInt32LE(data.length - 8, 4);
  data.write("WAVEfmt ", 8);
  data.writeUInt32LE(16, 16);
  data.writeUInt16LE(1, 20);
  data.writeUInt16LE(1, 22);
  data.writeUInt32LE(8000, 24);
  data.writeUInt32LE(16000, 28);
  data.writeUInt16LE(2, 32);
  data.writeUInt16LE(16, 34);
  data.write("data", 36);
  data.writeUInt32LE(2 * frames, 40);
  for (let i = 0; i < frames; i++)
    data.writeInt16LE(Math.round(4000 * Math.sin(i * 0.2)), 44 + i * 2);
  return data;
}

for (const touch of [false, true]) {
  test(
    "speak one saved reply without a Session, then stop when its character leaves: " +
      (touch ? "touch" : "keyboard"),
    async () => {
      const browser = await chromium.launch({ channel: "chromium" });
      try {
        const page = await browser.newPage({
          hasTouch: touch,
          viewport: { width: touch ? 375 : 1100, height: 768 },
        });
        const requests = [];
        let bound = false;
        const audio = wav();
        await page.route("https://host.test/**", async (route) => {
          const url = new URL(route.request().url());
          if (url.href === project + "/multimodal-tools/t2s/audio") {
            requests.push(route.request().postDataJSON());
            if (!bound)
              return route.fulfill({ status: 409, json: { error: { code: "model_unbound" } } });
            return route.fulfill({ contentType: "audio/wav", body: audio });
          }
          const path = url.href.slice(workbench.length);
          if (path === "/api/info")
            return route.fulfill({
              json: { supported: true, settings: { lang: "en", readAloud: true } },
            });
          if (path === "/api/characters")
            return route.fulfill({ json: { characters: ["pip", "ren"].map(character) } });
          if (path.startsWith("/api/characters/"))
            return route.fulfill({ json: character(path.split("/").at(-1)) });
          if (path === "/api/events")
            return route.fulfill({ contentType: "text/event-stream", body: ": open\n\n" });
          if (path.startsWith("/ui/") && /^\/ui\/(?:art\/)?[\w.-]+$/.test(path)) {
            const name = path.slice(4);
            const type = {
              js: "text/javascript",
              html: "text/html",
              svg: "image/svg+xml",
              css: "text/css",
            }[name.split(".").at(-1)];
            return route.fulfill({ contentType: type, body: await readFile(new URL(name, ui)) });
          }
          return route.fulfill({ status: 404 });
        });
        await page.goto(workbench + "/ui/index.html", { waitUntil: "domcontentloaded" });
        const button = (name) => page.getByRole("button", { name, exact: true });
        async function press(name) {
          const target = button(name);
          if (touch) await target.tap();
          else {
            await target.focus();
            await page.keyboard.press("Enter");
          }
        }
        await button("Read this reply aloud").waitFor();
        assert.equal(await button("Read this reply aloud").count(), 1);
        assert.equal(await page.locator("#say button").count(), 1);
        assert.deepEqual(requests, []);
        await press("Read this reply aloud");
        await page
          .getByText("Choose a speech generation model in the Project’s model settings.")
          .waitFor();
        bound = true;
        await press("Read this reply aloud");
        await press("Pause reading");
        await press("Play this reply");
        await button("Pause reading").waitFor();
        assert.deepEqual(requests, [{ text: spoken }, { text: spoken }]);
        if (touch) {
          await page.locator("#open-roster").tap();
          await page.locator("#sheet").getByRole("button", { name: "ren" }).tap();
        } else await page.locator("#roster").getByRole("button", { name: "ren" }).click();
        await page.getByText("Other character.", { exact: true }).waitFor();
        await button("Read this reply aloud").waitFor();
        assert.equal(await button("Pause reading").count(), 0);
        assert.equal(await button("Stop").count(), 0);
      } finally {
        await browser.close();
      }
    },
  );
}
