export default function makeGame({
  renderGrid,
  showPoints,
  hint,
  end,
  cursor,
}) {
  const map = [
      "#######",
      "#.....#",
      "#..G..#",
      "#.....#",
      "#...G.#",
      "#######",
    ],
    cols = 7,
    rows = 6;
  let player, boxes, moves;
  const isWall = (i) =>
    !map[Math.floor(i / cols)] || map[Math.floor(i / cols)][i % cols] === "#";
  const target = (i) => map[Math.floor(i / cols)][i % cols] === "G";
  function reset() {
    player = 29;
    boxes = [24, 25];
    moves = 0;
    hint("Push both cases onto the rings", "把两个货箱推到圆圈上");
  }
  function press(k) {
    const d = { U: -cols, D: cols, L: -1, R: 1 }[k];
    if (!d) return;
    const next = player + d;
    if (isWall(next)) return;
    const j = boxes.indexOf(next);
    if (j >= 0) {
      const dest = next + d;
      if (isWall(dest) || boxes.includes(dest)) return;
      boxes[j] = dest;
    }
    player = next;
    moves++;
    showPoints(boxes.filter(target).length * 100);
    hint("Moves: " + moves + " / 36", "步数：" + moves + " / 36");
    if (boxes.every(target)) end(true, "Both docks loaded", "两个泊位均已装载");
    else if (
      moves >= 36 ||
      boxes.some(
        (i) =>
          !target(i) &&
          (isWall(i - 1) || isWall(i + 1)) &&
          (isWall(i - cols) || isWall(i + cols)),
      )
    )
      end(false, "The cargo cannot reach the dock", "货箱无法抵达泊位");
  }
  function cell(i) {
    for (const k of ["L", "R", "U", "D"])
      if (cursor(player, k, cols, rows) === i) {
        press(k);
        draw();
        return;
      }
  }
  function draw() {
    renderGrid(
      cols,
      rows,
      Array.from({ length: cols * rows }, (_, i) =>
        i === player
          ? { v: "♟", t: "warm" }
          : boxes.includes(i)
            ? { v: target(i) ? "▣" : "▤", t: "bright" }
            : isWall(i)
              ? { v: "▓", t: "dim" }
              : target(i)
                ? { v: "◎", t: "warm" }
                : "",
      ),
    );
  }
  return { reset, press, draw, cell };
}
