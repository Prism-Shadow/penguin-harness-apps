import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { constants, existsSync } from "node:fs";
import {
  copyFile,
  lstat,
  mkdir,
  open,
  readdir,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import type {
  WorkbenchPackage,
  WorkbenchRequest,
  WorkbenchResponse,
} from "@prismshadow/penguin-server/plugin";
import {
  cameraPrompt,
  runCameraSession,
  type AgentProgress,
  type Command,
} from "./agent.js";
import { cameraEnvironment } from "./environment.js";
import { atomicJson, readJson } from "./storage.js";

const run = promisify(execFile);
const handlerDir = path.dirname(fileURLToPath(import.meta.url));
const sourceTools = path.join(handlerDir, "tools");
const tools = existsSync(sourceTools)
  ? sourceTools
  : path.resolve(handlerDir, "..", "..", "tools");
const maxUpload = 48 * 1024 * 1024;
const maxFrames = 3000;
const idPattern = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/;
const media = {
  mp4: "video/mp4",
  mov: "video/quicktime",
  webm: "video/webm",
} as const;
type Container = keyof typeof media;
type Status =
  | "queued"
  | "tracking"
  | "agent-running"
  | "checking"
  | "exporting"
  | "completed"
  | "failed";
type BlendStatus = "available" | "queued" | "failed" | "absent";

interface Summary {
  frames: number;
  fps: number;
  duration_s: number;
  latency_ms: number;
  wall_latency_ms: number;
  background_residual_px: number | null;
  background_coverage: number;
  subject_coverage: number;
  pose_coverage: number;
  rotation_high_frequency_deg2: number | null;
  shots: number;
  intrinsics: { estimated?: boolean; width: number; height: number };
}

interface Job {
  id: string;
  name: string;
  createdAt: string;
  height: number;
  container: Container;
  status: Status;
  blend: BlendStatus;
  mode?: "local" | "agent";
  agent?: AgentProgress;
  summary?: Summary;
  error?: string;
  blendError?: string;
}

type Work = { job: Job; exportOnly: boolean };

function containerOf(bytes: Uint8Array, name: string): Container | undefined {
  const header = Buffer.from(bytes.subarray(0, 16));
  if (header.length < 12) return;
  if (header.readUInt32BE(0) === 0x1a45dfa3) return "webm";
  if (
    ["ftyp", "moov", "mdat", "wide", "free"].includes(
      header.toString("ascii", 4, 8),
    )
  ) {
    return name.toLowerCase().endsWith(".mov") ? "mov" : "mp4";
  }
}

async function sendFile(
  file: string,
  contentType: string,
  request: WorkbenchRequest,
  download?: string,
): Promise<WorkbenchResponse> {
  let handle;
  try {
    handle = await open(file, constants.O_RDONLY | constants.O_NOFOLLOW);
  } catch {
    return { status: 404, body: { error: "artifact_missing" } };
  }
  const info = await handle.stat();
  if (!info.isFile()) {
    await handle.close();
    return { status: 404, body: { error: "artifact_missing" } };
  }
  const headers: Record<string, string> = {
    "content-type": contentType,
    "content-length": String(info.size),
    "accept-ranges": "bytes",
    "cache-control": "private, no-store",
    "x-content-type-options": "nosniff",
  };
  if (download)
    headers["content-disposition"] = 'attachment; filename="' + download + '"';
  let start = 0;
  let end = info.size - 1;
  const range = request.headers.range;
  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (match && (match[1] || match[2])) {
      start = match[1]
        ? Number(match[1])
        : Math.max(0, info.size - Number(match[2]));
      end = match[1] && match[2] ? Math.min(Number(match[2]), end) : end;
    } else {
      start = info.size;
    }
    if (start > end || !Number.isSafeInteger(start)) {
      await handle.close();
      return {
        status: 416,
        headers: { "content-range": "bytes */" + info.size },
      };
    }
    headers["content-range"] = "bytes " + start + "-" + end + "/" + info.size;
    headers["content-length"] = String(end - start + 1);
  }
  if (request.method === "HEAD" || info.size === 0) {
    await handle.close();
    return { status: range ? 206 : 200, headers, bytes: new Uint8Array() };
  }
  return {
    status: range ? 206 : 200,
    headers,
    stream: handle.createReadStream({ start, end }),
  };
}

function describe(reason: unknown) {
  if (!(reason instanceof Error)) return String(reason).slice(0, 450);
  const subprocess = reason as Error & {
    code?: string;
    stderr?: string;
    stdout?: string;
  };
  if (subprocess.code === "ENOENT") return "executable_missing";
  const detail = [subprocess.stderr, subprocess.stdout]
    .filter(Boolean)
    .join("\n")
    .trim()
    .split("\n")
    .filter((line) => line.trim())
    .at(-1);
  return (detail || reason.message).slice(0, 450);
}

export default {
  modules: {
    Workbench: {
      create(ctx) {
        const host = ctx.use.host;
        const { dataDir } = host.dataPaths();
        const root = path.join(dataDir, "jobs");
        const environment = {
          ...process.env,
          CUDA_VISIBLE_DEVICES: "",
          OPENBLAS_NUM_THREADS: "1",
          OMP_NUM_THREADS: "1",
          PYTHONDONTWRITEBYTECODE: "1",
        };
        const runtime = cameraEnvironment(host, dataDir, tools, environment);
        const queue: Work[] = [];
        const owned = new Set<string>();
        const agentFeeds = new Map<string, AgentProgress>();
        let active = false;
        let disposed = false;
        let controller: AbortController | undefined;

        function jobDir(id: string) {
          return path.join(root, id);
        }

        async function save(job: Job) {
          await atomicJson(path.join(jobDir(job.id), "job.json"), job);
        }

        async function find(id: string): Promise<Job | undefined> {
          if (!idPattern.test(id)) return;
          try {
            if (!(await lstat(jobDir(id))).isDirectory()) return;
            const job: Job = await readJson(path.join(jobDir(id), "job.json"));
            if (job.id !== id || !Object.hasOwn(media, job.container)) return;
            if (
              !owned.has(id) &&
              !["completed", "failed"].includes(job.status)
            ) {
              return { ...job, status: "failed", error: "interrupted" };
            }
            if (!owned.has(id) && job.blend === "queued") {
              return { ...job, blend: "failed", blendError: "interrupted" };
            }
            return job;
          } catch {
            return;
          }
        }

        async function command([program, ...args]: Command, cwd: string) {
          return run(program, args, {
            cwd,
            env: environment,
            signal: controller?.signal,
            timeout: 180_000,
            maxBuffer: 512 * 1024,
            encoding: "utf8",
          });
        }

        function trackCommand(python: string, job: Job, dir: string): Command {
          return [
            python,
            "-B",
            path.join(tools, "track.py"),
            "--video",
            path.join(dir, "input." + job.container),
            "--subject-height",
            String(job.height),
            "--max-frames",
            String(maxFrames + 1),
            "--out",
            path.join(dir, "trajectory.json"),
          ];
        }

        function verifyCommand(python: string, dir: string): Command {
          return [
            python,
            "-B",
            path.join(tools, "verify_trajectory.py"),
            path.join(dir, "trajectory.json"),
          ];
        }

        function blendCommand(dir: string): Command {
          return [
            runtime.blender,
            "-b",
            "--threads",
            "2",
            "--python-exit-code",
            "1",
            "-P",
            path.join(tools, "blender_export.py"),
            "--",
            "--trajectory",
            path.join(dir, "trajectory.json"),
            "--blend",
            path.join(dir, "camera.blend"),
          ];
        }

        async function localArtifact(file: string) {
          const parent = await lstat(path.dirname(file));
          const stat = await lstat(file).catch(() => undefined);
          if (!parent.isDirectory() || !stat?.isFile() || stat.size === 0)
            throw new Error(
              path.basename(file) === "camera.blend"
                ? "blend_missing"
                : "trajectory_missing",
            );
        }

        async function agentCommand(
          job: Job,
          dir: string,
          python: string,
          exportOnly: boolean,
          signal: AbortSignal,
        ) {
          const withBlend = job.blend === "queued";
          const trajectory = path.join(dir, "trajectory.json");
          const prompt = cameraPrompt({
            video: path.join(dir, "input." + job.container),
            height: job.height,
            output: dir,
            trajectory,
            blend: withBlend ? path.join(dir, "camera.blend") : undefined,
            maxFrames,
            track: exportOnly ? undefined : trackCommand(python, job, dir),
            verify: verifyCommand(python, dir),
            export: withBlend ? blendCommand(dir) : undefined,
          });
          await runCameraSession(
            host,
            job.agent!,
            prompt,
            async (sessionId) => {
              await save(job);
              host.log(
                `Camera trajectory Agent job ${job.id} started session ${sessionId}`,
              );
            },
            signal,
          );
        }

        function queueAgentFeed(job: Job) {
          if (job.mode === "agent") {
            job.agent = { events: [] };
            agentFeeds.set(job.id, job.agent);
          }
        }

        async function* streamAgent(id: string, progress: AgentProgress) {
          let previous = "";
          let heartbeat = 0;
          for (;;) {
            const done = disposed || agentFeeds.get(id) !== progress;
            const next = JSON.stringify({ ...progress, done });
            if (next !== previous) {
              yield `data: ${next}\n\n`;
              previous = next;
              heartbeat = 0;
            } else if (++heartbeat === 50) {
              yield ": keepalive\n\n";
              heartbeat = 0;
            }
            if (done) return;
            await delay(250);
          }
        }

        async function exportBlend(job: Job) {
          const dir = jobDir(job.id);
          job.blend = "queued";
          delete job.blendError;
          await save(job);
          try {
            if (job.mode === "agent")
              await agentCommand(
                job,
                dir,
                await runtime.python(),
                true,
                controller!.signal,
              );
            else await command(blendCommand(dir), dir);
            await localArtifact(path.join(dir, "camera.blend"));
            job.blend = "available";
          } catch (error) {
            job.blend = "failed";
            job.blendError = describe(error);
          }
          await save(job);
          if (job.mode === "agent")
            host.log(
              `Camera trajectory Agent export ${job.id} session ${job.agent?.sessionId ?? "unavailable"}: ${job.blend}`,
            );
        }

        async function runJob({ job, exportOnly }: Work) {
          const dir = jobDir(job.id);
          if (exportOnly) {
            await exportBlend(job);
            return;
          }
          try {
            const useAgent = job.mode === "agent";
            job.status = useAgent ? "agent-running" : "tracking";
            await save(job);
            const python = await runtime.python();
            const trajectory = path.join(dir, "trajectory.json");
            if (useAgent)
              await agentCommand(job, dir, python, false, controller!.signal);
            else await command(trackCommand(python, job, dir), dir);
            await localArtifact(trajectory);
            job.status = "checking";
            await save(job);
            const { stdout } = await command(verifyCommand(python, dir), dir);
            const summary = JSON.parse(stdout) as Summary;
            if (summary.frames > maxFrames) throw new Error("clip_too_long");
            await copyFile(
              path.join(tools, "blender_export.py"),
              path.join(dir, "build_camera_in_blender.py"),
              constants.COPYFILE_EXCL,
            );
            job.summary = summary;
            if (job.blend === "queued") {
              if (useAgent) {
                try {
                  await localArtifact(path.join(dir, "camera.blend"));
                  job.blend = "available";
                } catch (error) {
                  job.blend = "failed";
                  job.blendError = describe(error);
                }
              } else {
                job.status = "exporting";
                await exportBlend(job);
              }
            }
            job.status = "completed";
          } catch (error) {
            job.status = "failed";
            job.error = describe(error);
            if (job.blend === "queued") {
              job.blend = "failed";
              job.blendError = job.error;
            }
          }
          await save(job);
          if (job.mode === "agent") {
            const outcome =
              job.status === "completed"
                ? `verified ${job.summary?.frames} frames at ${path.join(dir, "trajectory.json")}, blend ${job.blend}`
                : `failed (${job.error})`;
            host.log(
              `Camera trajectory Agent job ${job.id} session ${job.agent?.sessionId ?? "unavailable"}: ${outcome}`,
            );
          }
        }

        async function work() {
          if (active || disposed) return;
          active = true;
          try {
            while (queue.length && !disposed) {
              const next = queue.shift()!;
              controller = new AbortController();
              try {
                await runJob(next);
              } catch (error) {
                host.log("Camera trajectory worker: " + describe(error));
              } finally {
                owned.delete(next.job.id);
                agentFeeds.delete(next.job.id);
                controller = undefined;
              }
            }
          } finally {
            active = false;
          }
        }

        ctx.effect(() => {
          disposed = true;
          controller?.abort();
        });

        async function handle(
          request: WorkbenchRequest,
        ): Promise<WorkbenchResponse> {
          if (request.path === "/environment" && request.method === "GET") {
            return {
              headers: { "cache-control": "no-store" },
              body: await runtime.inspect(),
            };
          }
          if (
            request.path === "/environment/prepare" &&
            request.method === "POST"
          ) {
            if (!runtime.prepare())
              return {
                status: 409,
                body: { error: "environment_unavailable" },
              };
            return { status: 202, body: { status: "preparing" } };
          }
          if (request.path === "/jobs" && request.method === "GET") {
            await mkdir(root, { recursive: true });
            const entries = await readdir(root, { withFileTypes: true });
            const ids = entries
              .filter((entry) => entry.isDirectory())
              .map((entry) => entry.name);
            const records = (
              await Promise.all(
                ids.filter((id) => idPattern.test(id)).map(find),
              )
            )
              .filter((job): job is Job => job !== undefined)
              .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
              .slice(0, 50);
            return { body: { jobs: records, maxUpload, maxFrames } };
          }
          if (request.path === "/jobs" && request.method === "POST") {
            if (!request.bytes?.byteLength)
              return { status: 400, body: { error: "select_video" } };
            if (request.bytes.byteLength > maxUpload)
              return { status: 413, body: { error: "file_too_large" } };
            if (owned.size >= 5 || disposed)
              return { status: 429, body: { error: "queue_full" } };
            const name = (request.query.name || "video")
              .replace(/[\x00-\x1f\x7f/\\]/g, " ")
              .trim()
              .slice(0, 140);
            const container = containerOf(request.bytes, name);
            if (!container)
              return { status: 415, body: { error: "unsupported_container" } };
            const height = Number(request.query.height ?? 1.74);
            if (!Number.isFinite(height) || height < 0.5 || height > 2.5) {
              return { status: 400, body: { error: "invalid_height" } };
            }
            const mode = request.query.mode ?? "local";
            if (mode !== "local" && mode !== "agent")
              return { status: 400, body: { error: "invalid_mode" } };
            const job: Job = {
              id: randomUUID(),
              createdAt: new Date().toISOString(),
              name: name || "video",
              container,
              height,
              mode,
              status: "queued",
              blend: request.query.blend === "1" ? "queued" : "absent",
            };
            owned.add(job.id);
            queueAgentFeed(job);
            try {
              await mkdir(jobDir(job.id), { recursive: true });
              await writeFile(
                path.join(jobDir(job.id), "input." + container),
                request.bytes,
                {
                  flag: "wx",
                },
              );
              await save(job);
            } catch (error) {
              owned.delete(job.id);
              agentFeeds.delete(job.id);
              host.log("Camera trajectory upload: " + describe(error));
              return { status: 500, body: { error: "storage_error" } };
            }
            const answer = { ...job };
            queue.push({ job, exportOnly: false });
            void work();
            return { status: 202, body: answer };
          }

          const [id, artifact, extra] = request.path
            .replace(/^\/jobs\//, "")
            .split("/");
          const job = extra ? undefined : await find(id);
          if (!job || !request.path.startsWith("/jobs/"))
            return { status: 404, body: { error: "unknown_job" } };
          const dir = jobDir(id);
          if (artifact === "blend" && request.method === "POST") {
            if (job.status !== "completed" || owned.has(id))
              return { status: 409, body: { error: "job_busy" } };
            owned.add(id);
            job.blend = "queued";
            queueAgentFeed(job);
            await save(job).catch((error) => {
              owned.delete(id);
              agentFeeds.delete(id);
              throw error;
            });
            queue.push({ job, exportOnly: true });
            void work();
            return { status: 202, body: job };
          }
          if (request.method !== "GET" && request.method !== "HEAD") {
            return { status: 405, body: { error: "method_not_allowed" } };
          }
          if (!artifact) return { body: job };
          if (
            artifact === "agent-events" &&
            request.method === "GET" &&
            job.agent
          ) {
            return {
              headers: {
                "content-type": "text/event-stream; charset=utf-8",
                "cache-control": "private, no-store",
                "x-accel-buffering": "no",
              },
              stream: streamAgent(id, agentFeeds.get(id) ?? job.agent),
            };
          }
          if (artifact === "video")
            return sendFile(
              path.join(dir, "input." + job.container),
              media[job.container],
              request,
            );
          if (!job.summary) return { status: 409, body: { error: "job_busy" } };
          if (artifact === "trajectory") {
            return sendFile(
              path.join(dir, "trajectory.json"),
              "application/json",
              request,
              request.query.download === "1" ? "trajectory.json" : undefined,
            );
          }
          if (artifact === "script") {
            return sendFile(
              path.join(dir, "build_camera_in_blender.py"),
              "text/plain; charset=utf-8",
              request,
              "build_camera_in_blender.py",
            );
          }
          if (artifact === "blend" && job.blend === "available") {
            return sendFile(
              path.join(dir, "camera.blend"),
              "application/octet-stream",
              request,
              "camera.blend",
            );
          }
          return { status: 404, body: { error: "artifact_missing" } };
        }

        return { api: { main: { handle } } };
      },
    },
  },
} satisfies WorkbenchPackage;
