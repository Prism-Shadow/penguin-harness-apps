const I18N = {
  zh: {
    metricShots: "总镜头",
    metricDuration: "总时长",
    metricIsolation: "单镜隔离校验",
    btnProviderSettings: "⚙️ 模型与生成配置",
    btnResetPreset: "↺ 重置《纸箱小屋》预置",
    btnExportEpisode: "合成并导出全集 MP4 ❯",
    tabScript: "1. 剧本与拆解",
    tabCharacters: "2. 角色设定卡",
    tabLocations: "3. 场景光影卡",
    scriptSectionTitle: "单集短剧剧本输入",
    scriptSectionDesc:
      "支持直接加载《纸箱小屋》标准剧本或输入自定义剧本，一键拆解为角色卡、场景卡与分镜表。",
    btnBreakdownScript: "✦ AI 拆解剧本为角色/场景卡与分镜表",
    charSectionTitle: "角色外观一致性设定卡",
    charSectionDesc:
      "固定角色的外貌、服装与负向锚点，保存后自动注入该角色出场的每一个分镜提示词。",
    btnSyncCharacters: "保存角色卡并同步一致性锚点至全部分镜",
    locSectionTitle: "场景空间与光影设定卡",
    locSectionDesc:
      "锁定便利店屋檐冷蓝雨夜与3200K暖黄室内光源对比，确保跨镜头环境连续一致。",
    btnSyncLocations: "保存场景卡并同步光影锚点至全部分镜",
    storyboardTitle: "结构化分镜表与时间轴排序",
    storyboardDesc:
      "点击任一镜头可独立预览、修改提示词并单镜重做；调整顺序或重做单镜绝不破坏其他镜头。",
    timelineOrderLabel: "成片时间轴顺序：",
    monitorSingleTab: "单镜头监视器",
    monitorEpisodeTab: "全集连播 / 成片预览",
    downloadShotMp4: "⬇ 下载本镜 MP4",
    exportBarTitle: "全集 MP4 成片状态：",
    btnPlaySequence: "▶ 按时间轴顺序连播",
    btnDownloadEpisode: "⬇ 下载全集 MP4",
    fieldShotTitle: "标题",
    fieldShotDuration: "时长(s)",
    fieldCameraShot: "景别",
    fieldCameraAngle: "机位",
    fieldCameraMove: "运镜",
    fieldVisualGrade: "光影调色风格 (单镜精修)",
    fieldMotionEffect: "动态运镜覆盖 (单镜精修)",
    fieldVideoPrompt: "画面生成提示词 (Video Prompt · 可局部修改重做)",
    fieldSubtitle: "台词字幕",
    fieldAudioCue: "音效",
    compiledPromptSummary: "🔗 查看完整编译 Prompt",
    btnSaveShotMeta: "仅保存参数",
    btnSimulateFail: "测试失败与重试",
    btnRerenderShot: "✦ 重新生成当前镜头 (其余镜头保持不变)",
    auditLogTitle: "🛡️ 单镜头无损重做与成片合成审计记录",
    auditVerifiedBadge: "SHA-256 隔离校验已启用",
    providerModalTitle: "视频生成引擎与接口配置",
  },
  en: {
    metricShots: "Total Shots",
    metricDuration: "Duration",
    metricIsolation: "Shot Isolation",
    btnProviderSettings: "⚙️ Engine & API Config",
    btnResetPreset: "↺ Reset Preset",
    btnExportEpisode: "Merge & Export Episode MP4 ❯",
    tabScript: "1. Script Breakdown",
    tabCharacters: "2. Character Bible",
    tabLocations: "3. Scene & Lighting",
    scriptSectionTitle: "Single-Episode Drama Script",
    scriptSectionDesc:
      "Load the Cardboard House benchmark script or paste a custom script to break down into cards & shots.",
    btnBreakdownScript: "✦ AI Breakdown Script into Cards & Storyboard",
    charSectionTitle: "Character Identity Consistency Cards",
    charSectionDesc:
      "Lock appearance, wardrobe, and negative anchors; sync automatically into every shot featuring the character.",
    btnSyncCharacters: "Save Character Cards & Sync Anchors to All Shots",
    locSectionTitle: "Location & Lighting Consistency Cards",
    locSectionDesc:
      "Lock 3200K warm doorway light vs cold rainy night contrast across all shots.",
    btnSyncLocations: "Save Scene Cards & Sync Lighting to All Shots",
    storyboardTitle: "Structured Storyboard & Timeline Order",
    storyboardDesc:
      "Select any shot to preview, edit prompt, or re-render non-destructively without affecting other shots.",
    timelineOrderLabel: "Timeline Order:",
    monitorSingleTab: "Single Shot Monitor",
    monitorEpisodeTab: "Full Episode Preview",
    downloadShotMp4: "⬇ Download Shot MP4",
    exportBarTitle: "Episode MP4 Status:",
    btnPlaySequence: "▶ Play All Sequentially",
    btnDownloadEpisode: "⬇ Download Episode MP4",
    fieldShotTitle: "Title",
    fieldShotDuration: "Dur(s)",
    fieldCameraShot: "Shot",
    fieldCameraAngle: "Angle",
    fieldCameraMove: "Move",
    fieldVisualGrade: "Color Grade Override",
    fieldMotionEffect: "Motion Override",
    fieldVideoPrompt: "Video Prompt (Editable for Single-Shot Re-render)",
    fieldSubtitle: "Subtitle",
    fieldAudioCue: "SFX Cue",
    compiledPromptSummary: "🔗 View Compiled Prompt",
    btnSaveShotMeta: "Save Params Only",
    btnSimulateFail: "Test Fail & Retry",
    btnRerenderShot: "✦ Re-render Current Shot Only",
    auditLogTitle: "🛡️ Non-Destructive Re-render & Export Audit Log",
    auditVerifiedBadge: "SHA-256 Isolation Verified",
    providerModalTitle: "Video Generation Engine & API Settings",
  },
};

const appState = {
  lang: "zh",
  theme: "dark", // "dark" | "light"
  viewMode: "grid", // "grid" | "list"
  project: null,
  capabilities: null,
  selectedShotId: "SHOT-001",
  monitorMode: "single", // "single" | "episode"
  sequentialPlaying: false,
  sequentialIndex: 0,
};

function el(id) {
  return document.getElementById(id);
}

function showBanner(message, type = "info") {
  const banner = el("status-banner");
  if (!banner) return;
  banner.textContent = message;
  banner.className = `status-banner ${type}`;
  clearTimeout(showBanner._timer);
  showBanner._timer = setTimeout(() => {
    banner.classList.add("hidden");
  }, 6000);
}

async function apiRequest(path, options = {}) {
  const res = await fetch(path, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    err.payload = data;
    throw err;
  }
  return data;
}

function formatTimecodeShort(sec) {
  const total = Math.max(0, Math.floor(Number(sec) || 0));
  const mm = String(Math.floor(total / 60)).padStart(2, "0");
  const ss = String(total % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

function formatTimecodeFrames(sec) {
  const safe = Math.max(0, Number(sec) || 0);
  const whole = Math.floor(safe);
  const frames = Math.floor((safe - whole) * 24);
  const mm = String(Math.floor(whole / 60)).padStart(2, "0");
  const ss = String(whole % 60).padStart(2, "0");
  const ff = String(frames).padStart(2, "0");
  return `TC 00:${mm}:${ss}:${ff}`;
}

function applyTranslations() {
  const dict = I18N[appState.lang] || I18N.zh;
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.getAttribute("data-i18n");
    if (dict[key]) {
      node.textContent = dict[key];
    }
  });
  const langLabel = el("lang-current-label");
  if (langLabel) {
    langLabel.textContent = appState.lang === "zh" ? "中文 / EN" : "EN / 中文";
  }
}

function applyTheme() {
  document.documentElement.setAttribute("data-studio-theme", appState.theme);
  el("app")?.setAttribute("data-studio-theme", appState.theme);
  const themeLabel = el("theme-current-label");
  if (themeLabel) {
    themeLabel.textContent =
      appState.theme === "dark" ? "深色暗房" : "浅色工作台";
  }
}

function getOrderedShots() {
  if (!appState.project || !Array.isArray(appState.project.shots)) return [];
  return [...appState.project.shots].sort((a, b) => a.order - b.order);
}

function getSelectedShot() {
  const shots = getOrderedShots();
  return (
    shots.find((s) => s.shotId === appState.selectedShotId) || shots[0] || null
  );
}

function renderHeader() {
  const p = appState.project;
  if (!p) return;
  el("project-title").textContent = p.title || "《纸箱小屋》";
  el("episode-badge").textContent = p.episodeId || "EP001";
  el("project-subtitle").textContent = p.subtitle || "";

  const cfg = p.providerConfig || {};
  const modeLabel =
    cfg.mode === "seedance"
      ? `Seedance 2.0 · ${cfg.resolution || "720p"}`
      : cfg.mode === "minimax"
        ? `MiniMax Hailuo · ${cfg.resolution || "720p"}`
        : cfg.mode === "openai-video"
          ? `OpenAI Video · ${cfg.resolution || "720p"}`
          : `Studio FFmpeg · ${cfg.resolution || "720p"}`;
  el("provider-badge").textContent = modeLabel;

  const composerModelEl = el("composer-model-label");
  if (composerModelEl) {
    composerModelEl.textContent =
      cfg.mode === "seedance"
        ? "Seedance 2.0"
        : cfg.mode === "minimax"
          ? "MiniMax Hailuo"
          : cfg.mode === "openai-video"
            ? "OpenAI Video"
            : "Seedance 2.0 / Studio FFmpeg";
  }

  const shots = getOrderedShots();
  const totalSec = shots.reduce(
    (sum, s) => sum + (Number(s.durationSec) || 0),
    0,
  );
  el("metric-shot-count").textContent = String(shots.length);
  el("metric-duration").textContent = `${totalSec}s`;
}

function renderLeftPanel() {
  const p = appState.project;
  if (!p) return;

  const scriptEl = el("script-textarea");
  if (scriptEl && document.activeElement !== scriptEl) {
    scriptEl.value = p.scriptText || "";
  }

  // Render Character Cards
  const charContainer = el("characters-list");
  if (charContainer) {
    charContainer.innerHTML = "";
    (p.characters || []).forEach((char, idx) => {
      const card = document.createElement("div");
      card.className = "consistency-card";
      card.innerHTML = `
        <div class="consistency-card-header">
          <span class="consistency-card-title">${escapeHtml(char.name)}</span>
          <span class="badge badge-amber">${escapeHtml(char.characterId)}</span>
        </div>
        <div class="section-desc">${escapeHtml(char.speciesOrAge)} · ${escapeHtml(char.summary)}</div>
        <label class="form-field">
          <span>外观一致性锚点 (Identity Anchors · 自动注入分镜)</span>
          <textarea data-char-idx="${idx}" data-field="identityAnchors" rows="3">${escapeHtml(char.identityAnchors)}</textarea>
        </label>
        <label class="form-field">
          <span>负向排除特征 (Negative Prompt)</span>
          <input type="text" data-char-idx="${idx}" data-field="negativePrompt" value="${escapeHtml(char.negativePrompt)}" />
        </label>
      `;
      charContainer.appendChild(card);
    });
  }

  // Render Location Cards
  const locContainer = el("locations-list");
  if (locContainer) {
    locContainer.innerHTML = "";
    (p.locations || []).forEach((loc, idx) => {
      const card = document.createElement("div");
      card.className = "consistency-card";
      card.innerHTML = `
        <div class="consistency-card-header">
          <span class="consistency-card-title">${escapeHtml(loc.name)}</span>
          <span class="badge badge-slate">${escapeHtml(loc.locationId)}</span>
        </div>
        <div class="section-desc">${escapeHtml(loc.timeOfDay)} · ${escapeHtml(loc.weather)}</div>
        <label class="form-field">
          <span>空间环境视觉锚点 (Visual Anchors)</span>
          <textarea data-loc-idx="${idx}" data-field="visualAnchors" rows="3">${escapeHtml(loc.visualAnchors)}</textarea>
        </label>
        <label class="form-field">
          <span>光影与色温设定 (Lighting Mood)</span>
          <input type="text" data-loc-idx="${idx}" data-field="lightingMood" value="${escapeHtml(loc.lightingMood)}" />
        </label>
      `;
      locContainer.appendChild(card);
    });
  }
}

function renderFilmstrip() {
  const track = el("filmstrip-track");
  if (!track) return;
  const shots = getOrderedShots();
  track.innerHTML = "";

  shots.forEach((shot) => {
    const isSelected = shot.shotId === appState.selectedShotId;
    const isCool = shot.locationId === "LOC-STORE-EXT";
    const clip = document.createElement("div");
    clip.className = `filmstrip-segment ${isCool ? "scene-cool" : ""} ${isSelected ? "active" : ""}`;
    clip.innerHTML = `
      <div class="filmstrip-seg-top">
        <span>#${String(shot.order).padStart(2, "0")}</span>
        <span>${shot.durationSec}s · v${shot.version}</span>
      </div>
      <div class="filmstrip-seg-title">${escapeHtml(shot.title)}</div>
    `;
    clip.addEventListener("click", () => {
      selectShot(shot.shotId);
    });
    track.appendChild(clip);
  });
}

function renderStoryboardCenter() {
  const shots = getOrderedShots();
  const listEl = el("shot-cards-list");
  if (!listEl) return;
  listEl.classList.toggle("grid-view", appState.viewMode === "grid");
  listEl.innerHTML = "";

  if (shots.length > 0 && el("timeline-order-code")) {
    el("timeline-order-code").textContent = shots
      .map((s) => s.shotId)
      .join(" → ");
  }

  let runningSec = 0;

  shots.forEach((shot, idx) => {
    const startSec = runningSec;
    const durSec = Number(shot.durationSec) || 6;
    const endSec = startSec + durSec;
    runningSec = endSec;

    const isSelected = shot.shotId === appState.selectedShotId;
    const isCool = shot.locationId === "LOC-STORE-EXT";
    const statusClass =
      shot.status === "failed"
        ? "status-failed"
        : shot.status === "generating"
          ? "status-generating"
          : "status-ready";
    const statusLabel =
      shot.status === "failed"
        ? "失败·待重试"
        : shot.status === "generating"
          ? "生成中..."
          : `已就绪 · v${shot.version}`;

    const videoThumbUrl = `../api/videos/${shot.shotId}?v=${shot.version}_${(shot.videoSha256 || "").slice(0, 8)}#t=0.4`;

    const card = document.createElement("div");
    card.className = `shot-card ${isSelected ? "selected" : ""}`;
    card.setAttribute("data-shot-id", shot.shotId);
    card.innerHTML = `
      <div class="shot-card-body">
        <div class="shot-thumb-stage ${isCool ? "mood-cool" : "mood-warm"}">
          <video
            class="shot-thumb-video"
            src="${videoThumbUrl}"
            muted
            playsinline
            preload="metadata"
          ></video>
          <div class="shot-thumb-overlay-top">
            <span class="shot-order-badge">#${String(shot.order).padStart(2, "0")} · ${escapeHtml(shot.shotId)}</span>
            <span class="status-pill ${statusClass}">${statusLabel}</span>
          </div>
          <div class="shot-thumb-overlay-bottom">
            <span class="shot-timecode-chip">${formatTimecodeShort(startSec)} - ${formatTimecodeShort(endSec)} · ${escapeHtml((shot.cameraShot || "").split(" ")[0])}</span>
            <span class="shot-duration-chip">${durSec}s</span>
          </div>
        </div>

        <div class="shot-content-col">
          <div class="shot-card-top">
            <span class="shot-title-text">${escapeHtml(shot.title)}</span>
            <div class="shot-card-actions">
              <button type="button" class="btn btn-xs btn-ghost js-move-up" data-idx="${idx}" ${idx === 0 ? "disabled" : ""} title="上移镜头">↑</button>
              <button type="button" class="btn btn-xs btn-ghost js-move-down" data-idx="${idx}" ${idx === shots.length - 1 ? "disabled" : ""} title="下移镜头">↓</button>
              <button type="button" class="btn btn-xs btn-secondary js-quick-rerender" data-shot-id="${shot.shotId}">单镜重做</button>
            </div>
          </div>

          <div class="shot-meta-row">
            <span class="shot-camera-pill">${escapeHtml(shot.cameraShot)}</span>
            <span class="shot-camera-pill">${escapeHtml(shot.cameraAngle)}</span>
            <span class="shot-camera-pill">${escapeHtml(shot.cameraMovement)}</span>
            ${shot.visualGrade && shot.visualGrade !== "default" ? `<span class="badge badge-amber">调色: ${escapeHtml(shot.visualGrade)}</span>` : ""}
          </div>

          <div class="shot-subtitle-line">“${escapeHtml(shot.subtitleText)}”</div>

          <div class="shot-card-bottom">
            <span>SHA-256: <code>${escapeHtml((shot.videoSha256 || "").slice(0, 12))}</code> · ${(shot.videoSizeBytes / 1024).toFixed(0)} KB</span>
          </div>
        </div>
      </div>
    `;

    const thumbVideo = card.querySelector(".shot-thumb-video");
    if (thumbVideo) {
      card.addEventListener("mouseenter", () => {
        thumbVideo.play().catch(() => {});
      });
      card.addEventListener("mouseleave", () => {
        thumbVideo.pause();
        try {
          thumbVideo.currentTime = 0.4;
        } catch {
          // ignore if metadata not yet loaded
        }
      });
    }

    card.addEventListener("click", (e) => {
      if (e.target.closest("button")) return;
      selectShot(shot.shotId);
    });

    listEl.appendChild(card);
  });

  listEl.querySelectorAll(".js-move-up").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const idx = Number(btn.getAttribute("data-idx"));
      moveShotOrder(idx, idx - 1);
    });
  });

  listEl.querySelectorAll(".js-move-down").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const idx = Number(btn.getAttribute("data-idx"));
      moveShotOrder(idx, idx + 1);
    });
  });

  listEl.querySelectorAll(".js-quick-rerender").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const shotId = btn.getAttribute("data-shot-id");
      selectShot(shotId);
      openConfirmOrRerender();
    });
  });

  renderFilmstrip();
}

function renderRightInspector(reloadVideo = false) {
  const shot = getSelectedShot();
  if (!shot) return;

  el("inspector-shot-title").textContent = `${shot.shotId} · ${shot.title}`;
  el("inspector-shot-hash").textContent =
    (shot.videoSha256 || "").slice(0, 16) || "pending";
  el("inspector-shot-provider").textContent = shot.lastProvider || "preset";

  const statusPill = el("inspector-status-pill");
  if (shot.status === "failed") {
    statusPill.className = "status-pill status-failed";
    statusPill.textContent = "生成失败 · 待重试";
    el("shot-error-box").classList.remove("hidden");
    el("shot-error-msg").textContent = shot.lastError || "视频生成异常";
  } else if (shot.status === "generating") {
    statusPill.className = "status-pill status-generating";
    statusPill.textContent = "生成中...";
    el("shot-error-box").classList.add("hidden");
  } else {
    statusPill.className = "status-pill status-ready";
    statusPill.textContent = `已就绪 · v${shot.version}`;
    el("shot-error-box").classList.add("hidden");
  }

  el("input-shot-title").value = shot.title || "";
  el("input-shot-duration").value = String(shot.durationSec || 6);
  el("input-camera-shot").value = shot.cameraShot || "";
  el("input-camera-angle").value = shot.cameraAngle || "";
  el("input-camera-move").value = shot.cameraMovement || "";
  el("select-visual-grade").value = shot.visualGrade || "default";
  el("select-motion-effect").value = shot.motionEffect || "default";
  el("input-video-prompt").value = shot.videoPrompt || "";
  el("input-subtitle-text").value = shot.subtitleText || "";
  el("input-audio-cue").value = shot.audioCue || "";
  el("preview-compiled-prompt").textContent = shot.compiledPrompt || "";

  const cfg = appState.project?.providerConfig || {};
  const specsEl = el("composer-specs-label");
  if (specsEl) {
    specsEl.textContent = `16:9 · ${shot.durationSec || 6}秒 · ${cfg.resolution || "720p"}`;
  }

  const hudCodeEl = el("video-hud-code");
  if (hudCodeEl) {
    const resDim = cfg.resolution === "1080p" ? "1920×1080" : "1280×720";
    hudCodeEl.textContent =
      appState.monitorMode === "episode"
        ? `REC ● EP001 MASTER · ${resDim} · 24fps`
        : `REC ● ${shot.shotId} · ${resDim} · 24fps`;
  }

  // Update monitor badge & download link
  el("monitor-shot-badge").textContent =
    appState.monitorMode === "episode"
      ? `EP001 全集连播`
      : `${shot.shotId} · v${shot.version}`;
  el("link-download-current-shot").href =
    `../api/videos/${shot.shotId}?download=1&v=${shot.version}`;
  el("video-subtitle-overlay").textContent = shot.subtitleText || "";

  if (reloadVideo && appState.monitorMode === "single") {
    const videoEl = el("studio-video-player");
    const nextSrc = `../api/videos/${shot.shotId}?v=${shot.version}_${(shot.videoSha256 || "").slice(0, 8)}`;
    if (videoEl.getAttribute("data-loaded-src") !== nextSrc) {
      videoEl.setAttribute("data-loaded-src", nextSrc);
      videoEl.src = nextSrc;
    }
  }

  // Render Episode Export status
  const lastExport = appState.project?.lastExport;
  if (lastExport) {
    el("export-status-text").textContent =
      `已合成 ${lastExport.fileName} (${lastExport.shotCount} 镜 · ${lastExport.durationSec}s · ${(lastExport.sizeBytes / 1024 / 1024).toFixed(2)} MB · SHA-256: ${lastExport.sha256.slice(0, 10)})`;
    el("link-download-episode").href =
      `../api/episode/download?download=1&sha=${lastExport.sha256.slice(0, 8)}`;
  }

  // Render Audit Log
  const auditList = el("audit-log-list");
  if (auditList) {
    auditList.innerHTML = "";
    (appState.project?.auditLog || []).slice(0, 10).forEach((entry) => {
      const item = document.createElement("div");
      item.className = "audit-item";
      const timeStr = entry.timestamp
        ? entry.timestamp.replace("T", " ").slice(0, 19)
        : "";
      item.innerHTML = `
        <div class="audit-item-time">${escapeHtml(timeStr)} · ${escapeHtml(entry.action)}</div>
        <div>${escapeHtml(entry.summary)}</div>
      `;
      auditList.appendChild(item);
    });
  }
}

function selectShot(shotId) {
  appState.selectedShotId = shotId;
  appState.sequentialPlaying = false;
  appState.monitorMode = "single";
  el("btn-monitor-single").classList.add("active");
  el("btn-monitor-episode").classList.remove("active");
  renderStoryboardCenter();
  renderRightInspector(true);
}

function stepSelectedShot(delta) {
  const shots = getOrderedShots();
  if (shots.length === 0) return;
  const curIdx = shots.findIndex((s) => s.shotId === appState.selectedShotId);
  const nextIdx =
    curIdx < 0 ? 0 : (curIdx + delta + shots.length) % shots.length;
  selectShot(shots[nextIdx].shotId);
}

async function moveShotOrder(fromIdx, toIdx) {
  const shots = getOrderedShots();
  if (toIdx < 0 || toIdx >= shots.length) return;
  const copy = [...shots];
  const [moved] = copy.splice(fromIdx, 1);
  copy.splice(toIdx, 0, moved);
  const shotOrder = copy.map((s) => s.shotId);
  try {
    const data = await apiRequest("../api/shots/reorder", {
      method: "POST",
      body: { shotOrder },
    });
    appState.project = data.state;
    renderStoryboardCenter();
    showBanner(`已更新时间轴顺序：${shotOrder.join(" → ")}`, "success");
  } catch (err) {
    showBanner(err.message, "error");
  }
}

function collectInspectorFormValues() {
  return {
    title: el("input-shot-title").value.trim(),
    durationSec: Number(el("input-shot-duration").value) || 6,
    cameraShot: el("input-camera-shot").value.trim(),
    cameraAngle: el("input-camera-angle").value.trim(),
    cameraMovement: el("input-camera-move").value.trim(),
    visualGrade: el("select-visual-grade").value,
    motionEffect: el("select-motion-effect").value,
    videoPrompt: el("input-video-prompt").value.trim(),
    subtitleText: el("input-subtitle-text").value.trim(),
    audioCue: el("input-audio-cue").value.trim(),
  };
}

async function saveSelectedShotMeta() {
  const shot = getSelectedShot();
  if (!shot) return;
  const payload = collectInspectorFormValues();
  try {
    const data = await apiRequest(`../api/shots/${shot.shotId}`, {
      method: "PUT",
      body: payload,
    });
    appState.project = data.state;
    renderHeader();
    renderStoryboardCenter();
    renderRightInspector(false);
    showBanner(
      `已保存分镜 ${shot.shotId} 的参数与提示词（未触发视频重生成）。`,
      "success",
    );
  } catch (err) {
    showBanner(err.message, "error");
  }
}

function openConfirmOrRerender() {
  const shot = getSelectedShot();
  if (!shot) return;
  const cfg = appState.project?.providerConfig || {};
  if (!cfg.confirmBeforeGenerate) {
    executeSingleShotRerender(shot.shotId, "rerender", false);
    return;
  }

  // First sync local form values into preview
  const formVals = collectInspectorFormValues();
  el("confirm-shot-id").textContent =
    `${shot.shotId} (${formVals.title || shot.title})`;
  el("confirm-untouched-count").textContent = String(
    Math.max(0, getOrderedShots().length - 1),
  );
  el("confirm-provider-name").textContent =
    `${cfg.mode || "studio-ffmpeg"} (${cfg.resolution || "720p"} · ${cfg.aspectRatio || "16:9"} · ${cfg.fps || 24}fps)`;
  el("confirm-cost-estimate").textContent =
    cfg.mode === "studio-ffmpeg"
      ? "本地 Studio FFmpeg 引擎实时渲染 (~1.2s，不消耗远端 API 额度)"
      : `将调用远端 ${cfg.mode} 视频生成接口（生成时长 ${formVals.durationSec}s）`;
  el("confirm-compiled-prompt").value =
    `[${formVals.cameraShot} | ${formVals.cameraAngle} | ${formVals.cameraMovement}] ${formVals.videoPrompt} [Color Grade: ${formVals.visualGrade}] [Motion: ${formVals.motionEffect}]`;
  el("confirm-modal").classList.remove("hidden");
}

async function executeSingleShotRerender(
  shotId,
  actionType = "rerender",
  simulateFailure = false,
) {
  el("confirm-modal").classList.add("hidden");
  const formVals = collectInspectorFormValues();
  const btn = el("btn-rerender-shot");
  btn.disabled = true;
  showBanner(`正在单独渲染分镜 ${shotId}，其余分镜保持锁定不变...`, "info");

  try {
    const data = await apiRequest(`../api/shots/${shotId}/${actionType}`, {
      method: "POST",
      body: {
        ...formVals,
        simulateFailure,
      },
    });
    appState.project = data.state;
    const iso = data.isolationCheck;
    renderHeader();
    renderStoryboardCenter();
    renderRightInspector(true);
    showBanner(
      `分镜 ${shotId} 已重做升级至 v${iso.newVersion}（SHA-256: ${iso.previousSha256.slice(0, 8)} → ${iso.newSha256.slice(0, 8)}），其余 ${iso.untouchedShotCount} 个镜头 100% 保持原样！`,
      "success",
    );
  } catch (err) {
    if (err.payload?.state) {
      appState.project = err.payload.state;
      renderStoryboardCenter();
      renderRightInspector(false);
    }
    showBanner(err.message, "error");
  } finally {
    btn.disabled = false;
  }
}

async function handleExportEpisode() {
  const btn = el("btn-export-episode");
  btn.disabled = true;
  showBanner("正在按时间轴顺序将全部分镜合成完整 MP4 成片...", "info");
  try {
    const data = await apiRequest("../api/episode/export", {
      method: "POST",
    });
    appState.project = data.state;
    const exp = data.exportInfo;
    appState.monitorMode = "episode";
    el("btn-monitor-single").classList.remove("active");
    el("btn-monitor-episode").classList.add("active");

    const videoEl = el("studio-video-player");
    const epUrl = `../api/episode/download?download=0&sha=${exp.sha256.slice(0, 10)}`;
    videoEl.setAttribute("data-loaded-src", epUrl);
    videoEl.src = epUrl;
    videoEl.play().catch(() => {});

    renderRightInspector(false);
    showBanner(
      `全集 MP4 成片已合成完毕：${exp.fileName}（共 ${exp.shotCount} 镜 · ${exp.durationSec}s · ${(exp.sizeBytes / 1024 / 1024).toFixed(2)} MB），可直接在线播放或下载！`,
      "success",
    );
  } catch (err) {
    showBanner(err.message, "error");
  } finally {
    btn.disabled = false;
  }
}

function startSequentialPlayback() {
  const shots = getOrderedShots();
  if (shots.length === 0) return;
  appState.sequentialPlaying = true;
  appState.sequentialIndex = 0;
  appState.monitorMode = "single";
  el("btn-monitor-single").classList.add("active");
  el("btn-monitor-episode").classList.remove("active");
  playSequentialShotAtIndex(0);
}

function playSequentialShotAtIndex(idx) {
  const shots = getOrderedShots();
  if (idx >= shots.length) {
    appState.sequentialPlaying = false;
    showBanner("全集时间轴顺序连播已完成。", "info");
    return;
  }
  const shot = shots[idx];
  appState.selectedShotId = shot.shotId;
  appState.sequentialIndex = idx;
  renderStoryboardCenter();
  renderRightInspector(true);
  const videoEl = el("studio-video-player");
  videoEl.play().catch(() => {});
}

function openProviderModal() {
  const cfg = appState.project?.providerConfig || {};
  const caps = appState.capabilities || {};
  el("select-provider-mode").value = cfg.mode || "studio-ffmpeg";
  el("select-provider-resolution").value = cfg.resolution || "720p";
  el("input-seedance-model").value = cfg.seedanceModel || "";
  el("input-minimax-model").value = cfg.minimaxModel || "";
  el("checkbox-confirm-before-gen").checked =
    cfg.confirmBeforeGenerate !== false;
  el("capabilities-status-box").innerHTML = `
    <div>• 本地 FFmpeg 渲染器状态：<strong>${caps.ffmpegAvailable ? "已就绪 (720p/1080p H.264+AAC)" : "内置 MP4 合成器已就绪"}</strong></div>
    <div>• 环境变量密钥检测：ARK_API_KEY=${caps.seedanceKeyConfigured ? "已配置" : "未配置"} | MINIMAX_API_KEY=${caps.minimaxKeyConfigured ? "已配置" : "未配置"} | OPENAI_API_KEY=${caps.openaiKeyConfigured ? "已配置" : "未配置"}</div>
  `;
  el("provider-modal").classList.remove("hidden");
}

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function initStudio() {
  applyTheme();
  try {
    const data = await apiRequest("../api/state");
    appState.project = data.state;
    appState.capabilities = data.capabilities;
    if (appState.project.shots?.length > 0) {
      appState.selectedShotId = appState.project.shots[0].shotId;
    }
    applyTranslations();
    renderHeader();
    renderLeftPanel();
    renderStoryboardCenter();
    renderRightInspector(true);
  } catch (err) {
    showBanner(`初始化工作台失败: ${err.message}`, "error");
  }

  // Left Panel Tab Switching
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetTab = btn.getAttribute("data-tab");
      document
        .querySelectorAll(".tab-btn")
        .forEach((b) => b.classList.remove("active"));
      document
        .querySelectorAll(".tab-panel")
        .forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      el(`tab-panel-${targetTab}`)?.classList.add("active");
    });
  });

  // Language Toggle
  el("btn-lang-toggle")?.addEventListener("click", () => {
    appState.lang = appState.lang === "zh" ? "en" : "zh";
    applyTranslations();
  });

  // Theme Toggle (YouArt Dark / Light Workbench)
  el("btn-theme-toggle")?.addEventListener("click", () => {
    appState.theme = appState.theme === "dark" ? "light" : "dark";
    applyTheme();
  });

  // View Mode Toggle (YouArt Visual Grid vs Script List)
  el("btn-view-grid")?.addEventListener("click", () => {
    appState.viewMode = "grid";
    el("btn-view-grid")?.classList.add("active");
    el("btn-view-list")?.classList.remove("active");
    renderStoryboardCenter();
  });
  el("btn-view-list")?.addEventListener("click", () => {
    appState.viewMode = "list";
    el("btn-view-list")?.classList.add("active");
    el("btn-view-grid")?.classList.remove("active");
    renderStoryboardCenter();
  });

  // Filmstrip Prev / Next Transport
  el("btn-prev-shot")?.addEventListener("click", () => stepSelectedShot(-1));
  el("btn-next-shot")?.addEventListener("click", () => stepSelectedShot(1));

  // YouArt Start / End Frame Anchor Slots
  el("slot-start-frame")?.addEventListener("click", () => {
    const shot = getSelectedShot();
    if (!shot) return;
    showBanner(
      `[${shot.shotId} 首帧锚点已锁定] 景别：${shot.cameraShot} · 机位：${shot.cameraAngle} · 角色与场景外观特征已自动注入首帧参考。`,
      "info",
    );
  });
  el("slot-end-frame")?.addEventListener("click", () => {
    const shot = getSelectedShot();
    if (!shot) return;
    showBanner(
      `[${shot.shotId} 尾帧落幅已锁定] 运镜：${shot.cameraMovement} · 3200K 暖光与冷雨夜色温连续性已跨镜锁定。`,
      "info",
    );
  });

  // Breakdown Script
  el("btn-breakdown-script").addEventListener("click", async () => {
    const scriptText = el("script-textarea").value;
    showBanner("正在拆解剧本并生成角色卡、场景光影卡与分镜表...", "info");
    try {
      const data = await apiRequest("../api/script/breakdown", {
        method: "POST",
        body: { scriptText },
      });
      appState.project = data.state;
      appState.selectedShotId = appState.project.shots[0]?.shotId || "SHOT-001";
      renderHeader();
      renderLeftPanel();
      renderStoryboardCenter();
      renderRightInspector(true);
      showBanner(
        `剧本拆解成功：共生成 ${appState.project.shots.length} 个分镜！`,
        "success",
      );
    } catch (err) {
      showBanner(err.message, "error");
    }
  });

  // Save Character Consistency Cards
  el("btn-save-characters").addEventListener("click", async () => {
    const characters = JSON.parse(
      JSON.stringify(appState.project.characters || []),
    );
    document.querySelectorAll("[data-char-idx]").forEach((input) => {
      const idx = Number(input.getAttribute("data-char-idx"));
      const field = input.getAttribute("data-field");
      if (characters[idx] && field) {
        characters[idx][field] = input.value.trim();
      }
    });
    try {
      const data = await apiRequest("../api/consistency", {
        method: "PUT",
        body: { characters },
      });
      appState.project = data.state;
      renderLeftPanel();
      renderRightInspector(false);
      showBanner(
        "已保存角色设定卡，并将外观一致性锚点同步注入全部镜头！",
        "success",
      );
    } catch (err) {
      showBanner(err.message, "error");
    }
  });

  // Save Location Consistency Cards
  el("btn-save-locations").addEventListener("click", async () => {
    const locations = JSON.parse(
      JSON.stringify(appState.project.locations || []),
    );
    document.querySelectorAll("[data-loc-idx]").forEach((input) => {
      const idx = Number(input.getAttribute("data-loc-idx"));
      const field = input.getAttribute("data-field");
      if (locations[idx] && field) {
        locations[idx][field] = input.value.trim();
      }
    });
    try {
      const data = await apiRequest("../api/consistency", {
        method: "PUT",
        body: { locations },
      });
      appState.project = data.state;
      renderLeftPanel();
      renderRightInspector(false);
      showBanner(
        "已保存场景光影设定卡，并将环境与色温锚点同步注入全部镜头！",
        "success",
      );
    } catch (err) {
      showBanner(err.message, "error");
    }
  });

  // Reset Preset
  el("btn-reset-preset").addEventListener("click", async () => {
    try {
      const data = await apiRequest("../api/preset/reset", { method: "POST" });
      appState.project = data.state;
      appState.selectedShotId = "SHOT-001";
      appState.monitorMode = "single";
      renderHeader();
      renderLeftPanel();
      renderStoryboardCenter();
      renderRightInspector(true);
      showBanner(
        "已重置为《纸箱小屋》EP001《雨夜来客》初始预置状态。",
        "success",
      );
    } catch (err) {
      showBanner(err.message, "error");
    }
  });

  // Inspector Buttons
  el("btn-save-shot-meta").addEventListener("click", saveSelectedShotMeta);
  el("btn-rerender-shot").addEventListener("click", openConfirmOrRerender);
  el("btn-simulate-fail").addEventListener("click", () => {
    const shot = getSelectedShot();
    if (shot) {
      executeSingleShotRerender(shot.shotId, "rerender", true);
    }
  });
  el("btn-retry-failed-shot").addEventListener("click", () => {
    const shot = getSelectedShot();
    if (shot) {
      executeSingleShotRerender(shot.shotId, "retry", false);
    }
  });

  // Confirmation Modal
  el("btn-close-confirm").addEventListener("click", () =>
    el("confirm-modal").classList.add("hidden"),
  );
  el("btn-cancel-confirm").addEventListener("click", () =>
    el("confirm-modal").classList.add("hidden"),
  );
  el("btn-proceed-rerender").addEventListener("click", () => {
    const shot = getSelectedShot();
    if (shot) {
      executeSingleShotRerender(shot.shotId, "rerender", false);
    }
  });

  // Provider Modal (both header button & YouArt composer model pill)
  el("btn-provider-settings").addEventListener("click", openProviderModal);
  el("btn-composer-model-pill")?.addEventListener("click", openProviderModal);
  el("btn-close-provider").addEventListener("click", () =>
    el("provider-modal").classList.add("hidden"),
  );
  el("btn-cancel-provider").addEventListener("click", () =>
    el("provider-modal").classList.add("hidden"),
  );
  el("btn-save-provider").addEventListener("click", async () => {
    try {
      const data = await apiRequest("../api/provider", {
        method: "PUT",
        body: {
          mode: el("select-provider-mode").value,
          resolution: el("select-provider-resolution").value,
          seedanceModel: el("input-seedance-model").value.trim(),
          minimaxModel: el("input-minimax-model").value.trim(),
          confirmBeforeGenerate: el("checkbox-confirm-before-gen").checked,
        },
      });
      appState.project = data.state;
      appState.capabilities = data.capabilities;
      el("provider-modal").classList.add("hidden");
      renderHeader();
      renderRightInspector(false);
      showBanner("视频生成引擎与接口配置已保存。", "success");
    } catch (err) {
      showBanner(err.message, "error");
    }
  });

  // Monitor Tabs & Sequential Playback
  el("btn-monitor-single").addEventListener("click", () => {
    appState.monitorMode = "single";
    appState.sequentialPlaying = false;
    el("btn-monitor-single").classList.add("active");
    el("btn-monitor-episode").classList.remove("active");
    renderRightInspector(true);
  });

  el("btn-monitor-episode").addEventListener("click", () => {
    handleExportEpisode();
  });

  el("btn-play-sequence").addEventListener("click", startSequentialPlayback);
  el("btn-export-episode").addEventListener("click", handleExportEpisode);

  const playerEl = el("studio-video-player");
  if (playerEl) {
    playerEl.addEventListener("timeupdate", () => {
      const tcEl = el("video-hud-timecode");
      if (tcEl) {
        tcEl.textContent = formatTimecodeFrames(playerEl.currentTime || 0);
      }
    });
    playerEl.addEventListener("ended", () => {
      if (appState.sequentialPlaying) {
        playSequentialShotAtIndex(appState.sequentialIndex + 1);
      }
    });
  }
}

initStudio();
