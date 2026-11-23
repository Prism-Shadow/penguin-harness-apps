export default function makeGame({
  renderGrid,
  showPoints,
  hint,
  end,
  cursor,
  shuffle,
}) {
  const n = 5,
    total = 25;
  let mines, open, flags, selected, mark, exploded;
  function around(i) {
    const out = [];
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        const x = (i % n) + dx,
          y = Math.floor(i / n) + dy;
        if ((dx || dy) && x >= 0 && x < n && y >= 0 && y < n)
          out.push(y * n + x);
      }
    return out;
  }
  function reset() {
    mines = null;
    open = new Set();
    flags = new Set();
    selected = 0;
    mark = false;
    exploded = null;
    hint("Find 21 safe squares", "找出 21 个安全格");
  }
  function cell(i) {
    selected = i;
    if (open.has(i)) return;
    if (mark) {
      if (flags.has(i)) flags.delete(i);
      else if (flags.size < 4) flags.add(i);
      draw();
      return;
    }
    if (flags.has(i)) return;
    if (!mines)
      mines = new Set(
        shuffle(
          Array.from({ length: total }, (_, j) => j).filter(
            (j) => j !== i && !around(i).includes(j),
          ),
        ).slice(0, 4),
      );
    if (mines.has(i)) {
      exploded = i;
      draw();
      end(false, "A mine interrupted the signal", "信号被地雷中断");
      return;
    }
    const todo = [i];
    while (todo.length) {
      const x = todo.pop();
      if (open.has(x) || flags.has(x) || mines.has(x)) continue;
      open.add(x);
      if (!around(x).some((j) => mines.has(j))) todo.push(...around(x));
    }
    showPoints(open.size * 10);
    if (open.size === total - 4)
      end(true, "All safe signals found", "全部安全信号已找到");
    draw();
  }
  function press(k) {
    if (k === "F") {
      mark = !mark;
      hint(
        mark ? "Flag mode: choose a square" : "Reveal mode",
        mark ? "标记模式：选择一个格子" : "探查模式",
      );
    } else if (k === "A") cell(selected);
    else selected = cursor(selected, k, n, n);
  }
  function draw() {
    renderGrid(
      n,
      n,
      Array.from({ length: total }, (_, i) =>
        i === exploded
          ? { v: "✹", t: "red" }
          : open.has(i)
            ? {
                v: String(around(i).filter((j) => mines.has(j)).length || "·"),
                t: "bright",
              }
            : flags.has(i)
              ? { v: "⚑", t: "warm" }
              : { v: "?", t: "dim" },
      ),
      selected,
    );
  }
  return { reset, press, cell, draw };
}
