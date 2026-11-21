import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, readdir, rename, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const plugins = path.join(root, "plugins");
const archives = path.join(root, "archives");
const args = process.argv.slice(2);
const names = args.length ? args : (await readdir(plugins, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
await mkdir(archives, { recursive: true });
const temporary = await mkdtemp(path.join(archives, ".pack-"));
const npmCli = process.env.npm_execpath ?? (process.platform === "win32"
  ? path.join(path.dirname(process.execPath), "node_modules/npm/bin/npm-cli.js")
  : undefined);
try {
  for (const slug of names) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error(`Invalid plugin directory: ${slug}`);
    const cwd = path.join(plugins, slug);
    const [pack] = JSON.parse(execFileSync(npmCli ? process.execPath : "npm", [
      ...(npmCli ? [npmCli] : []),
      "pack", "--ignore-scripts", "--json", "--pack-destination", temporary,
    ], { cwd, encoding: "utf8" }));
    const files = new Set(pack.files.map((file) => file.path));
    if (!files.has("ifaces.json")) throw new Error(`${slug}: the package must include ifaces.json`);
    const table = JSON.parse(await readFile(path.join(cwd, "ifaces.json"), "utf8"));
    for (const module of Object.values(table.modules)) {
      for (const workbench of module.contributes?.["PluginLibraryModule.workbenches"] ?? []) {
        for (const entry of ["package.json", "index.ts"]) {
          if (!files.has(`${workbench.path}/${entry}`)) throw new Error(`${slug}: missing ${workbench.path}/${entry}`);
        }
      }
    }
    const tarball = path.join(temporary, pack.filename);
    const integrity = "sha512-" + createHash("sha512").update(await readFile(tarball)).digest("base64");
    if (pack.integrity !== integrity) throw new Error(`${slug}: npm reported a different digest`);
    const file = `archives/${slug}-${pack.version}.tgz`;
    await rename(tarball, path.join(root, file));
    console.log(JSON.stringify({ name: pack.name, version: pack.version, file, integrity }));
  }
} finally {
  await rm(temporary, { recursive: true, force: true });
}
