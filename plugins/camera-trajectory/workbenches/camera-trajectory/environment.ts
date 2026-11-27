import { execFile } from "node:child_process";
import { lstat, mkdir, mkdtemp, rm } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import type { WorkbenchHost } from "@prismshadow/penguin-server/plugin";
import { atomicJson, readJson } from "./storage.js";

const run = promisify(execFile);
const modules = ["numpy", "cv2"] as const;
type ModuleName = (typeof modules)[number];
type ModuleCheck = { version?: string; error?: string };
type PythonCheck = {
  executable: string;
  version?: string;
  modules?: Record<ModuleName, ModuleCheck>;
  error?: "missing" | "unusable";
};
type Preparation = {
  status: "preparing" | "failed";
  step: "checking" | "creating" | "installing" | "verifying" | "saving";
  error?: "python_missing" | "venv_failed" | "install_failed" | "imports_failed" | "configuration_failed";
  installer?: "uv" | "pip";
};
type Configuration = { python: string; installer: "uv" | "pip" };

// Independently compiled copies of the workbench share the project install in this host process.
const preparationKey = Symbol.for("@penguinharness/camera-trajectory/preparations");
const processState = globalThis as typeof globalThis & {
  [preparationKey]?: Map<string, Preparation>;
};
const preparations = (processState[preparationKey] ??= new Map());

const probe = `
import importlib
import json
import platform
import sys

def check(name):
    try:
        return {"version": importlib.import_module(name).__version__}
    except Exception as error:
        return {"error": str(error)[:200]}

print(json.dumps({
    "executable": sys.executable,
    "version": platform.python_version(),
    "modules": {name: check(name) for name in ("numpy", "cv2")},
}))
`;

function projectConfigDir(host: WorkbenchHost, agentData: string) {
  // The host places agent data at <project>/agents/<agent>/app/data/<workbench>.
  const agentDir = path.resolve(agentData, "../../..");
  const agentsDir = path.dirname(agentDir);
  if (path.basename(agentsDir) !== "agents") return;
  try {
    const projectId = path.basename(path.dirname(agentsDir));
    return path.join(host.dataPaths("server").dataDir, projectId);
  } catch {
    // An in-place (non-plugin) workbench has no writable server-level storage.
    return;
  }
}

const venvExecutable = (dir: string) => process.platform === "win32"
  ? path.join(dir, "Scripts", "python.exe")
  : path.join(dir, "bin", "python");

export function cameraEnvironment(host: WorkbenchHost, agentData: string, tools: string, env: NodeJS.ProcessEnv) {
  const projectDir = projectConfigDir(host, agentData);
  const bootstrap = process.env.PENGUIN_CAMERA_PYTHON || "python3";
  const blender = process.env.PENGUIN_CAMERA_BLENDER || "blender";
  function command(program: string, args: string[], timeout = 10_000, cwd?: string) {
    return run(program, args, { cwd, env, timeout, encoding: "utf8", maxBuffer: 512 * 1024 });
  }

  async function configuration(): Promise<Configuration | undefined> {
    if (!projectDir) return;
    try {
      if (!(await lstat(projectDir)).isDirectory()) return;
      const config: Configuration = await readJson(path.join(projectDir, "environment.json"));
      if (typeof config.python !== "string" || !["uv", "pip"].includes(config.installer)) return;
      const venvDir = path.resolve(config.python, "../..");
      if (path.dirname(venvDir) === projectDir &&
          path.basename(venvDir).startsWith("venv-") && config.python === venvExecutable(venvDir)) {
        return config;
      }
    } catch {
      // A project with no saved environment uses its server's configured interpreter.
    }
  }

  async function checkPython(executable: string): Promise<PythonCheck> {
    try {
      const { stdout } = await command(executable, ["-I", "-B", "-c", probe]);
      return JSON.parse(stdout);
    } catch (error) {
      return { executable, error: (error as NodeJS.ErrnoException).code === "ENOENT" ? "missing" : "unusable" };
    }
  }

  async function checkBlender() {
    try {
      const { stdout } = await command(blender, ["--version"]);
      const version = stdout.match(/^Blender (.+)$/m)?.[1];
      return { executable: blender, version };
    } catch {
      return { executable: blender };
    }
  }

  function ready(check: PythonCheck) {
    return !!check.modules && modules.every((name) => !!check.modules?.[name].version);
  }

  async function inspect() {
    const preparation = projectDir ? preparations.get(projectDir) : undefined;
    const config = await configuration();
    const selected = config?.python ?? bootstrap;
    const [python, renderer] = await Promise.all([checkPython(selected), checkBlender()]);
    return {
      python: { ...python, ready: ready(python), installer: config?.installer },
      blender: renderer,
      preparation,
      canPrepare: !!projectDir && (selected === bootstrap ? !python.error : true),
    };
  }

  async function install(dir: string, preparation: Preparation) {
    let venvDir: string | undefined;
    let success = false;
    let error: NonNullable<Preparation["error"]> = "configuration_failed";
    try {
      const current = await configuration();
      if (ready(await checkPython(current?.python ?? bootstrap))) {
        success = true;
        return;
      }
      const base = await checkPython(bootstrap);
      error = "python_missing";
      if (base.error) throw new Error(error);
      error = "configuration_failed";
      const directory = { recursive: true as const, mode: 0o700 };
      await mkdir(dir, directory);
      if (!(await lstat(dir)).isDirectory()) throw new Error(error);
      const hasUv = await command("uv", ["--version"]).then(() => true, () => false);
      preparation.installer = hasUv ? "uv" : "pip";
      preparation.step = "creating";
      venvDir = await mkdtemp(path.join(dir, "venv-"));
      const python = venvExecutable(venvDir);
      const requirements = path.join(tools, "requirements.txt");
      error = "venv_failed";
      await command(base.executable, ["-m", "venv", ...(hasUv ? ["--without-pip"] : []), venvDir], 45_000, dir);
      preparation.step = "installing";
      error = "install_failed";
      if (hasUv) {
        await command("uv", ["pip", "install", "--python", python, "-r", requirements], 180_000, dir);
      } else {
        await command(python, ["-m", "pip", "install", "--disable-pip-version-check", "--no-input", "-r", requirements], 180_000, dir);
      }
      preparation.step = "verifying";
      error = "imports_failed";
      if (!ready(await checkPython(python))) throw new Error(error);
      preparation.step = "saving";
      error = "configuration_failed";
      await atomicJson(path.join(dir, "environment.json"), { python, installer: preparation.installer });
      host.log(`Camera trajectory environment prepared with ${preparation.installer}: ${python}`);
      success = true;
    } catch {
      preparation.error = error;
      host.log(`Camera trajectory environment preparation failed: ${error}`);
    } finally {
      if (success) {
        preparations.delete(dir);
      } else {
        if (venvDir) await rm(venvDir, { recursive: true, force: true }).catch(() => undefined);
        preparation.status = "failed";
      }
    }
  }

  function prepare() {
    if (!projectDir) return false;
    if (preparations.get(projectDir)?.status === "preparing") return true;
    const preparation: Preparation = { status: "preparing", step: "checking" };
    preparations.set(projectDir, preparation);
    void install(projectDir, preparation);
    return true;
  }

  return { inspect, prepare, blender, python: async () => (await configuration())?.python ?? bootstrap };
}
