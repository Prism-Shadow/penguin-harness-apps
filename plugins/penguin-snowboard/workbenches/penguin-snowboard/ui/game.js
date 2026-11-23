import { COURSE, STEP, newRide, step } from "./ride.js";
import { drawMountain } from "./mountain.js";
import { en, zh } from "./words.js";

function hostLanguage() {
  try {
    return (
      window.parent !== window && window.parent.document.documentElement.lang
    );
  } catch {
    return "";
  }
}
const language =
  new URLSearchParams(location.search).get("lang") ||
  hostLanguage() ||
  navigator.language;
const words = language.toLowerCase().startsWith("zh") ? zh : en;
document.documentElement.lang = words === zh ? "zh" : "en";
const $ = (id) => document.getElementById(id);
for (const node of document.querySelectorAll("[data-i]"))
  node.textContent = words[node.dataset.i];
document.title = words.title;
document.querySelector("h1").textContent = words.title;
const board = document.querySelector("canvas");
board.setAttribute("aria-label", words.course);
$("slope").setAttribute("aria-label", words.course);
document.querySelector(".controls").setAttribute("aria-label", words.controls);

let r = newRide(),
  screen = "ready",
  messageUntil = 0,
  previous = 0,
  lag = 0,
  animation = 0;
let record = 0,
  muted = false,
  audio;
try {
  record = Number(localStorage.getItem("frostline.best")) || 0;
  muted = localStorage.getItem("frostline.muted") === "true";
} catch {}
const held = { left: new Set(), right: new Set(), jump: new Set() };
let press = false,
  release = false;
const buttons = [...document.querySelectorAll("[data-hold]")];
function resetControls() {
  for (const set of Object.values(held)) set.clear();
  for (const button of buttons) button.classList.remove("held");
  press = false;
  release = false;
  r.charge = 0;
}
function hold(action, source, down) {
  if (screen !== "playing") return;
  const set = held[action],
    before = set.size > 0;
  if (down) set.add(source);
  else set.delete(source);
  const after = set.size > 0;
  if (action === "jump" && before !== after) {
    if (after) press = true;
    else release = true;
  }
  buttons
    .find((b) => b.dataset.hold === action)
    ?.classList.toggle("held", after);
}
function unlock() {
  if (muted) return;
  try {
    audio ??= new AudioContext();
    if (audio.state === "suspended") void audio.resume().catch(() => {});
  } catch {}
}
function note(hz, after, duration, type) {
  if (!audio || muted || audio.state !== "running") return;
  const osc = audio.createOscillator(),
    gain = audio.createGain(),
    t = audio.currentTime + after;
  osc.type = type;
  osc.frequency.setValueAtTime(hz, t);
  osc.frequency.exponentialRampToValueAtTime(hz * 0.76, t + duration);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.055, t + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(t);
  osc.stop(t + duration);
}
function sound(cue) {
  if (cue === "jump") note(370, 0, 0.13, "sine");
  if (cue === "fall") note(89, 0, 0.24, "triangle");
  if (cue === "finish" || cue?.type === "land") {
    note(450, 0, 0.13, "sine");
    note(640, 0.09, 0.19, "sine");
  }
}
function status() {
  $("sound").textContent = muted ? words.unmute : words.mute;
  $("sound").setAttribute("aria-pressed", String(muted));
  $("pause").textContent = screen === "paused" ? words.resume : words.pause;
  $("pause").disabled = screen !== "playing" && screen !== "paused";
  $("panel").hidden = screen === "playing";
  $("restart").hidden = screen !== "paused";
  $("restart").textContent = words.restart;
  if (screen === "playing") return;
  $("heading").textContent =
    screen === "ready"
      ? words.title
      : screen === "paused"
        ? words.paused
        : words.finished;
  $("instructions").textContent =
    screen === "ready"
      ? words.guide
      : screen === "paused"
        ? words.pauseHint
        : words.result(r.score, Math.round(r.time), record);
  $("primary").textContent =
    screen === "ready"
      ? words.start
      : screen === "paused"
        ? words.resume
        : words.restart;
}
function paint() {
  drawMountain(board, r);
  $("distance").textContent = Math.min(COURSE, Math.floor(r.x)) + " m";
  $("score").textContent = String(r.score);
}
function frame(time) {
  if (screen !== "playing") return;
  lag += Math.min(0.08, Math.max(0, (time - previous) / 1000));
  previous = time;
  while (lag >= STEP) {
    step(r, {
      turn: Number(held.right.size > 0) - Number(held.left.size > 0),
      held: held.jump.size > 0,
      press,
      release,
    });
    press = false;
    release = false;
    lag -= STEP;
    if (r.cue) {
      sound(r.cue);
      const text =
        r.cue === "fall"
          ? words.fall
          : r.cue === "recover"
            ? words.recover
            : r.cue.type === "land"
              ? words.landing(r.cue.points, r.cue.flips)
              : null;
      if (text) {
        $("message").textContent = text;
        messageUntil = r.time + 1.8;
      }
    }
    if (r.mode === "finished") {
      screen = "finished";
      record = Math.max(record, r.score);
      try {
        localStorage.setItem("frostline.best", String(record));
      } catch {}
      resetControls();
      $("message").textContent = "";
      status();
      $("primary").focus();
      break;
    }
    if (r.time > messageUntil && $("message").textContent)
      $("message").textContent = "";
  }
  paint();
  if (screen === "playing") animation = requestAnimationFrame(frame);
}
function play(restart) {
  if (restart) {
    r = newRide();
    $("message").textContent = "";
    messageUntil = 0;
  }
  resetControls();
  unlock();
  screen = "playing";
  previous = performance.now();
  lag = 0;
  status();
  cancelAnimationFrame(animation);
  animation = requestAnimationFrame(frame);
}
function pause() {
  if (screen !== "playing") return;
  screen = "paused";
  cancelAnimationFrame(animation);
  resetControls();
  status();
}
$("primary").onclick = () => play(screen !== "paused");
$("restart").onclick = () => play(true);
$("pause").onclick = () => (screen === "paused" ? play(false) : pause());
$("sound").onclick = () => {
  muted = !muted;
  try {
    localStorage.setItem("frostline.muted", String(muted));
  } catch {}
  if (!muted) {
    unlock();
    note(500, 0, 0.11, "sine");
  }
  status();
};
const keys = {
  ArrowLeft: "left",
  KeyA: "left",
  ArrowRight: "right",
  KeyD: "right",
  Space: "jump",
  ArrowUp: "jump",
};
window.addEventListener("keydown", (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.code === "KeyP" && !e.repeat) {
    if (screen === "paused") play(false);
    else pause();
    return;
  }
  if (e.code === "KeyM" && !e.repeat) {
    $("sound").click();
    return;
  }
  if (screen === "playing" && keys[e.code]) {
    e.preventDefault();
    if (!e.repeat) hold(keys[e.code], e.code, true);
  }
});
window.addEventListener("keyup", (e) => {
  if (screen === "playing" && keys[e.code]) {
    e.preventDefault();
    hold(keys[e.code], e.code, false);
  }
});
for (const b of buttons) {
  b.addEventListener("pointerdown", (e) => {
    if (screen !== "playing" || e.button !== 0) return;
    e.preventDefault();
    b.setPointerCapture(e.pointerId);
    hold(b.dataset.hold, e.pointerId, true);
  });
  b.addEventListener("pointerup", (e) =>
    hold(b.dataset.hold, e.pointerId, false),
  );
  b.addEventListener("lostpointercapture", (e) => {
    if (held[b.dataset.hold].has(e.pointerId)) pause();
  });
  b.addEventListener("pointercancel", pause);
}
window.addEventListener("blur", pause);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) pause();
});
new ResizeObserver(paint).observe(board);
status();
paint();
