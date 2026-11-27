/**
 * 像素蛋糕个人版 (PixCake Personal Workbench) — 纯本地人像与旅拍精修引擎
 * 包含：
 * 1. 高低频双边质感磨皮 (Frequency-Preserving Skin Smoothing) + 祛痘祛斑 + 去黑眼圈/法令纹 + 冷白皮
 * 2. 40x50 网格局部液化形变 (2D Mesh Warping)：瘦脸、小头、削下巴、大眼、眼距、瘦鼻翼、微笑唇、拉腿长、瘦腰
 * 3. 眼神光与美妆贴合：亮眼、眼神光、美牙、口红、腮红、立体修容
 * 4. 旅拍胶片 LUT 与光影调色
 * 5. 手动推脸液化笔 (Liquify Brush) + 手动祛痘修复笔 (Spot Heal Brush) + 分屏卷帘对比
 */

const SAMPLE_PHOTOS = [
  {
    id: "sample_1",
    name: "日落旅拍特写",
    tag: "磨皮祛痘 + 瘦脸大眼",
    desc: "含面部痘印、黑眼圈与法令纹，一键体验商业级中性灰磨皮与冷白皮",
    src:
      typeof PIXCAKE_SAMPLE_DATA !== "undefined"
        ? PIXCAKE_SAMPLE_DATA.sample_1
        : "samples/sample_1.jpg",
    recommendedPreset: "pixcake_pro",
    landmarks: {
      headCenter: { x: 0.5, y: 0.34, label: "头部中心" },
      forehead: { x: 0.5, y: 0.21, label: "额头/发际线" },
      leftEye: { x: 0.455, y: 0.332, label: "左眼" },
      rightEye: { x: 0.622, y: 0.346, label: "右眼" },
      noseTip: { x: 0.55, y: 0.398, label: "鼻尖" },
      noseWingL: { x: 0.508, y: 0.402, label: "左鼻翼" },
      noseWingR: { x: 0.588, y: 0.406, label: "右鼻翼" },
      mouthCenter: { x: 0.525, y: 0.468, label: "唇部中心" },
      mouthLeft: { x: 0.452, y: 0.456, label: "左嘴角" },
      mouthRight: { x: 0.592, y: 0.472, label: "右嘴角" },
      leftCheek: { x: 0.345, y: 0.415, label: "左脸颊" },
      rightCheek: { x: 0.675, y: 0.43, label: "右脸颊" },
      chin: { x: 0.51, y: 0.538, label: "下巴尖" },
      waistLeft: { x: 0.24, y: 0.82, label: "左腰侧" },
      waistRight: { x: 0.78, y: 0.82, label: "右腰侧" },
      hipY: { x: 0.5, y: 0.72, label: "身材拉伸起点" },
    },
    blemishes: [
      { x: 0.42, y: 0.25, r: 0.013 },
      { x: 0.55, y: 0.23, r: 0.012 },
      { x: 0.39, y: 0.41, r: 0.014 },
      { x: 0.43, y: 0.45, r: 0.012 },
      { x: 0.6, y: 0.43, r: 0.013 },
      { x: 0.49, y: 0.51, r: 0.012 },
    ],
  },
  {
    id: "sample_2",
    name: "街头半身人像",
    tag: "冷白皮 + 上镜小V脸",
    desc: "自然光街拍，一键提亮冷白皮、收紧下颌线、增加清透氛围感",
    src:
      typeof PIXCAKE_SAMPLE_DATA !== "undefined"
        ? PIXCAKE_SAMPLE_DATA.sample_2
        : "samples/sample_2.jpg",
    recommendedPreset: "cold_white",
    landmarks: {
      headCenter: { x: 0.51, y: 0.5, label: "头部中心" },
      forehead: { x: 0.52, y: 0.38, label: "额头/发际线" },
      leftEye: { x: 0.45, y: 0.495, label: "左眼" },
      rightEye: { x: 0.63, y: 0.508, label: "右眼" },
      noseTip: { x: 0.555, y: 0.545, label: "鼻尖" },
      noseWingL: { x: 0.51, y: 0.558, label: "左鼻翼" },
      noseWingR: { x: 0.592, y: 0.562, label: "右鼻翼" },
      mouthCenter: { x: 0.54, y: 0.622, label: "唇部中心" },
      mouthLeft: { x: 0.476, y: 0.624, label: "左嘴角" },
      mouthRight: { x: 0.604, y: 0.632, label: "右嘴角" },
      leftCheek: { x: 0.325, y: 0.595, label: "左脸颊" },
      rightCheek: { x: 0.675, y: 0.605, label: "右脸颊" },
      chin: { x: 0.535, y: 0.702, label: "下巴尖" },
      waistLeft: { x: 0.22, y: 0.88, label: "左腰侧" },
      waistRight: { x: 0.82, y: 0.88, label: "右腰侧" },
      hipY: { x: 0.5, y: 0.82, label: "身材拉伸起点" },
    },
    blemishes: [
      { x: 0.41, y: 0.52, r: 0.013 },
      { x: 0.45, y: 0.56, r: 0.012 },
      { x: 0.52, y: 0.39, r: 0.012 },
    ],
  },
  {
    id: "sample_3",
    name: "海边全身打卡照",
    tag: "一键大长腿 + 瘦腰美体",
    desc: "经典游客全身打卡照，体验九头身小头、瘦腰收胯与无损拉腿长",
    src:
      typeof PIXCAKE_SAMPLE_DATA !== "undefined"
        ? PIXCAKE_SAMPLE_DATA.sample_3
        : "samples/sample_3.jpg",
    recommendedPreset: "long_legs",
    landmarks: {
      headCenter: { x: 0.495, y: 0.105, label: "头部中心" },
      forehead: { x: 0.498, y: 0.068, label: "额头/发际线" },
      leftEye: { x: 0.472, y: 0.095, label: "左眼" },
      rightEye: { x: 0.522, y: 0.1, label: "右眼" },
      noseTip: { x: 0.495, y: 0.11, label: "鼻尖" },
      noseWingL: { x: 0.482, y: 0.112, label: "左鼻翼" },
      noseWingR: { x: 0.508, y: 0.113, label: "右鼻翼" },
      mouthCenter: { x: 0.494, y: 0.128, label: "唇部中心" },
      mouthLeft: { x: 0.478, y: 0.128, label: "左嘴角" },
      mouthRight: { x: 0.51, y: 0.129, label: "右嘴角" },
      leftCheek: { x: 0.452, y: 0.12, label: "左脸颊" },
      rightCheek: { x: 0.54, y: 0.124, label: "右脸颊" },
      chin: { x: 0.492, y: 0.152, label: "下巴尖" },
      waistLeft: { x: 0.412, y: 0.335, label: "左腰侧" },
      waistRight: { x: 0.585, y: 0.335, label: "右腰侧" },
      hipY: { x: 0.5, y: 0.44, label: "腿部拉伸起点" },
    },
    blemishes: [],
  },
  {
    id: "sample_4",
    name: "男士质感肖像",
    tag: "去黑眼圈 + 亮眼美牙",
    desc: "保留男士皮肤毛孔质感，精准淡化黑眼圈、法令纹并美白牙齿",
    src:
      typeof PIXCAKE_SAMPLE_DATA !== "undefined"
        ? PIXCAKE_SAMPLE_DATA.sample_4
        : "samples/sample_4.jpg",
    recommendedPreset: "male_texture",
    landmarks: {
      headCenter: { x: 0.475, y: 0.36, label: "头部中心" },
      forehead: { x: 0.475, y: 0.2, label: "额头/发际线" },
      leftEye: { x: 0.372, y: 0.34, label: "左眼" },
      rightEye: { x: 0.562, y: 0.335, label: "右眼" },
      noseTip: { x: 0.472, y: 0.415, label: "鼻尖" },
      noseWingL: { x: 0.415, y: 0.422, label: "左鼻翼" },
      noseWingR: { x: 0.53, y: 0.42, label: "右鼻翼" },
      mouthCenter: { x: 0.475, y: 0.492, label: "唇部/牙齿中心" },
      mouthLeft: { x: 0.382, y: 0.478, label: "左嘴角" },
      mouthRight: { x: 0.568, y: 0.474, label: "右嘴角" },
      leftCheek: { x: 0.265, y: 0.435, label: "左脸颊" },
      rightCheek: { x: 0.665, y: 0.43, label: "右脸颊" },
      chin: { x: 0.478, y: 0.592, label: "下巴尖" },
      waistLeft: { x: 0.18, y: 0.85, label: "左肩腰" },
      waistRight: { x: 0.82, y: 0.85, label: "右肩腰" },
      hipY: { x: 0.5, y: 0.78, label: "身材拉伸起点" },
    },
    blemishes: [
      { x: 0.44, y: 0.24, r: 0.013 },
      { x: 0.58, y: 0.26, r: 0.013 },
    ],
  },
];

const DEFAULT_PARAMS = {
  // 1. 磨皮肤质 (Skin)
  blemishAuto: 0,
  skinSmooth: 0,
  skinTexture: 0,
  darkCircle: 0,
  nasolabial: 0,
  skinWhiten: 0,
  skinRosy: 0,
  // 2. 面部重塑 (Face)
  headSmall: 0,
  faceSlim: 0,
  chinSlim: 0,
  forehead: 0,
  eyeEnlarge: 0,
  eyeDistance: 0,
  noseSlim: 0,
  noseBridge: 0,
  mouthSmile: 0,
  lipPlump: 0,
  // 3. 眼神美妆 (Makeup)
  eyeBright: 0,
  teethWhiten: 0,
  lipTint: 0,
  blush: 0,
  contour: 0,
  // 4. 身材美型 (Body)
  legLength: 0,
  waistSlim: 0,
  hipSlim: 0,
  shoulderRefine: 0,
  // 5. 旅拍调色 (Color)
  lutStyle: "none",
  exposure: 0,
  contrast: 0,
  highlights: 0,
  shadows: 0,
  temp: 0,
  saturation: 0,
  clarity: 0,
  vignette: 0,
};

const PRESET_RECIPES = [
  {
    id: "pixcake_pro",
    name: "商业级质感精修（招牌）",
    detail: "中性灰祛痘磨皮 + 去黑眼圈法令纹 + 自然瘦脸大眼",
    badge: "最受欢迎",
    values: {
      blemishAuto: 100,
      skinSmooth: 72,
      skinTexture: 45,
      darkCircle: 78,
      nasolabial: 75,
      skinWhiten: 42,
      skinRosy: 25,
      headSmall: 22,
      faceSlim: 46,
      chinSlim: 32,
      eyeEnlarge: 36,
      noseSlim: 28,
      mouthSmile: 26,
      eyeBright: 62,
      teethWhiten: 45,
      lipTint: 35,
      blush: 28,
      contour: 40,
      lutStyle: "creamy",
      exposure: 8,
      contrast: 10,
      shadows: 18,
      temp: -6,
      clarity: 15,
    },
  },
  {
    id: "cold_white",
    name: "旅拍通透冷白皮",
    detail: "全身肤色提亮去黄 + 清透水光肌 + 上镜小V脸",
    badge: "旅拍热门",
    values: {
      blemishAuto: 100,
      skinSmooth: 76,
      skinTexture: 35,
      darkCircle: 68,
      nasolabial: 62,
      skinWhiten: 78,
      skinRosy: 36,
      headSmall: 30,
      faceSlim: 54,
      chinSlim: 42,
      eyeEnlarge: 40,
      noseSlim: 32,
      mouthSmile: 30,
      lipPlump: 22,
      eyeBright: 65,
      lipTint: 48,
      blush: 38,
      contour: 35,
      lutStyle: "cold_white",
      exposure: 14,
      contrast: 6,
      highlights: -10,
      shadows: 22,
      temp: -18,
      saturation: 6,
    },
  },
  {
    id: "long_legs",
    name: "黄金比例大长腿（全身打卡）",
    detail: "九头身缩头 + 漫画大长腿 + 蚂蚁腰窄胯 + 晴空通透感",
    badge: "全身神器",
    values: {
      blemishAuto: 80,
      skinSmooth: 55,
      skinWhiten: 48,
      headSmall: 48,
      faceSlim: 35,
      eyeEnlarge: 25,
      legLength: 75,
      waistSlim: 62,
      hipSlim: 45,
      shoulderRefine: 40,
      lutStyle: "kamakura",
      exposure: 10,
      contrast: 14,
      saturation: 16,
      clarity: 18,
    },
  },
  {
    id: "v_face_idol",
    name: "立体上镜精修妆",
    detail: "精致骨相微调 + 亮眼眼神光 + 元气腮红唇彩",
    badge: "特写自拍",
    values: {
      blemishAuto: 100,
      skinSmooth: 80,
      skinTexture: 40,
      darkCircle: 82,
      nasolabial: 78,
      skinWhiten: 52,
      skinRosy: 42,
      headSmall: 34,
      faceSlim: 62,
      chinSlim: 50,
      forehead: -18,
      eyeEnlarge: 52,
      eyeDistance: -12,
      noseSlim: 44,
      noseBridge: 48,
      mouthSmile: 42,
      lipPlump: 35,
      eyeBright: 80,
      teethWhiten: 60,
      lipTint: 62,
      blush: 52,
      contour: 58,
      lutStyle: "fuji_cc",
      exposure: 10,
      contrast: 12,
      temp: -8,
    },
  },
  {
    id: "male_texture",
    name: "男士质感去倦容",
    detail: "100%保留毛孔肌理 + 强力去黑眼圈法令纹 + 亮眼白牙",
    badge: "质感肖像",
    values: {
      blemishAuto: 100,
      skinSmooth: 48,
      skinTexture: 75,
      darkCircle: 88,
      nasolabial: 80,
      skinWhiten: 22,
      headSmall: 15,
      faceSlim: 26,
      chinSlim: 18,
      eyeEnlarge: 18,
      noseSlim: 20,
      eyeBright: 72,
      teethWhiten: 82,
      contour: 52,
      lutStyle: "cinema_gold",
      exposure: 6,
      contrast: 18,
      shadows: 14,
      clarity: 28,
      vignette: 18,
    },
  },
  {
    id: "natural_fresh",
    name: "原生伪素颜微调",
    detail: "轻度祛瑕保留原生骨相，看不出P图痕迹的自然提气色",
    badge: "极简自然",
    values: {
      blemishAuto: 100,
      skinSmooth: 45,
      skinTexture: 50,
      darkCircle: 50,
      nasolabial: 45,
      skinWhiten: 28,
      skinRosy: 20,
      faceSlim: 22,
      eyeEnlarge: 18,
      mouthSmile: 18,
      eyeBright: 40,
      teethWhiten: 35,
      lipTint: 24,
      lutStyle: "fuji_cc",
      exposure: 6,
      shadows: 12,
    },
  },
];

const SLIDER_SCHEMA = {
  skin: [
    {
      group: "商业级中性灰磨皮与祛瑕",
      items: [
        {
          key: "blemishAuto",
          label: "AI 祛痘祛斑",
          min: 0,
          max: 100,
          unit: "%",
        },
        {
          key: "skinSmooth",
          label: "中性灰质感磨皮",
          min: 0,
          max: 100,
          unit: "%",
        },
        {
          key: "skinTexture",
          label: "原生皮肤纹理保留",
          min: 0,
          max: 100,
          unit: "%",
        },
        {
          key: "darkCircle",
          label: "淡化黑眼圈/眼袋",
          min: 0,
          max: 100,
          unit: "%",
        },
        {
          key: "nasolabial",
          label: "平复法令纹/木偶纹",
          min: 0,
          max: 100,
          unit: "%",
        },
      ],
    },
    {
      group: "肤色通透与美白",
      items: [
        {
          key: "skinWhiten",
          label: "通透冷白皮（仅作用于皮肤）",
          min: 0,
          max: 100,
          unit: "%",
        },
        { key: "skinRosy", label: "红润好气色", min: 0, max: 100, unit: "%" },
      ],
    },
  ],
  face: [
    {
      group: "面部轮廓重塑（骨骼级液化）",
      items: [
        {
          key: "headSmall",
          label: "小头（九头身比例）",
          min: 0,
          max: 100,
          unit: "%",
        },
        {
          key: "faceSlim",
          label: "瘦脸（下颌线收紧）",
          min: 0,
          max: 100,
          unit: "%",
        },
        {
          key: "chinSlim",
          label: "V脸 / 削下巴",
          min: -50,
          max: 100,
          unit: "",
        },
        {
          key: "forehead",
          label: "发际线 / 额头高度",
          min: -60,
          max: 60,
          unit: "",
        },
      ],
    },
    {
      group: "五官精雕微调",
      items: [
        { key: "eyeEnlarge", label: "大眼", min: 0, max: 100, unit: "%" },
        { key: "eyeDistance", label: "眼距调节", min: -60, max: 60, unit: "" },
        { key: "noseSlim", label: "瘦鼻翼", min: 0, max: 100, unit: "%" },
        {
          key: "noseBridge",
          label: "高挺山根 / 鼻梁立体",
          min: 0,
          max: 100,
          unit: "%",
        },
        {
          key: "mouthSmile",
          label: "微笑嘴角上扬",
          min: 0,
          max: 100,
          unit: "%",
        },
        {
          key: "lipPlump",
          label: "丰唇 / 饱满唇形",
          min: -40,
          max: 100,
          unit: "",
        },
      ],
    },
  ],
  makeup: [
    {
      group: "五官神采增强",
      items: [
        {
          key: "eyeBright",
          label: "亮眼 + 环形眼神光",
          min: 0,
          max: 100,
          unit: "%",
        },
        {
          key: "teethWhiten",
          label: "亮白牙齿去黄",
          min: 0,
          max: 100,
          unit: "%",
        },
      ],
    },
    {
      group: "原生感贴合彩妆",
      items: [
        { key: "lipTint", label: "水光唇色增强", min: 0, max: 100, unit: "%" },
        { key: "blush", label: "苹果肌元气腮红", min: 0, max: 100, unit: "%" },
        {
          key: "contour",
          label: "面部T区高光与修容",
          min: 0,
          max: 100,
          unit: "%",
        },
      ],
    },
  ],
  body: [
    {
      group: "全身旅拍身材管理",
      items: [
        {
          key: "legLength",
          label: "一键无损拉腿长",
          min: 0,
          max: 100,
          unit: "%",
        },
        {
          key: "waistSlim",
          label: "瘦腰 / 收紧腰线",
          min: 0,
          max: 100,
          unit: "%",
        },
        {
          key: "hipSlim",
          label: "窄胯 / 臀线修饰",
          min: 0,
          max: 100,
          unit: "%",
        },
        {
          key: "shoulderRefine",
          label: "天鹅颈 / 直角肩微调",
          min: 0,
          max: 100,
          unit: "%",
        },
      ],
    },
  ],
  color: [
    {
      group: "基础光影与氛围",
      items: [
        { key: "exposure", label: "曝光度", min: -60, max: 60, unit: "" },
        { key: "contrast", label: "对比度", min: -60, max: 60, unit: "" },
        {
          key: "highlights",
          label: "高光压制/提亮",
          min: -60,
          max: 60,
          unit: "",
        },
        { key: "shadows", label: "暗部细节提亮", min: -60, max: 60, unit: "" },
        {
          key: "temp",
          label: "色温（冷蓝 ← → 暖黄）",
          min: -60,
          max: 60,
          unit: "",
        },
        { key: "saturation", label: "自然饱和度", min: -60, max: 60, unit: "" },
        { key: "clarity", label: "清晰度 / 锐化", min: 0, max: 100, unit: "%" },
        { key: "vignette", label: "氛围感暗角", min: 0, max: 100, unit: "%" },
      ],
    },
  ],
};

const LUT_STYLES = [
  { id: "none", name: "原片直出" },
  { id: "cold_white", name: "通透冷白皮" },
  { id: "creamy", name: "奶油肌胶片" },
  { id: "fuji_cc", name: "富士胶片 CC" },
  { id: "kamakura", name: "日系镰仓清透" },
  { id: "cinema_gold", name: "质感黑金肖像" },
];

// ==========================================
// Application State & Offscreen Buffers
// ==========================================
const state = {
  currentSampleId: "sample_1",
  photoTitle: "日落旅拍特写",
  activePresetId: "pixcake_pro",
  activeCategory: "skin",
  activeTool: "view", // 'view' | 'liquify' | 'spot'
  showAnchors: false,
  splitMode: true,
  splitPos: 0.48,
  holdingOriginal: false,
  brushSize: 58,
  brushStrength: 60,
  params: { ...DEFAULT_PARAMS },
  landmarks: JSON.parse(JSON.stringify(SAMPLE_PHOTOS[0].landmarks)),
  autoBlemishes: JSON.parse(JSON.stringify(SAMPLE_PHOTOS[0].blemishes)),
  manualActions: [], // { type: 'liquify', x0, y0, dx, dy, r, strength } | { type: 'spot', x, y, r }
  draggingSplit: false,
  draggingAnchorKey: null,
  draggingLiquify: false,
  lastPointer: null,
};

const mainCanvas = document.getElementById("mainCanvas");
const mainCtx = mainCanvas.getContext("2d", { willReadFrequently: true });

// Offscreen canvases for multi-stage pipeline
const rawCanvas = document.createElement("canvas");
const rawCtx = rawCanvas.getContext("2d", { willReadFrequently: true });

const blurSmallCanvas = document.createElement("canvas");
const blurSmallCtx = blurSmallCanvas.getContext("2d", {
  willReadFrequently: true,
});

const blurMedCanvas = document.createElement("canvas");
const blurMedCtx = blurMedCanvas.getContext("2d", { willReadFrequently: true });

const skinProcessedCanvas = document.createElement("canvas");
const skinProcessedCtx = skinProcessedCanvas.getContext("2d", {
  willReadFrequently: true,
});

const warpedCanvas = document.createElement("canvas");
const warpedCtx = warpedCanvas.getContext("2d", { willReadFrequently: true });

let cachedRawData = null;
let cachedBlurSmallData = null;
let cachedBlurMedData = null;
let renderPending = false;

function clamp(v, min, max) {
  return v < min ? min : v > max ? max : v;
}

function showToast(msg) {
  const container = document.getElementById("toastContainer");
  if (!container) return;
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => {
    el.remove();
  }, 3200);
}

// Automatically estimate landmarks if a custom uploaded photo is loaded
function estimateLandmarksFromImage(imgData, w, h) {
  const data = imgData.data;
  let sumX = 0,
    sumY = 0,
    count = 0;
  let minY = h,
    maxY = 0,
    minX = w,
    maxX = 0;
  const step = 4;
  for (let y = Math.floor(h * 0.06); y < Math.floor(h * 0.72); y += step) {
    for (let x = Math.floor(w * 0.15); x < Math.floor(w * 0.85); x += step) {
      const i = (y * w + x) * 4;
      const r = data[i],
        g = data[i + 1],
        b = data[i + 2];
      if (
        r > 85 &&
        g > 45 &&
        b > 30 &&
        r > g &&
        r > b &&
        r - Math.min(g, b) > 18
      ) {
        sumX += x;
        sumY += y;
        count++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  const cx = count > 80 ? sumX / count / w : 0.5;
  const cy = count > 80 ? sumY / count / h : 0.36;
  const fw = count > 80 ? clamp((maxX - minX) / w, 0.22, 0.45) : 0.32;
  const fh = count > 80 ? clamp((maxY - minY) / h, 0.24, 0.48) : 0.34;

  return {
    headCenter: { x: cx, y: cy, label: "头部中心" },
    forehead: {
      x: cx,
      y: clamp(cy - fh * 0.4, 0.05, 0.9),
      label: "额头/发际线",
    },
    leftEye: {
      x: clamp(cx - fw * 0.24, 0.1, 0.9),
      y: clamp(cy - fh * 0.08, 0.08, 0.9),
      label: "左眼",
    },
    rightEye: {
      x: clamp(cx + fw * 0.24, 0.1, 0.9),
      y: clamp(cy - fh * 0.08, 0.08, 0.9),
      label: "右眼",
    },
    noseTip: { x: cx, y: clamp(cy + fh * 0.1, 0.1, 0.9), label: "鼻尖" },
    noseWingL: {
      x: cx - fw * 0.11,
      y: clamp(cy + fh * 0.12, 0.1, 0.9),
      label: "左鼻翼",
    },
    noseWingR: {
      x: cx + fw * 0.11,
      y: clamp(cy + fh * 0.12, 0.1, 0.9),
      label: "右鼻翼",
    },
    mouthCenter: {
      x: cx,
      y: clamp(cy + fh * 0.28, 0.1, 0.9),
      label: "唇部中心",
    },
    mouthLeft: {
      x: cx - fw * 0.18,
      y: clamp(cy + fh * 0.27, 0.1, 0.9),
      label: "左嘴角",
    },
    mouthRight: {
      x: cx + fw * 0.18,
      y: clamp(cy + fh * 0.27, 0.1, 0.9),
      label: "右嘴角",
    },
    leftCheek: {
      x: clamp(cx - fw * 0.44, 0.05, 0.95),
      y: clamp(cy + fh * 0.16, 0.1, 0.9),
      label: "左脸颊",
    },
    rightCheek: {
      x: clamp(cx + fw * 0.44, 0.05, 0.95),
      y: clamp(cy + fh * 0.16, 0.1, 0.9),
      label: "右脸颊",
    },
    chin: { x: cx, y: clamp(cy + fh * 0.48, 0.1, 0.95), label: "下巴尖" },
    waistLeft: { x: clamp(cx - fw * 0.65, 0.1, 0.9), y: 0.76, label: "左腰侧" },
    waistRight: {
      x: clamp(cx + fw * 0.65, 0.1, 0.9),
      y: 0.76,
      label: "右腰侧",
    },
    hipY: { x: cx, y: 0.68, label: "身材拉伸起点" },
  };
}

// Prepare raw buffers and frequency-separation blur buffers
function prepareImageBuffers(img) {
  const maxDim = 960;
  let w = img.naturalWidth || img.width;
  let h = img.naturalHeight || img.height;
  if (Math.max(w, h) > maxDim) {
    const scale = maxDim / Math.max(w, h);
    w = Math.round(w * scale);
    h = Math.round(h * scale);
  }

  [
    mainCanvas,
    rawCanvas,
    blurSmallCanvas,
    blurMedCanvas,
    skinProcessedCanvas,
    warpedCanvas,
  ].forEach((c) => {
    c.width = w;
    c.height = h;
  });

  rawCtx.clearRect(0, 0, w, h);
  rawCtx.drawImage(img, 0, 0, w, h);
  cachedRawData = rawCtx.getImageData(0, 0, w, h);

  // Small blur for high-frequency skin pore extraction
  blurSmallCtx.filter = "blur(2.2px)";
  blurSmallCtx.drawImage(rawCanvas, 0, 0, w, h);
  blurSmallCtx.filter = "none";
  cachedBlurSmallData = blurSmallCtx.getImageData(0, 0, w, h);

  // Medium blur for low-frequency neutral-gray tone evening
  blurMedCtx.filter = "blur(8.5px)";
  blurMedCtx.drawImage(rawCanvas, 0, 0, w, h);
  blurMedCtx.filter = "none";
  cachedBlurMedData = blurMedCtx.getImageData(0, 0, w, h);

  document.getElementById("statusResolution").textContent = `${w} × ${h} px`;
}

// ==========================================
// Stage 1: Pixel-Level Skin, Makeup & Color Pipeline
// ==========================================
function runPixelPipeline() {
  if (!cachedRawData) return;
  const w = rawCanvas.width;
  const h = rawCanvas.height;
  const src = cachedRawData.data;
  const lowSmall = cachedBlurSmallData.data;
  const lowMed = cachedBlurMedData.data;

  const outImg = skinProcessedCtx.createImageData(w, h);
  const dst = outImg.data;
  dst.set(src);

  const p = state.params;
  const lm = state.landmarks;

  // 1A. Auto Blemish Healing + Manual Spot Healing
  const spotList = [];
  if (p.blemishAuto > 0 && state.autoBlemishes.length > 0) {
    const strength = p.blemishAuto / 100;
    for (const b of state.autoBlemishes) {
      spotList.push({ x: b.x * w, y: b.y * h, r: b.r * w, strength });
    }
  }
  for (const act of state.manualActions) {
    if (act.type === "spot") {
      spotList.push({
        x: act.x * w,
        y: act.y * h,
        r: act.r * w,
        strength: 1.0,
      });
    }
  }

  for (const sp of spotList) {
    const x0 = Math.max(0, Math.floor(sp.x - sp.r));
    const x1 = Math.min(w - 1, Math.ceil(sp.x + sp.r));
    const y0 = Math.max(0, Math.floor(sp.y - sp.r));
    const y1 = Math.min(h - 1, Math.ceil(sp.y + sp.r));
    const ringR = sp.r * 1.15;

    // Sample clean skin ring around the blemish
    let sr = 0,
      sg = 0,
      sb = 0,
      sc = 0;
    for (let a = 0; a < 12; a++) {
      const ang = (a / 12) * Math.PI * 2;
      const rx = clamp(Math.round(sp.x + Math.cos(ang) * ringR), 0, w - 1);
      const ry = clamp(Math.round(sp.y + Math.sin(ang) * ringR), 0, h - 1);
      const idx = (ry * w + rx) * 4;
      sr += lowSmall[idx];
      sg += lowSmall[idx + 1];
      sb += lowSmall[idx + 2];
      sc++;
    }
    sr /= sc;
    sg /= sc;
    sb /= sc;

    const r2 = sp.r * sp.r;
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const dx = x - sp.x;
        const dy = y - sp.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < r2) {
          const falloff = Math.exp(-d2 / (r2 * 0.45)) * sp.strength;
          const idx = (y * w + x) * 4;
          // Preserve subtle micro-texture from surrounding area
          const grain = (src[idx] - lowSmall[idx]) * 0.25;
          dst[idx] = dst[idx] * (1 - falloff) + (sr + grain) * falloff;
          dst[idx + 1] = dst[idx + 1] * (1 - falloff) + (sg + grain) * falloff;
          dst[idx + 2] = dst[idx + 2] * (1 - falloff) + (sb + grain) * falloff;
        }
      }
    }
  }

  // Precompute normalized landmark positions in pixels
  const lEyeX = lm.leftEye.x * w,
    lEyeY = lm.leftEye.y * h;
  const rEyeX = lm.rightEye.x * w,
    rEyeY = lm.rightEye.y * h;
  const eyeDist = Math.hypot(rEyeX - lEyeX, rEyeY - lEyeY) || w * 0.16;
  const noseX = lm.noseTip.x * w,
    noseY = lm.noseTip.y * h;
  const mouthX = lm.mouthCenter.x * w,
    mouthY = lm.mouthCenter.y * h;
  const fhx = lm.forehead.x * w,
    fhy = lm.forehead.y * h;
  const chinX = lm.chin.x * w,
    chinY = lm.chin.y * h;

  const smoothAmt = (p.skinSmooth / 100) * 0.86;
  const textureBoost = (p.skinTexture / 100) * 1.15;
  const whitenAmt = (p.skinWhiten / 100) * 0.42;
  const rosyAmt = (p.skinRosy / 100) * 0.28;
  const darkCircleAmt = (p.darkCircle / 100) * 0.65;
  const nasoAmt = (p.nasolabial / 100) * 0.68;
  const eyeBrightAmt = p.eyeBright / 100;
  const teethAmt = p.teethWhiten / 100;
  const lipAmt = (p.lipTint / 100) * 0.42;
  const blushAmt = (p.blush / 100) * 0.34;
  const contourAmt = (p.contour / 100) * 0.35;
  const noseBridgeAmt = (p.noseBridge / 100) * 0.35;

  const expFactor = Math.pow(2, p.exposure / 65);
  const contrastFactor = 1 + p.contrast / 100;
  const highAmt = p.highlights / 100;
  const shadAmt = p.shadows / 100;
  const tempAmt = p.temp * 0.38;
  const satFactor = 1 + p.saturation / 85;
  const clarityAmt = (p.clarity / 100) * 0.65;
  const vigAmt = (p.vignette / 100) * 0.55;
  const lut = p.lutStyle;

  const invW = 1 / w,
    invH = 1 / h;
  const eyeR2 = (eyeDist * 0.32) ** 2;
  const underEyeRx = eyeDist * 0.34,
    underEyeRy = eyeDist * 0.16;
  const nasoRx = eyeDist * 0.16,
    nasoRy = eyeDist * 0.26;
  const lipRx = eyeDist * 0.36,
    lipRy = eyeDist * 0.19;
  const blushRx = eyeDist * 0.38,
    blushRy = eyeDist * 0.28;

  const faceMinX = Math.max(0, Math.min(lEyeX, rEyeX, mouthX) - eyeDist * 1.15);
  const faceMaxX = Math.min(w, Math.max(lEyeX, rEyeX, mouthX) + eyeDist * 1.15);
  const faceMinY = Math.max(0, Math.min(fhy, lEyeY, rEyeY) - eyeDist * 0.75);
  const faceMaxY = Math.min(h, Math.max(chinY, mouthY) + eyeDist * 0.55);

  for (let y = 0; y < h; y++) {
    const ny = y * invH;
    const rowOff = y * w * 4;
    const inFaceY = y >= faceMinY && y <= faceMaxY;
    for (let x = 0; x < w; x++) {
      const idx = rowOff + x * 4;
      let r = dst[idx];
      let g = dst[idx + 1];
      let b = dst[idx + 2];
      const inFaceBox = inFaceY && x >= faceMinX && x <= faceMaxX;

      // Soft skin probability mask (0..1)
      const maxC = Math.max(r, g, b);
      const minC = Math.min(r, g, b);
      const chroma = maxC - minC;
      let skinWeight = 0;
      if (
        r > 60 &&
        g > 35 &&
        b > 20 &&
        r >= g * 0.95 &&
        g >= b * 0.82 &&
        chroma > 12
      ) {
        skinWeight =
          clamp((chroma - 12) / 32, 0, 1) * clamp((r - b) / 28, 0, 1);
      }

      // Exclude crisp eye/eyebrow/lip centers from heavy skin blur
      const dlEye2 = (x - lEyeX) ** 2 + (y - lEyeY) ** 2;
      const drEye2 = (x - rEyeX) ** 2 + (y - rEyeY) ** 2;
      if (dlEye2 < eyeR2 * 0.55 || drEye2 < eyeR2 * 0.55) {
        skinWeight *= 0.15;
      }

      // 1B. Frequency-Preserving Skin Smoothing (高低频中性灰磨皮)
      if (skinWeight > 0.01 && (smoothAmt > 0 || textureBoost > 0)) {
        const lsR = lowSmall[idx],
          lsG = lowSmall[idx + 1],
          lsB = lowSmall[idx + 2];
        const lmR = lowMed[idx],
          lmG = lowMed[idx + 1],
          lmB = lowMed[idx + 2];

        // Edge protection: if difference between medium blur and small blur is very high, it's a structural edge
        const edgeDiff =
          (Math.abs(lsR - lmR) + Math.abs(lsG - lmG) + Math.abs(lsB - lmB)) / 3;
        const edgeKeep = clamp(1 - edgeDiff / 38, 0.12, 1);
        const effSmooth = smoothAmt * skinWeight * edgeKeep;

        // High-frequency pore detail = original - smallBlur
        const hfR = r - lsR;
        const hfG = g - lsG;
        const hfB = b - lsB;
        const poreScale = 0.35 + textureBoost * 0.85;

        const baseR = r * (1 - effSmooth) + lmR * effSmooth;
        const baseG = g * (1 - effSmooth) + lmG * effSmooth;
        const baseB = b * (1 - effSmooth) + lmB * effSmooth;

        r = baseR + hfR * effSmooth * poreScale;
        g = baseG + hfG * effSmooth * poreScale;
        b = baseB + hfB * effSmooth * poreScale;
      }

      // 1C. Dark Circle Removal (去黑眼圈)
      if (inFaceBox && darkCircleAmt > 0) {
        const uly = lEyeY + eyeDist * 0.16;
        const ury = rEyeY + eyeDist * 0.16;
        const dL =
          ((x - lEyeX) / underEyeRx) ** 2 + ((y - uly) / underEyeRy) ** 2;
        const dR =
          ((x - rEyeX) / underEyeRx) ** 2 + ((y - ury) / underEyeRy) ** 2;
        const dMin = Math.min(dL, dR);
        if (dMin < 2.2) {
          const wMask = Math.exp(-dMin * 1.4) * darkCircleAmt;
          const lmR = lowMed[idx],
            lmG = lowMed[idx + 1],
            lmB = lowMed[idx + 2];
          r = r * (1 - wMask * 0.55) + (lmR + 18) * (wMask * 0.55);
          g = g * (1 - wMask * 0.55) + (lmG + 16) * (wMask * 0.55);
          b = b * (1 - wMask * 0.55) + (lmB + 15) * (wMask * 0.55);
        }
      }

      // 1D. Nasolabial Fold Softening (平复法令纹)
      if (inFaceBox && nasoAmt > 0) {
        const nlx = noseX - eyeDist * 0.25,
          nly = (noseY + mouthY) * 0.5;
        const nrx = noseX + eyeDist * 0.25,
          nry = (noseY + mouthY) * 0.5;
        const dL = ((x - nlx) / nasoRx) ** 2 + ((y - nly) / nasoRy) ** 2;
        const dR = ((x - nrx) / nasoRx) ** 2 + ((y - nry) / nasoRy) ** 2;
        const dMin = Math.min(dL, dR);
        if (dMin < 2.2) {
          const nMask = Math.exp(-dMin * 1.5) * nasoAmt;
          const lmR = lowMed[idx],
            lmG = lowMed[idx + 1],
            lmB = lowMed[idx + 2];
          r = r * (1 - nMask * 0.65) + (lmR + 14) * (nMask * 0.65);
          g = g * (1 - nMask * 0.65) + (lmG + 13) * (nMask * 0.65);
          b = b * (1 - nMask * 0.65) + (lmB + 13) * (nMask * 0.65);
        }
      }

      // 1E. Skin Whitening (冷白皮) & Rosy Complexion (红润气色)
      if (skinWeight > 0.02 && (whitenAmt > 0 || rosyAmt > 0)) {
        const sw = skinWeight;
        if (whitenAmt > 0) {
          // Non-linear midtone lift + cool ivory tint on skin
          const lift = whitenAmt * sw;
          r += (255 - r) * lift * 0.38;
          g += (255 - g) * lift * 0.42;
          b += (255 - b) * lift * 0.52;
        }
        if (rosyAmt > 0) {
          const rw = rosyAmt * sw;
          r += 18 * rw;
          g -= 3 * rw;
          b += 4 * rw;
        }
      }

      // 1F. Eye Brightening & Catchlight (亮眼 + 眼神光)
      if (inFaceBox && eyeBrightAmt > 0 && (dlEye2 < eyeR2 || drEye2 < eyeR2)) {
        const d2 = Math.min(dlEye2, drEye2);
        const eMask = Math.exp(-d2 / (eyeR2 * 0.45)) * eyeBrightAmt;
        // High-frequency iris crispness + sclera brightening
        const hfR = r - lowSmall[idx];
        const hfG = g - lowSmall[idx + 1];
        const hfB = b - lowSmall[idx + 2];
        r += hfR * eMask * 1.2 + 12 * eMask;
        g += hfG * eMask * 1.2 + 12 * eMask;
        b += hfB * eMask * 1.2 + 14 * eMask;

        // Subtle studio catchlight dot at top-right of pupil
        const clLx = lEyeX + eyeDist * 0.032,
          clLy = lEyeY - eyeDist * 0.028;
        const clRx = rEyeX + eyeDist * 0.032,
          clRy = rEyeY - eyeDist * 0.028;
        const cd2 = Math.min(
          (x - clLx) ** 2 + (y - clLy) ** 2,
          (x - clRx) ** 2 + (y - clRy) ** 2,
        );
        const catchR2 = (eyeDist * 0.026) ** 2;
        if (cd2 < catchR2) {
          const cBoost = Math.exp(-cd2 / (catchR2 * 0.45)) * eyeBrightAmt * 115;
          r += cBoost;
          g += cBoost;
          b += cBoost;
        }
      }

      // 1G. Lip Tint & Teeth Whitening
      if (inFaceBox && (teethAmt > 0 || lipAmt > 0)) {
        const dMouth =
          ((x - mouthX) / lipRx) ** 2 + ((y - mouthY) / lipRy) ** 2;
        if (dMouth < 1.8) {
          const mMask = Math.exp(-dMouth * 1.4);
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          const isTeeth = lum > 115 && r - g < 38 && Math.abs(g - b) < 35;
          if (teethAmt > 0 && isTeeth) {
            const tw = mMask * teethAmt;
            r += (255 - r) * tw * 0.35;
            g += (255 - g) * tw * 0.42;
            b += (255 - b) * tw * 0.55;
          } else if (lipAmt > 0 && !isTeeth) {
            const lw = mMask * lipAmt;
            r = r * (1 - lw * 0.35) + 215 * (lw * 0.35);
            g = g * (1 - lw * 0.35) + 68 * (lw * 0.35);
            b = b * (1 - lw * 0.35) + 82 * (lw * 0.35);
          }
        }
      }

      // 1H. Blush (苹果肌元气腮红)
      if (inFaceBox && blushAmt > 0) {
        const blx = lEyeX - eyeDist * 0.06,
          bly = lEyeY + eyeDist * 0.38;
        const brx = rEyeX + eyeDist * 0.06,
          bry = rEyeY + eyeDist * 0.38;
        const dbL = ((x - blx) / blushRx) ** 2 + ((y - bly) / blushRy) ** 2;
        const dbR = ((x - brx) / blushRx) ** 2 + ((y - bry) / blushRy) ** 2;
        const dbMin = Math.min(dbL, dbR);
        if (dbMin < 2.2) {
          const bMask = Math.exp(-dbMin * 1.3) * blushAmt * skinWeight;
          r += 26 * bMask;
          g -= 6 * bMask;
          b += 4 * bMask;
        }
      }

      // 1I. T-Zone Nose Bridge & Facial Contour (山根高光与立体修容)
      if (inFaceBox && (noseBridgeAmt > 0 || contourAmt > 0)) {
        const midEyeX = (lEyeX + rEyeX) * 0.5;
        const midEyeY = (lEyeY + rEyeY) * 0.5;
        // Nose bridge line segment from midEye to noseTip
        const vx = noseX - midEyeX,
          vy = noseY - midEyeY;
        const len2 = vx * vx + vy * vy || 1;
        const t = clamp(((x - midEyeX) * vx + (y - midEyeY) * vy) / len2, 0, 1);
        const px = midEyeX + t * vx,
          py = midEyeY + t * vy;
        const dBridge2 = (x - px) ** 2 + (y - py) ** 2;
        const bridgeW2 = (eyeDist * 0.085) ** 2;
        if (dBridge2 < bridgeW2 * 2.2) {
          const nbBoost =
            Math.exp(-dBridge2 / bridgeW2) *
            (noseBridgeAmt + contourAmt * 0.6) *
            26;
          r += nbBoost;
          g += nbBoost;
          b += nbBoost;
        }
        if (contourAmt > 0) {
          // Forehead & chin subtle highlight
          const dFh2 =
            ((x - fhx) ** 2 + (y - fhy) ** 2) / (eyeDist * 0.42) ** 2;
          const dCh2 =
            ((x - chinX) ** 2 + (y - (chinY - eyeDist * 0.14)) ** 2) /
            (eyeDist * 0.25) ** 2;
          if (dFh2 < 2.0) {
            const fb = Math.exp(-dFh2 * 1.2) * contourAmt * 18;
            r += fb;
            g += fb;
            b += fb;
          }
          if (dCh2 < 2.0) {
            const cb = Math.exp(-dCh2 * 1.2) * contourAmt * 16;
            r += cb;
            g += cb;
            b += cb;
          }
        }
      }

      // 1J. Color Grading, LUTs, Clarity & Vignette
      if (clarityAmt > 0) {
        r += (r - lowSmall[idx]) * clarityAmt;
        g += (g - lowSmall[idx + 1]) * clarityAmt;
        b += (b - lowSmall[idx + 2]) * clarityAmt;
      }

      // Exposure & Temperature
      r = r * expFactor + tempAmt;
      g = g * expFactor;
      b = b * expFactor - tempAmt;

      // Shadows & Highlights
      const lum = (r + g + b) * 0.3333;
      if (shadAmt !== 0) {
        const sWeight = Math.pow(1 - clamp(lum / 255, 0, 1), 1.6);
        const sDelta = shadAmt * 48 * sWeight;
        r += sDelta;
        g += sDelta;
        b += sDelta;
      }
      if (highAmt !== 0) {
        const hWeight = Math.pow(clamp(lum / 255, 0, 1), 1.6);
        const hDelta = highAmt * 42 * hWeight;
        r += hDelta;
        g += hDelta;
        b += hDelta;
      }

      // Contrast
      if (contrastFactor !== 1) {
        r = (r - 128) * contrastFactor + 128;
        g = (g - 128) * contrastFactor + 128;
        b = (b - 128) * contrastFactor + 128;
      }

      // LUT Film Styles
      if (lut === "cold_white") {
        r = r * 1.02 + 4;
        g = g * 1.03 + 5;
        b = b * 1.08 + 10;
      } else if (lut === "creamy") {
        r = r * 1.04 + 6;
        g = g * 1.02 + 4;
        b = b * 0.98 + 6;
      } else if (lut === "fuji_cc") {
        // Classic Chrome / Pro Neg feel: lifted shadows, cool-green shadows, soft highlights
        r = r * 0.98 + 6;
        g = g * 1.02 + 7;
        b = b * 1.01 + 8;
      } else if (lut === "kamakura") {
        // Airy Japanese blue/cyan sky & bright skin
        r = r * 1.01 + 5;
        g = g * 1.05 + 8;
        b = b * 1.1 + 12;
      } else if (lut === "cinema_gold") {
        const lNorm = clamp(lum / 255, 0, 1);
        r += lNorm * 12 - (1 - lNorm) * 4;
        g += lNorm * 6 - (1 - lNorm) * 2;
        b -= lNorm * 8 + (1 - lNorm) * 4;
      }

      // Saturation
      if (satFactor !== 1) {
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        r = gray + (r - gray) * satFactor;
        g = gray + (g - gray) * satFactor;
        b = gray + (b - gray) * satFactor;
      }

      // Vignette
      if (vigAmt > 0) {
        const dx = x * invW - 0.5;
        const dy = ny - 0.5;
        const dist2 = dx * dx + dy * dy;
        const vFactor = 1 - clamp((dist2 - 0.12) * 2.2, 0, 1) * vigAmt;
        r *= vFactor;
        g *= vFactor;
        b *= vFactor;
      }

      dst[idx] = clamp(r, 0, 255);
      dst[idx + 1] = clamp(g, 0, 255);
      dst[idx + 2] = clamp(b, 0, 255);
      dst[idx + 3] = 255;
    }
  }

  cachedSkinData = outImg;
  skinProcessedCtx.putImageData(outImg, 0, 0);
}

// ==========================================
// Stage 2: 2D Mesh Warping (五官重塑、身材美型、手动液化笔 — 无缝双线性位移场)
// ==========================================
let cachedSkinData = null;

function applyRadialScale(pt, center, radius, scaleAmt) {
  const dx = pt.x - center.x;
  const dy = pt.y - center.y;
  const d2 = dx * dx + dy * dy;
  const r2 = radius * radius;
  if (d2 >= r2 || d2 < 1e-6) return;
  const factor = Math.pow(1 - Math.sqrt(d2) / radius, 1.8) * scaleAmt;
  pt.x -= dx * factor;
  pt.y -= dy * factor;
}

function applyPushVector(pt, origin, vecX, vecY, radius) {
  const dx = pt.x - origin.x;
  const dy = pt.y - origin.y;
  const d2 = dx * dx + dy * dy;
  const r2 = radius * radius;
  if (d2 >= r2) return;
  const w = Math.pow(1 - d2 / r2, 1.8);
  pt.x -= vecX * w;
  pt.y -= vecY * w;
}

function runMeshWarpStage() {
  const w = rawCanvas.width;
  const h = rawCanvas.height;
  const p = state.params;
  const lm = state.landmarks;

  const hasMeshWarp =
    p.headSmall !== 0 ||
    p.faceSlim !== 0 ||
    p.chinSlim !== 0 ||
    p.forehead !== 0 ||
    p.eyeEnlarge !== 0 ||
    p.eyeDistance !== 0 ||
    p.noseSlim !== 0 ||
    p.mouthSmile !== 0 ||
    p.lipPlump !== 0 ||
    p.legLength !== 0 ||
    p.waistSlim !== 0 ||
    p.hipSlim !== 0 ||
    p.shoulderRefine !== 0 ||
    state.manualActions.some((a) => a.type === "liquify");

  if (!hasMeshWarp || !cachedSkinData) {
    warpedCtx.drawImage(skinProcessedCanvas, 0, 0);
    return;
  }

  const cols = 40;
  const rows = 52;
  const stride = cols + 1;
  const gridU = new Float32Array((rows + 1) * stride);
  const gridV = new Float32Array((rows + 1) * stride);

  // Reference distances in pixels
  const lEye = { x: lm.leftEye.x * w, y: lm.leftEye.y * h };
  const rEye = { x: lm.rightEye.x * w, y: lm.rightEye.y * h };
  const eyeSpan = Math.hypot(rEye.x - lEye.x, rEye.y - lEye.y) || w * 0.16;
  const headC = { x: lm.headCenter.x * w, y: lm.headCenter.y * h };
  const fhead = { x: lm.forehead.x * w, y: lm.forehead.y * h };
  const lCheek = { x: lm.leftCheek.x * w, y: lm.leftCheek.y * h };
  const rCheek = { x: lm.rightCheek.x * w, y: lm.rightCheek.y * h };
  const chin = { x: lm.chin.x * w, y: lm.chin.y * h };
  const noseL = { x: lm.noseWingL.x * w, y: lm.noseWingL.y * h };
  const noseR = { x: lm.noseWingR.x * w, y: lm.noseWingR.y * h };
  const noseTip = { x: lm.noseTip.x * w, y: lm.noseTip.y * h };
  const mouthC = { x: lm.mouthCenter.x * w, y: lm.mouthCenter.y * h };
  const mouthL = { x: lm.mouthLeft.x * w, y: lm.mouthLeft.y * h };
  const mouthR = { x: lm.mouthRight.x * w, y: lm.mouthRight.y * h };
  const waistL = { x: lm.waistLeft.x * w, y: lm.waistLeft.y * h };
  const waistR = { x: lm.waistRight.x * w, y: lm.waistRight.y * h };
  const hipStartY = lm.hipY.y * h;

  // Compute inverse source coordinates (u, v) for each destination grid vertex (x, y)
  for (let r = 0; r <= rows; r++) {
    const dstY = (r / rows) * h;
    for (let c = 0; c <= cols; c++) {
      const dstX = (c / cols) * w;
      const pt = { x: dstX, y: dstY };

      const isBorder = c === 0 || c === cols || r === 0 || r === rows;
      if (!isBorder) {
        // 1. 小头 (Small Head)
        if (p.headSmall > 0) {
          applyRadialScale(
            pt,
            headC,
            eyeSpan * 2.35,
            -(p.headSmall / 100) * 0.17,
          );
        }

        // 2. 瘦脸 (Slim Face)
        if (p.faceSlim > 0) {
          const slimAmt = (p.faceSlim / 100) * eyeSpan * 0.24;
          const midJawX = (lCheek.x + rCheek.x) * 0.5;
          const lDirX = midJawX - lCheek.x;
          const rDirX = midJawX - rCheek.x;
          const nLenL = Math.abs(lDirX) || 1;
          const nLenR = Math.abs(rDirX) || 1;
          applyPushVector(
            pt,
            lCheek,
            (lDirX / nLenL) * slimAmt,
            -slimAmt * 0.18,
            eyeSpan * 1.15,
          );
          applyPushVector(
            pt,
            rCheek,
            (rDirX / nLenR) * slimAmt,
            -slimAmt * 0.18,
            eyeSpan * 1.15,
          );
        }

        // 3. 削下巴 / V脸 (Chin Slim)
        if (p.chinSlim !== 0) {
          const chinAmt = (p.chinSlim / 100) * eyeSpan * 0.18;
          applyPushVector(pt, chin, 0, -chinAmt, eyeSpan * 0.92);
          const chinL = {
            x: chin.x - eyeSpan * 0.35,
            y: chin.y - eyeSpan * 0.12,
          };
          const chinR = {
            x: chin.x + eyeSpan * 0.35,
            y: chin.y - eyeSpan * 0.12,
          };
          applyPushVector(
            pt,
            chinL,
            chinAmt * 0.55,
            -chinAmt * 0.2,
            eyeSpan * 0.65,
          );
          applyPushVector(
            pt,
            chinR,
            -chinAmt * 0.55,
            -chinAmt * 0.2,
            eyeSpan * 0.65,
          );
        }

        // 4. 发际线 / 额头 (Forehead)
        if (p.forehead !== 0) {
          const fhAmt = (p.forehead / 100) * eyeSpan * 0.22;
          applyPushVector(pt, fhead, 0, fhAmt, eyeSpan * 1.1);
        }

        // 5. 大眼 (Eye Enlarge)
        if (p.eyeEnlarge > 0) {
          const eyeScale = (p.eyeEnlarge / 100) * 0.34;
          applyRadialScale(pt, lEye, eyeSpan * 0.44, eyeScale);
          applyRadialScale(pt, rEye, eyeSpan * 0.44, eyeScale);
        }

        // 6. 眼距调节 (Eye Distance)
        if (p.eyeDistance !== 0) {
          const distAmt = (p.eyeDistance / 100) * eyeSpan * 0.14;
          applyPushVector(pt, lEye, -distAmt, 0, eyeSpan * 0.42);
          applyPushVector(pt, rEye, distAmt, 0, eyeSpan * 0.42);
        }

        // 7. 瘦鼻翼 (Nose Slim)
        if (p.noseSlim > 0) {
          const nAmt = (p.noseSlim / 100) * eyeSpan * 0.12;
          applyPushVector(pt, noseL, nAmt, 0, eyeSpan * 0.34);
          applyPushVector(pt, noseR, -nAmt, 0, eyeSpan * 0.34);
          applyRadialScale(
            pt,
            noseTip,
            eyeSpan * 0.32,
            -(p.noseSlim / 100) * 0.12,
          );
        }

        // 8. 微笑嘴角 (Mouth Smile)
        if (p.mouthSmile > 0) {
          const sAmt = (p.mouthSmile / 100) * eyeSpan * 0.14;
          applyPushVector(pt, mouthL, -sAmt * 0.22, -sAmt, eyeSpan * 0.32);
          applyPushVector(pt, mouthR, sAmt * 0.22, -sAmt, eyeSpan * 0.32);
        }

        // 9. 丰唇 (Lip Plump)
        if (p.lipPlump !== 0) {
          applyRadialScale(
            pt,
            mouthC,
            eyeSpan * 0.4,
            (p.lipPlump / 100) * 0.26,
          );
        }

        // 10. 瘦腰 (Waist Slim)
        if (p.waistSlim > 0) {
          const wSpan = Math.abs(waistR.x - waistL.x) || w * 0.35;
          const wAmt = (p.waistSlim / 100) * wSpan * 0.16;
          applyPushVector(pt, waistL, wAmt, 0, wSpan * 0.65);
          applyPushVector(pt, waistR, -wAmt, 0, wSpan * 0.65);
        }

        // 11. 窄胯 / 提臀 (Hip Slim)
        if (p.hipSlim > 0) {
          const wSpan = Math.abs(waistR.x - waistL.x) || w * 0.35;
          const hipL = { x: waistL.x - wSpan * 0.08, y: hipStartY + h * 0.05 };
          const hipR = { x: waistR.x + wSpan * 0.08, y: hipStartY + h * 0.05 };
          const hAmt = (p.hipSlim / 100) * wSpan * 0.14;
          applyPushVector(pt, hipL, hAmt, -hAmt * 0.25, wSpan * 0.65);
          applyPushVector(pt, hipR, -hAmt, -hAmt * 0.25, wSpan * 0.65);
        }

        // 12. 天鹅颈 / 直角肩 (Shoulder & Neck Refine)
        if (p.shoulderRefine > 0) {
          const neckL = {
            x: chin.x - eyeSpan * 0.72,
            y: chin.y + eyeSpan * 0.52,
          };
          const neckR = {
            x: chin.x + eyeSpan * 0.72,
            y: chin.y + eyeSpan * 0.52,
          };
          const shAmt = (p.shoulderRefine / 100) * eyeSpan * 0.16;
          applyPushVector(pt, neckL, shAmt * 0.6, shAmt * 0.8, eyeSpan * 0.75);
          applyPushVector(pt, neckR, -shAmt * 0.6, shAmt * 0.8, eyeSpan * 0.75);
        }

        // 13. 一键大长腿 (Leg Lengthening below hipStartY)
        if (p.legLength > 0 && pt.y > hipStartY * 0.85) {
          const t = clamp(
            (pt.y - hipStartY * 0.85) / (h - hipStartY * 0.85),
            0,
            1,
          );
          const stretch =
            Math.sin(t * Math.PI) * (p.legLength / 100) * (h * 0.075);
          pt.y = clamp(pt.y - stretch, 0, h - 1);
        }

        // 14. 手动推脸液化笔 (Manual Liquify Strokes)
        for (const act of state.manualActions) {
          if (act.type === "liquify") {
            const origin = { x: act.x0 * w, y: act.y0 * h };
            applyPushVector(pt, origin, act.dx * w, act.dy * h, act.r * w);
          }
        }
      }

      const gIdx = r * stride + c;
      gridU[gIdx] = clamp(pt.x, 0, w - 1.001);
      gridV[gIdx] = clamp(pt.y, 0, h - 1.001);
    }
  }

  // Bilinearly sample skinProcessedData across the smooth displacement grid
  const srcPixels = cachedSkinData.data;
  const outImg = warpedCtx.createImageData(w, h);
  const dstPixels = outImg.data;
  const cellW = w / cols;
  const cellH = h / rows;
  const invCellW = 1 / cellW;
  const invCellH = 1 / cellH;

  for (let y = 0; y < h; y++) {
    const gy = y * invCellH;
    const r0 = Math.min(rows - 1, gy | 0);
    const ty = gy - r0;
    const rowBase0 = r0 * stride;
    const rowBase1 = (r0 + 1) * stride;
    const dstRowOff = y * w * 4;

    for (let x = 0; x < w; x++) {
      const gx = x * invCellW;
      const c0 = Math.min(cols - 1, gx | 0);
      const tx = gx - c0;

      const i00 = rowBase0 + c0;
      const i10 = i00 + 1;
      const i01 = rowBase1 + c0;
      const i11 = i01 + 1;

      const uTop = gridU[i00] + (gridU[i10] - gridU[i00]) * tx;
      const uBot = gridU[i01] + (gridU[i11] - gridU[i01]) * tx;
      const srcX = uTop + (uBot - uTop) * ty;

      const vTop = gridV[i00] + (gridV[i10] - gridV[i00]) * tx;
      const vBot = gridV[i01] + (gridV[i11] - gridV[i01]) * tx;
      const srcY = vTop + (vBot - vTop) * ty;

      // Bilinear pixel fetch at (srcX, srcY)
      const sx0 = srcX | 0;
      const sy0 = srcY | 0;
      const fx = srcX - sx0;
      const fy = srcY - sy0;
      const sx1 = sx0 + 1 < w ? sx0 + 1 : sx0;
      const sy1 = sy0 + 1 < h ? sy0 + 1 : sy0;

      const p00 = (sy0 * w + sx0) * 4;
      const p10 = (sy0 * w + sx1) * 4;
      const p01 = (sy1 * w + sx0) * 4;
      const p11 = (sy1 * w + sx1) * 4;

      const w00 = (1 - fx) * (1 - fy);
      const w10 = fx * (1 - fy);
      const w01 = (1 - fx) * fy;
      const w11 = fx * fy;

      const dIdx = dstRowOff + x * 4;
      dstPixels[dIdx] =
        srcPixels[p00] * w00 +
        srcPixels[p10] * w10 +
        srcPixels[p01] * w01 +
        srcPixels[p11] * w11;
      dstPixels[dIdx + 1] =
        srcPixels[p00 + 1] * w00 +
        srcPixels[p10 + 1] * w10 +
        srcPixels[p01 + 1] * w01 +
        srcPixels[p11 + 1] * w11;
      dstPixels[dIdx + 2] =
        srcPixels[p00 + 2] * w00 +
        srcPixels[p10 + 2] * w10 +
        srcPixels[p01 + 2] * w01 +
        srcPixels[p11 + 2] * w11;
      dstPixels[dIdx + 3] = 255;
    }
  }

  warpedCtx.putImageData(outImg, 0, 0);
}

// ==========================================
// Stage 3: Final Composite (Split Curtain & Landmark Overlay)
// ==========================================
function drawFinalComposite() {
  const w = mainCanvas.width;
  const h = mainCanvas.height;
  mainCtx.clearRect(0, 0, w, h);

  if (state.holdingOriginal) {
    mainCtx.drawImage(rawCanvas, 0, 0);
  } else if (state.splitMode) {
    const splitX = Math.round(clamp(state.splitPos, 0.02, 0.98) * w);
    // Right side: Retouched
    mainCtx.drawImage(warpedCanvas, 0, 0);
    // Left side: Original Raw
    mainCtx.save();
    mainCtx.beginPath();
    mainCtx.rect(0, 0, splitX, h);
    mainCtx.clip();
    mainCtx.drawImage(rawCanvas, 0, 0);
    mainCtx.restore();

    // Draw split divider line and handle
    mainCtx.save();
    mainCtx.strokeStyle = "#ffffff";
    mainCtx.lineWidth = 2;
    mainCtx.beginPath();
    mainCtx.moveTo(splitX, 0);
    mainCtx.lineTo(splitX, h);
    mainCtx.stroke();

    // Circular handle in center
    const cy = h * 0.5;
    mainCtx.fillStyle = "#111827";
    mainCtx.beginPath();
    mainCtx.arc(splitX, cy, 18, 0, Math.PI * 2);
    mainCtx.fill();
    mainCtx.strokeStyle = "#ffffff";
    mainCtx.lineWidth = 2;
    mainCtx.stroke();

    // Left/Right arrows inside handle
    mainCtx.fillStyle = "#ffffff";
    mainCtx.beginPath();
    mainCtx.moveTo(splitX - 9, cy);
    mainCtx.lineTo(splitX - 3, cy - 5);
    mainCtx.lineTo(splitX - 3, cy + 5);
    mainCtx.closePath();
    mainCtx.fill();

    mainCtx.beginPath();
    mainCtx.moveTo(splitX + 9, cy);
    mainCtx.lineTo(splitX + 3, cy - 5);
    mainCtx.lineTo(splitX + 3, cy + 5);
    mainCtx.closePath();
    mainCtx.fill();
    mainCtx.restore();
  } else {
    mainCtx.drawImage(warpedCanvas, 0, 0);
  }

  // Update split badges visibility
  const badgeL = document.getElementById("splitBadgeLeft");
  const badgeR = document.getElementById("splitBadgeRight");
  if (state.holdingOriginal) {
    badgeL.textContent = "原片 BEFORE（对比中）";
    badgeL.toggleAttribute("hidden", false);
    badgeR.toggleAttribute("hidden", true);
  } else if (state.splitMode) {
    badgeL.textContent = "原片 BEFORE";
    badgeL.toggleAttribute("hidden", false);
    badgeR.toggleAttribute("hidden", false);
  } else {
    badgeL.toggleAttribute("hidden", true);
    badgeR.toggleAttribute("hidden", false);
  }

  // Draw Facial & Body Landmark Anchors if toggled ON
  if (state.showAnchors) {
    mainCtx.save();
    const lm = state.landmarks;
    // Draw connecting symmetry lines
    mainCtx.strokeStyle = "rgba(138, 180, 248, 0.55)";
    mainCtx.lineWidth = 1.5;
    mainCtx.setLineDash([4, 4]);
    mainCtx.beginPath();
    mainCtx.moveTo(lm.leftEye.x * w, lm.leftEye.y * h);
    mainCtx.lineTo(lm.rightEye.x * w, lm.rightEye.y * h);
    mainCtx.moveTo(lm.forehead.x * w, lm.forehead.y * h);
    mainCtx.lineTo(lm.noseTip.x * w, lm.noseTip.y * h);
    mainCtx.lineTo(lm.mouthCenter.x * w, lm.mouthCenter.y * h);
    mainCtx.lineTo(lm.chin.x * w, lm.chin.y * h);
    mainCtx.moveTo(lm.leftCheek.x * w, lm.leftCheek.y * h);
    mainCtx.lineTo(lm.chin.x * w, lm.chin.y * h);
    mainCtx.lineTo(lm.rightCheek.x * w, lm.rightCheek.y * h);
    mainCtx.stroke();
    mainCtx.setLineDash([]);

    Object.entries(lm).forEach(([key, pt]) => {
      const px = pt.x * w;
      const py = pt.y * h;
      mainCtx.fillStyle =
        key === state.draggingAnchorKey ? "#f59e0b" : "#1a73e8";
      mainCtx.strokeStyle = "#ffffff";
      mainCtx.lineWidth = 2;
      mainCtx.beginPath();
      mainCtx.arc(px, py, 6, 0, Math.PI * 2);
      mainCtx.fill();
      mainCtx.stroke();

      mainCtx.font =
        "600 11px ui-sans-serif, system-ui, -apple-system, sans-serif";
      mainCtx.fillStyle = "#ffffff";
      mainCtx.shadowColor = "rgba(0,0,0,0.85)";
      mainCtx.shadowBlur = 4;
      mainCtx.fillText(pt.label, px + 9, py + 4);
    });
    mainCtx.restore();
  }
}

function scheduleFullRender() {
  if (renderPending) return;
  renderPending = true;
  requestAnimationFrame(() => {
    renderPending = false;
    const t0 = performance.now();
    runPixelPipeline();
    runMeshWarpStage();
    drawFinalComposite();
    const dt = Math.round(performance.now() - t0);
    updateStatusSummary(dt);
  });
}

function updateStatusSummary(dtMs) {
  const p = state.params;
  const activeTags = [];
  if (
    p.blemishAuto > 0 ||
    p.skinSmooth > 0 ||
    p.darkCircle > 0 ||
    p.nasolabial > 0
  )
    activeTags.push("高低频磨皮祛瑕");
  if (p.skinWhiten > 0 || p.skinRosy > 0) activeTags.push("冷白皮提亮");
  if (
    p.headSmall > 0 ||
    p.faceSlim > 0 ||
    p.chinSlim !== 0 ||
    p.eyeEnlarge > 0 ||
    p.noseSlim > 0 ||
    p.mouthSmile > 0
  )
    activeTags.push("骨骼五官重塑");
  if (p.eyeBright > 0 || p.teethWhiten > 0 || p.lipTint > 0 || p.blush > 0)
    activeTags.push("眼神光与美妆");
  if (p.legLength > 0 || p.waistSlim > 0 || p.hipSlim > 0)
    activeTags.push("全身美型长腿");
  if (p.lutStyle !== "none" || p.exposure !== 0 || p.contrast !== 0)
    activeTags.push("胶片氛围调色");
  if (state.manualActions.length > 0)
    activeTags.push(`手动画笔(${state.manualActions.length}步)`);

  document.getElementById("statusActiveSummary").textContent =
    activeTags.length > 0
      ? `已启用：${activeTags.join(" + ")}`
      : "当前为未修原片状态";
  if (typeof dtMs === "number") {
    document.getElementById("statusRenderTime").textContent =
      `本地实时渲染耗时 ${dtMs} ms · 零云端计费`;
  }
}

// ==========================================
// UI Rendering & Interactive Event Wiring
// ==========================================
function renderSampleList() {
  const container = document.getElementById("sampleListContainer");
  document.getElementById("sampleCountLabel").textContent =
    `${SAMPLE_PHOTOS.length} 张样片`;
  container.innerHTML = SAMPLE_PHOTOS.map(
    (s) => `
    <button type="button" class="sample-card ${state.currentSampleId === s.id ? "active" : ""}" data-sample-id="${s.id}">
      <div class="sample-thumb-wrap">
        <img class="sample-thumb" src="${s.src}" alt="${s.name}" loading="lazy">
        <span class="sample-tag">${s.tag}</span>
      </div>
      <div class="sample-name">${s.name}</div>
      <div class="sample-desc">${s.desc}</div>
    </button>
  `,
  ).join("");

  container.querySelectorAll(".sample-card").forEach((btn) => {
    btn.addEventListener("click", () => {
      const sId = btn.getAttribute("data-sample-id");
      loadSamplePhoto(sId, true);
    });
  });
}

function getAllPresets() {
  return [...(state.customPresets || []), ...PRESET_RECIPES];
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderPresetList() {
  const container = document.getElementById("presetListContainer");
  const allPresets = getAllPresets();
  document.getElementById("presetCountLabel").textContent =
    `${allPresets.length} 套配方`;
  container.innerHTML = allPresets
    .map((pr) => {
      const isCustom = String(pr.id).startsWith("custom_");
      return `
      <div style="display: flex; align-items: stretch; gap: 4px;">
        <button type="button" class="preset-btn ${state.activePresetId === pr.id ? "active" : ""}" data-preset-id="${escapeHtml(pr.id)}" style="flex: 1;">
          <div class="preset-info">
            <span class="preset-name">${escapeHtml(pr.name)}</span>
            <span class="preset-detail">${escapeHtml(pr.detail)}</span>
          </div>
          <span class="preset-badge">${escapeHtml(pr.badge)}</span>
        </button>
        ${isCustom ? `<button type="button" class="btn btn-icon" data-del-preset="${escapeHtml(pr.id)}" aria-label="删除自定义配方" title="删除该自定义配方" style="min-width: 30px; padding: 0 6px;">×</button>` : ""}
      </div>
    `;
    })
    .join("");

  container.querySelectorAll(".preset-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const pId = btn.getAttribute("data-preset-id");
      applyPresetById(pId);
    });
  });

  container.querySelectorAll("[data-del-preset]").forEach((btn) => {
    btn.addEventListener("click", async (evt) => {
      evt.stopPropagation();
      const delId = btn.getAttribute("data-del-preset");
      try {
        const res = await fetch(`../api/presets/${encodeURIComponent(delId)}`, {
          method: "DELETE",
        });
        if (res.ok) {
          const data = await res.json();
          state.customPresets = (data.state && data.state.customPresets) || [];
          renderPresetList();
          showToast("已删除自定义配方");
        }
      } catch {
        // ignore offline
      }
    });
  });
}

function renderSlidersPanel() {
  const container = document.getElementById("slidersContainer");
  const cat = state.activeCategory;
  const groups = SLIDER_SCHEMA[cat] || [];

  let html = "";
  if (cat === "color") {
    html += `
      <div class="slider-group">
        <div class="slider-group-header">
          <span class="slider-group-title">一键旅拍胶片滤镜 (LUT)</span>
        </div>
        <div class="lut-grid">
          ${LUT_STYLES.map(
            (l) => `
            <button type="button" class="lut-chip ${state.params.lutStyle === l.id ? "active" : ""}" data-lut="${l.id}">
              ${l.name}
            </button>
          `,
          ).join("")}
        </div>
      </div>
    `;
  }

  for (const grp of groups) {
    html += `
      <div class="slider-group">
        <div class="slider-group-header">
          <span class="slider-group-title">${grp.group}</span>
        </div>
        ${grp.items
          .map((item) => {
            const val = state.params[item.key] || 0;
            const isMod = val !== DEFAULT_PARAMS[item.key];
            return `
            <div class="slider-row">
              <div class="slider-label-row">
                <label class="slider-label" for="slider_${item.key}">${item.label}</label>
                <span class="slider-val mono ${isMod ? "modified" : ""}" data-reset-key="${item.key}" title="双击恢复默认值">
                  ${val > 0 && item.min < 0 ? "+" + val : val}${item.unit}
                </span>
              </div>
              <input
                type="range"
                id="slider_${item.key}"
                data-param-key="${item.key}"
                data-unit="${item.unit}"
                data-min="${item.min}"
                min="${item.min}"
                max="${item.max}"
                value="${val}"
              >
            </div>
          `;
          })
          .join("")}
      </div>
    `;
  }

  container.innerHTML = html;

  // Bind LUT chips
  container.querySelectorAll(".lut-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      state.params.lutStyle = chip.getAttribute("data-lut");
      state.activePresetId = null;
      renderPresetList();
      renderSlidersPanel();
      scheduleFullRender();
    });
  });

  // Bind Range Sliders
  container
    .querySelectorAll('input[type="range"][data-param-key]')
    .forEach((input) => {
      input.addEventListener("input", () => {
        const key = input.getAttribute("data-param-key");
        const unit = input.getAttribute("data-unit") || "";
        const minVal = Number(input.getAttribute("data-min"));
        const num = Number(input.value);
        state.params[key] = num;
        state.activePresetId = null;

        const labelSpan = container.querySelector(
          `.slider-val[data-reset-key="${key}"]`,
        );
        if (labelSpan) {
          labelSpan.textContent = `${num > 0 && minVal < 0 ? "+" + num : num}${unit}`;
          labelSpan.classList.toggle("modified", num !== DEFAULT_PARAMS[key]);
        }
        renderPresetList();
        scheduleFullRender();
      });

      input.addEventListener("dblclick", () => {
        const key = input.getAttribute("data-param-key");
        state.params[key] = DEFAULT_PARAMS[key];
        renderSlidersPanel();
        scheduleFullRender();
      });
    });

  // Double-click value label to reset
  container.querySelectorAll(".slider-val[data-reset-key]").forEach((span) => {
    span.addEventListener("dblclick", () => {
      const key = span.getAttribute("data-reset-key");
      state.params[key] = DEFAULT_PARAMS[key];
      renderSlidersPanel();
      scheduleFullRender();
    });
  });
}

function applyPresetById(presetId, silent = false) {
  const recipe = getAllPresets().find((r) => r.id === presetId);
  if (!recipe) return;
  state.params = { ...DEFAULT_PARAMS, ...recipe.values };
  state.activePresetId = presetId;
  renderPresetList();
  renderSlidersPanel();
  scheduleFullRender();
  if (!silent) {
    showToast(`已应用「${recipe.name}」一键精修配方`);
  }
}

function loadSamplePhoto(sampleId, autoApplyRecommended = true) {
  const sample =
    SAMPLE_PHOTOS.find((s) => s.id === sampleId) || SAMPLE_PHOTOS[0];
  state.currentSampleId = sample.id;
  state.photoTitle = sample.name;
  state.landmarks = JSON.parse(JSON.stringify(sample.landmarks));
  state.autoBlemishes = JSON.parse(JSON.stringify(sample.blemishes || []));
  state.manualActions = [];
  updateUndoButton();

  document.getElementById("statusPhotoTitle").textContent = sample.name;
  renderSampleList();

  const img = new Image();
  img.onload = () => {
    prepareImageBuffers(img);
    if (autoApplyRecommended && sample.recommendedPreset) {
      // Automatically switch to the most relevant tab for this sample (e.g., 'body' for sample_3)
      if (sample.id === "sample_3") {
        setActiveCategory("body");
      } else if (sample.id === "sample_2") {
        setActiveCategory("face");
      } else {
        setActiveCategory("skin");
      }
      applyPresetById(sample.recommendedPreset, true);
      showToast(`已载入「${sample.name}」并一键开启推荐精修对比`);
    } else {
      scheduleFullRender();
    }
  };
  img.onerror = () => {
    showToast("样片加载失败，请检查本地文件路径");
  };
  img.src = sample.src;
}

function setActiveCategory(cat) {
  state.activeCategory = cat;
  document.querySelectorAll(".cat-tab").forEach((btn) => {
    const isAct = btn.getAttribute("data-cat") === cat;
    btn.classList.toggle("active", isAct);
    btn.setAttribute("aria-selected", isAct ? "true" : "false");
  });
  renderSlidersPanel();
}

function setActiveTool(tool) {
  state.activeTool = tool;
  ["View", "Liquify", "Spot"].forEach((name) => {
    const btn = document.getElementById("toolBtn" + name);
    if (btn) {
      btn.classList.toggle(
        "btn-active",
        btn.getAttribute("data-tool") === tool,
      );
    }
  });

  const brushBar = document.getElementById("brushSettingsBar");
  const hint = document.getElementById("brushHintText");
  const strengthWrap = document.getElementById("brushStrengthWrap");
  const cursor = document.getElementById("brushCursor");

  if (tool === "liquify") {
    brushBar.toggleAttribute("hidden", false);
    strengthWrap.toggleAttribute("hidden", false);
    hint.textContent =
      "手动推脸液化笔：在脸颊、手臂或腰线边缘按住鼠标拖动即可局部塑形";
    mainCanvas.style.cursor = "crosshair";
  } else if (tool === "spot") {
    brushBar.toggleAttribute("hidden", false);
    strengthWrap.toggleAttribute("hidden", true);
    hint.textContent =
      "祛痘修复笔：直接点击画面上的痘印、痣或微小瑕疵即可无痕消除";
    mainCanvas.style.cursor = "crosshair";
  } else {
    brushBar.toggleAttribute("hidden", true);
    cursor.toggleAttribute("hidden", true);
    mainCanvas.style.cursor = "default";
  }
}

function updateUndoButton() {
  const btn = document.getElementById("btnUndoBrush");
  const badge = document.getElementById("brushCountBadge");
  badge.textContent = String(state.manualActions.length);
  btn.disabled = state.manualActions.length === 0;
}

// ==========================================
// Canvas Pointer Interaction (Split Curtain, Anchors, Liquify, Spot Heal)
// ==========================================
function getCanvasNormalizedCoords(evt) {
  const rect = mainCanvas.getBoundingClientRect();
  const x = clamp((evt.clientX - rect.left) / rect.width, 0, 1);
  const y = clamp((evt.clientY - rect.top) / rect.height, 0, 1);
  return { x, y, rect };
}

function initCanvasInteractions() {
  const cursorEl = document.getElementById("brushCursor");

  mainCanvas.addEventListener("pointerdown", (evt) => {
    const { x, y } = getCanvasNormalizedCoords(evt);

    // 1. Check if clicking a Landmark Anchor when anchors are visible
    if (state.showAnchors) {
      let closestKey = null;
      let minDist = 0.032;
      for (const [k, pt] of Object.entries(state.landmarks)) {
        const d = Math.hypot(x - pt.x, y - pt.y);
        if (d < minDist) {
          minDist = d;
          closestKey = k;
        }
      }
      if (closestKey) {
        state.draggingAnchorKey = closestKey;
        mainCanvas.setPointerCapture(evt.pointerId);
        drawFinalComposite();
        return;
      }
    }

    // 2. If in Spot Heal Brush mode: click to heal blemish immediately
    if (state.activeTool === "spot") {
      const rNorm = (state.brushSize / 900) * 0.42;
      state.manualActions.push({
        type: "spot",
        x,
        y,
        r: clamp(rNorm, 0.008, 0.05),
      });
      updateUndoButton();
      scheduleFullRender();
      showToast("已消除点选处瑕疵");
      return;
    }

    // 3. If in Liquify Push Brush mode: start push stroke
    if (state.activeTool === "liquify") {
      state.draggingLiquify = true;
      state.lastPointer = { x, y };
      mainCanvas.setPointerCapture(evt.pointerId);
      return;
    }

    // 4. In View mode (or near split line): drag split comparison curtain
    if (state.splitMode) {
      state.draggingSplit = true;
      state.splitPos = x;
      mainCanvas.setPointerCapture(evt.pointerId);
      drawFinalComposite();
    }
  });

  mainCanvas.addEventListener("pointermove", (evt) => {
    const { x, y, rect } = getCanvasNormalizedCoords(evt);

    // Update brush circle indicator
    if (state.activeTool === "liquify" || state.activeTool === "spot") {
      cursorEl.toggleAttribute("hidden", false);
      const displayScale = rect.width / (mainCanvas.width || 800);
      const sizePx =
        state.activeTool === "spot"
          ? Math.max(14, state.brushSize * 0.45 * displayScale)
          : Math.max(24, state.brushSize * 1.4 * displayScale);
      cursorEl.style.width = `${sizePx}px`;
      cursorEl.style.height = `${sizePx}px`;
      cursorEl.style.left = `${evt.clientX - rect.left}px`;
      cursorEl.style.top = `${evt.clientY - rect.top}px`;
    } else {
      cursorEl.toggleAttribute("hidden", true);
    }

    if (state.draggingAnchorKey) {
      state.landmarks[state.draggingAnchorKey].x = clamp(x, 0.03, 0.97);
      state.landmarks[state.draggingAnchorKey].y = clamp(y, 0.03, 0.97);
      scheduleFullRender();
      return;
    }

    if (state.draggingLiquify && state.lastPointer) {
      const dx = x - state.lastPointer.x;
      const dy = y - state.lastPointer.y;
      if (Math.hypot(dx, dy) > 0.003) {
        const strength = (state.brushStrength / 100) * 0.85;
        const rNorm = (state.brushSize / 600) * 0.55;
        state.manualActions.push({
          type: "liquify",
          x0: state.lastPointer.x,
          y0: state.lastPointer.y,
          dx: dx * strength,
          dy: dy * strength,
          r: clamp(rNorm, 0.03, 0.22),
        });
        state.lastPointer = { x, y };
        updateUndoButton();
        runMeshWarpStage();
        drawFinalComposite();
      }
      return;
    }

    if (state.draggingSplit && state.splitMode) {
      state.splitPos = clamp(x, 0.02, 0.98);
      drawFinalComposite();
    }
  });

  const endPointer = () => {
    state.draggingSplit = false;
    state.draggingAnchorKey = null;
    state.draggingLiquify = false;
    state.lastPointer = null;
  };
  mainCanvas.addEventListener("pointerup", endPointer);
  mainCanvas.addEventListener("pointercancel", endPointer);
  mainCanvas.addEventListener("pointerleave", () => {
    cursorEl.toggleAttribute("hidden", true);
  });
}

// ==========================================
// Theme Persistence & Global Controls
// ==========================================
function initTheme() {
  const saved = localStorage.getItem("pixcake_personal_theme");
  const isDark = saved ? saved === "dark" : true;
  document.documentElement.classList.toggle("dark", isDark);
  updateThemeIcons(isDark);

  document.getElementById("btnThemeToggle").addEventListener("click", () => {
    const nowDark = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", nowDark);
    localStorage.setItem("pixcake_personal_theme", nowDark ? "dark" : "light");
    updateThemeIcons(nowDark);
  });
}

function updateThemeIcons(isDark) {
  const sun = document.getElementById("iconSun");
  const moon = document.getElementById("iconMoon");
  if (sun && moon) {
    sun.toggleAttribute("hidden", !isDark);
    moon.toggleAttribute("hidden", isDark);
  }
}

function initGlobalControls() {
  // Category Tabs
  document.querySelectorAll(".cat-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      setActiveCategory(tab.getAttribute("data-cat"));
    });
  });

  // Tool Mode Buttons
  ["View", "Liquify", "Spot"].forEach((name) => {
    const btn = document.getElementById("toolBtn" + name);
    if (btn) {
      btn.addEventListener("click", () => {
        setActiveTool(btn.getAttribute("data-tool"));
      });
    }
  });

  // Brush Sliders
  const bSize = document.getElementById("brushSizeInput");
  const bStrength = document.getElementById("brushStrengthInput");
  bSize.addEventListener("input", () => {
    state.brushSize = Number(bSize.value);
    document.getElementById("brushSizeVal").textContent =
      `${state.brushSize}px`;
  });
  bStrength.addEventListener("input", () => {
    state.brushStrength = Number(bStrength.value);
    document.getElementById("brushStrengthVal").textContent =
      `${state.brushStrength}%`;
  });

  document.getElementById("btnClearBrushes").addEventListener("click", () => {
    state.manualActions = [];
    updateUndoButton();
    scheduleFullRender();
    showToast("已清空所有手动画笔痕迹");
  });

  document.getElementById("btnUndoBrush").addEventListener("click", () => {
    if (state.manualActions.length > 0) {
      state.manualActions.pop();
      updateUndoButton();
      scheduleFullRender();
    }
  });

  // Toggle Facial Landmark Anchors
  const btnAnchors = document.getElementById("btnToggleAnchors");
  btnAnchors.addEventListener("click", () => {
    state.showAnchors = !state.showAnchors;
    btnAnchors.classList.toggle("btn-active", state.showAnchors);
    drawFinalComposite();
    if (state.showAnchors) {
      showToast("已开启五官与身材锚点，支持直接在画布上拖动校准位置");
    }
  });

  // Toggle Split Screen
  const btnSplit = document.getElementById("btnToggleSplit");
  btnSplit.addEventListener("click", () => {
    state.splitMode = !state.splitMode;
    btnSplit.classList.toggle("btn-active", state.splitMode);
    drawFinalComposite();
  });

  // Hold to view Original
  const btnHold = document.getElementById("btnHoldOriginal");
  const startHold = () => {
    state.holdingOriginal = true;
    btnHold.classList.add("btn-active");
    drawFinalComposite();
  };
  const endHold = () => {
    if (!state.holdingOriginal) return;
    state.holdingOriginal = false;
    btnHold.classList.remove("btn-active");
    drawFinalComposite();
  };
  btnHold.addEventListener("pointerdown", startHold);
  window.addEventListener("pointerup", endHold);

  // Spacebar shortcut for Original comparison & Cmd/Ctrl+Z for Undo
  window.addEventListener("keydown", (evt) => {
    if (evt.isComposing || evt.keyCode === 229) return;
    const tag = (evt.target && evt.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA") return;

    if (evt.code === "Space" && !state.holdingOriginal) {
      evt.preventDefault();
      startHold();
    } else if ((evt.metaKey || evt.ctrlKey) && evt.key.toLowerCase() === "z") {
      if (state.manualActions.length > 0) {
        evt.preventDefault();
        state.manualActions.pop();
        updateUndoButton();
        scheduleFullRender();
      }
    }
  });
  window.addEventListener("keyup", (evt) => {
    if (evt.code === "Space") {
      endHold();
    }
  });

  // One-Click Magic Button
  document.getElementById("btnOneClickMagic").addEventListener("click", () => {
    const sample = SAMPLE_PHOTOS.find((s) => s.id === state.currentSampleId);
    const targetPreset = (sample && sample.recommendedPreset) || "pixcake_pro";
    applyPresetById(targetPreset, false);
  });

  // Reset All Button
  document.getElementById("btnResetAll").addEventListener("click", () => {
    state.params = { ...DEFAULT_PARAMS };
    state.manualActions = [];
    state.activePresetId = null;
    updateUndoButton();
    renderPresetList();
    renderSlidersPanel();
    scheduleFullRender();
    showToast("已重置全部美颜与调色参数为未修原片");
  });

  // Upload Custom Photo
  const fileInput = document.getElementById("fileUploadInput");
  fileInput.addEventListener("change", (evt) => {
    const file = evt.target.files && evt.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        state.currentSampleId = "custom";
        state.photoTitle = file.name.replace(/\.[^.]+$/, "");
        state.autoBlemishes = [];
        state.manualActions = [];
        updateUndoButton();
        document.getElementById("statusPhotoTitle").textContent =
          state.photoTitle;
        renderSampleList();

        prepareImageBuffers(img);
        state.landmarks = estimateLandmarksFromImage(
          cachedRawData,
          rawCanvas.width,
          rawCanvas.height,
        );
        applyPresetById("pixcake_pro", true);
        showToast("已导入照片并自动识别人像区域，可开启「五官锚点」微调对位");
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

  // Export High-Res Retouched Image (via workbench backend route for embedded browser compatibility)
  document
    .getElementById("btnExportImg")
    .addEventListener("click", async () => {
      const dataUrl = warpedCanvas.toDataURL("image/jpeg", 0.94);
      try {
        const res = await fetch(
          `../api/export?title=${encodeURIComponent(state.photoTitle)}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dataUrl }),
          },
        );
        if (res.ok) {
          const payload = await res.json();
          if (payload && payload.downloadUrl) {
            const link = document.createElement("a");
            link.href = payload.downloadUrl;
            link.download =
              payload.fileName || `${state.photoTitle}_像素蛋糕精修成片.jpg`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            showToast("已生成并导出高清精修成片");
            return;
          }
        }
      } catch {
        // Fallback for standalone preview
      }
      const link = document.createElement("a");
      link.download = `${state.photoTitle}_像素蛋糕精修成片.jpg`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast("已导出高清精修成片到本地");
    });

  // Full App Mode button inside PenguinHarness
  const btnFillApp = document.getElementById("btnFillApp");
  if (btnFillApp) {
    btnFillApp.addEventListener("click", () => {
      window.parent.postMessage({ type: "penguin:fill-app" }, "*");
    });
  }

  // Save Custom Preset Dialog
  const dialog = document.getElementById("savePresetDialog");
  const btnSavePreset = document.getElementById("btnSavePreset");
  const btnCloseDialog = document.getElementById("btnClosePresetDialog");
  const btnCancelDialog = document.getElementById("btnCancelPresetDialog");
  const form = document.getElementById("savePresetForm");
  const nameInput = document.getElementById("presetNameInput");
  const detailInput = document.getElementById("presetDetailInput");

  if (dialog && btnSavePreset && form) {
    let pointerDownOutside = false;
    btnSavePreset.addEventListener("click", () => {
      dialog.showModal();
      nameInput.focus();
    });

    const closeDialog = () => {
      dialog.close();
      btnSavePreset.focus();
    };
    btnCloseDialog.addEventListener("click", closeDialog);
    btnCancelDialog.addEventListener("click", closeDialog);

    dialog.addEventListener("pointerdown", (e) => {
      const r = dialog.getBoundingClientRect();
      pointerDownOutside =
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom;
    });
    dialog.addEventListener("pointerup", (e) => {
      const r = dialog.getBoundingClientRect();
      const upOutside =
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom;
      if (pointerDownOutside && upOutside) {
        closeDialog();
      }
      pointerDownOutside = false;
    });

    [nameInput, detailInput].forEach((inp) => {
      inp.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && (e.isComposing || e.keyCode === 229)) {
          e.preventDefault();
        }
      });
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = nameInput.value.trim();
      if (!name) return;
      const detail = detailInput.value.trim() || "个人自定义精修参数配方";
      try {
        const res = await fetch("../api/presets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, detail, values: state.params }),
        });
        if (res.ok) {
          const data = await res.json();
          state.customPresets = (data.state && data.state.customPresets) || [];
          state.activePresetId = data.preset
            ? data.preset.id
            : state.activePresetId;
          renderPresetList();
          nameInput.value = "";
          detailInput.value = "";
          closeDialog();
          showToast(`已保存自定义配方「${name}」`);
        }
      } catch {
        showToast("保存失败，请检查工作台服务连接");
      }
    });
  }
}

async function syncInitialWorkbenchState() {
  try {
    const res = await fetch("../api/state");
    if (res.ok) {
      const data = await res.json();
      if (data && data.state && Array.isArray(data.state.customPresets)) {
        state.customPresets = data.state.customPresets;
        renderPresetList();
      }
    }
  } catch {
    // standalone fallback
  }
}

// Boot Workbench
window.addEventListener("DOMContentLoaded", () => {
  initTheme();
  renderSampleList();
  renderPresetList();
  renderSlidersPanel();
  initCanvasInteractions();
  initGlobalControls();
  void syncInitialWorkbenchState();
  loadSamplePhoto("sample_1", true);
});
