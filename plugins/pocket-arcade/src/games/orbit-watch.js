export default function makeGame({
  clear,
  rect,
  pixel,
  colors,
  held,
  hint,
  end,
  showPoints,
}) {
  const art = [" M   M ", "  MMM  ", " MIMIM ", "MMMMMMM", " M   M "];
  let alive, x, dir, origin, level, shot, ship;
  function reset() {
    alive = Array(10).fill(true);
    origin = 38;
    level = 28;
    dir = 1;
    ship = 160;
    shot = null;
    hint("Ten drones approaching", "十架无人机正在接近");
  }
  function move(p) {
    ship = Math.min(309, Math.max(11, p));
  }
  function fire() {
    if (!shot) shot = { x: ship, y: 168 };
  }
  function tick(dt) {
    move(ship + ((held.has("R") ? 1 : 0) - (held.has("L") ? 1 : 0)) * 180 * dt);
    if (held.has("A")) fire();
    origin += dir * dt * 45;
    if (origin >= 146 || origin <= 10) {
      origin = Math.max(10, Math.min(146, origin));
      dir = -dir;
      level += 14;
    }
    if (shot) {
      shot.y -= dt * 219;
      for (let i = 0; i < alive.length; i++) {
        const xx = origin + (i % 5) * 39,
          yy = level + Math.floor(i / 5) * 19;
        if (
          alive[i] &&
          Math.abs(shot.x - xx) <= 9 &&
          Math.abs(shot.y - yy) <= 7
        ) {
          alive[i] = false;
          shot = null;
          showPoints(alive.filter((v) => !v).length * 90);
          if (!alive.some(Boolean)) end(true, "Orbit is clear", "轨道已净空");
          break;
        }
      }
      if (shot && shot.y < 0) shot = null;
    }
    if (alive.some((v, i) => v && level + Math.floor(i / 5) * 19 >= 165))
      end(false, "The fleet reached the relay", "机群抵达中继站");
  }
  function draw() {
    clear();
    for (let i = 0; i < 35; i++)
      rect((i * 47) % 317, (i * i * 7) % 177, 1, 2, colors.muted);
    alive.forEach((v, i) => {
      if (v)
        pixel(
          origin + (i % 5) * 39 - 7,
          level + Math.floor(i / 5) * 19 - 5,
          art,
          { M: i < 5 ? colors.gold : colors.rose, I: colors.dark },
          2,
        );
    });
    rect(0, 184, 320, 2, colors.muted);
    pixel(
      ship - 8,
      168,
      ["   M   ", "   M   ", "  MMM  ", " BBMBB ", "MMMMMMM"],
      { M: colors.mint, B: colors.blue },
      2,
    );
    if (shot) rect(shot.x - 1, shot.y - 3, 3, 7, colors.gold);
  }
  return {
    reset,
    draw,
    tick,
    press(k) {
      if (k === "A") fire();
      else if (k === "L" || k === "R") move(ship + (k === "L" ? -9 : 9));
    },
    tap(px) {
      move(px);
      fire();
    },
    drag: move,
  };
}
