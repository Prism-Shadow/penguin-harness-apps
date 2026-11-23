export default function makeGame({
  clear,
  rect,
  pixel,
  colors,
  hint,
  end,
  showPoints,
  tone,
}) {
  const ledges = [
    [0, 198],
    [230, 370],
    [406, 554],
    [584, 700],
    [738, 895],
    [929, 1090],
    [1126, 1320],
  ];
  const ground = 147,
    speed = 73,
    finish = 1250,
    rider = 65;
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const stamps = ledges.slice(1).map(([start]) => start - 12);
  let distance, y, vy, grounded, grace, queued, landing, collected;
  function reset() {
    distance = 0;
    y = ground;
    vy = 0;
    grounded = true;
    grace = 0;
    queued = 0;
    landing = 0;
    collected = new Set();
    hint("Carry the postbag to the striped beacon", "把邮包送到条纹信标");
  }
  function takeOff() {
    grounded = false;
    grace = 0;
    queued = 0;
    landing = 0;
    // The first painted pose already leaves the roof, even between simulation frames.
    y = Math.min(y, ground) - 2;
    vy = -154;
    tone(1, 0.085);
  }
  function jump() {
    if (grounded || grace > 0) takeOff();
    else queued = 0.115;
  }
  function tick(dt) {
    const previous = y,
      wasGrounded = grounded;
    distance += speed * dt;
    vy += 335 * dt;
    y += vy * dt;
    grace = Math.max(0, grace - dt);
    queued = Math.max(0, queued - dt);
    landing = Math.max(0, landing - dt);
    const x = rider + distance;
    const roof = ledges.some(([a, b]) => x >= a && x <= b);
    grounded = roof && previous <= ground && y >= ground;
    if (grounded) {
      y = ground;
      vy = 0;
      if (!wasGrounded) {
        landing = 0.17;
        tone(0, 0.065);
      }
      if (queued > 0) takeOff();
    } else if (wasGrounded && !roof) grace = 0.085;
    for (const stamp of stamps) {
      if (
        collected.has(stamp) ||
        Math.abs(x - stamp) > 10 ||
        Math.abs(y - 16 - (ground - 35)) > 14
      )
        continue;
      collected.add(stamp);
      tone(2, 0.13);
      hint(
        "Postmarks: " + collected.size + " / " + stamps.length,
        "邮戳：" + collected.size + " / " + stamps.length,
      );
    }
    showPoints(
      Math.min(finish, Math.floor(distance)) + collected.size * 80,
      false,
    );
    if (y > 207) end(false, "Missed the roof", "错过了屋顶");
    else if (x >= finish)
      end(
        true,
        "Mail delivered · " + collected.size + " postmarks",
        "邮包送达 · " + collected.size + " 枚邮戳",
      );
  }
  const penguin = [
    "    KKKK   ",
    "   KKWWKK  ",
    "   KWKWKOO ",
    "   KWWWK   ",
    "  KKWWWKK  ",
    " RKKWWWKK  ",
    " RRKWWKK   ",
    "  RKKKK    ",
  ];
  const ink = { K: "#1e2d40", W: "#fff6dd", O: "#ffad62", R: "#db654f" };
  function draw() {
    clear();
    rect(0, 0, 320, 96, "#34475e");
    rect(0, 76, 320, 73, "#60707c");
    rect(229, 19, 18, 18, "#f4cf9b");
    rect(225, 24, 25, 9, "#f4cf9b");
    for (let i = 0; i < 10; i++) {
      const x =
        i * 41 - (reducedMotion ? 0 : Math.floor(distance * 0.28) % 41) - 10;
      const h = 22 + ((i * 7) % 4) * 9;
      rect(x, 122 - h, 32, h + 25, "#405665");
      rect(x + 20, 114 - h, 2, 8, "#405665");
      for (let j = 0; j < 3; j++) rect(x + 4 + j * 8, 128 - h, 3, 4, "#93a39d");
    }
    for (const [a, b] of ledges) {
      const x = a - distance,
        w = b - a;
      if (x > 320 || x + w < 0) continue;
      rect(x, ground, w, 55, "#3a4551");
      rect(x, ground, w, 4, "#e78f70");
      rect(x, ground + 4, w, 3, "#aa7166");
      for (let wx = a + 10; wx < b - 6; wx += 23) {
        rect(wx - distance, 165, 8, 12, "#293a4e");
        rect(wx - distance + 1, 166, 5, 8, "#baaa86");
      }
      rect(x + w - 12, ground - 4, 8, 4, colors.gold);
    }
    for (const stamp of stamps) {
      const x = stamp - distance;
      if (x < 0 || x > 320 || collected.has(stamp)) continue;
      pixel(
        x - 5,
        ground - 40,
        [" YYYY ", "YYOOYY", "YO..OY", "YO..OY", "YYOOYY", " YYYY "],
        { Y: colors.gold, O: "#ad7154", ".": "#f3e4b8" },
        2,
      );
    }
    const post = finish - distance;
    rect(post, ground - 39, 3, 39, colors.ink);
    for (let i = 0; i < 4; i++)
      rect(post, ground - 39 + i * 3, 17, 3, i % 2 ? colors.rose : colors.gold);
    const bob =
      grounded && !reducedMotion && landing === 0
        ? Math.floor(distance / 6) % 2
        : 0;
    const py = Math.round(y) - 20 + bob + (landing > 0 ? 2 : 0);
    pixel(rider - 10, py, penguin, ink, 2);
    if (grounded) {
      const stride = Math.floor(distance / 6) % 2 === 0 ? 3 : -3;
      rect(rider - 4 + stride, Math.round(y) - 3, 6, 3, ink.O);
      rect(rider + 4 - stride, Math.round(y) - 2, 6, 2, ink.O);
      if (landing > 0 && !reducedMotion) {
        rect(rider - 14, ground - 3, 3, 2, colors.ink);
        rect(rider + 13, ground - 4, 2, 2, colors.ink);
      }
    } else {
      rect(rider - 12, py + 9, 8, 3, ink.K);
      rect(rider + 8, py + 7, 6, 3, ink.K);
      rect(rider - 5, py + 16, 6, 2, ink.O);
      rect(rider + 3, py + 16, 6, 2, ink.O);
    }
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
