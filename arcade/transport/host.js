import game from "./game-config.js";
import { patchAudio } from "./patch-audio.js";
import audioSources from "./audio-sources.js";

const byId = (id) => document.getElementById(id);
const labels = {
  zh: {
    controls: "操作",
    credit: "创意来自 riba2534",
    upstream: "上游源码",
    language: "",
    mute: "静音",
    unmute: "开启声音",
    replace: "选择本地游戏文件",
    loading: "正在准备离线游戏…",
    download: "正在从作者网站下载游戏…",
    failure:
      "当前浏览器里还没有可用的游戏。请联网重试，或选择本地游戏 HTML 文件。",
    bundledFailure:
      "无法读取工作台里的游戏。请重新导入工作台，或选择本地游戏 HTML 文件。",
    retry: "重试",
    invalid: "请选择包含完整游戏的 HTML 文件。",
    unsaved: "游戏已打开，但浏览器未能保存。下次离线启动前请检查站点存储空间。",
  },
  en: {
    controls: "Controls",
    credit: "Original idea by riba2534",
    upstream: "Upstream source",
    language: "The online game’s menus are in Chinese.",
    mute: "Mute",
    unmute: "Unmute",
    replace: "Choose a local game file",
    loading: "Preparing your offline game…",
    download: "Downloading the game from its author…",
    failure:
      "There is no playable copy saved in this browser. Connect to the internet and try again, or choose a local game HTML.",
    bundledFailure:
      "The game in this workbench could not be opened. Import the workbench again or choose a local game HTML.",
    retry: "Try again",
    invalid: "Choose a self-contained game HTML file.",
    unsaved:
      "The game is running, but this browser could not save it. Check site storage before playing offline next time.",
  },
};
const officialKey = game.id + ":" + game.integrity;
let parentRoot;
try {
  if (window.parent !== window)
    parentRoot = window.parent.document.documentElement;
} catch {}
let frame,
  errorKey,
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
  byId("replace").textContent = byId("choose").textContent = w.replace;
  byId("loading").textContent = w[mode === "download" ? "download" : "loading"];
  byId("failure").textContent = w[game.bundled ? "bundledFailure" : "failure"];
  byId("instructions").textContent =
    lang === "zh" ? game.controlsZh : game.controls;
  byId("language").hidden = !w.language;
  byId("sound").textContent = muted ? w.unmute : w.mute;
  byId("sound").setAttribute("aria-pressed", String(muted));
  byId("sound").hidden = !ready;
  byId("replace").hidden = mode === "failed" || game.bundled;
  byId("loading").hidden = mode !== "loading" && mode !== "download";
  byId("failed").hidden = mode !== "failed";
  byId("error").textContent = w[errorKey] || "";
  byId("error").hidden = !errorKey;
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
  errorKey = undefined;
  byId("viewport").append(frame);
  render();
}
function storedGame(key, value) {
  return new Promise((resolve, reject) => {
    const dbRequest = indexedDB.open("penguin.arcade.local-games", 1);
    dbRequest.onupgradeneeded = () =>
      dbRequest.result.createObjectStore("files");
    dbRequest.onerror = () => reject(dbRequest.error);
    dbRequest.onsuccess = () => {
      const db = dbRequest.result;
      const tx = db.transaction(
        "files",
        value === undefined ? "readonly" : "readwrite",
      );
      const store = tx.objectStore("files");
      const request =
        value === undefined ? store.get(key) : store.put(value, key);
      tx.oncomplete = () => {
        db.close();
        resolve(request.result);
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
// The existing game.id key belongs to files chosen by the player. A verified
// download has its own versioned key so a new release never overwrites a personal copy.
async function saveGame(key, value, run) {
  try {
    await storedGame(key, value);
  } catch {
    if (attempt === run) {
      errorKey = "unsaved";
      render();
    }
  }
}
async function openGame() {
  const run = ++attempt;
  mode = "loading";
  errorKey = undefined;
  render();
  try {
    if (game.bundled) {
      const response = await fetch(new URL("./game.html", import.meta.url));
      if (!response.ok) throw new Error("Bundled game missing");
      const html = await response.text();
      if (run === attempt)
        mountLocal(
          game.bundledOfficial
            ? patchAudio(html, game.source, audioSources)
            : html,
        );
      return;
    }
    const personal = await storedGame(game.id).catch(() => undefined);
    if (run !== attempt) return;
    if (personal) {
      mountLocal(personal);
      return;
    }
    const cached = await storedGame(officialKey).catch(() => undefined);
    if (run !== attempt) return;
    if (typeof cached === "string") {
      // Use native SRI for local bytes too. Blob URLs stay on-device and work
      // on HTTP LAN origins where crypto.subtle is unavailable.
      const objectUrl = URL.createObjectURL(new Blob([cached]));
      try {
        await fetch(objectUrl, { integrity: game.integrity });
        if (run === attempt)
          mountLocal(patchAudio(cached, game.source, audioSources));
        return;
      } catch {
        // Replace a damaged download from the author without touching imported files.
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    }
    if (run !== attempt) return;
    mode = "download";
    render();
    const response = await fetch(game.url, {
      credentials: "omit",
      referrerPolicy: "no-referrer",
      cache: "no-store",
      integrity: game.integrity,
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) throw new Error("Author download failed");
    const html = await response.text();
    if (run !== attempt) return;
    mountLocal(patchAudio(html, game.source, audioSources));
    await saveGame(officialKey, html, run);
  } catch {
    if (run === attempt) {
      mode = "failed";
      render();
    }
  }
}
byId("retry").onclick = openGame;
byId("replace").onclick = byId("choose").onclick = () => byId("file").click();
byId("file").onchange = async ({ target }) => {
  const file = target.files[0];
  target.value = "";
  if (!file) return;
  const run = ++attempt;
  try {
    const html = await file.text();
    if (run !== attempt) return;
    mountLocal(html);
    await saveGame(game.id, html, run);
  } catch {
    if (run !== attempt) return;
    if (!frame) mode = "failed";
    errorKey = "invalid";
    render();
  }
};
if (parentRoot)
  new MutationObserver(render).observe(parentRoot, {
    attributes: true,
    attributeFilter: ["lang"],
  });
window.addEventListener("languagechange", render);
void openGame();
