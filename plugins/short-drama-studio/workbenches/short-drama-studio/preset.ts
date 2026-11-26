export type VideoProviderMode =
  "studio-ffmpeg" | "seedance" | "minimax" | "openai-video";

export interface CharacterLook {
  lookId: string;
  name: string;
  description: string;
  costumeAnchors: string;
}

export interface CharacterCard {
  characterId: string;
  name: string;
  roleType: "protagonist" | "supporting" | "cameo";
  speciesOrAge: string;
  summary: string;
  identityAnchors: string;
  negativePrompt: string;
  voiceStyle: string;
  looks: CharacterLook[];
}

export interface LocationView {
  viewId: string;
  direction: string;
  description: string;
  lightingMood: string;
}

export interface LocationCard {
  locationId: string;
  name: string;
  timeOfDay: string;
  weather: string;
  summary: string;
  visualAnchors: string;
  lightingMood: string;
  views: LocationView[];
}

export type ShotStatus = "ready" | "generating" | "failed" | "pending";

export type ShotVisualGrade =
  "default" | "warm-amber" | "cold-rain" | "cinema-contrast" | "dream-soft";

export type ShotMotionEffect =
  | "default"
  | "slow-push-in"
  | "gentle-pull-back"
  | "pan-right"
  | "micro-handheld";

export interface ShotItem {
  shotId: string;
  order: number;
  sceneId: string;
  title: string;
  durationSec: number;
  cameraShot: string;
  cameraAngle: string;
  cameraMovement: string;
  characterIds: string[];
  characterLookId: string;
  locationId: string;
  locationViewId: string;
  startFrameDesc: string;
  endFrameDesc: string;
  actionBeats: string[];
  videoPrompt: string;
  compiledPrompt: string;
  negativePrompt: string;
  audioCue: string;
  subtitleText: string;
  visualGrade: ShotVisualGrade;
  motionEffect: ShotMotionEffect;
  status: ShotStatus;
  version: number;
  videoFileName: string;
  videoSha256: string;
  videoSizeBytes: number;
  updatedAt: string;
  lastProvider: string;
  lastError?: string;
  presetAssetFile?: string;
}

export interface ProviderConfig {
  mode: VideoProviderMode;
  aspectRatio: "16:9" | "9:16";
  resolution: "720p" | "1080p";
  fps: number;
  confirmBeforeGenerate: boolean;
  seedanceModel: string;
  seedanceEndpoint: string;
  seedanceApiKeyEnv: string;
  minimaxModel: string;
  minimaxEndpoint: string;
  minimaxApiKeyEnv: string;
  openaiVideoModel: string;
  openaiVideoEndpoint: string;
  openaiApiKeyEnv: string;
}

export interface AuditLogEntry {
  auditId: string;
  timestamp: string;
  action:
    | "rerender-shot"
    | "retry-shot"
    | "breakdown-script"
    | "sync-anchors"
    | "export-episode"
    | "reset-preset";
  targetShotId?: string;
  summary: string;
  previousVersion?: number;
  newVersion?: number;
  previousSha256?: string;
  newSha256?: string;
  untouchedShotCount?: number;
  untouchedHashesVerified?: boolean;
  providerUsed?: string;
}

export interface EpisodeExportInfo {
  episodeId: string;
  fileName: string;
  sizeBytes: number;
  sha256: string;
  durationSec: number;
  shotCount: number;
  exportedAt: string;
  shotOrder: string[];
  shotHashes: Record<string, string>;
}

export interface DramaProjectState {
  projectId: string;
  episodeId: string;
  title: string;
  subtitle: string;
  genre: string;
  visualStyle: string;
  targetDurationSec: number;
  scriptText: string;
  characters: CharacterCard[];
  locations: LocationCard[];
  shots: ShotItem[];
  providerConfig: ProviderConfig;
  auditLog: AuditLogEntry[];
  lastExport?: EpisodeExportInfo;
  updatedAt: string;
}

export const CARDBOARD_HOUSE_SCRIPT = `# 《纸箱小屋》 EP001《雨夜来客》
题材：都市治愈 / 萌宠温情 | 画风：电影感写实暖调 3D/实拍融合 | 目标时长：50 秒

【人物设定】
- 小橘（CHAR-CAT）：五个月大的中华田园橘白幼猫，琥珀色圆眼，鼻头粉红，额头有清晰的“M”字虎斑纹，下巴与四只爪尖纯白。
- 店员（CHAR-CLERK）：二十五岁左右的夜班青年店员，面容温和，身穿深绿色便利店围裙与白T恤，右胸口别着金色工牌。

【场景设定】
- 场景一（LOC-STORE-EXT）：深夜24小时便利店门口屋檐下。暴雨倾盆，潮湿柏油路倒映着室内透出的暖黄灯光与冷蓝街灯。
- 场景二（LOC-STORE-INT）：深夜24小时便利店室内靠玻璃门一侧。货架整齐，暖白吸顶灯明亮温暖，与窗外风雨隔绝。

---

### SC001 雨夜街头（时长：6s | 场景：便利店门口屋檐下）
深夜的街道下着大雨，24小时便利店门口透出温暖的黄光。一只浑身湿透的小橘猫缩在便利店玻璃门外的屋檐角落里，瑟瑟发抖，好奇又害怕地往店里张望。
音效：滂沱雨声、远处低沉雷声、微弱的小猫呼噜声。
字幕：雨下得很大，它没有地方可以去。

### SC002 发现小猫（时长：6s | 场景：便利店室内靠玻璃门一侧）
便利店里很安静，年轻的夜班店员正在擦拭货架。他不经意间转头看向玻璃门外，注意到了角落里那团湿漉漉的小小的橘色身影，停下了手里的动作，眼神变得温柔。
音效：安静的室内环境音、轻微擦拭声、窗外闷雨声。
字幕：深夜的值班总是很漫长，直到门外多了一个小小的身影。

### SC003 推门送伞（时长：6s | 场景：便利店门口屋檐下）
玻璃门轻轻推开，店员蹲下身子，没有直接触碰受惊的小猫，而是动作轻柔地把一个垫了干毛巾的空纸箱和一小碟温牛奶放在屋檐干燥处，然后微笑着退回店里。
音效：清脆的便利店迎宾叮咚声、轻轻放下纸箱与瓷碟声。
字幕：不打扰的善意，是给流浪者最好的安全感。

### SC004 试探靠近（时长：6s | 场景：便利店门口屋檐下）
小橘猫警惕地竖起耳朵，鼻子轻轻抽动闻到了牛奶的香味。它小心翼翼地迈出湿漉漉的白色小爪子，一步一步靠近纸箱，低头小口舔舐着温热的牛奶。
音效：轻柔的猫叫“喵~”、小猫细碎的舔奶声、渐弱的雨声。
字幕：温热的牛奶，一点点融化了雨夜的寒冷。

### SC005 纸箱小屋（时长：6s | 场景：便利店门口屋檐下）
喝完牛奶的小橘猫围着纸箱转了半圈，钻进铺着柔软白毛巾的纸箱里。纸箱侧面被店员用马克笔手绘了一扇小窗户，写着“小橘的家”并画了一个笑脸。
音效：毛巾摩挲声、轻柔治愈的钢琴单音渐入。
字幕：从今天起，这只小小的纸箱就是它的避风港。

### SC006 隔窗相望（时长：6s | 场景：便利店室内靠玻璃门一侧）
隔着透明的玻璃门，店员托着腮坐在收银台后温柔地看着门外；纸箱里的小橘猫把下巴搭在纸箱边缘，圆溜溜的琥珀色眼睛安静地回望着店员，一人一猫隔窗相伴。
音效：温暖舒缓的吉他与钢琴伴奏、平稳的呼吸感。
字幕：隔着一扇玻璃窗，两颗孤独的心有了陪伴。

### SC007 安然入睡（时长：7s | 场景：便利店门口屋檐下）
小橘猫在柔软的干毛巾上团成一个圆润的橘色毛球，绒毛渐渐蓬松干爽。它打了一个小小的哈欠，安心地闭上眼睛，呼吸均匀地进入梦乡。
音效：轻柔的猫呼噜声、治愈系八音盒旋律。
字幕：今夜的梦里，一定没有风雨，只有暖光。

### SC008 温暖收尾（时长：7s | 场景：便利店门口屋檐下远景）
镜头缓缓拉远，深夜的城市依然下着小雨，但24小时便利店门口的那一团暖黄色灯光格外明亮，稳稳笼罩着门口熟睡的纸箱小屋与店内的青年。
音效：温暖弦乐渐强后轻柔收尾、柔和细雨声。
字幕：《纸箱小屋》—— 每一份微小的善意，都能照亮一个雨夜。`;

export const DEFAULT_PROVIDER_CONFIG: ProviderConfig = {
  mode: "studio-ffmpeg",
  aspectRatio: "16:9",
  resolution: "720p",
  fps: 24,
  confirmBeforeGenerate: true,
  seedanceModel: "doubao-seedance-1-0-pro-250528",
  seedanceEndpoint:
    "https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks",
  seedanceApiKeyEnv: "ARK_API_KEY",
  minimaxModel: "MiniMax-Hailuo-02",
  minimaxEndpoint: "https://api.minimax.io/v2/video_generation",
  minimaxApiKeyEnv: "MINIMAX_API_KEY",
  openaiVideoModel: "sora-1.0-turbo",
  openaiVideoEndpoint: "https://api.openai.com/v1/videos/generations",
  openaiApiKeyEnv: "OPENAI_API_KEY",
};

export function createCardboardHouseCharacters(): CharacterCard[] {
  return [
    {
      characterId: "CHAR-CAT",
      name: "小橘 (Little Orange Kitten)",
      roleType: "protagonist",
      speciesOrAge: "5个月大中华田园橘白幼猫",
      summary: "流浪在雨夜街头的幼猫，从警惕怕生到在善意中安心入睡。",
      identityAnchors:
        "5-month-old ginger-and-white tabby kitten, round luminous amber eyes, pink nose tip, distinct M-shaped forehead tabby marking, snow-white chin chest and four paws, fluffy short fur",
      negativePrompt:
        "adult cat, black fur, blue eyes, collar, cartoon 2D flat style, deformed limbs, extra tails",
      voiceStyle: "轻柔幼猫奶音与安心呼噜声",
      looks: [
        {
          lookId: "LOOK-CAT-RAIN",
          name: "雨夜湿绒造型",
          description: "被雨水打湿的幼猫毛发，额头绒毛微贴，神态怯生生。",
          costumeAnchors:
            "damp Clumped ginger fur with tiny raindrops, shivering posture, wet white paws",
        },
        {
          lookId: "LOOK-CAT-BASE",
          name: "纸箱蓬松造型",
          description: "在干毛巾包裹下逐渐蓬松干爽的温暖毛色，神态放松治愈。",
          costumeAnchors:
            "soft dry fluffy ginger-and-white fur, relaxed curled posture on folded white towel",
        },
      ],
    },
    {
      characterId: "CHAR-CLERK",
      name: "林默 / 夜班店员 (Night Shift Clerk)",
      roleType: "protagonist",
      speciesOrAge: "25岁温和青年男性",
      summary: "24小时便利店夜班店员，细心温柔，用不打扰的方式守护流浪小猫。",
      identityAnchors:
        "25-year-old East Asian young man, gentle warm expression, neat short black hair, wearing dark forest-green convenience store apron over clean white crew-neck T-shirt, small brass name badge on right chest",
      negativePrompt:
        "glasses, beard, hat, formal suit, harsh expression, distorted hands, extra fingers",
      voiceStyle: "温和低沉青年男声（本集无对白，以动作传情）",
      looks: [
        {
          lookId: "LOOK-CLERK-WORK",
          name: "便利店值班工装",
          description: "深绿色便利店围裙配白T恤，干净利落，极具亲和力。",
          costumeAnchors:
            "dark forest-green apron over plain white T-shirt, brass name badge on chest, rolled-up sleeves",
        },
      ],
    },
  ];
}

export function createCardboardHouseLocations(): LocationCard[] {
  return [
    {
      locationId: "LOC-STORE-EXT",
      name: "深夜24小时便利店门口屋檐下",
      timeOfDay: "深夜 01:30",
      weather: "雨夜（冷蓝雨幕与屋檐暖黄灯光交界）",
      summary:
        "便利店玻璃门外的狭窄屋檐干燥区，放置着铺有白毛巾的“小橘的家”纸箱与牛奶碟。",
      visualAnchors:
        "24-hour convenience store entrance overhang at rainy night, sliding glass door glowing with warm 3200K golden light inside, wet dark asphalt pavement outside reflecting cyan neon and warm light, brown cardboard box with hand-drawn smiley and white towel",
      lightingMood:
        "冷暖对比强烈：室外5600K冷蓝雨夜高反差，屋檐下3200K暖黄柔光包裹",
      views: [
        {
          viewId: "VIEW-EXT-CORNER",
          direction: "屋檐墙角低机位近景",
          description:
            "平视幼猫高度，背景是湿漉漉的反光柏油路与室内透出的暖光。",
          lightingMood: "侧逆暖光勾勒小猫毛发边缘，冷色雨丝在背景虚化下落",
        },
        {
          viewId: "VIEW-EXT-WIDE",
          direction: "街道正面远景",
          description: "展现整座便利店门头暖光在深蓝雨夜城市中的孤岛感。",
          lightingMood: "大面积冷蓝夜景中嵌着一团温暖明亮的琥珀色橱窗光晕",
        },
      ],
    },
    {
      locationId: "LOC-STORE-INT",
      name: "深夜24小时便利店室内靠玻璃门一侧",
      timeOfDay: "深夜 01:30",
      weather: "室内温暖恒温（窗外雨滴滑落玻璃）",
      summary:
        "整洁明亮的便利店货架与收银台区域，透过贴有营业标识的落地玻璃门可看清门外屋檐。",
      visualAnchors:
        "clean cozy 24-hour convenience store interior at night, wooden cash counter, neatly stocked snacks shelves, transparent glass door with raindrops on exterior surface, warm inviting overhead lighting",
      lightingMood:
        "温暖治愈的3500K室内柔光，玻璃门上带有晶莹雨珠与微弱冷光反光",
      views: [
        {
          viewId: "VIEW-INT-AISLE",
          direction: "货架朝向玻璃门中景",
          description: "店员站在货架旁侧身望向玻璃门外角落。",
          lightingMood: "室内均匀暖调顶光，视线通透指向门外阴影处的小猫",
        },
        {
          viewId: "VIEW-INT-WINDOW",
          direction: "隔玻璃窗正反打特写",
          description: "透过带雨珠的玻璃门连接室内收银台与室外纸箱。",
          lightingMood: "柔和暖金室内光穿透玻璃，在纸箱边缘形成温馨光斑",
        },
      ],
    },
  ];
}

export function compileShotPromptWithAnchors(
  shot: Pick<
    ShotItem,
    | "cameraShot"
    | "cameraAngle"
    | "cameraMovement"
    | "videoPrompt"
    | "characterIds"
    | "characterLookId"
    | "locationId"
    | "locationViewId"
    | "visualGrade"
    | "motionEffect"
  >,
  characters: CharacterCard[],
  locations: LocationCard[],
): string {
  const charSegments: string[] = [];
  for (const cid of shot.characterIds) {
    const c = characters.find((item) => item.characterId === cid);
    if (!c) continue;
    const look =
      c.looks.find((l) => l.lookId === shot.characterLookId) ?? c.looks[0];
    const lookAnchor = look ? `, ${look.costumeAnchors}` : "";
    charSegments.push(`[${c.name}: ${c.identityAnchors}${lookAnchor}]`);
  }

  const loc = locations.find((item) => item.locationId === shot.locationId);
  const view =
    loc?.views.find((v) => v.viewId === shot.locationViewId) ?? loc?.views[0];
  const locSegment = loc
    ? `[Scene ${loc.name}: ${loc.visualAnchors}; Lighting: ${view?.lightingMood ?? loc.lightingMood}]`
    : "";

  const gradeTag =
    shot.visualGrade && shot.visualGrade !== "default"
      ? ` [Color Grade: ${shot.visualGrade}]`
      : "";
  const motionTag =
    shot.motionEffect && shot.motionEffect !== "default"
      ? ` [Motion Override: ${shot.motionEffect}]`
      : "";

  return [
    `[${shot.cameraShot} | ${shot.cameraAngle} | ${shot.cameraMovement}]`,
    shot.videoPrompt.trim(),
    ...charSegments,
    locSegment,
    `${gradeTag}${motionTag}`.trim(),
  ]
    .filter(Boolean)
    .join(" ");
}

export function createCardboardHouseShots(
  characters: CharacterCard[],
  locations: LocationCard[],
): ShotItem[] {
  const now = "2026-11-25T00:00:00.000Z";
  const rawShots: Omit<ShotItem, "compiledPrompt">[] = [
    {
      shotId: "SHOT-001",
      order: 1,
      sceneId: "SC001",
      title: "雨夜街头·湿冷缩角",
      durationSec: 6,
      cameraShot: "中近景 (Medium Close-Up)",
      cameraAngle: "低机位平视猫眼 (Low Eye-Level)",
      cameraMovement: "缓慢推进 (Slow Push-In)",
      characterIds: ["CHAR-CAT"],
      characterLookId: "LOOK-CAT-RAIN",
      locationId: "LOC-STORE-EXT",
      locationViewId: "VIEW-EXT-CORNER",
      startFrameDesc:
        "雨夜便利店玻璃门外角落，湿透的小橘猫蜷缩在阴影与暖光交界处瑟瑟发抖。",
      endFrameDesc:
        "镜头缓缓推进，小橘猫抬起琥珀色圆眼，怯生生地透过玻璃门往温暖的店里张望。",
      actionBeats: [
        "0-2s：大雨倾盆，雨水在屋檐外溅起水花，小橘猫缩在墙角轻轻发抖",
        "2-4s：小橘猫抖了抖湿漉漉的耳朵，转头看向发着暖黄光芒的玻璃门",
        "4-6s：琥珀色圆眼映出店内暖光，眼神充满渴望与试探",
      ],
      videoPrompt:
        "Cinematic live-action heartwarming drama shot. At a rainy night outside a 24-hour convenience store, a wet 5-month-old ginger-and-white kitten huddles in the dry corner under the overhang, shivering slightly and looking curiously through the warm glowing glass door.",
      negativePrompt:
        "sunny day, adult cat, cartoon flat shading, text watermark, blurry eyes",
      audioCue: "滂沱雨声、远处低沉雷声、微弱的小猫呼噜声",
      subtitleText: "雨下得很大，它没有地方可以去。",
      visualGrade: "default",
      motionEffect: "default",
      status: "ready",
      version: 1,
      videoFileName: "SHOT-001.mp4",
      videoSha256: "",
      videoSizeBytes: 0,
      updatedAt: now,
      lastProvider: "preset-cardboard-house",
      presetAssetFile: "SHOT-001.mp4",
    },
    {
      shotId: "SHOT-002",
      order: 2,
      sceneId: "SC002",
      title: "发现小猫·温柔回眸",
      durationSec: 6,
      cameraShot: "中景 (Medium Shot)",
      cameraAngle: "平视视角 (Eye-Level)",
      cameraMovement: "轻微横摇跟随 (Gentle Pan)",
      characterIds: ["CHAR-CLERK", "CHAR-CAT"],
      characterLookId: "LOOK-CLERK-WORK",
      locationId: "LOC-STORE-INT",
      locationViewId: "VIEW-INT-AISLE",
      startFrameDesc:
        "温暖安静的便利店室内，身穿深绿围裙的年轻店员正在货架旁整理擦拭。",
      endFrameDesc:
        "店员转头看向玻璃门外，目光落在角落里的小橘猫身上，神情变得温柔怜惜。",
      actionBeats: [
        "0-2s：店员拿着抹布安静擦拭货架，室内暖白灯光柔和",
        "2-4s：店员不经意转头望向挂着雨珠的玻璃门外下方",
        "4-6s：店员停下手中动作，微微睁大眼睛，嘴角浮现温柔笑意",
      ],
      videoPrompt:
        "Inside a warm brightly lit 24-hour convenience store at night, a gentle young male clerk in a dark green apron wipes a shelf, pauses, turns his head toward the rain-streaked glass door, and notices the tiny wet ginger kitten outside with a soft compassionate expression.",
      negativePrompt:
        "crowd of customers, daytime, harsh shadows, deformed hands",
      audioCue: "安静的室内环境音、轻微擦拭声、窗外闷雨声",
      subtitleText: "深夜的值班总是很漫长，直到门外多了一个小小的身影。",
      visualGrade: "default",
      motionEffect: "default",
      status: "ready",
      version: 1,
      videoFileName: "SHOT-002.mp4",
      videoSha256: "",
      videoSizeBytes: 0,
      updatedAt: now,
      lastProvider: "preset-cardboard-house",
      presetAssetFile: "SHOT-002.mp4",
    },
    {
      shotId: "SHOT-003",
      order: 3,
      sceneId: "SC003",
      title: "推门送暖·纸箱与牛奶",
      durationSec: 6,
      cameraShot: "中景俯拍结合平视 (Medium Low Shot)",
      cameraAngle: "微俯视角 (Slightly High Angle)",
      cameraMovement: "跟随下蹲运镜 (Tilt Down with Subject)",
      characterIds: ["CHAR-CLERK", "CHAR-CAT"],
      characterLookId: "LOOK-CLERK-WORK",
      locationId: "LOC-STORE-EXT",
      locationViewId: "VIEW-EXT-CORNER",
      startFrameDesc:
        "便利店门推开，店员捧着铺了干毛巾的纸箱和一小碟温牛奶走到屋檐下。",
      endFrameDesc:
        "店员蹲下身把纸箱和牛奶轻轻放在干燥地面，微笑着后退一步，不惊扰小猫。",
      actionBeats: [
        "0-2s：玻璃门轻轻推开，暖光倾泻而出，店员手捧纸箱与牛奶碟走出",
        "2-4s：店员蹲下身，动作缓慢轻柔地把纸箱和温牛奶放在距离小猫半米处",
        "4-6s：店员看着缩在角落的小橘猫温和一笑，轻轻退回店内",
      ],
      videoPrompt:
        "The young convenience store clerk in a dark green apron gently steps outside under the dry overhang, crouches down carefully, places a cardboard box lined with a folded white towel and a small saucer of warm milk near the wet ginger kitten, and smiles warmly before stepping back.",
      negativePrompt:
        "grabbing the cat, sudden fast movement, umbrella blocking face",
      audioCue: "清脆的便利店迎宾叮咚声、轻轻放下纸箱与瓷碟声",
      subtitleText: "不打扰的善意，是给流浪者最好的安全感。",
      visualGrade: "default",
      motionEffect: "default",
      status: "ready",
      version: 1,
      videoFileName: "SHOT-003.mp4",
      videoSha256: "",
      videoSizeBytes: 0,
      updatedAt: now,
      lastProvider: "preset-cardboard-house",
      presetAssetFile: "SHOT-003.mp4",
    },
    {
      shotId: "SHOT-004",
      order: 4,
      sceneId: "SC004",
      title: "试探靠近·温热牛奶",
      durationSec: 6,
      cameraShot: "近景特写 (Close-Up)",
      cameraAngle: "贴地猫视角 (Ground-Level)",
      cameraMovement: "轻微侧移对焦 (Subtle Dolly Track)",
      characterIds: ["CHAR-CAT"],
      characterLookId: "LOOK-CAT-RAIN",
      locationId: "LOC-STORE-EXT",
      locationViewId: "VIEW-EXT-CORNER",
      startFrameDesc:
        "小橘猫竖起耳朵，粉红鼻头轻轻抽动，闻到了温牛奶散发的热气。",
      endFrameDesc:
        "小橘猫迈出白色小爪子凑到白瓷碟前，低头小口舔舐着温热的牛奶。",
      actionBeats: [
        "0-2s：小橘猫警惕地左右看看，粉红鼻头微动嗅闻奶香",
        "2-4s：白色小爪子试探着向前迈出两步，靠近冒着微弱热气的白瓷碟",
        "4-6s：小橘猫放松下来，低头专心小口喝着温牛奶",
      ],
      videoPrompt:
        "Ground-level close-up outside the warm glowing convenience store door. The damp ginger-and-white kitten twitches its pink nose smelling the warm milk, cautiously steps forward with its white paws, and gently laps the warm milk from the white saucer under golden light.",
      negativePrompt:
        "spilling milk everywhere, multiple cats, dog, bright daylight",
      audioCue: "轻柔的猫叫“喵~”、小猫细碎的舔奶声、渐弱的雨声",
      subtitleText: "温热的牛奶，一点点融化了雨夜的寒冷。",
      visualGrade: "default",
      motionEffect: "default",
      status: "ready",
      version: 1,
      videoFileName: "SHOT-004.mp4",
      videoSha256: "",
      videoSizeBytes: 0,
      updatedAt: now,
      lastProvider: "preset-cardboard-house",
      presetAssetFile: "SHOT-004.mp4",
    },
    {
      shotId: "SHOT-005",
      order: 5,
      sceneId: "SC005",
      title: "纸箱小屋·钻入暖巢",
      durationSec: 6,
      cameraShot: "近景 (Medium Close-Up)",
      cameraAngle: "平视微侧视角 (Three-Quarter Eye-Level)",
      cameraMovement: "缓慢环绕推进 (Slow Arc Push-In)",
      characterIds: ["CHAR-CAT"],
      characterLookId: "LOOK-CAT-BASE",
      locationId: "LOC-STORE-EXT",
      locationViewId: "VIEW-EXT-CORNER",
      startFrameDesc:
        "喝完牛奶的小橘猫来到铺着柔软白毛巾的纸箱前，纸箱侧面画着笑脸与小窗。",
      endFrameDesc:
        "小橘猫轻巧地钻进纸箱里，踩了踩柔软的毛巾，满足地窝了下来。",
      actionBeats: [
        "0-2s：小橘猫舔了舔嘴角，好奇地用爪子碰了碰画着笑脸的纸箱边缘",
        "2-4s：小橘猫轻盈地迈步钻进铺着厚白毛巾的纸箱内部",
        "4-6s：小猫在柔软毛巾上踩奶转圈，舒服地伏下身子",
      ],
      videoPrompt:
        "Medium close-up of the ginger-and-white kitten stepping into the cozy brown cardboard box lined with a soft white towel under the warm convenience store doorway light. The side of the box has a cute hand-drawn marker smiley face and window.",
      negativePrompt:
        "torn dirty trash box, wet inside box, aggressive behavior",
      audioCue: "毛巾摩挲声、轻柔治愈的钢琴单音渐入",
      subtitleText: "从今天起，这只小小的纸箱就是它的避风港。",
      visualGrade: "default",
      motionEffect: "default",
      status: "ready",
      version: 1,
      videoFileName: "SHOT-005.mp4",
      videoSha256: "",
      videoSizeBytes: 0,
      updatedAt: now,
      lastProvider: "preset-cardboard-house",
      presetAssetFile: "SHOT-005.mp4",
    },
    {
      shotId: "SHOT-006",
      order: 6,
      sceneId: "SC006",
      title: "隔窗相望·无声陪伴",
      durationSec: 6,
      cameraShot: "双主体中近景 (Split Depth Medium Close-Up)",
      cameraAngle: "隔窗平视视角 (Through-Glass Eye-Level)",
      cameraMovement: "呼吸感微移焦点 (Rack Focus & Subtle Drift)",
      characterIds: ["CHAR-CLERK", "CHAR-CAT"],
      characterLookId: "LOOK-CAT-BASE",
      locationId: "LOC-STORE-INT",
      locationViewId: "VIEW-INT-WINDOW",
      startFrameDesc:
        "隔着带雨珠的透明玻璃门，店内年轻店员托腮微笑望着门外纸箱。",
      endFrameDesc:
        "纸箱里的小橘猫把白下巴搭在纸箱边缘，琥珀色圆眼安静温和地回望店员。",
      actionBeats: [
        "0-2s：店内收银台旁，店员托着腮，目光温暖地穿过玻璃窗看向门外",
        "2-4s：焦点轻柔过渡到玻璃门外的纸箱，小橘猫把下巴搭在纸箱沿上",
        "4-6s：一人一猫隔着透明玻璃门安静对视，暖光在玻璃雨珠上闪烁",
      ],
      videoPrompt:
        "Heartwarming through-the-glass shot at night. Inside the warm convenience store, the young clerk in a green apron rests his chin on his hand smiling softly; outside in the cardboard box, the ginger-and-white kitten rests its white chin on the box rim looking back with calm amber eyes.",
      negativePrompt: "broken glass, dark interior, scary atmosphere",
      audioCue: "温暖舒缓的吉他与钢琴伴奏、平稳的呼吸感",
      subtitleText: "隔着一扇玻璃窗，两颗孤独的心有了陪伴。",
      visualGrade: "default",
      motionEffect: "default",
      status: "ready",
      version: 1,
      videoFileName: "SHOT-006.mp4",
      videoSha256: "",
      videoSizeBytes: 0,
      updatedAt: now,
      lastProvider: "preset-cardboard-house",
      presetAssetFile: "SHOT-006.mp4",
    },
    {
      shotId: "SHOT-007",
      order: 7,
      sceneId: "SC007",
      title: "安然入睡·暖光入梦",
      durationSec: 7,
      cameraShot: "特写 (Close-Up)",
      cameraAngle: "微俯柔光视角 (Gentle High-Angle Close-Up)",
      cameraMovement: "极缓推近 (Ultra-Slow Push-In)",
      characterIds: ["CHAR-CAT"],
      characterLookId: "LOOK-CAT-BASE",
      locationId: "LOC-STORE-EXT",
      locationViewId: "VIEW-EXT-CORNER",
      startFrameDesc:
        "纸箱内的小橘猫绒毛已经蓬松干爽，在白毛巾上团成圆润的橘色毛球。",
      endFrameDesc:
        "小橘猫打了个小小的哈欠，安心闭上眼睛，伴随均匀呼吸进入甜美梦乡。",
      actionBeats: [
        "0-2s：暖黄灯光洒在纸箱内，小橘猫蓬松的橘白毛发泛着柔和金边",
        "2-4s：小橘猫团成圆球，张开粉红小嘴打了一个可爱的哈欠",
        "4-7s：它把小脑袋埋在白色前爪上，慢慢闭上眼睛，胸口随呼吸轻轻起伏",
      ],
      videoPrompt:
        "Warm close-up inside the cardboard box. The dry fluffy ginger-and-white kitten curls into a round ball on the soft white towel, lets out a tiny yawn, and peacefully closes its eyes to sleep under golden store light.",
      negativePrompt:
        "wide awake startled cat, cold blue light on cat, rain hitting the cat",
      audioCue: "轻柔的猫呼噜声、治愈系八音盒旋律",
      subtitleText: "今夜的梦里，一定没有风雨，只有暖光。",
      visualGrade: "default",
      motionEffect: "default",
      status: "ready",
      version: 1,
      videoFileName: "SHOT-007.mp4",
      videoSha256: "",
      videoSizeBytes: 0,
      updatedAt: now,
      lastProvider: "preset-cardboard-house",
      presetAssetFile: "SHOT-007.mp4",
    },
    {
      shotId: "SHOT-008",
      order: 8,
      sceneId: "SC008",
      title: "温暖收尾·雨夜灯塔",
      durationSec: 7,
      cameraShot: "全景拉远 (Wide Establishing Pull-Back)",
      cameraAngle: "平视偏远景 (Wide Eye-Level)",
      cameraMovement: "平稳缓慢拉远 (Smooth Pull-Back Crane)",
      characterIds: ["CHAR-CAT", "CHAR-CLERK"],
      characterLookId: "LOOK-CAT-BASE",
      locationId: "LOC-STORE-EXT",
      locationViewId: "VIEW-EXT-WIDE",
      startFrameDesc:
        "便利店门口屋檐下的纸箱小屋与店内值班的店员同处一片温暖灯光中。",
      endFrameDesc:
        "镜头缓缓拉远，深蓝雨夜街道上，24小时便利店宛如一座散发暖金光芒的孤岛灯塔。",
      actionBeats: [
        "0-2s：近处是屋檐下安睡的纸箱小猫与玻璃门内静坐的店员",
        "2-5s：摄影机平稳向街道后方拉远，潮湿路面映出明亮的琥珀色倒影",
        "5-7s：整座24小时便利店在细雨夜色中温暖发光，画面定格收尾",
      ],
      videoPrompt:
        "Cinematic wide pull-back shot at night. Starting from the sleeping kitten in the cardboard box by the glass door and the clerk inside, the camera slowly pulls back across the wet reflective street to reveal the glowing 24-hour convenience store shining like a warm golden island in the rainy blue city night.",
      negativePrompt: "daytime, heavy traffic jam, neon cyberpunk clutter",
      audioCue: "温暖弦乐渐强后轻柔收尾、柔和细雨声",
      subtitleText: "《纸箱小屋》—— 每一份微小的善意，都能照亮一个雨夜。",
      visualGrade: "default",
      motionEffect: "default",
      status: "ready",
      version: 1,
      videoFileName: "SHOT-008.mp4",
      videoSha256: "",
      videoSizeBytes: 0,
      updatedAt: now,
      lastProvider: "preset-cardboard-house",
      presetAssetFile: "SHOT-008.mp4",
    },
  ];

  return rawShots.map((shot) => ({
    ...shot,
    compiledPrompt: compileShotPromptWithAnchors(shot, characters, locations),
  }));
}

export function createCardboardHousePreset(): DramaProjectState {
  const characters = createCardboardHouseCharacters();
  const locations = createCardboardHouseLocations();
  const shots = createCardboardHouseShots(characters, locations);
  return {
    projectId: "proj-cardboard-house-ep001",
    episodeId: "EP001",
    title: "《纸箱小屋》",
    subtitle: "EP01《雨夜来客》 · 都市治愈短剧 · 16:9 HD",
    genre: "都市治愈 / 萌宠温情",
    visualStyle: "电影感暖调写实 · 冷蓝雨夜与3200K便利店暖黄灯光反差",
    targetDurationSec: 50,
    scriptText: CARDBOARD_HOUSE_SCRIPT,
    characters,
    locations,
    shots,
    providerConfig: { ...DEFAULT_PROVIDER_CONFIG },
    auditLog: [
      {
        auditId: "audit-init-001",
        timestamp: "2026-11-25T00:00:00.000Z",
        action: "reset-preset",
        summary:
          "已加载《纸箱小屋》EP001《雨夜来客》预置剧本、2张角色一致性设定卡、2张场景光影卡与8个标准分镜（SHOT-001 ~ SHOT-008）。",
      },
    ],
    updatedAt: "2026-11-25T00:00:00.000Z",
  };
}
