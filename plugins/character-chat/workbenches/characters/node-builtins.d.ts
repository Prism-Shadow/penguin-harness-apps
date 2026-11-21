// These are the small Node built-ins used in the handler, including on a standalone host with no @types/node.
declare module "node:fs/promises" {
  type Stat = { isFile(): boolean; isDirectory(): boolean; size: number; mtimeMs: number };
  type Entry = { name: string; isFile(): boolean; isDirectory(): boolean };
  export function lstat(p: string): Promise<Stat>;
  export function readdir(p: string, opts: { withFileTypes: true }): Promise<Entry[]>;
  export function mkdir(p: string, opts: { recursive: true }): Promise<unknown>;
  export function readFile(p: string): Promise<Uint8Array>;
  export function writeFile(p: string, v: string | Uint8Array, opts?: { flag: string }): Promise<void>;
  export function mkdtemp(p: string): Promise<string>;
  export function rename(from: string, to: string): Promise<void>;
  export function unlink(p: string): Promise<void>;
  export function rm(p: string, opts: { recursive: true; force: true }): Promise<void>;
}
declare module "node:path" {
  export function join(...parts: string[]): string;
  export function resolve(...parts: string[]): string;
  export function dirname(p: string): string;
  export function basename(p: string): string;
}
declare module "node:url" {
  export function fileURLToPath(url: string): string;
}
