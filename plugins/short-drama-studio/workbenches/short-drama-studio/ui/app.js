const COPY = {
  zh: {
    title: "AI 短剧工作室",
    viewStudio: "全景工作台",
    viewScript: "1. 剧本与拆解",
    viewBible: "2. 角色与场景设定",
    viewSlate: "3. 分镜场记表",
    history: "剧集项目",
    newWork: "新建创作",
    presetReset: "重置《纸箱小屋》8镜预设工程",
    dramaTitle: "剧集名称",
    dramaGenre: "短剧题材",
    ratio: "画幅比例",
    shotCount: "目标分镜数",
    prompt: "分场剧本与剧情描述",
    try: "试试这些剧本模板",
    generate: "智能拆解剧本 → 生成分镜",
    generating: "正在拆解剧本并生成分镜…",
    boardTitle: "分镜脚本与故事板",
    boardGrid: "分镜画廊",
    boardTable: "分镜场记表",
    preview: "成片与单镜监看",
    modeEpisode: "全集连播",
    modeSingle: "单镜审片",
    exportMp4: "合成 MP4",
    exportingMp4: "合成中…",
    inspectorTitle: "镜头场记参数精修",
    rerenderShot: "重绘当前镜头 (不影响其余镜)",
    rerenderingShot: "正在重绘当前镜头…",
    idle: "生成的分镜与短剧视频会出现在这里。",
    downloadShot: "下载当前分镜 MP4",
    downloadEpisode: "下载全集完整成片 MP4",
    ideas: [
      {
        label: "《纸箱小屋》· 雨夜流浪犬被收留（8镜治愈短剧）",
        title: "《纸箱小屋》EP01 · 雨夜来客",
        genre: "都市治愈",
        script: `《纸箱小屋》第一集：雨夜来客（50秒治愈短剧）
角色设定：
- 林小满（24岁插画师，米色针织开衫、圆框眼镜、低马尾，神情温柔）
- 团子（6个月奶油色金毛幼犬，湿漉漉绒毛、红色旧项圈、黑亮圆眼睛）

场景设定：
- 雨夜老街巷口（青石板路积水反光、旧纸箱、暖黄路灯与冷蓝雨幕交织）
- 小满温馨画室（原木画架、暖黄台灯、浅米色地毯、窗外雨滴）

分场剧情：
1. 【远景·雨夜巷口】倾盆大雨冲刷老街，路灯下旧纸箱湿透，幼犬团子蜷缩发抖。（字幕：雨下了一整夜，整条街都睡着了。）
2. 【特写·纸箱内】团子湿漉漉的鼻尖微动，圆眼睛怯生生望向巷口。（字幕：除了纸箱里那团发抖的小生命。）
3. 【中景·巷口】一把透明雨伞停在纸箱上方，林小满蹲下身轻声安抚。（字幕：“别怕，跟我回家吧。”）
4. 【近景·拥抱】小满用干毛巾裹住团子抱入怀中，团子安心贴着她的手心。（字幕：这是它第一次感受到手心的温度。）
5. 【全景·温馨画室】画室暖光融融，小满用吹风机吹干团子金黄蓬松的毛发。（字幕：吹干雨水，也吹散了满身寒意。）
6. 【中近景·地毯】团子捧着温热羊奶大口啜饮，小满在速写本上画下它的模样。（字幕：一碗温热的奶，成了新的开始。）
7. 【中景·画室小窝】小满把旧纸箱改造成铺满软垫的专属小窝，挂上“团子之家”木牌。（字幕：旧纸箱变成了真正的家。）
8. 【全景拉远·窗前】雨过天晴，一人一犬依偎在暖光画室，镜头推向窗外星空。（字幕：每一个漂泊的灵魂，终会遇见属于它的屋檐。）`,
      },
      {
        label: "《暴雨天台》· 双人悬疑对峙（6镜反转短剧）",
        title: "《暴雨天台》EP01 · 底片真相",
        genre: "悬疑反转",
        script: `《暴雨天台》第一集：底片真相（悬疑短剧）
角色设定：
- 沈默（30岁调查记者，深灰风衣、冷峻轮廓）
- 顾言（32岁神秘证人，黑伞、银丝眼镜）

分场剧情：
1. 【远景·雨夜天台】闪电划破城市霓虹，沈默站在天台边缘等待。
2. 【中景·天台入口】顾言撑黑伞缓步走出，递出一枚加密胶卷盒。
3. 【特写·交接】雨水顺着伞骨滑落，两人指尖触碰胶卷盒的瞬间眼神交锋。
4. 【近景·对峙】沈默翻开旧照片，质问三年前失踪案的真正幕后推手。
5. 【过肩镜头·反转】顾言摘下眼镜指向远处大厦顶层亮起的红灯。
6. 【全景拉远·天台】警笛声由远及近，两人在暴雨中各自转身隐入夜色。`,
      },
      {
        label: "《山寺夜灯》· 少年守灯人奇遇（8镜古风奇幻）",
        title: "《山寺夜灯》EP01 · 云海古钟",
        genre: "古风奇幻",
        script: `《山寺夜灯》第一集：云海古钟（古风奇幻短剧）
角色设定：
- 阿竹（16岁守灯少年，青布长衫、提竹骨纸灯笼）
- 白鹿灵（山间瑞兽，通体莹白、鹿角泛微光）

分场剧情：
1. 【远景·云海山寺】暮色笼罩千山，古寺飞檐下亮起第一盏暖黄纸灯。
2. 【中景·石阶】少年阿竹提灯踏过青苔石阶，落叶随风旋舞。
3. 【特写·古钟】铜钟上的古老铭文在灯火映照下泛起微弱金光。
4. 【近景·回眸】森林深处传来清脆鹿鸣，阿竹举灯望向迷雾。
5. 【全景·竹林】一头通体莹白的小鹿踏着流光走出竹林，雾气自动分开。
6. 【特写·触碰】白鹿轻触阿竹手中的纸灯笼，灯火化作漫天金色流萤。
7. 【中景·古殿】流萤汇聚成星图，照亮古寺尘封百年的壁画长卷。
8. 【大远景·星空山巅】山寺钟声回荡云海，少年与白鹿并肩立于山门守望苍穹。`,
      },
    ],
  },
  en: {
    title: "AI Short Drama Studio",
    viewStudio: "Studio All-in-One",
    viewScript: "1. Script & Breakdown",
    viewBible: "2. Character & Scene Bible",
    viewSlate: "3. Storyboard Slate",
    history: "Episodes",
    newWork: "New Episode",
    presetReset: "Reset Cardboard House (8-Shot Preset)",
    dramaTitle: "Episode Title",
    dramaGenre: "Genre",
    ratio: "Aspect Ratio",
    shotCount: "Target Shots",
    prompt: "Scene Script & Storyline",
    try: "Try a script template",
    generate: "Breakdown Script → Generate Storyboard",
    generating: "Breaking down script & generating shots…",
    boardTitle: "Storyboard & Shot Slate",
    boardGrid: "Shot Gallery",
    boardTable: "Production Slate",
    preview: "Episode & Shot Monitor",
    modeEpisode: "Full Episode",
    modeSingle: "Single Shot",
    exportMp4: "Merge MP4",
    exportingMp4: "Merging…",
    inspectorTitle: "Shot Slate Inspector",
    rerenderShot: "Rerender Shot (Isolated)",
    rerenderingShot: "Rerendering shot…",
    idle: "Generated storyboard shots and short drama videos will appear here.",
    downloadShot: "Download Shot MP4",
    downloadEpisode: "Download Full Episode MP4",
    ideas: [],
  },
};

const API_BASE = "../api";

let parentRoot;
try {
  if (window.parent !== window) {
    parentRoot = window.parent.document.documentElement;
  }
} catch {}

function syncTheme() {
  const dark = parentRoot
    ? parentRoot.classList.contains("dark") ||
      parentRoot.dataset.theme === "dark"
    : matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.toggleAttribute("data-dark", dark);
}
syncTheme();
if (parentRoot) {
  new MutationObserver(syncTheme).observe(parentRoot, {
    attributes: true,
    attributeFilter: ["class", "data-theme"],
  });
}

const urlLang = new URLSearchParams(window.location.search).get("lang");
const lang = urlLang === "en" ? "en" : "zh";
const t = COPY[lang] || COPY.zh;

const GRADE_LABELS = {
  default: "原片色调",
  "warm-amber": "暖琥珀金",
  "cool-rain": "冷雨夜蓝",
  "cinema-contrast": "电影高反差",
};

const MOVE_LABELS = {
  "slow-push-in": "缓慢推近",
  "gentle-pull-back": "缓慢拉远",
  "pan-right": "平稳横摇",
  "micro-handheld": "微距手持",
  static: "固定机位",
};

const $ = (id) => document.getElementById(id);

// Topbar & View Navigation
const studioEl = $("studio");
const viewTabsEl = $("view-tabs");
const jobsSelect = $("jobs");

// Left Column: Script / Characters / Locations
const leftTabsEl = $("left-tabs");
const tabBtnScript = $("tab-btn-script");
const tabBtnChars = $("tab-btn-chars");
const tabBtnLocs = $("tab-btn-locs");

const briefForm = $("brief");
const leftCharsPane = $("left-chars");
const leftLocsPane = $("left-locs");

const dramaTitleInput = $("drama-title");
const dramaGenreSelect = $("drama-genre");
const ratioSelect = $("ratio");
const countsEl = $("counts");
const promptInput = $("prompt");
const ideasEl = $("ideas");
const generateBtn = $("generate");
const errorEl = $("error");

// Character Bible Controls
const charsEmptyEl = $("chars-empty");
const charsEditorEl = $("chars-editor");
const charSelectEl = $("char-select");
const charNameInput = $("char-name");
const charSpeciesInput = $("char-species");
const charAnchorsInput = $("char-anchors");
const charCostumeInput = $("char-costume");
const charNegativeInput = $("char-negative");
const syncCharBtn = $("sync-char-btn");

// Location Bible Controls
const locsEmptyEl = $("locs-empty");
const locsEditorEl = $("locs-editor");
const locSelectEl = $("loc-select");
const locNameInput = $("loc-name");
const locWeatherInput = $("loc-weather");
const locAnchorsInput = $("loc-anchors");
const locLightingInput = $("loc-lighting");
const syncLocBtn = $("sync-loc-btn");

// Center Column: Storyboard Gallery & Production Slate Table
const shotsSummaryEl = $("shots-summary");
const isolationBadgeEl = $("isolation-badge");
const boardModesEl = $("board-modes");
const lockBarEl = $("lock-bar");
const lockChipsEl = $("lock-chips");
const openBibleBtn = $("open-bible-btn");
const boardEmptyEl = $("board-empty");
const quickLoadPresetBtn = $("quick-load-preset");
const quickFillScriptBtn = $("quick-fill-script");
const shotsGridEl = $("shots-grid");
const shotsTableWrapEl = $("shots-table-wrap");
const shotsTbodyEl = $("shots-tbody");

// Right Column: Monitor, Timeline, Downloads & Shot Inspector
const stageToolsEl = $("stage-tools");
const playModesEl = $("play-modes");
const exportBtn = $("export-btn");
const stageEl = $("stage");
const timelineBarEl = $("timeline-bar");
const timelineDurationEl = $("timeline-duration");
const timelineTrackEl = $("timeline-track");
const downloadsEl = $("downloads");
const detailEl = $("detail");

const inspectorBadgeEl = $("inspector-badge");
const inspectorAnchorsEl = $("inspector-anchors");
const inspectorFieldset = $("inspector-fieldset");
const shotTitleInput = $("shot-title");
const shotGradeSelect = $("shot-grade");
const shotSizeSelect = $("shot-size");
const shotAngleSelect = $("shot-angle");
const shotMoveSelect = $("shot-move");
const shotStartInput = $("shot-start");
const shotEndInput = $("shot-end");
const shotSubtitleInput = $("shot-subtitle");
const shotAudioInput = $("shot-audio");
const shotPromptInput = $("shot-prompt");
const viewCompiledBtn = $("view-compiled-btn");
const rerenderBtn = $("rerender-btn");

// Modal Dialog
const compiledDialog = $("compiled-dialog");
const modalCloseBtn = $("modal-close");
const compiledPromptBox = $("compiled-prompt-box");
const auditListEl = $("audit-list");

// Application State
let appState = null;
let projectLoaded = false; // false = 新建创作空白引导态; true = 激活剧集工程态
let activeView = "studio"; // "studio" | "script" | "bible" | "slate"
let activeLeftTab = "script"; // "script" | "chars" | "locs"
let activeBoardMode = "grid"; // "grid" | "table"
let selectedShotCount = 8;
let selectedShotId = "SHOT-001";
let selectedCharId = "";
let selectedLocId = "";
let playMode = "episode"; // "episode" | "single"
let episodePlayIndex = 0;
let busy = false;

// Apply static labels
document.title = t.title;
for (const node of document.querySelectorAll("[data-label]")) {
  const key = node.dataset.label;
  if (t[key]) node.textContent = t[key];
}

// Render script template buttons
const ideaList = t.ideas.length ? t.ideas : COPY.zh.ideas;
for (const idea of ideaList) {
  const b = document.createElement("button");
  b.type = "button";
  b.textContent = idea.label;
  b.addEventListener("click", () => {
    dramaTitleInput.value = idea.title;
    dramaGenreSelect.value = idea.genre;
    promptInput.value = idea.script;
    promptInput.focus();
  });
  ideasEl.appendChild(b);
}

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function apiRequest(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "content-type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errMsg =
      typeof data.error === "string"
        ? data.error
        : data.error?.message || `请求失败 (${res.status})`;
    throw new Error(errMsg);
  }
  return data;
}

function showError(message) {
  if (!message) {
    errorEl.hidden = true;
    errorEl.textContent = "";
    return;
  }
  errorEl.hidden = false;
  errorEl.textContent = message;
}

function setBusy(nextBusy, labelText) {
  busy = nextBusy;
  generateBtn.disabled = nextBusy;
  rerenderBtn.disabled = nextBusy || !projectLoaded;
  exportBtn.disabled = nextBusy || !projectLoaded;
  if (syncCharBtn) syncCharBtn.disabled = nextBusy || !projectLoaded;
  if (syncLocBtn) syncLocBtn.disabled = nextBusy || !projectLoaded;
  if (nextBusy && labelText) {
    generateBtn.textContent = labelText;
  } else {
    generateBtn.textContent = t.generate;
  }
}

function getSelectedShot() {
  if (!appState || !Array.isArray(appState.shots) || !appState.shots.length) {
    return null;
  }
  return (
    appState.shots.find((s) => s.shotId === selectedShotId) ||
    appState.shots[0] ||
    null
  );
}

// Switch Topbar View ("studio" | "script" | "bible" | "slate")
function setStudioView(view) {
  activeView = view;
  studioEl.dataset.view = view;
  for (const btn of viewTabsEl.querySelectorAll("button[data-view]")) {
    btn.classList.toggle("active", btn.dataset.view === view);
  }
  if (view === "script") {
    setLeftTab("script");
  } else if (view === "bible") {
    setLeftTab("chars");
  } else if (view === "slate") {
    setBoardMode("table");
  }
}

// Switch Left Column Subtab ("script" | "chars" | "locs")
function setLeftTab(tabName) {
  activeLeftTab = tabName;
  for (const btn of leftTabsEl.querySelectorAll("button[data-left]")) {
    btn.classList.toggle("active", btn.dataset.left === tabName);
  }
  briefForm.hidden = tabName !== "script";
  leftCharsPane.hidden = tabName !== "chars";
  leftLocsPane.hidden = tabName !== "locs";
}

// Switch Center Board Mode ("grid" | "table")
function setBoardMode(mode) {
  activeBoardMode = mode;
  for (const btn of boardModesEl.querySelectorAll("button[data-board]")) {
    btn.classList.toggle("active", btn.dataset.board === mode);
  }
  if (!projectLoaded) {
    boardEmptyEl.hidden = false;
    shotsGridEl.hidden = true;
    shotsTableWrapEl.hidden = true;
    return;
  }
  boardEmptyEl.hidden = true;
  shotsGridEl.hidden = mode !== "grid";
  shotsTableWrapEl.hidden = mode !== "table";
}

function renderJobsSelect() {
  jobsSelect.innerHTML = "";
  const newOpt = document.createElement("option");
  newOpt.value = "__new__";
  newOpt.textContent = t.newWork;
  jobsSelect.appendChild(newOpt);

  if (appState) {
    const epOpt = document.createElement("option");
    epOpt.value = appState.projectId || "EP01";
    const shotLen = (appState.shots || []).length;
    const totalSec = (appState.shots || []).reduce(
      (acc, s) => acc + (s.durationSec || 0),
      0,
    );
    epOpt.textContent = `${appState.title} · ${appState.subtitle || "第一集"} (${shotLen}镜 · ${totalSec}s)`;
    jobsSelect.appendChild(epOpt);

    const resetOpt = document.createElement("option");
    resetOpt.value = "__preset__";
    resetOpt.textContent = t.presetReset;
    jobsSelect.appendChild(resetOpt);
  }

  jobsSelect.value = projectLoaded ? appState?.projectId || "EP01" : "__new__";
}

// Render Left Character & Location Bible Editors
function renderBiblePanels() {
  const chars = appState?.characters || [];
  const locs = appState?.locations || [];

  tabBtnChars.textContent = `角色设定 (${projectLoaded ? chars.length : 0})`;
  tabBtnLocs.textContent = `场景光影 (${projectLoaded ? locs.length : 0})`;

  const roleMap = {
    protagonist: "主角",
    supporting: "配角",
    cameo: "客串",
  };

  if (!projectLoaded || !chars.length) {
    charsEmptyEl.hidden = false;
    charsEditorEl.hidden = true;
  } else {
    charsEmptyEl.hidden = true;
    charsEditorEl.hidden = false;
    if (!chars.some((c) => c.characterId === selectedCharId)) {
      selectedCharId = chars[0].characterId;
    }
    charSelectEl.innerHTML = chars
      .map(
        (c) =>
          `<option value="${escapeHtml(c.characterId)}" ${
            c.characterId === selectedCharId ? "selected" : ""
          }>${escapeHtml(c.name)} (${escapeHtml(roleMap[c.roleType] || c.role || "主角")})</option>`,
      )
      .join("");
    const activeChar =
      chars.find((c) => c.characterId === selectedCharId) || chars[0];
    charNameInput.value = activeChar.name || "";
    charSpeciesInput.value =
      activeChar.speciesOrAge || activeChar.ageOrSpecies || "";
    charAnchorsInput.value =
      activeChar.identityAnchors || activeChar.appearanceAnchors || "";
    charCostumeInput.value =
      activeChar.looks?.[0]?.costumeAnchors ||
      activeChar.costumeAnchors ||
      activeChar.summary ||
      "";
    charNegativeInput.value =
      activeChar.negativePrompt || activeChar.negativeAnchors || "";
  }

  if (!projectLoaded || !locs.length) {
    locsEmptyEl.hidden = false;
    locsEditorEl.hidden = true;
  } else {
    locsEmptyEl.hidden = true;
    locsEditorEl.hidden = false;
    if (!locs.some((l) => l.locationId === selectedLocId)) {
      selectedLocId = locs[0].locationId;
    }
    locSelectEl.innerHTML = locs
      .map(
        (l) =>
          `<option value="${escapeHtml(l.locationId)}" ${
            l.locationId === selectedLocId ? "selected" : ""
          }>${escapeHtml(l.name)}</option>`,
      )
      .join("");
    const activeLoc =
      locs.find((l) => l.locationId === selectedLocId) || locs[0];
    locNameInput.value = activeLoc.name || "";
    locWeatherInput.value =
      activeLoc.timeAndWeather ||
      [activeLoc.timeOfDay, activeLoc.weather].filter(Boolean).join(" · ") ||
      "";
    locAnchorsInput.value = activeLoc.visualAnchors || "";
    locLightingInput.value = activeLoc.lightingMood || "";
  }
}

// Render Locked Consistency Bar at Top of Center Column
function renderLockBar() {
  if (!projectLoaded || !appState) {
    lockBarEl.hidden = true;
    return;
  }
  const chars = appState.characters || [];
  const locs = appState.locations || [];
  if (!chars.length && !locs.length) {
    lockBarEl.hidden = true;
    return;
  }
  lockBarEl.hidden = false;
  lockChipsEl.innerHTML = "";

  for (const c of chars) {
    const chip = document.createElement("span");
    chip.className = "lock-chip";
    chip.title = `点击编辑角色锚点：${c.appearanceAnchors}`;
    chip.innerHTML = `<strong>角色锁</strong> ${escapeHtml(c.name)}`;
    chip.addEventListener("click", () => {
      selectedCharId = c.characterId;
      renderBiblePanels();
      setLeftTab("chars");
    });
    lockChipsEl.appendChild(chip);
  }

  for (const l of locs) {
    const chip = document.createElement("span");
    chip.className = "lock-chip";
    chip.title = `点击编辑场景光影：${l.lightingMood}`;
    chip.innerHTML = `<strong>场景锁</strong> ${escapeHtml(l.name)}`;
    chip.addEventListener("click", () => {
      selectedLocId = l.locationId;
      renderBiblePanels();
      setLeftTab("locs");
    });
    lockChipsEl.appendChild(chip);
  }
}

// Render Center Storyboard (both Gallery Grid and Production Slate Table)
function renderCenterStoryboard() {
  renderLockBar();

  if (!projectLoaded || !appState || !(appState.shots || []).length) {
    shotsSummaryEl.textContent = "新建创作 · 待拆解分镜";
    boardEmptyEl.hidden = false;
    shotsGridEl.hidden = true;
    shotsTableWrapEl.hidden = true;
    return;
  }

  const shots = appState.shots;
  const totalSec = shots.reduce((acc, s) => acc + (s.durationSec || 0), 0);
  shotsSummaryEl.textContent = `${appState.title} · 共 ${shots.length} 镜 / ${totalSec}s · 已锁定 ${appState.characters?.length || 0} 角色 ${appState.locations?.length || 0} 场景`;

  setBoardMode(activeBoardMode);

  // 1. Render Gallery Cards (#shots-grid)
  shotsGridEl.innerHTML = "";
  shots.forEach((shot, idx) => {
    const card = document.createElement("article");
    card.className = `shot-card${shot.shotId === selectedShotId ? " active" : ""}`;
    const videoSrc = `${API_BASE}/videos/${encodeURIComponent(shot.shotId)}?v=${encodeURIComponent(
      `${shot.version}-${shot.videoSha256?.slice(0, 8) || "0"}`,
    )}`;
    const gradeLabel = GRADE_LABELS[shot.visualGrade] || "原片色调";
    const moveLabel = MOVE_LABELS[shot.cameraMovement] || shot.cameraMovement;

    card.innerHTML = `
      <div class="shot-thumb">
        <video
          src="${videoSrc}"
          muted
          playsinline
          preload="metadata"
        ></video>
        <div class="shot-badge-row">
          <span class="shot-code">S${String(shot.order).padStart(2, "0")} · ${escapeHtml(shot.shotId)}</span>
          <span class="shot-ver${shot.version > 1 ? " rerendered" : ""}">${shot.durationSec}s · v${shot.version}</span>
        </div>
        <span class="shot-cam-tag">${escapeHtml(shot.cameraShot)} · ${escapeHtml(shot.cameraAngle)} · ${escapeHtml(moveLabel)}</span>
      </div>
      <div class="shot-card-title">${escapeHtml(shot.title)}</div>
      <div class="shot-kf-row">
        <div class="shot-kf-box" title="${escapeHtml(shot.startFrameDesc || "")}"><b>首帧</b>${escapeHtml(shot.startFrameDesc || "—")}</div>
        <div class="shot-kf-box" title="${escapeHtml(shot.endFrameDesc || "")}"><b>尾帧</b>${escapeHtml(shot.endFrameDesc || "—")}</div>
      </div>
      <div class="shot-sub-line">「${escapeHtml(shot.subtitleText || "")}」</div>
      <div class="shot-card-foot">
        <span class="shot-anchor-tags">${escapeHtml(gradeLabel)} · #${escapeHtml((shot.videoSha256 || "").slice(0, 6))}</span>
        <div style="display:flex;gap:4px">
          <button type="button" class="btn-xs btn-card-compiled" data-shot="${escapeHtml(shot.shotId)}">Prompt</button>
          <button type="button" class="btn-xs btn-card-rerender" data-shot="${escapeHtml(shot.shotId)}">重绘</button>
        </div>
      </div>
    `;

    const thumbVideo = card.querySelector("video");
    if (thumbVideo) {
      thumbVideo.addEventListener("loadeddata", () => {
        if (thumbVideo.currentTime === 0) {
          try {
            thumbVideo.currentTime = 0.25;
          } catch {}
        }
      });
      card.addEventListener("mouseenter", () => {
        thumbVideo.play().catch(() => {});
      });
      card.addEventListener("mouseleave", () => {
        thumbVideo.pause();
      });
    }

    card.addEventListener("click", (ev) => {
      const target = ev.target;
      if (target instanceof HTMLElement) {
        if (target.classList.contains("btn-card-compiled")) {
          ev.stopPropagation();
          selectShot(shot.shotId, idx, false);
          openCompiledModal();
          return;
        }
        if (target.classList.contains("btn-card-rerender")) {
          ev.stopPropagation();
          selectShot(shot.shotId, idx, false);
          rerenderSelectedShot();
          return;
        }
      }
      selectShot(shot.shotId, idx, true);
    });

    shotsGridEl.appendChild(card);
  });

  // 2. Render Production Slate Table (#shots-tbody)
  shotsTbodyEl.innerHTML = "";
  shots.forEach((shot, idx) => {
    const tr = document.createElement("tr");
    if (shot.shotId === selectedShotId) tr.classList.add("active");
    const videoSrc = `${API_BASE}/videos/${encodeURIComponent(shot.shotId)}?v=${encodeURIComponent(
      `${shot.version}-${shot.videoSha256?.slice(0, 8) || "0"}`,
    )}`;
    const moveLabel = MOVE_LABELS[shot.cameraMovement] || shot.cameraMovement;
    const gradeLabel = GRADE_LABELS[shot.visualGrade] || "原片色调";

    tr.innerHTML = `
      <td>
        <strong>S${String(shot.order).padStart(2, "0")}</strong>
        <div class="slate-sub">${escapeHtml(shot.shotId)}</div>
        <div class="slate-sub">${shot.durationSec}s · v${shot.version}</div>
      </td>
      <td>
        <video class="slate-mini-vid" src="${videoSrc}" muted playsinline preload="metadata"></video>
      </td>
      <td>
        <div><strong>${escapeHtml(shot.title)}</strong></div>
        <div class="slate-sub" style="margin-top:3px">
          ${escapeHtml(shot.cameraShot)} · ${escapeHtml(shot.cameraAngle)} · ${escapeHtml(moveLabel)} · ${escapeHtml(gradeLabel)}
        </div>
      </td>
      <td>
        <div><b>首帧：</b>${escapeHtml(shot.startFrameDesc || "—")}</div>
        <div style="margin-top:3px"><b>尾帧：</b>${escapeHtml(shot.endFrameDesc || "—")}</div>
      </td>
      <td>
        <div>「${escapeHtml(shot.subtitleText || "—")}」</div>
        <div class="slate-sub" style="margin-top:3px">SFX: ${escapeHtml(shot.audioCue || "—")}</div>
      </td>
      <td>
        <div class="slate-actions">
          <button type="button" class="btn-xs btn-slate-Compile" data-shot="${escapeHtml(shot.shotId)}">编译词</button>
          <button type="button" class="btn-xs btn-slate-Rerender" data-shot="${escapeHtml(shot.shotId)}">重绘</button>
        </div>
      </td>
    `;

    const v = tr.querySelector("video");
    if (v) {
      v.addEventListener("loadeddata", () => {
        try {
          v.currentTime = 0.25;
        } catch {}
      });
    }

    tr.addEventListener("click", (ev) => {
      const target = ev.target;
      if (target instanceof HTMLElement) {
        if (target.classList.contains("btn-slate-Compile")) {
          ev.stopPropagation();
          selectShot(shot.shotId, idx, false);
          openCompiledModal();
          return;
        }
        if (target.classList.contains("btn-slate-Rerender")) {
          ev.stopPropagation();
          selectShot(shot.shotId, idx, false);
          rerenderSelectedShot();
          return;
        }
      }
      selectShot(shot.shotId, idx, true);
    });

    shotsTbodyEl.appendChild(tr);
  });
}

// Render Right Column Timeline Bar
function renderTimelineBar() {
  if (!projectLoaded || !appState || !(appState.shots || []).length) {
    timelineBarEl.hidden = true;
    return;
  }
  timelineBarEl.hidden = false;
  const shots = appState.shots;
  const totalSec = shots.reduce((acc, s) => acc + (s.durationSec || 0), 0);
  timelineDurationEl.textContent = `全集 ${shots.length} 镜 · 共 ${totalSec}s`;

  timelineTrackEl.innerHTML = "";
  shots.forEach((shot, idx) => {
    const seg = document.createElement("button");
    seg.type = "button";
    seg.className = `tl-seg${shot.shotId === selectedShotId ? " active" : ""}${
      shot.version > 1 ? " rerendered" : ""
    }`;
    seg.title = `S${String(shot.order).padStart(2, "0")} ${shot.title} (${shot.durationSec}s · v${shot.version})`;
    seg.textContent = `S${String(shot.order).padStart(2, "0")}`;
    seg.addEventListener("click", () => {
      selectShot(shot.shotId, idx, true);
    });
    timelineTrackEl.appendChild(seg);
  });
}

// Render Right Column Video Player & Downloads
function renderStagePlayer(autoPlay = false) {
  if (!projectLoaded || !appState || !(appState.shots || []).length) {
    stageToolsEl.hidden = true;
    downloadsEl.innerHTML = "";
    detailEl.hidden = true;
    stageEl.innerHTML = `
      <div class="placeholder" id="placeholder">
        <div class="frame" aria-hidden="true">▧</div>
        <p id="status" role="status">${escapeHtml(t.idle)}</p>
      </div>
    `;
    return;
  }

  stageToolsEl.hidden = false;
  for (const b of playModesEl.querySelectorAll("button[data-mode]")) {
    b.classList.toggle("active", b.dataset.mode === playMode);
  }

  const shots = appState.shots;
  const activeShot =
    playMode === "episode"
      ? shots[episodePlayIndex] || getSelectedShot() || shots[0]
      : getSelectedShot() || shots[0];

  let playerWrapEl = stageEl.querySelector(".stage-player");
  let videoEl = stageEl.querySelector("video");
  let captionEl = stageEl.querySelector(".stage-caption");

  if (!videoEl || !playerWrapEl) {
    stageEl.innerHTML = "";
    playerWrapEl = document.createElement("div");
    playerWrapEl.className = "stage-player";

    videoEl = document.createElement("video");
    videoEl.controls = true;
    videoEl.playsInline = true;
    videoEl.preload = "metadata";

    captionEl = document.createElement("div");
    captionEl.className = "stage-caption";
    playerWrapEl.append(videoEl, captionEl);
    stageEl.append(playerWrapEl);

    videoEl.addEventListener("ended", () => {
      if (playMode === "episode" && appState?.shots?.length) {
        const nextIdx = (episodePlayIndex + 1) % appState.shots.length;
        episodePlayIndex = nextIdx;
        selectedShotId = appState.shots[nextIdx].shotId;
        updateActiveHighlightOnly();
        populateShotInspector();
        renderStagePlayer(true);
      }
    });
  }

  const targetSrc = `${API_BASE}/videos/${encodeURIComponent(activeShot.shotId)}?v=${encodeURIComponent(
    `${activeShot.version}-${activeShot.videoSha256?.slice(0, 8) || "0"}`,
  )}`;

  if (videoEl.getAttribute("data-src") !== targetSrc) {
    videoEl.setAttribute("data-src", targetSrc);
    videoEl.src = targetSrc;
    videoEl.loop = playMode === "single";
    videoEl.addEventListener(
      "loadeddata",
      () => {
        if (!autoPlay && videoEl.currentTime === 0) {
          try {
            videoEl.currentTime = 0.25;
          } catch {}
        }
      },
      { once: true },
    );
    if (autoPlay) {
      videoEl.play().catch(() => {});
    }
  } else {
    videoEl.loop = playMode === "single";
    if (autoPlay) {
      videoEl.play().catch(() => {});
    }
  }

  if (captionEl) {
    const modePrefix =
      playMode === "episode"
        ? `全集连播 [${episodePlayIndex + 1}/${shots.length}]`
        : `单镜审片 [${activeShot.shotId} · v${activeShot.version}]`;
    captionEl.innerHTML = `
      <span class="stage-caption-sub">「${escapeHtml(activeShot.subtitleText || "")}」</span>
      <span class="stage-caption-meta">${escapeHtml(modePrefix)} · ${escapeHtml(activeShot.title)}</span>
    `;
  }

  // Downloads bar
  downloadsEl.innerHTML = "";
  const shotDl = document.createElement("a");
  shotDl.className = "download";
  shotDl.href = `${API_BASE}/videos/${encodeURIComponent(activeShot.shotId)}?download=1`;
  shotDl.download = `${activeShot.shotId}-v${activeShot.version}.mp4`;
  shotDl.textContent = `${t.downloadShot} (${activeShot.shotId} · v${activeShot.version})`;
  downloadsEl.appendChild(shotDl);

  if (appState.mergedEpisodeFileName) {
    const epDl = document.createElement("a");
    epDl.className = "download";
    epDl.href = `${API_BASE}/exports/episode.mp4?download=1&v=${encodeURIComponent(
      appState.mergedEpisodeSha256?.slice(0, 8) || "1",
    )}`;
    epDl.download = `${appState.projectId || "episode"}-complete.mp4`;
    epDl.textContent = `${t.downloadEpisode} (${appState.targetDurationSec || 50}s)`;
    downloadsEl.appendChild(epDl);
  }

  detailEl.hidden = false;
  detailEl.textContent = `${appState.title} · 当前镜头 ${activeShot.shotId} (${activeShot.cameraShot}/${activeShot.cameraAngle}/${MOVE_LABELS[activeShot.cameraMovement] || activeShot.cameraMovement}) · SHA256: ${(activeShot.videoSha256 || "").slice(0, 12)}`;
}

// Populate Right Column Shot Inspector
function populateShotInspector() {
  const shot = getSelectedShot();
  if (!projectLoaded || !shot) {
    inspectorBadgeEl.textContent = "未选定镜头";
    inspectorAnchorsEl.textContent =
      "拆解或加载剧集后，可在此微调任意单镜的景别、运镜、首尾帧、台词与画面提示词，并执行单镜无损重绘。";
    inspectorFieldset.disabled = true;
    shotTitleInput.value = "";
    shotGradeSelect.value = "default";
    shotSizeSelect.value = "MS";
    shotAngleSelect.value = "Eye-level";
    shotMoveSelect.value = "slow-push-in";
    shotStartInput.value = "";
    shotEndInput.value = "";
    shotSubtitleInput.value = "";
    shotAudioInput.value = "";
    shotPromptInput.value = "";
    return;
  }

  inspectorFieldset.disabled = busy;
  inspectorBadgeEl.textContent = `${shot.shotId} · S${String(shot.order).padStart(2, "0")} · v${shot.version}`;

  // Show locked character & location anchors bound to this shot
  const boundChars = (appState.characters || []).filter((c) =>
    (shot.characterIds || []).includes(c.characterId),
  );
  const boundLoc = (appState.locations || []).find(
    (l) => l.locationId === shot.locationId,
  );
  const charNames = boundChars.length
    ? boundChars.map((c) => `${c.name}`).join("、")
    : "通用角色";
  const locName = boundLoc
    ? `${boundLoc.name} (${boundLoc.lightingMood.slice(0, 26)}…)`
    : "默认场景";
  inspectorAnchorsEl.innerHTML = `<strong>已自动注入设定锚点：</strong>角色【${escapeHtml(
    charNames,
  )}】 · 场景【${escapeHtml(locName)}】`;

  shotTitleInput.value = shot.title || "";
  shotGradeSelect.value = shot.visualGrade || "default";

  // Ensure select has matching option or fallback
  const sizeOptions = Array.from(shotSizeSelect.options).map((o) => o.value);
  shotSizeSelect.value = sizeOptions.includes(shot.cameraShot)
    ? shot.cameraShot
    : "MS";

  const angleOptions = Array.from(shotAngleSelect.options).map((o) => o.value);
  shotAngleSelect.value = angleOptions.includes(shot.cameraAngle)
    ? shot.cameraAngle
    : "Eye-level";

  const moveOptions = Array.from(shotMoveSelect.options).map((o) => o.value);
  shotMoveSelect.value = moveOptions.includes(shot.cameraMovement)
    ? shot.cameraMovement
    : "slow-push-in";

  shotStartInput.value = shot.startFrameDesc || "";
  shotEndInput.value = shot.endFrameDesc || "";
  shotSubtitleInput.value = shot.subtitleText || "";
  shotAudioInput.value = shot.audioCue || "";
  shotPromptInput.value = shot.videoPrompt || "";
}

function updateActiveHighlightOnly() {
  const shots = appState?.shots || [];
  const cards = shotsGridEl.querySelectorAll(".shot-card");
  cards.forEach((c, i) => {
    c.classList.toggle("active", shots[i]?.shotId === selectedShotId);
  });
  const rows = shotsTbodyEl.querySelectorAll("tr");
  rows.forEach((r, i) => {
    r.classList.toggle("active", shots[i]?.shotId === selectedShotId);
  });
  const segs = timelineTrackEl.querySelectorAll(".tl-seg");
  segs.forEach((s, i) => {
    s.classList.toggle("active", shots[i]?.shotId === selectedShotId);
  });
}

function selectShot(shotId, idx, autoPlay = true) {
  selectedShotId = shotId;
  if (typeof idx === "number" && idx >= 0) {
    episodePlayIndex = idx;
  } else if (appState?.shots) {
    const foundIdx = appState.shots.findIndex((s) => s.shotId === shotId);
    if (foundIdx >= 0) episodePlayIndex = foundIdx;
  }
  updateActiveHighlightOnly();
  populateShotInspector();
  renderStagePlayer(autoPlay);
}

// Render All Sections
function syncUI(autoPlay = false) {
  renderJobsSelect();

  if (projectLoaded && appState) {
    dramaTitleInput.value = `${appState.title}${
      appState.subtitle ? ` · ${appState.subtitle}` : ""
    }`;
    if (appState.scriptText) {
      promptInput.value = appState.scriptText;
    }
    const shotLen = (appState.shots || []).length;
    for (const btn of countsEl.querySelectorAll("button[data-count]")) {
      btn.classList.toggle("active", Number(btn.dataset.count) === shotLen);
    }
  }

  renderBiblePanels();
  renderCenterStoryboard();
  renderTimelineBar();
  populateShotInspector();
  renderStagePlayer(autoPlay);
}

// Activate Existing or Preset Project
function activateLoadedProject(autoPlay = false) {
  if (!appState) return;
  projectLoaded = true;
  if (
    !selectedShotId ||
    !(appState.shots || []).some((s) => s.shotId === selectedShotId)
  ) {
    selectedShotId = appState.shots?.[0]?.shotId || "SHOT-001";
  }
  episodePlayIndex = Math.max(
    0,
    (appState.shots || []).findIndex((s) => s.shotId === selectedShotId),
  );
  syncUI(autoPlay);
}

// Reset UI to Clean "New Episode" State
function enterNewCreationMode() {
  projectLoaded = false;
  isolationBadgeEl.hidden = true;
  dramaTitleInput.value = "";
  promptInput.value = "";
  showError("");
  syncUI(false);
}

// Open Compiled Prompt & Audit Modal
function openCompiledModal() {
  const shot = getSelectedShot();
  if (!shot || !appState) return;
  compiledPromptBox.textContent =
    shot.compiledPrompt || shot.videoPrompt || "暂无编译提示词";
  const logs = appState.auditLog || [];
  if (!logs.length) {
    auditListEl.innerHTML = `<div class="audit-item">暂无渲染记录</div>`;
  } else {
    auditListEl.innerHTML = logs
      .slice(0, 8)
      .map(
        (item) => `
        <div class="audit-item">
          <div><strong>[${escapeHtml(item.action)}]</strong> ${escapeHtml(item.summary)}</div>
          <div class="slate-sub">${escapeHtml(item.timestamp)}</div>
        </div>
      `,
      )
      .join("");
  }
  if (typeof compiledDialog.showModal === "function") {
    compiledDialog.showModal();
  } else {
    compiledDialog.setAttribute("open", "open");
  }
}

// Single Shot Isolated Rerender
async function rerenderSelectedShot() {
  if (busy || !projectLoaded) return;
  const shot = getSelectedShot();
  if (!shot) return;
  showError("");
  setBusy(true, t.rerenderingShot);
  rerenderBtn.textContent = t.rerenderingShot;
  try {
    const res = await apiRequest(
      `/shots/${encodeURIComponent(shot.shotId)}/rerender`,
      {
        method: "POST",
        body: JSON.stringify({
          title: shotTitleInput.value.trim() || shot.title,
          visualGrade: shotGradeSelect.value,
          cameraShot: shotSizeSelect.value,
          cameraAngle: shotAngleSelect.value,
          cameraMovement: shotMoveSelect.value,
          startFrameDesc: shotStartInput.value.trim() || shot.startFrameDesc,
          endFrameDesc: shotEndInput.value.trim() || shot.endFrameDesc,
          subtitleText: shotSubtitleInput.value.trim(),
          audioCue: shotAudioInput.value.trim() || shot.audioCue,
          videoPrompt: shotPromptInput.value.trim() || shot.videoPrompt,
        }),
      },
    );
    appState = res.state;
    playMode = "single";
    if (res.isolationReport) {
      isolationBadgeEl.hidden = false;
      isolationBadgeEl.textContent = `单镜隔离重绘验证通过：${res.isolationReport.targetShotId} v${res.isolationReport.previousVersion}→v${res.isolationReport.newVersion}（其余 ${res.isolationReport.untouchedShotIds.length} 镜 SHA256 未变）`;
    }
    syncUI(true);
  } catch (err) {
    showError(err instanceof Error ? err.message : String(err));
  } finally {
    rerenderBtn.textContent = t.rerenderShot;
    setBusy(false);
  }
}

// Event Listeners: Topbar View Switcher
viewTabsEl.addEventListener("click", (ev) => {
  const btn = ev.target.closest("button[data-view]");
  if (!btn) return;
  setStudioView(btn.dataset.view);
});

// Event Listeners: Left Column Subtabs
leftTabsEl.addEventListener("click", (ev) => {
  const btn = ev.target.closest("button[data-left]");
  if (!btn) return;
  setLeftTab(btn.dataset.left);
});

// Event Listeners: Center Board Mode Toggle (Grid vs Table)
boardModesEl.addEventListener("click", (ev) => {
  const btn = ev.target.closest("button[data-board]");
  if (!btn) return;
  setBoardMode(btn.dataset.board);
});

openBibleBtn.addEventListener("click", () => {
  setLeftTab("chars");
});

// Event Listeners: Target Shot Count Segmented Control
countsEl.addEventListener("click", (ev) => {
  const btn = ev.target.closest("button[data-count]");
  if (!btn) return;
  selectedShotCount = Number(btn.dataset.count) || 8;
  for (const b of countsEl.querySelectorAll("button[data-count]")) {
    b.classList.toggle("active", b === btn);
  }
});

// Event Listeners: Quick Actions on Empty Board
quickLoadPresetBtn.addEventListener("click", () => {
  if (appState) {
    activateLoadedProject(false);
  }
});

quickFillScriptBtn.addEventListener("click", () => {
  const firstIdea = ideaList[0];
  if (firstIdea) {
    dramaTitleInput.value = firstIdea.title;
    dramaGenreSelect.value = firstIdea.genre;
    promptInput.value = firstIdea.script;
  }
  briefForm.requestSubmit();
});

// Event Listeners: Project Dropdown
jobsSelect.addEventListener("change", async () => {
  const val = jobsSelect.value;
  if (val === "__new__") {
    enterNewCreationMode();
    return;
  }
  if (val === "__preset__") {
    setBusy(true, t.generating);
    try {
      const res = await apiRequest("/preset/reset", {
        method: "POST",
        body: JSON.stringify({}),
      });
      appState = res.state;
      selectedShotId = appState.shots?.[0]?.shotId || "SHOT-001";
      episodePlayIndex = 0;
      isolationBadgeEl.hidden = true;
      activateLoadedProject(false);
    } catch (err) {
      showError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
    return;
  }
  if (appState) {
    activateLoadedProject(false);
  }
});

// Event Listeners: Script Breakdown Form Submit
briefForm.addEventListener("submit", async (ev) => {
  ev.preventDefault();
  if (busy) return;
  const rawScript = promptInput.value.trim();
  if (!rawScript) {
    promptInput.focus();
    return;
  }
  showError("");
  setBusy(true, t.generating);
  try {
    const titlePrefix = dramaTitleInput.value.trim();
    const composedScript =
      titlePrefix && !rawScript.includes("《")
        ? `《${titlePrefix}》\n${rawScript}`
        : rawScript;
    const res = await apiRequest("/script/breakdown", {
      method: "POST",
      body: JSON.stringify({
        scriptText: composedScript,
        shotCount: selectedShotCount,
      }),
    });
    appState = res.state;
    selectedShotId = appState.shots?.[0]?.shotId || "SHOT-001";
    episodePlayIndex = 0;
    playMode = "episode";
    isolationBadgeEl.hidden = true;
    activateLoadedProject(false);
  } catch (err) {
    showError(err instanceof Error ? err.message : String(err));
  } finally {
    setBusy(false);
  }
});

// Event Listeners: Character & Location Bible Selection & Sync
charSelectEl.addEventListener("change", () => {
  selectedCharId = charSelectEl.value;
  renderBiblePanels();
});

locSelectEl.addEventListener("change", () => {
  selectedLocId = locSelectEl.value;
  renderBiblePanels();
});

syncCharBtn.addEventListener("click", async () => {
  if (busy || !projectLoaded || !appState) return;
  const activeChar = (appState.characters || []).find(
    (c) => c.characterId === selectedCharId,
  );
  if (!activeChar) return;
  setBusy(true);
  try {
    const nextCostume = charCostumeInput.value.trim();
    const updatedLooks =
      Array.isArray(activeChar.looks) && activeChar.looks.length
        ? activeChar.looks.map((lk, idx) =>
            idx === 0
              ? { ...lk, costumeAnchors: nextCostume || lk.costumeAnchors }
              : lk,
          )
        : [
            {
              lookId: "LOOK-DEFAULT",
              name: "默认造型",
              description: nextCostume,
              costumeAnchors: nextCostume,
            },
          ];
    const res = await apiRequest("/consistency", {
      method: "PUT",
      body: JSON.stringify({
        character: {
          ...activeChar,
          name: charNameInput.value.trim() || activeChar.name,
          speciesOrAge:
            charSpeciesInput.value.trim() || activeChar.speciesOrAge,
          identityAnchors:
            charAnchorsInput.value.trim() || activeChar.identityAnchors,
          negativePrompt:
            charNegativeInput.value.trim() || activeChar.negativePrompt,
          looks: updatedLooks,
        },
      }),
    });
    appState = res.state;
    isolationBadgeEl.hidden = false;
    isolationBadgeEl.textContent = `已同步角色「${charNameInput.value.trim()}」外观锚点至全部 ${appState.shots.length} 个分镜`;
    syncUI(false);
  } catch (err) {
    showError(err instanceof Error ? err.message : String(err));
  } finally {
    setBusy(false);
  }
});

syncLocBtn.addEventListener("click", async () => {
  if (busy || !projectLoaded || !appState) return;
  const activeLoc = (appState.locations || []).find(
    (l) => l.locationId === selectedLocId,
  );
  if (!activeLoc) return;
  setBusy(true);
  try {
    const rawWeather = locWeatherInput.value.trim();
    const res = await apiRequest("/consistency", {
      method: "PUT",
      body: JSON.stringify({
        location: {
          ...activeLoc,
          name: locNameInput.value.trim() || activeLoc.name,
          timeOfDay: rawWeather || activeLoc.timeOfDay,
          visualAnchors:
            locAnchorsInput.value.trim() || activeLoc.visualAnchors,
          lightingMood: locLightingInput.value.trim() || activeLoc.lightingMood,
        },
      }),
    });
    appState = res.state;
    isolationBadgeEl.hidden = false;
    isolationBadgeEl.textContent = `已同步场景「${locNameInput.value.trim()}」光影锚点至全部 ${appState.shots.length} 个分镜`;
    syncUI(false);
  } catch (err) {
    showError(err instanceof Error ? err.message : String(err));
  } finally {
    setBusy(false);
  }
});

// Event Listeners: Right Stage Play Modes & Export MP4
playModesEl.addEventListener("click", (ev) => {
  const btn = ev.target.closest("button[data-mode]");
  if (!btn) return;
  playMode = btn.dataset.mode;
  renderStagePlayer(true);
});

exportBtn.addEventListener("click", async () => {
  if (busy || !projectLoaded) return;
  showError("");
  setBusy(true);
  exportBtn.textContent = t.exportingMp4;
  try {
    const res = await apiRequest("/episode/export", {
      method: "POST",
      body: JSON.stringify({}),
    });
    appState = res.state;
    renderStagePlayer(false);
  } catch (err) {
    showError(err instanceof Error ? err.message : String(err));
  } finally {
    exportBtn.textContent = t.exportMp4;
    setBusy(false);
  }
});

// Event Listeners: Shot Inspector Actions
rerenderBtn.addEventListener("click", () => {
  rerenderSelectedShot();
});

viewCompiledBtn.addEventListener("click", () => {
  openCompiledModal();
});

modalCloseBtn.addEventListener("click", () => {
  if (typeof compiledDialog.close === "function") {
    compiledDialog.close();
  } else {
    compiledDialog.removeAttribute("open");
  }
});

// Initial Bootstrap: Fetch state in background, start in clean "New Episode" mode
async function init() {
  try {
    const res = await apiRequest("/state");
    appState = res.state;
    selectedShotId = appState?.shots?.[0]?.shotId || "SHOT-001";
    selectedCharId = appState?.characters?.[0]?.characterId || "";
    selectedLocId = appState?.locations?.[0]?.locationId || "";
    projectLoaded = false; // Start in clean New Creation mode like native workbenches
    syncUI(false);
  } catch (err) {
    showError(err instanceof Error ? err.message : String(err));
  }
}

init();
