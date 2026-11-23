import { COURSE, LANDING_ZONES, snow } from "./ride.js";

const colors = {
  ink: "#142d43",
  cream: "#fff6df",
  red: "#ea533d",
  ice: "#b9e3e2",
};
const jitter = (i) => {
  const n = Math.sin(i * 127.1 + 31.7) * 4314.23;
  return n - Math.floor(n);
};

function polygon(ctx, color, points) {
  ctx.beginPath();
  ctx.moveTo(...points[0]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(...points[i]);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}
function oval(ctx, color, x, y, rx, ry, turn = 0) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, turn, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
}
function ridge(ctx, w, h, travel, spacing, base, amp, face, shade, seed) {
  const start = Math.floor(travel / spacing) - 1;
  for (let i = start; i < start + w / spacing + 3; i++) {
    const left = i * spacing - travel,
      peak = left + spacing * (0.36 + 0.22 * jitter(i + seed));
    const y = h * (base - amp * (0.45 + 0.55 * jitter(i - seed)));
    const bottom = h * (base + 0.12);
    polygon(ctx, face, [
      [left - spacing * 0.26, bottom],
      [peak, y],
      [left + spacing * 1.36, bottom],
    ]);
    polygon(ctx, shade, [
      [peak, y],
      [peak + spacing * 0.1, y + (bottom - y) * 0.32],
      [peak + spacing * 0.05, y + (bottom - y) * 0.36],
      [left + spacing * 0.96, bottom],
      [left + spacing * 1.36, bottom],
    ]);
  }
}

function penguin(ctx, x, y, angle, size, ride) {
  const crouch = Math.max(
    ride.charge / 0.65,
    Math.max(0, ride.edge) * 0.65,
    ride.impact * 0.45,
  );
  const air = ride.mode === "air";
  const flutter = Math.sin(ride.time * 16) * (ride.speed / 15);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  const k = size / 47;
  ctx.scale(k, k);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  // Upturned board, binding and a pair of boots.
  ctx.strokeStyle = colors.ink;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-24, -3);
  ctx.quadraticCurveTo(-22, 1, -13, 1);
  ctx.lineTo(15, 1);
  ctx.quadraticCurveTo(23, 1, 26, -5);
  ctx.stroke();
  ctx.strokeStyle = colors.red;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.translate(0, 3 * crouch);
  const lean =
    ride.mode === "tumble"
      ? -0.65
      : air
        ? -0.16 + 0.12 * ride.edge
        : 0.08 + 0.26 * ride.edge;
  ctx.rotate(lean);
  ctx.scale(1 + crouch * 0.08, 1 - crouch * 0.26);
  oval(ctx, "#efab59", -5, -3, 6, 2.5);
  oval(ctx, "#efab59", 7, -3, 5.6, 2.5);
  oval(ctx, colors.ink, 0, -16, 12.5, 15.7, -0.13);
  oval(ctx, colors.cream, 3.3, -15, 8.5, 12.1, -0.2);
  oval(ctx, colors.ink, 2.5, -29.3, 11.1, 10.6);
  oval(ctx, colors.cream, 7.7, -28, 5.4, 5.2);
  polygon(ctx, "#eea54d", [
    [12, -30],
    [20, -27.6],
    [12, -25.8],
  ]);
  // Polarized goggles and a bright lens keep the face readable at trail speed.
  ctx.fillStyle = "#254c62";
  ctx.fillRect(-7, -33, 14, 3);
  oval(ctx, "#f5a94c", 9, -30.6, 7.6, 3.8, -0.1);
  oval(ctx, "#174c66", 9, -30.6, 5.8, 2.6, -0.1);
  oval(ctx, "#b6f7f4", 11.2, -31.6, 1.7, 0.65, -0.2);
  // A long vermilion scarf and a matching ribbed watch cap stand out against the snow.
  polygon(ctx, colors.red, [
    [-7, -24],
    [8, -23],
    [10, -20],
    [-6, -20],
    [-14, -23],
    [-25 - ride.speed * 0.22, -20 + flutter],
    [-22, -25 + flutter],
    [-11, -26],
  ]);
  oval(ctx, colors.red, 1.5, -36.3, 10.5, 6, -0.14);
  ctx.strokeStyle = "#ff9b66";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-8.5, -34.5);
  ctx.lineTo(11.5, -36.7);
  ctx.stroke();
  oval(ctx, "#ffbd8b", 0, -42.5, 3, 3);
  oval(
    ctx,
    "#2c4a57",
    -5.5,
    -17.5,
    4.1,
    9.5,
    air ? 1.23 - ride.edge * 0.25 : 0.44 + crouch * 0.25,
  );
  ctx.strokeStyle = "#648797";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-5, -23);
  ctx.quadraticCurveTo(-10, -18, -10, -13);
  ctx.stroke();
  ctx.restore();
}

// A wind station, a ropeway and survey shelters give each run visible landmarks.
function pisteLandmarks(ctx, w, h, distance) {
  const span = Math.max(220, w * 0.52);
  const travel = distance * 3.5;
  for (
    let i = Math.floor(travel / span) - 1;
    i < Math.floor((travel + w) / span) + 2;
    i++
  ) {
    const x = i * span - travel + span * 0.45,
      y = h * (0.53 + 0.05 * jitter(i));
    const size = Math.min(1.4, h / 390);
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size, size);
    ctx.strokeStyle = "#527887";
    ctx.lineWidth = 1.5;
    if (i % 2 === 0) {
      ctx.beginPath();
      ctx.moveTo(-6, 20);
      ctx.lineTo(0, -27);
      ctx.lineTo(8, 20);
      ctx.moveTo(-17, -25);
      ctx.lineTo(16, -25);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo((-span / size) * 0.5, -29);
      ctx.quadraticCurveTo(-11, -12, 0, -26);
      ctx.quadraticCurveTo(73, -17, (span / size) * 0.5, -29);
      ctx.stroke();
      const tram = (-span * 0.17) / size;
      ctx.fillStyle = "#466875";
      ctx.fillRect(tram, -21, 1.5, 7);
      ctx.fillRect(tram - 5, -15, 11, 7);
      ctx.fillStyle = "#bedadd";
      ctx.fillRect(tram - 3, -14, 6, 2.5);
    } else {
      ctx.fillStyle = "#70939a";
      ctx.fillRect(-17, 0, 27, 12);
      polygon(ctx, "#e4eee7", [
        [-21, 1],
        [-11, -8],
        [8, -6],
        [14, 1],
      ]);
      ctx.fillStyle = "#3c6675";
      ctx.fillRect(-6, 5, 5, 7);
      ctx.fillRect(4, 4, 3, 3);
      ctx.beginPath();
      ctx.moveTo(17, 12);
      ctx.lineTo(17, -25);
      ctx.stroke();
      polygon(ctx, "#d78d63", [
        [17, -23],
        [30, -21],
        [37, -18],
        [28, -18],
        [17, -20],
      ]);
    }
    ctx.restore();
  }
}

export function drawMountain(canvas, ride) {
  const w = canvas.clientWidth,
    h = canvas.clientHeight;
  if (!w || !h) return;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  if (
    canvas.width !== Math.round(w * ratio) ||
    canvas.height !== Math.round(h * ratio)
  ) {
    canvas.width = Math.round(w * ratio);
    canvas.height = Math.round(h * ratio);
  }
  const ctx = canvas.getContext("2d");
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.8);
  sky.addColorStop(0, "#82bbc6");
  sky.addColorStop(0.62, "#f9dcbd");
  sky.addColorStop(1, "#ffecd0");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
  const sx = w * 0.71,
    sy = h * 0.235;
  oval(ctx, "#ff9e68", sx, sy, Math.min(w, h) * 0.095, Math.min(w, h) * 0.095);
  ridge(ctx, w, h, ride.x * 0.65, w * 0.5, 0.48, 0.23, "#b3c5c4", "#809fa9", 8);
  ridge(ctx, w, h, ride.x * 1.4, w * 0.38, 0.6, 0.26, "#d1e3df", "#7399a9", 42);
  ridge(ctx, w, h, ride.x * 2.5, w * 0.31, 0.7, 0.19, "#7ea6b0", "#527e90", 13);
  pisteLandmarks(ctx, w, h, ride.x);
  const pace = Math.max(0, (ride.speed - 13) / 20);
  const scale =
      Math.min(w < 550 ? 12 : 19, Math.max(7, h * 0.042)) * (1 - 0.14 * pace),
    anchor = w * (w < 550 ? 0.27 : 0.29);
  const camera =
    snow(ride.x + 6 + 4 * pace) -
    Math.min(4, Math.max(0, snow(ride.x) - ride.y) * 0.38);
  const wy = (y) => h * 0.72 + (y - camera) * scale;
  const wx = (x) => anchor + (x - ride.x) * scale;
  const left = ride.x - anchor / scale - 1,
    right = left + w / scale + 2;
  const ground = [];
  for (let x = left; x < right + 1; x += 0.38)
    ground.push([wx(x), wy(snow(x))]);
  const gradient = ctx.createLinearGradient(0, h * 0.57, 0, h);
  gradient.addColorStop(0, "#fffbed");
  gradient.addColorStop(0.53, "#e0f0e9");
  gradient.addColorStop(1, "#b7d8df");
  polygon(ctx, gradient, [...ground, [w + 28, h + 1], [-25, h + 1]]);
  ctx.strokeStyle = "#fdfbef";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ground.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.stroke();
  // Small snow cuts run parallel to the local surface, below the board's contact line.
  for (let i = Math.floor(left / 3); i <= right / 3; i++) {
    const x = i * 3 + jitter(i) * 2,
      depth = 0.7 + jitter(i + 31) * 6;
    const xx = wx(x),
      yy = wy(snow(x) + depth);
    ctx.strokeStyle = "rgba(69,125,148,.33)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(xx, yy);
    ctx.lineTo(xx + 5 + jitter(i + 12) * 9, yy + 1);
    ctx.stroke();
  }
  // Follow the edges carved on the snow. A gap remains where the board was airborne.
  ctx.beginPath();
  for (const mark of ride.tracks) {
    if (mark.joined) ctx.lineTo(wx(mark.x), wy(mark.y) + 2);
    else ctx.moveTo(wx(mark.x), wy(mark.y) + 2);
  }
  ctx.strokeStyle = "rgba(50,104,131,.52)";
  ctx.lineWidth = 2.7;
  ctx.stroke();
  for (const [i, zone] of LANDING_ZONES.entries()) {
    if (zone.end < left || zone.start > right) continue;
    const claimed = ride.stamps.includes(i);
    for (let marker = zone.start + 4; marker < zone.end; marker += 9) {
      if (marker < left || marker > right) continue;
      const px = wx(marker),
        py = wy(snow(marker));
      polygon(ctx, claimed ? "#389378" : "#f4a95e", [
        [px - 12, py + 5],
        [px - 5, py + 5],
        [px + 2, py + 9],
        [px - 5, py + 9],
      ]);
    }
    ctx.strokeStyle = claimed ? "#227454" : "#e65436";
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (
      let x = Math.max(zone.start, left);
      x <= Math.min(zone.end, right);
      x += 0.35
    ) {
      ctx.lineTo(wx(x), wy(snow(x)) + 2);
    }
    ctx.stroke();
  }
  for (const x of [
    0,
    ...LANDING_ZONES.flatMap(({ start, end }) => [start, end]),
    COURSE,
  ]) {
    if (x < left - 2 || x > right) continue;
    const px = wx(x),
      py = wy(snow(x));
    ctx.strokeStyle = colors.ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    const finish = x === COURSE;
    const tall = finish ? 62 : 49;
    ctx.moveTo(px, py);
    ctx.lineTo(px, py - tall);
    ctx.stroke();
    const flutter = Math.sin(ride.time * 4 + x) * 2.5;
    const index = LANDING_ZONES.findIndex(
      (zone) => zone.start === x || zone.end === x,
    );
    polygon(
      ctx,
      finish
        ? colors.ink
        : ride.stamps.includes(index)
          ? "#227454"
          : colors.red,
      [
        [px, py - tall],
        [px + 33, py - tall + flutter],
        [px + 24, py - tall + 10 + flutter],
        [px + 33, py - tall + 20 + flutter],
        [px, py - tall + 19],
      ],
    );
    ctx.fillStyle = colors.cream;
    ctx.font = "800 12px system-ui";
    ctx.fillText(
      finish ? "◆" : index >= 0 ? String(index + 1) : "▶",
      px + 5,
      py - tall + 14,
    );
  }
  const contact = wy(snow(ride.x)),
    py = wy(ride.y);
  oval(
    ctx,
    "rgba(34,73,90,.17)",
    anchor,
    contact + 2,
    Math.max(4, 13 - (contact - py) * 0.08),
    2.5,
  );
  const spray =
    ride.mode === "tumble"
      ? 1
      : ride.mode === "riding"
        ? 0.2 + 0.7 * Math.max(0, -ride.edge) + 0.65 * ride.impact
        : 0;
  if (spray) {
    for (let i = 0; i < 19; i++) {
      const t = (ride.time * (1.35 + jitter(i)) + jitter(i + 14)) % 1;
      const xx = anchor - 8 - t * (22 + 43 * spray + ride.speed * 0.65);
      const yy =
        contact + 2 - Math.sin(t * Math.PI) * (7 + 20 * spray) * jitter(i + 3);
      oval(
        ctx,
        "rgba(247,254,255," + (1 - t) * 0.84 + ")",
        xx,
        yy,
        2.4 * (1 - t) + 0.4,
        1.6 * (1 - t) + 0.4,
      );
    }
  }
  const riderSize = Math.max(51, Math.min(w < 500 ? 77 : 114, h * 0.19));
  penguin(ctx, anchor, py - 1, ride.angle, riderSize, ride);
}
