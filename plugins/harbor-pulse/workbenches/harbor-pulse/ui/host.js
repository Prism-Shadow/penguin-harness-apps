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
    browser: "在浏览器中打开",
    offline: "离线游玩：选择本地文件",
    offlineSaved: "离线游玩",
    replace: "更换游戏文件",
    online: "玩在线版",
    loading: "正在打开游戏…",
    failure: "游戏没能打开。可能是没有联网，或者这个网页被拦住了。",
    retry: "重试",
    invalid: "请选择包含完整游戏的 HTML 文件。",
    unsaved: "游戏已打开。浏览器无法保存这份文件，下次请重新选择。",
    missing: "读不出工作台里的游戏文件，已改为打开在线版。",
  },
  en: {
    controls: "Controls",
    credit: "Original idea by riba2534",
    upstream: "Upstream source",
    language: "The online game’s menus are in Chinese.",
    mute: "Mute",
    unmute: "Unmute",
    browser: "Open in browser",
    offline: "Play offline: choose a local file",
    offlineSaved: "Play offline",
    replace: "Change game file",
    online: "Play online",
    loading: "Opening the game…",
    failure:
      "The game didn’t open. You might be offline, or the game’s web page is blocked here.",
    retry: "Try again",
    invalid: "Choose a self-contained game HTML file.",
    unsaved:
      "Game opened. Choose the file again next time because this browser could not save it.",
    missing:
      "The game file in this workbench couldn’t be read, so the online game opened instead.",
  },
};
// How long the reachability check of the online game may take before the page counts as
// unreachable. A blocked domain often hangs instead of failing, so the check needs a limit.
const PROBE_TIMEOUT_MS = 15000;
const onlineOrigin = new URL(game.url).origin;
let parentRoot;
try {
  if (window.parent !== window)
    parentRoot = window.parent.document.documentElement;
} catch {}
// mode: "online" (the author's page), "failed" (it could not load) or "local" (a file the
// player chose, or the game a private workbench ZIP bundles).
let frame,
  mode,
  errorKey,
  saved,
  attempt = 0,
  loaded = false,
  ready = false,
  muted = false;
const soundKey = "penguin.arcade.muted." + game.id;
try {
  muted = localStorage.getItem(soundKey) === "true";
} catch {}

function render() {
  const lang = /^(zh|cmn)/i.test(parentRoot?.lang || navigator.language)
    ? "zh"
    : "en";
  const w = labels[lang];
  const local = mode === "local";
  document.documentElement.lang = lang;
  document.title = byId("name").textContent =
    lang === "zh" ? game.zh : game.name;
  for (const key of [
    "controls",
    "credit",
    "upstream",
    "language",
    "browser",
    "replace",
    "online",
    "loading",
    "failure",
    "retry",
  ])
    byId(key).textContent = w[key];
  byId("failedBrowser").textContent = w.browser;
  byId("offline").textContent = byId("failedOffline").textContent = saved
    ? w.offlineSaved
    : w.offline;
  byId("instructions").textContent =
    lang === "zh" ? game.controlsZh : game.controls;
  byId("language").hidden = !w.language || local;
  byId("sound").textContent = muted ? w.unmute : w.mute;
  byId("sound").setAttribute("aria-pressed", String(muted));
  byId("sound").hidden = !ready;
  byId("browser").hidden = byId("offline").hidden = mode !== "online";
  byId("replace").hidden = !local || game.bundled;
  byId("online").hidden = !local || game.bundled;
  byId("loading").hidden = mode !== "online" || loaded;
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
function show(next, nextMode) {
  frame?.remove();
  frame = next;
  mode = nextMode;
  loaded = false;
  ready = false;
  errorKey = undefined;
  if (frame) byId("viewport").append(frame);
  render();
}
function fail(run) {
  if (run === attempt && mode === "online") show(undefined, "failed");
}
function startOnline() {
  const run = ++attempt;
  if (navigator.onLine === false) {
    show(undefined, "failed");
    return;
  }
  // The author's page keeps its own origin, so it can save its settings, but it can reach
  // neither this workbench nor the application. No referrer: the address of this server
  // stays private.
  const next = document.createElement("iframe");
  next.setAttribute(
    "sandbox",
    "allow-scripts allow-same-origin allow-pointer-lock allow-popups",
  );
  next.allow = "autoplay; fullscreen";
  next.referrerPolicy = "no-referrer";
  next.className = "loading";
  next.onload = () => {
    if (run !== attempt) return;
    next.classList.remove("loading");
    loaded = true;
    render();
  };
  next.src = game.url;
  show(next, "online");
  // A frame's load event fires for the browser's error page too, so it cannot tell an
  // unreachable page from a loaded one. A request that fails at the network level can.
  fetch(game.url, {
    method: "HEAD",
    mode: "no-cors",
    cache: "no-store",
    credentials: "omit",
    referrerPolicy: "no-referrer",
    signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
  }).catch(() => fail(run));
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
  attempt++;
  show(next, "local");
}
function storedGame(value) {
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
        value === undefined ? store.get(game.id) : store.put(value, game.id);
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
// A host that forbids the author's page in a frame reports it here.
document.addEventListener("securitypolicyviolation", (event) => {
  if (event.blockedURI.startsWith(onlineOrigin)) fail(attempt);
});
window.addEventListener("online", () => {
  if (mode === "failed") startOnline();
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
byId("browser").href = byId("failedBrowser").href = game.url;
byId("online").onclick = byId("retry").onclick = startOnline;
byId("replace").onclick = () => byId("file").click();
for (const key of ["offline", "failedOffline"])
  byId(key).onclick = () => {
    try {
      if (saved) return mountLocal(saved);
    } catch {
      saved = undefined;
    }
    byId("file").click();
  };
byId("file").onchange = async ({ target }) => {
  const file = target.files[0];
  target.value = "";
  if (!file) return;
  try {
    const html = await file.text();
    mountLocal(html);
    saved = html;
    try {
      await storedGame(html);
    } catch {
      errorKey = "unsaved";
    }
  } catch {
    errorKey = "invalid";
  }
  render();
};
if (parentRoot)
  new MutationObserver(render).observe(parentRoot, {
    attributes: true,
    attributeFilter: ["lang"],
  });
window.addEventListener("languagechange", render);
render();
if (game.bundled) {
  try {
    const response = await fetch(new URL("./game.html", import.meta.url));
    if (!response.ok) throw new Error("Game file unavailable");
    mountLocal(await response.text());
  } catch {
    startOnline();
    errorKey = "missing";
  }
} else startOnline();
try {
  saved = await storedGame();
} catch {}
render();
