// Northbound, an original eight-bar instrumental for the player's offline channel.
import { writeFile } from "node:fs/promises";
const sampleRate = 22050;
const beat = 60 / 112;
const bars = [
  [50, 57, 62, 65],
  [46, 53, 58, 62],
  [53, 60, 65, 69],
  [48, 55, 60, 64],
  [50, 57, 62, 65],
  [46, 53, 58, 62],
  [43, 55, 59, 62],
  [50, 57, 62, 65],
];
const lead = [
  [69, 72, 74, 77],
  [74, 72, 69, 65],
  [69, 72, 76, 79],
  [76, 72, 67, 64],
  [65, 69, 74, 81],
  [77, 74, 72, 70],
  [67, 71, 74, 77],
  [76, 74, 69, 62],
];
const length = Math.ceil((bars.length * 4 * beat + 1.3) * sampleRate);
const samples = new Float32Array(length);
function note(start, midi, duration, level, timbre) {
  const frequency = 440 * 2 ** ((midi - 69) / 12);
  const offset = Math.round(start * sampleRate);
  for (let i = 0; i < duration * sampleRate && offset + i < length; i++) {
    const t = i / sampleRate,
      phase = 2 * Math.PI * frequency * t;
    const envelope =
      Math.min(1, t / 0.014) *
      Math.min(1, (duration - t) / 0.09) *
      Math.exp(-t * timbre);
    samples[offset + i] +=
      level *
      envelope *
      (Math.sin(phase) +
        0.22 * Math.sin(phase * 2) +
        0.08 * Math.sin(phase * 3));
  }
}
for (const [bar, chord] of bars.entries()) {
  const start = bar * 4 * beat;
  note(start, chord[0] - 12, beat * 1.7, 0.22, 1.9);
  note(start + 2 * beat, chord[1] - 12, beat * 1.5, 0.18, 2);
  for (let n = 0; n < 8; n++)
    note(start + (n * beat) / 2, chord[n % 4], beat * 0.95, 0.07, 3.7);
  for (let n = 0; n < 4; n++) {
    const onset = start + [0, 0.75, 1.75, 3][n] * beat;
    const duration = beat * (bar === 7 && n === 3 ? 2.4 : 0.95);
    note(onset, lead[bar][n], duration, 0.21, 1.8);
    note(onset + 0.35 * beat, lead[bar][n], duration, 0.04, 2.5);
  }
}
const wav = Buffer.alloc(44 + samples.length * 2);
wav.write("RIFF");
wav.writeUInt32LE(wav.length - 8, 4);
wav.write("WAVEfmt ", 8);
wav.writeUInt32LE(16, 16);
wav.writeUInt16LE(1, 20);
wav.writeUInt16LE(1, 22);
wav.writeUInt32LE(sampleRate, 24);
wav.writeUInt32LE(sampleRate * 2, 28);
wav.writeUInt16LE(2, 32);
wav.writeUInt16LE(16, 34);
wav.write("data", 36);
wav.writeUInt32LE(wav.length - 44, 40);
for (const [i, value] of samples.entries())
  wav.writeInt16LE(Math.round(Math.tanh(value * 1.5) * 28000), 44 + i * 2);
await writeFile(
  new URL("../workbenches/worlds-anthems/ui/northbound.wav", import.meta.url),
  wav,
);
