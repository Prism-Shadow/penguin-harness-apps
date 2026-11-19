// Only source-backed relationships enter this projection. Unconnected files remain visible.
export function overviewLayout(graph) {
  const isAI = graph.nodes.some((n) => n.kind === "concept"),
    files = graph.nodes.filter((n) => n.kind === "file");
  let nodes, edges;
  if (isAI) {
    nodes = graph.nodes;
    edges = graph.edges;
  } else if (
    files.length === 1 ||
    files.every((f) =>
      /(?:\.(?:md|mdx|markdown|txt|rst|adoc)|(?:^|\/)(?:README|LICENSE))$/i.test(
        f.path,
      ),
    )
  ) {
    const allowed = new Set(files.map((f) => f.id)),
      children = new Map();
    for (const edge of graph.edges)
      if (edge.kind === "contains") {
        if (!children.has(edge.from)) children.set(edge.from, []);
        children.get(edge.from).push(edge.to);
      }
    // A single book title is not the chapter list. Descend through that wrapper per document.
    for (const file of files) {
      let frontier = [file.id];
      for (let depth = 0; depth < 3; depth++) {
        frontier = frontier.flatMap((id) => children.get(id) ?? []);
        for (const id of frontier) allowed.add(id);
        if (frontier.length !== 1) break;
      }
    }
    nodes = graph.nodes.filter((n) => allowed.has(n.id));
    edges = graph.edges.filter((e) => allowed.has(e.from) && allowed.has(e.to));
  } else {
    nodes = files;
    edges = graph.edges.filter((e) => e.kind === "imports");
  }
  const incoming = new Map(nodes.map((n) => [n.id, 0])),
    next = new Map(nodes.map((n) => [n.id, []]));
  for (const e of edges) {
    incoming.set(e.to, incoming.get(e.to) + 1);
    next.get(e.from).push(e.to);
  }
  const ids = nodes.map((n) => n.id),
    isolated = ids.filter((id) => !incoming.get(id) && !next.get(id).length);
  const islands = new Set(isolated),
    pending = new Set(ids.filter((id) => !islands.has(id)));
  const layers = [];
  while (pending.size) {
    let wave = [...pending].filter((id) => incoming.get(id) === 0);
    // A cycle still has real arrows. Break its layout tie at a stable node.
    if (!wave.length)
      wave = [
        [...pending].sort((a, b) => incoming.get(a) - incoming.get(b))[0],
      ];
    for (const id of wave) {
      pending.delete(id);
    }
    for (const id of wave)
      for (const to of next.get(id)) incoming.set(to, incoming.get(to) - 1);
    layers.push(wave);
  }
  if (isolated.length) layers.push(isolated);
  const maxCols = Math.min(3, Math.max(1, ...layers.map((l) => l.length)));
  const cardW = 150,
    cardH = 48,
    col = 176,
    row = 72,
    margin = 14,
    width = (maxCols - 1) * col + cardW + 2 * margin;
  let y = margin;
  const boxes = new Map();
  for (const layer of layers) {
    for (let i = 0; i < layer.length; i += maxCols) {
      const group = layer.slice(i, i + maxCols);
      const x0 = (width - (cardW + (group.length - 1) * col)) / 2;
      group.forEach((id, j) =>
        boxes.set(id, { x: x0 + j * col, y, w: cardW, h: cardH }),
      );
      y += row;
    }
    y += 10;
  }
  return {
    nodes,
    edges,
    boxes,
    width,
    height: Math.max(100, y - row + cardH + margin),
    isAI,
  };
}
// This reader also runs in the standalone HTML. Everything it needs comes from its arguments.
export function mountReader(
  root,
  { study, graph, words: w, sourceUrl, remember, selected },
) {
  const d = root.ownerDocument;
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
  const byId = new Map(graph.nodes.map((n) => [n.id, n])),
    files = new Map(study.files.map((f) => [f.path, f]));
  let current = byId.get(selected) ?? graph.nodes[0],
    center = current.id,
    offset = 0,
    lastFile = "",
    lineList = [],
    lines = [];
  const region = el("div", "reader"),
    source = el("section", "source"),
    atlas = el("section", "atlas");
  const fileBar = el("div", "head"),
    fileLabel = el("label", "caption", w.source),
    filePick = el("select");
  filePick.setAttribute("aria-label", w.source);
  for (const f of study.files) filePick.append(option(f.path, f.path));
  fileLabel.append(filePick);
  fileBar.append(fileLabel);
  const range = el("span", "range");
  fileBar.append(range);
  const code = el("div", "code");
  code.tabIndex = 0;
  code.setAttribute("aria-label", w.source);
  source.append(fileBar, code);
  const head = el("div", "head"),
    headName = el("h2", "", w.map),
    tools = el("div", "tools");
  const picker = el("select");
  picker.setAttribute("aria-label", w.jump);
  for (const n of graph.nodes)
    picker.append(option(n.id, n.label + " · " + n.path + ":" + n.start));
  tools.append(picker);
  head.append(headName, tools);
  const figure = el("div", "figure"),
    links = el("div", "map-tools"),
    detail = el("article", "detail");
  atlas.append(head, figure, links, detail);
  region.append(source, atlas);
  root.replaceChildren(region);
  const switcher = el("div", "mobile-tabs"),
    showMap = btn(w.map, () => mobile("map")),
    showSrc = btn(w.source, () => mobile("source"));
  switcher.append(showMap, showSrc);
  root.prepend(switcher);
  function mobile(side) {
    root.dataset.side = side;
    showMap.setAttribute("aria-pressed", String(side === "map"));
    showSrc.setAttribute("aria-pressed", String(side === "source"));
  }
  mobile("map");
  function neighbors(id) {
    const seen = new Set([id]),
      result = [];
    for (const e of graph.edges.filter((e) => e.from === id || e.to === id)) {
      const forward = e.from === id,
        other = forward ? e.to : e.from;
      if (seen.has(other)) continue;
      seen.add(other);
      result.push({ n: byId.get(other), e, forward });
    }
    return result.sort(
      (a, b) => Number(b.e.kind === "imports") - Number(a.e.kind === "imports"),
    );
  }
  function jump(n, focus = false) {
    if (!n) return;
    overviewActive = false;
    const neighborsHere = neighbors(center).slice(offset, offset + 4);
    if (
      focus ||
      (n.id !== center && !neighborsHere.some((x) => x.n.id === n.id))
    ) {
      center = n.id;
      offset = 0;
    }
    current = n;
    draw();
    remember?.(n.id);
  }
  function fileView(path, focusLine) {
    const f = files.get(path);
    if (!f) return;
    filePick.value = path;
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
  function fromLine(line) {
    const n = graph.nodes
      .filter((n) => n.path === lastFile && n.start <= line && n.end >= line)
      .sort(
        (a, b) =>
          (a.kind === "file") - (b.kind === "file") ||
          a.end - a.start - (b.end - b.start),
      )[0];
    if (n) jump(n);
    else {
      range.textContent = w.noNode;
      for (const row of lineList)
        row.classList.toggle("marked", Number(row.dataset.line) === line);
    }
  }
  filePick.onchange = () => {
    const n = graph.nodes.find((n) => n.path === filePick.value);
    if (n) jump(n, true);
    else {
      fileView(filePick.value, 1);
      range.textContent = w.noNode;
    }
  };
  picker.onchange = () => jump(byId.get(picker.value), true);
  const overview = overviewLayout(graph);
  let overviewActive = true,
    zoom = 1,
    scrollX = 0,
    scrollY = 0;
  const changeView = btn(w.overview, () => {
    if (overviewActive) jump(current, true);
    else {
      overviewActive = true;
      draw();
    }
  });
  changeView.className = "change-view";
  head.insertBefore(changeView, tools);
  function drawOverview() {
    figure.classList.add("overview-figure");
    const canvas = el("div", "overview-canvas");
    canvas.tabIndex = 0;
    canvas.ariaLabel = w.overview;
    const scaleBox = el("div", "scale-box"),
      surface = el("div", "overview-surface");
    surface.style.width = overview.width + "px";
    surface.style.height = overview.height + "px";
    scaleBox.append(surface);
    canvas.append(scaleBox);
    figure.append(canvas);
    const svg = d.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute(
      "viewBox",
      "0 0 " + overview.width + " " + overview.height,
    );
    svg.setAttribute("aria-hidden", "true");
    surface.append(svg);
    const defs = d.createElementNS(svg.namespaceURI, "defs"),
      marker = d.createElementNS(svg.namespaceURI, "marker"),
      tip = d.createElementNS(svg.namespaceURI, "path");
    marker.id = "study-arrow";
    for (const [k, v] of Object.entries({
      viewBox: "0 0 8 8",
      refX: 7,
      refY: 4,
      markerWidth: 6,
      markerHeight: 6,
      orient: "auto",
    }))
      marker.setAttribute(k, v);
    tip.setAttribute("d", "M0 0 L8 4 L0 8 Z");
    marker.append(tip);
    defs.append(marker);
    svg.append(defs);
    for (const e of overview.edges) {
      const a = overview.boxes.get(e.from),
        b = overview.boxes.get(e.to);
      let route;
      if (b.y > a.y) {
        const x = a.x + a.w / 2,
          y = a.y + a.h,
          X = b.x + b.w / 2,
          Y = b.y - 2,
          mid = (y + Y) / 2;
        route =
          "M " +
          x +
          " " +
          y +
          " C " +
          x +
          " " +
          mid +
          " " +
          X +
          " " +
          mid +
          " " +
          X +
          " " +
          Y;
      } else {
        const x = a.x + a.w,
          y = a.y + a.h / 2,
          X = b.x + b.w + 2,
          Y = b.y + b.h / 2,
          via = Math.max(x, X) + 10;
        route =
          "M " +
          x +
          " " +
          y +
          " C " +
          via +
          " " +
          y +
          " " +
          via +
          " " +
          Y +
          " " +
          X +
          " " +
          Y;
      }
      const path = d.createElementNS(svg.namespaceURI, "path");
      path.setAttribute("d", route);
      path.setAttribute("marker-end", "url(#study-arrow)");
      svg.append(path);
    }
    for (const n of overview.nodes) {
      const b = btn("", () => {
        scrollX = canvas.scrollLeft;
        scrollY = canvas.scrollTop;
        jump(n, true);
      });
      const box = overview.boxes.get(n.id);
      b.className = "node overview-node";
      b.dataset.node = n.id;
      Object.assign(b.style, {
        left: box.x + "px",
        top: box.y + "px",
        width: box.w + "px",
        height: box.h + "px",
      });
      b.title = n.label + " · " + n.path + ":" + n.start;
      const sub =
        n.kind === "file"
          ? n.path.includes("/")
            ? n.path.split("/").slice(0, -1).join("/") + "/"
            : w.file
          : w[n.kind] + " · L" + n.start;
      b.append(el("span", "kind", sub), el("strong", "", n.label));
      surface.append(b);
    }
    // The normal scale fits a three-column board in the pane. Zoom retains native scroll/keyboard access.
    function scale() {
      const available = Math.max(240, canvas.clientWidth - 10);
      const factor =
        zoom * Math.min(1, Math.max(0.7, available / overview.width));
      surface.style.transform = "scale(" + factor + ")";
      scaleBox.style.width = overview.width * factor + "px";
      scaleBox.style.height = overview.height * factor + "px";
    }
    scale();
    canvas.scrollLeft = scrollX;
    canvas.scrollTop = scrollY;
    for (const direction of [-1, 1]) {
      const b = btn(direction < 0 ? "−" : "+", () => {
        zoom = Math.max(0.75, Math.min(2, zoom + direction * 0.25));
        scale();
      });
      b.setAttribute("aria-label", direction < 0 ? w.zoomOut : w.zoomIn);
      links.append(b);
    }
    links.prepend(
      el(
        "small",
        "",
        w.overviewCounts(overview.nodes.length, overview.edges.length),
      ),
    );
    detail.append(el("h2", "", w.connections));
    if (!overview.edges.length)
      detail.append(el("p", "quiet", w.noConnections));
    else {
      const rows = el("div", "edge-index");
      for (const edge of overview.edges) {
        const from = byId.get(edge.from),
          to = byId.get(edge.to);
        const entry = btn("", () => {
          scrollX = canvas.scrollLeft;
          scrollY = canvas.scrollTop;
          center = from.id;
          offset = 0;
          jump(to);
        });
        entry.append(
          el("span", "", from.label + " → " + to.label),
          el("small", "", edge.label ?? w[edge.kind]),
        );
        rows.append(entry);
      }
      detail.append(rows);
    }
    fileView(current.path, current.start);
  }
  function draw() {
    const mid = byId.get(center),
      all = neighbors(center),
      page = all.slice(offset, offset + 4);
    picker.value = current.id;
    range.textContent =
      "L" +
      current.start +
      (current.end > current.start ? "–" + current.end : "");
    figure.replaceChildren();
    links.replaceChildren();
    detail.replaceChildren();
    changeView.textContent = overviewActive ? w.focusView : w.overview;
    headName.textContent = overviewActive ? w.overview : w.map;
    figure.classList.toggle("overview-figure", overviewActive);
    if (overviewActive) {
      drawOverview();
      return;
    }
    const board = el("div", "board");
    figure.append(board);
    const card = (n, cls, relation) => {
      const b = btn("", () => jump(n));
      b.className = "node " + cls;
      b.setAttribute("aria-pressed", String(current.id === n.id));
      b.title = n.label + " · " + n.path;
      b.append(
        el("span", "kind", relation ?? w[n.kind]),
        el("strong", "", n.label),
      );
      return b;
    };
    const parent = card(mid, "parent");
    board.append(parent);
    const branch = el("div", "branches");
    board.append(branch);
    for (const { n, e, forward } of page) {
      const kind =
        e.kind === "relation"
          ? (forward ? "→ " : "← ") + e.label
          : forward
            ? w[e.kind]
            : w[e.kind + "In"];
      branch.append(card(n, "child", kind));
    }
    if (page.length) {
      const svg = d.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("aria-hidden", "true");
      svg.setAttribute("viewBox", "0 0 100 100");
      svg.setAttribute("preserveAspectRatio", "none");
      svg.classList.add("connectors");
      board.prepend(svg);
      for (const [i, item] of page.entries()) {
        const path = d.createElementNS(svg.namespaceURI, "path"),
          y = (100 * (i + 0.5)) / page.length;
        path.setAttribute(
          "d",
          "M 0 50 H 30 Q 50 50 50 " + (50 + y) / 2 + " T 72 " + y + " H 100",
        );
        if (item.n.id === current.id) path.classList.add("selected");
        svg.append(path);
      }
    } else {
      branch.append(el("p", "quiet", w.noRelations));
    }
    if (all.length > 4) {
      const prev = btn("‹", () => {
          offset -= 4;
          draw();
        }),
        next = btn("›", () => {
          offset += 4;
          draw();
        });
      prev.ariaLabel = w.previous;
      next.ariaLabel = w.next;
      prev.disabled = !offset;
      next.disabled = offset + 4 >= all.length;
      links.append(
        prev,
        el(
          "small",
          "",
          offset +
            1 +
            "–" +
            Math.min(offset + 4, all.length) +
            " / " +
            all.length,
        ),
        next,
      );
    }
    if (current.id !== center && neighbors(current.id).length > 1)
      links.append(btn(w.explore, () => jump(current, true)));
    const eyebrow = el("div", "eyebrow", w[current.kind]),
      title = el("h2", "", current.label);
    const file = files.get(current.path);
    const quote =
      current.quote ??
      file.text
        .split("\n")
        .slice(current.start - 1, Math.min(current.end, current.start + 2))
        .join("\n");
    const summary =
      current.explanation ??
      w.describe(
        current.kind,
        current.path,
        current.start,
        current.end,
        neighbors(current.id).length,
      );
    detail.append(eyebrow, title, el("p", "explanation", summary));
    const evidence = el("div", "evidence"),
      go = btn(
        current.path +
          " · L" +
          current.start +
          (current.end > current.start ? "–" + current.end : ""),
        () => {
          mobile("source");
          fileView(current.path, current.start);
          code.focus({ preventScroll: true });
        },
      );
    go.className = "citation";
    go.title = w.viewSource;
    evidence.append(go, el("pre", "", quote));
    if (sourceUrl) {
      const url = sourceUrl(current);
      if (url) {
        const a = el("a", "original", w.original + " ↗");
        a.href = url;
        a.target = "_blank";
        a.rel = "noreferrer noopener";
        evidence.append(a);
      }
    }
    const relation = all.find(
      ({ n, e }) => n.id === current.id && e.kind === "imports" && e.line,
    )?.e;
    if (relation) {
      const path = byId.get(relation.from).path;
      const cite = btn(
        w.importLine + " · " + path + ":" + relation.line,
        () => {
          mobile("source");
          fileView(path, relation.line);
          range.textContent = "L" + relation.line;
          for (const row of lineList)
            row.classList.toggle(
              "marked",
              Number(row.dataset.line) === relation.line,
            );
          code.focus({ preventScroll: true });
        },
      );
      cite.className = "relation-cite";
      evidence.append(cite);
    }
    detail.append(evidence);
    fileView(current.path, current.start);
  }
  draw();
  return { selected: () => current.id };
}
