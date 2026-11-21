import { words, language } from "./words.js";
import { outline, excerpts, readAgentGraph } from "./model.js";
import {
  localFiles,
  githubFiles,
  pastedText,
  sourceLink,
  library,
  sample,
} from "./inputs.js";
import { mountReader } from "./viewer.js";
const $ = (id) => document.getElementById(id);
let lang = language(),
  w = words[lang],
  shelf,
  studies = [],
  study,
  graph,
  view,
  epoch = 0;
const langOfStudy = (s) => s.ai && s.aiLang === lang;
function node(tag, text, cls) {
  const e = document.createElement(tag);
  if (text) e.textContent = text;
  if (cls) e.className = cls;
  return e;
}
function button(text, fn, cls) {
  const b = node("button", text, cls);
  b.type = "button";
  b.onclick = fn;
  return b;
}
function status(t) {
  $("status").textContent = t ?? "";
}
function ui() {
  document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  document.title = w.title;
  for (const [id, key] of [
    ["brand", "title"],
    ["import", "import"],
    ["ai", "assistant"],
    ["export", "export"],
    ["library-label", "library"],
    ["forget", "removeShort"],
  ])
    $(id).textContent = w[key];
  $("dismiss").ariaLabel = w.close;
  $("mode").ariaLabel = w.show;
}
function list() {
  const sel = $("library");
  sel.replaceChildren();
  for (const s of [
    sample(lang),
    ...studies
      .filter((s) => !s.id.startsWith("example-"))
      .sort((a, b) => b.updated - a.updated),
  ]) {
    const o = node("option", s.id.startsWith("example-") ? w.sample : s.title);
    o.value = s.id;
    sel.append(o);
  }
  sel.value = study.id;
  $("forget").hidden = study.id.startsWith("example-");
}
async function save(s) {
  try {
    await shelf.save(s);
  } catch {
    status(w.storeFail);
  }
}
function keep(s) {
  const i = studies.findIndex((old) => old.id === s.id);
  if (i < 0) studies.push(s);
  else studies[i] = s;
  return save(s);
}
function show(s) {
  study = s;
  const e = ++epoch;
  closeDialog();
  status("");
  list();
  $("title").textContent = s.title;
  $("scope").textContent = w.scope(s.files.length, s.total);
  $("scope").title = w.limited + " " + w.cap;
  $("revision").textContent = s.revision
    ? w.commit(s.revision.slice(0, 8))
    : s.id.startsWith("example-")
      ? w.sampleLabel
      : w.storage;
  if (s.files.length < s.total || s.truncated)
    status((s.truncated ? w.limitedTree + " " : "") + w.limited);
  else if (s.id.startsWith("example-")) status(w.exampleHint);
  const ai = langOfStudy(s);
  $("mode").hidden = !ai;
  $("mode").replaceChildren();
  for (const key of ["outline", "ai"]) {
    const o = node("option", w[key]);
    o.value = key;
    $("mode").append(o);
  }
  const mode = ai && s.mode !== "outline" ? "ai" : "outline";
  $("mode").value = mode;
  graph = mode === "ai" ? s.ai : outline(s.files);
  view = mountReader($("reader"), {
    study: s,
    graph,
    words: w,
    sourceUrl: (n) => sourceLink(s, n),
    selected: s.selection?.[mode],
    remember: (id) => {
      s.selection = { ...s.selection, [mode]: id };
      void keep(s);
    },
  });
  $("ai").onclick = ask;
  $("ai").disabled = !!s.job;
  if (s.job) void poll(s, e);
}
function modal(title) {
  const d = $("dialog");
  $("dialog-title").textContent = title;
  const content = $("dialog-content");
  content.replaceChildren();
  if (!d.open) d.showModal();
  return content;
}
function closeDialog() {
  if ($("dialog").open) $("dialog").close();
}
function filesButton(text, folder) {
  const input = node("input");
  input.type = "file";
  input.multiple = true;
  input.hidden = true;
  if (folder) input.setAttribute("webkitdirectory", "");
  else
    input.accept =
      ".md,.markdown,.mdx,.txt,.rst,.adoc,.js,.ts,.tsx,.jsx,.py,.rs,.go,.java,.c,.h,.cpp,.kt,.swift,.html,.css,.json,.yaml,.yml,.sh,.rb,.php,.sql,.xml,.toml,.lua,.r,.dart,.jl,.zig";
  input.onchange = () => {
    if (input.files.length)
      void openImport(
        () => localFiles(input.files, folder),
        (error) => imports({ error }),
      );
  };
  const b = button(text, () => input.click());
  input.onclick = (e) => e.stopPropagation();
  b.append(input);
  return b;
}
function imports({ url = "", text = "", error = "" } = {}) {
  const c = modal(w.newTitle);
  if (error) {
    const alert = node("p", error, "dialog-error");
    alert.setAttribute("role", "alert");
    c.append(alert);
  } else c.append(node("p", w.hint));
  const row = node("div", null, "import-kind");
  row.append(filesButton(w.folder, true), filesButton(w.docs, false));
  c.append(row, node("small", w.types), node("hr", null, "divider"));
  const pasteLabel = node("label", w.paste),
    area = node("textarea");
  area.rows = 4;
  area.placeholder = w.pastePlaceholder;
  area.value = text;
  pasteLabel.append(area);
  const read = button(w.pasteGo, () =>
    openImport(
      async () => pastedText(area.value, w.pasteName),
      (error) => imports({ text: area.value, error }),
    ),
  );
  read.disabled = !text.trim();
  area.oninput = () => (read.disabled = !area.value.trim());
  c.append(pasteLabel, read, node("hr", null, "divider"));
  const label = node("label", w.github),
    field = node("input");
  field.type = "url";
  field.placeholder = "https://github.com/owner/repository";
  field.value = url;
  label.append(field);
  const go = button(w.fetch, () =>
    openImport(
      () => githubFiles(field.value),
      (error) => imports({ url: field.value, error }),
    ),
  );
  go.disabled = !url.trim();
  field.oninput = () => (go.disabled = !field.value.trim());
  field.onkeydown = (e) => {
    if (e.key !== "Enter") return;
    // Otherwise the key also presses the Import button that gets focus back, reopening this dialog.
    e.preventDefault();
    if (!go.disabled) go.click();
  };
  c.append(label, node("small", w.repoHelp), go);
  (error && url ? field : error && text ? area : null)?.focus();
}
function forget() {
  const old = study;
  if (old.id.startsWith("example-")) return;
  const m = modal(w.confirmRemove);
  m.append(
    node("p", old.title),
    button(w.cancel, closeDialog),
    button(w.remove, async () => {
      try {
        await shelf.drop(old.id);
        studies = studies.filter((s) => s.id !== old.id);
        show(sample(lang));
      } catch {
        closeDialog();
        status(w.storeFail);
      }
    }),
  );
}
async function openImport(read, again) {
  const current = ++epoch;
  closeDialog();
  status(w.loading);
  try {
    const s = await read();
    if (current !== epoch) return;
    show(s);
    await keep(s);
    list();
  } catch (err) {
    if (current !== epoch) return;
    const message = w[err.message] ?? w.failed;
    // Back in the dialog with what was typed, so the next try is one click away.
    if (again) {
      status("");
      again(message);
    } else status(message);
  }
}
function ask() {
  const samples = excerpts(study.files);
  const c = modal(w.aiTitle);
  c.append(
    node(
      "p",
      w.aiInfo(
        samples.length,
        samples.reduce((n, s) => n + s.lines.length, 0),
      ),
    ),
  );
  c.append(
    button(w.run, () => startAgent(samples), "accent"),
    button(w.cancel, closeDialog),
  );
}
async function request(path, data) {
  const res = await fetch("../api" + path, {
    method: data ? "POST" : "GET",
    headers: data ? { "content-type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    signal: AbortSignal.timeout(25000),
  });
  const body = await res.json();
  if (!res.ok) throw Error(body.error ?? "error");
  return body;
}
async function startAgent(samples) {
  const s = study;
  closeDialog();
  if (s.job) return;
  const job = { key: crypto.randomUUID(), lang, samples };
  s.job = job;
  await keep(s);
  $("ai").disabled = true;
  status(w.working);
  try {
    await submit(job);
    if (study === s) await poll(s, epoch);
  } catch (err) {
    if (s.job === job) {
      delete s.job;
      await keep(s);
    }
    if (study === s) {
      $("ai").disabled = false;
      status(w[err.message] ?? w.error);
    }
  }
}
async function submit(job) {
  return request("/explain", {
    key: job.key,
    lang: job.lang,
    samples: job.samples,
  });
}
async function poll(s, e) {
  const job = s.job;
  if (!job) return;
  status(w.working);
  for (let i = 0; i < 180 && epoch === e && s.job === job; i++) {
    try {
      let result;
      try {
        result = await request("/explanations/" + job.key);
      } catch (err) {
        if (err.message !== "missing") throw err;
        await submit(job);
        continue;
      }
      if (result.status === "running") {
        await new Promise((r) => setTimeout(r, 1200));
        continue;
      }
      if (result.status === "failed" || typeof result.text !== "string")
        throw Error("error");
      let next;
      try {
        next = readAgentGraph(result.text, job.samples);
      } catch {
        throw Error("invalidMap");
      }
      s.ai = next;
      s.aiLang = job.lang;
      s.mode = "ai";
      delete s.job;
      await keep(s);
      if (epoch === e) {
        show(s);
        status(w.done);
      }
      return;
    } catch (err) {
      if (epoch !== e) return;
      if (err instanceof TypeError || err.name === "TimeoutError") {
        status(w.stalled);
        $("ai").disabled = false;
        $("ai").onclick = () => show(s);
        return;
      }
      delete s.job;
      await keep(s);
      $("ai").disabled = false;
      status(w[err.message] ?? w.error);
      return;
    }
  }
  if (epoch === e && s.job === job) {
    status(w.stalled);
    $("ai").disabled = false;
    $("ai").onclick = () => show(s);
  }
}
async function exportStudy() {
  const s = study,
    g = graph,
    selected = view.selected(),
    c = modal(w.export);
  c.append(
    node("p", w.exportInfo),
    button(
      w.save,
      async () => {
        try {
          const css = await (await fetch("./style.css")).text(),
            native = await (await fetch("./vendor/archify.js")).text(),
            diagrams = await (await fetch("./diagram.js")).text(),
            viewer = await (await fetch("./viewer.js")).text(),
            strings = await (await fetch("./words.js")).text();
          const safe = (o) => JSON.stringify(o).replace(/</g, "\\u003c");
          const data = {
            study: { title: s.title, files: s.files },
            graph: g,
            selected,
            lang,
            urls: Object.fromEntries(
              g.nodes.map((n) => [n.id, sourceLink(s, n)]),
            ),
          };
          const script =
            native +
            "\n" +
            diagrams.replace(/^export /gm, "") +
            "\n" +
            viewer.replace(/^import .*;$/gm, "").replace(/^export /gm, "") +
            "\n" +
            strings.replace(/^export /gm, "") +
            '\nconst data=JSON.parse(document.getElementById("study").textContent);document.title=data.study.title; document.querySelector("h1").textContent=data.study.title;mountReader(document.getElementById("reader"),{...data,words:words[data.lang],sourceUrl:n=>data.urls[n.id]});';
          const html =
            '<!doctype html><html lang="' +
            lang +
            '"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; frame-src about: blob: data:; font-src data:; img-src data: blob:; style-src \'unsafe-inline\'; script-src \'unsafe-inline\'"><title>Study Map</title><style>' +
            css +
            '</style></head><body class="exported"><main><h1></h1><div id="reader"></div></main><script type="application/json" id="study">' +
            safe(data) +
            "</script><script>" +
            script.replace(/<\/script/gi, "<\\/script") +
            "</script></body></html>";
          const url = URL.createObjectURL(
              new Blob([html], { type: "text/html;charset=utf-8" }),
            ),
            a = node("a");
          a.href = url;
          a.download =
            s.title.replace(/[^\p{L}\p{N}_. -]/gu, "-").slice(0, 90) + ".html";
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 10000);
          closeDialog();
        } catch {
          closeDialog();
          status(w.failed);
        }
      },
      "accent",
    ),
    button(w.cancel, closeDialog),
  );
}
ui();
$("import").onclick = () => imports();
$("forget").onclick = forget;
$("ai").onclick = ask;
$("export").onclick = exportStudy;
$("mode").onchange = () => {
  study.mode = $("mode").value;
  void keep(study);
  show(study);
};
$("library").onchange = () => {
  const id = $("library").value;
  show(studies.find((s) => s.id === id) ?? sample(lang));
};
try {
  shelf = library();
  studies = await shelf.all();
} catch {}
const recent = studies
  .filter((s) => !s.id.startsWith("example-"))
  .sort((a, b) => b.updated - a.updated)[0];
show(recent ?? studies.find((s) => s.id === "example-" + lang) ?? sample(lang));
try {
  if (parent !== window)
    new MutationObserver(() => {
      const next = language();
      if (next !== lang) {
        lang = next;
        w = words[lang];
        ui();
        show(study.id.startsWith("example-") ? sample(lang) : study);
      }
    }).observe(parent.document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"],
    });
} catch {}
