// Save exactly the stereo sequence played by the Harbor Pulse sound-check button.
import { writeFile, mkdir } from "node:fs/promises";
import { soundCheck } from "../plugins/harbor-pulse/workbenches/harbor-pulse/ui/audio.js";
const rate = 44100,
  [left, right] = soundCheck(rate),
  bytes = left.length * 4;
const buf = Buffer.alloc(44 + bytes);
buf.write("RIFF", 0);
buf.writeUInt32LE(bytes + 36, 4);
buf.write("WAVEfmt ", 8);
buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(rate, 24);
buf.writeUInt32LE(rate * 4, 28);
buf.writeUInt16LE(4, 32);
buf.writeUInt16LE(16, 34);
buf.write("data", 36);
buf.writeUInt32LE(bytes, 40);
for (let i = 0; i < left.length; i++)
  for (const [ear, s] of [left[i], right[i]].entries())
    buf.writeInt16LE(
      Math.round(Math.max(-1, Math.min(1, s)) * 32767),
      44 + i * 4 + ear * 2,
    );
const out = new URL("../previews/harbor-pulse/", import.meta.url);
await mkdir(out, { recursive: true });
await writeFile(new URL("sound-check.wav", out), buf);
