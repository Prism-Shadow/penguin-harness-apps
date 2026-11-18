// Coordinates stay in a 960-unit playfield, regardless of pixel density or window size.
export const W = 960;
export const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
export function polygon(ctx, fill, points) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  points.forEach(([x, y], i) =>
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y),
  );
  ctx.closePath();
  ctx.fill();
}
export function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}
export function line(ctx, color, width, x1, y1, x2, y2) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}
export function backdrop(ctx, height, colors) {
  const fill = ctx.createLinearGradient(0, 0, 0, height);
  colors.forEach((color, i) =>
    fill.addColorStop(i / (colors.length - 1), color),
  );
  ctx.fillStyle = fill;
  ctx.fillRect(0, 0, W, height);
}
export function random(seed) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
const strings = {
  start: ["Start game", "开始游戏"],
  resume: ["Resume", "继续"],
  again: ["Play again", "再玩一局"],
  paused: ["Paused", "已暂停"],
  pause: ["Pause", "暂停"],
  preview: ["Sound check", "试听"],
  on: ["Sound on", "声音开启"],
  off: ["Muted", "已静音"],
  best: ["Device best", "本机最高"],
  score: ["Score", "得分"],
  left: ["Left", "向左"],
  right: ["Right", "向右"],
  up: ["Up", "向上"],
  down: ["Down", "向下"],
  restart: ["Restart", "重新开始"],
  over: ["Round complete", "本局结束"],
};
function followLanguage(update) {
  let source = null;
  try {
    if (window.parent !== window)
      source = window.parent.document.documentElement;
  } catch {}
  const apply = () => {
    const lang = source?.lang || navigator.language;
    document.documentElement.lang = /^zh/i.test(lang) ? "zh-CN" : "en";
    update();
  };
  apply();
  if (source)
    new MutationObserver(apply).observe(source, {
      attributes: true,
      attributeFilter: ["lang"],
    });
  window.addEventListener("languagechange", apply);
}
export function mount(game) {
  const q = (id) => document.getElementById(id),
    canvas = q("game"),
    ctx = canvas.getContext("2d");
  const state = {
    width: W,
    height: 540,
    elapsed: 0,
    time: 0,
    score: 0,
    phase: "ready",
    pointer: { x: 480, y: 270 },
    keys: new Set(),
  };
  const title = game.title,
    all = { ...strings, ...game.words };
  const tr = (key) =>
    (all[key] || [key, key])[
      document.documentElement.lang.startsWith("zh") ? 1 : 0
    ];
  const key = "penguin.arcade." + game.id;
  function stored(k, fallback) {
    try {
      return localStorage.getItem(key + "." + k) ?? fallback;
    } catch {
      return fallback;
    }
  }
  function store(k, v) {
    try {
      localStorage.setItem(key + "." + k, String(v));
    } catch {}
  }
  let dirty = true;
  let best = Number(stored("best", "0")) || 0,
    muted = stored("muted", "false") === "true",
    displayMessage = "",
    audio = null;
  const sounds = {
    play: (name, pan = 0) => {
      if (!muted && audio?.state === "running") game.sound(audio, name, pan);
    },
  };
  function wake() {
    if (muted) return;
    try {
      audio ??= new (window.AudioContext || window.webkitAudioContext)();
      void audio.resume().catch(() => {});
    } catch {}
  }
  Object.assign(state, { tr, sounds });
  function controls() {
    q("keys").replaceChildren(
      ...game.actions
        .filter((x) => x.button !== false)
        .map((action) => {
          const b = document.createElement("button");
          b.type = "button";
          b.textContent = tr(action.id);
          b.setAttribute("aria-label", tr(action.id));
          b.onpointerdown = (e) => {
            e.preventDefault();
            b.setPointerCapture(e.pointerId);
            press(action.id);
          };
          b.onpointerup =
            b.onpointercancel =
            b.onlostpointercapture =
              () => release(action.id);
          b.onclick = (e) => {
            if (e.detail === 0) {
              press(action.id);
              release(action.id);
            }
          };
          return b;
        }),
    );
  }
  function labels() {
    dirty = true;
    document.title = document.documentElement.lang.startsWith("zh")
      ? title[1]
      : title[0];
    q("name").textContent = document.title;
    q("preview").textContent = tr("preview");
    q("preview").disabled = muted;
    q("sound").textContent = tr(muted ? "off" : "on");
    q("sound").setAttribute("aria-pressed", String(!muted));
    q("score-label").textContent = tr("score");
    q("best-label").textContent = tr("best");
    q("meter-label").textContent = tr(game.meter);
    q("legend").textContent = tr("controls");
    q("restart").textContent = tr("restart");
    q("pause").textContent = tr(state.phase === "paused" ? "resume" : "pause");
    q("panel").hidden = state.phase === "running";
    q("pause").disabled = !["running", "paused"].includes(state.phase);
    q("panel-title").textContent =
      state.phase === "paused"
        ? tr("paused")
        : state.phase === "over"
          ? tr("over")
          : document.title;
    q("panel-copy").textContent =
      state.phase === "over"
        ? tr(displayMessage) + " · " + tr("score") + " " + state.score
        : tr("intro");
    q("start").textContent = tr(
      state.phase === "paused"
        ? "resume"
        : state.phase === "over"
          ? "again"
          : "start",
    );
    canvas.setAttribute("aria-label", document.title + " — " + tr("controls"));
    q("stage").dataset.playing = String(state.phase === "running");
    q("best").textContent = best;
    controls();
  }
  function finish(message = "over") {
    if (state.phase !== "running") return;
    state.phase = "over";
    displayMessage = message;
    state.keys.clear();
    best = Math.max(best, state.score);
    store("best", best);
    labels();
    q("start").focus({ preventScroll: true });
  }
  function start() {
    wake();
    state.keys.clear();
    state.elapsed = 0;
    state.score = 0;
    state.phase = "running";
    game.reset(state);
    labels();
    canvas.focus({ preventScroll: true });
  }
  function pause() {
    if (state.phase !== "running") return;
    state.phase = "paused";
    state.keys.clear();
    labels();
  }
  function resume() {
    if (state.phase !== "paused") return;
    wake();
    state.phase = "running";
    labels();
    canvas.focus({ preventScroll: true });
  }
  function press(id) {
    if (state.phase !== "running" || state.keys.has(id)) return;
    wake();
    state.keys.add(id);
    game.press?.(state, id);
  }
  function release(id) {
    state.keys.delete(id);
  }
  Object.assign(state, { finish });
  q("start").onclick = () => (state.phase === "paused" ? resume() : start());
  q("restart").onclick = start;
  q("pause").onclick = () => (state.phase === "paused" ? resume() : pause());
  q("sound").onclick = () => {
    muted = !muted;
    store("muted", muted);
    if (muted && audio) void audio.suspend();
    else wake();
    labels();
  };
  q("preview").onclick = async () => {
    wake();
    if (audio && !muted) {
      await audio.resume();
      if (game.preview) game.preview(audio);
      else game.sound(audio, "score", 0);
    }
  };
  function point(e) {
    const r = canvas.getBoundingClientRect();
    state.pointer = {
      x: (W * (e.clientX - r.left)) / r.width,
      y: (state.height * (e.clientY - r.top)) / r.height,
    };
  }
  canvas.onpointermove = (e) => {
    if (state.phase === "running") {
      point(e);
      game.point?.(state);
    }
  };
  canvas.onpointerdown = (e) => {
    if (e.button !== 0 || state.phase !== "running") return;
    point(e);
    wake();
    canvas.focus({ preventScroll: true });
    game.tap?.(state);
  };
  const bindings = new Map(
    game.actions.flatMap((a) => a.codes.map((code) => [code, a.id])),
  );
  window.addEventListener("keydown", (e) => {
    if (e.code === "Escape") {
      if (state.phase === "running") {
        e.preventDefault();
        pause();
      }
      return;
    }
    if (e.target?.closest("button") || state.phase !== "running") return;
    if (bindings.has(e.code)) {
      e.preventDefault();
      press(bindings.get(e.code));
    }
  });
  window.addEventListener("keyup", (e) => {
    if (bindings.has(e.code)) release(bindings.get(e.code));
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pause();
  });
  window.addEventListener("blur", () => {
    state.keys.clear();
  });
  window.addEventListener("pagehide", () => {
    if (audio) void audio.close();
  });
  function size() {
    dirty = true;
    const r = canvas.getBoundingClientRect(),
      dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(r.width * dpr));
    canvas.height = Math.max(1, Math.round(r.height * dpr));
    state.height = (W * r.height) / Math.max(1, r.width);
  }
  new ResizeObserver(size).observe(canvas);
  size();
  game.reset(state);
  followLanguage(labels);
  let previous = 0;
  function paint(now) {
    const dt = previous ? clamp((now - previous) / 1000, 0, 0.05) : 0;
    previous = now;
    if (state.phase === "running") {
      state.elapsed += dt;
      state.time += dt;
      game.update(state, dt);
    }
    if (dirty || state.phase === "running") {
      ctx.setTransform(
        canvas.width / W,
        0,
        0,
        canvas.height / state.height,
        0,
        0,
      );
      ctx.save();
      game.draw(ctx, state);
      ctx.restore();
      const score = String(state.score),
        meter = String(game.read(state));
      if (q("score").textContent !== score) q("score").textContent = score;
      if (q("meter").textContent !== meter) q("meter").textContent = meter;
      dirty = false;
    }
    requestAnimationFrame(paint);
  }
  requestAnimationFrame(paint);
}
