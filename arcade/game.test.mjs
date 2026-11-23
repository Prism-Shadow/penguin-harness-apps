import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { games } from "./games.mjs";
import { english } from "./english.mjs";
const root = fileURLToPath(new URL("../", import.meta.url));
const read = (file) => readFileSync(file, "utf8");
describe("the original games in the App Center", () => {
  for (const game of games)
    it(
      game.id + " upgrades the existing shortcut and credits the author",
      () => {
        const dir = path.join(root, "plugins", game.id),
          wb = path.join(dir, "workbenches", game.id),
          ui = path.join(wb, "ui");
        const manifest = JSON.parse(read(path.join(dir, "package.json")));
        expect([manifest.name, manifest.version]).toEqual([
          "@penguinharness/" + game.id,
          game.version ?? "1.1.0",
        ]);
        expect(
          JSON.parse(read(path.join(wb, "package.json"))).penguin.appCenter,
        ).toMatchObject({ show: true, title: game.name, titleZh: game.zh });
        for (const [file, credit] of [
          ["README.md", "Original idea by riba2534"],
          ["README.zh.md", "创意来自 riba2534"],
        ])
          expect(read(path.join(dir, file))).toContain(
            "[" +
              credit +
              "](https://x.com/riba2534/status/2102657259197403463)",
          );
        expect(read(path.join(ui, "index.html"))).toContain(
          "https://x.com/riba2534/status/2102657259197403463",
        );
        if (game.source === "cf-transport-ship") {
          const html = read(path.join(ui, "game.html"));
          expect(html).toContain("penguin.game-audio-ready");
          expect(html).toContain("btnStart");
          expect(html).not.toMatch(/<script\b[^>]*\bsrc=/i);
          expect(read(path.join(ui, "host.js"))).not.toContain("pages.dev");
          expect(read(path.join(ui, "game-config.js"))).not.toContain(
            "pages.dev",
          );
          expect(read(path.join(dir, "THIRD-PARTY-NOTICES.txt"))).toContain(
            "Three.js",
          );
          expect(read(path.join(dir, "game", "src", "main.js"))).toContain(
            "game.init()",
          );
        } else {
          const html = read(path.join(ui, "game.html")),
            notices = read(path.join(dir, "THIRD-PARTY-NOTICES.txt"));
          expect(html).toContain('id="third-party-notices"');
          expect(html).toContain("penguin.game-audio-ready");
          expect(html).not.toMatch(/<script\b[^>]*\bsrc=/i);
          expect(notices).toContain("ISC License");
          expect(notices).toContain("Three.js");
          expect(html).toContain(
            game.source === "qq-speed" ? 'id="start"' : 'id="startBtn"',
          );
          expect(html).toContain(
            game.source === "qq-speed" ? 'id="result"' : 'id="startMute"',
          );
        }
      },
    );
  it("translates the actual race menus, controls, results and riding HUD", () => {
    for (const text of [
      "开始比赛",
      "情迷爱琴海",
      "刹车/倒车",
      "最佳单圈",
      "比赛结束",
      "开始骑行",
      "鹈鹕视角",
      "W/S 加减速 · A/D 变道 · 空格跳 · T 特技",
      "成就",
      "档位",
      "操作说明",
    ])
      expect(english[text]).toBeTruthy();
  });
});
