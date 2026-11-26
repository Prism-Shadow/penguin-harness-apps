/* LaTeX Paper Desk: the page.
 *
 * No framework and no outside dependency. The project lives in the workbench's handler
 * (`../api/state` says what is open, `../api/file` reads and writes a source file), and the page
 * keeps the open file's text in memory so typing does not cross the network.
 *
 * The PDF comes from `../api/pdf`, which answers the last build; a build is identified by its
 * stamp, so the pages are redrawn only when a compile actually produced a new one. The host frames
 * a workbench in a sandbox that blocks the browser's own PDF viewer, so `pdfview.js` draws the
 * pages to canvases instead of pointing a frame at them. The Agent is asked for located edits
 * (`POST ../api/ai`), never for a whole file, and the reply is polled (`GET ../api/jobs/<id>`)
 * until it is done; applying an edit is another request (`POST ../api/edits`), followed by a
 * compile.
 */
import { draw, goTo, sheetAt } from "./pdfview.js";
import { importBody } from "./zip.js";
import { lang, setLang, t } from "./strings.js";

const $ = (selector) => document.querySelector(selector);

const state = {
  project: null,
  current: null,
  text: "",
  saved: "",
  stamp: "",
  pdfStamp: "",
  job: null,
  polling: null,
  pollGen: 0,
  asset: null,
  eol: "\n",
  pages: 0,
  lastJobs: [],
  lastDiags: [],
};

const api = async (path, init) => {
  const res = await fetch(`../api${path}`, {
    cache: "no-store",
    ...(init ?? {}),
  });
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  return { ok: res.ok, status: res.status, body };
};

const post = (path, value) =>
  api(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(value),
  });

function say(message, tone) {
  const notice = $("#notice");
  notice.textContent = message;
  notice.dataset.tone = tone ?? "";
  notice.hidden = message === "";
}

function explain(reply) {
  const code = reply.body?.error;
  if (typeof code === "string") {
    const text = t(`err.${code}`);
    if (!text.startsWith("err.")) return text;
    if (typeof reply.body.message === "string") return reply.body.message;
  }
  return t("err.network");
}

/* ---------------------------------------------------------------- chrome */

function paint() {
  for (const node of document.querySelectorAll("[data-i]")) {
    node.textContent = t(node.dataset.i);
  }
  for (const node of document.querySelectorAll("[data-i-ph]")) {
    node.placeholder = t(node.dataset.iPh);
  }
  $("#lang").textContent = lang() === "zh" ? "English" : "中文";
  document.documentElement.lang = lang() === "zh" ? "zh" : "en";
}

function engineBadge(engines) {
  const badge = $("#engine");
  if (!engines || engines.length === 0) {
    badge.textContent = t("engine.none");
    badge.dataset.tone = "danger";
    badge.title = t("status.noEngine");
    return;
  }
  badge.textContent = engines[0];
  badge.dataset.tone = "success";
  badge.title = engines.join(", ");
}

/* ---------------------------------------------------------------- files */

function tree(files) {
  const root = $("#tree");
  root.replaceChildren();
  let folder = null;
  for (const file of files) {
    const cut = file.path.lastIndexOf("/");
    const dir = cut === -1 ? "" : file.path.slice(0, cut);
    if (dir !== folder) {
      folder = dir;
      const heading = document.createElement("p");
      heading.className = "dir";
      heading.textContent = dir === "" ? t("files.root") : dir;
      root.append(heading);
    }
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = cut === -1 ? file.path : file.path.slice(cut + 1);
    if (file.binary) button.classList.add("binary");
    if (file.path === state.current)
      button.setAttribute("aria-current", "true");
    button.addEventListener("click", () => void open(file.path));
    root.append(button);
  }
  $("#files-empty").hidden = files.length > 0;
}

function gutter(lines, mark) {
  const root = $("#gutter");
  root.replaceChildren();
  for (let i = 1; i <= lines; i++) {
    const row = document.createElement("b");
    row.textContent = String(i);
    if (mark !== null && i >= mark.from && i <= mark.to)
      row.classList.add("on");
    root.append(row);
  }
}

function scrollTo(line, lines) {
  const editor = $("#editor");
  if (line === null) return;
  const step = parseFloat(getComputedStyle(editor).lineHeight) || 20;
  const target = Math.max(0, (line - 3) * step);
  editor.scrollTop = Math.min(
    target,
    Math.max(0, lines * step - editor.clientHeight),
  );
  $("#gutter").scrollTop = editor.scrollTop;
}

/** The 1-based line the caret sits on, which is the line a reader wants to find in the PDF. */
function cursorLine() {
  const editor = $("#editor");
  return editor.value.slice(0, editor.selectionStart).split("\n").length;
}

function showText(mark) {
  const binary = state.current !== null && state.asset !== null;
  const editor = $("#editor");
  // The header names the open file: open() reaches here through every path, so the label
  // cannot drift from what the editor is showing.
  $("#current").textContent = state.current ?? t("files.none");
  editor.hidden = binary;
  $("#asset").hidden = !binary;
  $("#save").disabled = binary || state.text === state.saved;
  const dirty = state.text !== state.saved;
  $("#dirty").hidden = binary || !dirty;
  $("#dirty").textContent = t("editor.dirty");
  if (binary) {
    $("#asset").alt = state.current ?? "";
    // Only formats a browser draws get a picture; anything else stays a named placeholder.
    if (state.asset !== "") $("#asset").src = state.asset;
    else $("#asset").removeAttribute("src");
    if (mark !== undefined && mark !== null)
      say(t("files.binaryMark"), "attention");
    return;
  }
  editor.value = state.text.replace(/\r\n/g, "\n");
  const lines = state.text === "" ? 0 : state.text.split("\n").length;
  gutter(lines, mark ?? null);
  scrollTo(mark?.from ?? null, lines);
}

async function open(path) {
  const reply = await api(`/file?path=${encodeURIComponent(path)}`);
  if (!reply.ok || reply.body === null) {
    say(explain(reply));
    return;
  }
  state.current = path;
  const binary = reply.body.binary === true;
  state.text = binary ? "" : String(reply.body.data ?? "");
  state.saved = state.text;
  state.eol = !binary && /(?:^|[^\r])\r\n/.test(state.text) ? "\r\n" : "\n";
  const mime = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
  }[String(path).split(".").pop().toLowerCase()];
  state.asset = !binary
    ? null
    : mime === undefined
      ? ""
      : `data:${mime};base64,${String(reply.body.data ?? "")}`;
  say("");
  tree(state.project?.files ?? []);
  showText(null);
}

async function refresh(focus) {
  const reply = await api("/state");
  if (!reply.ok || reply.body === null) {
    say(explain(reply));
    return;
  }
  state.project = reply.body.project;
  state.stamp = reply.body.project?.stamp ?? "";
  state.lastJobs = reply.body.jobs ?? [];
  renderJobs(reply.body.jobs ?? []);
  if (state.project === null) {
    state.current = null;
    state.text = "";
    state.saved = "";
    tree([]);
    showText(null);
    $("#current").textContent = t("files.none");
    return;
  }
  tree(state.project.files);
  const keep =
    focus ??
    state.current ??
    state.project.files.find(
      (entry) => !entry.binary && /(?:^|\/)main\.tex$/i.test(entry.path),
    )?.path ??
    state.project.files.find((entry) => !entry.binary)?.path ??
    null;
  if (keep !== null && keep !== state.current) await open(keep);
  else if (state.current !== null) {
    $("#current").textContent = state.current;
    showText(null);
  }
}

/* ---------------------------------------------------------------- compile */

async function compile() {
  if (state.project === null) {
    say(t("err.noProject"));
    return;
  }
  const reply = await post("/compile", {});
  if (!reply.ok || reply.body === null) {
    say(explain(reply));
    return;
  }
  state.stamp = reply.body.stamp ?? state.stamp;
  renderDiagnostics(reply.body.diagnostics ?? []);
  if (reply.body.ok) {
    state.pdfStamp = state.stamp;
    // A fresh build supersedes every stale-source banner the reader was shown.
    say("");
    await showPdf(reply.body.pages ?? 0);
  } else {
    say(t("status.failed"), "danger");
  }
}

const pdfUrl = () => `../api/pdf?v=${encodeURIComponent(state.pdfStamp)}`;

/** Draws the new build. pdf.js is the only way in: the host's frame sandbox blocks the browser's
 * own PDF viewer, so a frame pointed at these bytes shows a blocked page, not the paper. */
async function showPdf(pages) {
  const container = $("#pdf-pages");
  state.pages = pages;
  $("#pages").textContent = t("pdf.pages", { n: pages });
  $("#open-pdf").hidden = false;
  $("#locate").hidden = false;
  try {
    container.hidden = false;
    $("#pdf-none").hidden = true;
    await draw(container, pdfUrl(), 1);
    say("");
  } catch (error) {
    container.hidden = true;
    $("#pdf-none").hidden = false;
    $("#pdf-none").textContent = t("pdf.blocked");
    say(t("pdf.blocked"), "danger");
    console.error(error);
  }
}

/** Falls back to the bytes themselves, which the reader can open in its own viewer. */
async function downloadPdf() {
  const res = await fetch(pdfUrl(), { cache: "no-store" });
  if (!res.ok) {
    say(t("pdf.blocked"), "danger");
    return;
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${state.project?.name ?? "paper"}.pdf`;
  link.click();
  globalThis.setTimeout(() => URL.revokeObjectURL(url), 10_000);
  say(t("pdf.downloaded"));
}

function renderDiagnostics(list) {
  state.lastDiags = list;
  const rows = $("#diags-list");
  rows.replaceChildren();
  $("#diags-none").hidden = list.length > 0;
  for (const entry of list) {
    const item = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    const where = document.createElement("span");
    where.className = "where";
    where.textContent = entry.file === "" ? "—" : `${entry.file}:${entry.line}`;
    const badge = document.createElement("span");
    badge.className = "wb-badge";
    badge.dataset.tone = entry.severity === "error" ? "danger" : "attention";
    badge.textContent =
      entry.severity === "error" ? t("diag.error") : t("diag.warning");
    button.append(badge, where, document.createTextNode(entry.message));
    if (entry.file !== "") {
      button.addEventListener("click", () => {
        void open(entry.file).then(() => {
          const from = entry.line > 0 ? entry.line : 1;
          const lines = state.text.split("\n").length;
          showText({ from, to: from });
          scrollTo(from, lines);
        });
      });
    } else button.disabled = true;
    item.append(button);
    rows.append(item);
  }
}

/* ---------------------------------------------------------------- agent */

async function ask(kind) {
  const needsFile = kind === "polish" || kind === "figure";
  if (needsFile && state.current === null) {
    say(t("ai.needsFile"));
    return;
  }
  setBusy(true);
  say(t("ai.running"));
  const body = {
    kind,
    lang: lang(),
    instruction: $("#instruction").value.trim(),
  };
  if (needsFile) body.path = state.current;
  const reply = await post("/ai", body);
  if (!reply.ok || reply.body === null) {
    setBusy(false);
    say(explain(reply), "danger");
    return;
  }
  state.job = { id: reply.body.jobId, kind };
  $("#ai-status").textContent = t("ai.running");
  poll();
}

function poll() {
  // One live loop at a time: every poll() call bumps the generation, and an older
  // closure that wakes up after that sees a stale number and dies instead of
  // scheduling again. A shared timer id alone cannot do this, because two closures
  // already in flight would leapfrog each other's clearTimeout and multiply.
  const mine = (state.pollGen = (state.pollGen ?? 0) + 1);
  if (state.polling !== null) clearTimeout(state.polling);
  state.polling = setTimeout(async () => {
    if (state.job === null || state.pollGen !== mine) return;
    const reply = await api(`/jobs/${state.job.id}`);
    if (state.pollGen !== mine) return;
    if (!reply.ok || reply.body === null) {
      setBusy(false);
      say(explain(reply), "danger");
      return;
    }
    if (reply.body.status === "running") {
      $("#ai-status").textContent =
        reply.body.phase === "repair" ? t("ai.repairing") : t("ai.running");
      poll();
      return;
    }
    setBusy(false);
    $("#ai-status").textContent = "";
    say("");
    state.job = null;
    if (reply.body.status === "failed") {
      const key = `err.${reply.body.error ?? "agent"}`;
      // A missing key falls back to the key itself, so an error string that has no table entry
      // ("Error: timeout" from an older build, say) still reads as a sentence.
      const said = t(key);
      say(said.startsWith("err.") ? t("err.agent") : said, "danger");
      return;
    }
    showAnswer(
      reply.body.kind ?? state.job?.kind ?? "polish",
      reply.body.result,
    );
  }, 1200);
}

function setBusy(busy) {
  for (const button of document.querySelectorAll(".actions button"))
    button.disabled = busy;
  $("#compile").disabled = busy;
}

function showAnswer(kind, result) {
  const out = $("#assistant-out");
  out.replaceChildren();
  const card = document.createElement("div");
  card.className = "card";
  const summary = document.createElement("p");
  summary.className = "summary";
  summary.textContent = String(result?.summary ?? "");
  card.append(summary);
  if (Number(result?.skipped ?? 0) > 0) {
    const note = document.createElement("p");
    note.className = "hint";
    note.textContent = t("ai.skipped", { n: Number(result.skipped) });
    card.append(note);
  }
  if (kind === "review") {
    const issues = Array.isArray(result?.issues) ? result.issues : [];
    const hint = document.createElement("p");
    hint.className = "hint";
    hint.textContent = t("ai.reviewDone");
    card.append(hint);
    const list = document.createElement("ul");
    list.className = "rows";
    for (const issue of issues) list.append(issueRow(issue));
    card.append(list);
    if (Array.isArray(result?.dropped) && result.dropped.length > 0) {
      const note = document.createElement("p");
      note.className = "hint";
      note.textContent = t("ai.dropped", { n: result.dropped.length });
      card.append(note);
    }
    out.append(card);
    return;
  }
  const rows = Array.isArray(result?.rows) ? result.rows : [];
  // Notes first: a whole-file rewrite can fill the whole diff budget, and the reader must see
  // what is missing before scrolling hundreds of rows.
  if (
    kind === "bib" &&
    Array.isArray(result?.missingKeys) &&
    result.missingKeys.length > 0
  ) {
    const note = document.createElement("p");
    note.className = "hint";
    note.textContent = t("bib.missing", {
      keys: result.missingKeys.join(", "),
    });
    card.append(note);
  }
  if (typeof result?.notes === "string" && result.notes.trim() !== "") {
    const note = document.createElement("p");
    note.className = "hint";
    note.textContent = result.notes;
    card.append(note);
  }
  card.append(diffView(rows, kind === "bib"));
  const apply = document.createElement("button");
  apply.type = "button";
  apply.className = "wb-primary";
  apply.textContent = t("diff.apply");
  apply.addEventListener("click", () => void applyEdits(result, apply));
  const drop = document.createElement("button");
  drop.type = "button";
  drop.textContent = t("diff.discard");
  drop.addEventListener("click", () => {
    out.replaceChildren();
    say(t("ai.discarded"));
  });
  const bar = document.createElement("div");
  bar.className = "row";
  bar.append(apply, drop);
  card.append(bar);
  out.append(card);
}

function issueRow(issue) {
  const item = document.createElement("li");
  const line = document.createElement("div");
  line.className = "issue";
  const badges = document.createElement("span");
  badges.className = "badges";
  const category = document.createElement("span");
  category.className = "wb-badge";
  category.dataset.tone = "info";
  category.textContent = tag("cat", issue.category);
  const severity = document.createElement("span");
  severity.className = "wb-badge";
  severity.dataset.tone =
    issue.severity === "high"
      ? "danger"
      : issue.severity === "low"
        ? "neutral"
        : "attention";
  severity.textContent = tag("sev", issue.severity);
  badges.append(category, severity);
  const body = document.createElement("div");
  body.className = "body";
  const jump = document.createElement("button");
  jump.type = "button";
  jump.style.all = "unset";
  jump.style.cursor = "pointer";
  jump.textContent = `${issue.file}:${issue.line}`;
  jump.addEventListener("click", () => {
    void open(String(issue.file)).then(() => {
      // The file may have moved since the review ran: find the quote again so the
      // reader lands on the words, not on a stale line number.
      const at = relocate(issue.quote, Number(issue.line));
      const from = at ?? Number(issue.line);
      const lines = state.text.split("\n").length;
      showText({
        from,
        to: at === null ? Number(issue.endLine ?? issue.line) : at,
      });
      scrollTo(from, lines);
    });
  });
  const diagnosis = document.createElement("span");
  diagnosis.className = "diagnosis";
  diagnosis.textContent = String(issue.diagnosis ?? "");
  body.append(jump, diagnosis);
  line.append(badges, body);
  // The server pre-diffed the suggestion against the text it anchored to: rows of
  // {kind, text}, drawn with the same palette as the polish card's diff.
  if (Array.isArray(issue.preview) && issue.preview.length > 0) {
    const shown = document.createElement("div");
    shown.className = "diff small";
    for (const row of issue.preview) {
      const rowNode = document.createElement("div");
      rowNode.className = String(row.kind ?? "same");
      rowNode.textContent = `${row.kind === "added" ? "+" : row.kind === "removed" ? "-" : " "} ${row.text ?? ""}`;
      shown.append(rowNode);
    }
    item.append(shown);
  }
  item.append(line);
  if (issue.edit !== null && typeof issue.edit === "object") {
    const adopt = document.createElement("button");
    adopt.type = "button";
    adopt.textContent = t("ai.apply");
    adopt.style.marginLeft = "0.2rem";
    adopt.addEventListener("click", async () => {
      adopt.disabled = true;
      const failed = await patchFile(issue.file, [issue.edit]);
      if (failed === null) {
        item.remove();
        say("");
        await compile();
        return;
      }
      refuse(item, failed);
      adopt.disabled = false;
    });
    item.append(adopt);
  }
  return item;
}

/** Finds the quote again in the open file: the 1-based line it now sits on, or null. */
function relocate(quote, fallback) {
  const text = typeof quote === "string" && quote.trim() !== "" ? quote : null;
  if (text === null) return fallback;
  const lines = state.text.replace(/\r\n/g, "\n").split("\n");
  const wanted = text.replace(/\s+/g, " ").trim();
  if (wanted === "") return fallback;
  const hits = [];
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].replace(/\s+/g, " ").trim().includes(wanted)) hits.push(i + 1);
  }
  if (hits.length === 0) return fallback;
  // The closest hit to the line the review named wins; a tie keeps the upper one.
  let best = hits[0];
  for (const hit of hits) {
    if (Math.abs(hit - fallback) < Math.abs(best - fallback)) best = hit;
  }
  return best;
}

function tag(prefix, value) {
  const key = `${prefix}.${value}`;
  const text = t(key);
  return text.startsWith(`${prefix}.`) ? String(value ?? "") : text;
}

function diffView(rows, stats) {
  const box = document.createElement("div");
  box.className = "diff";
  // A whole-file rewrite is unreadable row by row: past the budget the card shows what a row
  // count instead, so the reader approves a summary rather than signing an endless wall.
  const budget = 600;
  if (stats === true && rows.length > budget) {
    const added = rows.filter((row) => row.kind === "added").length;
    const removed = rows.filter((row) => row.kind === "removed").length;
    const note = document.createElement("div");
    note.className = "hint";
    note.textContent = t("diff.wholeFile", {
      n: rows.length,
      a: added,
      r: removed,
    });
    box.append(note);
    return box;
  }
  const kept = rows.slice(0, budget);
  for (const row of kept) {
    const line = document.createElement("div");
    line.className = row.kind;
    line.textContent = `${row.kind === "added" ? "+" : row.kind === "removed" ? "-" : " "} ${row.text}`;
    box.append(line);
  }
  if (rows.length > kept.length) {
    const more = document.createElement("div");
    more.className = "hint";
    more.textContent = `… +${rows.length - kept.length}`;
    box.append(more);
  }
  return box;
}

/** Writes the edits; returns null on success, or the sentence that says why they were refused. */
async function patchFile(filePath, edits) {
  const reply = await post("/edits", { path: filePath, edits });
  if (!reply.ok || reply.body === null) return explain(reply);
  if (state.current === filePath) {
    state.text = String(reply.body.data ?? state.text);
    state.saved = state.text;
    showText(null);
  }
  return null;
}

/** One refusal note per card: a second failure replaces the first rather than stacking. */
function refuse(host, message) {
  let note = host.querySelector(":scope > .refused");
  if (note === null) {
    note = document.createElement("p");
    note.className = "hint refused";
    note.dataset.tone = "danger";
    host.prepend(note);
  }
  note.textContent = message;
}

async function applyEdits(result, button) {
  button.disabled = true;
  // The proposal names its own file: the reader may have opened another one while the Agent ran.
  const filePath = String(result.file ?? state.current ?? "");
  const edits = Array.isArray(result.edits) ? result.edits : [];
  const failed = await patchFile(filePath, edits);
  const card = button.closest(".card");
  if (failed === null) {
    // The proposal is spent: swap the card for a receipt so the reader cannot apply the same
    // edit twice against a file that has already moved.
    const done = document.createElement("div");
    done.className = "card";
    const said = document.createElement("p");
    said.className = "summary";
    said.textContent = t("ai.adopted");
    done.append(said);
    card?.replaceWith(done);
    say("");
    await compile();
    return;
  }
  if (card !== null) refuse(card, failed);
  button.disabled = false;
}

function renderJobs(jobs) {
  if (state.job !== null || jobs.length === 0) return;
  const last = jobs[jobs.length - 1];
  if (last.status === "running") {
    // A reload orphaned the poll loop: take the turn over again so its card still lands.
    state.job = { id: last.id, kind: last.kind };
    $("#ai-status").textContent = t("ai.running");
    poll();
    return;
  }
  $("#ai-status").textContent = `${t(`job.${last.kind}`) || last.kind} · ${
    last.status === "done" ? t("status.done") : last.status
  }`;
}
/* ---------------------------------------------------------------- wiring */

function bind() {
  $("#editor").addEventListener("input", () => {
    state.text = $("#editor").value;
    const lines = state.text.split("\n").length;
    gutter(lines, null);
    $("#save").disabled = state.text === state.saved;
    $("#dirty").hidden = state.text === state.saved;
    $("#dirty").textContent = t("editor.dirty");
  });
  $("#editor").addEventListener("scroll", () => {
    $("#gutter").scrollTop = $("#editor").scrollTop;
  });
  $("#save").addEventListener("click", async () => {
    if (state.current === null) return;
    const body =
      state.eol === "\r\n"
        ? state.text.replace(/\r\n/g, "\n").replace(/\n/g, "\r\n")
        : state.text;
    const reply = await post("/file", {
      path: state.current,
      data: body,
    });
    if (!reply.ok) {
      say(explain(reply), "danger");
      return;
    }
    state.saved = state.text;
    state.stamp = reply.body?.stamp ?? new Date().toISOString();
    $("#save").disabled = true;
    $("#dirty").hidden = true;
    say(t("notice.stale"));
  });
  $("#compile").addEventListener("click", () => void compile());
  for (const button of document.querySelectorAll(".actions [data-kind]")) {
    button.addEventListener("click", () => {
      const kind = button.dataset.kind;
      if (
        kind === "polish" ||
        kind === "review" ||
        kind === "bib" ||
        kind === "figure"
      )
        void ask(kind);
    });
  }
  $("#locate").addEventListener("click", async () => {
    if (state.current === null || state.pdfStamp !== state.stamp) {
      say(t("pdf.stale"));
      return;
    }
    const reply = await post("/forward", {
      path: state.current,
      line: cursorLine(),
    });
    if (!reply.ok || reply.body === null || reply.body.found !== true) {
      say(t("pdf.notFound"));
      return;
    }
    if (!goTo($("#pdf-pages"), reply.body.page, reply.body.y)) {
      say(t("pdf.notFound"));
      return;
    }
    say("");
  });
  // A double click on the sheet asks the server which source line that spot came from.
  $("#pdf-pages").addEventListener("dblclick", async (event) => {
    if (state.pdfStamp !== state.stamp) {
      say(t("pdf.stale"));
      return;
    }
    const sheet = event.target.closest(".pdf-sheet");
    if (sheet === null) return;
    const page = sheetAt(sheet);
    if (page === 0) return;
    const box = sheet.getBoundingClientRect();
    const pane = $("#pdf-pages").getBoundingClientRect();
    const share = Math.max(
      0,
      Math.min(1, (event.clientY - box.top) / box.height),
    );
    const reply = await post("/inverse", {
      page,
      y: share,
    });
    if (!reply.ok || reply.body === null || reply.body.found !== true) {
      say(t("pdf.inverseNotFound"));
      return;
    }
    await open(String(reply.body.file));
    const from = reply.body.line > 0 ? reply.body.line : 1;
    const lines = state.text.split("\n").length;
    showText({ from, to: from });
    scrollTo(from, lines);
    say("");
  });
  $("#open-pdf").addEventListener("click", () => void downloadPdf());
  $("#sample").addEventListener("click", async () => {
    const reply = await post("/sample", {});
    if (!reply.ok) {
      say(explain(reply), "danger");
      return;
    }
    await refresh();
    await compile();
  });
  $("#export").addEventListener("click", () => {
    if (state.project === null) {
      say(t("err.noProject"));
      return;
    }
    const link = document.createElement("a");
    link.href = "../api/export";
    link.download = `${state.project.name}.zip`;
    link.click();
  });
  $("#import").addEventListener("click", () => $("#archive").click());
  $("#archive").addEventListener("change", async () => {
    const file = $("#archive").files?.[0];
    $("#archive").value = "";
    if (!file) return;
    say(t("status.importing"));
    let body;
    try {
      body = await importBody(file);
    } catch {
      say(t("err.invalidFiles"), "danger");
      return;
    }
    const reply = await post("/import", body);
    if (!reply.ok) {
      say(explain(reply), "danger");
      return;
    }
    await refresh();
    await compile();
  });
  $("#lang").addEventListener("click", () => {
    setLang(lang() === "zh" ? "en" : "zh");
    paint();
    tree(state.project?.files ?? []);
    showText(null);
    // Repaint the derived views so no stale sentence survives the switch.
    $("#pages").textContent = t("pdf.pages", {
      n: state.pages ?? 0,
    });
    $("#ai-empty-note")?.remove();
    const empty = $("#assistant-out .empty[data-i]");
    if (empty !== null) empty.textContent = t("ai.empty");
    if (state.job === null) renderJobs(state.lastJobs ?? []);
    if (Array.isArray(state.lastDiags)) renderDiagnostics(state.lastDiags);
    $("#dirty").textContent = t("editor.dirty");
  });
  document.addEventListener("keydown", (event) => {
    const mod = event.metaKey || event.ctrlKey;
    if (!mod) return;
    if (event.key.toLowerCase() === "s") {
      event.preventDefault();
      if (!$("#save").disabled) $("#save").click();
    } else if (event.key === "Enter") {
      event.preventDefault();
      void compile();
    }
  });
}

async function start() {
  paint();
  bind();
  const probe = await api("/probe");
  engineBadge(probe.ok ? probe.body?.engines : []);
  await refresh();
  if (state.project !== null) await compile();
}

void start();
