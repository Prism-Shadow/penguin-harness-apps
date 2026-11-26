import {
  type CharacterCard,
  type DramaProjectState,
  type LocationCard,
  type ShotItem,
  compileShotPromptWithAnchors,
  createCardboardHouseCharacters,
  createCardboardHouseLocations,
  createCardboardHouseShots,
} from "./preset.js";

export interface BreakdownResult {
  title: string;
  subtitle: string;
  genre: string;
  characters: CharacterCard[];
  locations: LocationCard[];
  shots: ShotItem[];
  usedAgentSession: boolean;
}

interface ParsedSceneBlock {
  sceneId: string;
  title: string;
  durationSec: number;
  locationHint: string;
  narrative: string;
  audioCue: string;
  subtitleText: string;
}

export function parseSceneBlocksFromScript(
  scriptText: string,
): ParsedSceneBlock[] {
  const lines = scriptText.replace(/\r\n/g, "\n").split("\n");
  const blocks: ParsedSceneBlock[] = [];
  let current: ParsedSceneBlock | null = null;
  const narrativeBuffer: string[] = [];

  const flushCurrent = () => {
    if (!current) return;
    current.narrative = narrativeBuffer.join(" ").trim();
    if (!current.subtitleText && current.narrative) {
      current.subtitleText = current.narrative.slice(0, 42);
    }
    blocks.push(current);
    current = null;
    narrativeBuffer.length = 0;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line === "---") continue;

    const headerMatch =
      line.match(
        /^#{2,4}\s*(SC\d{3}|第[一二三四五六七八九十\d]+[场镜幕]?)\s*([^\n（(]*?)(?:[（(]([^）)]*)[）)])?$/i,
      ) ??
      line.match(/^(SC\d{3})[\s:：]+([^\n（(]*?)(?:[（(]([^）)]*)[）)])?$/i);

    if (headerMatch) {
      flushCurrent();
      const rawId = headerMatch[1].toUpperCase();
      const idx = blocks.length + 1;
      const sceneId = rawId.startsWith("SC")
        ? rawId
        : `SC${String(idx).padStart(3, "0")}`;
      const rawTitle = (headerMatch[2] || `分场 ${idx}`).trim();
      const meta = headerMatch[3] || "";
      const durMatch = meta.match(/(\d+)\s*s|(\d+)\s*秒/i);
      const durationSec = durMatch ? Number(durMatch[1] || durMatch[2]) : 6;
      const locMatch = meta.match(/场景[:：]\s*([^|｜]+)/);
      const locationHint = locMatch ? locMatch[1].trim() : "";

      current = {
        sceneId,
        title: rawTitle,
        durationSec: Math.max(3, Math.min(15, durationSec)),
        locationHint,
        narrative: "",
        audioCue: "自然环境音与情绪配乐",
        subtitleText: "",
      };
      continue;
    }

    if (current) {
      const audioMatch = line.match(/^(?:音效|Audio|SFX)[:：]\s*(.+)$/i);
      if (audioMatch) {
        current.audioCue = audioMatch[1].trim();
        continue;
      }
      const subMatch = line.match(
        /^(?:字幕|台词|旁白|Subtitle|Dialogue)[:：]\s*(.+)$/i,
      );
      if (subMatch) {
        current.subtitleText = subMatch[1].trim();
        continue;
      }
      narrativeBuffer.push(line);
    }
  }
  flushCurrent();

  if (blocks.length === 0) {
    // Fallback: split by non-empty paragraphs that aren't metadata headers
    const paragraphs = scriptText
      .replace(/\r\n/g, "\n")
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(
        (p) =>
          p && !p.startsWith("#") && !p.startsWith("【") && !p.startsWith("- "),
      );

    paragraphs.slice(0, 12).forEach((para, idx) => {
      const firstLine = para.split("\n")[0]?.trim() ?? `镜头 ${idx + 1}`;
      blocks.push({
        sceneId: `SC${String(idx + 1).padStart(3, "0")}`,
        title: firstLine.slice(0, 14),
        durationSec: 6,
        locationHint: idx % 2 === 0 ? "外景" : "内景",
        narrative: para.replace(/\n+/g, " "),
        audioCue: "电影感环境音效与柔和配乐",
        subtitleText: para.split(/[。！？\n]/)[0]?.slice(0, 38) || firstLine,
      });
    });
  }

  return blocks;
}

export function breakdownScriptDeterministic(
  scriptText: string,
  existingState?: DramaProjectState,
): BreakdownResult {
  const isCardboardHouse =
    scriptText.includes("纸箱小屋") ||
    scriptText.includes("雨夜来客") ||
    (scriptText.includes("小橘") && scriptText.includes("便利店"));

  const titleMatch = scriptText.match(/^#\s*([^\n]+)/m);
  const parsedHeader = titleMatch ? titleMatch[1].trim() : "";

  const parsedBlocks = parseSceneBlocksFromScript(scriptText);

  if (isCardboardHouse) {
    const characters =
      existingState && existingState.characters.length > 0
        ? existingState.characters
        : createCardboardHouseCharacters();
    const locations =
      existingState && existingState.locations.length > 0
        ? existingState.locations
        : createCardboardHouseLocations();
    const baseShots = createCardboardHouseShots(characters, locations);

    // Overlay any user-edited narrative/subtitle/audio from the script onto the 8 shots
    const updatedShots: ShotItem[] = baseShots.map((baseShot, idx) => {
      const block =
        parsedBlocks.find((b) => b.sceneId === baseShot.sceneId) ??
        parsedBlocks[idx];
      const prevShot = existingState?.shots.find(
        (s) => s.shotId === baseShot.shotId,
      );
      const subtitleText = block?.subtitleText || baseShot.subtitleText;
      const audioCue = block?.audioCue || baseShot.audioCue;
      const durationSec = block?.durationSec || baseShot.durationSec;
      const mergedShot: ShotItem = {
        ...baseShot,
        title: block?.title ? `${block.title}` : baseShot.title,
        durationSec,
        audioCue,
        subtitleText,
        version: prevShot?.version ?? baseShot.version,
        videoFileName: prevShot?.videoFileName ?? baseShot.videoFileName,
        videoSha256: prevShot?.videoSha256 ?? baseShot.videoSha256,
        videoSizeBytes: prevShot?.videoSizeBytes ?? baseShot.videoSizeBytes,
        lastProvider: prevShot?.lastProvider ?? baseShot.lastProvider,
        visualGrade: prevShot?.visualGrade ?? baseShot.visualGrade,
        motionEffect: prevShot?.motionEffect ?? baseShot.motionEffect,
        compiledPrompt: "",
      };
      mergedShot.compiledPrompt = compileShotPromptWithAnchors(
        mergedShot,
        characters,
        locations,
      );
      return mergedShot;
    });

    return {
      title: parsedHeader.includes("纸箱小屋")
        ? "《纸箱小屋》"
        : (existingState?.title ?? "《纸箱小屋》"),
      subtitle:
        existingState?.subtitle ??
        "EP001《雨夜来客》 · DSH 第 8 章标准验证剧目",
      genre: existingState?.genre ?? "都市治愈 / 萌宠温情",
      characters,
      locations,
      shots: updatedShots,
      usedAgentSession: false,
    };
  }

  // Custom script breakdown
  const characters: CharacterCard[] = [
    {
      characterId: "CHAR-MAIN-01",
      name: "主角 A (Lead Character)",
      roleType: "protagonist",
      speciesOrAge: "核心叙事主角",
      summary: "由剧本自动拆解提取的第一主角设定卡。",
      identityAnchors:
        "consistent facial features and expressive eyes, signature protagonist outfit, natural cinematic skin or fur texture, stable silhouette across all shots",
      negativePrompt:
        "inconsistent clothing, deformed limbs, blurry face, cartoon flat shading",
      voiceStyle: "自然富有感染力的戏剧人声",
      looks: [
        {
          lookId: "LOOK-MAIN-DEFAULT",
          name: "主场景标准造型",
          description: "贯穿单集短剧的主造型锚点。",
          costumeAnchors:
            "signature consistent outfit and accessories matching the script setting",
        },
      ],
    },
    {
      characterId: "CHAR-SUPP-02",
      name: "对手戏角色 B (Co-Star)",
      roleType: "supporting",
      speciesOrAge: "重要互动角色",
      summary: "与主角形成情感或戏剧张力的互动角色设定卡。",
      identityAnchors:
        "distinctive secondary character appearance, warm expressive posture, consistent wardrobe colors and lighting rim",
      negativePrompt: "face morphing, extra fingers, low resolution",
      voiceStyle: "温和清晰的配角声线",
      looks: [
        {
          lookId: "LOOK-SUPP-DEFAULT",
          name: "标准互动造型",
          description: "对手戏角色的固定服装与外貌特征。",
          costumeAnchors:
            "clean consistent wardrobe contrasting subtly with protagonist",
        },
      ],
    },
  ];

  const locations: LocationCard[] = [
    {
      locationId: "LOC-SCENE-EXT",
      name: "核心主场景（外景/氛围场）",
      timeOfDay: "戏剧黄金时刻 / 夜景",
      weather: "富有电影氛围感的光影环境",
      summary: "剧本拆解生成的主外景空间，固定建筑结构与色温对比。",
      visualAnchors:
        "cinematic urban or natural exterior environment, rich depth of field, volumetric atmospheric lighting, realistic surface reflections",
      lightingMood: "电影感冷暖对比光效，主光突出人物眼神与轮廓",
      views: [
        {
          viewId: "VIEW-SCENE-EXT-01",
          direction: "主叙事机位视角",
          description: "兼具环境交代与人物情绪特写的标准景深视角。",
          lightingMood: "柔和戏剧性侧逆光",
        },
      ],
    },
    {
      locationId: "LOC-SCENE-INT",
      name: "核心副场景（内景/情绪场）",
      timeOfDay: "室内恒定戏剧光",
      weather: "室内温暖/安静空间",
      summary: "剧本拆解生成的室内互动空间，强化人物细腻情感交流。",
      visualAnchors:
        "cozy detailed interior space, warm practical lamps, clean spatial geometry, shallow depth of field background bokeh",
      lightingMood: "3200K-3800K 柔和室内实用光源，阴影细腻",
      views: [
        {
          viewId: "VIEW-SCENE-INT-01",
          direction: "室内互动中近景视角",
          description: "聚焦人物动作细节与视线交流。",
          lightingMood: "温暖顶光结合侧面眼神光",
        },
      ],
    },
  ];

  const cameraPresets = [
    {
      shot: "中近景 (Medium Close-Up)",
      angle: "平视视角 (Eye-Level)",
      move: "缓慢推进 (Slow Push-In)",
    },
    {
      shot: "中景 (Medium Shot)",
      angle: "微侧视角 (Three-Quarter)",
      move: "轻微横摇 (Gentle Pan)",
    },
    {
      shot: "近景特写 (Close-Up)",
      angle: "低机位平视 (Low Eye-Level)",
      move: "跟随运镜 (Tracking)",
    },
    {
      shot: "全景拉远 (Wide Pull-Back)",
      angle: "平视远景 (Wide Eye-Level)",
      move: "缓慢拉远 (Smooth Pull-Back)",
    },
  ];

  const now = new Date().toISOString();
  const shots: ShotItem[] = parsedBlocks.map((block, index) => {
    const shotNum = index + 1;
    const shotId = `SHOT-${String(shotNum).padStart(3, "0")}`;
    const presetAssetIndex = ((shotNum - 1) % 8) + 1;
    const presetAssetFile = `SHOT-${String(presetAssetIndex).padStart(3, "0")}.mp4`;
    const cam = cameraPresets[index % cameraPresets.length];
    const isInt = block.locationHint.includes("内") || index % 2 === 1;
    const locationId = isInt ? "LOC-SCENE-INT" : "LOC-SCENE-EXT";
    const locationViewId = isInt ? "VIEW-SCENE-INT-01" : "VIEW-SCENE-EXT-01";

    const shotItem: ShotItem = {
      shotId,
      order: shotNum,
      sceneId: block.sceneId,
      title: block.title,
      durationSec: block.durationSec,
      cameraShot: cam.shot,
      cameraAngle: cam.angle,
      cameraMovement: cam.move,
      characterIds:
        index % 2 === 0 ? ["CHAR-MAIN-01"] : ["CHAR-MAIN-01", "CHAR-SUPP-02"],
      characterLookId: "LOOK-MAIN-DEFAULT",
      locationId,
      locationViewId,
      startFrameDesc: `${block.title}起始画面：${block.narrative.slice(0, 46)}`,
      endFrameDesc: `${block.title}落幅画面：镜头完成${cam.move}，情绪定格。`,
      actionBeats: [
        `0-2s：画面切入${block.title}，交代环境与人物起始状态`,
        `2-4s：${block.narrative.slice(0, 55)}`,
        `4-${block.durationSec}s：人物神态细节收束，呼应字幕“${block.subtitleText.slice(0, 24)}”`,
      ],
      videoPrompt: `Cinematic short drama shot (${block.sceneId} - ${block.title}). ${block.narrative}`,
      compiledPrompt: "",
      negativePrompt:
        "blurry, low quality, deformed limbs, watermark, text artifacts",
      audioCue: block.audioCue,
      subtitleText: block.subtitleText,
      visualGrade: "default",
      motionEffect: "default",
      status: "ready",
      version: 1,
      videoFileName: `${shotId}.mp4`,
      videoSha256: "",
      videoSizeBytes: 0,
      updatedAt: now,
      lastProvider: "studio-breakdown",
      presetAssetFile,
    };
    shotItem.compiledPrompt = compileShotPromptWithAnchors(
      shotItem,
      characters,
      locations,
    );
    return shotItem;
  });

  return {
    title: parsedHeader || "自定义短剧剧目",
    subtitle: `共 ${shots.length} 个分镜 · AI 自动拆解生成`,
    genre: "AI 短剧分镜工程",
    characters,
    locations,
    shots,
    usedAgentSession: false,
  };
}

export function syncAllShotsWithConsistencyAnchors(
  state: DramaProjectState,
): DramaProjectState {
  const now = new Date().toISOString();
  const updatedShots = state.shots.map((shot) => ({
    ...shot,
    compiledPrompt: compileShotPromptWithAnchors(
      shot,
      state.characters,
      state.locations,
    ),
  }));
  return {
    ...state,
    shots: updatedShots,
    updatedAt: now,
  };
}
