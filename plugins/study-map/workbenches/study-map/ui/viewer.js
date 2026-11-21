import { mapDiagram } from "./diagram.js";
import { prose } from "./words.js";

// The source pane listens to selection in the native Archify passport, including
// selections from its finder, outline, keyboard, guided views and route tools.
function connectArchify(channel, theme) {
  // Archify's presentation stage fits the full graph vertically. In an embedded
  // phone-sized pane, also let its SVG shrink below the standalone 720px floor.
  const sizing = document.createElement("style");
  sizing.textContent =
    "@media(max-width:560px){.diagram-nav{max-width:calc(100% - 12px);overflow-x:auto;scrollbar-width:none}.diagram-nav button{white-space:nowrap;flex:none}html[data-present] .diagram-container>svg{min-width:0!important;max-width:100%!important;width:100%!important}html[data-present] .toolbar{left:0;right:0;width:100%;justify-content:center;gap:2px;transform:scale(.88);transform-origin:top center}html[data-present] .toolbar button{padding-inline:5px;min-width:0}.header .subtitle{display:none}}";
  document.head.append(sizing);
  const tell = (action, id) => parent.postMessage({ channel, action, id }, "*");
  // Follow the workbench's light or dark look; Archify's own switch still works.
  const follow = (want) => {
    if (
      (want === "light" || want === "dark") &&
      document.documentElement.getAttribute("data-theme") !== want
    )
      document.getElementById("btn-theme")?.click();
  };
  follow(theme);
  const svg = document.querySelector(".diagram-container svg");
  if (!svg) return;
  window.Archify?.presentation?.enter();
  let active = null;
  const emit = () => {
    const id = window.Archify?.focus?.active();
    if (id !== active) passage.hidden = true;
    if (typeof id === "string" && id !== active) tell("select", id);
    active = id;
  };
  new MutationObserver(emit).observe(svg, {
    subtree: true,
    attributes: true,
    attributeFilter: ["aria-pressed"],
  });
  // Append the source-backed explanation to the original Archify passport.
  const passage = document.createElement("div");
  const description = document.createElement("p"),
    citation = document.createElement("button");
  passage.append(description, citation);
  passage.hidden = true;
  document.querySelector("#focus-chip")?.append(passage);
  Object.assign(passage.style, {
    padding: "4px 12px 12px",
    fontSize: "12px",
    overflowWrap: "anywhere",
    lineHeight: "1.5",
    maxHeight: "10rem",
    overflow: "auto",
  });
  Object.assign(citation.style, {
    cursor: "pointer",
    color: "inherit",
    font: "inherit",
    background: "transparent",
    border: "none",
    padding: "4px 0",
    textDecoration: "underline",
  });
  citation.onclick = () => tell("source", active);
  addEventListener("message", (e) => {
    if (e.source !== parent || e.data?.channel !== channel) return;
    if (e.data.action === "theme") {
      follow(e.data.theme);
      return;
    }
    if (e.data.action === "evidence") {
      if (e.data.id !== window.Archify?.focus?.active()) return;
      description.textContent = e.data.text;
      citation.textContent = e.data.citation;
      passage.hidden = false;
      return;
    }
    if (e.data.action !== "focus") return;
    const target = document.getElementById("node-" + e.data.id);
    if (!target) return;
    window.Archify.focus.set(e.data.id, { toggle: false, updateUrl: false });
  });
  tell("ready");
}

export function mountReader(
  root,
  { study, graph, words: w, sourceUrl, remember, selected },
) {
  root.disposeReader?.();
  const d = root.ownerDocument,
    win = d.defaultView;
  const zh = d.documentElement.lang.startsWith("zh");
  // The app marks its frame light or dark; opened on its own, the system decides.
  const themeOf = () =>
    d.documentElement.classList.contains("dark")
      ? "dark"
      : d.documentElement.classList.contains("light")
        ? "light"
        : win.matchMedia?.("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
  const lang = zh ? "zh" : "en";
  const byId = new Map(graph.nodes.map((n) => [n.id, n]));
  const files = new Map(study.files.map((f) => [f.path, f]));
  let current = byId.get(selected) ?? graph.nodes[0],
    lastFile = "",
    lineList = [],
    lines = [];
  let scope = null,
    moduleGroups = new Map(),
    binding,
    frameChannel,
    ready = false,
    pending,
    indexOnly;
  const el = (tag, cls, text) => {
    const e = d.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };
  const btn = (text, fn) => {
    const b = el("button", "", text);
    b.type = "button";
    b.onclick = fn;
    return b;
  };
  const option = (value, text) => {
    const o = el("option", "", text);
    o.value = value;
    return o;
  };
  const region = el("div", "reader"),
    source = el("section", "source"),
    atlas = el("section", "atlas");
  const head = el("div", "head"),
    filePick = el("select"),
    range = el("span", "range");
  filePick.setAttribute("aria-label", w.source);
  for (const f of study.files) filePick.append(option(f.path, f.path));
  head.append(el("span", "caption", w.source), filePick, range);
  const code = el("div", "code");
  code.tabIndex = 0;
  code.setAttribute("aria-label", w.source);
  const detail = el("article", "detail");
  source.append(head, code, detail);
  const frame = el("iframe", "native-reader");
  frame.title = "Archify";
  frame.setAttribute("sandbox", "allow-scripts allow-downloads");
  frame.setAttribute("allow", "fullscreen");
  const bar = el("div", "head"),
    picker = el("select");
  picker.setAttribute("aria-label", w.jump);
  for (const n of graph.nodes)
    picker.append(option(n.id, n.label + " · " + n.path + ":" + n.start));
  const back = btn(w.overview, () => {
    scope = null;
    render();
  });
  const expand = btn(zh ? "专注看图" : "Expand diagram", () => {
    mobile("map");
    root.classList.toggle("diagram-wide");
    expand.textContent = root.classList.contains("diagram-wide")
      ? zh
        ? "分栏阅读"
        : "Split view"
      : zh
        ? "专注看图"
        : "Expand diagram";
  });
  const indexNotice = el(
    "p",
    "index-notice",
    zh
      ? "每个分支列出一项依赖或引用，每个节点都可以定位到原文。"
      : "Each branch lists a dependency or reference. Select a node to read its source.",
  );
  bar.append(back, picker, expand);
  atlas.append(bar, indexNotice, frame);
  region.append(source, atlas);
  const switcher = el("div", "mobile-tabs"),
    showMap = btn(w.map, () => mobile("map")),
    showSrc = btn(w.source, () => mobile("source"));
  switcher.append(showMap, showSrc);
  root.replaceChildren(switcher, region);
  function mobile(side) {
    root.dataset.side = side;
    showMap.setAttribute("aria-pressed", String(side === "map"));
    showSrc.setAttribute("aria-pressed", String(side === "source"));
  }
  mobile("map");
  function fileView(path, focusLine) {
    const f = files.get(path);
    if (!f) return;
    filePick.value = path;
    code.classList.toggle("prose", prose(path));
    if (lastFile !== path) {
      lastFile = path;
      lines = f.text.split("\n");
    }
    // Bounded windows leave large source files responsive without losing a cited line.
    const first = Math.max(1, Math.min(focusLine - 36, lines.length - 153)),
      last = Math.min(lines.length, first + 152);
    const fragment = d.createDocumentFragment();
    lineList = [];
    const move = (line) => {
      fileView(path, line);
      code
        .querySelector('[data-line="' + line + '"]')
        ?.scrollIntoView({ block: "nearest" });
    };
    if (first > 1)
      fragment.append(btn(w.earlier, () => move(Math.max(1, first - 55))));
    for (let i = first; i <= last; i++) {
      const row = el("div", "line");
      row.dataset.line = i;
      if (current.path === path && i >= current.start && i <= current.end)
        row.classList.add("marked");
      const number = btn(String(i), () => fromLine(i));
      number.tabIndex = i === focusLine ? 0 : -1;
      number.setAttribute("aria-label", w.line + " " + i);
      const content = el("code", "", lines[i - 1] || " ");
      row.append(number, content);
      row.onclick = (e) => {
        if (e.target !== number) fromLine(i);
      };
      row.onkeydown = (e) => {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          const next = Math.min(
            lines.length,
            Math.max(1, i + (e.key === "ArrowDown" ? 1 : -1)),
          );
          move(next);
          code.querySelector('[data-line="' + next + '"] button')?.focus();
        }
      };
      fragment.append(row);
      lineList.push(row);
    }
    if (last < lines.length)
      fragment.append(btn(w.later, () => move(last + 1)));
    code.replaceChildren(fragment);
    const row = lineList.find((r) => +r.dataset.line === focusLine);
    if (row)
      code.scrollTop = Math.max(0, row.offsetTop - code.clientHeight * 0.33);
  }
  function showSource(n, persist = true) {
    if (!n) return;
    current = n;
    picker.value = n.id;
    range.textContent = "L" + n.start + (n.end > n.start ? "–" + n.end : "");
    fileView(n.path, n.start);
    const about =
      n.explanation ??
      w.describe(
        n.kind,
        n.path,
        n.start,
        n.end,
        graph.edges.filter((e) => e.from === n.id || e.to === n.id).length,
      );
    detail.replaceChildren(
      el("h2", "", n.label),
      el("p", "explanation", about),
    );
    const actions = el("div", "source-actions");
    if (
      n.id !== scope &&
      graph.edges.some((e) => e.from === n.id || e.to === n.id)
    )
      actions.append(
        btn(zh ? "查看直接关系" : "Inspect connections", () => {
          scope = n.id;
          mobile("map");
          render();
        }),
      );
    const href = sourceUrl?.(n);
    if (href) {
      const a = el("a", "original", w.original + " ↗");
      a.href = href;
      a.target = "_blank";
      a.rel = "noreferrer noopener";
      actions.append(a);
    }
    detail.append(actions);
    const related = graph.edges.filter((e) => e.from === n.id || e.to === n.id);
    if (related.length) {
      const fold = el("details", "relations");
      fold.append(
        el("summary", "", w.connections + " (" + related.length + ")"),
      );
      for (const e of related) {
        const from = byId.get(e.from),
          to = byId.get(e.to);
        fold.append(
          btn(
            from.label + " → " + to.label + (e.label ? " · " + e.label : ""),
            () => select(n.id === from.id ? to : from, true),
          ),
        );
        if (e.kind === "imports" && e.line)
          fold.append(
            btn(w.importLine + " · " + from.path + ":" + e.line, () => {
              mobile("source");
              fileView(from.path, e.line);
              range.textContent = "L" + e.line;
              for (const row of lineList)
                row.classList.toggle("marked", +row.dataset.line === e.line);
            }),
          );
      }
      detail.append(fold);
    }
    if (persist) remember?.(n.id);
  }
  function fromLine(line) {
    const n = graph.nodes
      .filter((n) => n.path === lastFile && n.start <= line && n.end >= line)
      .sort(
        (a, b) =>
          Number(a.kind === "file") - Number(b.kind === "file") ||
          a.end - a.start - (b.end - b.start),
      )[0];
    if (n) select(n, true);
    else {
      range.textContent = w.noNode;
      for (const row of lineList)
        row.classList.toggle("marked", +row.dataset.line === line);
    }
  }
  function focusFrame(id) {
    if (!ready) {
      pending = id;
      return;
    }
    const key = [...binding].find(([, sourceId]) => sourceId === id)?.[0];
    if (key)
      frame.contentWindow?.postMessage(
        { channel: frameChannel, action: "focus", id: key },
        "*",
      );
  }
  function select(n, focus) {
    if (!n) return;
    if (![...binding.values()].includes(n.id)) {
      scope =
        graph.nodes.find(
          (node) =>
            node.path === n.path &&
            node.kind === "file" &&
            graph.edges.some((e) => e.from === node.id && e.to === n.id),
        )?.id ?? n.id;
      current = n;
      render(n.id);
    } else {
      showSource(n);
      if (focus) focusFrame(n.id);
    }
  }
  filePick.onchange = () => {
    const n = graph.nodes.find((n) => n.path === filePick.value);
    if (n) select(n, true);
    else {
      fileView(filePick.value, 1);
      range.textContent = w.noNode;
    }
  };
  picker.onchange = () => select(byId.get(picker.value), true);
  function render(focus) {
    const make = (preferTree) =>
      mapDiagram(
        study,
        graph,
        lang,
        scope,
        preferTree,
        frame.clientWidth < 560,
      );
    let mapped = make(false),
      html;
    try {
      html = ArchifyRenderer.render(mapped.diagram);
    } catch (err) {
      if (mapped.diagram.diagram_type !== "architecture") throw err;
      mapped = make(true);
      html = ArchifyRenderer.render(mapped.diagram);
    }
    binding = mapped.binding;
    moduleGroups = mapped.groups ?? new Map();
    indexOnly = mapped.indexOnly;
    indexNotice.hidden = !indexOnly;
    back.hidden = scope === null;
    frameChannel = crypto.randomUUID();
    ready = false;
    pending = focus;
    const bridge =
      "<script>(" +
      connectArchify.toString() +
      ")(" +
      JSON.stringify(frameChannel) +
      "," +
      JSON.stringify(themeOf()) +
      ")<" +
      "/script>";
    frame.srcdoc = html.replace("</body>", () => bridge + "</body>");
    showSource(current, false);
  }
  const onMessage = (e) => {
    if (e.source !== frame.contentWindow || e.data?.channel !== frameChannel)
      return;
    if (e.data.action === "ready") {
      ready = true;
      if (pending) {
        const id = pending;
        pending = null;
        focusFrame(id);
      }
    } else if (e.data.action === "select") {
      const members = moduleGroups.get(e.data.id);
      if (members) {
        scope = { members: members.ids, label: members.label };
        current = byId.get(members.ids[0]);
        render();
        return;
      }
      const n = byId.get(binding.get(e.data.id));
      if (n) {
        if (n.id !== current.id) showSource(n);
        frame.contentWindow?.postMessage(
          {
            channel: frameChannel,
            action: "evidence",
            id: e.data.id,
            text: detail.querySelector(".explanation")?.textContent,
            citation:
              n.path + " · L" + n.start + (n.end > n.start ? "–" + n.end : ""),
          },
          "*",
        );
      }
    } else if (
      e.data.action === "source" &&
      binding.get(e.data.id) === current.id
    ) {
      mobile("source");
      root.classList.remove("diagram-wide");
      expand.textContent = zh ? "专注看图" : "Expand diagram";
      code.focus({ preventScroll: true });
      fileView(current.path, current.start);
    }
  };
  win.addEventListener("message", onMessage);

  const narrow = win.matchMedia("(max-width:700px)");
  const adapt = () => render();
  narrow.addEventListener("change", adapt);
  const look = new win.MutationObserver(() =>
    frame.contentWindow?.postMessage(
      { channel: frameChannel, action: "theme", theme: themeOf() },
      "*",
    ),
  );
  look.observe(d.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  root.disposeReader = () => {
    win.removeEventListener("message", onMessage);
    narrow.removeEventListener("change", adapt);
    look.disconnect();
  };
  render();
  return { selected: () => current.id };
}
