import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createDemoProjectData } from "../src/utils/demoGenerator.ts";
import {
  SPRING_CONFIGS,
  generateAutoZoomSegments,
  getCursorAtTime,
  stepSpring,
} from "../src/utils/springPhysics.ts";
import workbench, {
  findTrackerSwiftSource,
} from "../workbenches/screen_studio/index.ts";

type Handle = (req: {
  method: string;
  path: string;
  query: Record<string, string>;
  headers: Record<string, string>;
  body: unknown;
  bytes?: Uint8Array;
}) => Promise<{
  status?: number;
  headers?: Record<string, string>;
  body?: unknown;
  bytes?: Uint8Array;
}>;

const tempDirs: string[] = [];

afterEach(async () => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop()!;
    await rm(dir, { recursive: true, force: true });
  }
});

async function openWorkbench(): Promise<Handle> {
  const dir = await mkdtemp(path.join(tmpdir(), "screen-studio-test-"));
  tempDirs.push(dir);
  let state: unknown = null;
  const host = {
    getState: () => state,
    setState: async (next: unknown) => {
      state = next;
    },
    dataPaths: () => ({
      dataDir: path.join(dir, "data"),
      cacheDir: path.join(dir, "cache"),
      stateDir: path.join(dir, "state"),
    }),
  };
  const created = workbench.modules.Workbench.create({
    use: { host },
  } as never) as unknown as {
    api: { main: { handle: Handle } };
  };
  return (req) => created.api.main.handle(req);
}

describe("spring physics and auto-zoom clustering", () => {
  it("converges towards the target value across spring steps", () => {
    const { stiffness, damping } = SPRING_CONFIGS.smooth;
    let value = 1.0;
    let velocity = 0;
    for (let i = 0; i < 120; i++) {
      const next = stepSpring(value, velocity, 2.0, stiffness, damping, 1 / 60);
      value = next.value;
      velocity = next.velocity;
    }
    expect(value).toBeCloseTo(2.0, 2);
  });

  it("clusters nearby click events into continuous auto-zoom segments and separates distant clicks", () => {
    const segments = generateAutoZoomSegments(
      [
        { t: 1000, x: 0.2, y: 0.3, type: "down", button: 0 },
        { t: 1800, x: 0.22, y: 0.32, type: "down", button: 0 },
        { t: 6000, x: 0.8, y: 0.7, type: "down", button: 0 },
      ],
      10,
    );
    expect(segments).toHaveLength(2);
    expect(segments[0].startTime).toBeCloseTo(0.75, 2);
    expect(segments[0].endTime).toBeCloseTo(3.45, 2);
    expect(segments[1].targetX).toBeCloseTo(0.8, 2);
    expect(segments[1].targetY).toBeCloseTo(0.7, 2);
  });

  it("interpolates cursor position and detects recent clicks", () => {
    const events = [
      { t: 0, x: 0.1, y: 0.2, type: "move" as const, button: 0 },
      { t: 1000, x: 0.5, y: 0.6, type: "down" as const, button: 0 },
      { t: 2000, x: 0.9, y: 0.8, type: "move" as const, button: 0 },
    ];
    const mid = getCursorAtTime(events, 0.5);
    expect(mid.x).toBeCloseTo(0.3, 2);
    expect(mid.y).toBeCloseTo(0.4, 2);
    expect(mid.isPressed).toBe(false);

    const pressed = getCursorAtTime(events, 1.05);
    expect(pressed.isPressed).toBe(true);
    expect(pressed.recentClickAgeMs).toBeCloseTo(50, 1);
  });

  it("builds a complete 12-second demo trajectory with sorted events and zoom segments", () => {
    const demo = createDemoProjectData();
    expect(demo.duration).toBe(12);
    expect(demo.mouseEvents.length).toBeGreaterThan(500);
    expect(demo.zoomSegments).toHaveLength(3);
  });
});

describe("workbench handler routes", () => {
  it("locates the bundled Swift tracker source and reports tracker availability on /info", async () => {
    expect(findTrackerSwiftSource()).toBeTruthy();
    const handle = await openWorkbench();
    const res = await handle({
      method: "GET",
      path: "/info",
      query: {},
      headers: {},
      body: null,
    });
    expect(res.body).toEqual({
      ok: true,
      hasNativeTracker: process.platform === "darwin",
    });
  });

  it("stores exported video bytes and serves them back as an attachment", async () => {
    const handle = await openWorkbench();
    const payload = new Uint8Array([
      0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70,
    ]);
    const saved = await handle({
      method: "POST",
      path: "/export",
      query: { ext: "mp4" },
      headers: { "content-type": "application/octet-stream" },
      body: null,
      bytes: payload,
    });
    const body = saved.body as {
      ok: boolean;
      fileName: string;
      downloadUrl: string;
    };
    expect(body.ok).toBe(true);
    expect(body.fileName).toMatch(/^ScreenStudio-\d+\.mp4$/);

    const fetched = await handle({
      method: "GET",
      path: `/export/${body.fileName}`,
      query: {},
      headers: {},
      body: null,
    });
    expect(fetched.headers?.["content-type"]).toBe("video/mp4");
    expect(fetched.headers?.["content-disposition"]).toContain(body.fileName);
    expect(Array.from(fetched.bytes ?? [])).toEqual(Array.from(payload));
  });

  it("rejects empty export payloads and invalid export filenames", async () => {
    const handle = await openWorkbench();
    const emptyRes = await handle({
      method: "POST",
      path: "/export",
      query: { ext: "webm" },
      headers: {},
      body: null,
      bytes: new Uint8Array(0),
    });
    expect(emptyRes.status).toBe(400);

    const invalidGet = await handle({
      method: "GET",
      path: "/export/../package.json",
      query: {},
      headers: {},
      body: null,
    });
    expect(invalidGet.status).toBe(400);
  });
});
