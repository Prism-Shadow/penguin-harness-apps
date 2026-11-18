import { describe, expect, it } from "vitest";
import { game as harbor } from "../plugins/harbor-pulse/workbenches/harbor-pulse/ui/game.js";
import { game as race } from "../plugins/aurora-drift/workbenches/aurora-drift/ui/game.js";
import { game as post } from "../plugins/pelican-post/workbenches/pelican-post/ui/game.js";
import {
  shot,
  soundCheck,
} from "../plugins/harbor-pulse/workbenches/harbor-pulse/ui/audio.js";
function fresh(game) {
  const state = {
    width: 960,
    height: 540,
    score: 0,
    time: 0,
    elapsed: 0,
    keys: new Set(),
    sounds: { play() {} },
    finish(message) {
      this.result = message;
    },
  };
  game.reset(state);
  return state;
}
function tick(game, state, seconds) {
  for (let i = 0; i < Math.round(seconds * 60); i++) {
    state.elapsed += 1 / 60;
    state.time += 1 / 60;
    game.update(state, 1 / 60);
  }
}
describe("independent arcade rounds", () => {
  it("pays the third successive buoy an extra 50, ignores a repeated input in its cooldown, and ends at the horn", () => {
    const s = fresh(harbor);
    for (let hit = 0; hit < 3; hit++) {
      const b = s.buoys[0],
        t = s.time + b.phase;
      s.pointer = {
        x: b.x + Math.sin(t * 1.07) * b.travel,
        y: s.height * (b.y + Math.sin(t * 1.56) * 0.022),
      };
      harbor.tap(s);
      harbor.tap(s);
      tick(harbor, s, 0.2);
    }
    expect(s.score).toBe(350);
    s.pointer = { x: 10, y: 10 };
    harbor.tap(s);
    expect(s.combo).toBe(0);
    tick(harbor, s, 45);
    expect(s.result).toBe("result");
  });
  it("releases a charged drift into boost; the final lap finishes", () => {
    const s = fresh(race);
    s.keys.add("right");
    s.keys.add("drift");
    tick(race, s, 1.2);
    expect(s.charge).toBeGreaterThan(0.35);
    s.keys.delete("drift");
    tick(race, s, 1 / 60);
    expect(s.boost).toBeGreaterThan(0);
    expect(s.charge).toBe(0);
    tick(race, s, 90);
    expect(s.result).toBe("finish");
    expect(race.read(s)).toBe("3/3");
  });
  it("collects a letter, hops a crate, and empties the satchel into a postbox", () => {
    const s = fresh(post);
    s.objects = [
      { at: s.x, type: "letter" },
      { at: s.x + 70, type: "crate" },
      { at: s.x + 190, type: "box" },
    ];
    tick(post, s, 1 / 60);
    expect(s.bag).toBe(1);
    post.tap(s);
    tick(post, s, 1.5);
    expect(s.delivered).toBe(1);
    expect(s.bag).toBe(0);
    expect(s.score).toBe(120);
    tick(post, s, 45);
    expect(s.result).toBe("finish");
  });
  it("renders a percussive stereo shot with two distinct ears, changing bursts, and unclipped headroom", () => {
    const rate = 22050,
      a = shot(rate, 118, -0.35),
      b = shot(rate, 230, 0.4),
      preview = soundCheck(rate);
    const rms = (x, start, end) =>
      Math.sqrt(
        x.slice(start, end).reduce((sum, i) => sum + i * i, 0) / (end - start),
      );
    expect(a[0]).not.toEqual(b[0]);
    expect(a[0]).not.toEqual(a[1]);
    expect(rms(a[0], 100, 800)).toBeGreaterThan(rms(a[0], 3300, 4600) * 3);
    expect(rms(a[0], 3300, 4600)).toBeGreaterThan(0.01);
    expect(preview).toHaveLength(2);
    for (const channel of preview) {
      expect(channel.length).toBe(Math.ceil(rate * 1.75));
      expect(
        channel.reduce((peak, v) => Math.max(peak, Math.abs(v)), 0),
      ).toBeLessThan(0.9);
    }
  });
});
