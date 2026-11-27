import { node, t } from "./desk-kit.js";

const ink = "#b9cad2";
const grid = "#33464e";
const frozen = "#efb776";
const fixed = (value) => value.toFixed(2);

function logTicks(values) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const ticks = [];
  for (
    let place = Math.floor(Math.log10(min));
    place <= Math.ceil(Math.log10(max));
    place++
  ) {
    ticks.push(...[1, 2, 5].map((n) => n * 10 ** place));
  }
  const start = ticks.findLastIndex((tick) => tick <= min);
  return ticks.slice(
    start,
    Math.max(
      start + 1,
      ticks.findIndex((tick) => tick >= max),
    ) + 1,
  );
}

function drawEvolution(canvas, rows) {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (!width || !height) return;
  const scale = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const plot = canvas.getContext("2d");
  plot.setTransform(scale, 0, 0, scale, 0, 0);
  plot.font = "12px system-ui";
  plot.lineWidth = 1;
  const left = 52;
  const right = width - 51;
  const x = (i) => left + ((right - left) * i) / (rows.length - 1);
  const panel = (height - 72) / 2;

  function stroke(x1, y1, x2, y2, color) {
    plot.strokeStyle = color;
    plot.beginPath();
    plot.moveTo(x1, y1);
    plot.lineTo(x2, y2);
    plot.stroke();
  }

  for (const [key, title, color, transform, ticks, top] of [
    [
      "ATE",
      t("ATE (cm, log)", "ATE（cm，对数轴）"),
      "#65d5c0",
      Math.log10,
      logTicks(rows.map((row) => row.ATE)),
      25,
    ],
    [
      "RotErr",
      "RotErr (°)",
      "#9caafa",
      (value) => value,
      Array.from(
        {
          length:
            1 + Math.ceil(Math.max(...rows.map((row) => row.RotErr)) / 10),
        },
        (_, i) => i * 10,
      ),
      47 + panel,
    ],
  ]) {
    const low = transform(ticks[0]);
    const span = transform(ticks.at(-1)) - low;
    const y = (value) => top + panel * (1 - (transform(value) - low) / span);
    plot.textAlign = "left";
    plot.fillStyle = color;
    plot.fillText(title, 10, top - 8);
    for (const tick of ticks) {
      stroke(left, y(tick), right, y(tick), grid);
      plot.textAlign = "right";
      plot.fillStyle = ink;
      plot.fillText(String(tick), left - 8, y(tick) + 4);
    }
    for (const [i, row] of rows.entries()) {
      const previous = rows[i - 1];
      if (previous?.split === row.split) {
        stroke(x(i - 1), y(previous[key]), x(i), y(row[key]), color);
      }
      plot.beginPath();
      plot.fillStyle = row.split === "holdout" ? frozen : color;
      if (row.split === "holdout") {
        const cx = x(i);
        const cy = y(row[key]);
        plot.moveTo(cx, cy - 5);
        plot.lineTo(cx + 5, cy);
        plot.lineTo(cx, cy + 5);
        plot.lineTo(cx - 5, cy);
        plot.closePath();
        plot.fill();
      } else {
        plot.arc(x(i), y(row[key]), 3.5, 0, 2 * Math.PI);
        plot.strokeStyle = color;
        if (row.decision === "淘汰") {
          plot.fillStyle = "#101a20";
          plot.fill();
          plot.stroke();
        } else {
          plot.fill();
        }
      }
    }
  }

  plot.textAlign = "center";
  plot.fillStyle = ink;
  plot.fillText("M4", (x(0) + x(4)) / 2, height - 3);
  plot.fillText(t("Precision", "精度攻坚"), (x(5) + x(9)) / 2, height - 3);
  plot.fillStyle = frozen;
  plot.fillText(t("Holdout", "冻结验收"), x(10), height - 3);
}

function roundTable(rows) {
  const labels = [
    t("Round", "轮次"),
    t("Hypothesis", "假设"),
    "ATE (cm)",
    "RotErr (°)",
    t("ms/frame", "ms/帧"),
    t("Score", "分数"),
    t("Decision", "取舍"),
  ];
  const headings = labels.map((label) => node("th", { scope: "col" }, label));
  const entries = rows.map((row) =>
    node(
      "tr",
      {
        className:
          row.split === "holdout"
            ? "evolution-frozen"
            : row.decision === "淘汰"
              ? "evolution-rejected"
              : "",
      },
      node("th", { scope: "row" }, row.label),
      node("td", {}, row.hypothesis),
      ...[row.ATE, row.RotErr, row.latency].map((value) =>
        node("td", {}, fixed(value)),
      ),
      node(
        "td",
        {},
        row.parent_score.toFixed(3) + " → " + row.candidate_score.toFixed(3),
      ),
      node("td", {}, row.decision),
    ),
  );
  return node(
    "div",
    { className: "evolution-table" },
    node(
      "table",
      {},
      node("thead", {}, node("tr", {}, headings)),
      node("tbody", {}, entries),
    ),
  );
}

export function evolutionPanel() {
  const caption = node(
    "p",
    { className: "hint" },
    t(
      "Each round sets or expands its evaluation set first, then changes the algorithm and compares scores. Precision rounds share a fixed fold. The holdout is evaluated once after freezing.",
      "每轮先确定评测集，按需扩充或更换，再改算法、跑分择优。精度攻坚使用固定验证折，留出集在候选冻结后只验收一次。",
    ),
  );
  const body = node("div", { className: "evolution-content" });
  const panel = node(
    "details",
    { className: "camera-card camera-evolution" },
    node("summary", {}, t("Optimization history", "优化记录")),
    caption,
    body,
  );
  let loading = false;
  panel.addEventListener("toggle", async () => {
    if (!panel.open || loading) return;
    loading = true;
    body.textContent = t("Loading optimization history…", "正在读取优化记录…");
    try {
      const response = await fetch("./evolution.json");
      if (!response.ok) throw new Error("evolution_missing");
      const rows = await response.json();
      const canvas = node("canvas", { className: "evolution-plot" });
      canvas.setAttribute(
        "aria-label",
        t("ATE and rotation error by round", "各轮 ATE 和旋转误差"),
      );
      const holdout = rows.at(-1);
      body.replaceChildren(
        canvas,
        node(
          "p",
          { className: "hint" },
          `${t("Frozen holdout", "冻结验收")} · ATE ${fixed(holdout.ATE)} cm · RotErr ${fixed(holdout.RotErr)}° · ${fixed(holdout.latency)} ${t("ms/frame", "ms/帧")}`,
        ),
        roundTable(rows),
      );
      new ResizeObserver(() => drawEvolution(canvas, rows)).observe(canvas);
      drawEvolution(canvas, rows);
    } catch {
      body.textContent = t(
        "Could not load optimization history. Reopen to retry.",
        "无法读取优化记录，重新展开可重试。",
      );
      loading = false;
    }
  });
  return panel;
}
