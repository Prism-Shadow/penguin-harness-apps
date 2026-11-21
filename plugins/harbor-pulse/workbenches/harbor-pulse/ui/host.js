import game from "./game-config.js";

const byId = (id) => document.getElementById(id);
const labels = {
  zh: {
    controls: "操作",
    credit: "创意来自 riba2534",
    mute: "静音",
    unmute: "开启声音",
    hint: "选择本地运输船 HTML 游戏文件，即可在这里游玩。",
    open: "打开游戏 HTML",
    replace: "更换游戏文件",
    invalid: "请选择包含完整游戏的 HTML 文件。",
    unsaved: "游戏已打开。浏览器无法保存这份文件，下次请重新选择。",
    missing:
      "无法读取工作台内的游戏文件。请重新导入工作台，或选择本地游戏 HTML。",
  },
  en: {
    controls: "Controls",
    credit: "Original idea by riba2534",
    mute: "Mute",
    unmute: "Unmute",
    hint: "Choose your local Transport Ship HTML file to play here.",
    open: "Open game HTML",
    replace: "Change game file",
    invalid: "Choose a self-contained game HTML file.",
    unsaved:
      "Game opened. Choose the file again next time because this browser could not save it.",
    missing:
      "The bundled game could not be opened. Import the workbench again or choose a local game HTML.",
  },
};
let parentRoot;
try {
  if (window.parent !== window)
    parentRoot = window.parent.document.documentElement;
} catch {}
let frame,
  errorKey,
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
  document.documentElement.lang = lang;
  document.title = byId("name").textContent =
    lang === "zh" ? game.zh : game.name;
  for (const key of ["controls", "credit", "hint", "open", "replace"])
    byId(key).textContent = w[key];
  byId("instructions").textContent =
    lang === "zh" ? game.controlsZh : game.controls;
  byId("sound").textContent = muted ? w.unmute : w.mute;
  byId("sound").setAttribute("aria-pressed", String(muted));
  byId("sound").hidden = !ready;
  byId("replace").hidden = !frame || game.bundled;
  byId("error").textContent = w[errorKey] || "";
  byId("error").hidden = !errorKey;
  if (frame) frame.title = document.title;
  if (ready)
    frame.contentWindow.postMessage(
      { type: "penguin.game-audio", muted, lang },
      "*",
    );
}
function mount(html) {
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
  errorKey = undefined;
  byId("empty").hidden = true;
  byId("viewport").append(frame);
  render();
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
for (const key of ["open", "replace"])
  byId(key).onclick = () => byId("file").click();
byId("file").onchange = async ({ target }) => {
  const file = target.files[0];
  target.value = "";
  if (!file) return;
  try {
    const html = await file.text();
    mount(html);
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
try {
  if (game.bundled) {
    const response = await fetch(new URL("./game.html", import.meta.url));
    if (!response.ok) throw new Error("Game file unavailable");
    mount(await response.text());
  } else {
    const html = await storedGame();
    if (html) mount(html);
  }
} catch {
  if (game.bundled) errorKey = "missing";
}
byId("empty").hidden = Boolean(frame);
render();
