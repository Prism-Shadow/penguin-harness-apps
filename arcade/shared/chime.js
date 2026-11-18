export function sound(ctx, name, pan = 0) {
  const tune =
    name === "score"
      ? [590, 885]
      : name === "jump"
        ? [270, 446]
        : name === "boost"
          ? [220, 330, 550]
          : [125, 78];
  const now = ctx.currentTime,
    panner = ctx.createStereoPanner();
  panner.pan.value = pan;
  panner.connect(ctx.destination);
  tune.forEach((hz, i) => {
    const t = now + i * 0.065,
      osc = ctx.createOscillator(),
      gain = ctx.createGain();
    osc.type = name === "bump" ? "triangle" : "sine";
    osc.frequency.setValueAtTime(hz, t);
    osc.frequency.exponentialRampToValueAtTime(hz * 1.1, t + 0.085);
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.exponentialRampToValueAtTime(0.13, t + 0.007);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
    osc.connect(gain);
    gain.connect(panner);
    osc.start(t);
    osc.stop(t + 0.14);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
      if (i === tune.length - 1) panner.disconnect();
    };
  });
}
