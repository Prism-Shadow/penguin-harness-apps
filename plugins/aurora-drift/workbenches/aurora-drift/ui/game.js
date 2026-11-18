import {
  mount,
  W,
  clamp,
  polygon,
  ellipse,
  line,
  backdrop,
  random,
} from "./host.js";
import { sound } from "./chime.js";

const words = {
  intro: [
    "Three laps under the northern lights. Slide through turns, then release Drift for a burst of speed.",
    "在极光下跑完三圈。入弯时按住漂移，蓄满后松手加速。",
  ],
  controls: [
    "A/D or ←/→ to steer. Hold Shift through a turn and release for boost. Pass between the illuminated gates.",
    "A/D 或左右方向键转向。过弯时按住 Shift 蓄力，松开触发加速。穿过发光门得分。",
  ],
  drift: ["Drift", "漂移"],
  lap: ["Lap", "圈数"],
  finish: ["Across the finish line!", "冲过终点！"],
};
const stars = Array.from({ length: 90 }, (_, i) => [
  (i * 283) % 960,
  ((i * 47) % 220) / 340,
  1 + (i % 3) * 0.45,
]);
const gates = Array.from({ length: 19 }, (_, i) => ({
  at: 75 + i * 95,
  lane: [-0.5, 0.15, 0.5, -0.15][i % 4],
}));
const curve = (z) => Math.sin(z / 58) * 0.6 + Math.sin(z / 123 + 0.9) * 0.46;
const roadCenter = (s, z) =>
  480 + curve(s.distance + z * 115) * 155 * z - s.lane * 165 * (1 - z);
function road(s, u) {
  const h = s.height;
  return {
    x: roadCenter(s, 1 - u),
    y: h * 0.365 + h * 0.65 * (u * u),
    half: 24 + u * 540,
  };
}
function skyline(ctx, s) {
  const h = s.height;
  backdrop(ctx, h, ["#101731", "#293258", "#6b477d", "#ad6481"]);
  for (const [x, y, r] of stars) ellipse(ctx, x, y * h, r, r, "#d7e4ef");
  const t = s.time * 0.1;
  for (let b = 0; b < 4; b++) {
    const points = [];
    for (let x = -30; x <= 1010; x += 16) {
      const y =
        h *
        (0.1 +
          b * 0.026 +
          0.04 * Math.sin(x / 134 + t + b) +
          0.025 * Math.sin(x / 64 + b));
      points.push([x, y]);
    }
    polygon(ctx, ["#28b8ab55", "#54ddac65", "#a1ebae55", "#80a9dd50"][b], [
      ...points,
      ...points
        .slice()
        .reverse()
        .map(([x, y]) => [x, y + h * (0.065 + 0.035 * Math.sin(x / 103 + b))]),
    ]);
  }
  ellipse(ctx, 730, h * 0.12, 27, 27, "#edf4ce");
  ellipse(ctx, 740, h * 0.105, 28, 28, "#31435c");
  for (let layer = 0; layer < 3; layer++) {
    const peaks = [],
      base = h * (0.37 + layer * 0.018);
    for (let x = -40, i = 0; x < W + 70; x += 33, i++) {
      const y =
        base -
        h *
          (0.035 +
            (1 + Math.sin(i * 1.19 + layer * 3)) *
              Math.abs(Math.sin(i * 0.41 + 1)) *
              (0.08 - layer * 0.014));
      peaks.push([x, y]);
    }
    polygon(ctx, ["#536083", "#394962", "#28394f"][layer], [
      [0, h],
      ...peaks,
      [W + 64, h],
    ]);
  }
}
function post(ctx, x, y, size, lit) {
  const ink = lit ? "#8ff7e5" : "#d7b5ff";
  line(ctx, "#263851", size * 1.4, x, y, x, y - size * 8);
  line(ctx, ink, size * 0.6, x, y - size * 4, x, y - size * 8);
  ellipse(ctx, x, y - size * 8, size * 1.3, size * 0.9, ink);
}
function gate(ctx, s, g) {
  const dist = g.at - s.distance;
  if (dist <= 0 || dist > 210) return;
  const u = 1 - Math.sqrt(dist / 210),
    r = road(s, u),
    x = r.x + g.lane * r.half * 0.82,
    span = r.half * 0.29,
    high = 4 + u * 81;
  line(ctx, "#213647", 2 + u * 8, x - span, r.y, x - span, r.y - high);
  line(ctx, "#213647", 2 + u * 8, x + span, r.y, x + span, r.y - high);
  line(ctx, "#8cfde8", 1 + u * 4, x - span, r.y - high, x + span, r.y - high);
  line(
    ctx,
    "#da7dff",
    1 + u * 4,
    x - span,
    r.y - high,
    x - span,
    r.y - high * 0.4,
  );
  line(
    ctx,
    "#da7dff",
    1 + u * 4,
    x + span,
    r.y - high,
    x + span,
    r.y - high * 0.4,
  );
}
function circuit(ctx, s) {
  const h = s.height;
  ctx.fillStyle = "#273348";
  ctx.fillRect(0, h * 0.395, W, h);
  for (let n = 0; n < 46; n++) {
    const a = road(s, n / 45),
      b = road(s, (n + 1) / 45),
      stripe = Math.floor(n / 3 + s.distance * 0.08) % 2 === 0;
    polygon(ctx, stripe ? "#383c53" : "#35394e", [
      [a.x - a.half, a.y],
      [a.x + a.half, a.y],
      [b.x + b.half, b.y],
      [b.x - b.half, b.y],
    ]);
    for (const side of [-1, 1]) {
      polygon(ctx, stripe ? "#ca7a9d" : "#91dbd7", [
        [a.x + side * a.half, a.y],
        [a.x + side * a.half * 0.95, a.y],
        [b.x + side * b.half * 0.95, b.y],
        [b.x + side * b.half, b.y],
      ]);
      if (stripe) {
        const lane = 0.34;
        polygon(ctx, "#8f91a4", [
          [a.x + side * a.half * lane, a.y],
          [a.x + side * a.half * (lane + 0.013), a.y],
          [b.x + side * b.half * (lane + 0.013), b.y],
          [b.x + side * b.half * lane, b.y],
        ]);
      }
    }
  }
  for (let n = 0; n < 11; n++) {
    const u = ((n + s.distance * 0.023) % 11) / 11,
      r = road(s, u);
    for (const side of [-1, 1])
      post(ctx, r.x + side * (r.half + 9 + u * 32), r.y, 1.2 + u * 4, n % 2);
  }
  [...gates].reverse().forEach((g) => gate(ctx, s, g));
}
function car(ctx, s) {
  const h = s.height,
    x = W / 2 + s.lane * 155,
    y = h * 0.83;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(s.steer * 0.055);
  const g = ctx.createRadialGradient(0, 12, 4, 0, 12, 98);
  g.addColorStop(0, s.boost > 0 ? "#55ecdc88" : "#ea4a9370");
  g.addColorStop(1, "#6b93bb00");
  ellipse(ctx, 0, 15, 101, 35, g);
  for (const side of [-1, 1]) {
    ctx.fillStyle = "#171a22";
    ctx.fillRect(side < 0 ? -69 : 50, 0, 20, 31);
  }
  polygon(ctx, "#a82550", [
    [-70, 12],
    [-64, -12],
    [-38, -33],
    [36, -33],
    [62, -15],
    [70, 12],
    [51, 31],
    [-51, 31],
  ]);
  polygon(ctx, "#f67876", [
    [-64, -12],
    [-38, -33],
    [-24, -53],
    [23, -52],
    [39, -32],
    [62, -15],
    [36, -5],
    [-37, -5],
  ]);
  polygon(ctx, "#243c53", [
    [-36, -31],
    [-22, -47],
    [19, -47],
    [34, -31],
  ]);
  line(ctx, "#8edbd6", 2, -30, -34, 19, -43);
  polygon(ctx, "#ef5670", [
    [-53, -12],
    [-33, -23],
    [35, -23],
    [54, -12],
    [35, -5],
    [-30, -5],
  ]);
  polygon(ctx, "#273448", [
    [-64, 0],
    [61, 0],
    [53, 12],
    [-55, 12],
  ]);
  for (const side of [-1, 1]) {
    line(ctx, "#ffb6ab", 6, side * 53, 3, side * 28, 4);
    line(ctx, "#303345", 4, side * 40, -11, side * 43, -27);
  }
  polygon(ctx, "#463d61", [
    [-67, -27],
    [-55, -32],
    [56, -32],
    [68, -27],
    [57, -21],
    [-58, -21],
  ]);
  if (s.boost > 0)
    for (const side of [-1, 1])
      polygon(ctx, "#8af8e8", [
        [side * 38, 21],
        [side * 31, 20],
        [side * 26, 42 + 7 * Math.sin(s.time * 37)],
      ]);
  ctx.restore();
  const barWidth = 110;
  ctx.fillStyle = "#101a27";
  ctx.fillRect(x - barWidth / 2, y + 40, barWidth, 5);
  ctx.fillStyle = s.charge > 0.35 ? "#7ff4dd" : "#ffb887";
  ctx.fillRect(x - barWidth / 2, y + 40, barWidth * s.charge, 5);
}
function reset(s) {
  Object.assign(s, {
    distance: 0,
    lane: 0,
    steer: 0,
    charge: 0,
    drifting: false,
    boost: 0,
    bonus: 0,
    passed: 0,
    flash: 0,
    trail: [],
    rand: random(82),
  });
}
function update(s, dt) {
  const direction = Number(s.keys.has("right")) - Number(s.keys.has("left")),
    drift = s.keys.has("drift");
  s.steer += (direction - s.steer) * Math.min(1, dt * 8);
  if (drift && Math.abs(s.steer) > 0.2) {
    s.charge = clamp(s.charge + dt * 0.56, 0, 1);
    s.trail.push({ x: 480 + s.lane * 155 + (s.rand() - 0.5) * 42, age: 0 });
  }
  if (s.drifting && !drift) {
    if (s.charge >= 0.35) {
      s.boost = 1 + s.charge * 1.8;
      s.sounds.play("boost");
    }
    s.charge = 0;
  }
  s.drifting = drift;
  s.boost = Math.max(0, s.boost - dt);
  s.flash = Math.max(0, s.flash - dt);
  s.lane = clamp(
    s.lane + dt * (s.steer * (drift ? 1.48 : 1.2) - curve(s.distance) * 0.32),
    -1.23,
    1.23,
  );
  s.distance += dt * (Math.abs(s.lane) > 1 ? 22 : s.boost > 0 ? 64 : 38);
  while (s.passed < gates.length && s.distance >= gates[s.passed].at) {
    const g = gates[s.passed++];
    if (Math.abs(s.lane - g.lane) < 0.42) {
      s.bonus += 150;
      s.sounds.play("score", g.lane);
      s.flash = 0.32;
    }
  }
  s.score = Math.round(s.distance) + s.bonus;
  s.trail.forEach((t) => (t.age += dt));
  s.trail = s.trail.filter((t) => t.age < 0.36);
  if (s.distance >= 1800) s.finish("finish");
}
function draw(ctx, s) {
  skyline(ctx, s);
  circuit(ctx, s);
  s.trail.forEach((t) =>
    ellipse(
      ctx,
      t.x,
      s.height * 0.86 + t.age * 110,
      6 + t.age * 12,
      3 + t.age * 6,
      "#c0b1cf55",
    ),
  );
  car(ctx, s);
  if (s.flash > 0) {
    ctx.fillStyle = "#aeffeb";
    ctx.font = "bold 20px sans-serif";
    ctx.fillText("+150", W * 0.51, s.height * 0.69 - s.flash * 12);
  }
}
export const game = {
  id: "aurora-drift",
  title: ["Aurora Drift", "极光漂移"],
  words,
  meter: "lap",
  sound,
  reset,
  update,
  draw,
  read: (s) => Math.min(3, Math.floor(s.distance / 600) + 1) + "/3",
  actions: [
    { id: "left", codes: ["ArrowLeft", "KeyA"] },
    { id: "right", codes: ["ArrowRight", "KeyD"] },
    { id: "drift", codes: ["ShiftLeft", "ShiftRight", "Space"] },
  ],
};

if (typeof document !== "undefined") mount(game);
