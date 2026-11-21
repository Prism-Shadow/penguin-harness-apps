/**
 * release-check: what a release publishes, checked before anything is published.
 *
 *   node scripts/release-check.mjs [--registry] [--require-npm-names] [--out <dir>]
 *
 * 1. Manifests. Every plugins/<slug>/package.json names `@penguinharness/<slug>` at an exact
 *    version, with an ifaces.json beside it, and every archives/*.tgz is named
 *    `<slug>-<version>.tgz` after the package.json inside it.
 * 2. Packs every plugin twice with `npm run pack:plugins`. Both packs must give the same bytes,
 *    and those bytes must be the committed archives/<slug>-<version>.tgz. The plugin index pins
 *    each archive's sha512, so a version that is archived is never published with other bytes:
 *    a plugin that changed needs a new version and a new archive.
 * 3. --registry asks npm about each package. A version npm already has must carry the same
 *    integrity, and a version it lacks is marked "new" for the release to publish. With
 *    --require-npm-names, a package name npm does not know fails the check, because trusted
 *    publishing cannot create a package: its first version is published by hand.
 * 4. --out copies each plugin's committed archive to <dir> and writes <dir>/packages.json for
 *    the release workflow.
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { gunzipSync } from "node:zlib";

const root = fileURLToPath(new URL("../", import.meta.url));
const REGISTRY = "https://registry.npmjs.org";
const SCOPE = "@penguinharness/";
const EXACT_VERSION = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;

const { values } = parseArgs({
  options: {
    registry: { type: "boolean", default: false },
    "require-npm-names": { type: "boolean", default: false },
    out: { type: "string" },
  },
});

const problems = [];
const fail = (message) => problems.push(message);
function stopOnProblems() {
  if (problems.length === 0) return;
  for (const message of problems) console.error(`release-check: ${message}`);
  process.exit(1);
}

const integrityOf = (bytes) =>
  "sha512-" + createHash("sha512").update(bytes).digest("base64");

/** The package.json inside an npm tarball, or null. */
function manifestOf(tgz) {
  const tar = gunzipSync(tgz);
  for (let at = 0; at + 512 <= tar.length;) {
    const header = tar.subarray(at, at + 512);
    if (header.every((byte) => byte === 0)) break;
    const field = (start, length) =>
      header
        .subarray(start, start + length)
        .toString("utf8")
        .replace(/\0[\s\S]*$/, "");
    const size = parseInt(field(124, 12).trim() || "0", 8);
    const prefix = field(345, 155);
    const name = (prefix ? prefix + "/" : "") + field(0, 100);
    const type = field(156, 1);
    at += 512;
    if ((type === "0" || type === "") && name === "package/package.json") {
      return JSON.parse(tar.subarray(at, at + size).toString("utf8"));
    }
    at += Math.ceil(size / 512) * 512;
  }
  return null;
}

/** The bytes of `file` in the checked-out commit, or null when it is not committed. */
function committed(file) {
  try {
    return execFileSync("git", ["show", `HEAD:${file}`], {
      cwd: root,
      maxBuffer: 1 << 30,
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return null;
  }
}

/** Runs the repository's packer; maps each archive path it wrote to what it reported. */
function packAll() {
  const npm = process.env.npm_execpath;
  const [command, prefix] =
    npm && /\.[cm]?js$/.test(npm) ? [process.execPath, [npm]] : ["npm", []];
  const output = execFileSync(
    command,
    [...prefix, "run", "--silent", "pack:plugins"],
    { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] },
  );
  const packed = new Map();
  for (const line of output.split("\n")) {
    if (!line.startsWith("{")) continue;
    const report = JSON.parse(line);
    packed.set(report.file, report);
  }
  return packed;
}

async function npmState(plugin) {
  const url = `${REGISTRY}/${plugin.name.replace("/", "%2f")}`;
  let response;
  for (let attempt = 1; ; attempt++) {
    try {
      response = await fetch(url, {
        headers: { accept: "application/vnd.npm.install-v1+json" },
      });
      if (response.status < 500) break;
    } catch (error) {
      if (attempt === 3) throw error;
    }
    if (attempt === 3) break;
    await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
  }
  if (response.status === 404) return "unregistered";
  if (!response.ok) {
    throw new Error(
      `${REGISTRY} answered ${response.status} for ${plugin.name}`,
    );
  }
  const published = (await response.json()).versions?.[plugin.version];
  if (!published) return "new";
  if (published.dist?.integrity !== plugin.integrity) {
    fail(
      `npm has ${plugin.name}@${plugin.version} as ${published.dist?.integrity}, but ` +
        `archives/${plugin.file} is ${plugin.integrity}. A published version cannot change: ` +
        "give the plugin a new version.",
    );
  }
  return "published";
}

// 1. Manifests.
const plugins = [];
const entries = await readdir(path.join(root, "plugins"), {
  withFileTypes: true,
});
for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
  if (!entry.isDirectory()) continue;
  const slug = entry.name;
  const dir = `plugins/${slug}`;
  let pkg;
  try {
    pkg = JSON.parse(
      await readFile(path.join(root, dir, "package.json"), "utf8"),
    );
  } catch (error) {
    fail(`${dir}/package.json: ${error.message}`);
    continue;
  }
  if (pkg.name !== SCOPE + slug) {
    fail(
      `${dir}/package.json: name is ${JSON.stringify(pkg.name)}, not "${SCOPE}${slug}"`,
    );
  }
  if (typeof pkg.version !== "string" || !EXACT_VERSION.test(pkg.version)) {
    fail(
      `${dir}/package.json: version ${JSON.stringify(pkg.version)} is not exact`,
    );
  }
  if (pkg.private === true)
    fail(`${dir}/package.json: a published plugin is not private`);
  try {
    JSON.parse(await readFile(path.join(root, dir, "ifaces.json"), "utf8"));
  } catch (error) {
    fail(
      `${dir}/ifaces.json: ${error.code === "ENOENT" ? "missing" : error.message}`,
    );
  }
  plugins.push({
    slug,
    name: pkg.name,
    version: pkg.version,
    file: `${slug}-${pkg.version}.tgz`,
  });
}
if (plugins.length === 0) fail("no plugins under plugins/");
for (const file of (await readdir(path.join(root, "archives"))).sort()) {
  if (!file.endsWith(".tgz")) {
    fail(`archives/${file}: archives/ holds package tarballs only`);
    continue;
  }
  let manifest;
  try {
    manifest = manifestOf(await readFile(path.join(root, "archives", file)));
  } catch (error) {
    fail(`archives/${file}: ${error.message}`);
    continue;
  }
  const expected =
    manifest &&
    `${String(manifest.name).replace(/^@[^/]+\//, "")}-${manifest.version}.tgz`;
  if (!manifest) fail(`archives/${file}: no package/package.json inside`);
  else if (file !== expected) {
    fail(
      `archives/${file} holds ${manifest.name}@${manifest.version}, so it must be named ${expected}`,
    );
  }
}
stopOnProblems();

// 2. Two packs, the committed bytes.
try {
  execFileSync("git", ["rev-parse", "--verify", "HEAD"], {
    cwd: root,
    stdio: "ignore",
  });
} catch {
  fail(
    "not a git checkout: the packs are compared with the committed archives",
  );
  stopOnProblems();
}
const packs = [packAll(), packAll()];
const archived = new Map();
for (const plugin of plugins) {
  const file = `archives/${plugin.file}`;
  const [first, second] = packs.map((packed) => packed.get(file));
  if (!first || !second) {
    fail(`npm run pack:plugins did not write ${file}`);
    continue;
  }
  if (first.integrity !== second.integrity) {
    fail(
      `two packs of ${plugin.name}@${plugin.version} differ: ${first.integrity}, ${second.integrity}`,
    );
    continue;
  }
  const bytes = committed(file);
  if (!bytes) {
    fail(
      `${file} is not committed. Commit the archive of a new version with its version bump.`,
    );
    continue;
  }
  plugin.integrity = integrityOf(bytes);
  if (first.integrity !== plugin.integrity) {
    fail(
      `packing ${plugin.name}@${plugin.version} gives ${first.integrity}, but the committed ` +
        `${file} is ${plugin.integrity}. The plugin changed without a new version: bump its ` +
        "version and pack again, and leave the archived version as it is.",
    );
    continue;
  }
  archived.set(plugin.file, bytes);
}
const stray = execFileSync(
  "git",
  ["status", "--porcelain", "--untracked-files=all", "--", "archives/"],
  { cwd: root, encoding: "utf8" },
).trim();
if (stray) fail(`archives/ differs from the commit after packing:\n${stray}`);
stopOnProblems();

// 3. What npm has.
if (values.registry) {
  for (const plugin of plugins) {
    plugin.npm = await npmState(plugin);
    if (plugin.npm === "unregistered" && values["require-npm-names"]) {
      fail(
        `npm does not know ${plugin.name} yet. Publish its first version by hand ` +
          `(npm publish archives/${plugin.file} --access public), then set up trusted publishing for it.`,
      );
    }
  }
  stopOnProblems();
}

for (const plugin of plugins) {
  const npm = plugin.npm ? `  npm: ${plugin.npm}` : "";
  console.log(`${plugin.name}@${plugin.version}  ${plugin.integrity}${npm}`);
}

// 4. What the release attaches and publishes.
if (values.out) {
  const out = path.resolve(values.out);
  await mkdir(out, { recursive: true });
  for (const plugin of plugins) {
    await writeFile(path.join(out, plugin.file), archived.get(plugin.file));
  }
  const listing = plugins.map(({ name, version, file, integrity, npm }) => ({
    name,
    version,
    file,
    integrity,
    ...(npm ? { npm } : {}),
  }));
  await writeFile(
    path.join(out, "packages.json"),
    JSON.stringify(listing, null, 2) + "\n",
  );
}
