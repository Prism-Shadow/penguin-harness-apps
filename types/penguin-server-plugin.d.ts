// The workbench contract that `@prismshadow/penguin-server/plugin` resolves to inside a
// workbench. A PenguinHarness host renders it from its own interface table into
// `<workbench>/.harness/plugin.d.ts` when it first loads the workbench, then type-checks
// `index.ts` against it (strict, NodeNext, Node's own types) and refuses to load a workbench
// with errors; tsconfig.workbenches.json repeats those options. Nothing is published to npm, so
// `npm run typecheck` checks against this copy instead. When a workbench needs a host member
// that is missing here, add it as the harness declares it.

export interface WorkbenchRequest {
  method: string;
  /** Path below the workbench's `api/` mount, always starting with `/`. */
  path: string;
  query: Record<string, string>;
  /** Request headers with lower-case names. The app's own credentials are withheld. */
  headers: Record<string, string>;
  /** The parsed body of a JSON request; `null` otherwise. */
  body: unknown;
  /** The body as sent, when there is one and it is not JSON. */
  bytes?: Uint8Array;
}

export interface WorkbenchResponse {
  /** HTTP status; 200 when absent. */
  status?: number;
  /** A `content-type` makes the response something other than JSON. */
  headers?: Record<string, string>;
  /** JSON by default; with a `content-type` header, a string sent as written. */
  body?: unknown;
  /** A binary body; wins over `body`. */
  bytes?: Uint8Array;
  /** A body sent as it is produced; wins over `bytes` and `body`. */
  stream?: AsyncIterable<Uint8Array | string>;
}

export interface WorkbenchInput {
  text: string;
}

export interface WorkbenchResult {
  status: "running" | "completed" | "failed";
  text: string;
  error: string | null;
}

export interface WorkbenchRecord {
  /** ISO 8601 UTC. */
  timestamp: string;
  type: string;
  payload: { type?: string; [key: string]: unknown };
  origin?: string[];
}

export type WorkbenchApprovalMode = "allow-all" | "deny-all";

export type WorkbenchDataLevel = "agent" | "server" | "machine";

export interface WorkbenchDataPaths {
  dataDir: string;
  cacheDir: string;
  stateDir: string;
}

/** What a workbench provides as `main`. */
export interface WorkbenchMain {
  handle(request: WorkbenchRequest): Promise<WorkbenchResponse>;
}

/** What the host publishes into a workbench tree as module `Host`. */
export interface WorkbenchHost {
  listAgents(): { agentId: string }[];
  createSession(opts?: {
    agentId?: string;
    model?: { provider: string; modelId: string };
    approvalMode?: WorkbenchApprovalMode;
  }): Promise<{ sessionId: string }>;
  run(
    sessionId: string,
    input: WorkbenchInput[],
  ): Promise<{ sessionId: string; queued: boolean }>;
  sessionStatus(sessionId: string): string;
  sessionTitle(sessionId: string): string | null;
  sessionResult(sessionId: string): Promise<WorkbenchResult>;
  subscribe(
    sessionId: string,
    listener: (record: WorkbenchRecord) => void,
  ): () => void;
  dataPaths(level?: WorkbenchDataLevel): WorkbenchDataPaths;
  socketPath(name: string, level?: WorkbenchDataLevel): string;
  getState(): unknown;
  setState(state: unknown): Promise<void>;
  log(message: string): void;
}

export interface WorkbenchModuleCtx<Use> {
  use: Use;
  /** Runs when the tree is disposed (a reload, a removal, the platform going away). */
  effect(dispose: () => void): void;
}

export interface WorkbenchRootModule {
  create(ctx: WorkbenchModuleCtx<{ host: WorkbenchHost }>): {
    api: { main: WorkbenchMain } & Record<string, unknown>;
  };
}

/** Any other module of the package: what it uses is whatever its own manifest requires. */
export interface WorkbenchModule {
  create(ctx: WorkbenchModuleCtx<Record<string, unknown>>): {
    api?: Record<string, unknown>;
  };
}

/** The default export of index.ts: `export default { … } satisfies WorkbenchPackage`. */
export interface WorkbenchPackage {
  modules: {
    Workbench: WorkbenchRootModule;
    [name: string]: WorkbenchRootModule | WorkbenchModule;
  };
}
