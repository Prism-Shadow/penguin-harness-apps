import { randomUUID } from "node:crypto";
import { constants } from "node:fs";
import { open, rename, writeFile } from "node:fs/promises";

export async function atomicJson(file: string, value: unknown) {
  const part = file + "." + randomUUID() + ".part";
  const options = { flag: "wx", mode: 0o600 };
  await writeFile(part, JSON.stringify(value) + "\n", options);
  await rename(part, file);
}

export async function readJson(file: string) {
  const handle = await open(file, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    return JSON.parse(await handle.readFile("utf8"));
  } finally {
    await handle.close();
  }
}
