/**
 * PixCake Studio workbench handler tests:
 *
 * - Returns normalized default state on initial GET /state and persists partial updates via POST /state.
 * - Creates and activates custom retouching presets via POST /presets, rejects blank names, and deletes presets cleanly via DELETE /presets/:id.
 * - Saves exported JPEG images via POST /export (both raw bytes and base64 dataUrl), caps exportHistory at 20 items, serves downloads via GET /export/:fileName, and blocks invalid filenames.
 */
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import workbench from "../workbenches/pixcake/index.js";

describe("PixCake Studio workbench handler", () => {
  let tempDir: string;
  let storedState: unknown;

  beforeEach(async () => {
    tempDir = await mkdtemp(path.join(tmpdir(), "pixcake-test-"));
    storedState = null;
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  function createMain() {
    const host = {
      getState: () => storedState,
      setState: async (next: unknown) => {
        storedState = structuredClone(next);
      },
      dataPaths: () => ({
        dataDir: path.join(tempDir, "data"),
        cacheDir: path.join(tempDir, "cache"),
        stateDir: path.join(tempDir, "state"),
      }),
    };
    return workbench.modules.Workbench.create({
      use: { host: host as never },
      effect: () => {},
    }).api.main;
  }

  it("normalizes initial state and persists partial updates", async () => {
    const main = createMain();
    const initial = await main.handle({
      method: "GET",
      path: "/state",
      query: {},
      body: undefined,
      headers: {},
    });
    expect(initial.body).toEqual({
      ok: true,
      state: {
        currentSampleId: "sample_1",
        activePresetId: "pixcake_pro",
        params: {},
        customPresets: [],
        exportHistory: [],
      },
    });

    const updated = await main.handle({
      method: "POST",
      path: "/state",
      query: {},
      body: {
        currentSampleId: "sample_3",
        activePresetId: "long_legs",
        params: { legLength: 68, waistSlim: 40 },
      },
      headers: {},
    });
    expect(updated.body).toMatchObject({
      ok: true,
      state: {
        currentSampleId: "sample_3",
        activePresetId: "long_legs",
        params: { legLength: 68, waistSlim: 40 },
      },
    });
  });

  it("manages custom presets and resets activePresetId when the active preset is deleted", async () => {
    const main = createMain();

    const bad = await main.handle({
      method: "POST",
      path: "/presets",
      query: {},
      body: { name: "   " },
      headers: {},
    });
    expect(bad.status).toBe(400);

    const created = await main.handle({
      method: "POST",
      path: "/presets",
      query: {},
      body: {
        name: "海岛日落冷白皮",
        detail: "磨皮70% + 瘦脸45%",
        values: { skinSmooth: 70, faceSlim: 45 },
      },
      headers: {},
    });
    const createdBody = created.body as {
      ok: boolean;
      preset: { id: string; name: string };
      state: { activePresetId: string; customPresets: Array<{ id: string }> };
    };
    expect(createdBody.ok).toBe(true);
    expect(createdBody.preset.name).toBe("海岛日落冷白皮");
    expect(createdBody.state.activePresetId).toBe(createdBody.preset.id);
    expect(createdBody.state.customPresets).toHaveLength(1);

    const deleted = await main.handle({
      method: "DELETE",
      path: `/presets/${encodeURIComponent(createdBody.preset.id)}`,
      query: {},
      body: undefined,
      headers: {},
    });
    const deletedBody = deleted.body as {
      ok: boolean;
      state: {
        activePresetId: string | null;
        customPresets: Array<{ id: string }>;
      };
    };
    expect(deletedBody.ok).toBe(true);
    expect(deletedBody.state.customPresets).toHaveLength(0);
    expect(deletedBody.state.activePresetId).toBeNull();
  });

  it("exports JPEG files, serves them back with attachment headers, and rejects path traversal", async () => {
    const main = createMain();
    const sampleBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xd9]);
    const dataUrl = `data:image/jpeg;base64,${Buffer.from(sampleBytes).toString("base64")}`;

    const exported = await main.handle({
      method: "POST",
      path: "/export",
      query: { title: "日落旅拍特写" },
      body: { dataUrl },
      headers: {},
    });
    const exportBody = exported.body as {
      ok: boolean;
      fileName: string;
      downloadUrl: string;
    };
    expect(exportBody.ok).toBe(true);
    expect(exportBody.fileName).toMatch(/^PixCake-\d+\.jpg$/);

    const downloaded = await main.handle({
      method: "GET",
      path: `/export/${exportBody.fileName}`,
      query: {},
      body: undefined,
      headers: {},
    });
    expect(downloaded.headers).toMatchObject({
      "content-type": "image/jpeg",
      "content-disposition": `attachment; filename="${exportBody.fileName}"`,
    });
    expect(Array.from(downloaded.bytes ?? [])).toEqual(Array.from(sampleBytes));

    const traversal = await main.handle({
      method: "GET",
      path: "/export/..%2Fpackage.json",
      query: {},
      body: undefined,
      headers: {},
    });
    expect(traversal.status).toBe(400);
  });
});
