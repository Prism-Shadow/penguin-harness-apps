import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { parse } from "yaml";

it("ships the short-drama-studio skill with valid frontmatter and version", () => {
  const markdown = readFileSync(
    new URL("../skills/short-drama-studio/SKILL.md", import.meta.url),
    "utf8",
  );
  const frontmatter = /^---\r?\n([\s\S]+?)\r?\n---(?:\r?\n|$)/.exec(markdown);
  expect(frontmatter).not.toBeNull();
  const skill = parse(frontmatter![1]);
  expect(skill.name).toBe("short-drama-studio");
  expect(skill.version).toMatch(/^\d{4}\.\d{2}\.\d{2}\.\d+$/);
  expect(skill.description.trim().length).toBeGreaterThan(0);
});
