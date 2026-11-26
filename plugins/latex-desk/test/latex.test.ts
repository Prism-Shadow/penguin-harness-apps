/**
 * LaTeX Paper Desk, the parts that run without a host: the archive, the compiler's log, the
 * SyncTeX map, the diff and the replacements a proposal applies.
 *
 * - A project travels out as a ZIP and comes back with every file, every byte and no wrapper
 *   folder, and a name that would escape the project is dropped rather than followed.
 * - A log names the file and the line at fault, for an error and for a warning alike, and a
 *   repeat of the same message is reported once.
 * - A SyncTeX map answers both ways: a source line's page, and the source line behind a point.
 * - A diff keeps the lines that did not move and marks the ones that did.
 * - A replacement lands on the lines the reviewer saw, bottom-up, refuses a quote that no longer
 *   matches, and deletes a range that replaces it with nothing.
 */
import { describe, expect, it } from "vitest";
import {
  EditRefused,
  anchorEdit,
  applyReplacements,
  decodeText,
  dedupeDiagnostics,
  diffLines,
  encodeText,
  forwardSearch,
  inverseSearch,
  isBinaryName,
  locateQuote,
  normalizeEntryName,
  parseLog,
  parseSynctex,
  quoteSpan,
  spansToEdits,
  unwrapLog,
  unzipSync,
  zipSync,
} from "../workbenches/paper/latex";
import { SAMPLE_FILES, SAMPLE_MAIN } from "../workbenches/paper/sample";

const same = (path: string) =>
  path.replace(/^\/tmp\/build\//, "").replace(/^\.\//, "");

describe("a project archive", () => {
  it("keeps every file and byte through export and import", () => {
    const png = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x00, 0xff, 0x10]);
    const files = [
      { name: "main.tex", data: encodeText("\\documentclass{article}\n") },
      { name: "sections/intro.tex", data: encodeText("A paragraph.\n") },
      { name: "figures/pipeline.png", data: png },
    ];

    const back = unzipSync(zipSync(files));

    expect(back.map((entry) => entry.name)).toEqual(
      files.map((entry) => entry.name),
    );
    expect(decodeText(back[0]!.data)).toBe("\\documentclass{article}\n");
    expect(Array.from(back[2]!.data)).toEqual(Array.from(png));
  });

  it("reads an archive that wraps everything in one folder as if it did not", () => {
    const back = unzipSync(
      zipSync([
        { name: "paper/main.tex", data: encodeText("x") },
        { name: "paper/sections/intro.tex", data: encodeText("y") },
      ]),
    );

    expect(back.map((entry) => entry.name)).toEqual([
      "main.tex",
      "sections/intro.tex",
    ]);
  });

  it("refuses a name that would leave the project and keeps the rest", () => {
    expect(normalizeEntryName("../outside.tex")).toBeNull();
    expect(normalizeEntryName("a/../../outside.tex")).toBeNull();
    expect(normalizeEntryName("__MACOSX/._main.tex")).toBeNull();
    expect(normalizeEntryName("./sections//intro.tex")).toBe(
      "sections/intro.tex",
    );
    expect(normalizeEntryName("sections\\intro.tex")).toBe(
      "sections/intro.tex",
    );
  });

  it("tells a figure from a source file by its extension", () => {
    expect(isBinaryName("figures/pipeline.PNG")).toBe(true);
    expect(isBinaryName("refs.bib")).toBe(false);
    expect(isBinaryName("main.tex")).toBe(false);
  });
});

describe("a compiler log", () => {
  it("names the file and line of an error and of a warning", () => {
    const log = [
      "This is pdfTeX",
      "(./main.tex",
      "(./sections/introduction.tex",
      "! Undefined control sequence.",
      "l.12 \\badmacro",
      ")",
      "LaTeX Warning: Reference `fig:arch' on page 1 undefined on input line 34.",
      "(./sections/experiments.tex",
      "! Missing $ inserted.",
      "l.7 x_1",
      ")",
    ].join("\n");

    const found = parseLog(log, (path) => path.replace(/^\.\//, ""));

    expect(found).toEqual([
      {
        severity: "error",
        file: "sections/introduction.tex",
        line: 12,
        message: "Undefined control sequence",
        detail: "! Undefined control sequence. l.12 \\badmacro",
      },
      {
        severity: "warning",
        file: "main.tex",
        line: 34,
        message: "Reference `fig:arch' on page 1 undefined",
        detail:
          "LaTeX Warning: Reference `fig:arch' on page 1 undefined on input line 34.",
      },
      {
        severity: "error",
        file: "sections/experiments.tex",
        line: 7,
        message: "Missing $ inserted",
        detail: "! Missing $ inserted. l.7 x_1",
      },
    ]);
  });

  it("reports the same message once and leaves a clean log empty", () => {
    const twice = [
      "! LaTeX Error: File `missing.sty' not found.",
      "! LaTeX Error: File `missing.sty' not found.",
    ].join("\n");

    expect(parseLog(twice, same)).toHaveLength(1);
    expect(parseLog("Output written on main.pdf (3 pages).", same)).toEqual([]);
  });

  it("undoes the fixed-column wrap an engine breaks a message at", () => {
    const whole =
      "LaTeX Warning: Reference `fig:arch' on page 1 undefined on input line 34.";
    const log = ["(./main.tex", whole.slice(0, 79), whole.slice(79), ")"].join(
      "\n",
    );

    expect(unwrapLog(log)).toContain(whole);
    expect(parseLog(log, (path) => path.replace(/^\.\//, ""))).toEqual([
      {
        severity: "warning",
        file: "main.tex",
        line: 34,
        message: "Reference `fig:arch' on page 1 undefined",
        detail: whole,
      },
    ]);
  });

  it("never glues a new record onto a line that filled the column", () => {
    const long = "x".repeat(79);

    expect(unwrapLog(`${long}\n! Undefined control sequence.`)).toBe(
      `${long}\n! Undefined control sequence.`,
    );
  });

  it("attributes an error to an input file the log names without its extension", () => {
    const log = [
      "(./main.tex",
      "(./sections/introduction",
      "! Undefined control sequence.",
      "l.3 \\undefinedmacro",
      ")",
      ")",
    ].join("\n");
    const known = new Set(["main.tex", "sections/introduction.tex"]);
    const resolve = (named: string) => {
      const clean = named.replace(/^\.\//, "");
      for (const candidate of [clean, `${clean}.tex`, `${clean}.ltx`])
        if (known.has(candidate)) return candidate;
      return "";
    };

    expect(parseLog(log, resolve)).toEqual([
      {
        severity: "error",
        file: "sections/introduction.tex",
        line: 3,
        message: "Undefined control sequence",
        detail: "! Undefined control sequence. l.3 \\undefinedmacro",
      },
    ]);
  });

  it("lets a package parenthesis nest without claiming the message", () => {
    const log = [
      "(./main.tex",
      "(./article.cls",
      "! Missing $ inserted.",
      "l.9 x_1",
      ")",
      ")",
    ].join("\n");
    const resolve = (named: string) =>
      named.replace(/^\.\//, "") === "main.tex" ? "main.tex" : "";

    expect(parseLog(log, resolve)).toEqual([
      {
        severity: "error",
        file: "main.tex",
        line: 9,
        message: "Missing $ inserted",
        detail: "! Missing $ inserted. l.9 x_1",
      },
    ]);
  });
});

describe("a SyncTeX map", () => {
  const map = [
    "SyncTeX Version:1",
    "Input:1:/tmp/build/main.tex",
    "Input:2:/tmp/build/sections/introduction.tex",
    "{1",
    "(1,7:4736286,456",
    "h1,9:100,700",
    "{2",
    "x2,3:10,20",
  ].join("\n");

  it("turns a source line into the page and height it was typeset at", () => {
    const points = parseSynctex(map, same);

    expect(forwardSearch(points, "main.tex", 8)).toMatchObject({
      page: 1,
      line: 7,
    });
    expect(forwardSearch(points, "main.tex", 7)).toMatchObject({
      page: 1,
      line: 7,
    });
    expect(forwardSearch(points, "sections/introduction.tex", 4)).toMatchObject(
      {
        page: 2,
        line: 3,
      },
    );
    expect(forwardSearch(points, "main.tex", 1)).toMatchObject({
      page: 1,
      line: 7,
    });
    expect(forwardSearch(points, "sections/related.tex", 1)).toBeNull();
  });

  it("turns a point on a page back into the source line behind it", () => {
    const points = parseSynctex(map, same);

    expect(inverseSearch(points, 1, 460)).toMatchObject({
      file: "main.tex",
      line: 7,
    });
    expect(inverseSearch(points, 2, 20)).toMatchObject({
      file: "sections/introduction.tex",
      line: 3,
    });
    expect(inverseSearch(points, 9, 0)).toBeNull();
  });
});

describe("a proposal over the source", () => {
  const source = [
    "\\section{Results}",
    "We ran eight tasks.",
    "The scores rose.",
    "",
  ].join("\n");

  it("marks the lines that moved and keeps the ones that did not", () => {
    const rows = diffLines("a\nb\nc", "a\nB\nc");

    expect(
      rows.filter((row) => row.kind === "same").map((row) => row.text),
    ).toEqual(["a", "c"]);
    expect(rows.filter((row) => row.kind === "removed")).toMatchObject([
      { text: "b", before: 2, after: 0 },
    ]);
    expect(rows.filter((row) => row.kind === "added")).toMatchObject([
      { text: "B", before: 0, after: 2 },
    ]);
  });

  it("applies several replacements bottom-up and deletes a range replaced by nothing", () => {
    const next = applyReplacements(source, [
      {
        startLine: 2,
        endLine: 2,
        text: "We ran eight tasks in five repetitions.",
      },
      { startLine: 3, endLine: 3, text: "" },
    ]);

    expect(next.split("\n")).toEqual([
      "\\section{Results}",
      "We ran eight tasks in five repetitions.",
      "",
    ]);
  });

  it("refuses a quote that no longer sits where the reviewer saw it", () => {
    expect(() =>
      applyReplacements(source, [
        {
          startLine: 2,
          endLine: 2,
          quote: "We ran nine tasks.",
          text: "Rewritten.",
        },
      ]),
    ).toThrow(EditRefused);
  });

  it("refuses a range outside the file and finds a quote that occurs once", () => {
    expect(() =>
      applyReplacements(source, [{ startLine: 12, endLine: 12, text: "x" }]),
    ).toThrow(EditRefused);
    expect(locateQuote(source, "We ran eight tasks.")).toEqual({
      startLine: 2,
      endLine: 2,
    });
    expect(locateQuote(source, "Nowhere.")).toBeNull();
    expect(locateQuote("a\na\n", "a")).toBeNull();
  });

  it("never relocates a fragment onto a whole line and loses the rest of it", () => {
    expect(locateQuote(source, "eight tasks")).toBeNull();
  });

  it("picks between repeated lines only when a hint singles one out", () => {
    expect(locateQuote("a\na\n", "a", 2)).toEqual({ startLine: 2, endLine: 2 });
    expect(locateQuote("a\na\n", "a", 1)).toEqual({ startLine: 1, endLine: 1 });
    expect(locateQuote("a\na\na\n", "a", 2)).toEqual({
      startLine: 2,
      endLine: 2,
    });
    expect(locateQuote("a\na\na\n", "a", 1.5)).toBeNull();
  });

  it("replaces a whole-line quote as whole lines", () => {
    const edit = anchorEdit(source, "The scores rose.", "\\item note");
    expect(edit).toEqual({
      startLine: 3,
      endLine: 3,
      quote: "The scores rose.",
      text: "\\item note",
    });
    expect(applyReplacements(source, [edit!]).split("\n")).toEqual([
      "\\section{Results}",
      "We ran eight tasks.",
      "\\item note",
      "",
    ]);
  });

  it("anchors a fragment inside its line and keeps the rest of the line", () => {
    const edit = anchorEdit(source, "eight tasks", "nine jobs");
    expect(edit).toEqual({
      startLine: 2,
      endLine: 2,
      quote: "We ran eight tasks.",
      text: "We ran nine jobs.",
    });
    expect(applyReplacements(source, [edit!])).toBe(
      "\\section{Results}\nWe ran nine jobs.\nThe scores rose.\n",
    );
  });

  it("finds a fragment again after a reflow loosened the spaces", () => {
    const span = quoteSpan("We ran  eight   tasks.", "We ran eight tasks");
    expect(span).toEqual({
      start: 0,
      end: "We ran  eight   tasks".length,
      line: 1,
      endLine: 1,
      whole: false,
    });
  });

  it("disambiguates a repeated fragment only with a strict hint", () => {
    const text = "one eight two\nthree eight four";
    expect(quoteSpan(text, "eight", 2)).toMatchObject({ line: 2 });
    expect(quoteSpan(text, "eight", 1)).toMatchObject({ line: 1 });
    expect(quoteSpan(text, "eight")).toBeNull();
    expect(quoteSpan(text, "eight", 1.5)).toBeNull();
  });

  it("merges two fragments on one line into one edit that keeps the line", () => {
    const line = "We ran eight tasks in eight hours.";
    const first = quoteSpan(line, "eight tasks")!;
    const second = quoteSpan(line, "eight hours")!;
    const { edits, skipped } = spansToEdits(line, [
      { span: first, text: "nine jobs" },
      { span: second, text: "nine days" },
    ]);
    expect(skipped).toBe(0);
    expect(edits).toHaveLength(1);
    expect(edits[0]).toMatchObject({ startLine: 1, endLine: 1 });
    expect(applyReplacements(line, edits)).toBe(
      "We ran nine jobs in nine days.",
    );
  });

  it("drops an edit whose span overlaps the one before it", () => {
    const line = "one eight two eight three";
    const first = quoteSpan(line, "eight two")!;
    const second = quoteSpan(line, "two eight")!;
    const { edits, skipped } = spansToEdits(line, [
      { span: first, text: "X" },
      { span: second, text: "Y" },
    ]);
    expect(skipped).toBe(1);
    expect(edits).toHaveLength(1);
    expect(applyReplacements(line, edits)).toBe("one X eight three");
  });

  it("anchors an insertion on the quoted line without touching it", () => {
    const edit = {
      startLine: 4,
      endLine: 3,
      quote: "The scores rose.",
      text: "\\item note",
    };
    expect(applyReplacements(source, [edit]).split("\n")).toEqual([
      "\\section{Results}",
      "We ran eight tasks.",
      "The scores rose.",
      "\\item note",
      "",
    ]);
  });

  it("keeps a CRLF file CRLF through an edit", () => {
    const crlf = "a\r\nb\r\nc";
    expect(
      applyReplacements(crlf, [{ startLine: 2, endLine: 2, text: "B" }]),
    ).toBe("a\r\nB\r\nc");
  });

  it("refuses edits whose ranges overlap instead of guessing an order", () => {
    expect(() =>
      applyReplacements(source, [
        { startLine: 2, endLine: 3, text: "x" },
        { startLine: 3, endLine: 3, text: "y" },
      ]),
    ).toThrow(EditRefused);
  });

  it("checks an insertion's quote against the lines just above its point", () => {
    expect(() =>
      applyReplacements(source, [
        { startLine: 4, endLine: 3, quote: "Not there.", text: "x" },
      ]),
    ).toThrow(EditRefused);
    expect(
      applyReplacements(source, [
        { startLine: 4, endLine: 3, quote: "The scores rose.", text: "x" },
      ]).split("\n"),
    ).toEqual([
      "\\section{Results}",
      "We ran eight tasks.",
      "The scores rose.",
      "x",
      "",
    ]);
  });

  it("reports a repeated diagnostic once", () => {
    const item = {
      severity: "error" as const,
      file: "main.tex",
      line: 3,
      message: "Undefined control sequence",
      detail: "x",
    };
    expect(dedupeDiagnostics([item, { ...item }])).toHaveLength(1);
  });
});

describe("the bundled paper", () => {
  it("is a multi-file project with a bibliography and a figure", () => {
    const paths = SAMPLE_FILES.map((file) => file.path);

    expect(SAMPLE_MAIN).toBe("main.tex");
    expect(
      paths.filter((path) => path.endsWith(".tex")).length,
    ).toBeGreaterThanOrEqual(6);
    expect(paths).toContain("refs.bib");
    expect(paths).toContain("figures/pipeline.png");
    for (const path of paths) expect(normalizeEntryName(path)).toBe(path);
  });

  it("survives the archive it is exported as", () => {
    const exported = zipSync(
      SAMPLE_FILES.map((file) => ({
        name: file.path,
        data: file.binary
          ? Uint8Array.from(Buffer.from(file.data, "base64"))
          : encodeText(file.data),
      })),
    );

    const back = unzipSync(exported);

    expect(back.map((entry) => entry.name).sort()).toEqual(
      SAMPLE_FILES.map((file) => file.path).sort(),
    );
    expect(
      decodeText(back.find((entry) => entry.name === "refs.bib")!.data),
    ).toContain("@inproceedings{zhang2025context");
  });
});
