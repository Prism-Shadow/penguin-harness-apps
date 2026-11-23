export default function makeGame({
  clear,
  rect,
  pixel,
  colors,
  showPoints,
  hint,
  end,
}) {
  const cols = 16,
    rows = 10,
    step = 20,
    turns = { L: [-1, 0], R: [1, 0], U: [0, -1], D: [0, 1] },
    stops = [
      [7, 5],
      [7, 2],
      [12, 2],
      [12, 7],
    ];
  let body, dir, turnsAhead, timer, count;
  function reset() {
    body = [
      [4, 5],
      [3, 5],
      [2, 5],
    ];
    dir = turns.R;
    turnsAhead = [];
    timer = 0;
    count = 0;
    hint("Four deliveries to make", "送达四件包裹");
  }
  function tick(dt) {
    timer += dt;
    if (timer < 0.24) return;
    timer -= 0.24;
    dir = turnsAhead.shift() || dir;
    const head = [body[0][0] + dir[0], body[0][1] + dir[1]],
      stop = stops[count];
    if (!stop) return;
    const eat = head[0] === stop[0] && head[1] === stop[1],
      obstacle = eat ? body : body.slice(0, -1);
    if (
      head[0] < 0 ||
      head[0] >= cols ||
      head[1] < 0 ||
      head[1] >= rows ||
      obstacle.some((p) => p[0] === head[0] && p[1] === head[1])
    ) {
      end(false, "The boat hit an obstacle", "船队撞上了障碍");
      return;
    }
    body.unshift(head);
    if (eat) {
      count++;
      showPoints(count * 100);
      if (count === stops.length)
        end(true, "All parcels delivered", "全部包裹已送达");
    } else body.pop();
  }
  function draw() {
    clear();
    for (let x = 0; x < cols; x++)
      for (let y = 0; y < rows; y++)
        if ((x + y) % 3 === 1)
          rect(x * step + 5, y * step + 9, 6, 1, "#344f53");
    body.forEach(([x, y], i) => {
      rect(x * step + 2, y * step + 3, 16, 14, i ? colors.mint : colors.gold);
      const px = x * step,
        py = y * step;
      if (i > 0) {
        rect(px + 5, py + 6, 10, 7, "#6c8e75");
        rect(px + 9, py + 5, 2, 9, colors.gold);
        return;
      }
      // The bow and pilot face the first queued turn as soon as it is pressed.
      const [dx, dy] = turnsAhead[0] || dir;
      rect(px + 8 + dx * 7, py + 8 + dy * 7, 5, 5, colors.rose);
      rect(px + 5, py + 6, 8, 7, colors.dark);
      rect(px + 7, py + 6, 4, 4, colors.ink);
      rect(px + 8 - dx * 8, py + 9 - dy * 8, 3, 2, colors.blue);
    });
    const p = stops[count];
    if (p)
      pixel(
        p[0] * step + 4,
        p[1] * step + 3,
        ["RRRRRR", "R.BB.R", "RRBBRR", "RRRRRR", "RRRRRR"],
        { R: colors.rose, B: colors.gold, ".": colors.dark },
        2,
      );
  }
  function press(k) {
    const d = turns[k];
    const last = turnsAhead.at(-1) || dir;
    if (!d || turnsAhead.length >= 2 || (last[0] !== 0) === (d[0] !== 0))
      return;
    turnsAhead.push(d);
  }
  return { reset, tick, draw, press };
}
