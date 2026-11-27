const state = {
  hasScanned: false,
  apps: [],
  liveConnections: [],
  summary: null,
  auditJobs: [],
  activeView: "apps",
  activeFilter: "all",
  searchQuery: "",
  selectedAppId: null,
  lastTriggerEl: null,
  pollTimer: null,
};

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatBytes(bytes) {
  const n = Number(bytes) || 0;
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

function riskLabel(level) {
  if (level === "high") return "红灯 · 高危外传风险";
  if (level === "caution") return "黄灯 · 含统计遥测";
  return "绿灯 · 干净安心";
}

function shortTierLabel(level, isTelemetry) {
  if (level === "high") return "发现上传风险";
  if (level === "caution") return isTelemetry ? "含统计埋点" : "需留意同步";
  return "未发现异常";
}

function showToast(msg) {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const el = document.createElement("div");
  el.className = "toast-item";
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => {
    el.remove();
  }, 3200);
}

async function loadScanData(forceRefresh = false) {
  const idleStage = document.getElementById("idle-scan-stage");
  const toolbar = document.getElementById("apps-results-toolbar");
  const appsGrid = document.getElementById("apps-grid");
  const skeleton = document.getElementById("loading-skeleton");
  const errBanner = document.getElementById("error-banner");
  const refreshBtn = document.getElementById("btn-scan-refresh");
  const navBtnText = document.getElementById("nav-scan-btn-text");
  const heroBtn = document.getElementById("btn-hero-scan");
  const stageBtn = document.getElementById("btn-stage-scan");
  const heroBtnText = document.getElementById("hero-scan-btn-text");
  const heroStatus = document.getElementById("hero-scan-status");

  if (idleStage) idleStage.hidden = true;
  if (skeleton) skeleton.hidden = false;
  if (errBanner) errBanner.hidden = true;
  if (refreshBtn) refreshBtn.disabled = true;
  if (heroBtn) heroBtn.disabled = true;
  if (stageBtn) stageBtn.disabled = true;
  if (heroBtnText) heroBtnText.textContent = "正在扫描本机应用与网络...";

  try {
    const url = forceRefresh ? "../api/scan?refresh=1" : "../api/scan";
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    state.hasScanned = true;
    state.apps = data.apps || [];
    state.liveConnections = data.liveConnections || [];
    state.summary = data.summary || null;
    state.auditJobs = data.auditJobs || [];
    if (toolbar) toolbar.hidden = false;
    if (appsGrid) appsGrid.hidden = false;
    renderAll();
    if (heroStatus && state.summary) {
      heroStatus.innerHTML = `已扫描 <strong>${state.summary.totalApps}</strong> 款本机应用 · <strong>${state.summary.cautionCount}</strong> 款含统计遥测 · <strong>${state.summary.highCount}</strong> 款高危`;
    }
    if (navBtnText) navBtnText.textContent = "重新全面检测";
    showToast("已完成本机应用遥测与外传检测");
  } catch (err) {
    if (!state.hasScanned && idleStage) idleStage.hidden = false;
    if (errBanner) {
      errBanner.hidden = false;
      const errText = document.getElementById("error-text");
      if (errText)
        errText.textContent = `扫描数据加载失败：${err instanceof Error ? err.message : String(err)}`;
    }
  } finally {
    if (skeleton) skeleton.hidden = true;
    if (refreshBtn) refreshBtn.disabled = false;
    if (heroBtn) heroBtn.disabled = false;
    if (stageBtn) stageBtn.disabled = false;
    if (heroBtnText) {
      heroBtnText.textContent = state.hasScanned
        ? "重新扫描本机应用"
        : "立即一键扫描本机应用";
    }
  }
}

function renderSummary() {
  if (!state.summary) return;
  document.getElementById("stat-total").textContent = String(
    state.summary.totalApps,
  );
  document.getElementById("stat-safe").textContent = String(
    state.summary.safeCount,
  );
  document.getElementById("stat-caution").textContent = String(
    state.summary.cautionCount,
  );
  document.getElementById("stat-high").textContent = String(
    state.summary.highCount,
  );
  document.getElementById("live-conn-badge").textContent = String(
    state.liveConnections.length,
  );
  const timeEl = document.getElementById("last-scan-time");
  if (timeEl && state.summary.scannedAt) {
    timeEl.textContent = `LAST SCAN: ${new Date(state.summary.scannedAt).toLocaleTimeString()}`;
  }
}

function createAppCardElement(app) {
  const article = document.createElement("article");
  article.className = "app-card";
  article.tabIndex = 0;
  article.setAttribute("role", "button");
  article.setAttribute("aria-label", `查看 ${app.name} 的详细隐私检测报告`);

  const tLevel = app.categories.telemetry.level;
  const sLevel = app.categories.sessionHistory.level;
  const cLevel = app.categories.codebaseExfil.level;

  article.innerHTML = `
    <div class="app-card-top">
      <div class="app-title-group">
        <h3>${escapeHtml(app.name)}</h3>
        <div class="app-meta-row">
          <span class="mono-tag">${escapeHtml(app.categoryLabel)}</span>
          <span>v${escapeHtml(app.version)}</span>
          <span>·</span>
          <span>${escapeHtml(app.framework)}</span>
          ${app.isRunning ? `<span class="running-dot">正在联网 (${app.liveNetwork.activeConnections.length})</span>` : ""}
        </div>
      </div>
      <span class="risk-pill risk-${escapeHtml(app.overallRisk)}">${escapeHtml(riskLabel(app.overallRisk))}</span>
    </div>
    <p class="app-headline">${escapeHtml(app.headline)}</p>
    <div class="mini-three-rows">
      <div class="mini-tier">
        <span class="mini-tier-label">01 统计遥测</span>
        <span class="mini-tier-val val-${escapeHtml(tLevel)}">${escapeHtml(shortTierLabel(tLevel, true))}</span>
      </div>
      <div class="mini-tier">
        <span class="mini-tier-label">02 会话历史</span>
        <span class="mini-tier-val val-${escapeHtml(sLevel)}">${escapeHtml(shortTierLabel(sLevel, false))}</span>
      </div>
      <div class="mini-tier">
        <span class="mini-tier-label">03 本地代码库</span>
        <span class="mini-tier-val val-${escapeHtml(cLevel)}">${escapeHtml(shortTierLabel(cLevel, false))}</span>
      </div>
    </div>
    <div class="app-card-footer">
      <span>${escapeHtml(app.bundleId)}</span>
      <span class="card-action-link">查看证据与关闭方法 →</span>
    </div>
  `;

  const openDetail = () => openAppModal(app.id, article);
  article.addEventListener("click", openDetail);
  article.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openDetail();
    }
  });
  return article;
}

function renderAppsGrid() {
  const grid = document.getElementById("apps-grid");
  const emptyBox = document.getElementById("empty-apps");
  if (!grid || !emptyBox) return;

  const q = state.searchQuery.trim().toLowerCase();
  const filtered = state.apps.filter((app) => {
    if (state.activeFilter === "all" && app.isReferenceCase) return false;
    if (
      state.activeFilter === "ai_coding" &&
      (app.category !== "ai_coding" || app.isReferenceCase)
    )
      return false;
    if (
      state.activeFilter === "risk_only" &&
      (app.overallRisk === "safe" || app.isReferenceCase)
    )
      return false;
    if (
      state.activeFilter === "running" &&
      (!app.isRunning || app.isReferenceCase)
    )
      return false;
    if (state.activeFilter === "reference" && !app.isReferenceCase)
      return false;

    if (q) {
      const hay =
        `${app.name} ${app.bundleId} ${app.headline} ${app.plainExplanation} ${JSON.stringify(app.categories)}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  grid.innerHTML = "";
  if (filtered.length === 0) {
    emptyBox.hidden = false;
    return;
  }
  emptyBox.hidden = true;
  for (const app of filtered) {
    grid.appendChild(createAppCardElement(app));
  }
}

function renderReferenceCases() {
  const refGrid = document.getElementById("reference-cards-grid");
  if (!refGrid) return;
  refGrid.innerHTML = "";
  const refs = state.apps.filter((a) => a.isReferenceCase);
  for (const app of refs) {
    refGrid.appendChild(createAppCardElement(app));
  }
}

function renderLiveNetwork() {
  const tbody = document.getElementById("network-tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  if (state.liveConnections.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="6">当前没有检测到活跃的外部网络连接。</td>`;
    tbody.appendChild(tr);
    return;
  }
  for (const conn of state.liveConnections) {
    const tr = document.createElement("tr");
    const highOut = conn.bytesOut > 10 * 1024 * 1024;
    tr.innerHTML = `
      <td><strong>${escapeHtml(conn.processName)}</strong> <span class="mono-tag">PID ${conn.pid}</span></td>
      <td>${escapeHtml(conn.protocol)} · ${escapeHtml(conn.state)}</td>
      <td>${escapeHtml(conn.localAddr)}</td>
      <td>${escapeHtml(conn.remoteAddr)}</td>
      <td class="${highOut ? "val-caution" : ""}"><strong>${escapeHtml(formatBytes(conn.bytesOut))}</strong></td>
      <td>${escapeHtml(formatBytes(conn.bytesIn))}</td>
    `;
    tbody.appendChild(tr);
  }
}

function renderAll() {
  renderSummary();
  renderAppsGrid();
  renderReferenceCases();
  renderLiveNetwork();
  if (state.selectedAppId) {
    renderModalContent(state.selectedAppId);
  }
}

function openAppModal(appId, triggerEl) {
  state.selectedAppId = appId;
  state.lastTriggerEl = triggerEl || null;
  renderModalContent(appId);
  const dialog = document.getElementById("app-detail-dialog");
  if (dialog && !dialog.open) {
    dialog.showModal();
  }
}

function renderModalContent(appId) {
  const app = state.apps.find((a) => a.id === appId);
  if (!app) return;

  document.getElementById("modal-framework").textContent = app.framework;
  document.getElementById("modal-bundle-id").textContent =
    `${app.bundleId} · v${app.version}`;
  const riskPill = document.getElementById("modal-risk-pill");
  riskPill.className = `risk-pill risk-${app.overallRisk}`;
  riskPill.textContent = riskLabel(app.overallRisk);

  document.getElementById("modal-app-name").textContent = app.name;
  document.getElementById("modal-app-path").textContent = app.appPath;
  document.getElementById("modal-risk-score").textContent = String(
    app.riskScore,
  );
  document.getElementById("modal-headline").textContent = app.headline;
  document.getElementById("modal-explanation").textContent =
    app.plainExplanation;

  const threeGrid = document.getElementById("modal-three-grid");
  const cols = [
    {
      idx: "01 / TELEMETRY",
      title: "1. 统计数据遥测",
      data: app.categories.telemetry,
    },
    {
      idx: "02 / SESSION HISTORY",
      title: "2. 会话历史上传",
      data: app.categories.sessionHistory,
    },
    {
      idx: "03 / CODEBASE EXFIL",
      title: "3. 本地代码库上传",
      data: app.categories.codebaseExfil,
    },
  ];
  threeGrid.innerHTML = cols
    .map(
      (c) => `
      <div class="verdict-col-card">
        <div class="stat-kicker">${escapeHtml(c.idx)}</div>
        <h4>${escapeHtml(c.title)}</h4>
        <div style="margin-bottom:8px;">
          <span class="risk-pill risk-${escapeHtml(c.data.level)}">${escapeHtml(c.data.statusText)}</span>
        </div>
        <p>${escapeHtml(c.data.summary)}</p>
        <ul class="verdict-findings">
          ${c.data.findings.map((f) => `<li>${escapeHtml(f)}</li>`).join("")}
        </ul>
      </div>
    `,
    )
    .join("");

  const evList = document.getElementById("modal-evidences-list");
  if (app.evidences.length === 0) {
    evList.innerHTML = `
      <div class="evidence-item">
        <strong>未检出可疑遥测或越权上传证据</strong>
        <p>已扫描应用包结构、Info.plist 权限声明及当前活跃套接字，均未命中风险规则。</p>
        <span class="evidence-source">来源：${escapeHtml(app.appPath)}</span>
      </div>
    `;
  } else {
    evList.innerHTML = app.evidences
      .map(
        (ev) => `
        <div class="evidence-item">
          <strong>${escapeHtml(ev.title)}</strong>
          <p>${escapeHtml(ev.detail)}</p>
          <span class="evidence-source">证据位置：${escapeHtml(ev.source)}</span>
        </div>
      `,
      )
      .join("");
  }

  document.getElementById("modal-remediation-guide").textContent =
    app.remediation.settingsGuide;
  const hostsPre = document.getElementById("modal-hosts-pre");
  hostsPre.textContent =
    app.remediation.hostsBlockRules.length > 0
      ? app.remediation.hostsBlockRules.join("\n")
      : "# 未检测到需要屏蔽的第三方统计遥测域名";
  document.getElementById("modal-cmd-pre").textContent =
    app.remediation.terminalCommand;

  renderAiJobForApp(app.id);
}

function renderAiJobForApp(appId) {
  const outBox = document.getElementById("ai-advisor-output");
  const askBtn = document.getElementById("btn-ask-ai");
  const job = state.auditJobs.find((j) => j.appId === appId);
  if (!job) {
    outBox.hidden = true;
    outBox.textContent = "";
    askBtn.disabled = false;
    askBtn.textContent = "请 AI 深度解读此应用";
    return;
  }
  outBox.hidden = false;
  if (job.status === "running") {
    askBtn.disabled = true;
    askBtn.textContent = "AI 顾问正在分析...";
    outBox.textContent =
      "正在调用当前 PenguinHarness Agent 分析该应用的静态包结构与联网特征，请稍候（约 5~15 秒）...";
    startAuditPolling();
  } else if (job.status === "completed") {
    askBtn.disabled = false;
    askBtn.textContent = "重新请 AI 解读";
    outBox.textContent = job.answer || "分析完成。";
  } else {
    askBtn.disabled = false;
    askBtn.textContent = "重试 AI 解读";
    outBox.textContent = `分析未完成：${job.error || "未知原因"}`;
  }
}

function startAuditPolling() {
  if (state.pollTimer) return;
  state.pollTimer = setInterval(async () => {
    try {
      const res = await fetch("../api/ai-audit");
      if (!res.ok) return;
      const data = await res.json();
      state.auditJobs = data.jobs || [];
      if (state.selectedAppId) {
        renderAiJobForApp(state.selectedAppId);
      }
      const anyRunning = state.auditJobs.some((j) => j.status === "running");
      if (!anyRunning && state.pollTimer) {
        clearInterval(state.pollTimer);
        state.pollTimer = null;
      }
    } catch {
      // ignore poll error
    }
  }, 2500);
}

function closeAppModal() {
  const dialog = document.getElementById("app-detail-dialog");
  if (dialog && dialog.open) {
    dialog.close();
  }
  state.selectedAppId = null;
  if (state.lastTriggerEl && typeof state.lastTriggerEl.focus === "function") {
    state.lastTriggerEl.focus();
  }
}

function wireEvents() {
  // View Tabs
  for (const btn of document.querySelectorAll(".view-tab")) {
    btn.addEventListener("click", () => {
      const view = btn.getAttribute("data-view") || "apps";
      state.activeView = view;
      for (const b of document.querySelectorAll(".view-tab")) {
        b.classList.toggle("active", b === btn);
      }
      document.getElementById("view-apps").hidden = view !== "apps";
      document.getElementById("view-network").hidden = view !== "network";
      document.getElementById("view-cases").hidden = view !== "cases";
      if ((view === "network" || view === "cases") && !state.hasScanned) {
        void loadScanData(false);
      }
    });
  }

  // Filter Chips
  for (const chip of document.querySelectorAll(".chip")) {
    chip.addEventListener("click", () => {
      state.activeFilter = chip.getAttribute("data-filter") || "all";
      for (const c of document.querySelectorAll(".chip")) {
        c.classList.toggle("active", c === chip);
      }
      renderAppsGrid();
    });
  }

  // Search Input
  const searchInput = document.getElementById("search-input");
  searchInput?.addEventListener("input", () => {
    state.searchQuery = searchInput.value;
    renderAppsGrid();
  });

  // Custom Path Scan Form (with IME composition guard)
  const customForm = document.getElementById("custom-scan-form");
  const customInput = document.getElementById("custom-path-input");
  customInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && (e.isComposing || e.keyCode === 229)) {
      e.preventDefault();
    }
  });
  customForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const appPath = (customInput?.value || "").trim();
    if (!appPath) {
      showToast("请先输入要检测的 .app 完整路径");
      return;
    }
    const btn = document.getElementById("btn-custom-scan");
    if (btn) btn.disabled = true;
    try {
      const res = await fetch("../api/scan-custom", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ appPath }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        showToast(data.error || "专项检测失败");
        return;
      }
      await loadScanData(true);
      if (data.report?.id) {
        openAppModal(data.report.id, btn);
      }
    } catch (err) {
      showToast(
        `请求出错：${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      if (btn) btn.disabled = false;
    }
  });

  // Refresh / Start full scan
  const startAndShowApps = () => {
    const appsTab = document.querySelector('.view-tab[data-view="apps"]');
    if (appsTab) appsTab.click();
    void loadScanData(true);
  };
  document
    .getElementById("btn-scan-refresh")
    ?.addEventListener("click", startAndShowApps);
  document
    .getElementById("btn-hero-scan")
    ?.addEventListener("click", startAndShowApps);
  document
    .getElementById("btn-stage-scan")
    ?.addEventListener("click", startAndShowApps);
  document
    .getElementById("btn-error-retry")
    ?.addEventListener("click", startAndShowApps);

  // Refresh live network
  document
    .getElementById("btn-refresh-network")
    ?.addEventListener("click", async () => {
      try {
        const res = await fetch("../api/live-network");
        if (!res.ok) return;
        const data = await res.json();
        state.liveConnections = data.liveConnections || [];
        renderLiveNetwork();
        document.getElementById("live-conn-badge").textContent = String(
          state.liveConnections.length,
        );
        showToast("已刷新实时网络连接与上传流量");
      } catch {
        showToast("刷新实时流量失败");
      }
    });

  // Modal close & safe backdrop click dismissal
  const dialog = document.getElementById("app-detail-dialog");
  const innerBox = document.getElementById("modal-inner-box");
  document
    .getElementById("btn-close-modal")
    ?.addEventListener("click", closeAppModal);

  let pointerDownOutside = false;
  dialog?.addEventListener("pointerdown", (e) => {
    pointerDownOutside = innerBox ? !innerBox.contains(e.target) : false;
  });
  dialog?.addEventListener("pointerup", (e) => {
    const pointerUpOutside = innerBox ? !innerBox.contains(e.target) : false;
    if (pointerDownOutside && pointerUpOutside) {
      closeAppModal();
    }
    pointerDownOutside = false;
  });
  dialog?.addEventListener("close", () => {
    state.selectedAppId = null;
    if (
      state.lastTriggerEl &&
      typeof state.lastTriggerEl.focus === "function"
    ) {
      state.lastTriggerEl.focus();
    }
  });

  // Copy buttons
  document
    .getElementById("btn-copy-hosts")
    ?.addEventListener("click", async () => {
      const text =
        document.getElementById("modal-hosts-pre")?.textContent || "";
      try {
        await navigator.clipboard.writeText(text);
        showToast("已复制 Hosts 屏蔽规则到剪贴板");
      } catch {
        showToast("复制失败，请手动选中复制");
      }
    });
  document
    .getElementById("btn-copy-cmd")
    ?.addEventListener("click", async () => {
      const text = document.getElementById("modal-cmd-pre")?.textContent || "";
      try {
        await navigator.clipboard.writeText(text);
        showToast("已复制终端防护命令到剪贴板");
      } catch {
        showToast("复制失败，请手动选中复制");
      }
    });

  // AI Deep Audit
  document.getElementById("btn-ask-ai")?.addEventListener("click", async () => {
    if (!state.selectedAppId) return;
    const askBtn = document.getElementById("btn-ask-ai");
    if (askBtn) askBtn.disabled = true;
    try {
      const res = await fetch("../api/ai-audit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ appId: state.selectedAppId }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        showToast(data.error || "启动 AI 解读失败");
        if (askBtn) askBtn.disabled = false;
        return;
      }
      state.auditJobs.unshift(data.job);
      renderAiJobForApp(state.selectedAppId);
      startAuditPolling();
    } catch (err) {
      showToast(
        `调用失败：${err instanceof Error ? err.message : String(err)}`,
      );
      if (askBtn) askBtn.disabled = false;
    }
  });
}

wireEvents();
// Idle until the user clicks "立即一键扫描本机应用" or "开始一键扫描本机应用"
