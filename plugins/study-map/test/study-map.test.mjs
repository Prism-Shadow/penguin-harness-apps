/**
 * A learner imports a repository or reading, follows evidence in both directions, and asks
 * their configured Agent for a diagram. Bad citations and hosts unable to enforce the policy
 * must leave the previous study available. Repeated generation keys create only one Session.
 */
import { describe, it, expect } from "vitest";
import {
  outline,
  bestNode,
  selectFiles,
  excerpts,
  readAgentGraph,
} from "../workbenches/study-map/ui/model.js";
import { sourceLink } from "../workbenches/study-map/ui/inputs.js";
import workbench from "../workbenches/study-map/index.ts";
const files = [
  {
    path: "src/main.ts",
    text: 'import { start } from "./lib.js";\nexport function main(){\n  const flag = true;\n  return start(flag);\n}\n',
  },
  { path: "src/lib.ts", text: "export function start(ok){\n  return ok;\n}" },
  {
    path: "lesson.md",
    text: "Read modules separately.\nKeep their boundaries.\n\nCheck the place where data crosses.\nInspect the return value.",
  },
];
describe("following source evidence", () => {
  it("links a TypeScript import to its real file and resolves a function-body line to its declaration", () => {
    const g = outline(files),
      n = bestNode(g, "src/main.ts", 4);
    expect(n.label).toBe("main");
    expect(n.end).toBe(5);
    expect(g.edges).toContainEqual({
      from: "f0",
      to: "f1",
      kind: "imports",
      line: 1,
    });
    expect(g.nodes.map((n) => n.label)).not.toContain("flag");
    expect(
      sourceLink(
        { repo: "https://github.com/test/learn", revision: "a".repeat(40) },
        n,
      ),
    ).toBe(
      "https://github.com/test/learn/blob/" +
        "a".repeat(40) +
        "/src/main.ts#L2-L5",
    );
  });
  it("links multiline imports and re-exports at the start of their declarations", () => {
    const files = [
      {
        path: "entry.ts",
        text: '// entry\nimport {\n  read,\n  write,\n} from "./inputs.js";\nexport {\n draw,\n}\nfrom "./figure";',
      },
      { path: "inputs.ts", text: "export const read=1" },
      { path: "figure.ts", text: "export const draw=2" },
    ];
    expect(outline(files).edges.filter((e) => e.kind === "imports")).toEqual([
      { from: "f0", to: "f1", kind: "imports", line: 2 },
      { from: "f0", to: "f2", kind: "imports", line: 6 },
    ]);
  });
  it("keeps exported declarations when a module has many private helpers", () => {
    const text =
      Array.from(
        { length: 45 },
        (_, i) =>
          "function helper" + i + "(){\n  const internal = " + i + ";\n}",
      ).join("\n") + "\nexport function study(){\n return 42;\n}";
    const g = outline([{ path: "module.js", text }]);
    expect(g.nodes).toHaveLength(25);
    expect(bestNode(g, "module.js", 137).label).toBe("study");
  });
  it("maps Markdown paragraphs without headings and nested sections with actual file lines", () => {
    let g = outline(files);
    expect(bestNode(g, "lesson.md", 5)).toMatchObject({
      kind: "passage",
      start: 4,
      end: 5,
    });
    g = outline([
      { path: "m.md", text: "# One\n\n## Leaf\n\nnote\n\n# Two\n\nfinal" },
    ]);
    expect(bestNode(g, "m.md", 5).label).toBe("Leaf");
    expect(bestNode(g, "m.md", 9).label).toBe("Two");
  });
  it("skips hidden, binary and private files and favors entry points when the source is large", () => {
    const inputs = [
      ".env",
      "../a.ts",
      "credentials.json",
      "deps/doc.pdf",
      "node_modules/x/app.js",
      "foo/.git/log",
      "src/main.ts",
      ...Array.from({ length: 90 }, (_, i) => "lib/f" + i + ".ts"),
    ].map((path) => ({ path, size: 100 }));
    const out = selectFiles(inputs);
    expect(out).toHaveLength(64);
    expect(out[0].path).toBe("src/main.ts");
    expect(out.every((f) => f.path.endsWith(".ts"))).toBe(true);
  });
  it("accepts a verbatim cited concept and rejects a mismatched line, quote, file or edge", () => {
    const samples = excerpts(files),
      n = {
        id: "main",
        label: "Entry",
        path: "src/main.ts",
        line: 2,
        quote: "export function main(){",
        explanation: "Calls the imported start function.",
      };
    const read = (node = n, edges = []) =>
      readAgentGraph(JSON.stringify({ nodes: [node], edges }), samples);
    expect(read().nodes[0]).toMatchObject({ start: 2, path: n.path });
    for (const change of [
      { path: "ghost.ts" },
      { line: 99 },
      { line: 3 },
      { quote: "invented" },
    ])
      expect(() => read({ ...n, ...change })).toThrow();
    expect(() =>
      read(n, [{ from: "main", to: "ghost", label: "calls" }]),
    ).toThrow();
  });
});
describe("host sessions", () => {
  function setup(mode) {
    const calls = [];
    let state;
    const host = {
      getState: () => state,
      setState: async (v) => {
        state = v;
      },
      createSession: async (opts) => {
        calls.push(opts);
        return { sessionId: "new-session", approvalMode: mode };
      },
      run: async (id, message) => calls.push([id, message]),
      sessionResult: async () => ({ status: "completed", text: "answer" }),
    };
    const api = workbench.modules.Workbench.create({ use: { host } }).api.main;
    const submit = () =>
      api.handle({
        method: "POST",
        path: "/explain",
        body: { key: "unique-study-key", lang: "zh", samples: excerpts(files) },
      });
    return {
      calls,
      submit,
      get: (k) => api.handle({ method: "GET", path: "/explanations/" + k }),
    };
  }
  it("runs a single session for concurrent retries, with source lines and the selected language", async () => {
    const { calls, submit, get } = setup("deny-all");
    await Promise.all([submit(), submit()]);
    expect(calls).toHaveLength(2);
    expect(calls[0]).toEqual({ approvalMode: "deny-all" });
    expect(calls[1][1][0].text).toContain("Simplified Chinese");
    expect(calls[1][1][0].text).toContain("src/main.ts");
    expect((await get("unique-study-key")).body.text).toBe("answer");
    expect((await get("another-study-key")).status).toBe(404);
  });
  it("does not submit any source when an old host ignores the requested approval mode", async () => {
    const { calls, submit } = setup("allow-all");
    expect((await submit()).status).toBe(409);
    expect(calls).toHaveLength(1);
  });
});
