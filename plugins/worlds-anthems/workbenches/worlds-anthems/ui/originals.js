// Original instrumental scores and deterministic PCM synthesis for the offline channel.
const sampleRate = 22050;
const northboundChords = [
  [50, 57, 62, 65],
  [46, 53, 58, 62],
  [53, 60, 65, 69],
  [48, 55, 60, 64],
  [50, 57, 62, 65],
  [46, 53, 58, 62],
  [43, 55, 59, 62],
  [50, 57, 62, 65],
];
const northboundLead = [
  [69, 72, 74, 77],
  [74, 72, 69, 65],
  [69, 72, 76, 79],
  [76, 72, 67, 64],
  [65, 69, 74, 81],
  [77, 74, 72, 70],
  [67, 71, 74, 77],
  [76, 74, 69, 62],
];

const scores = {
  northbound: { tempo: 112, chords: northboundChords, lead: northboundLead },
  afterglow: {
    tempo: 94,
    chords: [
      [55, 62, 67, 71],
      [52, 59, 64, 67],
      [48, 55, 60, 64],
      [50, 57, 62, 66],
      [55, 62, 67, 71],
      [57, 64, 69, 72],
      [48, 55, 60, 64],
      [55, 62, 67, 71],
    ],
    lead: [
      [74, 71, 69, 67],
      [71, 74, 76, 79],
      [76, 72, 67, 64],
      [69, 74, 78, 76],
      [74, 79, 78, 74],
      [76, 72, 69, 64],
      [67, 72, 76, 74],
      [71, 69, 67, 67],
    ],
  },
};
const rendered = new Map();

export function originalRecording(id) {
  if (rendered.has(id)) return rendered.get(id);
  const { tempo, chords: bars, lead } = scores[id];
  const beat = 60 / tempo;
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

  const header = new ArrayBuffer(44);
  const fields = new DataView(header);
  const text = new Uint8Array(header);
  function tag(name, offset) {
    for (let i = 0; i < name.length; i++) text[offset + i] = name.charCodeAt(i);
  }
  tag("RIFF", 0);
  fields.setUint32(4, 36 + length * 2, true);
  tag("WAVEfmt ", 8);
  fields.setUint32(16, 16, true);
  fields.setUint16(20, 1, true);
  fields.setUint16(22, 1, true);
  fields.setUint32(24, sampleRate, true);
  fields.setUint32(28, sampleRate * 2, true);
  fields.setUint16(32, 2, true);
  fields.setUint16(34, 16, true);
  tag("data", 36);
  fields.setUint32(40, length * 2, true);
  const pcm = new DataView(new ArrayBuffer(length * 2));
  for (let i = 0; i < length; i++)
    pcm.setInt16(i * 2, Math.round(Math.tanh(samples[i] * 1.5) * 28000), true);
  const recording = new Blob([header, pcm.buffer], { type: "audio/wav" });
  rendered.set(id, recording);
  return recording;
}
