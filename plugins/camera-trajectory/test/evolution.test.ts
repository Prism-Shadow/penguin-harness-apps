import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { expect, it } from "vitest";

type Round = {
  round: number;
  label: string;
  hypothesis: string;
  parent_variant: string;
  parent_commit: string;
  candidate_variant: string;
  parent_score: number;
  candidate_score: number;
  ATE: number;
  RotErr: number;
  RPE: number;
  latency: number;
  decision: "保留" | "淘汰";
  commit: string;
  split: string;
  clips: number;
};

const local = (path: string) => fileURLToPath(new URL(path, import.meta.url).href);

it("matches every evolution number to the parent and candidate scoreboard records", () => {
  const snapshot = readFileSync(local("./fixtures/scoreboard.csv"), "utf8");
  const workspace = local("../../../../runs/scoreboard.csv");
  if (existsSync(workspace)) {
    expect(readFileSync(workspace, "utf8").replaceAll("\r\n", "\n")).toBe(
      snapshot.replaceAll("\r\n", "\n"),
    );
  }
  const [header, ...lines] = snapshot.trimEnd().split(/\r?\n/);
  const fields = header.split(",");
  const scores = lines.map((line) =>
    Object.fromEntries(line.split(",").map((value, index) => [fields[index], value])),
  );
  const rounds: Round[] = JSON.parse(readFileSync(local("../docs/evolution.json"), "utf8"));
  const labels = [
    ...Array.from({ length: 5 }, (_, i) => `M4 第${i + 1}轮`),
    ...Array.from({ length: 5 }, (_, i) => `精度攻坚 第${i + 1}轮`),
    "冻结验收",
  ];
  expect(rounds.map((round) => round.label)).toEqual(labels);
  expect(rounds.slice(0, 5).filter((round) => round.decision === "淘汰")).toHaveLength(2);
  expect(rounds.filter((round) => round.split === "holdout")).toEqual([rounds.at(-1)]);

  for (const [index, round] of rounds.entries()) {
    expect(round.round).toBe(index + 1);
    expect(round.hypothesis).not.toBe("");
    const lookup = (variant: string, commit: string) => {
      const matches = scores.filter((row) =>
        row.variant === variant && row.git_sha === commit &&
        row.split === round.split && Number(row.clips) === round.clips,
      );
      expect(matches, round.label).toHaveLength(1);
      return matches[0];
    };
    const parent = lookup(round.parent_variant, round.parent_commit);
    const candidate = lookup(round.candidate_variant, round.commit);
    expect(round.parent_score).toBe(Number(parent.score));
    expect(round.candidate_score).toBe(Number(candidate.score));
    for (const key of ["ATE", "RotErr", "RPE", "latency"] as const) {
      expect(round[key], `${round.label} ${key}`).toBe(Number(candidate[key]));
    }
    expect(round.decision).toBe(round.candidate_score > round.parent_score ? "保留" : "淘汰");
  }
});
