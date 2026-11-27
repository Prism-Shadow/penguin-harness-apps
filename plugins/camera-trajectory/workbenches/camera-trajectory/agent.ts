import { setTimeout as delay } from "node:timers/promises";
import type {
  WorkbenchHost,
  WorkbenchRecord,
} from "@prismshadow/penguin-server/plugin";

type AgentEvent = {
  kind:
    | "started"
    | "message"
    | "tool"
    | "toolFinished"
    | "finished"
    | "answer"
    | "error";
  text?: string;
};

export interface AgentProgress {
  sessionId?: string;
  events: AgentEvent[];
}

export type Command = [program: string, ...args: string[]];

export function cameraPrompt(task: {
  video: string;
  height: number;
  output: string;
  trajectory: string;
  blend?: string;
  maxFrames: number;
  track?: Command;
  verify: Command;
  export?: Command;
}): string {
  return [
    "完成工作台的 camera-trajectory 任务。请调用本机 exec_command 执行命令并检查结果。",
    JSON.stringify(task, null, 2),
    "命令数组的第一项是可执行文件，其余各项是独立的参数。按本机 shell 规则引用路径，工作目录为 output。",
    "依次执行提供的 track、verify、export，保留 Python 的 -B 参数。运行 track 时设置 CUDA_VISIBLE_DEVICES 为空，OPENBLAS_NUM_THREADS 和 OMP_NUM_THREADS 为 1。",
    "track 省略时复用现有 trajectory。verify 输出 JSON，只有成功且 frames 不超过 maxFrames 才继续执行 export。",
    "仅处理指定的本机路径。保持原视频和插件文件完整，不读取视频内容到模型、不上传文件、不安装软件、不改写工具。",
    "如果工具返回运行中的进程，等待它完成。全部命令成功后，简短回复 trajectory 和（若请求）blend 的实际路径。遇到失败时报告工具错误。",
  ].join("\n");
}

function append(progress: AgentProgress, event: AgentEvent) {
  progress.events.push({
    kind: event.kind,
    ...(event.text ? { text: event.text.slice(0, 1400) } : {}),
  });
  if (progress.events.length > 48) progress.events.shift();
}

function acceptRecord(progress: AgentProgress, record: WorkbenchRecord) {
  if (record.origin?.length) return;
  const p = record.payload;
  if (p.type === "task_begin") append(progress, { kind: "started" });
  if (
    p.type === "partial_text" &&
    p.event_type === "delta" &&
    typeof p.text === "string"
  ) {
    const last = progress.events.at(-1);
    if (last?.kind === "message")
      last.text = ((last.text ?? "") + p.text).slice(-1400);
    else append(progress, { kind: "message", text: p.text });
  }
  if (p.type === "tool_call" && typeof p.name === "string")
    append(progress, { kind: "tool", text: p.name.slice(0, 100) });
  if (p.type === "tool_call_output")
    append(progress, {
      kind: "toolFinished",
      text: typeof p.status === "string" ? p.status : undefined,
    });
  if (p.type === "task_end") append(progress, { kind: "finished" });
}

export async function runCameraSession(
  host: WorkbenchHost,
  progress: AgentProgress,
  prompt: string,
  onSession: (id: string) => Promise<void>,
  signal: AbortSignal,
) {
  signal.throwIfAborted();
  const { sessionId } = await host.createSession({ approvalMode: "allow-all" });
  progress.sessionId = sessionId;
  const unsubscribe = host.subscribe(sessionId, (record) =>
    acceptRecord(progress, record),
  );
  try {
    await onSession(sessionId);
    signal.throwIfAborted();
    await host.run(sessionId, [{ text: prompt }]);
    const deadline = Date.now() + 300_000;
    while (Date.now() < deadline) {
      signal.throwIfAborted();
      if (host.sessionStatus(sessionId) === "idle") {
        const result = await host.sessionResult(sessionId);
        if (result.status === "failed")
          throw new Error(result.error || "agent_failed");
        if (result.status === "completed") {
          append(progress, { kind: "answer", text: result.text });
          return;
        }
      }
      await delay(400, undefined, { signal });
    }
    throw new Error("agent_timeout");
  } catch (error) {
    append(progress, {
      kind: "error",
      text: error instanceof Error ? error.message : String(error),
    });
    throw error;
  } finally {
    unsubscribe();
  }
}
