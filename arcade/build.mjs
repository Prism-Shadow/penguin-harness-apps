// Materialize independent resource-only plugin packages; tarballs need no runtime dependencies.
import { fileURLToPath } from "node:url";
import path from "node:path";
import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { games } from "./games.mjs";
const root = fileURLToPath(new URL("../", import.meta.url)),
  common = path.join(root, "arcade/shared");
const json = async (file, value) =>
  writeFile(file, JSON.stringify(value, null, 2) + "\n");
const html = await readFile(path.join(common, "index.html"), "utf8");
const repo = "https://github.com/Prism-Shadow/penguin-harness-showcases";
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
    version: "1.0.0",
    type: "module",
    description,
    license: "Apache-2.0",
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
    version: "1.0.0",
    type: "module",
    penguin: {
      version: "2026.11.19.1",
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
                renderer: { iframe: { src: "ui/index.html" } },
              },
            ],
          },
        },
      ],
    },
  });
  await copyFile(path.join(common, "index.ts"), path.join(wb, "index.ts"));
  await copyFile(path.join(root, "LICENSE"), path.join(pkg, "LICENSE"));
  for (const file of [
    "host.css",
    "host.js",
    ...(id === "harbor-pulse" ? [] : ["chime.js"]),
  ])
    await copyFile(path.join(common, file), path.join(ui, file));
  const icon =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
    game.icon +
    "</svg>\n";
  await writeFile(path.join(pkg, "icon.svg"), icon);
  await writeFile(path.join(ui, "icon.svg"), icon);
  await writeFile(
    path.join(ui, "index.html"),
    html.replaceAll("{{name}}", name).replaceAll("{{accent}}", game.accent),
  );
  const source = upstream + "/" + game.source;
  await writeFile(
    path.join(pkg, "README.md"),
    `# ${name}\n\n${description}\n\nInstall the plugin on your Agent, then open ${name} in the App Center.\n\n${game.controls} Pause with Escape. Sound and the high score are saved in this browser.\n\nThe game design, canvas art and audio synthesis are original to this showcase. The starting idea came from [${game.source} in riba2534’s three-game demo](${source}). The files in this package are distributed under [Apache-2.0](LICENSE).\n\n[中文](README.zh.md)\n`,
  );
  await writeFile(
    path.join(pkg, "README.zh.md"),
    `# ${zh}\n\n${descriptionZh}\n\n将插件安装到智能体，再从应用中心打开“${zh}”。\n\n${game.controlsZh}按 Esc 可暂停。声音偏好和最高分保存在当前浏览器。\n\n玩法、画面和合成音效为本案例原创。创作灵感来自 [riba2534 三款游戏演示中的 ${game.source}](${source})。本包文件采用 [Apache-2.0](LICENSE) 许可。\n\n[English](README.md)\n`,
  );
}
