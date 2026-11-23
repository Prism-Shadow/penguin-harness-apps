import game from "./game-config.js";

const byId = (id) => document.getElementById(id);
const labels = {
  zh: {
    controls: "操作",
    credit: "创意来自 riba2534",
    upstream: "上游源码",
    language: "",
    mute: "静音",
    unmute: "开启声音",
    saved: "打开之前保存的游戏",
    included: "返回随附游戏",
    loading: "正在准备离线游戏…",
    failure: "无法打开游戏，请重试。",
    retry: "重试",
  },
  en: {
    controls: "Controls",
    credit: "Original idea by riba2534",
    upstream: "Upstream source",
    language: "The game menus are in Chinese.",
    mute: "Mute",
    unmute: "Unmute",
    saved: "Open previously saved game",
    included: "Return to included game",
    loading: "Preparing your offline game…",
    failure: "The game could not be opened. Try again.",
    retry: "Try again",
  },
};
let parentRoot;
try {
  if (window.parent !== window)
    parentRoot = window.parent.document.documentElement;
} catch {}
let frame,
  personalGame,
  showingPersonal = false,
  ready = false,
  muted = false;
let mode = "loading";
let attempt = 0;
const soundKey = "penguin.arcade.muted." + game.id;
try {
  muted = localStorage.getItem(soundKey) === "true";
} catch {}

function render() {
  const lang = /^(zh|cmn)/i.test(parentRoot?.lang || navigator.language)
    ? "zh"
    : "en";
  const w = labels[lang];
  document.documentElement.lang = lang;
  document.title = byId("name").textContent =
    game[lang === "zh" ? "zh" : "name"];
  for (const key of ["controls", "credit", "upstream", "language", "retry"])
    byId(key).textContent = w[key];
  byId("saved").hidden = !personalGame;
  byId("saved").textContent = showingPersonal ? w.included : w.saved;
  byId("loading").textContent = w.loading;
  byId("failure").textContent = w.failure;
  byId("instructions").textContent =
    lang === "zh" ? game.controlsZh : game.controls;
  byId("language").hidden = !w.language;
  byId("sound").textContent = muted ? w.unmute : w.mute;
  byId("sound").setAttribute("aria-pressed", String(muted));
  byId("sound").hidden = !ready;
  byId("loading").hidden = mode !== "loading";
  byId("failed").hidden = mode !== "failed";
  if (frame) frame.title = document.title;
  if (ready)
    frame.contentWindow.postMessage(
      { type: "penguin.game-audio", muted, lang },
      "*",
    );
}
function mountLocal(html) {
  if (
    !/<html[\s>]/i.test(html) ||
    !/<script[\s>]/i.test(html) ||
    !/<head\b[^>]*>/i.test(html)
  )
    throw new Error("Invalid game");
  // A local HTML can contain external references. Keep its code and media offline,
  // and keep its origin separate from the application's cookies and saved imports.
  const policy =
    "default-src 'none'; script-src 'unsafe-inline' blob:; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; media-src data: blob:; worker-src blob:; form-action 'none'; base-uri 'none'";
  const next = document.createElement("iframe");
  next.setAttribute("sandbox", "allow-scripts allow-pointer-lock");
  next.allow = "autoplay; fullscreen";
  next.srcdoc = html.replace(
    /<head\b[^>]*>/i,
    (head) =>
      head +
      '<meta http-equiv="Content-Security-Policy" content="' +
      policy +
      '">',
  );
  frame?.remove();
  frame = next;
  ready = false;
  mode = "local";
  byId("viewport").append(frame);
  render();
}
function readPersonalGame() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("penguin.arcade.local-games", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("files");
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction("files", "readonly");
      const file = tx.objectStore("files").get(game.id);
      tx.oncomplete = () => {
        db.close();
        resolve(file.result);
      };
      tx.onabort = () => {
        db.close();
        reject(tx.error);
      };
    };
  });
}
window.addEventListener("message", (event) => {
  if (
    !frame ||
    event.source !== frame.contentWindow ||
    event.data?.type !== "penguin.game-audio-ready"
  )
    return;
  ready = true;
  render();
});
byId("sound").onclick = () => {
  muted = !muted;
  try {
    localStorage.setItem(soundKey, String(muted));
  } catch {}
  render();
  frame.focus();
};
byId("controls").onclick = () => {
  const help = byId("help");
  help.hidden = !help.hidden;
  byId("controls").setAttribute("aria-expanded", String(!help.hidden));
};
async function openGame(personal = false) {
  const run = ++attempt;
  mode = "loading";
  render();
  try {
    let html = personalGame;
    if (!personal) {
      const response = await fetch(new URL("./game.html", import.meta.url));
      if (!response.ok) throw new Error("Bundled game missing");
      html = await response.text();
    }
    if (run !== attempt) return;
    mountLocal(html);
    showingPersonal = personal;
  } catch {
    if (run !== attempt) return;
    mode = "failed";
  }
  render();
}
byId("retry").onclick = () => openGame();
byId("saved").onclick = () => openGame(!showingPersonal);
// Reads older user-selected files independently of starting the included game.
void readPersonalGame()
  .then((value) => {
    if (typeof value === "string" && value) {
      personalGame = value;
      render();
    }
  })
  .catch(() => {});
if (parentRoot)
  new MutationObserver(render).observe(parentRoot, {
    attributes: true,
    attributeFilter: ["lang"],
  });
window.addEventListener("languagechange", render);
void openGame();
