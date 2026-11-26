const API_BASE = "../api";

const en = {
  title: "Short Drama Studio",
  history: "History",
  new: "New brief",
  brief: "Story brief",
  prompt: "Describe the story or script",
  placeholder:
    "Storyline, main characters, setting, lighting mood and scene beats.",
  try: "Starting points",
  shotCount: "Storyboard shots",
  ratio: "Aspect ratio",
  generate: "Generate drama",
  preview: "Preview",
  idle: "Your storyboard and short drama video will appear here.",
  running: "Breaking down script and generating storyboard videos…",
  rerendering: "Re-rendering selected shot…",
  exporting: "Merging all shots into full episode MP4…",
  modeEpisode: "Full episode",
  modeSingle: "Single shot",
  exportMp4: "Merge MP4",
  rerenderShot: "Rerender shot",
  consistencyTitle: "Character & scene consistency",
  charSelect: "Character card",
  locSelect: "Location card",
  syncConsistency: "Save & sync to all shots",
  downloadEpisode: "Download episode MP4",
  downloadShot: "Download shot",
  requestFailed: "The request failed. Try again.",
  counts: [
    ["4", "4 shots"],
    ["6", "6 shots"],
    ["8", "8 shots"],
  ],
  ideas: [
    [
      "Cardboard shelter",
      "Title: Cardboard House\nRainy night outside a 24-hour convenience store. A shivering 5-month-old ginger-and-white tabby kitten named Nuomi shelters under the neon eaves. Night-shift clerk Lin Shen steps out with an umbrella, dries the kitten with a clean white towel, and builds a warm cardboard shelter with warm milk inside the store.",
    ],
    [
      "Midnight store",
      "Title: Midnight Convenience\nAt 2 AM on a rainy city street, a tired young illustrator steps into a warm 24-hour convenience store and discovers a stray ginger kitten guarding the last hot oden cup by the window.",
    ],
    [
      "Alleyway lantern",
      "Title: Alleyway Lantern\nIn a misty cobblestone alley at dusk, a warm amber lantern lights up outside an old bookshop as a curious tabby kitten leads a soaked traveler under the eaves.",
    ],
  ],
};

const zh = {
  title: "AI 短剧工作室",
  history: "历史记录",
  new: "新建创作",
  brief: "创作要求",
  prompt: "描述剧本",
  placeholder: "可以写故事梗概、主要角色、场景光线、构图或分场剧情...",
  try: "试试这些主题",
  shotCount: "分镜数量",
  ratio: "画幅比例",
  generate: "生成短剧",
  preview: "预览",
  idle: "生成的分镜与短剧视频会出现在这里。",
  running: "正在拆解剧本并生成分镜视频…",
  rerendering: "正在重绘当前镜头（其余分镜保持锁定）…",
  exporting: "正在按时间轴合成全集 MP4…",
  modeEpisode: "全集连播",
  modeSingle: "单镜预览",
  exportMp4: "合成全集 MP4",
  rerenderShot: "重绘当前镜头",
  consistencyTitle: "角色与场景一致性设定",
  charSelect: "角色设定卡",
  locSelect: "场景设定卡",
  syncConsistency: "保存并同步至全部分镜",
  downloadEpisode: "下载全集 MP4",
  downloadShot: "下载当前镜头",
  requestFailed: "请求失败，请重试。",
  counts: [
    ["4", "4镜"],
    ["6", "6镜"],
    ["8", "8镜"],
  ],
  ideas: [
    [
      "纸箱小屋",
      "《纸箱小屋》：磅礴大雨的深夜，24小时便利店霓虹屋檐下，一只5个月大的橘白相间小奶猫「糯米」浑身湿透瑟瑟发抖。夜班店员林深撑伞走出店门，用干净白毛巾温柔擦干小猫，在店里用印有暖心字样的瓦楞纸箱和温牛奶为它搭起温暖的纸箱小屋。",
    ],
    [
      "雨夜便利店",
      "《雨夜便利店》：凌晨两点的城市街头大雨倾盆，暖黄灯光的24小时便利店玻璃窗内热气氤氲，店员林深为躲雨的橘白小猫留了一盏暖光灯与热牛奶。",
    ],
    [
      "街角微光",
      "《街角微光》：微雨黄昏的老街巷口，暖琥珀色路灯亮起，一只橘白奶猫蹲在便利店台阶前，带领加班晚归的旅人找到一处温暖的避风港。",
    ],
  ],
};

let parentRoot;
try {
  if (window.parent !== window)
    parentRoot = window.parent.document.documentElement;
} catch {}
const lang = (parentRoot?.lang || navigator.language)
  .toLowerCase()
  .startsWith("zh")
  ? "zh"
  : "en";
const S = lang === "zh" ? zh : en;

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

const $ = (id) => document.getElementById(id);
document.documentElement.lang = lang;
document.title = S.title;
for (const el of document.querySelectorAll("[data-label]")) {
  const key = el.dataset.label;
  if (S[key]) el.textContent = S[key];
}
$("prompt").placeholder = S.placeholder;

// Populate starting ideas
$("ideas").replaceChildren();
for (const [title, prompt] of S.ideas) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = title;
  button.onclick = () => {
    $("prompt").value = prompt;
    $("prompt").focus();
  };
  $("ideas").append(button);
}

// Populate segmented shot count buttons
let selectedCount = 8;
$("counts").replaceChildren();
for (const [val, label] of S.counts) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.dataset.count = val;
  btn.textContent = label;
  if (Number(val) === selectedCount) btn.classList.add("active");
  btn.onclick = () => {
    selectedCount = Number(val);
    for (const b of $("counts").querySelectorAll("button")) {
      b.classList.toggle("active", b === btn);
    }
    if (currentJob && projectState) {
      renderWorkspace(projectState);
    }
  };
  $("counts").append(btn);
}

const placeholder = $("placeholder");
let projectState = null;
let jobs = [];
let currentJob = null;
let selectedShotId = "SHOT-001";
let playMode = "episode"; // "episode" | "single"
let exportInfo = null;
let submitting = false;

async function request(path, method = "GET", body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: "same-origin",
    ...(body
      ? {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      : {}),
  });
  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(payload?.error || S.requestFailed);
  }
  return payload;
}

function problem(message) {
  $("error").textContent = message;
  $("error").hidden = !message;
}

function stagePlaceholder(message, detail = "") {
  $("stage").replaceChildren(placeholder);
  $("status").textContent = message;
  $("stage-tools").hidden = true;
  $("workbench-workspace").hidden = true;
  $("consistency-drawer").hidden = true;
  $("downloads").replaceChildren();
  $("detail").textContent = detail;
  $("detail").hidden = !detail;
}

function showHistory() {
  $("jobs").replaceChildren(
    new Option(S.new, ""),
    ...jobs.map((job) => new Option(job.label, job.id)),
  );
  $("jobs").value = currentJob?.id || "";
}

function shotVideoUrl(shot) {
  const ver = `${shot.version || 1}_${(shot.videoSha256 || "").slice(0, 8)}`;
  return `${API_BASE}/videos/${encodeURIComponent(shot.shotId)}?v=${encodeURIComponent(ver)}`;
}

function episodeDownloadUrl(download = false) {
  const ver = exportInfo?.sha256 ? exportInfo.sha256.slice(0, 10) : Date.now();
  return `${API_BASE}/episode/download?download=${download ? "1" : "0"}&v=${encodeURIComponent(ver)}`;
}

function getVisibleShots(state) {
  const all = state?.shots || [];
  return all.slice(0, selectedCount);
}

function getSelectedShot(state) {
  const visible = getVisibleShots(state);
  return visible.find((s) => s.shotId === selectedShotId) || visible[0] || null;
}

function renderStagePlayer(state) {
  const shot = getSelectedShot(state);
  if (!shot) return;

  const wrap = document.createElement("div");
  wrap.className = "stage-player";

  const video = document.createElement("video");
  video.id = "player";
  video.controls = true;
  video.playsInline = true;
  video.preload = "metadata";

  if (playMode === "episode" && exportInfo) {
    video.src = episodeDownloadUrl(false);
  } else {
    video.src = shotVideoUrl(shot);
  }

  video.addEventListener(
    "loadedmetadata",
    () => {
      if (video.paused && video.currentTime < 0.4 && video.duration > 0.8) {
        video.currentTime = 0.6;
      }
    },
    { once: true },
  );

  // If in episode mode without exported file yet, chain shots automatically
  if (playMode === "episode" && !exportInfo) {
    const visible = getVisibleShots(state);
    let idx = visible.findIndex((s) => s.shotId === shot.shotId);
    if (idx < 0) idx = 0;
    video.src = shotVideoUrl(visible[idx]);
    video.onended = () => {
      if (idx + 1 < visible.length) {
        idx += 1;
        selectedShotId = visible[idx].shotId;
        video.src = shotVideoUrl(visible[idx]);
        video.play().catch(() => {});
        highlightActiveShotCard(state);
      }
    };
  }

  const caption = document.createElement("div");
  caption.className = "stage-caption";

  const sub = document.createElement("span");
  sub.className = "stage-caption-sub";
  sub.id = "stage-sub";
  const rawSub = String(shot.subtitleText || shot.title || "").trim();
  sub.textContent =
    playMode === "episode" ? rawSub : `${shot.shotId} · ${rawSub}`;

  const meta = document.createElement("span");
  meta.className = "stage-caption-meta";
  meta.id = "stage-meta";
  const totalSec = getVisibleShots(state).reduce(
    (acc, s) => acc + (s.durationSec || 6),
    0,
  );
  meta.textContent =
    playMode === "episode"
      ? `${getVisibleShots(state).length} 镜 · ${totalSec}s`
      : `${shot.cameraSize || "MS"} · ${shot.durationSec || 6}s · v${shot.version || 1}`;

  caption.append(sub, meta);
  wrap.append(video, caption);
  $("stage").replaceChildren(wrap);
}

function highlightActiveShotCard(state) {
  const shot = getSelectedShot(state);
  for (const card of $("shots-grid").querySelectorAll(".shot-item")) {
    card.classList.toggle("active", card.dataset.shotId === shot?.shotId);
  }
  if (shot) {
    updateInspector(state, shot);
    updateDownloads(shot);
  }
}

function updateInspector(state, shot) {
  $("inspector-title").textContent =
    `${shot.shotId} · ${shot.title} (v${shot.version || 1})`;
  const charNames = (state.characters || [])
    .filter((c) => (shot.characterIds || []).includes(c.characterId))
    .map((c) => c.name)
    .join(" / ");
  const loc = (state.locations || []).find(
    (l) => l.locationId === shot.locationId,
  );
  const lockParts = [];
  if (charNames) lockParts.push(`角色锚点: ${charNames}`);
  if (loc) lockParts.push(`场景锚点: ${loc.name}`);
  $("inspector-anchors").textContent = lockParts.join(" · ");
  $("shot-prompt").value = shot.videoPrompt || "";
  $("shot-grade").value = shot.visualGrade || "default";
}

function updateConsistencyDrawer(state) {
  const chars = state.characters || [];
  const locs = state.locations || [];

  $("char-select").replaceChildren(
    ...chars.map(
      (c) => new Option(`${c.name} (${c.characterId})`, c.characterId),
    ),
  );
  $("loc-select").replaceChildren(
    ...locs.map((l) => new Option(`${l.name} (${l.locationId})`, l.locationId)),
  );

  const fillChar = () => {
    const c =
      chars.find((item) => item.characterId === $("char-select").value) ||
      chars[0];
    if (c) {
      $("char-name").value = c.name || "";
      $("char-anchors").value = c.identityAnchors || "";
    }
  };
  const fillLoc = () => {
    const l =
      locs.find((item) => item.locationId === $("loc-select").value) || locs[0];
    if (l) {
      $("loc-name").value = l.name || "";
      $("loc-anchors").value = l.visualAnchors || "";
    }
  };

  $("char-select").onchange = fillChar;
  $("loc-select").onchange = fillLoc;
  fillChar();
  fillLoc();
}

function updateDownloads(shot) {
  const links = [];
  if (exportInfo) {
    const epLink = document.createElement("a");
    epLink.className = "download";
    epLink.href = episodeDownloadUrl(true);
    epLink.download = exportInfo.fileName || "episode-EP001.mp4";
    epLink.textContent = `${S.downloadEpisode} · ${exportInfo.fileName || "episode-EP001.mp4"}`;
    links.push(epLink);
  }
  if (shot) {
    const shotLink = document.createElement("a");
    shotLink.className = "download";
    shotLink.href = shotVideoUrl(shot);
    shotLink.download = `${shot.shotId}-v${shot.version || 1}.mp4`;
    shotLink.textContent = `${S.downloadShot} · ${shot.shotId} (v${shot.version || 1})`;
    links.push(shotLink);
  }
  $("downloads").replaceChildren(...links);
}

function renderWorkspace(state) {
  const visible = getVisibleShots(state);
  if (!visible.some((s) => s.shotId === selectedShotId) && visible[0]) {
    selectedShotId = visible[0].shotId;
  }
  const activeShot = getSelectedShot(state);

  $("stage-tools").hidden = false;
  $("workbench-workspace").hidden = false;
  $("consistency-drawer").hidden = false;
  $("detail").hidden = true;

  const totalSec = visible.reduce((acc, s) => acc + (s.durationSec || 6), 0);
  $("shots-summary").textContent =
    lang === "zh"
      ? `分镜故事板 · 共 ${visible.length} 镜 (${totalSec}s) · 点击卡片切换镜头`
      : `Storyboard · ${visible.length} shots (${totalSec}s) · Click to inspect`;

  renderStagePlayer(state);

  const cards = visible.map((shot) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className =
      "shot-item" + (shot.shotId === activeShot?.shotId ? " active" : "");
    btn.dataset.shotId = shot.shotId;

    const thumb = document.createElement("div");
    thumb.className = "shot-thumb";

    const vid = document.createElement("video");
    vid.src = shotVideoUrl(shot);
    vid.muted = true;
    vid.playsInline = true;
    vid.preload = "metadata";
    vid.addEventListener(
      "loadedmetadata",
      () => {
        if (vid.duration > 0.8) vid.currentTime = 0.6;
      },
      { once: true },
    );

    const badges = document.createElement("div");
    badges.className = "shot-badge-row";

    const code = document.createElement("span");
    code.className = "shot-code";
    code.textContent = shot.shotId.replace("SHOT-0", "S");

    const ver = document.createElement("span");
    ver.className = "shot-ver" + ((shot.version || 1) > 1 ? " rerendered" : "");
    ver.textContent = `v${shot.version || 1}`;

    badges.append(code, ver);
    thumb.append(vid, badges);

    const title = document.createElement("div");
    title.className = "shot-title";
    title.textContent = shot.title;

    const meta = document.createElement("div");
    meta.className = "shot-meta";
    meta.textContent = `${shot.cameraSize || "MS"} · ${shot.durationSec || 6}s`;

    btn.append(thumb, title, meta);
    btn.onclick = () => {
      selectedShotId = shot.shotId;
      playMode = "single";
      for (const b of $("play-modes").querySelectorAll("button")) {
        b.classList.toggle("active", b.dataset.mode === "single");
      }
      renderStagePlayer(state);
      highlightActiveShotCard(state);
      const player = $("player");
      if (player) player.play().catch(() => {});
    };
    return btn;
  });

  $("shots-grid").replaceChildren(...cards);
  if (activeShot) {
    updateInspector(state, activeShot);
    updateDownloads(activeShot);
  }
  updateConsistencyDrawer(state);
}

function choose(job) {
  currentJob = job;
  problem("");
  showHistory();
  $("isolation-badge").hidden = true;

  if (!job) {
    $("prompt").value = "";
    stagePlaceholder(S.idle);
    return;
  }

  $("prompt").value = job.prompt || projectState?.scriptText || "";
  if (projectState) {
    renderWorkspace(projectState);
  }
}

$("jobs").onchange = () => {
  const val = $("jobs").value;
  if (!val) {
    choose(null);
    return;
  }
  const found = jobs.find((j) => j.id === val);
  if (found) choose(found);
};

// Play mode toggle (Full Episode vs Single Shot)
for (const btn of $("play-modes").querySelectorAll("button")) {
  btn.onclick = () => {
    playMode = btn.dataset.mode;
    for (const b of $("play-modes").querySelectorAll("button")) {
      b.classList.toggle("active", b === btn);
    }
    if (projectState) {
      renderStagePlayer(projectState);
    }
  };
}

// Submit brief -> Breakdown script & generate storyboard + episode video
$("brief").onsubmit = async (event) => {
  event.preventDefault();
  const prompt = $("prompt").value.trim();
  if (submitting || !prompt) return;

  submitting = true;
  $("generate").disabled = true;
  problem("");
  stagePlaceholder(S.running);

  try {
    const res = await request("/script/breakdown", "POST", {
      scriptText: prompt,
    });
    projectState = res.state;

    // Also export full episode MP4 so full-episode playback and download are immediately ready
    const exp = await request("/episode/export", "POST", {}).catch(() => null);
    if (exp?.exportInfo) {
      exportInfo = exp.exportInfo;
      projectState = exp.state || projectState;
    }

    const jobLabel = `${projectState.title || "短剧项目"} · ${selectedCount}镜`;
    const newJob = {
      id: `job-${Date.now()}`,
      label: jobLabel,
      prompt,
    };
    jobs = [newJob, ...jobs.filter((j) => j.label !== jobLabel)];
    selectedShotId = projectState.shots?.[0]?.shotId || "SHOT-001";
    playMode = "episode";
    for (const b of $("play-modes").querySelectorAll("button")) {
      b.classList.toggle("active", b.dataset.mode === "episode");
    }
    choose(newJob);

    if (matchMedia("(max-width:720px)").matches) {
      document.querySelector(".preview").scrollIntoView({ block: "start" });
    }
  } catch (e) {
    stagePlaceholder(S.idle);
    problem(e.message);
  } finally {
    submitting = false;
    $("generate").disabled = false;
  }
};

// Single-shot non-destructive rerender
$("rerender-btn").onclick = async () => {
  if (!projectState || submitting) return;
  const shot = getSelectedShot(projectState);
  if (!shot) return;

  submitting = true;
  $("rerender-btn").disabled = true;
  problem("");

  try {
    const res = await request(
      `/shots/${encodeURIComponent(shot.shotId)}/rerender`,
      "POST",
      {
        videoPrompt: $("shot-prompt").value.trim() || shot.videoPrompt,
        visualGrade: $("shot-grade").value,
      },
    );
    projectState = res.state;
    const iso = res.isolationCheck;
    if (iso) {
      $("isolation-badge").hidden = false;
      $("isolation-badge").textContent =
        lang === "zh"
          ? `已重绘 ${iso.targetShotId} (v${iso.previousVersion}→v${iso.newVersion}) · 其余 ${iso.untouchedShotCount} 镜未受影响`
          : `Rerendered ${iso.targetShotId} (v${iso.previousVersion}→v${iso.newVersion}) · ${iso.untouchedShotCount} shots untouched`;
    }
    playMode = "single";
    for (const b of $("play-modes").querySelectorAll("button")) {
      b.classList.toggle("active", b.dataset.mode === "single");
    }
    renderWorkspace(projectState);
  } catch (e) {
    problem(e.message);
  } finally {
    submitting = false;
    $("rerender-btn").disabled = false;
  }
};

// Export full episode MP4
$("export-btn").onclick = async () => {
  if (!projectState || submitting) return;
  submitting = true;
  $("export-btn").disabled = true;
  problem("");

  try {
    const res = await request("/episode/export", "POST", {});
    projectState = res.state || projectState;
    exportInfo = res.exportInfo;
    playMode = "episode";
    for (const b of $("play-modes").querySelectorAll("button")) {
      b.classList.toggle("active", b.dataset.mode === "episode");
    }
    renderWorkspace(projectState);
  } catch (e) {
    problem(e.message);
  } finally {
    submitting = false;
    $("export-btn").disabled = false;
  }
};

// Sync character & location consistency anchors to all shots
$("sync-consistency").onclick = async () => {
  if (!projectState || submitting) return;
  const charId = $("char-select").value;
  const locId = $("loc-select").value;
  const charObj = (projectState.characters || []).find(
    (c) => c.characterId === charId,
  );
  const locObj = (projectState.locations || []).find(
    (l) => l.locationId === locId,
  );

  submitting = true;
  $("sync-consistency").disabled = true;
  problem("");

  try {
    const body = {};
    if (charObj) {
      body.character = {
        ...charObj,
        name: $("char-name").value.trim() || charObj.name,
        identityAnchors:
          $("char-anchors").value.trim() || charObj.identityAnchors,
      };
    }
    if (locObj) {
      body.location = {
        ...locObj,
        name: $("loc-name").value.trim() || locObj.name,
        visualAnchors: $("loc-anchors").value.trim() || locObj.visualAnchors,
      };
    }
    const res = await request("/consistency", "PUT", body);
    projectState = res.state;
    $("isolation-badge").hidden = false;
    $("isolation-badge").textContent =
      lang === "zh"
        ? "已同步角色与场景一致性锚点至全部分镜"
        : "Synced character & scene anchors to all shots";
    renderWorkspace(projectState);
  } catch (e) {
    problem(e.message);
  } finally {
    submitting = false;
    $("sync-consistency").disabled = false;
  }
};

async function start() {
  // Always start in the clean "New brief" (新建创作) state so the initial screen
  // matches native workbenches like Image Studio!
  stagePlaceholder(S.idle);
  showHistory();

  try {
    const data = await request("/state");
    if (data?.state) {
      projectState = data.state;
      jobs = [
        {
          id: "EP001",
          label: `${projectState.title || "《纸箱小屋》"} · 雨夜来客`,
          prompt: projectState.scriptText || S.ideas[0][1],
        },
      ];
      showHistory();
    }
    // Pre-warm episode export in background without switching away from "New brief"
    request("/episode/export", "POST", {})
      .then((exp) => {
        if (exp?.exportInfo) exportInfo = exp.exportInfo;
      })
      .catch(() => {});
  } catch (e) {
    problem(e.message);
  }
}

void start();
