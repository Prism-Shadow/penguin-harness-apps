import { button, field, hint, node, t } from "./desk-kit.js";
import { evolutionPanel } from "./evolution.js";

const title = t("Camera Trajectory", "相机轨迹反求");
document.title = title;

const phases = {
  queued: t("Queued", "排队中"),
  tracking: t("Tracking on CPU", "正在用 CPU 反求"),
  "agent-running": t("Agent is running", "Agent 正在运行"),
  checking: t("Checking trajectory", "正在校验轨迹"),
  exporting: t("Building Blender file", "正在生成 Blender 文件"),
  completed: t("Ready", "可下载"),
  failed: t("Failed", "失败"),
};
const errors = {
  select_video: t("Choose a video first.", "请先选择一段视频。"),
  file_too_large: t("The upload limit is 48 MiB.", "上传上限为 48 MiB。"),
  unsupported_container: t(
    "Choose an MP4, MOV, or WebM video.",
    "请选择 MP4、MOV 或 WebM 视频。",
  ),
  invalid_height: t(
    "Enter a height between 0.5 and 2.5 m.",
    "请输入 0.5–2.5 米的主体身高。",
  ),
  clip_too_long: t(
    "Please use a clip of up to 3,000 frames.",
    "请使用不超过 3,000 帧的片段。",
  ),
  executable_missing: t(
    "Check the server’s Python or Blender path.",
    "请检查服务端的 Python 或 Blender 路径。",
  ),
  interrupted: t(
    "The workbench restarted. Upload the clip again to retry.",
    "工作台已重启。重新上传可再试一次。",
  ),
  queue_full: t(
    "The local worker is busy. Try when a job has finished.",
    "本地队列已满。已有任务完成后可再上传。",
  ),
  job_busy: t("Wait for this job to finish.", "请等待此任务完成。"),
  agent_timeout: t("The Agent session timed out.", "等待 Agent 会话超时。"),
  trajectory_missing: t("The Agent did not produce a trajectory file.", "未找到有效的轨迹文件。"),
  blend_missing: t("The Blender file was not created.", "未找到有效的 Blender 文件。"),
  environment_unavailable: t("Use a workbench installed from the plugin library.", "请从插件库安装工作台以使用一键准备。"),
};

let jobs = [];
let selected = null;
let trajectory = null;
let displayed = null;
let loaded = null;
let requestVersion = 0;
let maxUpload = 48 * 1024 * 1024;
let busy = false;
let historyRevision = "";
let metricsRevision = "";
let agentSource = null;
let agentWatched = null;
let runtime = null;
let checkingEnvironment = false;
let environmentPoll;

const file = node("input", {
  type: "file",
  name: "movie",
  accept: "video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm",
  required: true,
});
const height = node("input", {
  type: "number",
  name: "height",
  step: ".01",
  min: ".5",
  max: "2.5",
  value: "1.74",
});
const blend = node("input", { type: "checkbox", name: "blend" });
const submit = node(
  "button",
  { className: "wb-primary", type: "submit", value: "local" },
  t("Track video", "反求轨迹"),
);
const submitAgent = node(
  "button",
  { type: "submit", value: "agent", title: t("Uses the Project’s configured model", "使用项目配置的模型") },
  t("Run with Agent", "交给 Agent 运行"),
);
const status = node("p", { className: "camera-status", role: "status" });
const player = node("video", {
  controls: true,
  preload: "metadata",
  playsInline: true,
});
const empty = node(
  "p",
  { className: "camera-empty" },
  t(
    "Choose a video to view the original and its recovered camera motion.",
    "选择视频后，可对照原片与反求的相机运动。",
  ),
);
const filename = node("strong");
const timecode = node("small");
const history = node("ul", { className: "camera-history" });
const metrics = node("dl", { className: "camera-metrics" });
const quality = node("p", { className: "hint" });
const actions = node("div", { className: "camera-actions" });
const plan = node("canvas", { className: "camera-plot" });
const curves = node("canvas", { className: "camera-plot short" });
const transcript = node("ol", { className: "camera-transcript", role: "log" });
plan.setAttribute(
  "aria-label",
  t("Camera trajectory viewed from above", "相机轨迹俯视图"),
);
curves.setAttribute(
  "aria-label",
  t("Elevation and distance over time", "随时间变化的仰角和距离"),
);
player.hidden = true;

const upload = node(
  "form",
  { className: "camera-upload" },
  field(t("Video file", "视频文件"), file),
  field(t("Subject height (m)", "主体身高（米）"), height),
  node(
    "label",
    { className: "option" },
    blend,
    node("span", {}, t("Build .blend", "生成 .blend")),
  ),
  submit,
  submitAgent,
);

function card(title, ...children) {
  return node(
    "section",
    { className: "camera-card" },
    node("h2", {}, title),
    ...children,
  );
}

const agentCard = card(t("Agent activity", "Agent 运行记录"), transcript);
agentCard.hidden = true;

const environmentChecks = node("ul", { className: "camera-environment-checks" });
const environmentStatus = node("p", { className: "hint", role: "status" });
const checkEnvironment = button(t("Check again", "重新检查"), () => void refreshEnvironment());
const prepareEnvironment = button(t("Set up environment", "一键准备环境"), () => void startEnvironmentSetup(), true);
prepareEnvironment.hidden = true;
const environmentCard = card(
  t("Environment check", "环境自检"),
  environmentChecks,
  environmentStatus,
  hint(t(
    "Set up once. Internet is used only to install Python dependencies. Local tracking runs offline.",
    "这一步只做一次，只在装依赖时联网。本地反求可离线运行。",
  )),
  node("div", { className: "camera-actions" }, checkEnvironment, prepareEnvironment),
);

document.body.append(
  node(
    "main",
    { className: "camera-workspace" },
    node(
      "header",
      {},
      node("img", { src: "./icon.svg", alt: "" }),
      node("h1", {}, title),
      node(
        "span",
        { className: "camera-header-message" },
        t("Local CPU tracking", "本机 CPU 反求"),
      ),
    ),
    node(
      "div",
      { className: "content camera-grid" },
      node(
        "div",
        { className: "camera-left" },
        node(
          "section",
          { className: "camera-card" },
          node("div", { className: "camera-player" }, empty, player),
          node(
            "div",
            { className: "camera-caption", hidden: true },
            filename,
            timecode,
          ),
        ),
        environmentCard,
        card(t("Analyze a clip", "分析片段"), upload, status),
        agentCard,
        card(t("History", "历史任务"), history),
      ),
      node(
        "div",
        { className: "camera-right" },
        card(
          t("Camera path", "相机轨迹"),
          plan,
          curves,
          node(
            "div",
            { className: "camera-plot-key" },
            node("span", {}, t("Elevation", "仰角")),
            node("span", {}, t("Distance", "距离")),
          ),
        ),
        card(t("Checks and export", "自检与导出"), metrics, quality, actions),
      ),
    ),
    evolutionPanel(),
  ),
);

const caption = document.querySelector(".camera-caption");

async function api(route, options) {
  const response = await fetch("../api/" + route, options);
  const result = await response.json().catch(() => null);
  if (!response.ok)
    throw new Error(
      result?.error ?? (response.status === 413 ? "file_too_large" : "network"),
    );
  return result;
}

function message(value, error = false) {
  status.textContent = errors[value] ?? value ?? "";
  status.classList.toggle("error", error);
}

function syncUploadControls() {
  const disabled = busy || (!!runtime && !runtime.python.ready);
  submit.disabled = disabled;
  submitAgent.disabled = disabled;
  blend.disabled = !!runtime && !runtime.blender.version;
  if (blend.disabled) blend.checked = false;
}

function renderEnvironment() {
  const { python, blender, preparation, canPrepare } = runtime;
  const missing = t("Unavailable", "不可用");
  const version = (value) => value || missing;
  environmentChecks.replaceChildren(
    node("li", {}, `Python · ${version(python.version)} · ${python.executable}`),
    node("li", {}, `numpy · ${version(python.modules?.numpy?.version)}`),
    node("li", {}, `cv2 · ${version(python.modules?.cv2?.version)}`),
    node("li", {}, `Blender · ${version(blender.version)} · ${blender.executable}`),
  );
  const guidance = [];
  const steps = {
    checking: t("Checking Python…", "正在检查 Python…"),
    creating: t("Creating a project virtual environment…", "正在创建项目虚拟环境…"),
    installing: t("Installing Python dependencies…", "正在安装 Python 依赖…"),
    verifying: t("Verifying Python imports…", "正在验证 Python 导入…"),
    saving: t("Saving the project interpreter…", "正在保存项目解释器…"),
  };
  const failures = {
    python_missing: t("Install Python 3.13 or correct PENGUIN_CAMERA_PYTHON on the server, then check again.", "请在服务端安装 Python 3.13 或修正 PENGUIN_CAMERA_PYTHON，再点「重新检查」。"),
    venv_failed: t("Virtual environment creation failed. Install venv support for the server’s Python, then try again.", "虚拟环境创建失败。请为服务端 Python 安装 venv 支持，再点「一键准备环境」。"),
    install_failed: t("Dependency installation failed. Check the server’s package index, connection and Python version, then try again.", "依赖安装失败。请检查服务端包索引、网络和 Python 版本，再点「一键准备环境」。"),
    imports_failed: t("The installed modules did not import. Check the server’s Python and native runtime, then try again.", "已安装的模块导入失败。请检查服务端的 Python 和系统运行库，再点「一键准备环境」。"),
    configuration_failed: t("The project environment could not be saved. Check the server’s data directory permissions, then try again.", "未能保存项目环境。请检查服务端数据目录权限，再点「一键准备环境」。"),
  };
  if (preparation?.status === "preparing") {
    guidance.push(steps[preparation.step]);
  } else if (preparation?.status === "failed") {
    guidance.push(failures[preparation.error]);
  } else if (python.error) {
    guidance.push(failures.python_missing);
  } else if (python.ready) {
    guidance.push(python.installer
      ? t(`Project environment ready · ${python.installer}`, `项目环境已就绪 · ${python.installer}`)
      : t("Python dependencies are ready.", "Python 依赖已就绪。"));
  } else if (canPrepare) {
    guidance.push(t("Select Set up environment to install the missing Python dependencies.", "点击「一键准备环境」安装缺少的 Python 依赖。"));
  } else {
    guidance.push(errors.environment_unavailable);
  }
  if (!blender.version) guidance.push(t(
    "Blender is unavailable. Install Blender 4.2 on the server or set PENGUIN_CAMERA_BLENDER to its executable and restart the service, then select Check again. JSON export is available without Blender.",
    "未找到可用的 Blender。请在服务端安装 Blender 4.2，或设置 PENGUIN_CAMERA_BLENDER 为可执行文件路径并重启服务，再点「重新检查」。仍可导出轨迹 JSON。",
  ));
  environmentStatus.textContent = guidance.join(" ");
  prepareEnvironment.hidden = !canPrepare || python.ready;
  prepareEnvironment.disabled = preparation?.status === "preparing";
  syncUploadControls();
}

async function refreshEnvironment() {
  if (checkingEnvironment) return;
  checkingEnvironment = true;
  clearTimeout(environmentPoll);
  checkEnvironment.disabled = true;
  try {
    runtime = await api("environment");
    renderEnvironment();
    if (runtime.preparation?.status === "preparing")
      environmentPoll = setTimeout(() => void refreshEnvironment(), 800);
  } catch {
    environmentStatus.textContent = t("Environment check failed. Select Check again.", "无法读取环境自检结果。请点「重新检查」。");
    prepareEnvironment.disabled = false;
  } finally {
    checkingEnvironment = false;
    checkEnvironment.disabled = false;
  }
}

async function startEnvironmentSetup() {
  prepareEnvironment.disabled = true;
  try {
    await api("environment/prepare", { method: "POST" });
    environmentStatus.textContent = t("Preparing the project environment…", "正在准备项目环境…");
    await refreshEnvironment();
  } catch (error) {
    environmentStatus.textContent = errors[error.message] || t("Setup could not start. Try again.", "无法启动环境准备。请重试。");
    prepareEnvironment.disabled = false;
  }
}

upload.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (busy) return;
  const movie = file.files?.[0];
  if (!movie) return message("select_video", true);
  if (movie.size > maxUpload) return message("file_too_large", true);
  busy = true;
  syncUploadControls();
  message(t("Uploading to this workbench…", "正在上传至本机工作台…"));
  try {
    const query = new URLSearchParams({
      name: movie.name,
      height: height.value,
      blend: blend.checked ? "1" : "0",
      mode: event.submitter === submitAgent ? "agent" : "local",
    });
    const job = await api("jobs?" + query, {
      method: "POST",
      headers: { "content-type": "application/octet-stream" },
      body: movie,
    });
    file.value = "";
    jobs = [job, ...jobs.filter((other) => other.id !== job.id)];
    selected = job.id;
    render();
    await refresh();
  } catch (error) {
    message(
      error.message === "network"
        ? t(
            "The upload failed. Check the server connection.",
            "上传失败，请检查工作台连接。",
          )
        : error.message,
      true,
    );
  } finally {
    busy = false;
    syncUploadControls();
  }
});

function historyItem(job) {
  const b = button("", () => {
    selected = job.id;
    render();
  });
  b.setAttribute("aria-pressed", String(job.id === selected));
  b.dataset.jobId = job.id;
  b.append(
    node("strong", {}, job.name),
    node(
      "small",
      {},
      [job.mode === "agent" ? "Agent" : t("Local", "本地"), phases[job.status], new Date(job.createdAt).toLocaleString()].join(
        " · ",
      ),
    ),
  );
  return node("li", {}, b);
}

function link(label, id, artifact) {
  return node(
    "a",
    { href: "../api/jobs/" + id + "/" + artifact, download: "" },
    label,
  );
}

function displayMetrics(job) {
  const summary = job?.summary;
  metrics.replaceChildren();
  actions.replaceChildren();
  if (!summary) {
    quality.textContent = t(
      "Checks appear after tracking finishes.",
      "反求完成后显示自检指标。",
    );
    return;
  }
  const percent = (n) =>
    Number.isFinite(n) ? (100 * n).toFixed(0) + "%" : "—";
  const format = (n, amount, unit) =>
    Number.isFinite(n) ? n.toFixed(amount) + " " + unit : "—";
  for (const [label, value] of [
    [t("CPU per frame", "单帧 CPU"), format(summary.latency_ms, 2, "ms")],
    [
      t("Background residual", "背景模型残差"),
      format(summary.background_residual_px, 2, "px"),
    ],
    [t("Subject coverage", "主体观测覆盖"), percent(summary.subject_coverage)],
    [
      t("Rotation jitter", "旋转高频能量"),
      format(summary.rotation_high_frequency_deg2, 3, "°²"),
    ],
  ])
    metrics.append(
      node("div", {}, node("dt", {}, label), node("dd", {}, value)),
    );
  quality.textContent = summary.intrinsics.estimated
    ? t(
        "Estimated intrinsics · Metric scale uses the subject height.",
        "内参为估计值，米制尺度来自输入身高。",
      )
    : t(
        "Calibrated intrinsics · Metric scale uses the subject height.",
        "使用标定内参，米制尺度来自输入身高。",
      );
  actions.append(
    link(t("Trajectory JSON", "轨迹 JSON"), job.id, "trajectory?download=1"),
    link(t("Blender script", "Blender 脚本"), job.id, "script"),
  );
  if (job.blend === "available") {
    actions.append(link(t("Download .blend", "下载 .blend"), job.id, "blend"));
  } else if (job.blend === "queued") {
    actions.append(hint(t("Building .blend…", "正在生成 .blend…")));
  } else {
    actions.append(
      button(t("Build .blend", "生成 .blend"), async (event) => {
        const control = event.currentTarget;
        control.disabled = true;
        try {
          await api("jobs/" + job.id + "/blend", { method: "POST" });
          if (job.mode === "agent") agentWatched = null;
          await refresh();
        } catch (error) {
          message(error.message, true);
          control.disabled = false;
        }
      }),
    );
  }
}

function renderAgent(job) {
  const id = job?.mode === "agent" ? job.id : null;
  if (id === agentWatched) return;
  agentSource?.close();
  agentWatched = id;
  agentCard.hidden = !id;
  transcript.replaceChildren();
  if (!id) return;
  const source = new EventSource("../api/jobs/" + id + "/agent-events");
  agentSource = source;
  source.onmessage = (message) => {
    const { events, done } = JSON.parse(message.data);
    const labels = {
      started: t("Session started", "会话已启动"),
      tool: t("Tool call", "调用工具"),
      toolFinished: t("Tool returned", "工具已返回"),
      finished: t("Session ended", "会话已结束"),
      answer: t("Result", "结果"),
      error: t("Session error", "会话错误"),
    };
    const atEnd = transcript.scrollHeight - transcript.scrollTop - transcript.clientHeight < 20;
    transcript.replaceChildren(...events.map(({ kind, text }) => {
      const item = node("li", {}, [labels[kind], text].filter(Boolean).join(" · "));
      item.dataset.kind = kind;
      return item;
    }));
    if (atEnd) transcript.scrollTop = transcript.scrollHeight;
    if (done) {
      source.close();
      void refresh();
    }
  };
}

function render() {
  const job = jobs.find((entry) => entry.id === selected);
  const historyKey =
    selected +
    "/" +
    jobs.map((entry) => entry.id + ":" + entry.status).join(",");
  if (historyKey !== historyRevision) {
    historyRevision = historyKey;
    history.replaceChildren(...jobs.map(historyItem));
    if (!jobs.length)
      history.append(
        node("li", { className: "hint" }, t("No videos yet.", "暂无任务。")),
      );
  }
  if (displayed !== (job?.id ?? null)) {
    displayed = job?.id ?? null;
    trajectory = null;
    loaded = null;
    requestVersion += 1;
    player.hidden = !job;
    empty.hidden = !!job;
    caption.hidden = !job;
    filename.textContent = job?.name ?? "";
    if (job) player.src = "../api/jobs/" + job.id + "/video";
    else player.removeAttribute("src");
    draw();
  }
  if (!busy || job) {
    const notice = job?.error ?? job?.blendError;
    message(notice || phases[job?.status], !!notice);
  }
  const metricsKey = job?.id + "/" + job?.status + "/" + job?.blend;
  if (metricsRevision !== metricsKey) {
    metricsRevision = metricsKey;
    displayMetrics(job);
  }
  renderAgent(job);
  if (job?.summary && loaded !== job.id) {
    loaded = job.id;
    const version = requestVersion;
    api("jobs/" + job.id + "/trajectory")
      .then((result) => {
        if (version !== requestVersion) return;
        trajectory = result;
        draw();
      })
      .catch(() => {
        if (version === requestVersion) loaded = null;
      });
  }
}

async function refresh() {
  try {
    const response = await api("jobs");
    jobs = response.jobs;
    maxUpload = response.maxUpload;
    if (!jobs.some((job) => job.id === selected))
      selected = jobs[0]?.id ?? null;
    render();
  } catch {
    if (!busy)
      message(
        t("Could not connect to the workbench.", "未能连接工作台。"),
        true,
      );
  }
}

function canvas(element) {
  const w = element.clientWidth,
    h = element.clientHeight;
  if (!w || !h) return null;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  if (
    element.width !== Math.round(w * dpr) ||
    element.height !== Math.round(h * dpr)
  ) {
    element.width = Math.round(w * dpr);
    element.height = Math.round(h * dpr);
  }
  const context = element.getContext("2d");
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.clearRect(0, 0, w, h);
  return { context, w, h };
}

function line(ctx, coordinates, breaks, color, width = 1.5) {
  ctx.beginPath();
  coordinates.forEach(([x, y], i) => {
    if (!i || breaks?.[i]) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

function dot(ctx, x, y, color, radius) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

function grid(ctx, w, h) {
  for (const f of [0.2, 0.4, 0.6, 0.8]) {
    line(
      ctx,
      [
        [w * f, 0],
        [w * f, h],
      ],
      null,
      "#263841",
      1,
    );
    line(
      ctx,
      [
        [0, h * f],
        [w, h * f],
      ],
      null,
      "#263841",
      1,
    );
  }
}

function draw() {
  const top = canvas(plan),
    side = canvas(curves);
  const fs = trajectory?.frames ?? [];
  const index = fs.length
    ? Math.min(fs.length - 1, Math.round(player.currentTime * trajectory.fps))
    : 0;
  if (displayed) {
    const format = (sec) =>
      Number.isFinite(sec) ? sec.toFixed(1) + " s" : "—";
    timecode.textContent = [
      format(player.currentTime),
      format(player.duration),
    ].join(" / ");
  }
  if (top) {
    const { context: ctx, w, h } = top;
    grid(ctx, w, h);
    if (fs.length) {
      const span = Math.max(
        1,
        ...fs.map((f) => Math.hypot(...f.position.slice(0, 2))),
      );
      const factor = (0.44 * Math.min(w, h)) / span;
      const pts = fs.map((f) => [
        w * 0.5 + factor * f.position[0],
        h * 0.52 - factor * f.position[1],
      ]);
      const gaps = fs.map((f, i) => i > 0 && f.shot !== fs[i - 1].shot);
      line(ctx, pts, gaps, "#65d5c0", 2.1);
      dot(ctx, w * 0.5, h * 0.52, "#efb776", 4);
      dot(ctx, ...pts[index], "#eefafa", 4.5);
      const [qw, qx, qy, qz] = fs[index].quaternion;
      const [cx, cy] = pts[index];
      line(
        ctx,
        [
          [cx, cy],
          [cx - 25 * (qx * qz + qy * qw), cy + 25 * (qy * qz - qx * qw)],
        ],
        null,
        "#eefafa",
        1.8,
      );
      ctx.fillStyle = "#a6bac6";
      ctx.font = "12px system-ui";
      ctx.fillText(t("Pelvis", "骨盆"), w * 0.5 + 9, h * 0.52 + 5);
      ctx.fillText(span.toFixed(1) + " m", 10, h - 11);
    }
  }
  if (side) {
    const { context: ctx, w, h } = side;
    grid(ctx, w, h);
    if (fs.length) {
      const elevations = fs.map(
        (f) =>
          (Math.atan2(f.position[2], Math.hypot(...f.position.slice(0, 2))) *
            180) /
          Math.PI,
      );
      const distances = fs.map((f) => Math.hypot(...f.position));
      const gaps = fs.map((f, i) => i > 0 && f.shot !== fs[i - 1].shot);
      function series(data, color) {
        const min = Math.min(...data),
          max = Math.max(...data);
        line(
          ctx,
          data.map((d, i) => [
            8 + ((w - 16) * i) / (data.length - 1),
            8 + (h - 22) * (max === min ? 0.5 : (max - d) / (max - min)),
          ]),
          gaps,
          color,
          1.6,
        );
      }
      series(elevations, "#65d5c0");
      series(distances, "#efb776");
      const x = 8 + ((w - 16) * index) / (fs.length - 1);
      line(
        ctx,
        [
          [x, 0],
          [x, h],
        ],
        null,
        "#cddde5",
        1,
      );
      ctx.fillStyle = "#b9cad2";
      ctx.font = "11px system-ui";
      ctx.fillText(
        elevations[index].toFixed(1) +
          "°  ·  " +
          distances[index].toFixed(2) +
          " m",
        9,
        h - 4,
      );
    }
  }
}

for (const event of ["timeupdate", "seeked", "loadedmetadata"])
  player.addEventListener(event, draw);
curves.addEventListener("pointerdown", (event) => {
  if (!trajectory) return;
  const x = Math.min(1, Math.max(0, event.offsetX / curves.clientWidth));
  player.currentTime = (x * (trajectory.frames.length - 1)) / trajectory.fps;
});
const observer = new ResizeObserver(draw);
observer.observe(plan);
observer.observe(curves);
void refreshEnvironment();
await refresh();
setInterval(() => {
  if (!document.hidden) void refresh();
}, 1600);
