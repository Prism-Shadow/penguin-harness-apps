// Original stereo arcade percussion. Dry body and edge first, then two differently
// filtered reflections. All game and sound-check buffers come from this same synthesizer.
function noise(seed) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 2147483648 - 1;
  };
}
export function shot(rate, seed, pan = 0) {
  const n = noise(seed),
    length = Math.ceil(rate * 0.48),
    dry = new Float32Array(length);
  const color = n(),
    base = 85 + color * 10,
    detune = 1 + n() * 0.12;
  let phase = 0,
    bassPhase = 0,
    low = 0,
    tail = 0,
    previous = 0;
  for (let i = 0; i < length; i++) {
    const t = i / rate,
      w = n();
    low += 0.24 * (w - low);
    tail += 0.055 * (w - tail);
    phase +=
      (2 * Math.PI * (base + 132 * Math.exp(-t / 0.022)) * detune) / rate;
    bassPhase += (2 * Math.PI * (48 + 18 * Math.exp(-t / 0.05))) / rate;
    const edge =
      (w - previous) * 0.43 * Math.exp(-t / 0.009) +
      low * 1.8 * Math.exp(-t / 0.042);
    const body =
      0.68 * Math.sin(phase) * Math.exp(-t / 0.041) +
      0.29 * Math.sin(bassPhase) * Math.exp(-t / 0.073);
    dry[i] = Math.tanh(
      (body + edge + tail * 0.35 * Math.exp(-t / 0.12)) *
        (1 - Math.exp(-t / 0.0006)) *
        1.4,
    );
    previous = w;
  }
  const stereo = [new Float32Array(length), new Float32Array(length)];
  for (let ear = 0; ear < 2; ear++) {
    const side = ear === 0 ? -1 : 1,
      direct = 0.59 + side * pan * 0.1;
    const near = Math.round(
      rate * (0.047 - side * (0.008 + pan * 0.004) + color * 0.002),
    );
    const far = Math.round(rate * (0.113 + side * 0.014)),
      late = Math.round(rate * (0.204 - side * 0.019));
    let wall = 0,
      water = 0;
    for (let i = 0; i < length; i++) {
      wall += 0.2 * ((dry[i - near] || 0) - wall);
      water += 0.08 * ((dry[i - far] || 0) - water);
      stereo[ear][i] =
        Math.tanh(
          direct * dry[i] +
            0.3 * wall +
            0.2 * water +
            0.08 * (dry[i - late] || 0),
        ) * 0.92;
    }
  }
  return stereo;
}
export function chime(rate, positive = true) {
  const length = Math.ceil(rate * 0.25),
    a = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    const t = i / rate;
    a[i] =
      0.18 *
        Math.sin(2 * Math.PI * (positive ? 580 : 160) * t) *
        Math.exp(-t / 0.043) +
      (t > 0.052 && positive
        ? 0.14 *
          Math.sin(2 * Math.PI * 870 * (t - 0.052)) *
          Math.exp(-(t - 0.052) / 0.055)
        : 0);
  }
  return [a, a];
}
export function soundCheck(rate) {
  const output = [
    new Float32Array(Math.ceil(1.75 * rate)),
    new Float32Array(Math.ceil(1.75 * rate)),
  ];
  const events = [
    [0, shot(rate, 118, -0.35)],
    [0.41, shot(rate, 230, 0.4)],
    [0.77, shot(rate, 86, -0.18)],
    [0.94, shot(rate, 450, 0.55)],
    [1.04, chime(rate)],
  ];
  for (const [time, tracks] of events) {
    const start = Math.round(time * rate);
    tracks.forEach((samples, ear) => {
      for (let i = 0; i < samples.length && i + start < output[ear].length; i++)
        output[ear][start + i] += samples[i];
    });
  }
  return output;
}
function play(ctx, channels) {
  const buffer = ctx.createBuffer(2, channels[0].length, ctx.sampleRate);
  channels.forEach((samples, i) => buffer.copyToChannel(samples, i));
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start();
  source.onended = () => source.disconnect();
}
let sequence = 28;
export function sound(ctx, type, pan = 0) {
  if (type === "shot") play(ctx, shot(ctx.sampleRate, ++sequence * 7919, pan));
  else play(ctx, chime(ctx.sampleRate, type === "score"));
}
export function preview(ctx) {
  play(ctx, soundCheck(ctx.sampleRate));
}
