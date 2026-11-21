import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, it } from "vitest";
import { characterFiles } from "../workbenches/characters/files.js";

const scratch: string[] = [];
afterEach(async () => { for (const dir of scratch.splice(0)) await rm(dir, { recursive: true, force: true }); });
it("migrates cards and memory once, preserves edits and deletions after reopening", async () => {
  const dir = await mkdtemp(join(tmpdir(), "character-upgrade-"));
  scratch.push(dir);
  const old = join(dir, ".files");
  const data = join(dir, "data");
  await mkdir(join(old, "characters", "pip"), { recursive: true });
  await writeFile(join(old, "characters", "pip", "card.md"), "my original card");
  await writeFile(join(old, "characters", "pip", "memory.md"), "remembers rain");
  const files = characterFiles(data, old);
  expect((await files.listFiles()).map((entry) => entry.path)).toEqual(["characters/pip/card.md", "characters/pip/memory.md"]);
  expect(new TextDecoder().decode(await files.readFile("characters/pip/memory.md"))).toBe("remembers rain");
  await files.writeFile("characters/pip/card.md", "my edited card");
  await files.removeFile("characters/pip/memory.md");
  const reopened = characterFiles(data, old);
  expect(await reopened.readFile("characters/pip/memory.md")).toBeNull();
  expect(new TextDecoder().decode(await reopened.readFile("characters/pip/card.md"))).toBe("my edited card");
  expect(await readFile(join(old, "characters", "pip", "card.md"), "utf8")).toBe("my original card");
  await symlink(dir, join(data, "characters", "other"), "dir");
  await expect(reopened.writeFile("characters/other/card.md", "outside")).rejects.toThrow("directory");
});
