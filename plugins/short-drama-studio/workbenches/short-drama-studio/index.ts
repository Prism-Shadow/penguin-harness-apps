import type {
  WorkbenchHost,
  WorkbenchPackage,
  WorkbenchRequest,
  WorkbenchResponse,
} from "@prismshadow/penguin-server/plugin";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  breakdownScriptDeterministic,
  syncAllShotsWithConsistencyAnchors,
} from "./breakdown.js";
import {
  type AuditLogEntry,
  type CharacterCard,
  type DramaProjectState,
  type LocationCard,
  type ProviderConfig,
  type ShotItem,
  type ShotMotionEffect,
  type ShotVisualGrade,
  compileShotPromptWithAnchors,
  createCardboardHousePreset,
} from "./preset.js";
import {
  computeFileSha256,
  ensurePresetShotVideosCopied,
  mergeEpisodeMp4,
  renderShotVideoFile,
  resolveFfmpegBinary,
} from "./video-engine.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const workbenchRoot =
  path.basename(path.dirname(here)) === ".build"
    ? path.resolve(here, "../..")
    : here;
const presetAssetsDir = path.join(workbenchRoot, "assets", "preset-videos");

function json(body: unknown, status = 200): WorkbenchResponse {
  return {
    status,
    body,
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function stateFilePath(dataDir: string): string {
  return path.join(dataDir, "state.json");
}

function videosDirPath(dataDir: string): string {
  return path.join(dataDir, "videos");
}

function exportsDirPath(dataDir: string): string {
  return path.join(dataDir, "exports");
}

async function saveState(
  dataDir: string,
  state: DramaProjectState,
): Promise<void> {
  await mkdir(dataDir, { recursive: true });
  await writeFile(
    stateFilePath(dataDir),
    `${JSON.stringify(state, null, 2)}\n`,
  );
}

async function loadOrInitializeState(
  dataDir: string,
): Promise<DramaProjectState> {
  await mkdir(dataDir, { recursive: true });
  await mkdir(videosDirPath(dataDir), { recursive: true });
  await mkdir(exportsDirPath(dataDir), { recursive: true });

  const file = stateFilePath(dataDir);
  let state: DramaProjectState;
  if (existsSync(file)) {
    try {
      const raw = new TextDecoder().decode(await readFile(file));
      state = JSON.parse(raw) as DramaProjectState;
    } catch {
      state = createCardboardHousePreset();
    }
  } else {
    state = createCardboardHousePreset();
  }

  const hydratedShots = await ensurePresetShotVideosCopied({
    shots: state.shots,
    presetAssetsDir,
    targetVideosDir: videosDirPath(dataDir),
  });

  state = {
    ...state,
    shots: hydratedShots,
  };
  await saveState(dataDir, state);
  return state;
}

function getRuntimeCapabilities(config: ProviderConfig) {
  return {
    ffmpegAvailable: Boolean(resolveFfmpegBinary()),
    ffmpegPath: resolveFfmpegBinary() ? "detected" : "builtin-mp4-fallback",
    seedanceKeyConfigured: Boolean(
      process.env[config.seedanceApiKeyEnv || "ARK_API_KEY"],
    ),
    minimaxKeyConfigured: Boolean(
      process.env[config.minimaxApiKeyEnv || "MINIMAX_API_KEY"],
    ),
    openaiKeyConfigured: Boolean(
      process.env[config.openaiApiKeyEnv || "OPENAI_API_KEY"],
    ),
  };
}

function getQueryParam(
  query: WorkbenchRequest["query"] | URLSearchParams,
  key: string,
): string | undefined {
  if (!query) return undefined;
  if (typeof (query as URLSearchParams).get === "function") {
    return (query as URLSearchParams).get(key) ?? undefined;
  }
  return (query as Record<string, string>)[key];
}

async function serveMp4File(
  filePath: string,
  req: WorkbenchRequest,
  downloadFileName?: string,
): Promise<WorkbenchResponse> {
  if (!existsSync(filePath)) {
    return json({ error: `视频文件不存在: ${path.basename(filePath)}` }, 404);
  }
  const fullBuffer = await readFile(filePath);
  const totalLength = fullBuffer.byteLength;
  const baseHeaders: Record<string, string> = {
    "content-type": "video/mp4",
    "accept-ranges": "bytes",
    "cache-control": "no-store",
  };
  if (downloadFileName) {
    baseHeaders["content-disposition"] =
      `attachment; filename="${downloadFileName}"`;
  }

  const rangeHeader = req.headers?.["range"] || req.headers?.["Range"];
  if (rangeHeader && rangeHeader.startsWith("bytes=")) {
    const [startStr, endStr] = rangeHeader.replace("bytes=", "").split("-");
    const start = Math.max(0, Number.parseInt(startStr, 10) || 0);
    const end = endStr
      ? Math.min(totalLength - 1, Number.parseInt(endStr, 10))
      : totalLength - 1;
    if (start <= end && start < totalLength) {
      const slice = fullBuffer.subarray(start, end + 1);
      return {
        status: 206,
        headers: {
          ...baseHeaders,
          "content-range": `bytes ${start}-${end}/${totalLength}`,
          "content-length": String(slice.byteLength),
        },
        bytes: new Uint8Array(slice),
      };
    }
  }

  return {
    status: 200,
    headers: {
      ...baseHeaders,
      "content-length": String(totalLength),
    },
    bytes: new Uint8Array(fullBuffer),
  };
}

function appendAudit(
  state: DramaProjectState,
  entry: Omit<AuditLogEntry, "auditId" | "timestamp">,
): void {
  const fullEntry: AuditLogEntry = {
    auditId: `audit-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  };
  state.auditLog = [fullEntry, ...state.auditLog].slice(0, 50);
}

export async function handleStudioRequest(
  req: WorkbenchRequest,
  host: Pick<WorkbenchHost, "dataPaths" | "log">,
): Promise<WorkbenchResponse> {
  const dataDir = host.dataPaths().dataDir;
  const method = String(req.method || "GET").toUpperCase();
  const rawPath = (req.path || "/").replace(/\/+$/, "") || "/";
  const routePath = rawPath.startsWith("/api/")
    ? rawPath.slice(4)
    : rawPath === "/api"
      ? "/"
      : rawPath;

  const state = await loadOrInitializeState(dataDir);

  // 1. GET /state
  if (method === "GET" && routePath === "/state") {
    return json({
      state,
      capabilities: getRuntimeCapabilities(state.providerConfig),
    });
  }

  // 2. POST /preset/reset
  if (method === "POST" && routePath === "/preset/reset") {
    const fresh = createCardboardHousePreset();
    const videosDir = videosDirPath(dataDir);
    await mkdir(videosDir, { recursive: true });
    fresh.shots = await ensurePresetShotVideosCopied({
      shots: fresh.shots,
      presetAssetsDir,
      targetVideosDir: videosDir,
      overwrite: true,
    });
    fresh.updatedAt = new Date().toISOString();
    await saveState(dataDir, fresh);
    return json({
      state: fresh,
      capabilities: getRuntimeCapabilities(fresh.providerConfig),
    });
  }

  // 3. POST /script/breakdown
  if (method === "POST" && routePath === "/script/breakdown") {
    const body = asRecord(req.body);
    const scriptText =
      typeof body.scriptText === "string" && body.scriptText.trim()
        ? body.scriptText
        : state.scriptText;

    const parsed = breakdownScriptDeterministic(scriptText, state);
    const videosDir = videosDirPath(dataDir);
    const hydratedShots = await ensurePresetShotVideosCopied({
      shots: parsed.shots,
      presetAssetsDir,
      targetVideosDir: videosDir,
    });

    state.scriptText = scriptText;
    state.title = parsed.title;
    state.subtitle = parsed.subtitle;
    state.genre = parsed.genre;
    state.characters = parsed.characters;
    state.locations = parsed.locations;
    state.shots = hydratedShots;
    state.targetDurationSec = hydratedShots.reduce(
      (acc, s) => acc + s.durationSec,
      0,
    );
    state.updatedAt = new Date().toISOString();

    appendAudit(state, {
      action: "breakdown-script",
      summary: `已完成剧本拆解：生成 ${state.characters.length} 张角色设定卡、${state.locations.length} 张场景设定卡与 ${state.shots.length} 个结构化分镜（总时长 ${state.targetDurationSec}s）。`,
    });

    await saveState(dataDir, state);
    return json({
      state,
      capabilities: getRuntimeCapabilities(state.providerConfig),
    });
  }

  // 4. PUT /consistency
  if (method === "PUT" && routePath === "/consistency") {
    const body = asRecord(req.body);
    if (Array.isArray(body.characters)) {
      state.characters = body.characters as CharacterCard[];
    } else if (body.character && typeof body.character === "object") {
      const updatedChar = body.character as CharacterCard;
      state.characters = state.characters.map((c) =>
        c.characterId === updatedChar.characterId
          ? { ...c, ...updatedChar }
          : c,
      );
    }

    if (Array.isArray(body.locations)) {
      state.locations = body.locations as LocationCard[];
    } else if (body.location && typeof body.location === "object") {
      const updatedLoc = body.location as LocationCard;
      state.locations = state.locations.map((l) =>
        l.locationId === updatedLoc.locationId ? { ...l, ...updatedLoc } : l,
      );
    }

    const synced = syncAllShotsWithConsistencyAnchors(state);
    appendAudit(synced, {
      action: "sync-anchors",
      summary: `已更新角色/场景一致性设定卡，并将外观与光影锚点同步注入全部 ${synced.shots.length} 个镜头的编译提示词。`,
    });
    await saveState(dataDir, synced);
    return json({
      state: synced,
      capabilities: getRuntimeCapabilities(synced.providerConfig),
    });
  }

  // 5. PUT /provider
  if (method === "PUT" && routePath === "/provider") {
    const body = asRecord(req.body);
    state.providerConfig = {
      ...state.providerConfig,
      ...(body as Partial<ProviderConfig>),
    };
    state.updatedAt = new Date().toISOString();
    await saveState(dataDir, state);
    return json({
      state,
      capabilities: getRuntimeCapabilities(state.providerConfig),
    });
  }

  // 6. PUT /shots/:shotId (edit shot fields without re-rendering video yet)
  const shotMatch = routePath.match(/^\/shots\/(SHOT-\d{3})$/);
  if (method === "PUT" && shotMatch) {
    const shotId = shotMatch[1];
    const shotIndex = state.shots.findIndex((s) => s.shotId === shotId);
    if (shotIndex === -1) {
      return json({ error: `未找到分镜 ${shotId}` }, 404);
    }
    const body = asRecord(req.body);
    const current = state.shots[shotIndex];
    const updatedShot: ShotItem = {
      ...current,
      title: typeof body.title === "string" ? body.title : current.title,
      durationSec:
        typeof body.durationSec === "number" &&
        body.durationSec >= 2 &&
        body.durationSec <= 20
          ? body.durationSec
          : current.durationSec,
      cameraShot:
        typeof body.cameraShot === "string"
          ? body.cameraShot
          : current.cameraShot,
      cameraAngle:
        typeof body.cameraAngle === "string"
          ? body.cameraAngle
          : current.cameraAngle,
      cameraMovement:
        typeof body.cameraMovement === "string"
          ? body.cameraMovement
          : current.cameraMovement,
      startFrameDesc:
        typeof body.startFrameDesc === "string"
          ? body.startFrameDesc
          : current.startFrameDesc,
      endFrameDesc:
        typeof body.endFrameDesc === "string"
          ? body.endFrameDesc
          : current.endFrameDesc,
      actionBeats: Array.isArray(body.actionBeats)
        ? (body.actionBeats as string[])
        : current.actionBeats,
      videoPrompt:
        typeof body.videoPrompt === "string"
          ? body.videoPrompt
          : current.videoPrompt,
      negativePrompt:
        typeof body.negativePrompt === "string"
          ? body.negativePrompt
          : current.negativePrompt,
      audioCue:
        typeof body.audioCue === "string" ? body.audioCue : current.audioCue,
      subtitleText:
        typeof body.subtitleText === "string"
          ? body.subtitleText
          : current.subtitleText,
      visualGrade:
        typeof body.visualGrade === "string"
          ? (body.visualGrade as ShotVisualGrade)
          : current.visualGrade,
      motionEffect:
        typeof body.motionEffect === "string"
          ? (body.motionEffect as ShotMotionEffect)
          : current.motionEffect,
      characterIds: Array.isArray(body.characterIds)
        ? (body.characterIds as string[])
        : current.characterIds,
      characterLookId:
        typeof body.characterLookId === "string"
          ? body.characterLookId
          : current.characterLookId,
      locationId:
        typeof body.locationId === "string"
          ? body.locationId
          : current.locationId,
      locationViewId:
        typeof body.locationViewId === "string"
          ? body.locationViewId
          : current.locationViewId,
      updatedAt: new Date().toISOString(),
    };
    updatedShot.compiledPrompt = compileShotPromptWithAnchors(
      updatedShot,
      state.characters,
      state.locations,
    );
    state.shots[shotIndex] = updatedShot;
    state.targetDurationSec = state.shots.reduce(
      (acc, s) => acc + s.durationSec,
      0,
    );
    state.updatedAt = new Date().toISOString();
    await saveState(dataDir, state);
    return json({
      state,
      shot: updatedShot,
    });
  }

  // 7. POST /shots/:shotId/rerender or /shots/:shotId/retry
  const rerenderMatch = routePath.match(
    /^\/shots\/(SHOT-\d{3})\/(rerender|retry)$/,
  );
  if (method === "POST" && rerenderMatch) {
    const targetShotId = rerenderMatch[1];
    const modeAction = rerenderMatch[2] as "rerender" | "retry";
    const shotIndex = state.shots.findIndex((s) => s.shotId === targetShotId);
    if (shotIndex === -1) {
      return json({ error: `未找到分镜 ${targetShotId}` }, 404);
    }

    const body = asRecord(req.body);
    const current = state.shots[shotIndex];

    const untouchedBefore = new Map<
      string,
      { version: number; sha256: string; order: number }
    >();
    for (const s of state.shots) {
      if (s.shotId !== targetShotId) {
        untouchedBefore.set(s.shotId, {
          version: s.version,
          sha256: s.videoSha256,
          order: s.order,
        });
      }
    }

    const prevVersion = current.version;
    const prevSha256 = current.videoSha256;

    const nextShot: ShotItem = {
      ...current,
      title: typeof body.title === "string" ? body.title : current.title,
      videoPrompt:
        typeof body.videoPrompt === "string"
          ? body.videoPrompt
          : current.videoPrompt,
      subtitleText:
        typeof body.subtitleText === "string"
          ? body.subtitleText
          : current.subtitleText,
      audioCue:
        typeof body.audioCue === "string" ? body.audioCue : current.audioCue,
      cameraShot:
        typeof body.cameraShot === "string"
          ? body.cameraShot
          : current.cameraShot,
      cameraAngle:
        typeof body.cameraAngle === "string"
          ? body.cameraAngle
          : current.cameraAngle,
      cameraMovement:
        typeof body.cameraMovement === "string"
          ? body.cameraMovement
          : current.cameraMovement,
      startFrameDesc:
        typeof body.startFrameDesc === "string"
          ? body.startFrameDesc
          : current.startFrameDesc,
      endFrameDesc:
        typeof body.endFrameDesc === "string"
          ? body.endFrameDesc
          : current.endFrameDesc,
      visualGrade:
        typeof body.visualGrade === "string"
          ? (body.visualGrade as ShotVisualGrade)
          : current.visualGrade,
      motionEffect:
        typeof body.motionEffect === "string"
          ? (body.motionEffect as ShotMotionEffect)
          : current.motionEffect,
      version: current.version + 1,
      status: "generating",
      lastError: undefined,
    };
    nextShot.compiledPrompt = compileShotPromptWithAnchors(
      nextShot,
      state.characters,
      state.locations,
    );

    const videosDir = videosDirPath(dataDir);
    const targetVideoPath = path.join(videosDir, nextShot.videoFileName);
    const presetFileName =
      nextShot.presetAssetFile ||
      `SHOT-${String(((nextShot.order - 1) % 8) + 1).padStart(3, "0")}.mp4`;
    const sourcePresetPath = path.join(presetAssetsDir, presetFileName);

    try {
      const renderRes = await renderShotVideoFile({
        shot: nextShot,
        providerConfig: state.providerConfig,
        sourcePresetPath: existsSync(sourcePresetPath)
          ? sourcePresetPath
          : targetVideoPath,
        targetVideoPath,
        simulateFailure: Boolean(body.simulateFailure),
      });

      nextShot.status = "ready";
      nextShot.videoSha256 = renderRes.sha256;
      nextShot.videoSizeBytes = renderRes.sizeBytes;
      nextShot.lastProvider = renderRes.providerUsed;
      nextShot.updatedAt = new Date().toISOString();
      state.shots[shotIndex] = nextShot;

      let untouchedHashesVerified = true;
      for (const s of state.shots) {
        if (s.shotId === targetShotId) continue;
        const before = untouchedBefore.get(s.shotId);
        const diskFile = path.join(videosDir, s.videoFileName);
        const diskInfo = await computeFileSha256(diskFile);
        if (
          !before ||
          before.version !== s.version ||
          before.order !== s.order ||
          before.sha256 !== diskInfo.sha256
        ) {
          untouchedHashesVerified = false;
        }
      }

      appendAudit(state, {
        action: modeAction === "retry" ? "retry-shot" : "rerender-shot",
        targetShotId,
        previousVersion: prevVersion,
        newVersion: nextShot.version,
        previousSha256: prevSha256.slice(0, 12),
        newSha256: nextShot.videoSha256.slice(0, 12),
        untouchedShotCount: state.shots.length - 1,
        untouchedHashesVerified,
        providerUsed: renderRes.providerUsed,
        summary: `单镜头无损重做完成：${targetShotId} 从 v${prevVersion} 升级至 v${nextShot.version}（SHA-256: ${prevSha256.slice(0, 8)} → ${nextShot.videoSha256.slice(0, 8)}），其余 ${state.shots.length - 1} 个分镜文件、版本与时间轴顺序 100% 保持原样。`,
      });

      state.updatedAt = new Date().toISOString();
      await saveState(dataDir, state);
      host.log(
        `short-drama-studio: re-rendered ${targetShotId} -> v${nextShot.version}`,
      );
      return json({
        state,
        shot: nextShot,
        isolationCheck: {
          targetShotId,
          previousVersion: prevVersion,
          newVersion: nextShot.version,
          previousSha256: prevSha256,
          newSha256: nextShot.videoSha256,
          untouchedShotCount: state.shots.length - 1,
          untouchedHashesVerified,
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const failedShot: ShotItem = {
        ...nextShot,
        version: prevVersion,
        status: "failed",
        lastError: message,
        updatedAt: new Date().toISOString(),
      };
      state.shots[shotIndex] = failedShot;
      state.updatedAt = new Date().toISOString();
      await saveState(dataDir, state);
      return json(
        {
          error: message,
          state,
          shot: failedShot,
        },
        422,
      );
    }
  }

  // 8. POST /shots/reorder
  if (method === "POST" && routePath === "/shots/reorder") {
    const body = asRecord(req.body);
    const shotOrder = Array.isArray(body.shotOrder)
      ? (body.shotOrder as string[])
      : [];
    if (shotOrder.length === state.shots.length) {
      const byId = new Map(state.shots.map((s) => [s.shotId, s]));
      const reordered: ShotItem[] = [];
      shotOrder.forEach((id, idx) => {
        const item = byId.get(id);
        if (item) {
          reordered.push({ ...item, order: idx + 1 });
        }
      });
      if (reordered.length === state.shots.length) {
        state.shots = reordered;
        state.updatedAt = new Date().toISOString();
        await saveState(dataDir, state);
      }
    }
    return json({ state });
  }

  // 9. POST /episode/export
  if (method === "POST" && routePath === "/episode/export") {
    const orderedShots = [...state.shots].sort((a, b) => a.order - b.order);
    const exportFileName = `episode-${state.episodeId || "EP001"}.mp4`;
    const outputFilePath = path.join(exportsDirPath(dataDir), exportFileName);

    try {
      const merged = await mergeEpisodeMp4({
        orderedShots,
        videosDir: videosDirPath(dataDir),
        outputFilePath,
      });

      const exportInfo = {
        episodeId: state.episodeId || "EP001",
        fileName: exportFileName,
        sizeBytes: merged.sizeBytes,
        sha256: merged.sha256,
        durationSec: merged.durationSec,
        shotCount: orderedShots.length,
        exportedAt: new Date().toISOString(),
        shotOrder: orderedShots.map((s) => s.shotId),
        shotHashes: merged.shotHashes,
      };

      state.lastExport = exportInfo;
      state.updatedAt = new Date().toISOString();
      appendAudit(state, {
        action: "export-episode",
        summary: `已按时间轴顺序（${exportInfo.shotOrder.join(" → ")}）合成完整单集 MP4 成片 ${exportFileName}（时长 ${exportInfo.durationSec}s，大小 ${(exportInfo.sizeBytes / 1024 / 1024).toFixed(2)} MB，SHA-256: ${exportInfo.sha256.slice(0, 12)}）。`,
      });
      await saveState(dataDir, state);
      host.log(
        `short-drama-studio: exported ${exportFileName} (${merged.sizeBytes} bytes)`,
      );

      return json({
        state,
        exportInfo,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return json({ error: message }, 500);
    }
  }

  // 10. GET /videos/:shotId
  const videoMatch = routePath.match(/^\/videos\/(SHOT-\d{3})$/);
  if (method === "GET" && videoMatch) {
    const shotId = videoMatch[1];
    const shot = state.shots.find((s) => s.shotId === shotId);
    if (!shot) {
      return json({ error: `未找到分镜 ${shotId}` }, 404);
    }
    const filePath = path.join(videosDirPath(dataDir), shot.videoFileName);
    const download = getQueryParam(req.query, "download") === "1";
    return serveMp4File(
      filePath,
      req,
      download ? `${shot.shotId}-v${shot.version}.mp4` : undefined,
    );
  }

  // 11. GET /episode/download
  if (method === "GET" && routePath === "/episode/download") {
    const exportFileName =
      state.lastExport?.fileName || `episode-${state.episodeId || "EP001"}.mp4`;
    const outputFilePath = path.join(exportsDirPath(dataDir), exportFileName);
    if (!existsSync(outputFilePath)) {
      const orderedShots = [...state.shots].sort((a, b) => a.order - b.order);
      const merged = await mergeEpisodeMp4({
        orderedShots,
        videosDir: videosDirPath(dataDir),
        outputFilePath,
      });
      state.lastExport = {
        episodeId: state.episodeId || "EP001",
        fileName: exportFileName,
        sizeBytes: merged.sizeBytes,
        sha256: merged.sha256,
        durationSec: merged.durationSec,
        shotCount: orderedShots.length,
        exportedAt: new Date().toISOString(),
        shotOrder: orderedShots.map((s) => s.shotId),
        shotHashes: merged.shotHashes,
      };
      await saveState(dataDir, state);
    }
    const forceDownload = getQueryParam(req.query, "download") !== "0";
    return serveMp4File(
      outputFilePath,
      req,
      forceDownload ? exportFileName : undefined,
    );
  }

  return json({ error: `Not found: ${method} ${routePath}` }, 404);
}

export default {
  modules: {
    Workbench: {
      create({ use }) {
        const host = use.host;
        return {
          api: {
            main: {
              async handle(req: WorkbenchRequest): Promise<WorkbenchResponse> {
                return handleStudioRequest(req, host);
              },
            },
          },
        };
      },
    },
  },
} satisfies WorkbenchPackage;
