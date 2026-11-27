import { existsSync } from "node:fs";
import type {
  WorkbenchPackage,
  WorkbenchResponse,
} from "@prismshadow/penguin-server/plugin";
import {
  collectLiveNetworkAndTraffic,
  scanAllInstalledApps,
  scanSingleMacApp,
  type AppScanReport,
  type LiveConnection,
} from "./scanner.js";

interface AiAuditJob {
  id: string;
  appId: string;
  appName: string;
  sessionId: string;
  status: "running" | "completed" | "failed";
  answer: string;
  error: string | null;
  createdAt: string;
}

interface PersistedWorkbenchState {
  customAppPaths: string[];
  auditJobs: AiAuditJob[];
}

function readPersistedState(raw: unknown): PersistedWorkbenchState {
  if (!raw || typeof raw !== "object") {
    return { customAppPaths: [], auditJobs: [] };
  }
  const obj = raw as Record<string, unknown>;
  return {
    customAppPaths: Array.isArray(obj.customAppPaths)
      ? obj.customAppPaths.filter((x): x is string => typeof x === "string")
      : [],
    auditJobs: Array.isArray(obj.auditJobs)
      ? (obj.auditJobs as AiAuditJob[])
      : [],
  };
}

export default {
  modules: {
    Workbench: {
      create({ use }) {
        const host = use.host;
        let cachedScan: {
          apps: AppScanReport[];
          liveConnections: LiveConnection[];
          summary: {
            totalApps: number;
            safeCount: number;
            cautionCount: number;
            highCount: number;
            runningCount: number;
            totalBytesOut: number;
            scannedAt: string;
          };
        } | null = null;

        async function runFullScan(): Promise<NonNullable<typeof cachedScan>> {
          const base = await scanAllInstalledApps(true);
          const state = readPersistedState(host.getState());
          for (const customPath of state.customAppPaths) {
            if (
              existsSync(customPath) &&
              !base.apps.some((a) => a.appPath === customPath)
            ) {
              try {
                const customReport = await scanSingleMacApp(
                  customPath,
                  base.liveConnections,
                );
                base.apps.unshift(customReport);
                base.summary.totalApps += 1;
                if (customReport.overallRisk === "safe")
                  base.summary.safeCount += 1;
                else if (customReport.overallRisk === "caution")
                  base.summary.cautionCount += 1;
                else base.summary.highCount += 1;
              } catch {
                // ignore unreadable custom path
              }
            }
          }
          cachedScan = base;
          return base;
        }

        async function reconcileAuditJobs(): Promise<AiAuditJob[]> {
          const state = readPersistedState(host.getState());
          let changed = false;
          for (const job of state.auditJobs) {
            if (job.status === "running" && job.sessionId) {
              try {
                const snap = await host.sessionResult(job.sessionId);
                if (snap.status === "completed") {
                  job.status = "completed";
                  job.answer = snap.text;
                  changed = true;
                } else if (snap.status === "failed") {
                  job.status = "failed";
                  job.error = snap.error || "分析会话执行失败";
                  changed = true;
                }
              } catch (err) {
                job.status = "failed";
                job.error =
                  err instanceof Error ? err.message : "无法读取会话状态";
                changed = true;
              }
            }
          }
          if (changed) {
            await host.setState(state);
          }
          return state.auditJobs;
        }

        return {
          api: {
            main: {
              async handle(req): Promise<WorkbenchResponse> {
                if (req.path === "/scan" && req.method === "GET") {
                  const forceRefresh = req.query.refresh === "1" || !cachedScan;
                  const data = forceRefresh ? await runFullScan() : cachedScan!;
                  const jobs = await reconcileAuditJobs();
                  return {
                    body: {
                      ok: true,
                      ...data,
                      auditJobs: jobs,
                    },
                  };
                }

                if (req.path === "/live-network" && req.method === "GET") {
                  const { connections } = await collectLiveNetworkAndTraffic();
                  const external = connections
                    .filter((c) => c.remoteAddr !== "本地监听")
                    .sort((a, b) => b.bytesOut - a.bytesOut)
                    .slice(0, 60);
                  return {
                    body: {
                      ok: true,
                      liveConnections: external,
                      sampledAt: new Date().toISOString(),
                    },
                  };
                }

                if (req.path === "/scan-custom" && req.method === "POST") {
                  const body = (req.body ?? {}) as { appPath?: string };
                  const rawPath = (body.appPath ?? "").trim();
                  if (!rawPath) {
                    return {
                      status: 400,
                      body: {
                        ok: false,
                        error:
                          "请输入有效的应用路径（例如 /Applications/xxx.app）",
                      },
                    };
                  }
                  if (!existsSync(rawPath)) {
                    return {
                      status: 404,
                      body: { ok: false, error: `找不到路径：${rawPath}` },
                    };
                  }
                  const { connections } = await collectLiveNetworkAndTraffic();
                  const report = await scanSingleMacApp(rawPath, connections);
                  const state = readPersistedState(host.getState());
                  if (!state.customAppPaths.includes(rawPath)) {
                    state.customAppPaths.unshift(rawPath);
                    await host.setState(state);
                  }
                  await runFullScan();
                  return {
                    body: {
                      ok: true,
                      report,
                    },
                  };
                }

                if (req.path === "/ai-audit" && req.method === "POST") {
                  const body = (req.body ?? {}) as {
                    appId?: string;
                    question?: string;
                  };
                  const appId = (body.appId ?? "").trim();
                  if (!appId) {
                    return {
                      status: 400,
                      body: { ok: false, error: "缺少 appId 参数" },
                    };
                  }
                  const scanData = cachedScan ?? (await runFullScan());
                  const app = scanData.apps.find((a) => a.id === appId);
                  if (!app) {
                    return {
                      status: 404,
                      body: { ok: false, error: "未找到对应的应用检测记录" },
                    };
                  }

                  const state = readPersistedState(host.getState());
                  const jobId = `audit-${Date.now()}`;
                  const prompt = [
                    `请用平实、通俗、小白友好的中文，为我解读以下 macOS 应用的隐私与遥测体检数据（不要使用生僻缩写，按「1. 统计数据遥测、2. 会话历史上传、3. 本地代码库上传」三类风险给出明确结论与具体操作建议）：`,
                    ``,
                    `- 应用名称：${app.name} (${app.bundleId}, 版本 ${app.version})`,
                    `- 应用路径：${app.appPath}`,
                    `- 打包框架：${app.framework}`,
                    `- 综合风险评级：${app.overallRisk} (风险分 ${app.riskScore}/100)`,
                    `- 第 1 类（统计数据遥测）：${app.categories.telemetry.statusText} | 发现：${app.categories.telemetry.findings.join("；")}`,
                    `- 第 2 类（会话历史上传）：${app.categories.sessionHistory.statusText} | 发现：${app.categories.sessionHistory.findings.join("；")}`,
                    `- 第 3 类（本地代码库上传）：${app.categories.codebaseExfil.statusText} | 发现：${app.categories.codebaseExfil.findings.join("；")}`,
                    `- 当前活跃外部连接数：${app.liveNetwork.activeConnections.length}，累计上传字节：${app.liveNetwork.totalBytesOut}`,
                    body.question ? `- 用户补充问题：${body.question}` : ``,
                    ``,
                    `请直接把完整的解读报告放在最终回复中。`,
                  ]
                    .filter(Boolean)
                    .join("\n");

                  try {
                    const { sessionId } = await host.createSession({
                      approvalMode: "deny-all",
                    });
                    const job: AiAuditJob = {
                      id: jobId,
                      appId: app.id,
                      appName: app.name,
                      sessionId,
                      status: "running",
                      answer: "",
                      error: null,
                      createdAt: new Date().toISOString(),
                    };
                    state.auditJobs.unshift(job);
                    await host.setState(state);
                    await host.run(sessionId, [{ text: prompt }]);
                    return { body: { ok: true, job } };
                  } catch (err) {
                    return {
                      status: 500,
                      body: {
                        ok: false,
                        error:
                          err instanceof Error
                            ? err.message
                            : "启动 AI 顾问会话失败",
                      },
                    };
                  }
                }

                if (req.path === "/ai-audit" && req.method === "GET") {
                  const jobs = await reconcileAuditJobs();
                  return { body: { ok: true, jobs } };
                }

                if (req.path === "/export-report" && req.method === "GET") {
                  const scanData = cachedScan ?? (await runFullScan());
                  const lines: string[] = [
                    `# macOS 遥测与外传检测报告 (Telemetry Inspector)`,
                    ``,
                    `- 生成时间：${scanData.summary.scannedAt}`,
                    `- 扫描本机应用总数：${scanData.summary.totalApps}`,
                    `- 绿灯（安心无额外遥测）：${scanData.summary.safeCount}`,
                    `- 黄灯（含统计数据遥测）：${scanData.summary.cautionCount}`,
                    `- 红灯（高危会话/代码库外传风险）：${scanData.summary.highCount}`,
                    ``,
                    `---`,
                    ``,
                  ];
                  for (const app of scanData.apps.filter(
                    (a) => !a.isReferenceCase,
                  )) {
                    const badge =
                      app.overallRisk === "high"
                        ? "[红灯·高危]"
                        : app.overallRisk === "caution"
                          ? "[黄灯·注意]"
                          : "[绿灯·安心]";
                    lines.push(`## ${badge} ${app.name} (${app.version})`);
                    lines.push(`- Bundle ID: \`${app.bundleId}\``);
                    lines.push(`- 路径: \`${app.appPath}\``);
                    lines.push(`- 架构: ${app.framework}`);
                    lines.push(`- 一句话结论: ${app.headline}`);
                    lines.push(
                      `- 1. 统计数据遥测: ${app.categories.telemetry.statusText} (${app.categories.telemetry.findings.join("；")})`,
                    );
                    lines.push(
                      `- 2. 会话历史上传: ${app.categories.sessionHistory.statusText} (${app.categories.sessionHistory.findings.join("；")})`,
                    );
                    lines.push(
                      `- 3. 本地代码库上传: ${app.categories.codebaseExfil.statusText} (${app.categories.codebaseExfil.findings.join("；")})`,
                    );
                    if (app.remediation.hostsBlockRules.length > 0) {
                      lines.push(
                        `- 建议屏蔽域名 (Hosts): \`${app.remediation.hostsBlockRules.join(" | ")}\``,
                      );
                    }
                    lines.push(``);
                  }
                  return {
                    status: 200,
                    headers: {
                      "content-type": "text/markdown; charset=utf-8",
                      "content-disposition":
                        'attachment; filename="telemetry-inspector-report.md"',
                    },
                    body: lines.join("\n"),
                  };
                }

                return {
                  status: 404,
                  body: { ok: false, error: "未找到对应的接口路径" },
                };
              },
            },
          },
        };
      },
    },
  },
} satisfies WorkbenchPackage;
