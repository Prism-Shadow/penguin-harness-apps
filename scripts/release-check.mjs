/** Validate plugin manifests, build each npm tarball twice outside the checkout and check the
 * published npm integrity where requested. The output directory is ready for GitHub Release. */
import { execFileSync } from "node:child_process";
import {
  mkdir,
  mkdtemp,
  rm,
  readFile,
  readdir,
  writeFile,
  copyFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { tmpdir } from "node:os";

const root = fileURLToPath(new URL("../", import.meta.url));
const REGISTRY = "https://registry.npmjs.org";
const SCOPE = "@penguinharness/";
const EXACT_VERSION = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;

const { values } = parseArgs({
  options: {
    registry: { type: "boolean", default: false },
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

/** Runs the repository's packer; maps each archive path it wrote to what it reported. */
function packAll(out) {
  const npm = process.env.npm_execpath;
  const [command, prefix] =
    npm && /\.[cm]?js$/.test(npm) ? [process.execPath, [npm]] : ["npm", []];
  const output = execFileSync(
    command,
    [...prefix, "run", "--silent", "pack:plugins", "--", "--out", out],
    { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] },
  );
  const packed = new Map();
  for (const line of output.split("\n")) {
    if (!line.startsWith("{")) continue;
    const report = JSON.parse(line);
    packed.set(path.basename(report.file), report);
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
        `${plugin.file} is ${plugin.integrity}. A published version cannot change: ` +
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
stopOnProblems();

const temp = await mkdtemp(path.join(tmpdir(), "penguin-release-"));
try {
  const first = packAll(path.join(temp, "first"));
  const second = packAll(path.join(temp, "second"));
  for (const plugin of plugins) {
    const pack = first.get(plugin.file);
    if (!pack || pack.integrity !== second.get(plugin.file)?.integrity) {
      throw new Error(
        `Non-reproducible pack for ${plugin.name}@${plugin.version}`,
      );
    }
    plugin.integrity = pack.integrity;
    if (values.registry) plugin.npm = await npmState(plugin);
    console.log(`${plugin.name}@${plugin.version}  ${plugin.integrity}`);
  }
  if (problems.length) throw new Error(problems.join("\n"));
  if (values.out) {
    const out = path.resolve(values.out);
    await mkdir(out, { recursive: true });
    for (const { file } of plugins)
      await copyFile(path.join(temp, "first", file), path.join(out, file));
    const listing = plugins.map(({ name, version, file, integrity }) => ({
      name,
      version,
      file,
      integrity,
    }));
    await writeFile(
      path.join(out, "packages.json"),
      JSON.stringify(listing, null, 2) + "\n",
    );
  }
} finally {
  await rm(temp, { recursive: true, force: true });
}
