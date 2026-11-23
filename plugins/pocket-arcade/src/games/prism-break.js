export default function makeGame({
  clear,
  rect,
  text,
  colors,
  held,
  hint,
  end,
  showPoints,
}) {
  const top = 32,
    tileW = 45,
    tileH = 13,
    paddleWidth = 56;
  let x, y, vx, vy, paddle, bricks, lives, delay;
  function serve() {
    x = 160;
    y = 124;
    vx = lives % 2 ? 59 : -55;
    vy = -94;
    delay = 0.65;
  }
  function reset() {
    bricks = Array(14).fill(true);
    paddle = 160;
    lives = 3;
    serve();
    hint("Three balls in play", "可用三颗球");
  }
  function move(px) {
    paddle = Math.min(320 - paddleWidth / 2, Math.max(paddleWidth / 2, px));
  }
  function tick(dt) {
    move(
      paddle + ((held.has("R") ? 1 : 0) - (held.has("L") ? 1 : 0)) * 215 * dt,
    );
    if (delay > 0) {
      delay -= dt;
      return;
    }
    const oldY = y;
    x += vx * dt;
    y += vy * dt;
    if (x < 3 || x > 317) {
      vx = -vx;
      x = Math.max(3, Math.min(317, x));
    }
    if (y < 3) {
      vy = Math.abs(vy);
      y = 3;
    }
    for (let i = 0; i < bricks.length; i++) {
      const bx = 4 + (i % 7) * tileW,
        by = top + Math.floor(i / 7) * tileH;
      if (
        !bricks[i] ||
        x + 3 < bx ||
        x - 3 > bx + tileW - 3 ||
        y + 3 < by ||
        y - 3 > by + tileH - 3
      )
        continue;
      bricks[i] = false;
      if (oldY + 3 <= by || oldY - 3 >= by + tileH - 3) vy = -vy;
      else vx = -vx;
      showPoints(bricks.filter((b) => !b).length * 50);
      if (!bricks.some(Boolean))
        end(true, "All prisms cleared", "全部棱镜已击碎");
      break;
    }
    if (
      vy > 0 &&
      oldY <= 171 &&
      y >= 171 &&
      Math.abs(x - paddle) <= paddleWidth / 2 + 3
    ) {
      const angle = ((x - paddle) / (paddleWidth / 2)) * 0.9;
      vx = Math.sin(angle) * 123;
      vy = -Math.cos(angle) * 123;
      y = 170;
    }
    if (y > 205) {
      lives--;
      if (!lives) {
        end(false, "The final ball fell", "最后一颗球落空");
        return;
      }
      serve();
      hint("Balls left: " + lives, "剩余弹球：" + lives);
    }
  }
  function draw() {
    clear();
    for (let i = 0; i < 14; i++) {
      if (!bricks[i]) continue;
      const bx = 4 + (i % 7) * tileW,
        by = top + Math.floor(i / 7) * tileH;
      rect(
        bx,
        by,
        tileW - 3,
        tileH - 3,
        [colors.rose, colors.gold, colors.mint, colors.blue][i % 4],
      );
      rect(bx + 2, by + 1, tileW - 9, 1, colors.ink);
    }
    rect(paddle - paddleWidth / 2, 175, paddleWidth, 6, colors.mint);
    rect(paddle - paddleWidth / 2 + 4, 175, paddleWidth - 8, 2, colors.ink);
    rect(x - 3, y - 3, 6, 6, colors.gold);
    text("● ".repeat(lives), 6, 15, colors.rose, 10);
  }
  return {
    reset,
    tick,
    draw,
    press(k) {
      if (k === "L" || k === "R") move(paddle + (k === "R" ? 9 : -9));
    },
    tap: move,
    drag: move,
  };
}
