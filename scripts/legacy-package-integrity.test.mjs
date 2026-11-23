import { expect, it } from "vitest";
import { checkLegacyIntegrity } from "./legacy-package-integrity.mjs";
import records from "./legacy-package-integrities.json" with { type: "json" };

it("rejects different bytes for a registry version older than the first GitHub prerelease", () => {
  const previous = {
    name: "@penguinharness/character-chat",
    version: "0.2.18",
  };
  const original = records["@penguinharness/character-chat@0.2.18"];
  expect(original).toMatch(/^sha512-/);
  expect(() =>
    checkLegacyIntegrity({ ...previous, integrity: original }),
  ).not.toThrow();
  expect(() =>
    checkLegacyIntegrity({ ...previous, integrity: "sha512-different" }),
  ).toThrow(/different SHA-512/);
});
