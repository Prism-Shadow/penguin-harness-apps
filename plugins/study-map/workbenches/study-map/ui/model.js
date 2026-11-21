export const limits = {
  files: 64,
  fileBytes: 192 * 1024,
  bytes: 2 * 1024 * 1024,
  sections: 24,
};
const ignored =
  /^(?:\.|node_modules$|vendor$|dist$|build$|coverage$|target$|__pycache__$|\.?venv$)/i;
const privateName =
  /^(?:id_(rsa|dsa|ecdsa|ed25519)|credentials?|secrets?|tokens?|passwords?|keyfile|service[-_]?account)(?:[.-]|$)/i;
const textType =
  /\.(?:md|mdx|markdown|txt|rst|adoc|py|pyi|[cm]?[jt]sx?|go|rs|c|h|cc|cpp|hpp|cs|java|kt|kts|rb|php|swift|lua|r|scala|sh|sql|css|scss|html|vue|svelte|toml|yaml|yml|json|xml|dart|exs?|erl|hs|jl|zig)$/i;
export const isDoc = (path) =>
  /(?:\.(?:md|mdx|markdown|txt|rst|adoc)|(?:^|\/)(?:README|LICENSE))$/i.test(
    path,
  );
export function eligible(path) {
  const parts = path.split("/");
  const name = parts.at(-1);
  return (
    path.length <= 300 &&
    !/[\u0000-\u001f\\]/.test(path) &&
    parts.every((p) => p && !ignored.test(p)) &&
    !privateName.test(name) &&
    !/\.(?:min\.(?:js|css)|lock|map|pem|key|pfx)$/i.test(name) &&
    !/^(?:package-lock\.json|pnpm-lock\.yaml|bun\.lockb?|yarn\.lock)$/i.test(
      name,
    ) &&
    (textType.test(name) ||
      /^(?:README|LICENSE|Makefile|Dockerfile)$/i.test(name))
  );
}
const priority = (path) =>
  /^(?:src\/)?(?:main|index|app)\.[a-z]+$/i.test(path)
    ? 0
    : /^readme(?:\.|$)/i.test(path)
      ? 1
      : path.split("/").length + 2;
export function selectFiles(entries) {
  const seen = new Set(),
    picked = [];
  let bytes = 0;
  const sorted = entries
    .filter((e) => eligible(e.path) && e.size > 0 && e.size <= limits.fileBytes)
    .sort(
      (a, b) =>
        priority(a.path) - priority(b.path) ||
        a.path.localeCompare(b.path, "en"),
    );
  for (const entry of sorted) {
    if (picked.length === limits.files) break;
    if (seen.has(entry.path) || bytes + entry.size > limits.bytes) continue;
    picked.push(entry);
    seen.add(entry.path);
    bytes += entry.size;
  }
  return picked;
}
const decl =
  /^\s*(?:(?:export|default|async|abstract|public|private|static|pub(?:\(crate\))?|open|final|suspend|internal)\s+)*(?:function\*?|class|def|fn|func|interface|enum|struct|trait|type|module|namespace|record|object|fun|const|let)\s+(?:\([^)]*\)\s*)?([$_\p{L}][$_\p{L}\d]*)/u;
function sections(file) {
  const lines = file.text.split("\n"),
    out = [];
  const structure = lines.some((l) => /^\s{0,3}#{1,6}\s/.test(l));
  let inFence = "",
    paragraph = true;
  for (const [index, line] of lines.entries()) {
    if (isDoc(file.path)) {
      const fence = line.match(/^\s{0,3}(\x60{3,}|~{3,})/);
      if (fence) {
        if (!inFence) inFence = fence[1];
        else if (
          fence[1][0] === inFence[0] &&
          fence[1].length >= inFence.length
        )
          inFence = "";
        continue;
      }
      if (inFence) continue;
      const heading = line.match(/^\s{0,3}(#{1,6})\s+(.+?)\s*#*$/);
      const plain = !structure || /\.(?:txt|rst|adoc)$/i.test(file.path);
      if (heading)
        out.push({
          label: heading[2],
          level: heading[1].length,
          start: index + 1,
          kind: "heading",
        });
      else if (plain && paragraph && line.trim())
        out.push({
          label: line.trim().slice(0, 76),
          level: 1,
          start: index + 1,
          kind: "passage",
        });
      paragraph = !line.trim();
    } else {
      const name = decl.exec(line)?.[1];
      if (!name) continue;
      const indent = (line.match(/^\s*/)?.[0] ?? "").replace(
        /\t/g,
        "    ",
      ).length;
      if (
        /^\s*(?:(?:export|pub|public|static)\s+)*(?:const|let)\s/.test(line)
      ) {
        if (
          indent > 0 ||
          (!/^\s*export\s/.test(line) &&
            !/=>|=\s*(?:async\s+)?function\b/.test(line))
        )
          continue;
      }
      out.push({
        label: name,
        level: indent + 1,
        start: index + 1,
        kind: "symbol",
        priority: /^\s*(?:export|pub|public)\b/.test(line)
          ? 0
          : indent === 0
            ? 1
            : 2,
      });
    }
  }
  // A parent declaration covers its nested declarations; highlights use the most specific span.
  for (const [i, item] of out.entries()) {
    let next = i + 1;
    while (next < out.length && out[next].level > item.level) next++;
    item.end = (out[next]?.start ?? lines.length + 1) - 1;
    if (item.kind === "symbol") {
      const declaration = lines[item.start - 1];
      // A one-line arrow or constant commonly precedes unindexed module state.
      if (/;\s*(?:\/\/.*)?$/.test(declaration)) item.end = item.start;
      else if (
        /\.(?:[cm]?[jt]sx?|go|rs|c|h|cc|cpp|hpp|java|kt|swift)$/i.test(
          file.path,
        )
      ) {
        const indent = declaration.match(/^\s*/)[0];
        for (let line = item.start; line < item.end; line++) {
          const value = lines[line];
          if (
            value.startsWith(indent) &&
            /^\}\s*[;,]?\s*(?:\/\/.*)?$/.test(value.slice(indent.length))
          ) {
            item.end = line + 1;
            break;
          }
        }
      }
    }
    while (item.end > item.start && !lines[item.end - 1].trim()) item.end--;
  }
  if (!isDoc(file.path) && out.length > limits.sections)
    return out
      .sort(
        (a, b) =>
          a.priority - b.priority || a.level - b.level || a.start - b.start,
      )
      .slice(0, limits.sections)
      .sort((a, b) => a.start - b.start);
  return out;
}
function importedPath(file, spec, paths) {
  const parts = file.split("/").slice(0, -1);
  for (const part of spec.split("/")) {
    if (part === "..") {
      if (!parts.length) return null;
      parts.pop();
    } else if (part && part !== ".") parts.push(part);
  }
  const base = parts.join("/");
  return [
    base,
    base.replace(/\.js$/, ".ts"),
    ...[".js", ".ts", ".jsx", ".tsx", ".mjs", "/index.js", "/index.ts"].map(
      (e) => base + e,
    ),
  ].find((p) => paths.has(p));
}
export function outline(files) {
  const nodes = [],
    edges = [],
    byPath = new Map(files.map((file, i) => [file.path, "f" + i]));
  for (const [i, file] of files.entries()) {
    const lines = file.text.split("\n"),
      fileId = "f" + i;
    const first = Math.max(1, lines.findIndex((l) => l.trim()) + 1);
    nodes.push({
      id: fileId,
      label: file.path.split("/").at(-1),
      kind: "file",
      path: file.path,
      start: first,
      end: first,
    });
    const items = sections(file),
      ancestry = [{ level: 0, id: fileId }];
    for (const [j, s] of items.slice(0, limits.sections).entries()) {
      const id = fileId + "s" + j;
      while (ancestry.length > 1 && ancestry.at(-1).level >= s.level)
        ancestry.pop();
      nodes.push({
        id,
        label: s.label,
        kind: s.kind,
        path: file.path,
        start: s.start,
        end: s.end,
      });
      edges.push({ from: ancestry.at(-1).id, to: id, kind: "contains" });
      ancestry.push({ id, level: s.level });
    }
    if (!isDoc(file.path))
      for (const [ix, line] of lines.entries()) {
        let statement = line;
        if (
          /^\s*(?:import|export)\s+(?:type\s+)?(?:[\w$]+\s*,\s*)?\{/.test(line)
        ) {
          let end = ix;
          while (
            !statement.includes("}") &&
            end + 1 < lines.length &&
            statement.length < 16000
          )
            statement += "\n" + lines[++end];
          if (
            /\}\s*$/.test(statement) &&
            /^\s*from\b/.test(lines[end + 1] ?? "")
          )
            statement += "\n" + lines[end + 1];
        }
        const spec = statement.match(
          /^\s*(?:(?:import|export)\s+[\s\S]*?\bfrom\s*|import\s*|(?:const|let|var)\s+.*?=\s*require\s*\()\s*["'](\.[^"']+)["']/,
        )?.[1];
        const to = spec && byPath.get(importedPath(file.path, spec, byPath));
        if (
          to &&
          to !== fileId &&
          !edges.some((e) => e.from === fileId && e.to === to)
        )
          edges.push({ from: fileId, to, kind: "imports", line: ix + 1 });
      }
  }
  return { nodes, edges };
}
export function bestNode(graph, path, line) {
  return (
    graph.nodes
      .filter((n) => n.path === path && n.start <= line && n.end >= line)
      .sort(
        (a, b) =>
          (a.kind === "file") - (b.kind === "file") ||
          a.end - a.start - (b.end - b.start),
      )[0] ?? graph.nodes.find((n) => n.path === path && n.kind === "file")
  );
}
// Spread the context budget over files so a single generated header cannot hide the rest.
export function excerpts(files) {
  const available = 32000,
    each = Math.max(180, Math.floor(available / files.length)),
    samples = [];
  for (const file of files) {
    const lines = file.text.split("\n"),
      sample = [];
    const anchors = [
      1,
      ...sections(file)
        .slice(0, 10)
        .map((s) => s.start),
    ];
    let used = 0;
    const seen = new Set();
    for (let distance = 0; distance < 24; distance++)
      for (const start of anchors) {
        const number = start + distance,
          line = lines[number - 1];
        if (
          line === undefined ||
          !line.trim() ||
          seen.has(number) ||
          line.length > 900 ||
          used + line.length + 10 > each
        )
          continue;
        sample.push([number, line]);
        seen.add(number);
        used += line.length + 10;
      }
    if (sample.length)
      samples.push({
        path: file.path,
        lines: sample.sort((a, b) => a[0] - b[0]),
      });
  }
  return samples;
}
export function readAgentGraph(reply, samples) {
  const data = JSON.parse(
    reply
      .trim()
      .replace(/^\x60\x60\x60(?:json)?\s*/i, "")
      .replace(/\s*\x60\x60\x60$/, ""),
  );
  if (
    !Array.isArray(data.nodes) ||
    !data.nodes.length ||
    data.nodes.length > 32 ||
    !Array.isArray(data.edges) ||
    data.edges.length > 72
  )
    throw Error("invalidMap");
  const files = new Map(samples.map((s) => [s.path, new Map(s.lines)]));
  const ids = new Set();
  const clean = (s, max) =>
    typeof s === "string" && s.trim().length > 0 && s.length <= max;
  const nodes = data.nodes.map((n) => {
    const source = files.get(n.path)?.get(n.line);
    if (
      !clean(n.id, 40) ||
      ids.has(n.id) ||
      !clean(n.label, 100) ||
      !clean(n.explanation, 1600) ||
      !Number.isInteger(n.line) ||
      !clean(n.quote, 900) ||
      source?.trim() !== n.quote.trim()
    )
      throw Error("invalidMap");
    ids.add(n.id);
    return {
      id: n.id,
      label: n.label,
      kind: "concept",
      path: n.path,
      start: n.line,
      end: n.line,
      explanation: n.explanation,
      quote: n.quote,
    };
  });
  const edges = data.edges.map((e) => {
    if (
      !ids.has(e.from) ||
      !ids.has(e.to) ||
      e.from === e.to ||
      !clean(e.label, 96)
    )
      throw Error("invalidMap");
    return { from: e.from, to: e.to, kind: "relation", label: e.label };
  });
  return { nodes, edges };
}
