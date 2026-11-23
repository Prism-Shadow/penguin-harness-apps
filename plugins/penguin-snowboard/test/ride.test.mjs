import { expect, it } from "vitest";
import {
  COURSE,
  STEP,
  incline,
  newRide,
  snow,
  step,
} from "../workbenches/penguin-snowboard/ui/ride.js";

function advance(r, count, input = {}) {
  for (let frame = 0; frame < count; frame++) step(r, input);
}
it("gains speed downhill, clears the snow and awards a clean landing", () => {
  const r = newRide();
  advance(r, 15, { held: true });
  expect(r.speed).toBeGreaterThan(13);
  step(r, { release: true });
  expect(r.mode).toBe("air");
  advance(r, 25);
  expect(r.y).toBeLessThan(snow(r.x) - 0.5);
  for (let frame = 0; r.mode === "air" && frame < 450; frame++) step(r, {});
  expect(r.mode).toBe("riding");
  expect(r.score).toBeGreaterThan(0);
});
it("rewards a complete rotation, but a board landing edge-on falls and recovers", () => {
  function land(extra) {
    const r = newRide();
    r.mode = "air";
    r.x = 40;
    r.y = snow(r.x) - 0.001;
    r.vy = 20;
    r.angle = Math.atan(incline(r.x)) + extra;
    r.launchAngle = 0;
    r.airborne = 1;
    r.peak = 2;
    step(r, {});
    return r;
  }
  const straight = land(0),
    flip = land(2 * Math.PI),
    fall = land(Math.PI / 2);
  expect(flip.score - straight.score).toBe(120);
  expect(fall.mode).toBe("tumble");
  expect(fall.score).toBe(0);
  expect(fall.speed).toBeLessThan(straight.speed);
  advance(fall, Math.ceil(1 / STEP));
  expect(fall.mode).toBe("riding");
  expect(fall.wipeouts).toBe(1);
});
it("lets the rider spin in both directions and finish the course after a restart", () => {
  for (const turn of [-1, 1]) {
    const r = newRide();
    step(r, { release: true });
    advance(r, 27, { turn });
    expect(Math.sign(r.spin)).toBe(turn);
  }
  const r = newRide();
  advance(r, 120 * 120);
  expect(r.mode).toBe("finished");
  expect(r.x).toBe(COURSE);
  const finish = { ...r };
  step(r, { release: true });
  expect(r).toEqual(finish);
  expect(newRide().x).toBe(0);
});
