// A short stereo room accent for the player's own arcade effects. Keep it upstream
// of the original effects fader and limiter, independent of the game simulation.
(() => {
  const buffers = new WeakMap();
  let next = 0;

  function makeAccent(context, variant) {
    const duration = 0.23;
    const rate = context.sampleRate;
    const buffer = context.createBuffer(2, Math.ceil(duration * rate), rate);
    const channels = [buffer.getChannelData(0), buffer.getChannelData(1)];
    const first = 0.030 + variant * 0.002;
    const second = 0.072 - variant * 0.002;
    let seed = 176112 + variant;
    let mid = 0;
    let bass = 0;
    for (let i = 0; i < buffer.length; i++) {
      const t = i / rate;
      seed = (1664525 * seed + 1013904223) >>> 0;
      const noise = seed / 2147483648 - 1;
      mid += 0.2 * (noise - mid);
      bass += 0.032 * (mid - bass);
      const ramp = Math.min(1, t / 0.0014);
      const dry = ramp * (mid * Math.exp(-t * 75) * 1.2 + bass * Math.exp(-t * 35) * 2.4);
      for (let ch = 0; ch < 2; ch++) {
        const delay = ch ? second : first;
        const wetTime = t - delay;
        const wet = wetTime > 0 ? mid * Math.min(1, wetTime / 0.003) * Math.exp(-wetTime * 29) * 0.7 : 0;
        channels[ch][i] = dry + wet;
      }
    }
    return buffer;
  }

  window.penguinDeckImpact = (context, mix) => {
    if (!context || !mix || context.state === "closed") return;
    let bank = buffers.get(context);
    if (!bank) {
      bank = [0, 1, 2].map(variant => makeAccent(context, variant));
      buffers.set(context, bank);
    }
    const hit = context.createBufferSource();
    hit.buffer = bank[next++ % bank.length];
    hit.playbackRate.value = 0.97 + Math.random() * 0.06;
    hit.connect(mix);
    hit.onended = () => hit.disconnect();
    hit.start();
  };
})();
