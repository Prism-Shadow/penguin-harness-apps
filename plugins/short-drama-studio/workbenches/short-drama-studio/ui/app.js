const API_BASE = "../api";

const I18N = {
  zh: {
    appName: "AI 短剧工作室",
    appTagline: "AI 短剧分镜与视频工作台",
    navWorkspaceTitle: "创作视图",
    navViewStoryboard: "分镜与成片",
    navViewScript: "剧本与拆解",
    navViewBible: "角色与场景设定",
    lockedAssetsTitle: "已锁定设定锚点",
    editAssetsBtn: "管理",
    providerConfigBtn: "引擎设置",
    versionHistoryBtn: "编译记录",
    themeLabelDark: "浅色",
    themeLabelLight: "深色",
    resetPreset: "重置",
    downloadMasterMp4: "下载成片",
    exportEpisodeBtn: "合成导出成片",
    storyboardGalleryTitle: "分镜故事板",
    layoutGrid: "画廊",
    layoutList: "场记表",
    startFrameLabel: "首帧",
    endFrameLabel: "尾帧",
    viewCompiledPromptBtn: "查看完整编译提示词",
    rerenderShotBtn: "重绘当前镜头",
    previewMonitorTitle: "预览",
    singleShotMode: "单镜预览",
    fullEpisodeMode: "全集连播",
    playSequence: "按序连播",
    shotInspectorTitle: "镜头场记参数",
    saveShotMetaBtn: "保存参数",
    shotTitleLabel: "镜头标题",
    shotDurationLabel: "时长 (秒)",
    shotCameraSizeLabel: "景别 (Shot Size)",
    shotCameraAngleLabel: "机位角度 (Angle)",
    shotCameraMoveLabel: "摄影机运动 (Camera Movement)",
    shotSubtitleLabel: "台词 / 画面字幕",
    shotAudioLabel: "环境音效提示",
    startFrameDescLabel: "首帧构图描述",
    endFrameDescLabel: "尾帧落幅描述",
    scriptEditorTitle: "分场剧本编辑",
    parseScriptBtn: "智能拆解为分镜表",
    breakdownPreviewTitle: "拆解结构总览",
    backToStoryboardBtn: "返回分镜故事板",
    characterBibleTitle: "角色一致性设定卡",
    saveCharactersBtn: "保存并同步至分镜",
    selectCharacterLabel: "选择编辑角色",
    charNameLabel: "角色名称",
    charSpeciesLabel: "年龄 / 物种与身份设定",
    charAnchorsLabel: "核心外观一致性锚点 (Identity Anchors)",
    charLookLabel: "造型状态 (Look)",
    charCostumeLabel: "服装与毛发细节锚点",
    charNegativeLabel: "角色负向排除词 (Negative Prompt)",
    locationBibleTitle: "场景与光影设定卡",
    saveLocationsBtn: "保存并同步场景光影",
    selectLocationLabel: "选择编辑场景",
    locNameLabel: "场景名称",
    locWeatherLabel: "时间与天气环境",
    locViewLabel: "预设机位朝向",
    locAnchorsLabel: "空间建筑与环境锚点 (Visual Anchors)",
    locLightingLabel: "核心色温与光影氛围基调 (Lighting Mood)",
    providerModalTitle: "视频生成引擎与模型设置",
    providerModeLabel: "当前渲染后端 (Provider Mode)",
    confirmBeforeGenerateLabel: "批量重绘前显示一致性锚点确认提示",
    advancedFaultTestTitle: "高级容错演练（开发与测试选项）",
    simulateFailBtn: "模拟渲染异常",
    saveProviderBtn: "保存设置",
    compiledModalTitle: "一致性编译 Prompt 与镜头渲染记录",
    compiledPromptLabel: "当前镜头完整编译 Prompt（含角色外观锁、场景光影锁与摄影机参数）",
    auditTitle: "镜头渲染与成片导出记录",
  },
  en: {
    appName: "Short Drama Studio",
    appTagline: "AI Storyboard & Video Workbench",
    navWorkspaceTitle: "Workspace Views",
    navViewStoryboard: "Storyboard & Cut",
    navViewScript: "Script & Breakdown",
    navViewBible: "Characters & Locations",
    lockedAssetsTitle: "Locked Story Bible",
    editAssetsBtn: "Manage",
    providerConfigBtn: "Engine Settings",
    versionHistoryBtn: "Prompt Log",
    themeLabelDark: "Light",
    themeLabelLight: "Dark",
    resetPreset: "Reset",
    downloadMasterMp4: "Download MP4",
    exportEpisodeBtn: "Export Episode MP4",
    storyboardGalleryTitle: "Storyboard",
    layoutGrid: "Gallery",
    layoutList: "Slate List",
    startFrameLabel: "Start",
    endFrameLabel: "End",
    viewCompiledPromptBtn: "View Compiled Prompt",
    rerenderShotBtn: "Rerender Shot",
    previewMonitorTitle: "Preview",
    singleShotMode: "Single Shot",
    fullEpisodeMode: "Full Episode",
    playSequence: "Play All",
    shotInspectorTitle: "Shot Parameters",
    saveShotMetaBtn: "Save Parameters",
    shotTitleLabel: "Shot Title",
    shotDurationLabel: "Duration (s)",
    shotCameraSizeLabel: "Shot Size",
    shotCameraAngleLabel: "Camera Angle",
    shotCameraMoveLabel: "Camera Movement",
    shotSubtitleLabel: "Dialogue / Subtitle",
    shotAudioLabel: "Audio & SFX Cue",
    startFrameDescLabel: "Start Frame Composition",
    endFrameDescLabel: "End Frame Composition",
    scriptEditorTitle: "Screenplay Editor",
    parseScriptBtn: "AI Breakdown to Shots",
    breakdownPreviewTitle: "Breakdown Structure",
    backToStoryboardBtn: "Back to Storyboard",
    characterBibleTitle: "Character Consistency Cards",
    saveCharactersBtn: "Save & Sync to Shots",
    selectCharacterLabel: "Active Character",
    charNameLabel: "Character Name",
    charSpeciesLabel: "Age / Species / Role",
    charAnchorsLabel: "Identity Anchors",
    charLookLabel: "Look / Wardrobe Preset",
    charCostumeLabel: "Wardrobe & Fur Details",
    charNegativeLabel: "Negative Prompt",
    locationBibleTitle: "Location & Lighting Cards",
    saveLocationsBtn: "Save & Sync Locations",
    selectLocationLabel: "Active Location",
    locNameLabel: "Location Name",
    locWeatherLabel: "Time & Weather",
    locViewLabel: "Camera Direction",
    locAnchorsLabel: "Architectural & Visual Anchors",
    locLightingLabel: "Color Temperature & Lighting Mood",
    providerModalTitle: "Video Engine & Model Settings",
    providerModeLabel: "Active Render Backend",
    confirmBeforeGenerateLabel: "Confirm consistency anchors before batch rerender",
    advancedFaultTestTitle: "Fault Tolerance Drill (Developer Option)",
    simulateFailBtn: "Simulate Render Failure",
    saveProviderBtn: "Save Settings",
    compiledModalTitle: "Compiled Prompt & Render Log",
    compiledPromptLabel: "Full Compiled Prompt (Character Lock + Location Lock + Camera Spec)",
    auditTitle: "Render & Master Export History",
  },
};

const appState = {
  lang: "zh",
  theme: "light",
  activeView: "storyboard", // "storyboard" | "script" | "bible"
  layoutMode: "grid", // "grid" | "list"
  project: null,
  selectedShotId: "SHOT-001",
  selectedCharacterId: "CHAR-CAT",
  selectedLookIndex: 0,
  selectedLocationId: "LOC-STORE-EXT",
  selectedViewIndex: 0,
  playerMode: "single", // "single" | "episode"
  sequencePlaying: false,
  sequenceIndex: 0,
  busy: false,
};

function $(id) {
  return document.getElementById(id);
}

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function cleanSubtitle(rawSubtitle) {
  const s = String(rawSubtitle || "").trim();
  if (!s || s.includes("DSH") || s.includes("验证剧目")) {
    return "EP01《雨夜来客》 · 都市治愈短剧 · 16:9 HD";
  }
  return s;
}

function showToast(msg) {
  const container = $("toast-container");
  if (!container) return;
  const el = document.createElement("div");
  el.className = "toast-msg";
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => {
    el.remove();
  }, 3200);
}

async function apiRequest(path, options = {}) {
  const method = options.method || "GET";
  const headers = { ...(options.headers || {}) };
  let body = options.body;
  if (body && typeof body === "object") {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(body);
  }
  const res = await fetch(`${API_BASE}${path}`, { method, headers, body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return data;
}

function getSelectedShot() {
  if (!appState.project?.shots?.length) return null;
  return (
    appState.project.shots.find((s) => s.shotId === appState.selectedShotId) ||
    appState.project.shots[0]
  );
}

function getShotVideoUrl(shot) {
  const v = `${shot.version || 1}_${(shot.videoSha256 || "").slice(0, 8)}`;
  return `${API_BASE}/videos/${encodeURIComponent(shot.shotId)}?v=${encodeURIComponent(v)}`;
}

function getEpisodeExportUrl(exportInfo, download = false) {
  const v = exportInfo?.sha256 ? exportInfo.sha256.slice(0, 10) : Date.now();
  return `${API_BASE}/episode/download?download=${download ? "1" : "0"}&v=${encodeURIComponent(v)}`;
}

/* =========================================================
   动态绘制首尾帧视觉缩略图 & 角色/场景视觉设定横幅
   ========================================================= */
function drawKeyframeCanvas(canvas, shot, isEndFrame = false) {
  if (!canvas || !shot) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;

  // 优先使用已加载的真实分镜视频画面绘制首尾帧缩略图
  const cardVideo = document.querySelector(
    `.shot-card[data-shot-id="${CSS.escape(shot.shotId)}"] video`,
  );
  const drawFromVideo = (vid) => {
    try {
      if (vid && vid.readyState >= 2 && vid.videoWidth > 0) {
        if (isEndFrame) {
          ctx.save();
          ctx.translate(w, 0);
          ctx.scale(-1.04, 1.04);
          ctx.drawImage(vid, 0, 0, w, h);
          ctx.restore();
        } else {
          ctx.drawImage(vid, 0, 0, w, h);
        }
        return true;
      }
    } catch {
      // fallback below
    }
    return false;
  };

  if (drawFromVideo(cardVideo)) return;

  // 若视频尚在加载中，监听 loadeddata 自动刷新真实视频帧
  if (cardVideo && !cardVideo.dataset.kfBound) {
    cardVideo.dataset.kfBound = "1";
    cardVideo.addEventListener(
      "loadeddata",
      () => {
        const cur = getSelectedShot();
        if (cur && cur.shotId === shot.shotId) {
          drawKeyframeCanvas($("canvas-start-frame"), cur, false);
          drawKeyframeCanvas($("canvas-end-frame"), cur, true);
        }
      },
      { once: true },
    );
  }

  // 柔和浅色/暖调占位渐变
  const isInterior = shot.locationId === "LOC-STORE-INT";
  const grad = ctx.createLinearGradient(0, 0, w, h);
  if (isInterior) {
    grad.addColorStop(0, "#3b2c1e");
    grad.addColorStop(1, "#6b4c2b");
  } else {
    grad.addColorStop(0, "#1e293b");
    grad.addColorStop(1, "#4338ca");
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

function drawAssetBannerCanvas(canvas, type, id) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;

  if (type === "character" && id === "CHAR-CAT") {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#1c1917");
    g.addColorStop(1, "#451a03");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // 暖光光晕与小橘猫头像插画
    ctx.fillStyle = "rgba(245, 158, 11, 0.18)";
    ctx.beginPath();
    ctx.arc(w * 0.78, h * 0.5, 34, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#f59e0b";
    ctx.beginPath();
    ctx.arc(w * 0.78, h * 0.54, 18, 0, Math.PI * 2);
    ctx.fill();
    // 猫耳
    ctx.beginPath();
    ctx.moveTo(w * 0.78 - 15, h * 0.54 - 8);
    ctx.lineTo(w * 0.78 - 8, h * 0.54 - 23);
    ctx.lineTo(w * 0.78 - 2, h * 0.54 - 14);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(w * 0.78 + 15, h * 0.54 - 8);
    ctx.lineTo(w * 0.78 + 8, h * 0.54 - 23);
    ctx.lineTo(w * 0.78 + 2, h * 0.54 - 14);
    ctx.fill();
    // 琥珀圆眼
    ctx.fillStyle = "#fef3c7";
    ctx.beginPath();
    ctx.arc(w * 0.78 - 6, h * 0.52, 3, 0, Math.PI * 2);
    ctx.arc(w * 0.78 + 6, h * 0.52, 3, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === "character") {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#0f172a");
    g.addColorStop(1, "#064e3b");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = "#10b981";
    ctx.fillRect(w * 0.78 - 14, h * 0.52, 28, 30);
    ctx.fillStyle = "#fde68a";
    ctx.beginPath();
    ctx.arc(w * 0.78, h * 0.36, 11, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === "LOC-STORE-EXT") {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#090d16");
    g.addColorStop(0.6, "#1e293b");
    g.addColorStop(1, "#451a03");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    // 色板条
    const swatches = ["#0f172a", "#1e3a8a", "#d97706", "#fbbf24"];
    swatches.forEach((c, idx) => {
      ctx.fillStyle = c;
      ctx.fillRect(12 + idx * 22, h - 18, 18, 8);
    });
  } else {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#271c12");
    g.addColorStop(1, "#78350f");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    const swatches = ["#451a03", "#b45309", "#f59e0b", "#fef3c7"];
    swatches.forEach((c, idx) => {
      ctx.fillStyle = c;
      ctx.fillRect(12 + idx * 22, h - 18, 18, 8);
    });
  }
}

/* =========================================================
   视图切换与导航渲染
   ========================================================= */
function switchView(viewName) {
  appState.activeView = viewName;
  const views = ["storyboard", "script", "bible"];
  views.forEach((v) => {
    const section = $(`view-${v}`);
    const btn = $(`nav-view-${v}`);
    const isMatch = v === viewName;
    if (section) {
      if (isMatch) {
        section.removeAttribute("hidden");
        section.classList.add("active");
      } else {
        section.setAttribute("hidden", "");
        section.classList.remove("active");
      }
    }
    if (btn) {
      btn.classList.toggle("active", isMatch);
      btn.setAttribute("aria-selected", isMatch ? "true" : "false");
    }
  });
}

function renderRailAnchors() {
  const list = $("rail-anchor-list");
  const p = appState.project;
  if (!list || !p) return;

  const charItems = (p.characters || []).map(
    (c) => `
    <button type="button" class="anchor-item-btn" data-jump-type="char" data-id="${escapeHtml(c.characterId)}">
      <span class="anchor-dot"></span>
      <span class="anchor-item-name">${escapeHtml(c.name.split(" ")[0])}</span>
      <span class="anchor-item-tag">角色锁</span>
    </button>
  `,
  );

  const locItems = (p.locations || []).map(
    (l) => `
    <button type="button" class="anchor-item-btn" data-jump-type="loc" data-id="${escapeHtml(l.locationId)}">
      <span class="anchor-dot loc-dot"></span>
      <span class="anchor-item-name">${escapeHtml(l.name.replace("深夜24小时", ""))}</span>
      <span class="anchor-item-tag">光影锁</span>
    </button>
  `,
  );

  list.innerHTML = [...charItems, ...locItems].join("");

  list.querySelectorAll(".anchor-item-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const type = btn.getAttribute("data-jump-type");
      const id = btn.getAttribute("data-id");
      if (type === "char") {
        appState.selectedCharacterId = id;
        appState.selectedLookIndex = 0;
      } else {
        appState.selectedLocationId = id;
        appState.selectedViewIndex = 0;
      }
      renderBibleView();
      switchView("bible");
    });
  });
}

/* =========================================================
   顶栏与全局统计渲染
   ========================================================= */
function renderTopbar() {
  const p = appState.project;
  if (!p) return;

  $("episode-badge").textContent = p.episodeId || "EP01";
  $("project-title").textContent = p.title || "《纸箱小屋》";
  $("project-subtitle").textContent = cleanSubtitle(p.subtitle);

  const totalSec = (p.shots || []).reduce((acc, s) => acc + (Number(s.durationSec) || 0), 0);
  const readyCount = (p.shots || []).filter((s) => s.status === "ready").length;
  $("metric-shots").textContent = `${readyCount}/${p.shots.length} 镜 · ${totalSec}s · ${p.providerConfig?.resolution || "720p"} ${p.providerConfig?.fps || 24}fps`;

  $("nav-badge-shots").textContent = String(p.shots.length);
  $("nav-badge-episode").textContent = p.episodeId || "EP01";
  $("nav-badge-assets").textContent = String((p.characters?.length || 0) + (p.locations?.length || 0));

  const providerMode = p.providerConfig?.mode || "studio-ffmpeg";
  const providerLabels = {
    "studio-ffmpeg": "Seedance 2.0 · Studio",
    seedance: "Doubao Seedance 1.0 Pro",
    minimax: "MiniMax Hailuo-02",
    "openai-video": "Sora Video API",
  };
  const pillLabel = $("pill-provider-label");
  if (pillLabel) {
    pillLabel.textContent = providerLabels[providerMode] || providerMode;
  }

  const dlBtn = $("btn-download-episode");
  if (dlBtn) {
    if (p.lastExport?.fileName) {
      dlBtn.href = getEpisodeExportUrl(p.lastExport, true);
      dlBtn.classList.remove("hidden");
    } else {
      dlBtn.classList.add("hidden");
    }
  }
}

/* =========================================================
   视图 01：分镜画廊 + 底部生成舱 + 右侧监视器与场记检查器
   ========================================================= */
function renderStoryboardGallery() {
  const grid = $("storyboard-grid");
  const p = appState.project;
  if (!grid || !p) return;

  grid.classList.toggle("list-layout", appState.layoutMode === "list");

  const totalSec = p.shots.reduce((acc, s) => acc + (Number(s.durationSec) || 0), 0);
  const summaryMeta = $("storyboard-summary-meta");
  if (summaryMeta) {
    summaryMeta.textContent = `共 ${p.shots.length} 个镜头 · 总时长 ${totalSec.toFixed(1)}s · 悬停卡片可预览动态画面`;
  }

  const charMap = new Map((p.characters || []).map((c) => [c.characterId, c]));
  const locMap = new Map((p.locations || []).map((l) => [l.locationId, l]));

  grid.innerHTML = p.shots
    .map((shot, idx) => {
      const isSelected = shot.shotId === appState.selectedShotId;
      const numStr = String(idx + 1).padStart(2, "0");
      const shortCam = (shot.cameraShot || "中景").split("(")[0].trim();
      const charTags = (shot.characterIds || [])
        .map((cid) => charMap.get(cid)?.name?.split(" ")[0] || cid)
        .slice(0, 2);
      const locName = locMap.get(shot.locationId)?.name?.replace("深夜24小时", "") || "";
      const videoUrl = getShotVideoUrl(shot);

      return `
      <article class="shot-card ${isSelected ? "selected" : ""}" data-shot-id="${escapeHtml(shot.shotId)}">
        <div class="shot-viewport">
          <video src="${escapeHtml(videoUrl)}" muted loop playsinline preload="metadata"></video>
          <div class="shot-overlay-tl">
            <span class="glass-badge ${isSelected ? "active-num" : ""}">${numStr}</span>
            <span class="glass-badge">${escapeHtml(shot.sceneId)}</span>
          </div>
          <div class="shot-overlay-tr">
            <div class="shot-quick-actions">
              <button type="button" class="shot-icon-btn" data-action="move-up" data-shot-id="${escapeHtml(shot.shotId)}" title="上移镜头">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"></polyline></svg>
              </button>
              <button type="button" class="shot-icon-btn" data-action="move-down" data-shot-id="${escapeHtml(shot.shotId)}" title="下移镜头">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>
              <button type="button" class="shot-icon-btn" data-action="rerender" data-shot-id="${escapeHtml(shot.shotId)}" title="重绘本镜">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
              </button>
            </div>
            <span class="glass-badge">v${shot.version || 1}</span>
          </div>
          <div class="shot-overlay-bl">
            <span class="glass-badge">${escapeHtml(shortCam)}</span>
          </div>
          <div class="shot-overlay-br">
            <span class="glass-badge">${Number(shot.durationSec || 6).toFixed(1)}s</span>
          </div>
        </div>
        <div class="shot-body">
          <div class="shot-head-row">
            <h4 class="shot-title-text">${escapeHtml(shot.title)}</h4>
            <div class="shot-asset-tags">
              ${charTags.map((t) => `<span class="micro-tag">${escapeHtml(t)}</span>`).join("")}
              ${locName ? `<span class="micro-tag">${escapeHtml(locName.slice(0, 6))}</span>` : ""}
            </div>
          </div>
          <p class="shot-dialogue-line">${escapeHtml(shot.subtitleText || shot.videoPrompt)}</p>
        </div>
      </article>
    `;
    })
    .join("");

  // 绑定卡片交互与悬停静音预览
  grid.querySelectorAll(".shot-card").forEach((card) => {
    const shotId = card.getAttribute("data-shot-id");
    const vid = card.querySelector("video");

    card.addEventListener("mouseenter", () => {
      if (vid && vid.paused) {
        vid.play().catch(() => {});
      }
    });
    card.addEventListener("mouseleave", () => {
      if (vid && !vid.paused) {
        vid.pause();
        vid.currentTime = 0;
      }
    });

    card.addEventListener("click", (e) => {
      const actionBtn = e.target.closest("[data-action]");
      if (actionBtn) {
        e.stopPropagation();
        const act = actionBtn.getAttribute("data-action");
        if (act === "move-up") handleMoveShot(shotId, "up");
        else if (act === "move-down") handleMoveShot(shotId, "down");
        else if (act === "rerender") {
          selectShot(shotId, false);
          handleRerenderSelectedShot(false);
        }
        return;
      }
      selectShot(shotId, true);
    });
  });
}

function renderComposerAndInspector() {
  const shot = getSelectedShot();
  const p = appState.project;
  if (!shot || !p) return;

  const idx = p.shots.findIndex((s) => s.shotId === shot.shotId);
  const numStr = String(idx + 1).padStart(2, "0");

  // 底部生成舱更新
  $("composer-shot-badge").textContent = `${numStr} · ${shot.title}`;
  const linkedChars = (shot.characterIds || [])
    .map((id) => p.characters.find((c) => c.characterId === id)?.name?.split(" ")[0] || id)
    .join(" / ");
  const linkedLoc =
    p.locations.find((l) => l.locationId === shot.locationId)?.name?.replace("深夜24小时", "") || "";
  $("composer-anchor-hint").textContent = `已锁定锚点：${linkedChars || "无"} · ${linkedLoc}`;

  $("shot-video-prompt").value = shot.videoPrompt || "";
  $("pill-duration-label").textContent = `${shot.durationSec || 6}s`;
  $("shot-visual-grade").value = shot.visualGrade || "default";
  $("shot-motion-effect").value = shot.motionEffect || "default";

  // 绑定真实首帧与尾帧画面预览
  const kfUrl = getShotVideoUrl(shot);
  const startVid = $("video-start-frame");
  const endVid = $("video-end-frame");
  const endTimestamp = Math.max(1, (Number(shot.durationSec) || 6) - 0.8).toFixed(1);
  if (startVid && startVid.getAttribute("data-src") !== `${kfUrl}#t=0.1`) {
    startVid.setAttribute("data-src", `${kfUrl}#t=0.1`);
    startVid.src = `${kfUrl}#t=0.1`;
  }
  if (endVid && endVid.getAttribute("data-src") !== `${kfUrl}#t=${endTimestamp}`) {
    endVid.setAttribute("data-src", `${kfUrl}#t=${endTimestamp}`);
    endVid.src = `${kfUrl}#t=${endTimestamp}`;
  }

  // 右侧场记检查器更新
  $("inspector-shot-code").textContent = `SHOT ${numStr} · ${shot.sceneId}`;
  $("shot-title-input").value = shot.title || "";
  $("shot-duration-input").value = shot.durationSec || 6;
  $("shot-camera-shot").value = shot.cameraShot || "";
  $("shot-camera-angle").value = shot.cameraAngle || "";
  $("shot-camera-movement").value = shot.cameraMovement || "";
  $("shot-subtitle-input").value = shot.subtitleText || "";
  $("shot-audio-input").value = shot.audioCue || "";
  $("shot-start-frame-input").value = shot.startFrameDesc || "";
  $("shot-end-frame-input").value = shot.endFrameDesc || "";
}

function renderTimelineAndMonitor(autoPlay = false) {
  const p = appState.project;
  const shot = getSelectedShot();
  if (!p || !shot) return;

  const track = $("timeline-track");
  if (track) {
    track.innerHTML = p.shots
      .map((s, idx) => {
        const isSelected = s.shotId === shot.shotId;
        const numStr = String(idx + 1).padStart(2, "0");
        return `
        <button
          type="button"
          class="timeline-clip ${isSelected ? "active" : ""}"
          style="flex: ${Math.max(Number(s.durationSec) || 6, 3)}"
          data-shot-id="${escapeHtml(s.shotId)}"
          title="${escapeHtml(s.shotId)} · ${escapeHtml(s.title)} (${s.durationSec}s)"
        >${numStr}</button>
      `;
      })
      .join("");

    track.querySelectorAll(".timeline-clip").forEach((clip) => {
      clip.addEventListener("click", () => {
        const id = clip.getAttribute("data-shot-id");
        selectShot(id, true);
      });
    });
  }

  // 时间码计算
  const shotIdx = p.shots.findIndex((s) => s.shotId === shot.shotId);
  const elapsedBefore = p.shots
    .slice(0, Math.max(0, shotIdx))
    .reduce((acc, s) => acc + (Number(s.durationSec) || 0), 0);
  const totalSec = p.shots.reduce((acc, s) => acc + (Number(s.durationSec) || 0), 0);
  const fmt = (sec) => {
    const m = Math.floor(sec / 60);
    const r = Math.floor(sec % 60);
    return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
  };
  $("timeline-timecode").textContent = `${fmt(elapsedBefore + (Number(shot.durationSec) || 0))} / ${fmt(totalSec)}`;

  const player = $("main-video-player");
  const hudShot = $("player-hud-shot");
  const hudMode = $("player-hud-mode");
  const subOverlay = $("player-subtitle-overlay");

  if (appState.playerMode === "episode" && p.lastExport?.fileName) {
    hudShot.textContent = `EPISODE · ${p.shots.length} SHOTS`;
    hudMode.textContent = `全集连播 · ${totalSec}s`;
    subOverlay.textContent = "";
    const epUrl = getEpisodeExportUrl(p.lastExport, false);
    if (player.getAttribute("data-src") !== epUrl) {
      player.setAttribute("data-src", epUrl);
      player.src = epUrl;
    }
  } else {
    const numStr = String(shotIdx + 1).padStart(2, "0");
    const totalStr = String(p.shots.length).padStart(2, "0");
    hudShot.textContent = `${numStr} / ${totalStr}`;
    hudMode.textContent = `单镜预览 · v${shot.version || 1}`;
    subOverlay.textContent = shot.subtitleText || "";
    const sUrl = getShotVideoUrl(shot);
    if (player.getAttribute("data-src") !== sUrl) {
      player.setAttribute("data-src", sUrl);
      player.src = sUrl;
    }
  }

  if (autoPlay) {
    player.play().catch(() => {});
  }
}

function selectShot(shotId, autoPlay = false) {
  appState.selectedShotId = shotId;
  appState.sequencePlaying = false;
  appState.playerMode = "single";
  $("btn-mode-single")?.classList.add("active");
  $("btn-mode-episode")?.classList.remove("active");
  renderStoryboardGallery();
  renderComposerAndInspector();
  renderTimelineAndMonitor(autoPlay);
}

/* =========================================================
   视图 02：剧本与拆解室渲染
   ========================================================= */
function renderScriptView() {
  const p = appState.project;
  if (!p) return;

  const editor = $("script-editor-textarea");
  if (editor && document.activeElement !== editor) {
    editor.value = p.scriptText || "";
  }

  const list = $("script-breakdown-list");
  if (!list) return;

  list.innerHTML = (p.shots || [])
    .map((shot, idx) => {
      const numStr = String(idx + 1).padStart(2, "0");
      return `
      <div class="breakdown-beat-card" data-shot-id="${escapeHtml(shot.shotId)}">
        <div class="beat-left">
          <div class="beat-title-row">
            <span class="beat-code">SHOT ${numStr} · ${escapeHtml(shot.sceneId)}</span>
            <span class="beat-name">${escapeHtml(shot.title)}</span>
          </div>
          <p class="beat-sub">${escapeHtml(shot.subtitleText || shot.videoPrompt)}</p>
        </div>
        <span class="telemetry-pill">${Number(shot.durationSec || 6)}s · ${escapeHtml((shot.cameraShot || "中景").split("(")[0].trim())}</span>
      </div>
    `;
    })
    .join("");

  list.querySelectorAll(".breakdown-beat-card").forEach((card) => {
    card.addEventListener("click", () => {
      const id = card.getAttribute("data-shot-id");
      selectShot(id, true);
      switchView("storyboard");
    });
  });
}

/* =========================================================
   视图 03：角色与场景设定库渲染
   ========================================================= */
function renderBibleView() {
  const p = appState.project;
  if (!p) return;

  // 1. 角色卡片条 (展示关联镜头的真实电影画面参考帧)
  const charStrip = $("character-cards-strip");
  if (charStrip) {
    charStrip.innerHTML = (p.characters || [])
      .map((c) => {
        const isActive = c.characterId === appState.selectedCharacterId;
        const refShot =
          (p.shots || []).find((s) =>
            c.characterId === "CHAR-CLERK"
              ? s.shotId === "SHOT-002"
              : s.characterIds?.includes(c.characterId),
          ) || p.shots?.[0];
        const refVideoUrl = refShot ? getShotVideoUrl(refShot) : "";
        return `
        <button type="button" class="asset-visual-card ${isActive ? "active" : ""}" data-char-id="${escapeHtml(c.characterId)}">
          <div class="asset-card-banner">
            ${refVideoUrl ? `<video src="${escapeHtml(refVideoUrl)}" muted playsinline preload="metadata"></video>` : ""}
            <span class="asset-banner-badge">角色设定锁</span>
          </div>
          <div class="asset-card-body">
            <span class="asset-card-title">${escapeHtml(c.name)}</span>
            <span class="asset-card-meta">${escapeHtml(c.speciesOrAge)}</span>
          </div>
        </button>
      `;
      })
      .join("");

    charStrip.querySelectorAll(".asset-visual-card").forEach((btn) => {
      btn.addEventListener("click", () => {
        appState.selectedCharacterId = btn.getAttribute("data-char-id");
        appState.selectedLookIndex = 0;
        renderBibleView();
      });
    });
  }

  // 填充角色表单
  const charSelect = $("character-select");
  if (charSelect) {
    charSelect.innerHTML = (p.characters || [])
      .map(
        (c) =>
          `<option value="${escapeHtml(c.characterId)}" ${c.characterId === appState.selectedCharacterId ? "selected" : ""}>${escapeHtml(c.name)}</option>`,
      )
      .join("");
  }

  const activeChar =
    (p.characters || []).find((c) => c.characterId === appState.selectedCharacterId) ||
    p.characters?.[0];

  if (activeChar) {
    $("char-name-input").value = activeChar.name || "";
    $("char-species-input").value = activeChar.speciesOrAge || "";
    $("char-anchors-input").value = activeChar.identityAnchors || "";
    $("char-negative-input").value = activeChar.negativePrompt || "";

    const looks = activeChar.looks || [];
    const lookSelect = $("char-look-select");
    if (lookSelect) {
      lookSelect.innerHTML = looks
        .map(
          (lk, i) =>
            `<option value="${i}" ${i === appState.selectedLookIndex ? "selected" : ""}>${escapeHtml(lk.name)}</option>`,
        )
        .join("");
    }
    const activeLook = looks[appState.selectedLookIndex] || looks[0];
    $("char-costume-input").value = activeLook?.costumeAnchors || "";
  }

  // 2. 场景卡片条 (展示关联场景的真实电影环境画面参考帧)
  const locStrip = $("location-cards-strip");
  if (locStrip) {
    locStrip.innerHTML = (p.locations || [])
      .map((l) => {
        const isActive = l.locationId === appState.selectedLocationId;
        const refShot =
          (p.shots || []).find((s) =>
            l.locationId === "LOC-STORE-INT"
              ? s.shotId === "SHOT-004"
              : s.shotId === "SHOT-008" || s.locationId === l.locationId,
          ) || p.shots?.[0];
        const refVideoUrl = refShot ? getShotVideoUrl(refShot) : "";
        return `
        <button type="button" class="asset-visual-card ${isActive ? "active" : ""}" data-loc-id="${escapeHtml(l.locationId)}">
          <div class="asset-card-banner">
            ${refVideoUrl ? `<video src="${escapeHtml(refVideoUrl)}" muted playsinline preload="metadata"></video>` : ""}
            <span class="asset-banner-badge">场景光影锁</span>
          </div>
          <div class="asset-card-body">
            <span class="asset-card-title">${escapeHtml(l.name)}</span>
            <span class="asset-card-meta">${escapeHtml(l.timeOfDay)} · ${escapeHtml(l.weather)}</span>
          </div>
        </button>
      `;
      })
      .join("");

    locStrip.querySelectorAll(".asset-visual-card").forEach((btn) => {
      btn.addEventListener("click", () => {
        appState.selectedLocationId = btn.getAttribute("data-loc-id");
        appState.selectedViewIndex = 0;
        renderBibleView();
      });
    });
  }

  // 填充场景表单
  const locSelect = $("location-select");
  if (locSelect) {
    locSelect.innerHTML = (p.locations || [])
      .map(
        (l) =>
          `<option value="${escapeHtml(l.locationId)}" ${l.locationId === appState.selectedLocationId ? "selected" : ""}>${escapeHtml(l.name)}</option>`,
      )
      .join("");
  }

  const activeLoc =
    (p.locations || []).find((l) => l.locationId === appState.selectedLocationId) ||
    p.locations?.[0];

  if (activeLoc) {
    $("loc-name-input").value = activeLoc.name || "";
    $("loc-weather-input").value = `${activeLoc.timeOfDay || ""} · ${activeLoc.weather || ""}`;
    $("loc-anchors-input").value = activeLoc.visualAnchors || "";
    $("loc-lighting-input").value = activeLoc.lightingMood || "";

    const views = activeLoc.views || [];
    const viewSelect = $("loc-view-select");
    if (viewSelect) {
      viewSelect.innerHTML = views
        .map(
          (vw, i) =>
            `<option value="${i}" ${i === appState.selectedViewIndex ? "selected" : ""}>${escapeHtml(vw.direction)}</option>`,
        )
        .join("");
    }
  }
}

/* =========================================================
   渲染全部界面
   ========================================================= */
function renderAll() {
  if (!appState.project) return;
  renderTopbar();
  renderRailAnchors();
  renderStoryboardGallery();
  renderComposerAndInspector();
  renderTimelineAndMonitor(false);
  renderScriptView();
  renderBibleView();
}

/* =========================================================
   后端业务操作处理
   ========================================================= */
function setLoading(active, text = "正在处理...") {
  appState.busy = active;
  const overlay = $("player-loading-overlay");
  const label = $("player-loading-text");
  if (overlay && label) {
    label.textContent = text;
    overlay.classList.toggle("hidden", !active);
  }
  const rerenderBtn = $("btn-rerender-shot");
  const exportBtn = $("btn-export-episode");
  if (rerenderBtn) rerenderBtn.disabled = active;
  if (exportBtn) exportBtn.disabled = active;
}

function collectSelectedShotPatch() {
  return {
    title: $("shot-title-input").value.trim(),
    durationSec: Number($("shot-duration-input").value) || 6,
    cameraShot: $("shot-camera-shot").value.trim(),
    cameraAngle: $("shot-camera-angle").value.trim(),
    cameraMovement: $("shot-camera-movement").value.trim(),
    subtitleText: $("shot-subtitle-input").value.trim(),
    audioCue: $("shot-audio-input").value.trim(),
    startFrameDesc: $("shot-start-frame-input").value.trim(),
    endFrameDesc: $("shot-end-frame-input").value.trim(),
    videoPrompt: $("shot-video-prompt").value.trim(),
    visualGrade: $("shot-visual-grade").value,
    motionEffect: $("shot-motion-effect").value,
  };
}

async function handleSaveShotMeta() {
  const shot = getSelectedShot();
  if (!shot || appState.busy) return;
  try {
    const patch = collectSelectedShotPatch();
    const res = await apiRequest(`/shots/${encodeURIComponent(shot.shotId)}`, {
      method: "PUT",
      body: patch,
    });
    appState.project = res.state;
    renderAll();
    showToast(`已保存镜头 ${shot.shotId} 场记与摄影机参数`);
  } catch (err) {
    showToast(`保存失败：${err.message}`);
  }
}

async function handleRerenderSelectedShot(simulateFailure = false) {
  const shot = getSelectedShot();
  if (!shot || appState.busy) return;
  setLoading(true, `正在重绘镜头 ${shot.shotId} (${shot.title})...`);
  try {
    const patch = collectSelectedShotPatch();
    const res = await apiRequest(`/shots/${encodeURIComponent(shot.shotId)}/rerender`, {
      method: "POST",
      body: {
        ...patch,
        simulateFailure,
      },
    });
    appState.project = res.state;
    renderAll();
    renderTimelineAndMonitor(true);
    if (simulateFailure) {
      showToast(`已触发镜头 ${shot.shotId} 异常演练，点击「重绘当前镜头」可立即恢复`);
    } else {
      showToast(`镜头 ${shot.shotId} 已完成独立重绘 (v${res.shot?.version || ""})`);
    }
  } catch (err) {
    showToast(`渲染失败：${err.message}`);
  } finally {
    setLoading(false);
  }
}

async function handleMoveShot(shotId, direction) {
  if (appState.busy || !appState.project?.shots?.length) return;
  const ids = appState.project.shots.map((s) => s.shotId);
  const idx = ids.indexOf(shotId);
  if (idx === -1) return;
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= ids.length) return;
  const nextOrder = [...ids];
  [nextOrder[idx], nextOrder[swapIdx]] = [nextOrder[swapIdx], nextOrder[idx]];

  try {
    const res = await apiRequest("/shots/reorder", {
      method: "POST",
      body: { shotOrder: nextOrder },
    });
    appState.project = res.state;
    renderAll();
  } catch (err) {
    showToast(`调整顺序失败：${err.message}`);
  }
}

async function handleExportEpisode() {
  if (appState.busy) return;
  setLoading(true, "正在按时间轴顺序合成全集 MP4 成片...");
  try {
    const res = await apiRequest("/episode/export", {
      method: "POST",
      body: {},
    });
    appState.project = res.state;
    appState.playerMode = "episode";
    $("btn-mode-single")?.classList.remove("active");
    $("btn-mode-episode")?.classList.add("active");
    renderAll();
    renderTimelineAndMonitor(true);
    showToast("全集 MP4 成片合成完毕，已在监视器开启连播");
  } catch (err) {
    showToast(`合成导出失败：${err.message}`);
  } finally {
    setLoading(false);
  }
}

async function handleParseScript() {
  if (appState.busy) return;
  const scriptText = $("script-editor-textarea").value;
  setLoading(true, "正在智能拆解剧本为角色、场景与分镜表...");
  try {
    const res = await apiRequest("/script/breakdown", {
      method: "POST",
      body: { scriptText },
    });
    appState.project = res.state;
    renderAll();
    showToast("剧本拆解完成，已同步更新分镜故事板");
  } catch (err) {
    showToast(`剧本拆解失败：${err.message}`);
  } finally {
    setLoading(false);
  }
}

async function handleSaveCharacters() {
  const p = appState.project;
  if (!p || appState.busy) return;
  const char = p.characters.find((c) => c.characterId === appState.selectedCharacterId);
  if (!char) return;

  char.name = $("char-name-input").value.trim();
  char.speciesOrAge = $("char-species-input").value.trim();
  char.identityAnchors = $("char-anchors-input").value.trim();
  char.negativePrompt = $("char-negative-input").value.trim();
  const lk = char.looks?.[appState.selectedLookIndex];
  if (lk) {
    lk.costumeAnchors = $("char-costume-input").value.trim();
  }

  try {
    const res = await apiRequest("/consistency", {
      method: "PUT",
      body: { characters: p.characters },
    });
    appState.project = res.state;
    renderAll();
    showToast("已保存角色设定卡并同步至所有关联镜头 Prompt");
  } catch (err) {
    showToast(`保存角色失败：${err.message}`);
  }
}

async function handleSaveLocations() {
  const p = appState.project;
  if (!p || appState.busy) return;
  const loc = p.locations.find((l) => l.locationId === appState.selectedLocationId);
  if (!loc) return;

  loc.name = $("loc-name-input").value.trim();
  const weatherParts = $("loc-weather-input").value.split("·").map((s) => s.trim());
  if (weatherParts.length >= 2) {
    loc.timeOfDay = weatherParts[0];
    loc.weather = weatherParts.slice(1).join(" · ");
  } else {
    loc.weather = $("loc-weather-input").value.trim();
  }
  loc.visualAnchors = $("loc-anchors-input").value.trim();
  loc.lightingMood = $("loc-lighting-input").value.trim();

  try {
    const res = await apiRequest("/consistency", {
      method: "PUT",
      body: { locations: p.locations },
    });
    appState.project = res.state;
    renderAll();
    showToast("已保存场景光影设定并同步至所有关联镜头 Prompt");
  } catch (err) {
    showToast(`保存场景失败：${err.message}`);
  }
}

async function openCompiledModal() {
  const shot = getSelectedShot();
  const p = appState.project;
  if (!shot || !p) return;

  $("compiled-prompt-preview").textContent = shot.compiledPrompt || shot.videoPrompt || "";

  // 渲染版本与导出记录
  const auditList = $("audit-log-list");
  if (auditList) {
    auditList.innerHTML = (p.auditLog || [])
      .slice(0, 12)
      .map(
        (entry) => `
      <div class="audit-item">
        <div class="audit-item-head">
          <span>${escapeHtml(entry.action)} ${entry.targetShotId ? `· ${escapeHtml(entry.targetShotId)}` : ""}</span>
          <span>${escapeHtml((entry.timestamp || "").replace("T", " ").slice(0, 19))}</span>
        </div>
        <div>${escapeHtml(entry.summary)}</div>
      </div>
    `,
      )
      .join("");
  }

  $("compiled-modal")?.classList.remove("hidden");
}

/* =========================================================
   多语言与主题切换
   ========================================================= */
function applyLanguage() {
  const dict = I18N[appState.lang] || I18N.zh;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });
  $("lang-label").textContent = appState.lang === "zh" ? "EN" : "中文";
  $("theme-label").textContent =
    appState.theme === "dark" ? dict.themeLabelDark : dict.themeLabelLight;
}

function toggleTheme() {
  appState.theme = appState.theme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", appState.theme);
  applyLanguage();
}

/* =========================================================
   初始化与事件绑定
   ========================================================= */
async function initStudio() {
  // 1. 左侧主视图切换
  ["storyboard", "script", "bible"].forEach((viewName) => {
    $(`nav-view-${viewName}`)?.addEventListener("click", () => {
      switchView(viewName);
    });
  });

  $("btn-jump-bible")?.addEventListener("click", () => switchView("bible"));
  $("btn-script-to-storyboard")?.addEventListener("click", () => switchView("storyboard"));

  // 2. 画廊 / 场记列表布局切换
  $("btn-layout-grid")?.addEventListener("click", () => {
    appState.layoutMode = "grid";
    $("btn-layout-grid")?.classList.add("active");
    $("btn-layout-list")?.classList.remove("active");
    renderStoryboardGallery();
  });
  $("btn-layout-list")?.addEventListener("click", () => {
    appState.layoutMode = "list";
    $("btn-layout-list")?.classList.add("active");
    $("btn-layout-grid")?.classList.remove("active");
    renderStoryboardGallery();
  });

  // 3. 首尾帧点击定位到场记首尾帧输入框
  $("btn-keyframe-start")?.addEventListener("click", () => {
    $("shot-start-frame-input")?.focus();
  });
  $("btn-keyframe-end")?.addEventListener("click", () => {
    $("shot-end-frame-input")?.focus();
  });

  // 4. 镜头操作与全集导出
  $("btn-save-shot-meta")?.addEventListener("click", handleSaveShotMeta);
  $("btn-rerender-shot")?.addEventListener("click", () => handleRerenderSelectedShot(false));
  $("btn-export-episode")?.addEventListener("click", handleExportEpisode);
  $("btn-parse-script")?.addEventListener("click", handleParseScript);
  $("btn-save-characters")?.addEventListener("click", handleSaveCharacters);
  $("btn-save-locations")?.addEventListener("click", handleSaveLocations);

  // 5. 角色与场景下拉框联动
  $("character-select")?.addEventListener("change", (e) => {
    appState.selectedCharacterId = e.target.value;
    appState.selectedLookIndex = 0;
    renderBibleView();
  });
  $("char-look-select")?.addEventListener("change", (e) => {
    appState.selectedLookIndex = Number(e.target.value) || 0;
    renderBibleView();
  });
  $("location-select")?.addEventListener("change", (e) => {
    appState.selectedLocationId = e.target.value;
    appState.selectedViewIndex = 0;
    renderBibleView();
  });
  $("loc-view-select")?.addEventListener("change", (e) => {
    appState.selectedViewIndex = Number(e.target.value) || 0;
    renderBibleView();
  });

  // 6. 监视器单镜 / 全集连播与前后跳镜
  $("btn-mode-single")?.addEventListener("click", () => {
    appState.playerMode = "single";
    appState.sequencePlaying = false;
    $("btn-mode-single")?.classList.add("active");
    $("btn-mode-episode")?.classList.remove("active");
    renderTimelineAndMonitor(true);
  });

  $("btn-mode-episode")?.addEventListener("click", () => {
    if (appState.project?.lastExport?.fileName) {
      appState.playerMode = "episode";
      $("btn-mode-episode")?.classList.add("active");
      $("btn-mode-single")?.classList.remove("active");
      renderTimelineAndMonitor(true);
    } else {
      startSequentialPlay();
    }
  });

  $("btn-play-all")?.addEventListener("click", startSequentialPlay);

  $("btn-prev-shot")?.addEventListener("click", () => {
    const shots = appState.project?.shots || [];
    const idx = shots.findIndex((s) => s.shotId === appState.selectedShotId);
    if (idx > 0) selectShot(shots[idx - 1].shotId, true);
  });

  $("btn-next-shot")?.addEventListener("click", () => {
    const shots = appState.project?.shots || [];
    const idx = shots.findIndex((s) => s.shotId === appState.selectedShotId);
    if (idx >= 0 && idx < shots.length - 1) selectShot(shots[idx + 1].shotId, true);
  });

  $("main-video-player")?.addEventListener("ended", () => {
    if (!appState.sequencePlaying) return;
    const shots = appState.project?.shots || [];
    const nextIdx = appState.sequenceIndex + 1;
    if (nextIdx < shots.length) {
      appState.sequenceIndex = nextIdx;
      appState.selectedShotId = shots[nextIdx].shotId;
      renderStoryboardGallery();
      renderComposerAndInspector();
      renderTimelineAndMonitor(true);
    } else {
      appState.sequencePlaying = false;
    }
  });

  // 7. 弹窗控制
  const openProvider = () => {
    if (appState.project?.providerConfig) {
      $("provider-mode-select").value = appState.project.providerConfig.mode || "studio-ffmpeg";
      $("provider-seedance-model").value =
        appState.project.providerConfig.seedanceModel || "doubao-seedance-1-0-pro-250528";
      $("provider-minimax-model").value =
        appState.project.providerConfig.minimaxModel || "MiniMax-Hailuo-02";
      $("provider-confirm-toggle").checked =
        appState.project.providerConfig.confirmBeforeGenerate !== false;
    }
    $("provider-modal")?.classList.remove("hidden");
  };
  $("btn-open-provider")?.addEventListener("click", openProvider);
  $("btn-pill-model")?.addEventListener("click", openProvider);
  $("btn-close-provider-modal")?.addEventListener("click", () => {
    $("provider-modal")?.classList.add("hidden");
  });

  $("btn-save-provider")?.addEventListener("click", async () => {
    try {
      const res = await apiRequest("/provider", {
        method: "PUT",
        body: {
          mode: $("provider-mode-select").value,
          seedanceModel: $("provider-seedance-model").value.trim(),
          minimaxModel: $("provider-minimax-model").value.trim(),
          confirmBeforeGenerate: $("provider-confirm-toggle").checked,
        },
      });
      appState.project = res.state;
      $("provider-modal")?.classList.add("hidden");
      renderAll();
      showToast("已更新视频生成引擎配置");
    } catch (err) {
      showToast(`保存配置失败：${err.message}`);
    }
  });

  $("btn-simulate-fail")?.addEventListener("click", () => {
    $("provider-modal")?.classList.add("hidden");
    handleRerenderSelectedShot(true);
  });

  $("btn-preview-compiled")?.addEventListener("click", openCompiledModal);
  $("btn-open-audit")?.addEventListener("click", openCompiledModal);
  $("btn-close-compiled-modal")?.addEventListener("click", () => {
    $("compiled-modal")?.classList.add("hidden");
  });

  // 8. 语言、主题与重置
  $("btn-lang-toggle")?.addEventListener("click", () => {
    appState.lang = appState.lang === "zh" ? "en" : "zh";
    applyLanguage();
  });

  $("btn-theme-toggle")?.addEventListener("click", toggleTheme);

  $("btn-reset-preset")?.addEventListener("click", async () => {
    if (appState.busy) return;
    setLoading(true, "正在重置《纸箱小屋》示例剧集...");
    try {
      const res = await apiRequest("/preset/reset", { method: "POST", body: {} });
      appState.project = res.state;
      appState.selectedShotId = res.state.shots?.[0]?.shotId || "SHOT-001";
      renderAll();
      showToast("已恢复《纸箱小屋》EP01 初始分镜与设定");
    } catch (err) {
      showToast(`重置失败：${err.message}`);
    } finally {
      setLoading(false);
    }
  });

  // 9. 初次拉取项目状态
  try {
    const res = await apiRequest("/state");
    appState.project = res.state;
    appState.selectedShotId = res.state?.shots?.[0]?.shotId || "SHOT-001";
    renderAll();
    applyLanguage();
  } catch (err) {
    showToast(`加载工作台状态失败：${err.message}`);
  }
}

function startSequentialPlay() {
  const shots = appState.project?.shots || [];
  if (!shots.length) return;
  appState.playerMode = "single";
  appState.sequencePlaying = true;
  appState.sequenceIndex = 0;
  appState.selectedShotId = shots[0].shotId;
  $("btn-mode-episode")?.classList.add("active");
  $("btn-mode-single")?.classList.remove("active");
  renderStoryboardGallery();
  renderComposerAndInspector();
  renderTimelineAndMonitor(true);
}

initStudio();
