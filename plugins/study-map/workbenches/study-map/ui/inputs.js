import { eligible, limits, selectFiles } from "./model.js";
import {
  parseRepositoryRemote,
  repositorySourceHref,
} from "./vendor/repository-location.js";
export async function localFiles(list, folder) {
  const entries = Array.from(list, (f) => ({
    path: folder ? f.webkitRelativePath.split("/").slice(1).join("/") : f.name,
    size: f.size,
    file: f,
  }));
  return loadText(selectFiles(entries), (e) => e.file.text(), {
    title: folder ? list[0]?.webkitRelativePath.split("/")[0] : list[0]?.name,
    total: readable(entries),
  });
}
// Hidden, dependency and binary files are skipped by design; only readable files count as left out.
const readable = (entries) => entries.filter((e) => eligible(e.path)).length;
// Pasted text becomes a one-file study; a leading heading or line names it.
export function pastedText(value, fallback) {
  const text = value.replace(/\r\n?/g, "\n");
  if (!text.trim()) throw Error("empty");
  if (new TextEncoder().encode(text).length > limits.fileBytes)
    throw Error("tooLong");
  const first = text
    .split("\n")
    .find((line) => line.trim())
    .replace(/^\s{0,3}#{1,6}\s+/, "")
    .trim();
  const title = first.length > 60 ? first.slice(0, 57).trimEnd() + "…" : first;
  const name =
    title
      .replace(/[^\p{L}\p{N} _.-]+/gu, " ")
      .trim()
      .slice(0, 60) || fallback;
  return {
    id: crypto.randomUUID(),
    title: title || fallback,
    files: [{ path: name + ".md", text }],
    total: 1,
    updated: Date.now(),
  };
}
async function loadText(entries, read, props) {
  const files = [];
  let cursor = 0;
  async function worker() {
    while (cursor < entries.length) {
      const i = cursor++,
        entry = entries[i];
      let text = await read(entry);
      if (
        !text.trim() ||
        text.includes("\u0000") ||
        text.includes("\ufffd") ||
        new TextEncoder().encode(text).length > limits.fileBytes
      )
        continue;
      text = text.replace(/\r\n?/g, "\n");
      files[i] = { path: entry.path, text };
    }
  }
  await Promise.all(Array.from({ length: 4 }, worker));
  const kept = files.filter(Boolean);
  if (!kept.length) throw Error("empty");
  return {
    id: crypto.randomUUID(),
    ...props,
    files: kept,
    updated: Date.now(),
  };
}
// Accept what people paste: no scheme, www., a trailing slash or .git, or a link into the tree.
export function repositoryUrl(raw) {
  return raw
    .trim()
    .replace(/^(?:https?:\/\/)?(?:www\.)?github\.com\//i, "https://github.com/")
    .replace(
      /^(https:\/\/github\.com\/[\w.-]+\/[\w.-]+)\/(?:tree|blob)\/.*$/i,
      "$1",
    )
    .replace(/\/+$/, "")
    .replace(/\.git$/i, "");
}
export async function githubFiles(raw) {
  const value = repositoryUrl(raw);
  const parsed = parseRepositoryRemote(value, { authored: true });
  if (
    parsed?.provider !== "github" ||
    !/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/i.test(value)
  )
    throw Error("network");
  const match = new URL(value).pathname
    .replace(/^\/|\/$/g, "")
    .replace(/\.git$/i, "");
  const base = "https://api.github.com/repos/" + match;
  async function get(url, format) {
    const res = await fetch(url, {
      credentials: "omit",
      referrerPolicy: "no-referrer",
      signal: AbortSignal.timeout(22000),
    });
    if (!res.ok) throw Error("network");
    return format === "json" ? res.json() : res.text();
  }
  const info = await get(base, "json"),
    head = await get(
      base + "/commits/" + encodeURIComponent(info.default_branch),
      "json",
    );
  if (
    !/^[0-9a-f]{40}$/.test(head.sha) ||
    !/^[0-9a-f]{40}$/.test(head.commit?.tree?.sha)
  )
    throw Error("network");
  const tree = await get(
    base + "/git/trees/" + head.commit.tree.sha + "?recursive=1",
    "json",
  );
  const regular = tree.tree.filter(
    (e) => e.type === "blob" && /^100[67]/.test(e.mode),
  );
  const entries = selectFiles(regular);
  return loadText(
    entries,
    (e) =>
      get(
        "https://raw.githubusercontent.com/" +
          match +
          "/" +
          head.sha +
          "/" +
          e.path.split("/").map(encodeURIComponent).join("/"),
        "text",
      ),
    {
      title: match,
      total: readable(regular),
      repo: "https://github.com/" + match,
      revision: head.sha,
      truncated: tree.truncated,
    },
  );
}
export function sourceLink(study, node) {
  return study.repo && /^[a-f0-9]{40}$/.test(study.revision)
    ? repositorySourceHref("github", study.repo, study.revision, {
        path: node.path,
        line: node.start,
        endLine: node.end,
      })
    : null;
}
export function library() {
  const db = new Promise((resolve, reject) => {
    const request = indexedDB.open(
      "penguin-study-map:" + location.pathname.replace(/\/ui\/.*$/, ""),
      1,
    );
    request.onupgradeneeded = () =>
      request.result.createObjectStore("studies", { keyPath: "id" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  function action(mode, run) {
    return db.then(
      (data) =>
        new Promise((resolve, reject) => {
          const tx = data.transaction("studies", mode),
            r = run(tx.objectStore("studies"));
          tx.oncomplete = () => resolve(r.result);
          tx.onerror = () => reject(tx.error);
          tx.onabort = () => reject(tx.error);
        }),
    );
  }
  return {
    all: () => action("readonly", (s) => s.getAll()),
    save: (s) => action("readwrite", (store) => store.put(s)),
    drop: (k) => action("readwrite", (s) => s.delete(k)),
  };
}
export function sample(lang) {
  const files = [
    {
      path: "src/server.ts",
      text: 'import { route } from "./route";\nimport { render } from "./response";\n\nexport function handle(path: string) {\n  const endpoint = route(path);\n  return render(endpoint);\n}\n',
    },
    {
      path: "src/route.ts",
      text: 'import { health } from "./health";\nimport { missing } from "./missing";\n\nexport function route(path: string) {\n  return path === "/health" ? health() : missing();\n}\n',
    },
    {
      path: "src/response.ts",
      text: "export function render(result: { status: number; body: string }) {\n  return new Response(result.body, { status: result.status });\n}\n",
    },
    {
      path: "src/health.ts",
      text: 'export function health() {\n  return {status: 200, body:"ok"};\n}\n',
    },
    {
      path: "src/missing.ts",
      text: 'export function missing() {\n  return {status: 404, body:"missing"};\n}\n',
    },
    {
      path: "README.md",
      text:
        lang === "zh"
          ? "# 一次请求的旅程\n\n服务把路径传给路由，再将结果写入响应。\n\n## 健康检查\n\n读取 /health 会得到状态码 200。\n"
          : "# Reading a request\n\nThe server passes the path to a route and renders the result.\n\n## Health check\n\nReading /health returns status 200.\n",
    },
  ];
  return {
    id: "example-" + lang,
    title: lang === "zh" ? "一次请求的旅程" : "Reading a request",
    files,
    total: files.length,
  };
}

/** A reading example with sections to explore alongside the code example. */
export function tidePool(lang) {
  const title = lang === "zh" ? "潮池的一天" : "How a tide pool changes";
  const text =
    lang === "zh"
      ? "# 潮池的一天\n\n退潮时，一些海水留在海岸岩石的凹处，形成潮池。\n\n## 退潮\n\n潮池与外海分开。阳光会使池水升温，水分蒸发会使盐度升高。\n\n## 涨潮\n\n海水再次漫过岩石，把浮游生物带入池中。海水的交换也会改变池内的水温和盐度。"
      : "# How a tide pool changes\n\nWhen the tide recedes, seawater stays in hollows in the rock.\n\n## Low tide\n\nThe pool is cut off from the sea. Sunlight can warm it, and evaporation can raise its salinity.\n\n## High tide\n\nWaves wash over the rocks and carry plankton into the pool. The exchange of seawater can change the pool’s temperature and salinity.";
  return {
    id: "example-tides-" + lang,
    title,
    files: [{ path: "tide-pool.md", text }],
    total: 1,
  };
}
