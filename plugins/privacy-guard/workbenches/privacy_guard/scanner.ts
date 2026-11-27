import { execFile } from "node:child_process";
import {
  closeSync,
  existsSync,
  openSync,
  readdirSync,
  readFileSync,
  readSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export type RiskLevel = "safe" | "caution" | "high";

export interface EvidenceItem {
  category: "telemetry" | "session" | "codebase" | "network" | "permission";
  severity: RiskLevel;
  title: string;
  detail: string;
  source: string;
}

export interface CategoryVerdict {
  level: RiskLevel;
  statusText: string;
  summary: string;
  findings: string[];
  domains: string[];
}

export interface LiveConnection {
  pid: number;
  processName: string;
  protocol: string;
  localAddr: string;
  remoteAddr: string;
  state: string;
  bytesIn: number;
  bytesOut: number;
}

export interface AppScanReport {
  id: string;
  name: string;
  bundleId: string;
  version: string;
  appPath: string;
  category:
    | "ai_coding"
    | "browser_net"
    | "office_social"
    | "media_tool"
    | "system_other"
    | "reference_case";
  categoryLabel: string;
  framework:
    | "Electron (.asar)"
    | "Electron (Unpacked)"
    | "Native macOS"
    | "Reference Sample";
  isRunning: boolean;
  overallRisk: RiskLevel;
  riskScore: number;
  headline: string;
  plainExplanation: string;
  categories: {
    telemetry: CategoryVerdict;
    sessionHistory: CategoryVerdict;
    codebaseExfil: CategoryVerdict;
  };
  permissions: { key: string; label: string; description: string }[];
  liveNetwork: {
    activeConnections: LiveConnection[];
    totalBytesIn: number;
    totalBytesOut: number;
    openSensitiveFiles: string[];
  };
  evidences: EvidenceItem[];
  remediation: {
    canDisableInSettings: boolean;
    settingsGuide: string;
    hostsBlockRules: string[];
    terminalCommand: string;
  };
  scannedAt: string;
  isReferenceCase?: boolean;
}

const TELEMETRY_SDK_RULES: {
  pattern: RegExp;
  name: string;
  domain: string;
  desc: string;
}[] = [
  {
    pattern: /posthog/i,
    name: "PostHog Analytics",
    domain: "us.i.posthog.com",
    desc: "行为统计与事件遥测 SDK（记录点击、耗时与设备标识）",
  },
  {
    pattern: /@sentry\/|sentry\.io|Sentry\.framework/i,
    name: "Sentry Telemetry",
    domain: "o0.ingest.sentry.io",
    desc: "崩溃堆栈与运行状态自动上报组件",
  },
  {
    pattern: /mixpanel/i,
    name: "Mixpanel",
    domain: "api.mixpanel.com",
    desc: "用户点击与功能使用频次追踪组件",
  },
  {
    pattern: /amplitude/i,
    name: "Amplitude",
    domain: "api2.amplitude.com",
    desc: "产品埋点与用户行为分析 SDK",
  },
  {
    pattern: /segment/i,
    name: "Segment.io",
    domain: "api.segment.io",
    desc: "多渠道用户行为数据收集与转发网关",
  },
  {
    pattern: /tas-client|enableTelemetry|dc\.services\.visualstudio/i,
    name: "VS Code Telemetry & Experiment",
    domain: "dc.services.visualstudio.com",
    desc: "微软编辑器遥测与远端 A/B 实验配置上报服务",
  },
  {
    pattern: /appcenter\.ms|MSAppCenter|HockeySDK/i,
    name: "Microsoft AppCenter",
    domain: "in.appcenter.ms",
    desc: "客户端使用统计与崩溃收集服务",
  },
  {
    pattern: /datadog/i,
    name: "Datadog RUM",
    domain: "browser-intake-datadoghq.com",
    desc: "全链路日志与终端性能监控上报",
  },
  {
    pattern: /sensorsdata|SensorsAnalytics/i,
    name: "神策数据 (SensorsData)",
    domain: "track.sensorsdata.cn",
    desc: "客户端细粒度用户行为埋点组件",
  },
  {
    pattern: /bugly|CrashSight/i,
    name: "腾讯 Bugly 遥测",
    domain: "astat.bugly.qq.com",
    desc: "客户端异常、设备指纹与运行统计上报",
  },
  {
    pattern: /electron-updater|Sparkle\.framework/i,
    name: "后台自动更新与心跳检测",
    domain: "update.electronjs.org",
    desc: "定期向更新服务器发送当前版本与系统环境心跳",
  },
];

const PERMISSION_MAP: Record<string, string> = {
  NSMicrophoneUsageDescription: "麦克风录音权限",
  NSCameraUsageDescription: "摄像头拍摄权限",
  NSScreenCaptureUsageDescription: "屏幕录制与截屏权限",
  NSDesktopFolderUsageDescription: "访问「桌面」文件夹",
  NSDocumentsFolderUsageDescription: "访问「文稿」文件夹",
  NSDownloadsFolderUsageDescription: "访问「下载」文件夹",
  NSSystemAdministrationUsageDescription: "系统管理员提权权限",
  NSAppleEventsUsageDescription: "自动化控制其他应用 (AppleEvents)",
};

function readAsarMetadata(asarPath: string): {
  filesList: string[];
  pkgJson: Record<string, unknown> | null;
  sampleCodeStrings: string;
} {
  const filesList: string[] = [];
  let pkgJson: Record<string, unknown> | null = null;
  let sampleCodeStrings = "";

  // Case A: Running inside Electron (like PenguinHarness server) where .asar is mounted as a virtual directory
  try {
    const virtualPkgPath = path.join(asarPath, "package.json");
    if (existsSync(virtualPkgPath)) {
      const rawPkg = readFileSync(virtualPkgPath, "utf8");
      pkgJson = JSON.parse(rawPkg) as Record<string, unknown>;
      try {
        for (const entry of readdirSync(asarPath)) {
          filesList.push(entry);
        }
      } catch {
        /* ignore */
      }
      const mainRel =
        typeof pkgJson?.main === "string"
          ? pkgJson.main.replace(/^\.\//, "")
          : "dist/main.js";
      const virtualMain = path.join(asarPath, mainRel);
      if (existsSync(virtualMain)) {
        try {
          sampleCodeStrings = readFileSync(virtualMain, "utf8").slice(
            0,
            256 * 1024,
          );
        } catch {
          /* ignore */
        }
      }
      return { filesList, pkgJson, sampleCodeStrings };
    }
  } catch {
    // Fall through to binary .asar reader for plain Node.js
  }

  // Case B: Running in plain Node.js where .asar is a binary archive file
  let fd: number | null = null;
  try {
    fd = openSync(asarPath, "r");
    const pre = Buffer.alloc(16);
    readSync(fd, pre, 0, 16, 0);
    const headerSize = pre.readUInt32LE(4) + 8;
    const jsonLen = pre.readUInt32LE(12);
    if (jsonLen <= 0 || jsonLen > 30 * 1024 * 1024)
      return { filesList, pkgJson, sampleCodeStrings };
    const jsonBuf = Buffer.alloc(jsonLen);
    readSync(fd, jsonBuf, 0, jsonLen, 16);
    const header = JSON.parse(jsonBuf.toString("utf8")) as {
      files?: Record<string, unknown>;
    };

    const walk = (node: Record<string, unknown>, prefix = "", depth = 0) => {
      if (depth > 4 || filesList.length > 600) return;
      const files = node.files as
        Record<string, Record<string, unknown>> | undefined;
      if (!files) return;
      for (const [k, v] of Object.entries(files)) {
        const rel = prefix ? `${prefix}/${k}` : k;
        filesList.push(rel);
        if (v && typeof v === "object" && "files" in v) {
          walk(v, rel, depth + 1);
        }
      }
    };
    walk(header);

    const rootFiles = header.files as
      Record<string, { size?: number; offset?: string }> | undefined;
    const pkgEntry = rootFiles?.["package.json"];
    if (
      pkgEntry &&
      typeof pkgEntry.size === "number" &&
      pkgEntry.size < 512 * 1024 &&
      pkgEntry.offset !== undefined
    ) {
      const buf = Buffer.alloc(pkgEntry.size);
      readSync(fd, buf, 0, pkgEntry.size, headerSize + Number(pkgEntry.offset));
      pkgJson = JSON.parse(buf.toString("utf8")) as Record<string, unknown>;
    }

    const mainRel =
      typeof pkgJson?.main === "string"
        ? pkgJson.main.replace(/^\.\//, "")
        : "dist/main.js";
    const parts = mainRel.split("/").filter(Boolean);
    let cur: Record<string, unknown> | undefined = header;
    for (const p of parts) {
      const f = cur?.files as
        Record<string, Record<string, unknown>> | undefined;
      cur = f?.[p];
    }
    if (cur && typeof cur.size === "number" && cur.offset !== undefined) {
      const readLen = Math.min(cur.size, 256 * 1024);
      const buf = Buffer.alloc(readLen);
      readSync(fd, buf, 0, readLen, headerSize + Number(cur.offset));
      sampleCodeStrings = buf.toString("utf8");
    }
  } catch {
    // ignore malformed asar
  } finally {
    if (fd !== null) {
      try {
        closeSync(fd);
      } catch {
        /* ignore */
      }
    }
  }
  return { filesList, pkgJson, sampleCodeStrings };
}

export async function collectLiveNetworkAndTraffic(): Promise<{
  connections: LiveConnection[];
}> {
  const trafficMap = new Map<
    number,
    { bytesIn: number; bytesOut: number; procName: string }
  >();
  try {
    const { stdout } = await execFileAsync(
      "nettop",
      ["-P", "-L", "1", "-J", "bytes_in,bytes_out"],
      { timeout: 4000 },
    );
    for (const line of stdout.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith(",")) continue;
      const parts = trimmed.split(",");
      if (parts.length >= 3) {
        const procPid = parts[0] ?? "";
        const lastDot = procPid.lastIndexOf(".");
        if (lastDot > 0) {
          const procName = procPid.slice(0, lastDot);
          const pid = Number(procPid.slice(lastDot + 1));
          const bytesIn = Number(parts[1]) || 0;
          const bytesOut = Number(parts[2]) || 0;
          if (!Number.isNaN(pid)) {
            trafficMap.set(pid, { bytesIn, bytesOut, procName });
          }
        }
      }
    }
  } catch {
    // ignore
  }

  const connections: LiveConnection[] = [];
  try {
    const { stdout } = await execFileAsync("lsof", ["-i", "-n", "-P"], {
      timeout: 4000,
      maxBuffer: 4 * 1024 * 1024,
    });
    const lines = stdout.split("\n").slice(1);
    for (const line of lines) {
      if (!line.trim()) continue;
      const cols = line.trim().split(/\s+/);
      if (cols.length < 9) continue;
      const rawCmd = (cols[0] ?? "").replace(/\\x20/g, " ");
      const pid = Number(cols[1]);
      const proto = cols[7] ?? "TCP";
      const namePart = cols.slice(8).join(" ");
      if (namePart.includes("*:*")) continue;
      let localAddr = namePart;
      let remoteAddr = "本地监听";
      let state = "ACTIVE";
      const stateMatch = namePart.match(/\(([^)]+)\)$/);
      if (stateMatch) state = stateMatch[1] ?? "ACTIVE";
      const cleanAddr = namePart.replace(/\s*\([^)]+\)$/, "");
      if (cleanAddr.includes("->")) {
        const [l, r] = cleanAddr.split("->");
        localAddr = l ?? cleanAddr;
        remoteAddr = r ?? "";
      }
      const traffic = trafficMap.get(pid);
      connections.push({
        pid,
        processName: traffic?.procName || rawCmd,
        protocol: proto,
        localAddr,
        remoteAddr,
        state,
        bytesIn: traffic?.bytesIn ?? 0,
        bytesOut: traffic?.bytesOut ?? 0,
      });
    }
  } catch {
    // ignore
  }

  return { connections };
}

async function readPlistJson(
  plistPath: string,
): Promise<Record<string, unknown>> {
  if (!existsSync(plistPath)) return {};
  try {
    const { stdout } = await execFileAsync(
      "plutil",
      ["-convert", "json", "-o", "-", plistPath],
      { timeout: 2500 },
    );
    return JSON.parse(stdout) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function classifyAppCategory(
  name: string,
  bundleId: string,
): {
  category: AppScanReport["category"];
  categoryLabel: string;
} {
  const s = `${name} ${bundleId}`.toLowerCase();
  if (
    /code|cursor|harness|penguin|deepseek|chatgpt|claude|copilot|windsurf|zed|trae|t3|zcode|xcode|iterm|warp/.test(
      s,
    )
  ) {
    return { category: "ai_coding", categoryLabel: "AI 与编程工具" };
  }
  if (/chrome|safari|firefox|arc|edge|clash|surge|network|proxy|vpn/.test(s)) {
    return { category: "browser_net", categoryLabel: "浏览器与网络代理" };
  }
  if (
    /lark|feishu|wechat|qq|dingtalk|slack|tencentmeeting|wps|keynote|pages|numbers|office|notion/.test(
      s,
    )
  ) {
    return { category: "office_social", categoryLabel: "办公与社交通讯" };
  }
  if (/screen|video|imovie|garageband|capcut|obs|vlc|figma/.test(s)) {
    return { category: "media_tool", categoryLabel: "影音与创作工具" };
  }
  return { category: "system_other", categoryLabel: "桌面通用应用" };
}

export async function scanSingleMacApp(
  appPath: string,
  allConnections: LiveConnection[],
): Promise<AppScanReport> {
  const baseName = path.basename(appPath).replace(/\.app$/i, "");
  const plistPath = path.join(appPath, "Contents/Info.plist");
  const plist = await readPlistJson(plistPath);
  const bundleId =
    typeof plist.CFBundleIdentifier === "string"
      ? plist.CFBundleIdentifier
      : `local.app.${baseName.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
  const version =
    (typeof plist.CFBundleShortVersionString === "string" &&
      plist.CFBundleShortVersionString) ||
    (typeof plist.CFBundleVersion === "string" && plist.CFBundleVersion) ||
    "1.0";
  const executableName =
    typeof plist.CFBundleExecutable === "string"
      ? plist.CFBundleExecutable
      : baseName;

  const { category, categoryLabel } = classifyAppCategory(baseName, bundleId);

  // Check framework & static contents
  const resDir = path.join(appPath, "Contents/Resources");
  const frameworksDir = path.join(appPath, "Contents/Frameworks");
  const asarPath = path.join(resDir, "app.asar");
  const unpackedDir = path.join(resDir, "app");

  let framework: AppScanReport["framework"] = "Native macOS";
  let inspectCorpus = JSON.stringify(plist);
  let pkgJson: Record<string, unknown> | null = null;
  let productJson: Record<string, unknown> | null = null;

  if (existsSync(asarPath)) {
    framework = "Electron (.asar)";
    const meta = readAsarMetadata(asarPath);
    pkgJson = meta.pkgJson;
    inspectCorpus +=
      "\n" +
      meta.filesList.join("\n") +
      "\n" +
      JSON.stringify(meta.pkgJson || {}) +
      "\n" +
      meta.sampleCodeStrings;
  } else if (existsSync(unpackedDir)) {
    framework = "Electron (Unpacked)";
    const pkgFile = path.join(unpackedDir, "package.json");
    const prodFile = path.join(unpackedDir, "product.json");
    if (existsSync(pkgFile)) {
      try {
        pkgJson = JSON.parse(readFileSync(pkgFile, "utf8")) as Record<
          string,
          unknown
        >;
        inspectCorpus += "\n" + JSON.stringify(pkgJson);
      } catch {
        /* ignore */
      }
    }
    if (existsSync(prodFile)) {
      try {
        productJson = JSON.parse(readFileSync(prodFile, "utf8")) as Record<
          string,
          unknown
        >;
        inspectCorpus += "\n" + JSON.stringify(productJson);
      } catch {
        /* ignore */
      }
    }
  }

  if (existsSync(frameworksDir)) {
    try {
      const fwList = readdirSync(frameworksDir);
      inspectCorpus += "\n" + fwList.join("\n");
    } catch {
      /* ignore */
    }
  }

  // Permissions declared in Info.plist
  const permissions: { key: string; label: string; description: string }[] = [];
  for (const [k, label] of Object.entries(PERMISSION_MAP)) {
    if (typeof plist[k] === "string") {
      permissions.push({ key: k, label, description: String(plist[k]) });
    }
  }

  // Match live network connections
  const nameTokens = [
    baseName.toLowerCase(),
    executableName.toLowerCase(),
    baseName.split(/\s+/)[0]?.toLowerCase() ?? "",
  ].filter((t) => t.length >= 3);

  const matchedConns = allConnections.filter((c) => {
    const p = c.processName.toLowerCase();
    return nameTokens.some((tok) => p.includes(tok));
  });

  const isRunning = matchedConns.length > 0;
  const pids = Array.from(new Set(matchedConns.map((c) => c.pid)));
  let totalBytesIn = 0;
  let totalBytesOut = 0;
  const seenPid = new Set<number>();
  for (const c of matchedConns) {
    if (!seenPid.has(c.pid)) {
      seenPid.add(c.pid);
      totalBytesIn += c.bytesIn;
      totalBytesOut += c.bytesOut;
    }
  }

  // Evaluate Category 1: Telemetry & Analytics
  const evidences: EvidenceItem[] = [];
  const telemetryFindings: string[] = [];
  const telemetryDomains = new Set<string>();
  let telemetryLevel: RiskLevel = "safe";

  for (const rule of TELEMETRY_SDK_RULES) {
    if (rule.pattern.test(inspectCorpus)) {
      telemetryLevel = "caution";
      telemetryFindings.push(`检出 ${rule.name}：${rule.desc}`);
      telemetryDomains.add(rule.domain);
      evidences.push({
        category: "telemetry",
        severity: "caution",
        title: `发现内置遥测或统计组件：${rule.name}`,
        detail: `${rule.desc}（关联上报域名：${rule.domain}）`,
        source: framework.startsWith("Electron")
          ? `${path.basename(appPath)}/Contents/Resources`
          : `${path.basename(appPath)}/Contents/Frameworks`,
      });
    }
  }

  if (productJson && productJson.enableTelemetry === true) {
    telemetryLevel = "caution";
    telemetryFindings.push(
      "应用配置文件 product.json 中 enableTelemetry 默认设为 true（默认开启遥测）",
    );
    telemetryDomains.add("dc.services.visualstudio.com");
    evidences.push({
      category: "telemetry",
      severity: "caution",
      title: "默认开启遥测配置 (enableTelemetry: true)",
      detail:
        "在应用内置 product.json 中检测到默认启用遥测开关与实验分流配置 (aiConfig / tas-client)。",
      source: `${path.basename(appPath)}/Contents/Resources/app/product.json`,
    });
  }

  if (
    pkgJson &&
    typeof pkgJson.dshMandatoryUpdatePolicy === "object" &&
    pkgJson.dshMandatoryUpdatePolicy !== null
  ) {
    const policy = pkgJson.dshMandatoryUpdatePolicy as { origin?: string };
    if (policy.origin) {
      try {
        telemetryDomains.add(new URL(policy.origin).hostname);
      } catch {
        /* ignore */
      }
      telemetryFindings.push(`内置远端策略与更新检查源：${policy.origin}`);
      evidences.push({
        category: "telemetry",
        severity: "caution",
        title: "配置远端更新与在线策略源",
        detail: `应用 package.json 包含 dshMandatoryUpdatePolicy，启动时连接 ${policy.origin} 校验版本与会话策略。`,
        source: `${path.basename(appPath)}/Contents/Resources/app.asar -> package.json`,
      });
      if (telemetryLevel === "safe") telemetryLevel = "caution";
    }
  }

  // Evaluate Category 2: Session History Upload
  const sessionFindings: string[] = [];
  const sessionDomains = new Set<string>();
  let sessionLevel: RiskLevel = "safe";

  const isCloudChatApp = /chatgpt|lark|feishu|wechat|deepseek/i.test(
    `${baseName} ${bundleId}`,
  );
  if (isCloudChatApp) {
    sessionFindings.push(
      "该应用包含云端账号体系或在线对话服务，会话记录会按其产品机制同步至官方云端服务器",
    );
    if (/deepseek/i.test(baseName)) {
      sessionDomains.add("harness.deepseek.com");
    }
  }
  if (
    /conversation_sync|upload_session|telemetry\/prompt|recordConversation/i.test(
      inspectCorpus,
    )
  ) {
    sessionLevel = "caution";
    sessionFindings.push("在应用代码特征中检出会话历史同步/上报接口关键字");
    evidences.push({
      category: "session",
      severity: "caution",
      title: "检出会话同步接口特征",
      detail: "静态扫描发现会话记录同步或日志回传相关字段。",
      source: `${path.basename(appPath)}/Contents/Resources`,
    });
  }

  // Evaluate Category 3: Codebase & Sensitive File Exfiltration
  const codebaseFindings: string[] = [];
  const codebaseDomains = new Set<string>();
  let codebaseLevel: RiskLevel = "safe";

  const depsObj = (pkgJson?.dependencies ?? {}) as Record<string, unknown>;
  if ("keytar" in depsObj) {
    codebaseFindings.push(
      "调用系统钥匙串组件 (keytar)：可读取或写入 macOS 登录钥匙串中的凭证",
    );
    evidences.push({
      category: "codebase",
      severity: "caution",
      title: "内置 macOS 钥匙串访问模块 (keytar)",
      detail:
        "package.json 依赖中包含 keytar，允许直接读写系统 Keychain 存储的令牌或密码。",
      source: `${path.basename(appPath)}/Contents/Resources/app.asar -> package.json`,
    });
  }

  if (
    /codebase_index|uploadWorkspace|syncRepo|repo-upload/i.test(inspectCorpus)
  ) {
    codebaseLevel = "high";
    codebaseFindings.push("检测到工作区代码库索引或批量打包上传特征！");
    evidences.push({
      category: "codebase",
      severity: "high",
      title: "检测到代码库索引/打包上传接口特征",
      detail: "应用代码包中存在疑似扫描整个本地代码仓库并上传远端索引的逻辑。",
      source: `${path.basename(appPath)}/Contents/Resources`,
    });
  }

  // Live network & traffic check
  const externalConns = matchedConns.filter(
    (c) =>
      c.remoteAddr !== "本地监听" &&
      !c.remoteAddr.startsWith("127.0.0.1") &&
      !c.remoteAddr.startsWith("[::1]"),
  );
  if (externalConns.length > 0) {
    evidences.push({
      category: "network",
      severity: totalBytesOut > 20 * 1024 * 1024 ? "caution" : "safe",
      title: `当前存在 ${externalConns.length} 个活跃外部网络连接`,
      detail: `实时监测到进程 (PID: ${pids.join(", ")}) 正在连接外部地址，累计上传 ${(totalBytesOut / 1024 / 1024).toFixed(2)} MB，下载 ${(totalBytesIn / 1024 / 1024).toFixed(2)} MB。`,
      source: "macOS lsof -i & nettop 实时采样",
    });
  }

  // Compute overall risk
  const cLevel = codebaseLevel as RiskLevel;
  const sLevel = sessionLevel as RiskLevel;
  const tLevel = telemetryLevel as RiskLevel;
  let overallRisk: RiskLevel = "safe";
  if (cLevel === "high" || sLevel === "high") {
    overallRisk = "high";
  } else if (
    tLevel === "caution" ||
    sLevel === "caution" ||
    cLevel === "caution"
  ) {
    overallRisk = "caution";
  }

  let riskScore = 12;
  if (overallRisk === "caution") {
    riskScore = Math.min(
      68,
      35 +
        telemetryFindings.length * 8 +
        codebaseFindings.length * 10 +
        permissions.length * 3,
    );
  } else if (overallRisk === "high") {
    riskScore = 88;
  } else {
    riskScore = Math.max(5, 8 + permissions.length * 4);
  }

  const headline =
    overallRisk === "high"
      ? "高危预警：检测到疑似本地代码库或完整会话历史外传特征"
      : overallRisk === "caution"
        ? `发现 ${telemetryFindings.length} 项统计遥测/更新上报组件，未见本地代码库偷传`
        : "干净安心：未检出第三方统计遥测 SDK，也未发现代码库外传行为";

  const plainExplanation =
    overallRisk === "high"
      ? `「${baseName}」存在高风险数据外传特征（疑似上传完整会话或打包本地代码库），建议立即检查其目录授权并阻断可疑域名。`
      : overallRisk === "caution"
        ? `「${baseName}」属于第 1 类情况（上传统计数据）：应用内置了统计遥测或崩溃上报组件（${Array.from(telemetryDomains).slice(0, 2).join("、") || "基础遥测"}），用于统计软件运行状态，但未发现偷传你的本地代码库。如果你介意被统计，可按下方指南一键屏蔽。`
        : `我们对「${baseName}」进行了静态包解包与实时网络检查：未发现已知的第三方行为遥测 SDK，也未发现后台打包上传本地代码库或隐私会话的行为。`;

  const allDomains = Array.from(
    new Set([...telemetryDomains, ...sessionDomains, ...codebaseDomains]),
  );
  const hostsBlockRules = allDomains
    .filter((d) => !d.includes("deepseek.com") && !d.includes("electronjs.org"))
    .map((d) => `0.0.0.0 ${d}`);

  return {
    id: `app-${baseName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    name: baseName,
    bundleId,
    version,
    appPath,
    category,
    categoryLabel,
    framework,
    isRunning,
    overallRisk,
    riskScore,
    headline,
    plainExplanation,
    categories: {
      telemetry: {
        level: telemetryLevel,
        statusText:
          telemetryLevel === "safe"
            ? "未发现统计遥测组件"
            : `检出 ${telemetryFindings.length} 项统计/遥测特征`,
        summary:
          telemetryLevel === "safe"
            ? "应用包内未检出 PostHog、Sentry、Mixpanel 等常见第三方统计 SDK。"
            : "内置第三方统计、崩溃收集或远端实验配置组件（属于第 1 类统计遥测）。",
        findings: telemetryFindings.length
          ? telemetryFindings
          : ["静态扫描应用包与依赖清单，未命中已知遥测 SDK"],
        domains: Array.from(telemetryDomains),
      },
      sessionHistory: {
        level: sessionLevel,
        statusText:
          sessionLevel === "safe"
            ? isCloudChatApp
              ? "正常云端账号会话同步"
              : "未发现后台会话历史上传"
            : "发现会话日志回传特征",
        summary: isCloudChatApp
          ? "应用本身为云端对话/协作客户端，对话内容仅发往其官方服务接口。"
          : "未检测到后台读取本地会话数据库并偷传至第三方服务器的行为。",
        findings: sessionFindings.length
          ? sessionFindings
          : ["未检出未授权的本地对话记录上报逻辑"],
        domains: Array.from(sessionDomains),
      },
      codebaseExfil: {
        level: codebaseLevel,
        statusText:
          codebaseLevel === "safe"
            ? "未发现代码库打包上传"
            : "检出高危代码库扫描上传特征",
        summary:
          codebaseLevel === "safe"
            ? "未发现后台静默遍历、压缩或整库上传本地 Git 代码仓库的行为。"
            : "警告：发现自动扫描本地代码目录并向远端上传索引的行为！",
        findings: codebaseFindings.length
          ? codebaseFindings
          : ["未检出后台静默打包代码树或读取 .git / .ssh 密钥外传的代码特征"],
        domains: Array.from(codebaseDomains),
      },
    },
    permissions,
    liveNetwork: {
      activeConnections: matchedConns.slice(0, 25),
      totalBytesIn,
      totalBytesOut,
      openSensitiveFiles: [],
    },
    evidences,
    remediation: {
      canDisableInSettings: overallRisk !== "high",
      settingsGuide: /visual studio code/i.test(baseName)
        ? "打开 VS Code 设置 (⌘,)，搜索 telemetry.telemetryLevel，将其从 all 改为 off 即可彻底关闭微软遥测。"
        : overallRisk === "caution"
          ? "可在应用的「设置 / Preferences -> Privacy」中关闭诊断与使用数据上报；或者直接复制下方 Hosts 规则在系统层屏蔽其遥测域名。"
          : "当前应用表现良好，无需额外拦截配置。",
      hostsBlockRules,
      terminalCommand:
        hostsBlockRules.length > 0
          ? `sudo sh -c 'echo "${hostsBlockRules.join("\\n")}" >> /etc/hosts' && dscacheutil -flushcache`
          : `# 无需屏蔽域名，或使用系统防火墙查看状态：\n/usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate`,
    },
    scannedAt: new Date().toISOString(),
  };
}

export function getReferenceCaseReports(): AppScanReport[] {
  const now = new Date().toISOString();
  return [
    {
      id: "ref-case-telemetry",
      name: "典型样本 A（第 1 类：默认开启第三方统计遥测）",
      bundleId: "sample.telemetry.analytics.app",
      version: "0.4.2 (特征标本)",
      appPath:
        "[内置参考标本] 演示默认开启 PostHog / Sentry 统计遥测的客户端特征",
      category: "reference_case",
      categoryLabel: "典型风险标本",
      framework: "Reference Sample",
      isRunning: false,
      overallRisk: "caution",
      riskScore: 52,
      headline: "默认开启第三方统计遥测（PostHog），未上传本地代码库",
      plainExplanation:
        "这是第 1 类遥测的典型代表：应用默认开启了 PostHog 行为遥测，持续向第三方分析服务器上报功能点击、模型切换频次与设备环境信息，但未包含本地代码库整库打包。",
      categories: {
        telemetry: {
          level: "caution",
          statusText: "发现默认开启的统计遥测",
          summary:
            "内置 PostHog 与 Sentry 遥测 SDK，默认配置 telemetry.enabled = true。",
          findings: [
            "检测到 PostHog 埋点上报地址 us.i.posthog.com/batch",
            "首次启动自动生成持久化设备指纹 distinct_id",
            "自动上报每次提问的模型名称、Token 计数与界面点击事件",
          ],
          domains: ["us.i.posthog.com", "app.posthog.com"],
        },
        sessionHistory: {
          level: "safe",
          statusText: "仅上传会话元数据，未见完整对话正文外传",
          summary: "仅统计对话轮数与耗时，未向统计服务器发送具体 Prompt 原文。",
          findings: [
            "本地对话记录保存在本地库，未发现后台同步至非推理服务器的接口",
          ],
          domains: [],
        },
        codebaseExfil: {
          level: "safe",
          statusText: "未发现整库打包上传",
          summary: "仅在用户主动引用文件时将片段发往大模型接口。",
          findings: ["未检测到后台静默扫描或打包本地 Git 仓库的行为"],
          domains: [],
        },
      },
      permissions: [
        {
          key: "NSDesktopFolderUsageDescription",
          label: "访问工作区目录",
          description: "读取用户打开的项目文件夹",
        },
      ],
      liveNetwork: {
        activeConnections: [],
        totalBytesIn: 184320,
        totalBytesOut: 645120,
        openSensitiveFiles: [],
      },
      evidences: [
        {
          category: "telemetry",
          severity: "caution",
          title: "内置 PostHog 遥测 SDK 且默认激活",
          detail:
            "在打包产物中检出 posthog-js 初始化调用，默认 capture_pageview 与 autocapture 处于开启状态。",
          source: "app.asar -> dist/renderer/telemetry.js",
        },
      ],
      remediation: {
        canDisableInSettings: true,
        settingsGuide:
          "进入 Settings -> Privacy & Telemetry，关闭「Send anonymous usage data」，或通过下方 Hosts 规则直接阻断 PostHog 域名。",
        hostsBlockRules: [
          "0.0.0.0 us.i.posthog.com",
          "0.0.0.0 app.posthog.com",
        ],
        terminalCommand:
          "sudo sh -c 'echo \"0.0.0.0 us.i.posthog.com\" >> /etc/hosts' && dscacheutil -flushcache",
      },
      scannedAt: now,
      isReferenceCase: true,
    },
    {
      id: "ref-case-codebase",
      name: "典型样本 B（第 2/3 类：静默上传会话历史与本地代码库）",
      bundleId: "sample.codebase.exfil.harness",
      version: "1.1.0 (特征标本)",
      appPath:
        "[内置参考标本] 演示后台默认上传完整会话历史与打包本地代码库的客户端特征",
      category: "reference_case",
      categoryLabel: "典型风险标本",
      framework: "Reference Sample",
      isRunning: false,
      overallRisk: "high",
      riskScore: 94,
      headline: "高危：后台默认上传完整会话历史，并自动打包上传本地代码库",
      plainExplanation:
        "这是第 2、3 类高危外传行为的典型代表：不仅收集基础统计数据，还在后台默认将用户的完整多轮对话历史同步到云端，且在打开项目时静默遍历并打包整个本地代码仓库上传至远端服务器。",
      categories: {
        telemetry: {
          level: "caution",
          statusText: "开启全量设备与行为遥测",
          summary:
            "采集机器硬件指纹、Git 邮箱账号 (`git config user.email`) 与操作日志。",
          findings: [
            "启动时自动读取 ~/.gitconfig 中的姓名与企业邮箱作为用户标识",
            "高频发送心跳包与编辑器活动日志",
          ],
          domains: ["telemetry.vendor-cloud.example.com"],
        },
        sessionHistory: {
          level: "high",
          statusText: "高危：后台自动上传完整会话历史",
          summary:
            "默认开启云端会话同步与训练数据回传，所有历史 Prompt 与 AI 回复全文上传。",
          findings: [
            "检测到 /v1/conversations/sync 后台周期性全量同步本地 SQLite 会话库",
            "默认勾选「允许使用对话改进模型」，且隐藏在二级配置菜单深处",
          ],
          domains: ["sync.vendor-cloud.example.com"],
        },
        codebaseExfil: {
          level: "high",
          statusText: "高危：静默打包并上传整个本地代码库",
          summary:
            "打开文件夹后立即在后台扫描全量源码树、压缩分块并持续上传至远端存储。",
          findings: [
            "检测到 codebase-indexer 模块自动打包项目内所有源码文件 (.ts, .py, .go, .yaml)",
            "读取 .git/config 获取私有仓库远端 URL 与分支结构并一并上报",
            "后台上行流量在空闲状态下高达数十 MB",
          ],
          domains: [
            "indexer.vendor-cloud.example.com",
            "repo-upload.vendor-cloud.example.com",
          ],
        },
      },
      permissions: [
        {
          key: "NSDocumentsFolderUsageDescription",
          label: "访问全盘代码与文稿目录",
          description: "后台遍历项目目录与 Git 仓库配置",
        },
      ],
      liveNetwork: {
        activeConnections: [],
        totalBytesIn: 1420000,
        totalBytesOut: 48650000,
        openSensitiveFiles: ["~/.gitconfig", ".git/config"],
      },
      evidences: [
        {
          category: "codebase",
          severity: "high",
          title: "静默全量代码库打包上传 (Codebase Tar/Chunk Upload)",
          detail:
            "检出 uploadWorkspaceSnapshot() 与 archiveRepository() 逻辑，打开目录即后台遍历文件树并分片上传至远端对象存储。",
          source: "app.asar -> main/services/codebaseSyncService.js",
        },
        {
          category: "session",
          severity: "high",
          title: "本地会话历史数据库全量回传",
          detail:
            "检出后台定时任务读取 state.vscdb / chat_history.sqlite 并 POST 至 /api/v2/telemetry/sessions。",
          source: "app.asar -> main/services/sessionUploader.js",
        },
      ],
      remediation: {
        canDisableInSettings: false,
        settingsGuide:
          "此类默认上传代码库与会话历史的客户端建议立即停止在含有公司私有代码或密钥的目录中使用，并在系统防火墙中彻底阻断其出站连接，或卸载替换。",
        hostsBlockRules: [
          "0.0.0.0 telemetry.vendor-cloud.example.com",
          "0.0.0.0 sync.vendor-cloud.example.com",
          "0.0.0.0 indexer.vendor-cloud.example.com",
          "0.0.0.0 repo-upload.vendor-cloud.example.com",
        ],
        terminalCommand:
          "sudo /usr/libexec/ApplicationFirewall/socketfilterfw --blockapp /Applications/SuspiciousApp.app",
      },
      scannedAt: now,
      isReferenceCase: true,
    },
  ];
}

export async function scanAllInstalledApps(
  includeReferenceCases = true,
): Promise<{
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
}> {
  const { connections } = await collectLiveNetworkAndTraffic();
  const appDirs = ["/Applications", path.join(os.homedir(), "Applications")];
  const appPaths: string[] = [];

  for (const dir of appDirs) {
    if (!existsSync(dir)) continue;
    try {
      for (const entry of readdirSync(dir)) {
        if (entry.endsWith(".app")) {
          appPaths.push(path.join(dir, entry));
        }
      }
    } catch {
      // ignore
    }
  }

  const reports: AppScanReport[] = [];
  for (const p of appPaths) {
    try {
      const rep = await scanSingleMacApp(p, connections);
      reports.push(rep);
    } catch {
      // skip unreadable bundle
    }
  }

  // Sort: AI & coding tools first, then by riskScore desc
  reports.sort((a, b) => {
    const aAi = a.category === "ai_coding" ? 1 : 0;
    const bAi = b.category === "ai_coding" ? 1 : 0;
    if (aAi !== bAi) return bAi - aAi;
    return b.riskScore - a.riskScore;
  });

  const realCount = reports.length;
  const safeCount = reports.filter((r) => r.overallRisk === "safe").length;
  const cautionCount = reports.filter(
    (r) => r.overallRisk === "caution",
  ).length;
  const highCount = reports.filter((r) => r.overallRisk === "high").length;
  const runningCount = reports.filter((r) => r.isRunning).length;

  if (includeReferenceCases) {
    reports.push(...getReferenceCaseReports());
  }

  const externalConnections = connections
    .filter((c) => c.remoteAddr !== "本地监听")
    .sort((a, b) => b.bytesOut - a.bytesOut)
    .slice(0, 60);

  const uniquePidOut = new Map<number, number>();
  for (const c of connections) {
    if (!uniquePidOut.has(c.pid)) uniquePidOut.set(c.pid, c.bytesOut);
  }
  let totalBytesOut = 0;
  for (const v of uniquePidOut.values()) totalBytesOut += v;

  return {
    apps: reports,
    liveConnections: externalConnections,
    summary: {
      totalApps: realCount,
      safeCount,
      cautionCount,
      highCount,
      runningCount,
      totalBytesOut,
      scannedAt: new Date().toISOString(),
    },
  };
}
