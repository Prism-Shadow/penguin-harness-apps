import { readFileSync } from "node:fs";
import { parse } from "yaml";
import { expect, it } from "vitest";

it("ships the character-chat skill with the name the library installs", () => {
  const markdown = readFileSync(new URL("../skills/character-chat/SKILL.md", import.meta.url), "utf8");
  const frontmatter = /^---\r?\n([\s\S]+?)\r?\n---(?:\r?\n|$)/.exec(markdown);
  expect(frontmatter).not.toBeNull();
  const skill = parse(frontmatter![1]);
  expect(skill.name).toBe("character-chat");
  expect(skill.description.trim().length).toBeGreaterThan(0);
});
