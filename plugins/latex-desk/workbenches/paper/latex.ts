/// <reference path="./node-builtins.d.ts" />
// The paper workbench's core, kept apart from the host wiring so it can be tested on its own:
// a project is a folder of source files, a ZIP that travels in and out unchanged, a compile
// whose log names the file and line at fault, SyncTeX points from source to PDF, and the
// replacements a review or a polish proposes.
import { deflateRawSync, inflateRawSync } from "node:zlib";

/* ---------------------------------------------------------------- text */

const decoder = new TextDecoder("utf-8");
const encoder = new TextEncoder();

export const encodeText = (text: string): Uint8Array => encoder.encode(text);
export const decodeText = (bytes: Uint8Array): string => decoder.decode(bytes);

/** One file of a project, kept in the workbench's own state. */
export type StoredFile = {
  path: string;
  /** True when `data` is base64 rather than text. */
  binary: boolean;
  data: string;
};

/** Extensions a project may hold as bytes rather than as text. */
const BINARY = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".pdf",
  ".eps",
  ".ps",
  ".ttf",
  ".otf",
  ".woff",
  ".woff2",
  ".zip",
  ".gz",
  ".svgz",
]);

export function isBinaryName(name: string): boolean {
  const dot = name.lastIndexOf(".");
  return dot !== -1 && BINARY.has(name.slice(dot).toLowerCase());
}

/* ---------------------------------------------------------------- zip */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

/** The CRC-32 of a byte range, as a ZIP central directory records it. */
export function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++)
    crc = CRC_TABLE[(crc ^ data[i]!) & 0xff]! ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

export type ZipEntry = { name: string; data: Uint8Array };

/** A deterministic ZIP: every entry deflated at the same level, in the order given. */
export function zipSync(
  entries: readonly ZipEntry[],
  at = new Date(),
): Uint8Array {
  const time =
    ((at.getHours() << 11) | (at.getMinutes() << 5) | (at.getSeconds() >> 1)) &
    0xffff;
  const date =
    (((at.getFullYear() - 1980) << 9) |
      ((at.getMonth() + 1) << 5) |
      at.getDate()) &
    0xffff;
  const pieces: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;
  for (const entry of entries) {
    const name = encoder.encode(entry.name);
    const crc = crc32(entry.data);
    const packed = deflateRawSync(entry.data, { level: 9 });
    const local = new Uint8Array(30 + name.length);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, 20, true);
    lv.setUint16(6, 0x0800, true);
    lv.setUint16(8, 8, true);
    lv.setUint16(10, time, true);
    lv.setUint16(12, date, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, packed.length, true);
    lv.setUint32(22, entry.data.length, true);
    lv.setUint16(26, name.length, true);
    lv.setUint16(28, 0, true);
    local.set(name, 30);
    pieces.push(local, packed);

    const record = new Uint8Array(46 + name.length);
    const cv = new DataView(record.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0x0800, true);
    cv.setUint16(10, 8, true);
    cv.setUint16(12, time, true);
    cv.setUint16(14, date, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, packed.length, true);
    cv.setUint32(24, entry.data.length, true);
    cv.setUint16(28, name.length, true);
    cv.setUint32(42, offset, true);
    record.set(name, 46);
    central.push(record);
    offset += local.length + packed.length;
  }
  const size = central.reduce((sum, part) => sum + part.length, 0);
  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(8, entries.length, true);
  ev.setUint16(10, entries.length, true);
  ev.setUint32(12, size, true);
  ev.setUint32(16, offset, true);
  const all = [...pieces, ...central, end];
  const out = new Uint8Array(all.reduce((sum, part) => sum + part.length, 0));
  let at2 = 0;
  for (const part of all) {
    out.set(part, at2);
    at2 += part.length;
  }
  return out;
}

const LOCAL_HEADER = 0x04034b50;
const CENTRAL_HEADER = 0x02014b50;
const END_HEADER = 0x06054b50;

/** Every file an archive holds: folders dropped, names made relative, no `..` escapes. */
export function unzipSync(bytes: Uint8Array): ZipEntry[] {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let end = bytes.length - 22;
  const floor = Math.max(0, bytes.length - 65557);
  while (end >= floor && view.getUint32(end, true) !== END_HEADER) end--;
  if (end < floor) throw new Error("invalidArchive");
  const count = view.getUint16(end + 10, true);
  let p = view.getUint32(end + 16, true);
  const entries: ZipEntry[] = [];
  for (let i = 0; i < count; i++) {
    if (view.getUint32(p, true) !== CENTRAL_HEADER)
      throw new Error("invalidArchive");
    const method = view.getUint16(p + 10, true);
    const compressed = view.getUint32(p + 20, true);
    const size = view.getUint32(p + 24, true);
    const nameLength = view.getUint16(p + 28, true);
    const extraLength = view.getUint16(p + 30, true);
    const commentLength = view.getUint16(p + 32, true);
    const local = view.getUint32(p + 42, true);
    const name = decoder.decode(bytes.subarray(p + 46, p + 46 + nameLength));
    p += 46 + nameLength + extraLength + commentLength;
    if (name.endsWith("/")) continue;
    const name2 = normalizeEntryName(name);
    if (name2 === null) continue;
    if (view.getUint32(local, true) !== LOCAL_HEADER)
      throw new Error("invalidArchive");
    const start =
      local +
      30 +
      view.getUint16(local + 26, true) +
      view.getUint16(local + 28, true);
    if (start + compressed > bytes.length) throw new Error("invalidArchive");
    const body = bytes.subarray(start, start + compressed);
    if (method === 0) entries.push({ name: name2, data: body.slice() });
    else if (method === 8)
      entries.push({ name: name2, data: inflateRawSync(body) });
    else throw new Error("unsupportedCompression");
  }
  return stripCommonFolder(entries);
}

/** A stored path as a project path: forward slashes, no root, no way out of the folder. */
export function normalizeEntryName(name: string): string | null {
  const parts = name.replace(/\\/g, "/").split("/");
  const kept: string[] = [];
  for (const part of parts) {
    if (part === "" || part === ".") continue;
    if (part === "..") return null;
    if (part === "__MACOSX") return null;
    kept.push(part);
  }
  return kept.length === 0 ? null : kept.join("/");
}

/** An archive that wraps everything in one folder is read as if it did not. */
function stripCommonFolder(entries: readonly ZipEntry[]): ZipEntry[] {
  if (entries.length === 0) return [];
  const first = entries[0]!.name.split("/")[0]!;
  if (!entries.every((entry) => entry.name.startsWith(`${first}/`)))
    return [...entries];
  return entries.map((entry) => ({
    name: entry.name.slice(first.length + 1),
    data: entry.data,
  }));
}

/* ---------------------------------------------------------------- log */

export type Diagnostic = {
  severity: "error" | "warning";
  /** Project-relative source file; empty when the log names none. */
  file: string;
  /** 1-based line; 0 when the log names none. */
  line: number;
  message: string;
  /** The engine's verbatim log lines, for a reader who wants them. */
  detail: string;
};

/**
 * TeX wraps its log at a fixed column (79 by default) without regard for words, so a message can
 * arrive as `on inpu` followed by `t line 6`. Joining a line that reached the column with the one
 * after it restores the sentence; a line that plainly begins a new record is never a continuation,
 * however long the line before it was.
 */
const LOG_WRAP = 79;
const NEW_RECORD =
  /^(?:!|\(|\)|\[|\]|l\.\d+|\*|Output written|File:|Overfull|Underfull|LaTeX |Package |Class |No pages of output|Transcript written|Run number|This is |entering extended mode)/;

export function unwrapLog(text: string): string {
  const out: string[] = [];
  const continues: boolean[] = [];
  for (const line of text.split(/\r?\n/)) {
    const at = out.length - 1;
    if (at >= 0 && continues[at] === true && !NEW_RECORD.test(line)) {
      out[at] = `${out[at]!}${line}`;
      continues[at] = line.length >= LOG_WRAP;
      continue;
    }
    out.push(line);
    continues.push(line.length >= LOG_WRAP);
  }
  return out.join("\n");
}

/**
 * Where each project file is open in a log, as the offsets it becomes the innermost one at. A `(`
 * whose following token resolves to a project file opens it and the matching `)` closes it, so a
 * diagnostic belongs to the innermost file open at its offset. TeX names an `\input` file without
 * its extension (`(sections/introduction`) and names fonts and packages too, so the caller decides
 * what a token means; a token it does not recognise still nests but claims no message, which keeps
 * the depth right without attributing a message to it.
 */
function fileMarks(
  text: string,
  resolve: (named: string) => string,
): Array<{ at: number; file: string }> {
  const marks: Array<{ at: number; file: string }> = [];
  const open: Array<string | null> = [];
  const innermost = (): string => {
    for (let i = open.length - 1; i >= 0; i--) {
      const file = open[i];
      if (file !== undefined && file !== null) return file;
    }
    return "";
  };
  let current = "";
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch !== "(" && ch !== ")") continue;
    if (ch === "(") {
      const named = /^(["']?)([^()\s"']{1,300})\1/.exec(
        text.slice(i + 1, i + 320),
      );
      const file = named === null ? "" : resolve(named[2]!);
      open.push(file === "" ? null : file);
    } else open.pop();
    const file = innermost();
    if (file !== current) {
      marks.push({ at: i, file });
      current = file;
    }
  }
  return marks;
}

/**
 * Reads a TeX log into diagnostics: an error is the `! message` line plus the `l.<n>` line that
 * follows it, attributed to the file whose parenthesis is open at that point; a warning is a
 * `LaTeX Warning`/`Package … Warning`/`Class … Warning` with `on input line <n>`. Lines are
 * unwrapped first, because an engine breaks them at a fixed column rather than at a word. `resolve`
 * turns a path as the log names it into the project path the page shows, or into nothing.
 */
export function parseLog(
  text: string,
  resolve: (path: string) => string,
): Diagnostic[] {
  const out: Diagnostic[] = [];
  const joined = unwrapLog(text);
  const marks = fileMarks(joined, resolve);
  // Marks are in log order, so a diagnostic's file is the last one that took effect before it.
  const fileAt = (at: number): string => {
    let lo = 0;
    let hi = marks.length - 1;
    let found: string | undefined;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (marks[mid]!.at <= at) {
        found = marks[mid]!.file;
        lo = mid + 1;
      } else hi = mid - 1;
    }
    return found ?? "";
  };

  const lines = joined.split(/\r?\n/);
  const offsets: number[] = [];
  for (let i = 0, at = 0; i < lines.length; i++) {
    offsets.push(at);
    at += lines[i]!.length + 1;
  }
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const start = offsets[i]!;
    const error = /^!\s?(.*)$/.exec(line);
    if (error !== null) {
      let at = i;
      let where = 0;
      let detail = line;
      for (let k = i + 1; k < Math.min(i + 8, lines.length); k++) {
        const near = /^l\.(\d+)\s?(.*)$/.exec(lines[k]!);
        if (near !== null) {
          where = Number(near[1]);
          at = k;
          detail = `${line} ${lines[k]}`;
          break;
        }
      }
      out.push({
        severity: "error",
        file: fileAt(start),
        line: where,
        message: (error[1]!.trim() || "LaTeX error").replace(/\.$/, ""),
        detail,
      });
      continue;
    }
    const warning =
      /^(?:LaTeX|Package\s+\S+|Class\s+\S+)\s+Warning:\s+(.*)$/.exec(
        line.trim(),
      );
    if (warning !== null) {
      let message = warning[1]!.trim();
      let where = 0;
      const lineMatch = /on input line (\d+)\.?$/.exec(message);
      if (lineMatch !== null) {
        where = Number(lineMatch[1]);
        message = message.slice(0, lineMatch.index).trim();
      }
      out.push({
        severity: "warning",
        file: fileAt(start),
        line: where,
        message: message.replace(/\.$/, ""),
        detail: line,
      });
      continue;
    }
    const box =
      /^(Overfull|Underfull) \\[hv]box .*?(?:at lines? (\d+)|in paragraph at lines (\d+))/.exec(
        line,
      );
    if (box !== null) {
      out.push({
        severity: "warning",
        file: fileAt(start),
        line: Number(box[2] ?? box[3]),
        message: line.trim().replace(/^\(\d+\.\d+pt too \w+\)\s*/, ""),
        detail: line,
      });
    }
  }
  return dedupeDiagnostics(out);
}

/** The diagnostics with every repeat of the same severity, place and message dropped. */
export function dedupeDiagnostics(items: readonly Diagnostic[]): Diagnostic[] {
  const seen = new Set<string>();
  const out: Diagnostic[] = [];
  for (const item of items) {
    const key = `${item.severity}|${item.file}|${item.line}|${item.message}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

/* ---------------------------------------------------------------- synctex */

export type SyncPoint = { file: string; line: number; page: number; y: number };

/**
 * SyncTeX records, in the two directions a reader needs: a source line's page and height, and
 * the source line behind a page and height. A page starts at `{<n>`; tags come from
 * `Input:<tag>:<path>`; a content record is `<tag>,<line>:<h>,<v>…` — box and rule records that
 * carry a tag but no line belong to the file, not to a line, and are skipped.
 */
export function parseSynctex(
  text: string,
  relative: (path: string) => string,
): SyncPoint[] {
  const tags = new Map<string, string>();
  const points: SyncPoint[] = [];
  let page = 0;
  for (const raw of text.split(/\r?\n/)) {
    const input = /^Input:(\d+):(.*)$/.exec(raw);
    if (input !== null) {
      tags.set(input[1]!, input[2]!.trim());
      continue;
    }
    const pageMark = /^\{(\d+)$/.exec(raw);
    if (pageMark !== null) {
      page = Number(pageMark[1]);
      continue;
    }
    if (page === 0) continue;
    const record =
      /^[()[\]hvkg$x!r]\s?(\d+),(\d+):(-?[0-9.]+),(-?[0-9.]+)/.exec(raw);
    if (record === null) continue;
    const line = Number(record[2]);
    const path = tags.get(record[1]!);
    if (path === undefined || line <= 0) continue;
    points.push({ file: relative(path), line, page, y: Number(record[4]) });
  }
  return points;
}

/** The page and height a source line was typeset at, or null when it produced nothing. */
export function forwardSearch(
  points: readonly SyncPoint[],
  file: string,
  line: number,
): SyncPoint | null {
  let best: SyncPoint | null = null;
  for (const point of points) {
    if (point.file !== file) continue;
    if (point.line > line) continue;
    if (best === null || point.line > best.line) best = point;
  }
  if (best !== null) return best;
  for (const point of points) {
    if (point.file !== file) continue;
    if (best === null || point.line < best.line) best = point;
  }
  return best;
}

/** The source location a page and height came from: the nearest record on that page. */
export function inverseSearch(
  points: readonly SyncPoint[],
  page: number,
  y: number,
): SyncPoint | null {
  let best: SyncPoint | null = null;
  let distance = Number.POSITIVE_INFINITY;
  for (const point of points) {
    if (point.page !== page) continue;
    const gap = Math.abs(point.y - y);
    if (gap < distance) {
      distance = gap;
      best = point;
    }
  }
  return best;
}

/* ---------------------------------------------------------------- diff */

export type DiffRow = {
  kind: "same" | "removed" | "added";
  text: string;
  /** 1-based line in the original, 0 for an added row. */
  before: number;
  /** 1-based line in the proposal, 0 for a removed row. */
  after: number;
};

/**
 * A line diff of two texts. Lines are compared as they are, which is what a paper's source
 * wants: a reflowed paragraph is a change, and a whitespace-only change is not hidden.
 */
export function diffLines(before: string, after: string): DiffRow[] {
  const a = before.split("\n");
  const b = after.split("\n");
  const rows: DiffRow[] = [];
  const table = lcsTable(a, b);
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      rows.push({ kind: "same", text: a[i]!, before: i + 1, after: j + 1 });
      i++;
      j++;
    } else if (table[i + 1]![j]! >= table[i]![j + 1]!) {
      rows.push({ kind: "removed", text: a[i]!, before: i + 1, after: 0 });
      i++;
    } else {
      rows.push({ kind: "added", text: b[j]!, before: 0, after: j + 1 });
      j++;
    }
  }
  while (i < a.length) {
    rows.push({ kind: "removed", text: a[i]!, before: i + 1, after: 0 });
    i++;
  }
  while (j < b.length) {
    rows.push({ kind: "added", text: b[j]!, before: 0, after: j + 1 });
    j++;
  }
  return rows;
}

function lcsTable(a: readonly string[], b: readonly string[]): number[][] {
  const table: number[][] = Array.from({ length: a.length + 1 }, () =>
    new Array<number>(b.length + 1).fill(0),
  );
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      table[i]![j] =
        a[i] === b[j]
          ? table[i + 1]![j + 1]! + 1
          : Math.max(table[i + 1]![j]!, table[i]![j + 1]!);
    }
  }
  return table;
}

/* ---------------------------------------------------------------- edits */

export type Replacement = {
  /** 1-based first line replaced. */
  startLine: number;
  /** 1-based last line replaced, inclusive; 0 means the line before `startLine`. */
  endLine: number;
  /** Text taking their place; an empty string deletes them. */
  text: string;
  /** The source text the reviewer quoted, when there is one: a mismatch refuses the edit. */
  quote?: string;
};

export class EditRefused extends Error {}

/** True when the quote still sits, line for line, at the 1-based range it named. */
export function quoteHolds(
  lines: readonly string[],
  from: number,
  to: number,
  quote: string,
): boolean {
  if (quote.trim() === "") return false;
  const wanted = quote
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trimEnd());
  const actual = lines.slice(from - 1, to).map((line) => line.trimEnd());
  // A quote kept its trailing newline: one more empty line than the range holds.
  if (
    wanted.length === actual.length + 1 &&
    wanted[wanted.length - 1]!.trim() === ""
  )
    wanted.pop();
  return (
    wanted.length === actual.length &&
    wanted.every((line, i) => line === actual[i])
  );
}

/** Finds the one line range a quote occupies, or null when it is gone or ambiguous. */
export function locateQuote(
  source: string,
  quote: string,
  near?: number,
): { startLine: number; endLine: number } | null {
  const lines = source.split("\n");
  const wanted = quote.replace(/\r\n/g, "\n").trimEnd().split("\n");
  while (wanted.length > 0 && wanted[0]!.trim() === "") wanted.shift();
  if (wanted.length === 0) return null;
  const hits: number[] = [];
  for (let i = 0; i + wanted.length <= lines.length; i++) {
    let same = true;
    for (let k = 0; k < wanted.length; k++) {
      if (lines[i + k]!.trimEnd() !== wanted[k]!.trimEnd()) {
        same = false;
        break;
      }
    }
    if (same) hits.push(i + 1);
  }
  if (hits.length === 1)
    return { startLine: hits[0]!, endLine: hits[0]! + wanted.length - 1 };
  // Several lines carry the quote: only a hint that names one of them strictly closest picks it.
  if (near === undefined || hits.length === 0) return null;
  let best = 0;
  let gap = Number.POSITIVE_INFINITY;
  let tie = false;
  for (const hit of hits) {
    const d = Math.abs(hit - near);
    if (d < gap) {
      best = hit;
      gap = d;
      tie = false;
    } else if (d === gap) tie = true;
  }
  if (tie) return null;
  return { startLine: best, endLine: best + wanted.length - 1 };
}

/** The 0-based offset each line of a source starts at. */
const lineStartsOf = (source: string): number[] => {
  const starts: number[] = [];
  let at = 0;
  for (const line of source.split("\n")) {
    starts.push(at);
    at += line.length + 1;
  }
  return starts;
};

const escapeRegExp = (text: string): string =>
  text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export type QuoteSpan = {
  /** 0-based offset of the match's first character. */
  start: number;
  /** 0-based offset just past the match's last character. */
  end: number;
  /** 1-based first line the match touches. */
  line: number;
  /** 1-based last line the match touches. */
  endLine: number;
  /** True when the match covers whole lines. */
  whole: boolean;
};

/**
 * Where a proposal's quote sits in the source: whole lines first, then the quote as a plain
 * substring, then with the whitespace between its words loosened, so a quote still lands after
 * a reflow. A quote found in several places needs a hint, `near`, the line the proposer named,
 * and even then only when it singles one match strictly out.
 */
export function quoteSpan(
  source: string,
  quote: string,
  near?: number,
): QuoteSpan | null {
  const wanted = quote.replace(/\r\n/g, "\n").trim();
  if (wanted === "") return null;
  const starts = lineStartsOf(source);
  const lines = source.split("\n");
  const lineOf = (at: number): number => {
    let lo = 0;
    let hi = starts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (starts[mid]! <= at) lo = mid;
      else hi = mid - 1;
    }
    return lo;
  };
  const span = (
    found: { start: number; end: number },
    whole: boolean,
  ): QuoteSpan => ({
    start: found.start,
    end: found.end,
    line: lineOf(found.start) + 1,
    endLine: lineOf(found.end - 1) + 1,
    whole,
  });
  const pick = (found: Array<{ start: number; end: number }>) => {
    if (found.length === 0) return null;
    if (found.length === 1) return found[0]!;
    if (near === undefined) return null;
    let best: { start: number; end: number } | null = null;
    let gap = Number.POSITIVE_INFINITY;
    let tie = false;
    for (const one of found) {
      const d = Math.abs(lineOf(one.start) + 1 - near);
      if (d < gap) {
        best = one;
        gap = d;
        tie = false;
      } else if (d === gap) tie = true;
    }
    return tie || best === null ? null : best;
  };

  const located = locateQuote(source, quote, near);
  if (located !== null)
    return span(
      {
        start: starts[located.startLine - 1]!,
        end: starts[located.endLine - 1]! + lines[located.endLine - 1]!.length,
      },
      true,
    );

  const exact: Array<{ start: number; end: number }> = [];
  for (
    let at = source.indexOf(wanted);
    at !== -1;
    at = source.indexOf(wanted, at + 1)
  )
    exact.push({ start: at, end: at + wanted.length });
  const hit = pick(exact);
  if (hit !== null) return span(hit, false);

  const loose = new RegExp(
    wanted.split(/\s+/).map(escapeRegExp).join("\\s+"),
    "g",
  );
  const relaxed: Array<{ start: number; end: number }> = [];
  for (let m = loose.exec(source); m !== null; m = loose.exec(source))
    relaxed.push({ start: m.index, end: m.index + m[0].length });
  const drifted = pick(relaxed);
  return drifted === null ? null : span(drifted, false);
}

/**
 * Trims a replacement so it splices into the exact space the quote occupied: a whole-line quote
 * takes the replacement's lines minus a stray trailing newline, while a fragment keeps whatever
 * whitespace the quote left outside its match.
 */
export function fit(
  quote: string,
  replacement: string,
  whole: boolean,
): string {
  const text = replacement.replace(/\r\n/g, "\n");
  const seen = quote.replace(/\r\n/g, "\n");
  if (whole) {
    const stripped = /^(?:[ \t]*\n)+/.test(seen)
      ? text.replace(/^(?:[ \t]*\n)+/, "")
      : text;
    return stripped.replace(/\s*\n\s*$/, "");
  }
  let out = text;
  if (/^\s/.test(seen)) out = out.replace(/^\s+/, "");
  if (/\s$/.test(seen)) out = out.replace(/\s+$/, "");
  return out;
}

/**
 * Turns character spans back into the line-range replacements the page applies: spans that share
 * a line merge into one edit rewriting the line around them, an overlap is dropped rather than
 * doubled, and a group whose body comes out empty deletes the lines it quoted.
 */
export function spansToEdits(
  source: string,
  items: ReadonlyArray<{ span: QuoteSpan; text: string }>,
): { edits: Replacement[]; skipped: number } {
  const ordered = [...items].sort((x, y) => x.span.start - y.span.start);
  const lines = source.split("\n");
  const starts = lineStartsOf(source);
  const lineEnd = (line: number): number =>
    starts[line - 1]! + lines[line - 1]!.length;
  const groups: Array<{
    first: number;
    last: number;
    parts: Array<{ span: QuoteSpan; text: string }>;
  }> = [];
  let skipped = 0;
  let floor = 0;
  for (const item of ordered) {
    if (item.span.start < floor) {
      skipped++;
      continue;
    }
    floor = item.span.end;
    const tail = groups[groups.length - 1];
    if (tail !== undefined && item.span.line <= tail.last) {
      tail.last = Math.max(tail.last, item.span.endLine);
      tail.parts.push(item);
    } else {
      groups.push({
        first: item.span.line,
        last: item.span.endLine,
        parts: [item],
      });
    }
  }
  const edits: Replacement[] = [];
  for (const group of groups) {
    const from = starts[group.first - 1]!;
    const to = lineEnd(group.last);
    const quote = source.slice(from, to);
    let body = "";
    let at = from;
    for (const part of group.parts) {
      body += source.slice(at, part.span.start);
      body += part.text;
      at = part.span.end;
    }
    body += source.slice(at, to);
    edits.push({
      startLine: group.first,
      endLine: group.last,
      quote,
      text: body.trim() === "" && quote.trim() !== "" ? "" : body,
    });
  }
  return { edits, skipped };
}

/** One proposed fragment as a single line-anchored replacement, or null when it cannot land. */
export function anchorEdit(
  source: string,
  quote: string,
  replacement: string,
  near?: number,
): Replacement | null {
  const span = quoteSpan(source, quote, near);
  if (span === null) return null;
  const { edits } = spansToEdits(source, [
    { span, text: fit(quote, replacement, span.whole) },
  ]);
  return edits[0] ?? null;
}

/**
 * Applies replacements bottom-up so every line number still names the line the reviewer saw.
 * Ranges may not overlap, a quote must still sit verbatim at the range it named, an insertion
 * anchors on the lines just above its point, and a file kept as CRLF comes back as CRLF.
 */
export function applyReplacements(
  source: string,
  edits: readonly Replacement[],
): string {
  const crlf = /\r\n/.test(source) && !/(?:^|[^\r])\n/.test(source);
  const lines = (crlf ? source.replace(/\r\n/g, "\n") : source).split("\n");
  const total = lines.length;
  const prepared = edits.map((edit) => {
    if (!Number.isInteger(edit.startLine) || edit.startLine < 1)
      throw new EditRefused("invalidRange");
    const end = edit.endLine > 0 ? edit.endLine : edit.startLine - 1;
    if (end < edit.startLine - 1 || end > total)
      throw new EditRefused("invalidRange");
    return { edit, start: edit.startLine, end };
  });
  // Bottom-up, and at one line the replacement goes before the insertion that precedes it.
  prepared.sort((x, y) => y.start - x.start || y.end - x.end);
  let floor = Number.POSITIVE_INFINITY;
  for (const { edit, start, end } of prepared) {
    if (end >= floor) throw new EditRefused("invalidRange");
    if (edit.quote !== undefined && edit.quote.trim() !== "") {
      const n = edit.quote
        .replace(/\r\n/g, "\n")
        .replace(/\n$/, "")
        .split("\n").length;
      const from = end === start - 1 ? end - n + 1 : start;
      if (from < 1 || !quoteHolds(lines, from, end, edit.quote))
        throw new EditRefused("quoteMismatch");
    }
    const replacement =
      edit.text === ""
        ? []
        : edit.text
            // CRLF pairs become the file's line separator; a lone CR inside a line
            // would survive the join and poison the line endings, so it goes too.
            .replace(/\r\n/g, "\n")
            .replace(/\r/g, "\n")
            .split("\n");
    lines.splice(start - 1, end - start + 1, ...replacement);
    floor = start;
  }
  const next = lines.join("\n");
  return crlf ? next.replace(/\n/g, "\r\n") : next;
}
