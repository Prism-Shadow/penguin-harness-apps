const $ = (id) => document.getElementById(id);
const zh = (() => {
  try {
    return (
      (window.parent !== window &&
        window.parent.document.documentElement.lang) ||
      navigator.language
    ).startsWith("zh");
  } catch {
    return navigator.language.startsWith("zh");
  }
})();
const tr = (en, cn) => (zh ? cn : en);
const name = tr(info.en, info.zh),
  words = {
    start: tr("Start game", "开始游戏"),
    again: tr("Play again", "再玩一次"),
    pause: tr("Pause", "暂停"),
    resume: tr("Resume", "继续"),
    won: tr("Game clear", "通关"),
    lost: tr("Game over", "游戏结束"),
  };
document.title = name;
document.documentElement.lang = zh ? "zh" : "en";
$("title").textContent = name;
$("back").textContent = tr("← All games", "← 所有游戏");
$("how").textContent = info.how[zh ? 1 : 0];
$("pause").textContent = words.pause;
$("reset").textContent = tr("Restart", "重开");
const canvas = $("canvas"),
  pen = canvas.getContext("2d"),
  grid = $("grid"),
  held = new Set();
const W = 320,
  H = 200;
const colors = {
  dark: "#21343d",
  ink: "#eaf2cd",
  muted: "#89a6a1",
  mint: "#ade0a7",
  gold: "#fada94",
  rose: "#f19880",
  blue: "#8cc4d5",
};
const keys = {
  U: "↑",
  D: "↓",
  L: "←",
  R: "→",
  A: tr("Action", "操作"),
  F: tr("Flag", "旗帜"),
};
const maps = {
  directions: ["L", "U", "D", "R"],
  pick: ["L", "U", "D", "R", "A"],
  flags: ["L", "U", "D", "R", "A", "F"],
  horizontal: ["L", "R"],
  jump: ["A"],
  shoot: ["L", "A", "R"],
  tones: ["1", "2", "3", "4"],
};
if (info.controls === "jump") keys.A = tr("Jump", "跳跃");
if (info.controls === "shoot") keys.A = tr("Fire", "发射");
if (["pick", "flags"].includes(info.controls)) keys.A = tr("Reveal", "翻开");
let phase = "ready",
  runtime = 0,
  score = 0,
  frameId = 0,
  lastTime = 0,
  gridShape = "",
  cells = [],
  focus = 0;
function showPoints(n) {
  score = n;
  $("score").textContent = tr("Score ", "得分 ") + n;
}
function hint(en, cn) {
  $("status").textContent = tr(en, cn);
}
function end(win, en, cn) {
  if (phase !== "playing") return;
  phase = "over";
  held.clear();
  $("overlay").hidden = false;
  $("heading").textContent = win ? words.won : words.lost;
  $("caption").textContent = tr(en, cn) + " · " + $("score").textContent;
  $("start").textContent = words.again;
  $("pause").disabled = true;
  $("start").focus();
}
function renderGrid(cols, rows, items, selected = -1) {
  canvas.hidden = true;
  grid.hidden = false;
  const box = grid.getBoundingClientRect(),
    cell = Math.max(
      10,
      Math.floor(
        Math.min(
          (box.width - (cols - 1) * 3) / cols,
          (box.height - (rows - 1) * 3) / rows,
        ),
      ),
    );
  grid.style.gridTemplateColumns = "repeat(" + cols + ", " + cell + "px)";
  grid.style.gridTemplateRows = "repeat(" + rows + ", " + cell + "px)";
  if (gridShape !== cols + "x" + rows) {
    gridShape = cols + "x" + rows;
    grid.replaceChildren();
    cells = items.map((_, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.tabIndex = -1;
      b.onclick = () => {
        if (phase === "playing") game.cell?.(i);
      };
      grid.append(b);
      return b;
    });
  }
  items.forEach((item, i) => {
    const b = cells[i],
      v = typeof item === "string" ? { v: item } : item;
    b.textContent = v.v;
    b.dataset.tone = v.t || "";
    b.dataset.cursor = i === selected ? "yes" : "no";
    b.setAttribute(
      "aria-label",
      i + 1 + ": " + (v.label || v.v || tr("empty", "空格")),
    );
  });
}
function cursor(i, k, cols, rows) {
  const dx = k === "L" ? -1 : k === "R" ? 1 : 0,
    dy = k === "U" ? -1 : k === "D" ? 1 : 0;
  return (
    Math.min(rows - 1, Math.max(0, Math.floor(i / cols) + dy)) * cols +
    Math.min(cols - 1, Math.max(0, (i % cols) + dx))
  );
}
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function rect(x, y, w, h, c) {
  pen.fillStyle = c;
  pen.fillRect(Math.round(x), Math.round(y), w, h);
}
function text(s, x, y, c = colors.ink, size = 12) {
  pen.font = "bold " + size + "px monospace";
  pen.fillStyle = c;
  pen.fillText(s, x, y);
}
function clear() {
  grid.hidden = true;
  canvas.hidden = false;
  rect(0, 0, W, H, colors.dark);
}
function pixel(px, py, art, palette, scale = 2) {
  art.forEach((line, y) =>
    [...line].forEach((v, x) => {
      if (palette[v])
        rect(px + x * scale, py + y * scale, scale, scale, palette[v]);
    }),
  );
}
function input(k) {
  if (phase !== "playing") return;
  game.press?.(k);
  game.draw?.();
}
for (const k of maps[info.controls]) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "key";
  b.textContent = keys[k] || k;
  b.dataset.key = k;
  b.onpointerdown = (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    b.setPointerCapture(e.pointerId);
    held.add(k);
    input(k);
  };
  b.onlostpointercapture = () => held.delete(k);
  b.onclick = (e) => {
    if (!e.detail) input(k);
  };
  $("pad").append(b);
}
const keyMap = {
  ArrowUp: "U",
  w: "U",
  ArrowDown: "D",
  s: "D",
  ArrowLeft: "L",
  a: "L",
  ArrowRight: "R",
  d: "R",
  Enter: "A",
  " ": "A",
  f: "F",
  1: "1",
  2: "2",
  3: "3",
  4: "4",
};
document.addEventListener("keydown", (e) => {
  if (phase !== "playing" || e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.key === "Escape") {
    e.preventDefault();
    pause();
    return;
  }
  const k = keyMap[e.key.length === 1 ? e.key.toLowerCase() : e.key];
  if (!k || !maps[info.controls].includes(k)) return;
  if (e.key === "Enter" || e.key === " ") {
    if (e.target.closest("button,a") && !e.target.closest("#grid")) return;
  }
  e.preventDefault();
  if (!held.has(k)) {
    held.add(k);
    input(k);
  }
});
document.addEventListener("keyup", (e) =>
  held.delete(keyMap[e.key.length === 1 ? e.key.toLowerCase() : e.key]),
);
function pointer(event) {
  const b = canvas.getBoundingClientRect();
  return [
    ((event.clientX - b.left) * W) / b.width,
    ((event.clientY - b.top) * H) / b.height,
  ];
}
let swipe = null;
canvas.onpointerdown = (e) => {
  if (phase === "playing") {
    canvas.setPointerCapture(e.pointerId);
    game.tap?.(...pointer(e));
  }
};
canvas.onpointermove = (e) => {
  if (phase === "playing" && e.buttons) game.drag?.(...pointer(e));
};
grid.onpointerdown = (e) => {
  if (info.id === "tile-foundry") swipe = [e.clientX, e.clientY];
};
grid.onpointerup = (e) => {
  if (!swipe) return;
  const dx = e.clientX - swipe[0],
    dy = e.clientY - swipe[1];
  swipe = null;
  if (Math.max(Math.abs(dx), Math.abs(dy)) > 15)
    input(
      Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "R" : "L") : dy > 0 ? "D" : "U",
    );
};
function frame(t) {
  if (phase !== "playing") return;
  const dt = Math.min(0.05, (t - lastTime) / 1000);
  lastTime = t;
  runtime += dt;
  $("time").textContent =
    Math.floor(runtime / 60) +
    ":" +
    String(Math.floor(runtime) % 60).padStart(2, "0");
  game.tick?.(dt);
  if (game.tick && !canvas.hidden) game.draw?.();
  if (phase === "playing") frameId = requestAnimationFrame(frame);
}
function start() {
  cancelAnimationFrame(frameId);
  phase = "playing";
  runtime = 0;
  held.clear();
  showPoints(0);
  hint("", "");
  $("overlay").hidden = true;
  $("pause").disabled = false;
  game.reset();
  game.draw?.();
  $("stage").focus({ preventScroll: true });
  lastTime = performance.now();
  frameId = requestAnimationFrame(frame);
}
function pause() {
  if (phase !== "playing") return;
  phase = "paused";
  cancelAnimationFrame(frameId);
  held.clear();
  $("overlay").hidden = false;
  $("heading").textContent = words.pause;
  $("caption").textContent = $("how").textContent;
  $("start").textContent = words.resume;
  $("start").focus();
  $("pause").disabled = true;
}
$("start").onclick = () => {
  if (phase !== "paused") return start();
  phase = "playing";
  $("overlay").hidden = true;
  $("pause").disabled = false;
  lastTime = performance.now();
  $("stage").focus();
  frameId = requestAnimationFrame(frame);
};
$("reset").onclick = start;
$("pause").onclick = pause;
document.addEventListener("visibilitychange", () => {
  if (document.hidden) pause();
});
const game = makeGame({
  tr,
  hint,
  end,
  showPoints,
  renderGrid,
  cursor,
  shuffle,
  held,
  clear,
  rect,
  text,
  pixel,
  colors,
  W,
  H,
});
new ResizeObserver(() => game.draw?.()).observe($("stage"));
game.reset();
game.draw?.();
showPoints(0);
$("pause").disabled = true;
$("heading").textContent = name;
$("caption").textContent = info.blurb[zh ? 1 : 0];
$("start").textContent = words.start;
