/** Coordinates are metres, with positive Y pointing down the face of the mountain. */
export const COURSE = 560;
// A clean player-initiated jump can earn one stamp in each marked landing zone.
export const LANDING_ZONES = [
  { start: 70, end: 150 },
  { start: 225, end: 315 },
  { start: 390, end: 485 },
];
export const STAMPS_TO_CLEAR = 2;
export const STEP = 1 / 120;
const TAU = 2 * Math.PI;
const gravity = 22;
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const wrap = (angle) => Math.atan2(Math.sin(angle), Math.cos(angle));

export function snow(x) {
  return (
    0.155 * x +
    2.4 * Math.sin(x / 19) +
    1.7 * Math.sin(x / 8.8) +
    0.4 * Math.sin(x / 4.7)
  );
}
export function incline(x) {
  return (
    0.155 +
    (2.4 / 19) * Math.cos(x / 19) +
    (1.7 / 8.8) * Math.cos(x / 8.8) +
    (0.4 / 4.7) * Math.cos(x / 4.7)
  );
}
function bend(x) {
  return (
    (-2.4 / 19 ** 2) * Math.sin(x / 19) -
    (1.7 / 8.8 ** 2) * Math.sin(x / 8.8) -
    (0.4 / 4.7 ** 2) * Math.sin(x / 4.7)
  );
}

export function newRide() {
  return {
    x: 0,
    y: snow(0),
    speed: 13,
    vy: 0,
    angle: Math.atan(incline(0)),
    spin: 0,
    mode: "riding",
    score: 0,
    wipeouts: 0,
    stamps: [],
    jumped: false,
    time: 0,
    charge: 0,
    tumble: 0,
    airborne: 0,
    launchAngle: 0,
    peak: 0,
    cue: null,
  };
}
function lift(r, power) {
  r.mode = "air";
  r.jumped = power > 0;
  r.vy = r.speed * incline(r.x) - power;
  r.airborne = 0;
  r.launchAngle = r.angle;
  r.peak = 0;
  r.spin = 0;
  r.cue = "jump";
}
export function step(r, input, dt = STEP) {
  if (r.mode === "finished") return;
  r.cue = null;
  r.time += dt;
  if (r.mode === "tumble") {
    r.tumble += dt;
    r.speed *= Math.exp(-0.8 * dt);
    r.x += r.speed * dt;
    r.y = snow(r.x);
    r.angle += 5 * dt;
    if (r.tumble >= 0.95) {
      r.mode = "riding";
      r.angle = Math.atan(incline(r.x));
      r.speed = Math.max(8, r.speed);
      r.cue = "recover";
    }
  } else if (r.mode === "riding") {
    const slope = incline(r.x);
    r.angle = Math.atan(slope);
    r.speed = clamp(
      r.speed +
        (0.8 +
          (gravity * slope) / (1 + slope * slope) -
          0.013 * r.speed ** 1.4) *
          dt,
      8,
      33,
    );
    if (input.press) r.charge = 0;
    if (input.held) r.charge = Math.min(0.65, r.charge + dt);
    if (input.release || (!input.held && bend(r.x) * r.speed ** 2 < -gravity)) {
      lift(r, input.release ? 8.2 + 7 * r.charge : 0);
      r.charge = 0;
    } else {
      r.x += r.speed * dt;
      r.y = snow(r.x);
    }
  } else {
    r.airborne += dt;
    const target = clamp(input.turn || 0, -1, 1) * 8.4;
    r.spin += (target - r.spin) * (1 - Math.exp(-dt * (target ? 8 : 12)));
    r.angle += r.spin * dt;
    r.x += r.speed * dt;
    r.y += r.vy * dt + 0.5 * gravity * dt * dt;
    r.vy += gravity * dt;
    const floor = snow(r.x);
    r.peak = Math.max(r.peak, floor - r.y);
    if (r.y >= floor && r.vy >= r.speed * incline(r.x)) {
      r.y = floor;
      const slopeAngle = Math.atan(incline(r.x));
      const error = Math.abs(wrap(r.angle - slopeAngle));
      if (error < 0.72) {
        const flips = Math.floor(
          (Math.abs(r.angle - r.launchAngle) + 0.45) / TAU,
        );
        const points =
          r.peak > 0.5
            ? Math.round(20 * r.airborne + 8 * r.peak + 120 * flips)
            : 0;
        const zone = LANDING_ZONES.findIndex(
          ({ start, end }) => r.x >= start && r.x <= end,
        );
        const stamp =
          r.jumped && points > 0 && zone >= 0 && !r.stamps.includes(zone);
        if (stamp) r.stamps.push(zone);
        r.score += points;
        r.cue = points ? { type: "land", points, flips, stamp } : null;
        r.speed = clamp(r.speed + 0.55, 8, 33);
        r.mode = "riding";
        r.angle = slopeAngle;
      } else {
        r.mode = "tumble";
        r.tumble = 0;
        r.speed = Math.max(5, r.speed * 0.48);
        r.wipeouts += 1;
        r.cue = "fall";
      }
    }
  }
  if (r.x >= COURSE) {
    r.x = COURSE;
    r.mode = "finished";
    r.cue = "finish";
  }
}
