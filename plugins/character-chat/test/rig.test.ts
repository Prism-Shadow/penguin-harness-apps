/** Given any original character or a legacy card, every mood uses a shipped illustration.
 * A roster thumbnail crops the same illustration as the stage. Unknown card data stays out
 * of its markup. Scenes retain their own lighting and default to the plain studio.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
// @ts-expect-error a plain-JS page module
import { illustratedPortrait } from "../workbenches/characters/ui/illustrations.js";
import { MOODS, parseCard } from "../workbenches/characters/stage.js";
// @ts-expect-error a plain-JS page module
import { SCENES, scene } from "../workbenches/characters/ui/scenes.js";

describe("illustrated character portraits", () => {
  for (const name of ["sunny", "pip", "mugi", "ren"]) {
    it(`uses the shipped ${name} artwork for every expression, blinking and talking`, () => {
      const asset = new URL(`../workbenches/characters/ui/art/${name}.svg`, import.meta.url);
      expect(readFileSync(asset, "utf8")).toContain("data:image/webp;base64,");
      for (const mood of MOODS) {
        const stage = illustratedPortrait(name, mood);
        const thumbnail = illustratedPortrait(name, mood, true);
        for (const svg of [stage, thumbnail]) {
          expect(svg).toContain(`href="./art/${name}.svg"`);
          expect(svg).toContain(`data-mood="${mood}"`);
          expect(svg).toContain('class="rig-shut"');
          expect(svg).toContain('class="rig-mouth-talk"');
        }
        expect(stage.match(/viewBox="([^"]+)"/)?.[1]).not.toBe(
          thumbnail.match(/viewBox="([^"]+)"/)?.[1],
        );
      }
    });
  }

  it("finds the illustration on an old imported card and gives custom or missing artwork an illustrated default", () => {
    for (const [kind, look, expected] of [
      ["human", '{"hair":"#654137"}', "mugi"],
      ["human", '{"hair":"#294B52"}', "ren"],
      ["human", "bad JSON", "sunny"],
      ["robot", '{"face":"#123456"}', "pip"],
      ["cat", "{}", "pip"],
      ["teapot", "{}", "pip"],
    ]) {
      const card = parseCard(
        `---\nname: Custom\nkind: ${kind}\nlook: ${look}\n---\nHello`,
        "my-card",
      );
      expect(card).toMatchObject({ meta: { portrait: expected } });
    }
    const svg = illustratedPortrait("<script>unknown</script>", '" onclick="x');
    expect(svg).toContain('href="./art/pip.svg"');
    expect(svg).toContain('data-mood="neutral"');
    expect(svg).not.toContain("onclick");
  });
});

describe("a scene", () => {
  it("is drawn in each light of the day, and an unknown one is the plain studio", () => {
    for (const name of SCENES as string[])
      for (const phase of ["day", "dusk", "night"]) {
        const svg = (scene as (n: string, p: string) => string)(name, phase);
        expect(svg).toContain(`data-scene="${name}"`);
        expect(svg).toContain(`data-phase="${phase}"`);
      }
    expect((scene as (n: string, p: string) => string)("castle", "night")).toContain(
      'data-scene="plain"',
    );
  });
});
