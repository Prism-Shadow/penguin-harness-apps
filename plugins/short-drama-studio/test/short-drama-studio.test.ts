import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import workbench from "../workbenches/short-drama-studio/index.ts";
import type { DramaProjectState } from "../workbenches/short-drama-studio/preset.ts";
import {
  compileMinimaxPayload,
  compileSeedancePayload,
} from "../workbenches/short-drama-studio/video-engine.ts";

describe("short-drama-studio workbench", () => {
  let tempDir = "";
  let logs: string[] = [];

  beforeEach(async () => {
    tempDir = await mkdtemp(path.join(os.tmpdir(), "short-drama-studio-test-"));
    logs = [];
  });

  afterEach(async () => {
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  function createMainHandler() {
    const mod = workbench.modules.Workbench.create({
      use: {
        host: {
          listAgents: () => [{ agentId: "default_agent" }],
          createSession: async () => ({ sessionId: "sess-1" }),
          run: async () => ({ sessionId: "sess-1", queued: false }),
          sessionStatus: () => "completed",
          sessionTitle: () => "short-drama",
          sessionResult: async () => ({
            status: "completed",
            text: "",
            error: null,
          }),
          subscribe: () => () => {},
          dataPaths: () => ({
            dataDir: tempDir,
            cacheDir: path.join(tempDir, "cache"),
            stateDir: path.join(tempDir, "state"),
          }),
          socketPath: (name: string) => path.join(tempDir, `${name}.sock`),
          getState: () => ({}),
          setState: async () => {},
          log: (msg: string) => logs.push(msg),
        },
      },
      effect: () => {},
    });
    return mod.api.main;
  }

  it("initializes with the Cardboard House EP001 preset, consistency cards, and 8 playable MP4 shots", async () => {
    const main = createMainHandler();
    const res = await main.handle({
      method: "GET",
      path: "/state",
      query: {},
      headers: {},
      body: null,
    });

    expect(res.status ?? 200).toBe(200);
    const body = res.body as { state: DramaProjectState };
    expect(body.state.title).toContain("纸箱小屋");
    expect(body.state.characters).toHaveLength(2);
    expect(body.state.locations).toHaveLength(2);
    expect(body.state.shots).toHaveLength(8);

    for (const shot of body.state.shots) {
      expect(shot.version).toBe(1);
      expect(shot.status).toBe("ready");
      expect(shot.videoSha256).toMatch(/^[a-f0-9]{64}$/);
      expect(shot.videoSizeBytes).toBeGreaterThan(50_000);
      expect(shot.compiledPrompt).toContain(shot.videoPrompt);
    }
  });

  it("injects updated character and scene consistency anchors into all shots", async () => {
    const main = createMainHandler();
    const initRes = await main.handle({
      method: "GET",
      path: "/state",
      query: {},
      headers: {},
      body: null,
    });
    const initialState = (initRes.body as { state: DramaProjectState }).state;

    const updatedCat = {
      ...initialState.characters[0],
      identityAnchors:
        "5-month-old ginger-and-white tabby kitten, wearing a tiny red knitted scarf, amber eyes",
    };

    const syncRes = await main.handle({
      method: "PUT",
      path: "/consistency",
      query: {},
      headers: {},
      body: { character: updatedCat },
    });

    const syncedState = (syncRes.body as { state: DramaProjectState }).state;
    const shot1 = syncedState.shots.find((s) => s.shotId === "SHOT-001")!;
    const shot7 = syncedState.shots.find((s) => s.shotId === "SHOT-007")!;
    expect(shot1.compiledPrompt).toContain("tiny red knitted scarf");
    expect(shot7.compiledPrompt).toContain("tiny red knitted scarf");
  });

  it("re-renders a single shot (SHOT-007) non-destructively while keeping all other 7 shots 100% intact", async () => {
    const main = createMainHandler();
    const beforeRes = await main.handle({
      method: "GET",
      path: "/state",
      query: {},
      headers: {},
      body: null,
    });
    const beforeState = (beforeRes.body as { state: DramaProjectState }).state;
    const beforeMap = new Map(
      beforeState.shots.map((s) => [
        s.shotId,
        { version: s.version, sha256: s.videoSha256, order: s.order },
      ]),
    );

    const rerenderRes = await main.handle({
      method: "POST",
      path: "/shots/SHOT-007/rerender",
      query: {},
      headers: {},
      body: {
        videoPrompt:
          "Warm macro close-up inside the cardboard box. The dry fluffy ginger-and-white kitten curls into a glowing golden ball on the white towel, yawns softly, and falls asleep peacefully.",
        visualGrade: "warm-amber",
        motionEffect: "slow-push-in",
        subtitleText: "今夜的纸箱小屋里，只有温暖的金色梦境。",
      },
    });

    expect(rerenderRes.status ?? 200).toBe(200);
    const payload = rerenderRes.body as {
      state: DramaProjectState;
      isolationCheck: {
        targetShotId: string;
        previousVersion: number;
        newVersion: number;
        previousSha256: string;
        newSha256: string;
        untouchedShotCount: number;
        untouchedHashesVerified: boolean;
      };
    };

    expect(payload.isolationCheck.targetShotId).toBe("SHOT-007");
    expect(payload.isolationCheck.previousVersion).toBe(1);
    expect(payload.isolationCheck.newVersion).toBe(2);
    expect(payload.isolationCheck.newSha256).not.toBe(
      payload.isolationCheck.previousSha256,
    );
    expect(payload.isolationCheck.untouchedShotCount).toBe(7);
    expect(payload.isolationCheck.untouchedHashesVerified).toBe(true);

    for (const shot of payload.state.shots) {
      const prev = beforeMap.get(shot.shotId)!;
      if (shot.shotId === "SHOT-007") {
        expect(shot.version).toBe(2);
        expect(shot.videoSha256).not.toBe(prev.sha256);
        expect(shot.subtitleText).toBe(
          "今夜的纸箱小屋里，只有温暖的金色梦境。",
        );
      } else {
        expect(shot.version).toBe(prev.version);
        expect(shot.videoSha256).toBe(prev.sha256);
        expect(shot.order).toBe(prev.order);
      }
    }
  });

  it("handles single-shot generation failure and recovers via retry without affecting other shots", async () => {
    const main = createMainHandler();
    const failRes = await main.handle({
      method: "POST",
      path: "/shots/SHOT-004/rerender",
      query: {},
      headers: {},
      body: { simulateFailure: true },
    });

    expect(failRes.status).toBe(422);
    const failBody = failRes.body as { state: DramaProjectState };
    const shot4Failed = failBody.state.shots.find(
      (s) => s.shotId === "SHOT-004",
    )!;
    expect(shot4Failed.status).toBe("failed");
    expect(shot4Failed.lastError).toBeTruthy();

    // Retry SHOT-004
    const retryRes = await main.handle({
      method: "POST",
      path: "/shots/SHOT-004/retry",
      query: {},
      headers: {},
      body: { simulateFailure: false },
    });
    expect(retryRes.status ?? 200).toBe(200);
    const retryBody = retryRes.body as { state: DramaProjectState };
    const shot4Recovered = retryBody.state.shots.find(
      (s) => s.shotId === "SHOT-004",
    )!;
    expect(shot4Recovered.status).toBe("ready");
    expect(shot4Recovered.version).toBe(2);
  });

  it("merges all 8 shots in timeline order into a complete playable MP4 episode and streams with HTTP Range", async () => {
    const main = createMainHandler();
    const exportRes = await main.handle({
      method: "POST",
      path: "/episode/export",
      query: {},
      headers: {},
      body: {},
    });

    expect(exportRes.status ?? 200).toBe(200);
    const exportBody = exportRes.body as {
      state: DramaProjectState;
      exportInfo: {
        fileName: string;
        sizeBytes: number;
        sha256: string;
        durationSec: number;
        shotCount: number;
        shotOrder: string[];
      };
    };

    expect(exportBody.exportInfo.fileName).toBe("episode-EP001.mp4");
    expect(exportBody.exportInfo.shotCount).toBe(8);
    expect(exportBody.exportInfo.durationSec).toBe(50);
    expect(exportBody.exportInfo.sizeBytes).toBeGreaterThan(200_000);
    expect(exportBody.exportInfo.shotOrder).toEqual([
      "SHOT-001",
      "SHOT-002",
      "SHOT-003",
      "SHOT-004",
      "SHOT-005",
      "SHOT-006",
      "SHOT-007",
      "SHOT-008",
    ]);

    // Verify HTTP Range request on exported episode MP4
    const downloadRes = await main.handle({
      method: "GET",
      path: "/episode/download",
      query: { download: "1" },
      headers: { range: "bytes=0-31" },
      body: null,
    });
    expect(downloadRes.status).toBe(206);
    expect(downloadRes.headers?.["content-type"]).toBe("video/mp4");
    expect(downloadRes.bytes?.byteLength).toBe(32);
    const headerAscii = Buffer.from(downloadRes.bytes!).toString("ascii", 4, 8);
    expect(headerAscii).toBe("ftyp");
  });

  it("compiles drama-skills compatible Seedance and MiniMax request payloads", async () => {
    const main = createMainHandler();
    const res = await main.handle({
      method: "GET",
      path: "/state",
      query: {},
      headers: {},
      body: null,
    });
    const state = (res.body as { state: DramaProjectState }).state;
    const shot1 = state.shots[0];

    const seedancePayload = compileSeedancePayload(shot1, state.providerConfig);
    expect(seedancePayload.model).toBe("doubao-seedance-1-0-pro-250528");
    const contentArr = seedancePayload.content as Array<{
      type: string;
      text: string;
    }>;
    expect(contentArr[0].text).toContain(
      "--rs 720p --rt 16:9 --dur 6 --fps 24",
    );

    const minimaxPayload = compileMinimaxPayload(shot1, state.providerConfig);
    expect(minimaxPayload.model).toBe("MiniMax-Hailuo-02");
    expect(minimaxPayload.duration).toBe(6);
  });
});
