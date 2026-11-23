import { COURSE, snow } from "./ride.js";

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

function penguin(ctx, x, y, angle, size, crouch, tumble, air) {
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
  ctx.translate(0, crouch ? 3 : 0);
  const lean = tumble ? -0.65 : air ? -0.15 : 0.16;
  ctx.rotate(lean);
  ctx.scale(1, crouch ? 0.77 : 1);
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
  oval(ctx, colors.ink, 8.4, -29.2, 1.3, 1.6);
  // A long vermilion scarf and a matching ribbed watch cap stand out against the snow.
  polygon(ctx, colors.red, [
    [-7, -24],
    [8, -23],
    [10, -20],
    [-6, -20],
    [-14, -23],
    [-22, -20],
    [-18, -25],
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
  oval(ctx, "#2c4a57", -5.5, -17.5, 4.1, 9.5, air ? 1 : 0.63);
  ctx.restore();
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
  const scale = Math.min(w < 550 ? 12 : 19, Math.max(7, h * 0.042)),
    anchor = w * (w < 550 ? 0.27 : 0.29);
  const camera =
    snow(ride.x + 7) - Math.min(3, Math.max(0, snow(ride.x) - ride.y) * 0.3);
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
  const gates = [0, 100, 200, 300, 400, 500, COURSE];
  for (const x of gates) {
    if (x < left - 2 || x > right) continue;
    const px = wx(x),
      py = wy(snow(x));
    ctx.strokeStyle = colors.ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px, py - 35);
    ctx.stroke();
    polygon(ctx, x === COURSE ? colors.ink : colors.red, [
      [px, py - 35],
      [px + 24, py - 35],
      [px + 18, py - 28],
      [px + 24, py - 21],
      [px, py - 21],
    ]);
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
  penguin(
    ctx,
    anchor,
    py - 1,
    ride.angle,
    w < 500 ? 45 : 54,
    ride.charge > 0.08,
    ride.mode === "tumble",
    ride.mode === "air",
  );
}
