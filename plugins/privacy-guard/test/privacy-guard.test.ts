import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import workbench from "../workbenches/privacy_guard/index.ts";
import {
  getReferenceCaseReports,
  scanSingleMacApp,
} from "../workbenches/privacy_guard/scanner.ts";

type Handle = (req: {
  method: string;
  path: string;
  query: Record<string, string>;
  headers?: Record<string, string>;
  body?: unknown;
}) => Promise<{
  status?: number;
  headers?: Record<string, string>;
  body?: unknown;
}>;

const tempDirs: string[] = [];

afterEach(async () => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop()!;
    await rm(dir, { recursive: true, force: true });
  }
});

async function createMockAppBundle(options: {
  name: string;
  enableTelemetry?: boolean;
  dependencies?: Record<string, string>;
  codeSnippet?: string;
}): Promise<string> {
  const dir = await mkdtemp(path.join(tmpdir(), "privacy-guard-test-"));
  tempDirs.push(dir);
  const appPath = path.join(dir, `${options.name}.app`);
  const unpackedDir = path.join(appPath, "Contents/Resources/app");
  await mkdir(unpackedDir, { recursive: true });

  await writeFile(
    path.join(unpackedDir, "package.json"),
    JSON.stringify({
      name: options.name.toLowerCase(),
      version: "1.2.3",
      dependencies: options.dependencies ?? {},
      extraCode: options.codeSnippet ?? "",
    }),
  );

  if (options.enableTelemetry !== undefined) {
    await writeFile(
      path.join(unpackedDir, "product.json"),
      JSON.stringify({ enableTelemetry: options.enableTelemetry }),
    );
  }

  return appPath;
}

function openWorkbench() {
  let state: unknown = null;
  let nextSessionNum = 1;
  const sessionResults = new Map<
    string,
    { status: "running" | "completed" | "failed"; text: string; error?: string }
  >();
  const prompts: { sessionId: string; text: string }[] = [];

  const host = {
    getState: () => state,
    setState: async (next: unknown) => {
      state = structuredClone(next);
    },
    createSession: async () => {
      const sessionId = `session-${nextSessionNum++}`;
      sessionResults.set(sessionId, { status: "running", text: "" });
      return { sessionId };
    },
    run: async (sessionId: string, items: { text: string }[]) => {
      prompts.push({ sessionId, text: items.map((i) => i.text).join("\n") });
      return { sessionId, queued: false };
    },
    sessionResult: async (sessionId: string) => {
      return (
        sessionResults.get(sessionId) ?? {
          status: "completed",
          text: "Default analysis",
        }
      );
    },
  };

  const created = workbench.modules.Workbench.create({
    use: { host },
  } as never) as unknown as {
    api: { main: { handle: Handle } };
  };

  return {
    handle: (req: Parameters<Handle>[0]) => created.api.main.handle(req),
    getState: () => state,
    sessionResults,
    prompts,
  };
}

describe("Telemetry Inspector static bundle scanner and reference cases", () => {
  it("provides reference specimens covering telemetry and codebase exfiltration", () => {
    const refs = getReferenceCaseReports();
    expect(refs).toHaveLength(2);
    expect(refs[0].id).toBe("ref-case-telemetry");
    expect(refs[0].overallRisk).toBe("caution");
    expect(refs[1].id).toBe("ref-case-codebase");
    expect(refs[1].overallRisk).toBe("high");
    expect(refs[1].categories.codebaseExfil.level).toBe("high");
  });

  it("classifies a clean unpacked Electron app as safe", async () => {
    const appPath = await createMockAppBundle({
      name: "CleanNote",
      dependencies: { react: "^18.0.0" },
    });
    const report = await scanSingleMacApp(appPath, []);
    expect(report.name).toBe("CleanNote");
    expect(report.framework).toBe("Electron (Unpacked)");
    expect(report.overallRisk).toBe("safe");
    expect(report.categories.telemetry.level).toBe("safe");
    expect(report.categories.codebaseExfil.level).toBe("safe");
  });

  it("detects embedded telemetry SDKs and default enableTelemetry flags with host blocking rules", async () => {
    const appPath = await createMockAppBundle({
      name: "TrackedEditor",
      enableTelemetry: true,
      dependencies: {
        posthog: "^1.0.0",
        "@sentry/electron": "^4.0.0",
      },
    });
    const report = await scanSingleMacApp(appPath, []);
    expect(report.overallRisk).toBe("caution");
    expect(report.categories.telemetry.level).toBe("caution");
    expect(report.categories.telemetry.domains).toContain("us.i.posthog.com");
    expect(report.categories.telemetry.domains).toContain(
      "dc.services.visualstudio.com",
    );
    expect(report.remediation.hostsBlockRules).toContain(
      "0.0.0.0 us.i.posthog.com",
    );
  });

  it("flags codebase exfiltration and session upload patterns as high risk", async () => {
    const appPath = await createMockAppBundle({
      name: "SneakyCoder",
      dependencies: { keytar: "^7.9.0" },
      codeSnippet: "function uploadWorkspace() { returnconversation_sync(); }",
    });
    const report = await scanSingleMacApp(appPath, []);
    expect(report.overallRisk).toBe("high");
    expect(report.categories.codebaseExfil.level).toBe("high");
    expect(report.categories.sessionHistory.level).toBe("caution");
  });
});

describe("Telemetry Inspector workbench handler routes", () => {
  it("validates custom scan paths and persists scanned custom bundles", async () => {
    const wb = openWorkbench();

    const emptyRes = await wb.handle({
      method: "POST",
      path: "/scan-custom",
      query: {},
      body: { appPath: "   " },
    });
    expect(emptyRes.status).toBe(400);

    const missingRes = await wb.handle({
      method: "POST",
      path: "/scan-custom",
      query: {},
      body: { appPath: "/nonexistent/FakeApp.app" },
    });
    expect(missingRes.status).toBe(404);

    const customApp = await createMockAppBundle({
      name: "CustomStudio",
      enableTelemetry: true,
    });
    const scanRes = await wb.handle({
      method: "POST",
      path: "/scan-custom",
      query: {},
      body: { appPath: customApp },
    });
    const body = scanRes.body as { ok: boolean; report: { name: string } };
    expect(body.ok).toBe(true);
    expect(body.report.name).toBe("CustomStudio");
    expect(wb.getState()).toMatchObject({
      customAppPaths: [customApp],
    });
  });

  it("launches an AI audit session and reconciles its completed answer", async () => {
    const wb = openWorkbench();

    const missingAppId = await wb.handle({
      method: "POST",
      path: "/ai-audit",
      query: {},
      body: {},
    });
    expect(missingAppId.status).toBe(400);

    const startRes = await wb.handle({
      method: "POST",
      path: "/ai-audit",
      query: {},
      body: {
        appId: "ref-case-telemetry",
        question: "Can I block its domain safely?",
      },
    });
    const started = startRes.body as {
      ok: boolean;
      job: { id: string; sessionId: string; status: string };
    };
    expect(started.ok).toBe(true);
    expect(started.job.status).toBe("running");
    expect(wb.prompts[0].text).toContain("Can I block its domain safely?");

    wb.sessionResults.set(started.job.sessionId, {
      status: "completed",
      text: "You can safely block us.i.posthog.com in /etc/hosts.",
    });

    const pollRes = await wb.handle({
      method: "GET",
      path: "/ai-audit",
      query: {},
    });
    const polled = pollRes.body as {
      ok: boolean;
      jobs: { id: string; status: string; answer: string }[];
    };
    expect(polled.ok).toBe(true);
    expect(polled.jobs[0].status).toBe("completed");
    expect(polled.jobs[0].answer).toContain("us.i.posthog.com");
  });

  it("exports a Markdown inspection report with attachment headers", async () => {
    const wb = openWorkbench();
    const res = await wb.handle({
      method: "GET",
      path: "/export-report",
      query: {},
    });
    expect(res.status).toBe(200);
    expect(res.headers?.["content-type"]).toContain("text/markdown");
    expect(res.headers?.["content-disposition"]).toContain(
      "telemetry-inspector-report.md",
    );
    expect(String(res.body)).toContain("# macOS 遥测与外传检测报告");
  });
});
