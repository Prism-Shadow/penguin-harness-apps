import { execFile, spawn, type ChildProcess } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import type {
  WorkbenchPackage,
  WorkbenchResponse,
} from "@prismshadow/penguin-server/plugin";

const execFileAsync = promisify(execFile);

export interface MousePoint {
  t: number;
  x: number;
  y: number;
  rawX?: number;
  rawY?: number;
  screenW?: number;
  screenH?: number;
  type: "move" | "down" | "up";
  button: number;
}

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const SWIFT_SOURCE_CANDIDATES = [
  path.resolve(MODULE_DIR, "native/mouse_tracker.swift"),
  path.resolve(MODULE_DIR, "../../native/mouse_tracker.swift"),
];

export function findTrackerSwiftSource(): string | null {
  for (const candidate of SWIFT_SOURCE_CANDIDATES) {
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

async function ensureTrackerBinary(cacheDir: string): Promise<string | null> {
  if (process.platform !== "darwin") return null;
  const binDir = path.join(cacheDir, "bin");
  const binPath = path.join(binDir, "mouse_tracker");
  if (existsSync(binPath)) return binPath;

  const swiftSource = findTrackerSwiftSource();
  if (!swiftSource) return null;

  await mkdir(binDir, { recursive: true });
  await execFileAsync("swiftc", [swiftSource, "-o", binPath, "-O"]);
  return existsSync(binPath) ? binPath : null;
}

export default {
  modules: {
    Workbench: {
      create({ use }) {
        const host = use.host;
        let trackerProc: ChildProcess | null = null;
        let recordedEvents: MousePoint[] = [];

        const stopTracker = () => {
          if (trackerProc) {
            try {
              trackerProc.kill("SIGTERM");
            } catch {
              // ignore
            }
            trackerProc = null;
          }
        };

        return {
          api: {
            main: {
              async handle(req): Promise<WorkbenchResponse> {
                if (req.path === "/info" && req.method === "GET") {
                  const swiftSource = findTrackerSwiftSource();
                  return {
                    body: {
                      ok: true,
                      hasNativeTracker:
                        process.platform === "darwin" && Boolean(swiftSource),
                    },
                  };
                }

                // Start on-demand native macOS global mouse & click tracker
                if (req.path === "/tracker/start" && req.method === "POST") {
                  stopTracker();
                  recordedEvents = [];
                  try {
                    const { cacheDir } = host.dataPaths();
                    const bin = await ensureTrackerBinary(cacheDir);
                    if (!bin) {
                      return {
                        status: 404,
                        body: {
                          ok: false,
                          error: "Native mouse_tracker is unavailable",
                        },
                      };
                    }

                    const proc = spawn(bin, [], {
                      stdio: ["ignore", "pipe", "pipe"],
                    });
                    trackerProc = proc;
                    let buffer = "";
                    proc.stdout?.on("data", (chunk: Buffer) => {
                      buffer += chunk.toString("utf8");
                      const lines = buffer.split("\n");
                      buffer = lines.pop() ?? "";
                      for (const line of lines) {
                        const trimmed = line.trim();
                        if (!trimmed) continue;
                        try {
                          const evt = JSON.parse(trimmed) as MousePoint;
                          recordedEvents.push(evt);
                        } catch {
                          // ignore malformed line
                        }
                      }
                    });
                    return { body: { ok: true } };
                  } catch (err) {
                    return {
                      status: 500,
                      body: {
                        ok: false,
                        error:
                          err instanceof Error
                            ? err.message
                            : "Failed to start tracker",
                      },
                    };
                  }
                }

                // Stop native mouse tracker and return captured events
                if (req.path === "/tracker/stop" && req.method === "POST") {
                  stopTracker();
                  return {
                    body: {
                      ok: true,
                      events: recordedEvents,
                    },
                  };
                }

                // Save exported video bytes to workbench cacheDir and return a same-origin download link
                if (req.path === "/export" && req.method === "POST") {
                  const ext = req.query.ext === "mp4" ? "mp4" : "webm";
                  const bytes = req.bytes;
                  if (!bytes || bytes.byteLength === 0) {
                    return {
                      status: 400,
                      body: { error: "Empty video payload" },
                    };
                  }
                  const { cacheDir } = host.dataPaths();
                  const exportDir = path.join(cacheDir, "exports");
                  await mkdir(exportDir, { recursive: true });
                  const fileName = `ScreenStudio-${Date.now()}.${ext}`;
                  const filePath = path.join(exportDir, fileName);
                  await writeFile(filePath, bytes);
                  return {
                    body: {
                      ok: true,
                      fileName,
                      downloadUrl: `../api/export/${encodeURIComponent(fileName)}`,
                    },
                  };
                }

                if (req.path.startsWith("/export/") && req.method === "GET") {
                  const rawName = decodeURIComponent(
                    req.path.slice("/export/".length),
                  );
                  if (!/^ScreenStudio-\d+\.(mp4|webm)$/.test(rawName)) {
                    return {
                      status: 400,
                      body: { error: "Invalid export file name" },
                    };
                  }
                  const { cacheDir } = host.dataPaths();
                  const filePath = path.join(cacheDir, "exports", rawName);
                  if (!existsSync(filePath)) {
                    return {
                      status: 404,
                      body: { error: "Export not found" },
                    };
                  }
                  const data = await readFile(filePath);
                  const mime = rawName.endsWith(".mp4")
                    ? "video/mp4"
                    : "video/webm";
                  return {
                    headers: {
                      "content-type": mime,
                      "content-disposition": `attachment; filename="${rawName}"`,
                    },
                    bytes: new Uint8Array(data),
                  };
                }

                return { status: 404, body: { error: "no such route" } };
              },
            },
          },
        };
      },
    },
  },
} satisfies WorkbenchPackage;
