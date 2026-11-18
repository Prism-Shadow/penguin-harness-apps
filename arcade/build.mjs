// Materialize independent resource-only plugin packages; tarballs need no runtime dependencies.
import { fileURLToPath } from "node:url";
import path from "node:path";
import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { buildOriginal } from "./original.mjs";
import { games } from "./games.mjs";
const root = fileURLToPath(new URL("../", import.meta.url)),
  common = path.join(root, "arcade/shared");
const json = async (file, value) =>
  writeFile(file, JSON.stringify(value, null, 2) + "\n");
const html = await readFile(path.join(common, "index.html"), "utf8");
const repo = "https://github.com/Prism-Shadow/penguin-harness-apps";
const upstream =
  "https://github.com/riba2534/claude-opus-5-5-demo/tree/54adc1fb64155f9dd7c1c90ecae7b8185ac540b8";
for (const game of games) {
  const { id, name, zh, description, descriptionZh } = game,
    pkg = path.join(root, "plugins", id),
    wb = path.join(pkg, "workbenches", id),
    ui = path.join(wb, "ui");
  await mkdir(ui, { recursive: true });
  const fullName = "@penguinharness/" + id;
  await json(path.join(pkg, "package.json"), {
    name: fullName,
    version: game.version ?? "1.1.0",
    type: "module",
    description,
    license:
      id === "harbor-pulse" ? "Apache-2.0" : "Apache-2.0 AND ISC AND MIT",
    author: "Prism-Shadow",
    repository: {
      type: "git",
      url: "git+" + repo + ".git",
      directory: "plugins/" + id,
    },
    files: [
      "icon.svg",
      "ifaces.json",
      "workbenches",
      "LICENSE",
      ...(id === "harbor-pulse" ? [] : ["THIRD-PARTY-NOTICES.txt"]),
      "README.md",
      "README.zh.md",
    ],
    keywords: ["penguin-plugin", "workbench", "game"],
  });
  const moduleName =
      id
        .split("-")
        .map((x) => x[0].toUpperCase() + x.slice(1))
        .join("") + "Plugin",
    signature = fullName + "#" + moduleName;
  const ifaces = { [signature]: { name: moduleName, methods: {}, slots: {} } };
  const table = {
    ifaces,
    types: {},
    modules: {
      [moduleName]: {
        name: moduleName,
        kind: "component",
        requires: {},
        provides: { [moduleName]: signature },
        contributes: {
          "PluginLibraryModule.cards": [
            {
              id: id + ".card",
              title: name,
              titleZh: zh,
              shortDescription: description,
              shortDescriptionZh: descriptionZh,
              descriptionZh,
              category: "entertainment",
              icon: "icon.svg",
              preinstall: false,
            },
          ],
          "PluginLibraryModule.workbenches": [
            {
              id: id + ".workbench." + id,
              name: id,
              path: "workbenches/" + id,
            },
          ],
        },
        children: [],
      },
    },
    plugin: { modules: [moduleName], replaces: [] },
  };
  await json(path.join(pkg, "ifaces.json"), {
    hash: createHash("sha256").update(JSON.stringify(ifaces)).digest("hex"),
    ...table,
  });
  await json(path.join(wb, "package.json"), {
    name: id + "-workbench",
    version: game.version ?? "1.1.0",
    type: "module",
    penguin: {
      version: game.workbenchVersion ?? "2026.11.19.2",
      appCenter: { show: true, title: name, titleZh: zh, icon: "ui/icon.svg" },
      modules: [
        {
          name: "Workbench",
          provides: { main: "@prismshadow/penguin-server#WorkbenchMain" },
          contributes: {
            "WebModule.sessionTabs": [
              {
                id: id + ".game",
                key: "game",
                title: name,
                titleZh: zh,
                renderer: {
                  iframe: {
                    src: "ui/index.html",
                    ...(id === "harbor-pulse" ? { pointerLock: true } : {}),
                  },
                },
              },
            ],
          },
        },
      ],
    },
  });
  await copyFile(path.join(common, "index.ts"), path.join(wb, "index.ts"));
  await copyFile(path.join(root, "LICENSE"), path.join(pkg, "LICENSE"));
  for (const file of ["host.css", "host.js"])
    await copyFile(path.join(common, file), path.join(ui, file));
  const { icon: _icon, version: _version, workbenchVersion: _workbenchVersion, ...metadata } = game;
  await writeFile(
    path.join(ui, "game-config.js"),
    "export default " + JSON.stringify(metadata, null, 2) + ";\n",
  );
  if (id !== "harbor-pulse") await buildOriginal(game, ui);
  const icon =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
    game.icon +
    "</svg>\n";
  await writeFile(path.join(pkg, "icon.svg"), icon);
  await writeFile(path.join(ui, "icon.svg"), icon);
  await writeFile(
    path.join(ui, "index.html"),
    html.replaceAll("{{name}}", name),
  );
  const source = upstream + "/" + game.source;
  const hosted = id === "harbor-pulse";
  const accessEn = hosted
    ? "The author’s online game has its original audio. Choose **Open local HTML** and select your sound-fixed Transport Ship HTML to play the revised audio offline. The workbench saves your file in this browser."
    : "The original game and its procedural graphics and audio run locally after installation. Read [third-party notices](THIRD-PARTY-NOTICES.txt) for the game and its bundled libraries.";
  const accessZh = hosted
    ? "作者托管的线上版保留原版声音。要离线游玩音效修复版，请点击「导入本地 HTML」，选择《运输船》音效修复版 HTML。文件保存在当前浏览器。"
    : "安装后可离线游玩，游戏的三维场景和声音均在本机生成。游戏与依赖的授权见[第三方许可](THIRD-PARTY-NOTICES.txt)。";
  await writeFile(
    path.join(pkg, "README.md"),
    `# ${name}\n\n${description}\n\nOpen **${name}** in your Agent’s App Center. ${game.controls}\n\n${accessEn}\n\n[Original idea by riba2534](https://x.com/riba2534/status/2102657259197403463) · [Upstream source](${source}) · [Original hosted game](${game.url}) · [中文](README.zh.md)\n`,
  );
  await writeFile(
    path.join(pkg, "README.zh.md"),
    `# ${zh}\n\n${descriptionZh}\n\n从智能体的应用中心打开「${zh}」。${game.controlsZh}\n\n${accessZh}\n\n[创意来自 riba2534](https://x.com/riba2534/status/2102657259197403463) · [上游源码](${source}) · [作者托管的游戏](${game.url}) · [English](README.md)\n`,
  );
}
