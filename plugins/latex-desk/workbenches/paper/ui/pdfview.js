/* Draws the built PDF into the page itself. A host frames a workbench in a sandbox without the
 * permission the browser's built-in PDF viewer needs, so an `<iframe>` or an `<object>` pointed at
 * the PDF shows a blocked page instead of the paper. pdf.js draws to canvases, which the sandbox
 * does allow. If a worker cannot start, pdf.js falls back to drawing on this thread. */

import { GlobalWorkerOptions, getDocument } from "./vendor/pdf.min.mjs";

GlobalWorkerOptions.workerSrc = new URL(
  "./vendor/pdf.worker.min.mjs",
  import.meta.url,
).href;

/** The build on screen, so a poll does not redraw what is already there. */
let open = "";
/** The loading task in flight, cancelled when another build replaces it. */
let loading = null;
/** The sheet of each page, so a SyncTeX hit can scroll to one. */
let sheets = [];
/** The page asked for before its sheet existed. */
let wanted = 1;

/**
 * Draws every page of `url` inside `container`, unless that build is already on screen.
 * `page` is the page to bring into view once the sheets exist.
 */
export async function draw(container, url, page) {
  if (open === url) {
    goTo(container, page ?? wanted);
    return;
  }
  open = url;
  wanted = page ?? 1;
  sheets = [];
  container.replaceChildren();
  if (loading !== null) {
    // The loser of a race may only reset what it owns: clearing `open` here would erase the
    // state of the draw that just replaced this one and leave the pane blank.
    const stale = loading;
    loading = null;
    void stale.destroy().catch(() => undefined);
  }
  let pdf;
  try {
    const task = getDocument({ url, isEvalSupported: false });
    loading = task;
    pdf = await task.promise;
    if (open !== url) {
      void task.destroy().catch(() => undefined);
      return;
    }
  } catch (error) {
    // A newer build destroyed this task on purpose; that is not a failure to report.
    if (open !== url) return;
    open = "";
    throw new Error(String(error));
  }
  // Room for the sheets, minus the padding the stylesheet puts around them.
  const wide = Math.max(200, container.clientWidth - 24);
  const ratio = Math.min(globalThis.devicePixelRatio || 1, 2);
  try {
    await sheetsOf(pdf, container, url, wide, ratio);
  } catch (error) {
    // Cancelled mid-render because a newer build took the pane: only the current build reports.
    if (open !== url) return;
    open = "";
    throw error;
  }
  if (open === url) goTo(container, wanted);
}

async function sheetsOf(pdf, container, url, wide, ratio) {
  for (let number = 1; number <= pdf.numPages; number += 1) {
    if (open !== url) {
      void pdf.destroy().catch(() => undefined);
      return;
    }
    const view = await pdf.getPage(number);
    if (open !== url) {
      void pdf.destroy().catch(() => undefined);
      return;
    }
    const base = view.getViewport({ scale: 1 });
    const viewport = view.getViewport({ scale: (wide * ratio) / base.width });
    const canvas = document.createElement("canvas");
    canvas.className = "pdf-page";
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    canvas.style.width = `${Math.floor(viewport.width / ratio)}px`;
    canvas.style.height = `${Math.floor(viewport.height / ratio)}px`;
    const sheet = document.createElement("div");
    sheet.className = "pdf-sheet";
    sheet.append(canvas);
    container.append(sheet);
    sheets.push(sheet);
    await view.render({ canvas, viewport }).promise;
  }
}

/** Scrolls to a page, marking it briefly so the reader sees where the caret landed.
 * `y` is the vertical share (0 to 1) inside the page to bring to the pane's top. */
export function goTo(container, page, y) {
  wanted = page;
  const sheet = sheets[page - 1];
  if (sheet === undefined) return false;
  const pane = container.parentElement ?? container;
  if (typeof y === "number" && Number.isFinite(y)) {
    const share = Math.max(0, Math.min(1, y));
    const top =
      sheet.offsetTop + share * sheet.clientHeight - pane.clientHeight / 3;
    pane.scrollTo({ top, behavior: "smooth" });
  } else sheet.scrollIntoView({ block: "start", behavior: "smooth" });
  sheet.classList.add("pdf-hit");
  globalThis.setTimeout(() => sheet.classList.remove("pdf-hit"), 1200);
  return true;
}

/** The 1-based page a sheet element belongs to, or 0 when it is not one. */
export function sheetAt(sheet) {
  const at = sheets.indexOf(sheet);
  return at === -1 ? 0 : at + 1;
}
