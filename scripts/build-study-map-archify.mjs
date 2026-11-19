// Build the official renderers for the browser from a clean, pinned Archify checkout.
// Usage: node scripts/build-study-map-archify.mjs /path/to/archify
import { execFileSync } from "node:child_process";
import { cp, readFile, realpath } from "node:fs/promises";
import { resolve, basename } from "node:path";
import { rolldown } from "rolldown";

const revision = "44781293f38728baf04dbad33ce1a0cef8c39cca";
const repo = await realpath(resolve(process.argv[2] ?? ""));
const git = (...args) =>
  execFileSync("git", ["-C", repo, ...args], { encoding: "utf8" }).trim();
if (
  git("rev-parse", "HEAD") !== revision ||
  git("status", "--porcelain", "--untracked-files=no")
)
  throw new Error("Check out the clean Archify revision " + revision);
const skill = resolve(repo, "archify");
const vendor = new URL(
  "../plugins/study-map/workbenches/study-map/ui/vendor/",
  import.meta.url,
);
const read = (path) => readFile(resolve(skill, path), "utf8");
const notices = ["NOTICE", "LICENSE", "LICENSE-MIT", "THIRD_PARTY_NOTICES.md"];
for (const [src, dst] of [
  ["THIRD_PARTY_NOTICES.md", "THIRD_PARTY_NOTICES.md"],
  ["assets/JetBrainsMono-OFL.txt", "JetBrainsMono-OFL.txt"],
])
  await cp(resolve(skill, src), new URL(dst, vendor));
const licenseText = (
  await Promise.all(
    notices.map(async (n) => n + "\n" + (await read(n)).trimEnd()),
  )
).join("\n\n");
const viewer = (await read("assets/template.html")).replace(
  "</head>",
  () =>
    '<script type="application/json" id="archify-software-notices">' +
    JSON.stringify(licenseText).replace(/</g, "\\u003c") +
    "</script>\n</head>",
);
const shared = "./renderers/shared/";
const entry = resolve(skill, "browser-entry.mjs");
const en = JSON.parse(await read("locales/en.json")),
  zh = JSON.parse(await read("locales/zh-CN.json"));
const bundle = await rolldown({
  input: entry,
  cwd: skill,
  platform: "browser",
  transform: {
    define: {
      "process.env.ARCHIFY_DIAGNOSTIC_FORMAT": "undefined",
      "process.env.ARCHIFY_QUALITY_PROFILE": "undefined",
    },
  },
  plugins: [
    {
      name: "archify-browser-io",
      resolveId(id) {
        if (id === entry) return entry;
      },
      async load(id) {
        if (id === entry)
          return `
        import { render as architecture } from './renderers/architecture/render-architecture.mjs';
        import { render as tree } from './renderers/tree/render-tree.mjs';
        import { applyTemplate, renderCards } from '${shared}utils.mjs';
        import { validateSchema } from '${shared}validator.mjs';
        import { registerLocale } from './renderers/shared/i18n.mjs';
        const template = ${JSON.stringify(viewer)};
        export function render(diagram) {
          validateSchema(diagram.diagram_type, diagram);
          registerLocale(diagram.meta.locale,diagram.meta.translations);
          const svg = (diagram.diagram_type === "tree" ? tree : architecture)(diagram);
          const meta = diagram.meta;
          return applyTemplate(template, {title:meta.title, subtitle:meta.subtitle, svg, cards:renderCards(diagram.cards), locale:meta.locale, visualPreset:meta.visual_preset});
        }`;
        if (!id.startsWith(skill + "/renderers/")) return;
        const s = await readFile(id, "utf8");
        switch (basename(id)) {
          case "render-tree.mjs":
          case "render-architecture.mjs": {
            // The CLI reads its IR and writes its HTML at module top level. Keep all
            // its layout, geometry, validation and SVG code in one per-render scope.
            const tree = basename(id) === "render-tree.mjs";
            const source = s.slice(
              s.indexOf("import { esc"),
              s.lastIndexOf("\nif (layoutJsonMode)"),
            );
            const preamble = source.slice(0, source.indexOf("const __dirname"));
            const body = source.slice(
              source.indexOf(
                tree
                  ? "const locale = tree.meta.locale"
                  : "const grid = gridLayout(arch)",
              ),
            );
            return (
              preamble.replace(
                /\b(loadDiagramWithBrandMarks|loadDiagram|writeDiagram|rendererFailure),\s*/g,
                "",
              ) +
              "export function render(" +
              (tree ? "tree" : "arch") +
              ") {\nconst sourceEvidence=null;\n" +
              body +
              (tree ? "" : "\nvalidateArchitecture();") +
              "\nreturn renderSvg();\n}"
            );
          }
          case "portable-path.mjs":
            return s.replace(
              "Buffer.byteLength(segment, 'utf8')",
              "new TextEncoder().encode(segment).length",
            );
          case "path-semantics.mjs":
            return s.replaceAll(
              "Buffer.byteLength(value, 'utf8')",
              "new TextEncoder().encode(value).length",
            );
          case "cli.mjs":
            return (
              `import {esc} from "./utils.mjs"; import {resolveLocale,translateMessage} from "./i18n.mjs";\n` +
              s.slice(s.indexOf("export function svgRootAttrs"))
            );
          case "i18n.mjs":
            return (
              s
                .slice(
                  s.indexOf("export const DEFAULT_LOCALE"),
                  s.indexOf("function readLocaleData"),
                )
                .replace(/^const LOCALES_DIR = .*$/m, "") +
              "const catalogs=" +
              JSON.stringify({
                "en.json": en,
                "zh-CN.json": zh,
                "manifest.json": {
                  catalogs: [
                    { locale: "en", file: "en.json" },
                    { locale: "zh-CN", file: "zh-CN.json" },
                  ],
                },
              }) +
              ";\nfunction readLocaleData(file){return catalogs[file];}\n" +
              s.slice(s.indexOf("function loadManifest"))
            );
          case "brand-marks.mjs":
            // No remote capture or third-party logos are requested by this app's IR.
            return (
              'import { esc, textUnits } from "./utils.mjs"; const RESOLVED_MARK=Symbol(); const RESOLVED_BY_NODE=new WeakMap();\n' +
              s.slice(s.indexOf("export function brandMarkFor"))
            );
          case "diagnostics.mjs":
            return s.slice(
              s.indexOf("const DIAGNOSTIC_MODE"),
              s.indexOf("function fallbackDiagnostic"),
            );
        }
      },
    },
  ],
});
await bundle.write({
  file: new URL("archify.js", vendor).pathname,
  format: "iife",
  name: "ArchifyRenderer",
  banner:
    "/*! Archify 3.2.0 · tt-a1i and contributors · Apache-2.0 · " +
    revision +
    " · browser I/O adaptation: scripts/build-study-map-archify.mjs */",
});
await bundle.close();
