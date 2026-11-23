export default function makeGame({
  clear,
  rect,
  pixel,
  colors,
  hint,
  end,
  showPoints,
}) {
  const ledges = [
      [0, 198],
      [230, 370],
      [406, 554],
      [584, 700],
      [738, 895],
      [929, 1090],
      [1126, 1320],
    ],
    ground = 145,
    speed = 70,
    finish = 1250;
  let distance, y, vy, grounded;
  function reset() {
    distance = 0;
    y = ground;
    vy = 0;
    grounded = true;
    hint("Finish at the striped post", "抵达条纹终点牌");
  }
  function jump() {
    if (!grounded) return;
    grounded = false;
    vy = -162;
  }
  function tick(dt) {
    const previous = y;
    distance += speed * dt;
    vy += 330 * dt;
    y += vy * dt;
    const worldX = 65 + distance,
      onRoof = ledges.some(([a, b]) => worldX >= a && worldX <= b);
    grounded = false;
    if (onRoof && previous <= ground && y >= ground) {
      grounded = true;
      vy = 0;
      y = ground;
    }
    showPoints(Math.min(finish, Math.floor(worldX - 65)));
    if (y > 202) end(false, "The runner missed the roof", "跑手掉下屋顶");
    else if (worldX >= finish) end(true, "Relay delivered", "接力送达");
  }
  function draw() {
    clear();
    for (let i = 0; i < 8; i++) {
      const x = i * 56 - (Math.floor(distance * 0.32) % 56) - 10,
        h = 20 + (i % 3) * 11;
      rect(x, 115 - h, 39, h + 20, "#33494f");
      rect(x + 5, 121 - h, 3, 3, colors.muted);
    }
    for (const [a, b] of ledges) {
      const x = a - distance,
        w = b - a;
      rect(x, ground, w, 55, "#4e6261");
      rect(x, ground, w, 5, colors.rose);
      for (let win = a + 10; win < b - 4; win += 21)
        rect(win - distance, 163, 6, 11, colors.muted);
    }
    const post = finish - distance;
    rect(post, ground - 36, 4, 36, colors.ink);
    for (let i = 0; i < 4; i++)
      rect(post, ground - 36 + i * 4, 16, 3, i % 2 ? colors.rose : colors.gold);
    pixel(
      58,
      y - 16,
      [
        "  MMM ",
        "  M.I ",
        " MMMM ",
        "B MMM ",
        "  BBB ",
        "  B B ",
        " BB BB",
        " M   M",
      ],
      { M: colors.gold, B: colors.rose, I: colors.dark, ".": colors.ink },
      2,
    );
  }
  return {
    reset,
    draw,
    tick,
    press(k) {
      if (k === "A") jump();
    },
    tap: jump,
  };
}
