// On a steel map the original two-part footstep rings twice for every actor.
// Retain its spatial voices, original impact envelopes and effects faders. Replace
// the pitched ringing layer of everyday movement/contacts with short noise.
(() => {
  const installed = new WeakSet();
  const textures = {
    playFootstep:   { band: 680,  decay: 0.013, level: 0.50 },
    playJump:       { band: 950,  decay: 0.012, level: 0.40 },
    playLand:       { band: 620,  decay: 0.022, level: 0.55 },
    playDeath:      { band: 920,  decay: 0.014, level: 0.42 },
    playImpact:     { band: 1450, decay: 0.019, level: 0.70 },
    playShellDrop:  { band: 1800, decay: 0.010, level: 0.42 },
    playHitmarker:  { band: 2150, decay: 0.023, level: 0.95 },
  };
  window.penguinDeckSurfaces = function (engine) {
    if (installed.has(engine)) return;
    installed.add(engine);
    let contact;
    for (const [event, texture] of Object.entries(textures)) {
      const play = engine[event];
      engine[event] = function (...args) {
        const last = contact;
        contact = texture;
        try { return play.apply(this, args); }
        finally { contact = last; }
      };
    }
    const metal = engine._metal;
    engine._metal = function (voice, time, frequency, gain, partials, output) {
      if (!contact) return metal.call(this, voice, time, frequency, gain, partials, output);
      const band = contact.band * (0.88 + Math.random() * 0.24);
      this._nz(voice, time, { n: "pink", a: 0.001, dur: contact.decay,
        g: gain * contact.level, flt: [{ t: "bandpass", f: band, q: 0.65 }], to: output });
    };
  };
})();
