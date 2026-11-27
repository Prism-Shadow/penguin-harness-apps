import { execFile } from "node:child_process";
import { accessSync, constants, statSync } from "node:fs";
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
  error?:
    | "python_missing"
    | "venv_failed"
    | "install_failed"
    | "imports_failed"
    | "configuration_failed";
  installer?: "uv" | "pip";
};
type Configuration = { python: string; installer: "uv" | "pip" };

// Independently compiled copies of the workbench share the project install in this host process.
const preparationKey = Symbol.for(
  "@penguinharness/camera-trajectory/preparations",
);
const processState = globalThis as typeof globalThis & {
  [preparationKey]?: Map<string, Preparation>;
};
const preparations = (processState[preparationKey] ??= new Map());

const probe = `
import importlib
import json
import platform
import re
import sys

def check(name):
    try:
        version = importlib.import_module(name).__version__
        if name == "cv2":
            match = re.match(r"^(\\d+)\\.(\\d+)", version)
            if not match or tuple(map(int, match.groups())) < (4, 10):
                return {"version": version, "error": "opencv_version"}
        return {"version": version}
    except Exception as error:
        return {"error": str(error)[:200]}

print(json.dumps({
    "executable": sys.executable,
    "version": platform.python_version(),
    "error": "unusable" if sys.version_info < (3, 10) else None,
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

const venvExecutable = (dir: string) =>
  process.platform === "win32"
    ? path.join(dir, "Scripts", "python.exe")
    : path.join(dir, "bin", "python");

export function windowsBlenderCandidates(env: NodeJS.ProcessEnv) {
  const roots = new Set(
    [
      env.ProgramW6432,
      env.ProgramFiles,
      env["ProgramFiles(x86)"],
      "C:\\Program Files",
    ].filter((root): root is string => !!root && path.win32.isAbsolute(root)),
  );
  return ["5.3", "4.5", "4.2"].flatMap((version) =>
    [...roots].map((root) =>
      path.win32.join(
        root,
        "Blender Foundation",
        "Blender " + version,
        "blender.exe",
      ),
    ),
  );
}

export function pythonCandidates(
  env: NodeJS.ProcessEnv,
  platform = process.platform,
) {
  if (env.PENGUIN_CAMERA_PYTHON) return [env.PENGUIN_CAMERA_PYTHON];
  return platform === "win32" ? ["python", "python3"] : ["python3", "python"];
}

function blenderExecutable(env: NodeJS.ProcessEnv) {
  if (env.PENGUIN_CAMERA_BLENDER) return env.PENGUIN_CAMERA_BLENDER;
  const candidates =
    process.platform === "win32"
      ? windowsBlenderCandidates(env)
      : (env.PATH ?? "")
          .split(path.delimiter)
          .filter((entry) => path.isAbsolute(entry))
          .map((entry) => path.join(entry, "blender-5.3"));
  for (const candidate of candidates) {
    try {
      if (!statSync(candidate).isFile()) continue;
      accessSync(candidate, constants.X_OK);
      return candidate;
    } catch {
      // Continue to the next installed version.
    }
  }
  return "blender";
}

export function cameraEnvironment(
  host: WorkbenchHost,
  agentData: string,
  tools: string,
  env: NodeJS.ProcessEnv,
) {
  const projectDir = projectConfigDir(host, agentData);
  const bootstrap = pythonCandidates(env);
  const blender = () => blenderExecutable(env);
  function command(
    program: string,
    args: string[],
    timeout = 10_000,
    cwd?: string,
  ) {
    return run(program, args, {
      cwd,
      env,
      timeout,
      encoding: "utf8",
      maxBuffer: 512 * 1024,
    });
  }

  async function configuration(): Promise<Configuration | undefined> {
    if (!projectDir) return;
    try {
      if (!(await lstat(projectDir)).isDirectory()) return;
      const config: Configuration = await readJson(
        path.join(projectDir, "environment.json"),
      );
      if (
        typeof config.python !== "string" ||
        !["uv", "pip"].includes(config.installer)
      )
        return;
      const venvDir = path.resolve(config.python, "../..");
      if (
        path.dirname(venvDir) === projectDir &&
        path.basename(venvDir).startsWith("venv-") &&
        config.python === venvExecutable(venvDir)
      ) {
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
      return {
        executable,
        error:
          (error as NodeJS.ErrnoException).code === "ENOENT"
            ? "missing"
            : "unusable",
      };
    }
  }

  async function checkBootstrap() {
    let check = await checkPython(bootstrap[0]);
    for (const executable of bootstrap.slice(1)) {
      if (!check.error) break;
      const alternative = await checkPython(executable);
      if (!alternative.error || check.error === "missing") check = alternative;
    }
    return check;
  }

  async function checkBlender() {
    const executable = blender();
    try {
      const { stdout } = await command(executable, ["--version"]);
      const version = stdout.match(/^Blender (.+)$/m)?.[1];
      return { executable, version };
    } catch {
      return { executable };
    }
  }

  function ready(check: PythonCheck) {
    return (
      !check.error &&
      !!check.modules &&
      modules.every(
        (name) => check.modules?.[name].version && !check.modules[name].error,
      )
    );
  }

  async function inspect() {
    const preparation = projectDir ? preparations.get(projectDir) : undefined;
    const config = await configuration();
    const [python, renderer] = await Promise.all([
      config ? checkPython(config.python) : checkBootstrap(),
      checkBlender(),
    ]);
    return {
      python: { ...python, ready: ready(python), installer: config?.installer },
      blender: renderer,
      preparation,
      canPrepare: !!projectDir && (!!config || !python.error),
    };
  }

  async function install(dir: string, preparation: Preparation) {
    let venvDir: string | undefined;
    let success = false;
    let error: NonNullable<Preparation["error"]> = "configuration_failed";
    try {
      const current = await configuration();
      const base = await checkBootstrap();
      if (ready(current ? await checkPython(current.python) : base)) {
        success = true;
        return;
      }
      error = "python_missing";
      if (base.error) throw new Error(error);
      error = "configuration_failed";
      const directory = { recursive: true as const, mode: 0o700 };
      await mkdir(dir, directory);
      if (!(await lstat(dir)).isDirectory()) throw new Error(error);
      const hasUv = await command("uv", ["--version"]).then(
        () => true,
        () => false,
      );
      preparation.installer = hasUv ? "uv" : "pip";
      preparation.step = "creating";
      venvDir = await mkdtemp(path.join(dir, "venv-"));
      const python = venvExecutable(venvDir);
      const requirements = path.join(tools, "requirements.txt");
      error = "venv_failed";
      await command(
        base.executable,
        ["-m", "venv", ...(hasUv ? ["--without-pip"] : []), venvDir],
        45_000,
        dir,
      );
      preparation.step = "installing";
      error = "install_failed";
      if (hasUv) {
        await command(
          "uv",
          ["pip", "install", "--python", python, "-r", requirements],
          180_000,
          dir,
        );
      } else {
        await command(
          python,
          [
            "-m",
            "pip",
            "install",
            "--disable-pip-version-check",
            "--no-input",
            "-r",
            requirements,
          ],
          180_000,
          dir,
        );
      }
      preparation.step = "verifying";
      error = "imports_failed";
      if (!ready(await checkPython(python))) throw new Error(error);
      preparation.step = "saving";
      error = "configuration_failed";
      await atomicJson(path.join(dir, "environment.json"), {
        python,
        installer: preparation.installer,
      });
      host.log(
        `Camera trajectory environment prepared with ${preparation.installer}: ${python}`,
      );
      success = true;
    } catch {
      preparation.error = error;
      host.log(`Camera trajectory environment preparation failed: ${error}`);
    } finally {
      if (success) {
        preparations.delete(dir);
      } else {
        if (venvDir)
          await rm(venvDir, { recursive: true, force: true }).catch(
            () => undefined,
          );
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

  return {
    inspect,
    prepare,
    blender,
    checkBlender,
    python: async () =>
      (await configuration())?.python ?? (await checkBootstrap()).executable,
  };
}
