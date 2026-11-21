import game from "./game-config.js";
const byId = (id) => document.getElementById(id);
const transport = game.source === "cf-transport-ship";
const words = {
  en: {
    controls: "Controls",
    import: "Open local HTML",
    online: "Play online",
    external: "Open author’s site ↗",
    sound: "Mute",
    unmute: "Unmute",
    local: "Imported game HTML",
    hosted: "Author’s online game",
    invalid: "Choose a self-contained game HTML.",
    unsaved:
      "Playing this file for this visit. Browser storage is unavailable.",
  },
  zh: {
    controls: "操作",
    import: "导入本地 HTML",
    online: "切回线上版",
    external: "作者试玩页 ↗",
    sound: "静音",
    unmute: "开启声音",
    local: "已导入的本地游戏",
    hosted: "作者托管的线上版",
    invalid: "请选择自包含的游戏 HTML。",
    unsaved: "已打开本地游戏。浏览器无法保存，下次请重新导入。",
  },
};
let parentRoot;
try {
  if (window.parent !== window)
    parentRoot = window.parent.document.documentElement;
} catch {}
const language = () =>
  /^(zh|cmn)/i.test(parentRoot?.lang || navigator.language) ? "zh" : "en";
let lang = language(),
  localFile,
  frame,
  soundReady = false,
  muted = false;
const savedSound = "penguin.arcade.muted." + game.id;
try {
  muted = localStorage.getItem(savedSound) === "true";
} catch {}
function update() {
  const w = words[lang];
  document.documentElement.lang = lang;
  document.title = byId("name").textContent =
    lang === "zh" ? game.zh : game.name;
  byId("controls").textContent = w.controls;
  byId("import").textContent = w.import;
  byId("online").textContent = w.online;
  byId("external").textContent = w.external;
  byId("credit").textContent =
    lang === "zh" ? "创意来自 riba2534" : "Original idea by riba2534";
  byId("instructions").textContent =
    lang === "zh" ? game.controlsZh : game.controls;
  byId("sound").textContent = muted ? w.unmute : w.sound;
  byId("sound").setAttribute("aria-pressed", String(muted));
  byId("sound").hidden = !soundReady;
  byId("import").hidden = !transport;
  byId("online").hidden = !transport || !localFile;
  byId("external").hidden = !transport;
  byId("source").textContent = transport
    ? localFile
      ? w.local
      : w.hosted
    : "";
}
function sendState() {
  if (soundReady)
    frame?.contentWindow.postMessage(
      { type: "penguin.game-audio", lang, muted },
      "*",
    );
}
function mount() {
  soundReady = false;
  frame = document.createElement("iframe");
  frame.title = lang === "zh" ? game.zh : game.name;
  frame.allow = "autoplay; fullscreen";
  // Imported code runs at an opaque origin and cannot read the Penguin app, its credentials,
  // or the IndexedDB where the workbench stores the chosen file.
  frame.setAttribute(
    "sandbox",
    transport
      ? "allow-scripts allow-pointer-lock"
      : "allow-scripts allow-same-origin allow-downloads allow-popups allow-pointer-lock",
  );
  if (transport && localFile) frame.srcdoc = localFile;
  else frame.src = transport ? game.url : "./game.html?lang=" + lang;
  byId("viewport").replaceChildren(frame);
  update();
}
window.addEventListener("message", (e) => {
  if (
    e.source !== frame?.contentWindow ||
    e.data?.type !== "penguin.game-audio-ready" ||
    (transport && !localFile)
  )
    return;
  soundReady = true;
  update();
  sendState();
});
function refreshLanguage() {
  const next = language();
  if (next === lang) return;
  lang = next;
  update();
  sendState();
  if (!transport)
    frame?.contentWindow.postMessage(
      { type: "penguin.game-language", lang },
      location.origin,
    );
}
if (parentRoot)
  new MutationObserver(refreshLanguage).observe(parentRoot, {
    attributes: true,
    attributeFilter: ["lang"],
  });
window.addEventListener("languagechange", refreshLanguage);
byId("sound").onclick = () => {
  muted = !muted;
  try {
    localStorage.setItem(savedSound, String(muted));
  } catch {}
  update();
  sendState();
  frame?.focus();
};
byId("controls").onclick = () => {
  const help = byId("help");
  help.hidden = !help.hidden;
  byId("controls").setAttribute("aria-expanded", String(!help.hidden));
};
byId("external").href = game.url;
byId("import").onclick = () => byId("file").click();
function savedFile(action, value) {
  return new Promise((resolve, reject) => {
    const opened = indexedDB.open("penguin.arcade.local-games", 1);
    opened.onupgradeneeded = () => opened.result.createObjectStore("files");
    opened.onerror = () => reject(opened.error);
    opened.onsuccess = () => {
      const db = opened.result,
        tx = db.transaction(
          "files",
          action === "get" ? "readonly" : "readwrite",
        );
      const store = tx.objectStore("files");
      const request =
        action === "get"
          ? store.get(game.id)
          : action === "delete"
            ? store.delete(game.id)
            : store.put(value, game.id);
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
function report(key) {
  byId("error").hidden = !key;
  byId("error").textContent = key ? words[lang][key] : "";
}
byId("file").onchange = async (event) => {
  const file = event.target.files[0];
  event.target.value = "";
  if (!file) return;
  try {
    const html = await file.text();
    if (!/<html[\s>]/i.test(html) || !/<script[\s>]/i.test(html))
      throw new Error();
    localFile = html;
    report("");
    mount();
    try {
      await savedFile("put", html);
    } catch {
      report("unsaved");
    }
  } catch {
    report("invalid");
  }
};
byId("online").onclick = async () => {
  try {
    await savedFile("delete");
  } catch {
    report("unsaved");
  }
  localFile = null;
  mount();
};
if (transport) {
  try {
    localFile = await savedFile("get");
  } catch {}
}
mount();
