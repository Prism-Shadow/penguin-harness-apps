import {
  mount,
  W,
  clamp,
  backdrop,
  polygon,
  ellipse,
  line,
  random,
} from "./host.js";
import { sound, preview } from "./audio.js";

const palette = [
  ["#c85440", "#893c39", "#e58756"],
  ["#316f78", "#214f5b", "#61a3a2"],
  ["#405583", "#323d62", "#7886a0"],
];
const words = {
  intro: [
    "Pop the signal buoys above the freight deck. Chain three hits before the ship’s horn.",
    "击亮货轮上的信标浮球，连续命中三次可获得加分。",
  ],
  controls: [
    "Aim and click or tap a buoy. Keyboard: arrows or WASD to aim, Space to fire.",
    "鼠标瞄准并点击，触屏点浮球。方向键或 WASD 移动准星，空格发射。",
  ],
  clock: ["Seconds", "剩余秒数"],
  fire: ["Fire", "发射"],
  result: ["The ship has reached the harbor.", "货轮已靠岸。"],
};
function crane(ctx, x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  const ink = "#536a74";
  line(ctx, ink, 7, -14, 0, 0, -100);
  line(ctx, ink, 6, 17, 0, 0, -100);
  line(ctx, ink, 5, -30, -87, 73, -115);
  line(ctx, ink, 3, 2, -99, 39, -119);
  line(ctx, ink, 2, 39, -119, 72, -115);
  line(ctx, ink, 1.4, 61, -111, 61, -68);
  for (let k = 1; k < 5; k++)
    line(ctx, ink, 1.5, -9 + k, -k * 17, 8 - k, -(k + 1) * 17);
  ctx.fillStyle = "#647981";
  ctx.fillRect(-32, -86, 23, 10);
  ctx.restore();
}
function container(ctx, x, y, w, h, depth, p, index) {
  const [front, side, roof] = palette[index % palette.length];
  polygon(ctx, side, [
    [x + w, y - h],
    [x + w + depth, y - h - depth * 0.28],
    [x + w + depth, y - depth * 0.28],
    [x + w, y],
  ]);
  polygon(ctx, roof, [
    [x, y - h],
    [x + depth, y - h - depth * 0.28],
    [x + w + depth, y - h - depth * 0.28],
    [x + w, y - h],
  ]);
  ctx.fillStyle = front;
  ctx.fillRect(x, y - h, w, h);
  const spacing = Math.max(6, w / 11);
  for (let u = x + 5; u < x + w - 3; u += spacing) {
    line(ctx, side, 2, u, y - h + 4, u, y - 4);
    line(ctx, roof, 1, u + 2, y - h + 4, u + 2, y - 4);
  }
  line(ctx, roof, 2, x, y - h, x + w, y - h);
  line(ctx, side, 3, x, y, x + w, y);
  if (w > 58) {
    ctx.fillStyle = "#e8dfc6";
    ctx.font = "bold " + Math.max(7, Math.round(w * 0.07)) + "px monospace";
    ctx.fillText("N " + String(p).padStart(2, "0"), x + 7, y - h + 13);
  }
}
function deck(ctx, s) {
  const h = s.height,
    horizon = h * 0.38,
    sway = (s.pointer.x - W / 2) * (s.phase === "running" ? 0.01 : 0);
  backdrop(ctx, h, ["#41788d", "#95c3c2", "#f5bd88", "#476e73"]);
  ctx.save();
  ctx.translate(sway, 0);
  ellipse(ctx, 725, horizon * 0.6, 44, 44, "#ffd49c");
  for (let i = 0; i < 14; i++) {
    const x = i * 77 - 20,
      y = horizon - 12 - ((i * 13) % 32);
    ctx.fillStyle = "#789ca0";
    ctx.fillRect(x, y, 55, 55);
    ctx.fillStyle = "#8aa9a7";
    ctx.fillRect(x + 31, y - 6, 18, 9);
  }
  [85, 178, 770, 902].forEach((x, i) =>
    crane(ctx, x, horizon + 1, 0.48 + (i % 2) * 0.3),
  );
  ctx.fillStyle = "#397d87";
  ctx.fillRect(-16, horizon, W + 32, h - horizon);
  for (let i = 0; i < 95; i++) {
    const x = ((i * 113 + s.time * 5) % (W + 90)) - 45,
      y = horizon + 3 + ((i * 31) % (h * 0.27));
    line(ctx, i % 3 ? "#69a4a6" : "#94bcaf", 1, x, y, x + 6 + (i % 41), y);
  }
  const vanish = [W * 0.49, horizon - 5],
    bottom = h + 18;
  polygon(ctx, "#605d57", [
    [W * 0.39, horizon + 6],
    [W * 0.61, horizon + 6],
    [W + 250, bottom],
    [-250, bottom],
  ]);
  for (let i = -4; i <= 5; i++) {
    const x = 480 + i * 135;
    line(
      ctx,
      "#726d61",
      1.5,
      vanish[0] + (x - 480) * 0.15,
      horizon + 6,
      x,
      bottom,
    );
  }
  for (let i = 1; i < 12; i++) {
    const z = (i / 12) ** 1.85;
    const y = horizon + (bottom - horizon) * z;
    line(ctx, "#535953", 1.3, 370 - 650 * z, y, 590 + 650 * z, y);
  }
  for (const side of [-1, 1]) {
    const near = 480 + side * 205;
    polygon(ctx, "#ddb37b", [
      [480 + side * 24, horizon + 12],
      [480 + side * 28, horizon + 12],
      [near + side * 6, bottom],
      [near, bottom],
    ]);
    for (let j = 1; j < 6; j++) {
      const z = j / 6,
        x = 480 + side * (56 + 650 * z),
        y = horizon + z * z * (h * 0.6);
      line(ctx, "#164952", 3, x, y, x, y - 15 - 11 * z);
    }
  }
  container(ctx, 318, horizon + 32, 48, 22, 11, 18, 2);
  container(ctx, 575, horizon + 30, 55, 28, 12, 2, 1);
  container(ctx, 192, horizon + 100, 122, 55, 34, 26, 1);
  container(ctx, 197, horizon + 45, 116, 47, 31, 44, 0);
  container(ctx, 676, horizon + 92, 120, 57, 37, 5, 0);
  container(ctx, 714, horizon + 37, 87, 36, 26, 3, 2);
  container(ctx, -88, horizon + 190, 208, 92, 63, 8, 0);
  container(ctx, -55, horizon + 97, 163, 72, 55, 16, 2);
  container(ctx, 863, horizon + 178, 176, 83, 47, 43, 1);
  ctx.restore();
}
function targetPoint(s, b) {
  const t = s.time + b.phase;
  return {
    x: b.x + Math.sin(t * 1.07) * b.travel,
    y: s.height * (b.y + Math.sin(t * 1.56) * 0.022),
    r: b.r,
  };
}
function buoy(ctx, s, b) {
  const { x, y, r } = targetPoint(s, b);
  ctx.save();
  ctx.translate(x, y);
  const squash = 1 + 0.05 * Math.sin(s.time * 3 + b.phase);
  ctx.scale(squash, 1 / squash);
  ellipse(ctx, 0, 4, r + 7, r + 6, "#1c3948");
  ellipse(ctx, 0, 0, r + 4, r + 4, "#ffdf92");
  ellipse(ctx, 0, 0, r, r, "#ec714c");
  ellipse(ctx, 0, 0, r * 0.66, r * 0.66, "#fbe8b2");
  ellipse(ctx, 0, 0, r * 0.39, r * 0.39, "#cf5546");
  ellipse(ctx, -r * 0.25, -r * 0.44, r * 0.15, r * 0.08, "#fff8da");
  ctx.restore();
  line(ctx, "#184957", 2, x, y + r + 9, x - 5, y + r + 18);
}
function emitter(ctx, s) {
  const h = s.height,
    k = s.kick,
    ax = 625 + (s.pointer.x - 480) * 0.063,
    ay = h - k * 22;
  ctx.save();
  ctx.translate(ax, ay);
  ctx.rotate(-0.23 + k * 0.05);
  polygon(ctx, "#182e46", [
    [-45, 22],
    [-49, -59],
    [-18, -103],
    [45, -106],
    [87, 10],
  ]);
  polygon(ctx, "#375669", [
    [-49, -59],
    [-18, -103],
    [22, -99],
    [-10, -55],
  ]);
  polygon(ctx, "#ed975a", [
    [-18, -103],
    [-2, -119],
    [40, -110],
    [46, -99],
  ]);
  polygon(ctx, "#173c47", [
    [-4, -115],
    [3, -128],
    [43, -120],
    [40, -110],
  ]);
  polygon(ctx, "#9cd6ca", [
    [4, -123],
    [32, -117],
    [31, -112],
    [1, -118],
  ]);
  for (let i = 0; i < 3; i++)
    line(ctx, "#82aca9", 3, -15 + i * 3, -58 + i * 9, 20 + i * 3, -54 + i * 9);
  if (k > 0.62) {
    ctx.globalAlpha = (k - 0.62) / 0.38;
    polygon(ctx, "#fff0ab", [
      [9, -122],
      [-26, -169],
      [3, -151],
      [4, -185],
      [20, -148],
      [41, -162],
      [29, -128],
    ]);
  }
  ctx.restore();
}
function reset(s) {
  s.rand = random(6342);
  s.combo = 0;
  s.kick = 0;
  s.cool = 0;
  s.pops = [];
  s.buoys = [
    { x: 465, y: 0.49, r: 24, travel: 17, phase: 0 },
    { x: 637, y: 0.4, r: 21, travel: 24, phase: 1.7 },
    { x: 325, y: 0.63, r: 27, travel: 22, phase: 3.1 },
  ];
  s.pointer = { x: 480, y: s.height * 0.49 };
}
function fire(s) {
  if (s.cool > 0) return;
  s.kick = 1;
  s.cool = 0.135;
  s.sounds.play("shot", (s.pointer.x / W - 0.5) * 1.5);
  const hit = s.buoys.find((b) => {
    const p = targetPoint(s, b);
    return Math.hypot(p.x - s.pointer.x, p.y - s.pointer.y) < p.r + 10;
  });
  if (!hit) {
    s.combo = 0;
    return;
  }
  const p = targetPoint(s, hit);
  s.combo++;
  s.score += 100 + (s.combo >= 3 ? 50 : 0);
  s.sounds.play("score", p.x / W - 0.5);
  s.pops.push({ x: p.x, y: p.y, age: 0, combo: s.combo });
  hit.x = 220 + s.rand() * 510;
  hit.y = 0.39 + s.rand() * 0.3;
  hit.phase = s.rand() * 6;
}
function update(s, dt) {
  s.cool = Math.max(0, s.cool - dt);
  s.kick = Math.max(0, s.kick - dt * 7);
  s.pointer.x = clamp(
    s.pointer.x + (+s.keys.has("right") - +s.keys.has("left")) * dt * 390,
    10,
    W - 10,
  );
  s.pointer.y = clamp(
    s.pointer.y + (+s.keys.has("down") - +s.keys.has("up")) * dt * 390,
    15,
    s.height - 10,
  );
  s.pops.forEach((p) => (p.age += dt));
  s.pops = s.pops.filter((p) => p.age < 0.45);
  if (s.elapsed >= 45) s.finish("result");
}
function draw(ctx, s) {
  deck(ctx, s);
  s.buoys.forEach((b) => buoy(ctx, s, b));
  for (const p of s.pops) {
    ctx.save();
    ctx.globalAlpha = 1 - p.age / 0.45;
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4,
        d = 15 + p.age * 85;
      line(
        ctx,
        "#ffe197",
        3,
        p.x + Math.cos(a) * d,
        p.y + Math.sin(a) * d,
        p.x + Math.cos(a) * (d + 10),
        p.y + Math.sin(a) * (d + 10),
      );
    }
    ctx.fillStyle = "#fff8d6";
    ctx.font = "bold 19px sans-serif";
    ctx.fillText(
      p.combo >= 3 ? "+150" : "+100",
      p.x + 16,
      p.y - 18 - p.age * 30,
    );
    ctx.restore();
  }
  emitter(ctx, s);
  const { x, y } = s.pointer;
  if (s.phase === "running") {
    for (const [a, b, c, d] of [
      [-13, 0, -6, 0],
      [6, 0, 13, 0],
      [0, -13, 0, -6],
      [0, 6, 0, 13],
    ]) {
      line(ctx, "#273c43", 4, x + a, y + b, x + c, y + d);
      line(ctx, "#fff3b2", 2, x + a, y + b, x + c, y + d);
    }
  }
}
export const game = {
  id: "harbor-pulse",
  title: ["Harbor Pulse", "港湾脉冲"],
  words,
  meter: "clock",
  sound,
  preview,
  reset,
  update,
  draw,
  read: (s) => Math.max(0, 45 - Math.floor(s.elapsed)),
  press: (s, id) => {
    if (id === "fire") fire(s);
  },
  tap: fire,
  actions: [
    ["left", "ArrowLeft", "KeyA"],
    ["right", "ArrowRight", "KeyD"],
    ["up", "ArrowUp", "KeyW"],
    ["down", "ArrowDown", "KeyS"],
    ["fire", "Space"],
  ].map(([id, ...codes]) => ({ id, codes, button: false })),
};

if (typeof document !== "undefined") mount(game);
