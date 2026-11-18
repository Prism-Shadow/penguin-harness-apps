import { mount, W, clamp, polygon, ellipse, line, backdrop } from "./host.js";
import { sound } from "./chime.js";
const words = {
  intro: [
    "Catch the wind-blown letters and carry them to the red postboxes. Hop the crates on the boardwalk.",
    "接住海风吹来的信件，骑到红色邮筒边投递。木栈道上遇到箱子记得起跳。",
  ],
  controls: [
    "←/→ or A/D to move. Space, ↑ or tap the scene to jump. Pass a postbox with letters to deliver them.",
    "左右方向键或 A/D 移动。空格、上方向键或轻点画面起跳。带着信件经过邮筒即可投递。",
  ],
  jump: ["Jump", "起跳"],
  mail: ["Delivered", "已投递"],
  finish: ["The last ferry is here.", "末班渡轮到了。"],
};
function cloud(ctx, x, y, k) {
  for (const [u, v, a, b] of [
    [0, 0, 39, 10],
    [17, -7, 26, 13],
    [-18, -4, 18, 11],
    [42, 1, 20, 8],
  ])
    ellipse(ctx, x + u * k, y + v * k, a * k, b * k, "#fff0cf");
}
function lighthouse(ctx, x, y, k) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(k, k);
  polygon(ctx, "#e2d1b8", [
    [-11, 0],
    [-8, -59],
    [9, -59],
    [13, 0],
  ]);
  polygon(ctx, "#d36d58", [
    [-9, -39],
    [10, -39],
    [11, -26],
    [-10, -26],
  ]);
  polygon(ctx, "#324d55", [
    [-13, -58],
    [14, -58],
    [14, -62],
    [-13, -62],
  ]);
  ctx.fillStyle = "#d8ae65";
  ctx.fillRect(-7, -76, 15, 14);
  polygon(ctx, "#b95044", [
    [-12, -76],
    [1, -85],
    [14, -76],
  ]);
  ctx.fillStyle = "#43565a";
  ctx.fillRect(-2, -15, 5, 15);
  ctx.restore();
}
function coast(ctx, s) {
  const h = s.height,
    sea = h * 0.48,
    base = h * 0.78;
  backdrop(ctx, h, ["#83c9cf", "#c9e6d7", "#ffd9a7"]);
  ellipse(ctx, 724, h * 0.21, 39, 39, "#ffedb2");
  for (let i = 0; i < 5; i++)
    cloud(
      ctx,
      ((i * 263 - s.distance * 0.045 + 1200) % 1200) - 70,
      h * (0.12 + 0.03 * (i % 3)),
      0.6 + (i % 3) * 0.2,
    );
  for (let layer = 0; layer < 2; layer++) {
    const pts = [];
    for (let i = -2; i < 31; i++) {
      const x = i * 38,
        y =
          sea -
          (15 +
            18 * (1 + Math.sin(i * 0.5 + layer * 2 + s.distance * 0.00055)) +
            8 * Math.sin(i * 1.35 + layer));
      pts.push([x, y]);
    }
    polygon(ctx, layer === 0 ? "#96b9b3" : "#7da9a4", [
      [0, sea],
      ...pts,
      [W, sea + 1],
    ]);
  }
  ctx.fillStyle = "#69abaf";
  ctx.fillRect(0, sea, W, base - sea);
  for (let i = 0; i < 70; i++) {
    const x = ((i * 117 - s.distance * 0.11 + 1300) % 1100) - 55,
      y = sea + 4 + ((i * 27) % (base - sea));
    line(ctx, i % 4 ? "#98ccbe" : "#c9dfc3", 1.5, x, y, x + 7 + (i % 31), y);
  }
  const lx = ((800 - s.distance * 0.1 + 1400) % 1400) - 75;
  polygon(ctx, "#6c9a86", [
    [lx - 70, sea + 4],
    [lx - 28, sea - 11],
    [lx, sea - 18],
    [lx + 45, sea - 6],
    [lx + 96, sea + 4],
  ]);
  lighthouse(ctx, lx, sea - 12, 0.8);
  for (let i = 0; i < 2; i++) {
    const x = (350 + 437 * i - s.distance * 0.02 + 1300) % 1150,
      y = sea + 15 + i * 26;
    polygon(ctx, "#77535a", [
      [x - 23, y],
      [x + 26, y],
      [x + 14, y + 6],
      [x - 12, y + 6],
    ]);
    line(ctx, "#73665a", 2, x + 1, y, x + 1, y - 36);
    polygon(ctx, "#f4dcb2", [
      [x - 2, y - 36],
      [x - 19, y - 4],
      [x - 2, y - 4],
    ]);
    polygon(ctx, "#d78666", [
      [x + 4, y - 30],
      [x + 4, y - 5],
      [x + 17, y - 5],
    ]);
  }
  for (let i = 0; i < 6; i++) {
    const x = ((i * 222 - s.distance * 0.43 + 2500) % 1250) - 100;
    line(ctx, "#886d5d", 6, x, base + 5, x, base - 38);
    line(ctx, "#cfad7e", 4, x, base - 35, x + 220, base - 35);
  }
  ctx.fillStyle = "#c79569";
  ctx.fillRect(0, base, W, h - base);
  line(ctx, "#f0c692", 5, 0, base, W, base);
  line(ctx, "#996c51", 3, 0, base + 11, W, base + 11);
  for (let i = 0; i < 18; i++) {
    const x = ((i * 79 - s.distance + 21000) % 1264) - 90;
    line(ctx, "#a57859", 2, x, base, x + 46, h);
    line(ctx, "#e7b78a", 2, x + 3, base + 3, x + 48, h);
  }
}
function wheel(ctx, x, y, r, spin) {
  ellipse(ctx, x, y, r, r, "#344b54");
  ellipse(ctx, x, y, r - 4, r - 4, "#dce1c8");
  ellipse(ctx, x, y, r - 6, r - 6, "#91abb0");
  for (let i = 0; i < 8; i++) {
    const a = spin + (i * Math.PI) / 4;
    line(
      ctx,
      "#f8e8c7",
      1.2,
      x,
      y,
      x + (r - 6) * Math.cos(a),
      y + (r - 6) * Math.sin(a),
    );
  }
  ellipse(ctx, x, y, 3, 3, "#38505b");
}
function cyclist(ctx, s) {
  const ground = s.height * 0.78,
    sz = 1.08;
  const x = s.phase === "ready" ? W * 0.6 : s.x,
    y = ground - s.lift,
    spin = s.distance / 20;
  ellipse(ctx, x, ground + 3, 54 - s.lift * 0.13, 5, "#946e58");
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(sz, sz);
  ctx.rotate(-s.lift * 0.00072);
  if (s.stun > 0 && Math.floor(s.stun * 11) % 2) ctx.globalAlpha = 0.62;
  wheel(ctx, -29, -21, 21, spin);
  wheel(ctx, 34, -21, 21, spin);
  for (const [a, b, c, d] of [
    [-29, -21, -9, -51],
    [-9, -51, 3, -23],
    [3, -23, -29, -21],
    [-9, -51, 23, -49],
    [23, -49, 3, -23],
    [22, -51, 34, -21],
  ])
    line(ctx, "#c4534d", 4, a, b, c, d);
  line(ctx, "#415a60", 3, 21, -48, 19, -65);
  line(ctx, "#415a60", 3, 18, -65, 30, -66);
  line(ctx, "#475963", 4, -18, -52, -5, -52);
  const pedal = Math.sin(spin) * 7;
  line(ctx, "#d78d49", 4, -8, -56, 3 + pedal, -32);
  line(ctx, "#be713d", 4, 3 + pedal, -32, -2 + pedal, -23);
  ellipse(ctx, -6, -72, 21, 26, "#f7edce");
  ellipse(ctx, -11, -68, 17, 11, "#c6d2bd");
  polygon(ctx, "#f7edce", [
    [-13, -92],
    [0, -93],
    [7, -125],
    [22, -121],
    [10, -83],
    [1, -72],
    [-13, -74],
  ]);
  polygon(ctx, "#df6b50", [
    [-1, -94],
    [-9, -86],
    [-26, -94],
    [-53, -84 + Math.sin(spin * 0.32) * 4],
    [-40, -95],
    [-28, -100],
  ]);
  ellipse(ctx, 12, -122, 15, 16, "#f8efd3");
  polygon(ctx, "#e79b50", [
    [19, -128],
    [54, -125],
    [58, -120],
    [29, -111],
    [17, -115],
  ]);
  polygon(ctx, "#efb66b", [
    [20, -122],
    [55, -122],
    [33, -111],
    [24, -110],
  ]);
  line(ctx, "#975e43", 1.5, 25, -121, 55, -122);
  ellipse(ctx, 17, -127, 2.3, 2.8, "#2a4850");
  ctx.fillStyle = "#347c7e";
  ctx.beginPath();
  ctx.arc(11, -128, 15, Math.PI, Math.PI * 2);
  ctx.fill();
  line(ctx, "#e7cc89", 3, -4, -129, 28, -129);
  ellipse(ctx, 22, -76, 4, 3, "#d6ac66");
  line(ctx, "#d6ad70", 4, 3, -88, 22, -76);
  line(ctx, "#d6ad70", 3, 22, -76, 23, -67);
  ctx.fillStyle = "#965c46";
  ctx.fillRect(-27, -76, 21, 15);
  polygon(ctx, "#cc9a64", [
    [-28, -76],
    [-5, -76],
    [-10, -69],
    [-24, -69],
  ]);
  ctx.restore();
}
function postbox(ctx, x, y) {
  line(ctx, "#694f45", 6, x, y, x, y - 39);
  ctx.fillStyle = "#bc5748";
  ctx.fillRect(x - 18, y - 58, 35, 24);
  ellipse(ctx, x, y - 58, 17, 8, "#cf7059");
  ctx.fillStyle = "#623f41";
  ctx.fillRect(x - 10, y - 55, 20, 3);
  line(ctx, "#eed39d", 2, x - 8, y - 44, x + 8, y - 44);
}
function letter(ctx, x, y, t) {
  ctx.save();
  ctx.translate(x, y + Math.sin(t * 3) * 4);
  ctx.rotate(Math.sin(t * 2) * 0.1);
  ctx.fillStyle = "#886d59";
  ctx.fillRect(-17, -10, 34, 23);
  ctx.fillStyle = "#fff0c4";
  ctx.fillRect(-16, -11, 32, 21);
  line(ctx, "#bd795c", 1.7, -16, -10, 0, 1);
  line(ctx, "#bd795c", 1.7, 0, 1, 16, -10);
  ctx.fillStyle = "#cb7056";
  ctx.fillRect(8, -9, 5, 5);
  ctx.restore();
}
function crate(ctx, x, y) {
  ctx.fillStyle = "#9d6e50";
  ctx.fillRect(x - 19, y - 33, 38, 33);
  ctx.fillStyle = "#d6a46e";
  ctx.fillRect(x - 16, y - 30, 32, 27);
  line(ctx, "#946749", 3, x - 14, y - 4, x + 14, y - 29);
  line(ctx, "#eac58a", 3, x - 14, y - 29, x + 14, y - 4);
}
function reset(s) {
  s.x = 260;
  s.lift = 0;
  s.vy = 0;
  s.distance = 0;
  s.bag = 0;
  s.delivered = 0;
  s.stun = 0;
  s.note = 0;
  s.objects = [];
  for (let i = 0; i < 30; i++) {
    const type = i % 6 === 5 ? "box" : i % 6 === 3 ? "crate" : "letter";
    s.objects.push({ at: 610 + i * 203, type, high: i % 2 === 1, done: false });
  }
}
function jump(s) {
  if (s.lift === 0) {
    s.vy = 340;
    s.sounds.play("jump");
  }
}
function update(s, dt) {
  s.distance += dt * 147;
  s.x = clamp(
    s.x + (Number(s.keys.has("right")) - Number(s.keys.has("left"))) * dt * 225,
    100,
    730,
  );
  s.lift = Math.max(0, s.lift + s.vy * dt);
  if (s.lift > 0) s.vy -= 780 * dt;
  else s.vy = 0;
  s.stun = Math.max(0, s.stun - dt);
  s.note = Math.max(0, s.note - dt);
  for (const obj of s.objects) {
    if (obj.done) continue;
    const x = obj.at - s.distance;
    if (x < s.x - 46) {
      obj.done = true;
      continue;
    }
    if (Math.abs(x - s.x) > 33) continue;
    if (obj.type === "letter" && Math.abs(s.lift - (obj.high ? 65 : 0)) < 34) {
      obj.done = true;
      s.bag++;
      s.score += 20;
      s.sounds.play("score");
    }
    if (obj.type === "crate" && s.lift < 30 && s.stun <= 0) {
      obj.done = true;
      s.score = Math.max(0, s.score - 15);
      s.stun = 0.75;
      s.sounds.play("bump");
    }
    if (obj.type === "box" && s.bag > 0) {
      obj.done = true;
      s.delivered += s.bag;
      s.score += 100 * s.bag;
      s.bag = 0;
      s.note = 0.8;
      s.sounds.play("boost");
    }
  }
  if (s.distance > 6400) s.finish("finish");
}
function draw(ctx, s) {
  coast(ctx, s);
  const base = s.height * 0.78;
  for (const obj of s.objects) {
    const x = obj.at - s.distance;
    if (x < -70 || x > W + 70) continue;
    if (obj.type === "box") postbox(ctx, x, base);
    else if (!obj.done && obj.type === "crate") crate(ctx, x, base);
    else if (!obj.done && obj.type === "letter")
      letter(ctx, x, base - (obj.high ? 137 : 72), s.time + obj.at);
  }
  cyclist(ctx, s);
  if (s.note > 0) {
    ctx.fillStyle = "#304d52";
    ctx.font = "bold 23px sans-serif";
    ctx.fillText("✓ " + s.delivered, s.x + 25, base - 142);
  }
}
export const game = {
  id: "pelican-post",
  title: ["Pelican Post", "鹈鹕邮路"],
  words,
  meter: "mail",
  sound,
  reset,
  update,
  draw,
  read: (s) => s.delivered,
  press: (s, id) => {
    if (id === "jump") jump(s);
  },
  tap: jump,
  actions: [
    { id: "left", codes: ["ArrowLeft", "KeyA"] },
    { id: "right", codes: ["ArrowRight", "KeyD"] },
    { id: "jump", codes: ["Space", "ArrowUp", "KeyW"] },
  ],
};

if (typeof document !== "undefined") mount(game);
