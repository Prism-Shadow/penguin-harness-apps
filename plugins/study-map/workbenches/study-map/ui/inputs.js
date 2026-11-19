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
    total: entries.length,
  });
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
export async function githubFiles(value) {
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
      total: regular.length,
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
      text: 'import { route } from "./route";\nimport { render } from "./response";\n\nexport function handle(path: string) {\n  const result = route(path);\n  return render(result);\n}\n',
    },
    {
      path: "src/route.ts",
      text: 'export function route(path: string) {\n  if (path === "/health") return { status: 200, body: "ok" };\n  return { status: 404, body: "missing" };\n}\n',
    },
    {
      path: "src/response.ts",
      text: "export function render(result: { status: number; body: string }) {\n  return new Response(result.body, { status: result.status });\n}\n",
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
    total: 4,
  };
}
