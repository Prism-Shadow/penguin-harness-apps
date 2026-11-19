// Only source-backed relationships enter this projection. Unconnected files remain visible.
export function overviewGraph(graph) {
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
  return { nodes, edges };
}

const short = (s, length) =>
  Array.from(s).length <= length
    ? s
    : Array.from(s)
        .slice(0, length - 1)
        .join("") + "…";

function materialTitle(study) {
  if (study.files.length === 1) {
    const text = study.files[0].text;
    const front = text.match(
      /^---\r?\n([\s\S]{0,6000}?)\r?\n---(?:\r?\n|$)/,
    )?.[1];
    const title =
      front
        ?.match(/^title:[ \t]*([^\n#]+)$/m)?.[1]
        ?.trim()
        .replace(/^["']|["']$/g, "") ??
      (/\.(?:md|mdx|markdown)$/i.test(study.files[0].path)
        ? text.match(/^#\s+(.+?)\s*#*$/m)?.[1]
        : undefined);
    if (title) return short(title, 120);
  }
  return study.title;
}

function groupSources(nodes) {
  const sorted = [...nodes].sort(
    (a, b) => a.path.localeCompare(b.path, "en") || a.start - b.start,
  );
  const components = sorted.map((n) => n.path.split("/").slice(0, -1));
  let depth = 0;
  while (
    components[0][depth] &&
    components.every((parts) => parts[depth] === components[0][depth])
  )
    depth++;
  const byDir = new Map();
  for (const [i, n] of sorted.entries()) {
    const name = components[i][depth];
    if (!byDir.has(name)) byDir.set(name, []);
    byDir.get(name).push(n);
  }
  const groups = [];
  const split = (items, label) => {
    for (let i = 0; i < items.length; i += 8) {
      const part = items.slice(i, i + 8);
      const name =
        label && items.length <= 8
          ? label
          : short(part[0].label, 13) +
            (part.length > 1 ? " … " + short(part.at(-1).label, 13) : "");
      groups.push({ label: name, items: part });
    }
  };
  if (byDir.size <= 8)
    for (const [name, items] of byDir) split(items, name ? name + "/" : null);
  else split(sorted, null);
  return groups;
}

// A renderer-safe ID deliberately carries no filenames or model-authored text.
export function mapDiagram(
  study,
  graph,
  language,
  scope,
  preferTree = false,
  narrow = false,
) {
  const zh = language === "zh";
  const byId = new Map(
    graph.nodes.map((node, index) => [node.id, { node, key: "s" + index }]),
  );
  const key = (id) => byId.get(id).key;
  const inScope = typeof scope === "string" ? byId.get(scope)?.node : null;
  let { nodes, edges } = overviewGraph(graph);
  if (scope?.members) {
    const membership = new Set(scope.members);
    nodes = graph.nodes.filter((n) => membership.has(n.id));
    edges = graph.edges.filter(
      (e) => membership.has(e.from) && membership.has(e.to),
    );
  }
  if (inScope) {
    const neighbors = new Set([inScope.id]);
    for (const e of graph.edges) {
      if (e.from === inScope.id) neighbors.add(e.to);
      if (e.to === inScope.id) neighbors.add(e.from);
    }
    nodes = graph.nodes.filter((n) => neighbors.has(n.id));
    edges = graph.edges.filter(
      (e) => neighbors.has(e.from) && neighbors.has(e.to),
    );
  }
  let isHierarchy = edges.every((e) => e.kind === "contains");
  const title = inScope?.label ?? scope?.label ?? materialTitle(study);
  const meta = {
    title,
    output: "diagram.html",
    locale: zh ? "zh-CN" : "en",
    visual_preset: isHierarchy ? "editorial" : "signal-flow",
  };
  const binding = new Map(nodes.map((n) => [key(n.id), n.id]));
  const groups = new Map();
  if (!scope && !isHierarchy && (nodes.length > 18 || edges.length > 32)) {
    // Prefer real directories; flat repositories are alphabetized into named ranges.
    const buckets = groupSources(nodes);
    const groupOf = new Map();
    nodes = buckets.map(({ label, items }, i) => {
      const id = "group_" + i;
      const representative = items[0];
      const node = {
        ...representative,
        id,
        kind: "group",
        label,
        memberCount: items.length,
      };
      groupOf.set(id, id);
      byId.set(id, { node, key: id });
      groups.set(id, { label, ids: items.map((n) => n.id) });
      for (const n of items) groupOf.set(n.id, id);
      return node;
    });
    const pairs = new Map();
    for (const edge of edges) {
      const from = groupOf.get(edge.from),
        to = groupOf.get(edge.to);
      if (from === to) continue;
      const id = from + ":" + to;
      const pair = pairs.get(id) ?? { from, to, kind: edge.kind, count: 0 };
      pair.count++;
      pairs.set(id, pair);
    }
    edges = [...pairs.values()].map((e) => ({
      ...e,
      label: zh
        ? e.count + " 处引用"
        : e.count + " " + (e.count === 1 ? "link" : "links"),
    }));
  }
  const total = nodes.length;
  function tree() {
    const roots = new Set(nodes.map((n) => n.id));
    const parents = new Map();
    for (const e of edges.filter((e) => e.kind === "contains")) {
      if (parents.has(e.to)) continue;
      parents.set(e.to, key(e.from));
      roots.delete(e.to);
    }
    if (!isHierarchy) {
      // A dense/cyclic layout may fail Archify's routing checks. A native reference
      // tree repeats target IDs at each source, retaining real direction and labels.
      const children = [{ id: "material", label: short(title, 52) }];
      for (const n of nodes) {
        children.push({
          id: key(n.id),
          label: short(n.label, 52),
          parent: "material",
        });
        for (const [i, e] of edges.entries())
          if (e.from === n.id) {
            const id = "edge_" + i,
              target = byId.get(e.to).node;
            if (groups.has(key(target.id)))
              groups.set(id, groups.get(key(target.id)));
            else binding.set(id, target.id);
            children.push({
              id,
              parent: key(n.id),
              label: short(target.label, 52),
              sublabel: short(
                e.label ?? (zh ? "引用目标" : "Referenced source"),
                48,
              ),
            });
          }
      }
      return {
        schema_version: 1,
        diagram_type: "tree",
        meta: {
          ...meta,
          title,
          visual_preset: "editorial",
          subtitle: zh ? "按引用来源查看连线" : "Relationships by source",
        },
        layout: { direction: "right" },
        nodes: children,
      };
    }
    const wrap = roots.size !== 1;
    const parts = nodes.map((n) => ({
      id: key(n.id),
      label: short(n.label, 58),
      ...(parents.has(n.id)
        ? { parent: parents.get(n.id) }
        : wrap
          ? { parent: "material" }
          : {}),
      sublabel:
        n.kind === "file" && n.path.includes("/")
          ? n.path.slice(0, n.path.lastIndexOf("/") + 1)
          : "L" + n.start + (n.end > n.start ? "–" + n.end : ""),
    }));
    if (wrap) parts.unshift({ id: "material", label: short(study.title, 52) });
    return {
      schema_version: 1,
      diagram_type: "tree",
      meta: {
        ...meta,
        visual_preset: "editorial",
        subtitle: zh ? "章节与出处" : "Sections and sources",
      },
      layout: { direction: total > 6 ? "right" : "down" },
      nodes: parts,
    };
  }
  // Above this scale, split first by source file. The learner can open any item
  // to see its actual incoming/outgoing relationships without omitting sources.
  const sourceIndex = preferTree;
  if (isHierarchy || sourceIndex)
    return { diagram: tree(), groups, binding, indexOnly: !isHierarchy };

  const parents = new Map(nodes.map((n) => [n.id, 0]));
  const outgoing = new Map(nodes.map((n) => [n.id, []]));
  for (const e of edges) {
    parents.set(e.to, parents.get(e.to) + 1);
    outgoing.get(e.from).push(e.to);
  }
  const pending = new Set(
    nodes
      .filter((n) => parents.get(n.id) || outgoing.get(n.id).length)
      .map((n) => n.id),
  );
  const islands = nodes.filter((n) => !pending.has(n.id)).map((n) => n.id);
  const remaining = new Map(parents);
  const rows = [];
  const maxColumns = narrow ? 2 : 3;
  while (pending.size) {
    let layer = [...pending].filter((id) => !remaining.get(id));
    if (!layer.length)
      layer = [
        [...pending].sort((a, b) => remaining.get(a) - remaining.get(b))[0],
      ];
    for (const id of layer) pending.delete(id);
    for (const id of layer)
      for (const to of outgoing.get(id))
        remaining.set(to, remaining.get(to) - 1);
    for (let i = 0; i < layer.length; i += maxColumns)
      rows.push(layer.slice(i, i + maxColumns));
  }
  // Put isolated documents beside a sparse layer; a separate last column
  // would shrink the type of the connected modules across the entire board.
  for (const id of islands) {
    const row = rows.find(
      (layer) => layer.length < maxColumns && layer.length < 2,
    );
    if (row) row.push(id);
    else rows.push([id]);
  }
  const cols = Math.max(...rows.map((row) => row.length));
  const positions = new Map();
  const horizontal = !narrow && rows.length <= 4 && rows.length >= cols;
  const labelWidth = Math.max(
    0,
    ...edges.map((e) =>
      Array.from(short(e.label ?? "", 17)).reduce(
        (sum, c) => sum + (c.charCodeAt(0) > 255 ? 12 : 6),
        0,
      ),
    ),
  );
  const wideText = Math.max(
    ...nodes.map((n) =>
      Array.from(short(n.label, 23)).reduce(
        (sum, c) => sum + (c.charCodeAt(0) > 255 ? 2 : 1),
        0,
      ),
    ),
  );
  const cardWidth = narrow
    ? Math.max(96, Math.min(148, wideText * 6 + 20))
    : 148;
  const pitch =
    cardWidth + Math.max(narrow ? 24 : 42, labelWidth + (narrow ? 22 : 40));
  rows.forEach((row, i) =>
    row.forEach((id, j) =>
      positions.set(
        id,
        horizontal
          ? [38 + i * pitch, 40 + ((cols - row.length) / 2 + j) * 101]
          : [38 + ((cols - row.length) / 2 + j) * pitch, 40 + i * 104],
      ),
    ),
  );
  const role = (n) => {
    if (
      n.kind === "file" &&
      /(?:\.(?:mdx?|rst|txt|adoc)|(?:^|\/)(?:README|LICENSE|COPYING)(?:\..*)?)$/i.test(
        n.path,
      )
    )
      return "external";
    if (!parents.get(n.id)) return "frontend";
    if (!outgoing.get(n.id).length) return "database";
    return "backend";
  };
  const legend = zh
    ? ["起点", "中间节点", "依赖项", "参考文档"]
    : ["Entry", "Intermediate", "Dependency", "Reading"];
  meta.translations = Object.fromEntries(
    ["frontend", "backend", "database", "external"].map((k, i) => [
      "viewer.kind." + k,
      legend[i],
    ]),
  );
  meta.legend = {
    mode: "auto",
    entries: Object.fromEntries(
      ["frontend", "backend", "database", "external"].map((k, i) => [
        k,
        { label: legend[i] },
      ]),
    ),
  };
  meta.subtitle = nodes.some((n) => n.kind === "concept")
    ? zh
      ? "概念与已核对的引文"
      : "Concepts and cited passages"
    : zh
      ? "模块与引用关系"
      : "Modules and dependencies";
  return {
    binding,
    groups,
    indexOnly: false,
    diagram: {
      schema_version: 1,
      diagram_type: "architecture",
      meta,
      components: nodes.map((n) => ({
        id: key(n.id),
        type: role(n),
        icon: {
          frontend: "start",
          backend: "backend",
          database: "neutral",
          external: "briefcase",
        }[role(n)],
        label: short(n.label, 23),
        sublabel:
          n.kind === "group"
            ? zh
              ? n.memberCount + " 个节点"
              : n.memberCount + " nodes"
            : n.kind === "file"
              ? short(
                  n.path.includes("/")
                    ? n.path.slice(0, n.path.lastIndexOf("/") + 1)
                    : zh
                      ? "项目根目录"
                      : "project root",
                  24,
                )
              : short(n.path.split("/").at(-1) + " · L" + n.start, 24),
        pos: positions.get(n.id),
        size: [cardWidth, narrow ? 52 : 60],
      })),
      connections: edges.map((e, i) => ({
        id: "e" + i,
        from: key(e.from),
        to: key(e.to),
        ...(e.label ? { label: short(e.label, 17) } : {}),
        variant: e.kind === "imports" ? "emphasis" : "default",
      })),
    },
  };
}
