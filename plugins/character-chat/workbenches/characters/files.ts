/// <reference path="./node-builtins.d.ts" />
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { isCharacterId } from "./stage.js";

export type CharacterFiles = {
  filePath(rel: string): string;
  listFiles(): Promise<{ path: string; size: number; mtimeMs: number }[]>;
  readFile(rel: string): Promise<Uint8Array | null>;
  writeFile(rel: string, value: string): Promise<unknown>;
  removeFile(rel: string): Promise<unknown>;
};

const missing = (err: unknown) => (err as { code?: string }).code === "ENOENT";
const exists = async (file: string) => {
  try { return await fs.lstat(file); }
  catch (err) { if (missing(err)) return null; throw err; }
};

export function characterFiles(root: string, previous?: string): CharacterFiles {
  const shelf = path.join(root, "characters");
  const pieces = (rel: string) => {
    const [folder, id, name, extra] = rel.split("/");
    if (folder !== "characters" || !id || !isCharacterId(id) ||
        (name !== "card.md" && name !== "memory.md") || extra !== undefined) throw Error("Invalid character file");
    return { dir: path.join(shelf, id), file: path.join(shelf, id, name) };
  };
  const plainDir = async (dir: string) => {
    const stat = await exists(dir);
    if (stat && !stat.isDirectory()) throw Error("Expected a character directory");
  };
  const checked = async (rel: string) => {
    const location = pieces(rel);
    await plainDir(root);
    await plainDir(shelf);
    await plainDir(location.dir);
    const stat = await exists(location.file);
    if (stat && !stat.isFile()) throw Error("Expected a regular character file");
    return { ...location, stat };
  };
  const listing = async () => {
    await plainDir(root);
    await plainDir(shelf);
    if (!(await exists(shelf))) return [];
    const result: { path: string; size: number; mtimeMs: number }[] = [];
    for (const entry of await fs.readdir(shelf, { withFileTypes: true })) {
      if (!entry.isDirectory() || !isCharacterId(entry.name)) continue;
      for (const leaf of await fs.readdir(path.join(shelf, entry.name), { withFileTypes: true })) {
        if (leaf.isFile() && (leaf.name === "card.md" || leaf.name === "memory.md")) {
          const relative = `characters/${entry.name}/${leaf.name}`;
          const stat = await exists(path.join(root, relative));
          if (stat?.isFile()) result.push({ path: relative, size: stat.size, mtimeMs: stat.mtimeMs });
        }
      }
    }
    return result.sort((a, b) => a.path.localeCompare(b.path));
  };
  let migration: Promise<void> | undefined;
  const migrate = async () => {
    if (!previous || !(await exists(previous))) return;
    await plainDir(root);
    const marker = path.join(root, ".character-files-migrated");
    if (await exists(marker)) return;
    const old = characterFiles(previous);
    for (const { path: rel } of await old.listFiles()) {
      const { dir, file, stat } = await checked(rel);
      if (stat) continue;
      await fs.mkdir(dir, { recursive: true });
      // Copy into place without replacing an entry another writer already created.
      const bytes = await old.readFile(rel);
      if (bytes) {
        try { await fs.writeFile(file, bytes, { flag: "wx" }); }
        catch (err) { if ((err as { code?: string }).code !== "EEXIST") throw err; }
      }
    }
    await fs.mkdir(root, { recursive: true });
    await fs.writeFile(marker, "1\n");
  };
  const ready = () => migration ??= migrate().catch((err) => { migration = undefined; throw err; });
  return {
    filePath: (rel) => rel === "characters" ? shelf : pieces(rel).file,
    async listFiles() { await ready(); return listing(); },
    async readFile(rel) {
      await ready();
      const { file, stat } = await checked(rel);
      if (stat && stat.size > 1024 * 1024) throw Error("Character file exceeds 1 MiB");
      return stat ? fs.readFile(file) : null;
    },
    async writeFile(rel, value) {
      await ready();
      const { dir, file } = await checked(rel);
      await fs.mkdir(dir, { recursive: true });
      const staged = await fs.mkdtemp(path.join(dir, ".save-"));
      try {
        await fs.writeFile(path.join(staged, "contents"), value);
        await fs.rename(path.join(staged, "contents"), file);
      } finally { await fs.rm(staged, { recursive: true, force: true }); }
    },
    async removeFile(rel) {
      await ready();
      const { file, stat } = await checked(rel);
      if (stat) await fs.unlink(file);
    },
  };
}

export function workbenchFiles(host: Partial<CharacterFiles> & { dataPaths?(): { dataDir: string } }) {
  if (typeof host.dataPaths === "function") {
    const here = path.dirname(fileURLToPath(import.meta.url));
    // Older workbench previews kept .files beside the source. An installed handler runs in
    // <workbench>/.build/<revision>; a source checkout never imports another directory.
    const previous = path.basename(path.dirname(here)) === ".build" ? path.resolve(here, "../../.files") : undefined;
    return characterFiles(host.dataPaths().dataDir, previous);
  }
  return typeof host.listFiles === "function" ? host as CharacterFiles : null;
}
