import { readdirSync, readFileSync } from "node:fs";
import { parse } from "yaml";
import path from "node:path";

import { describe, expect, it } from "vitest";

const skills = path.join(import.meta.dirname, "../skills");

describe("every shipped SKILL.md parses", () => {
  for (const name of readdirSync(skills)) {
    it(name, () => {
      const text = readFileSync(path.join(skills, name, "SKILL.md"), "utf8");
      const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(text);
      expect(frontmatter).not.toBeNull();
      expect(parse(frontmatter![1]!)).toMatchObject({
        name,
        description: expect.any(String),
      });
    });
  }
});
