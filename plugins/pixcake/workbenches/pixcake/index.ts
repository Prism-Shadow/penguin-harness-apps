import { existsSync } from "node:fs";
import { lstat, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type {
  WorkbenchPackage,
  WorkbenchResponse,
} from "@prismshadow/penguin-server/plugin";

export interface CustomPreset {
  id: string;
  name: string;
  detail: string;
  badge: string;
  values: Record<string, number | string>;
  createdAt: number;
}

export interface PixCakeStateDoc {
  currentSampleId?: string;
  activePresetId?: string | null;
  params?: Record<string, number | string>;
  customPresets?: CustomPreset[];
  exportHistory?: Array<{
    fileName: string;
    title: string;
    createdAt: number;
  }>;
}

function normalizeState(raw: unknown): Required<PixCakeStateDoc> {
  const obj =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    currentSampleId:
      typeof obj.currentSampleId === "string"
        ? obj.currentSampleId
        : "sample_1",
    activePresetId:
      typeof obj.activePresetId === "string"
        ? obj.activePresetId
        : "pixcake_pro",
    params:
      obj.params && typeof obj.params === "object"
        ? (obj.params as Record<string, number | string>)
        : {},
    customPresets: Array.isArray(obj.customPresets)
      ? (obj.customPresets as CustomPreset[])
      : [],
    exportHistory: Array.isArray(obj.exportHistory)
      ? (obj.exportHistory as Array<{
          fileName: string;
          title: string;
          createdAt: number;
        }>)
      : [],
  };
}

export default {
  modules: {
    Workbench: {
      create({ use }) {
        const host = use.host;
        let writeChain: Promise<void> = Promise.resolve();

        const updateState = async (
          mutator: (draft: Required<PixCakeStateDoc>) => void,
        ): Promise<Required<PixCakeStateDoc>> => {
          let nextDoc!: Required<PixCakeStateDoc>;
          const run = writeChain.then(async () => {
            const current = normalizeState(host.getState());
            const clone = JSON.parse(
              JSON.stringify(current),
            ) as Required<PixCakeStateDoc>;
            mutator(clone);
            await host.setState(clone);
            nextDoc = clone;
          });
          writeChain = run.then(
            () => undefined,
            () => undefined,
          );
          await run;
          return nextDoc;
        };

        return {
          api: {
            main: {
              async handle(req): Promise<WorkbenchResponse> {
                if (req.path === "/state" && req.method === "GET") {
                  const doc = normalizeState(host.getState());
                  return { body: { ok: true, state: doc } };
                }

                if (req.path === "/state" && req.method === "POST") {
                  const body =
                    req.body && typeof req.body === "object"
                      ? (req.body as Record<string, unknown>)
                      : {};
                  const updated = await updateState((draft) => {
                    if (typeof body.currentSampleId === "string") {
                      draft.currentSampleId = body.currentSampleId;
                    }
                    if (
                      typeof body.activePresetId === "string" ||
                      body.activePresetId === null
                    ) {
                      draft.activePresetId = body.activePresetId;
                    }
                    if (body.params && typeof body.params === "object") {
                      draft.params = body.params as Record<
                        string,
                        number | string
                      >;
                    }
                  });
                  return { body: { ok: true, state: updated } };
                }

                if (req.path === "/presets" && req.method === "POST") {
                  const body =
                    req.body && typeof req.body === "object"
                      ? (req.body as Record<string, unknown>)
                      : {};
                  const rawName =
                    typeof body.name === "string" ? body.name.trim() : "";
                  if (!rawName) {
                    return {
                      status: 400,
                      body: { ok: false, error: "配方名称不能为空" },
                    };
                  }
                  const values =
                    body.values && typeof body.values === "object"
                      ? (body.values as Record<string, number | string>)
                      : {};
                  const preset: CustomPreset = {
                    id: `custom_${Date.now()}`,
                    name: rawName.slice(0, 28),
                    detail:
                      typeof body.detail === "string" && body.detail.trim()
                        ? body.detail.trim().slice(0, 60)
                        : "个人自定义精修参数配方",
                    badge: "自定配方",
                    values,
                    createdAt: Date.now(),
                  };
                  const updated = await updateState((draft) => {
                    draft.customPresets.unshift(preset);
                    draft.activePresetId = preset.id;
                  });
                  return { body: { ok: true, preset, state: updated } };
                }

                if (
                  req.path.startsWith("/presets/") &&
                  req.method === "DELETE"
                ) {
                  const presetId = decodeURIComponent(
                    req.path.slice("/presets/".length),
                  );
                  const updated = await updateState((draft) => {
                    draft.customPresets = draft.customPresets.filter(
                      (p) => p.id !== presetId,
                    );
                    if (draft.activePresetId === presetId) {
                      draft.activePresetId = null;
                    }
                  });
                  return { body: { ok: true, state: updated } };
                }

                if (req.path === "/export" && req.method === "POST") {
                  let imgBytes: Uint8Array | null = null;
                  if (req.bytes && req.bytes.byteLength > 0) {
                    imgBytes = req.bytes;
                  } else if (req.body && typeof req.body === "object") {
                    const b = req.body as Record<string, unknown>;
                    if (typeof b.dataUrl === "string") {
                      const commaIdx = b.dataUrl.indexOf(",");
                      const b64 =
                        commaIdx >= 0
                          ? b.dataUrl.slice(commaIdx + 1)
                          : b.dataUrl;
                      imgBytes = new Uint8Array(Buffer.from(b64, "base64"));
                    }
                  }

                  if (!imgBytes || imgBytes.byteLength === 0) {
                    return {
                      status: 400,
                      body: { ok: false, error: "导出图像数据为空" },
                    };
                  }

                  const { dataDir } = host.dataPaths();
                  const exportDir = path.join(dataDir, "exports");
                  await mkdir(exportDir, { recursive: true });
                  const fileName = `PixCake-${Date.now()}.jpg`;
                  const filePath = path.join(exportDir, fileName);
                  await writeFile(filePath, imgBytes);

                  const title =
                    typeof req.query.title === "string" && req.query.title
                      ? req.query.title
                      : "精修成片";
                  await updateState((draft) => {
                    draft.exportHistory.unshift({
                      fileName,
                      title,
                      createdAt: Date.now(),
                    });
                    draft.exportHistory = draft.exportHistory.slice(0, 20);
                  });

                  return {
                    body: {
                      ok: true,
                      fileName,
                      downloadUrl: `../api/export/${encodeURIComponent(fileName)}`,
                    },
                  };
                }

                if (
                  req.path.startsWith("/export/") &&
                  (req.method === "GET" || req.method === "HEAD")
                ) {
                  const rawName = decodeURIComponent(
                    req.path.slice("/export/".length),
                  );
                  if (!/^PixCake-\d+\.jpg$/.test(rawName)) {
                    return {
                      status: 400,
                      body: { ok: false, error: "非法导出文件名" },
                    };
                  }
                  const { dataDir } = host.dataPaths();
                  const exportDir = path.join(dataDir, "exports");
                  const filePath = path.join(exportDir, rawName);
                  if (!existsSync(filePath)) {
                    return {
                      status: 404,
                      body: { ok: false, error: "导出文件不存在" },
                    };
                  }
                  const st = await lstat(filePath);
                  if (!st.isFile()) {
                    return {
                      status: 400,
                      body: { ok: false, error: "非法文件类型" },
                    };
                  }
                  const data = await readFile(filePath);
                  return {
                    headers: {
                      "content-type": "image/jpeg",
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
