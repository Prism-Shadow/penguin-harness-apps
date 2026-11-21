// The original game keeps its mix, dynamics and instrument timing. Only its final
// audio output passes through this gain, so the workbench can silence every effect.
(() => {
  const outputs = new Map();
  let muted = false;
  let speech;
  const quiet = () => muted || document.hidden;
  const framed = window.parent !== window;

  function output(context) {
    // Offline contexts from the upstream sound checks have no playback device.
    if (typeof context.startRendering === "function") return context.destination;
    if (outputs.has(context)) return outputs.get(context);
    const gain = context.createGain();
    gain.gain.value = quiet() ? 0 : 1;
    gain.connect(context.destination);
    outputs.set(context, gain);
    context.addEventListener("statechange", () => {
      if (context.state === "closed") outputs.delete(context);
    });
    return gain;
  }

  function applyVolume() {
    for (const [context, node] of outputs) {
      const now = context.currentTime;
      const level = quiet() ? 0 : 1;
      // Avoid a discontinuity when a player toggles audio during a loud effect.
      if (node.gain.cancelAndHoldAtTime) node.gain.cancelAndHoldAtTime(now);
      else {
        node.gain.cancelScheduledValues(now);
        node.gain.setValueAtTime(node.gain.value, now);
      }
      node.gain.linearRampToValueAtTime(level, now + 0.016);
    }
    if (quiet() && speech) {
      speech.cancel();
      speech = undefined;
    }
  }

  function resumeAfterInput() {
    if (quiet()) return;
    for (const context of outputs.keys()) {
      if (context.state === "suspended" || context.state === "interrupted") {
        context.resume().catch(() => {});
      }
    }
  }

  let button;
  function setMuted(value) {
    muted = value;
    applyVolume();
    if (button) {
      const zh = button.lang === "zh";
      button.textContent = muted ? (zh ? "取消静音" : "Unmute") : (zh ? "静音" : "Mute");
      button.setAttribute("aria-pressed", String(muted));
    }
    if (framed) parent.postMessage({ type: "penguin.game-audio-state", muted }, "*");
  }

  window.penguinGameAudio = {
    output,
    speak(engine, utterance) {
      if (quiet()) return;
      speech = engine;
      engine.speak(utterance);
    },
  };
  document.addEventListener("visibilitychange", applyVolume);
  for (const event of ["pointerdown", "touchend", "keydown"]) {
    document.addEventListener(event, resumeAfterInput, { capture: true, passive: true });
  }
  if (framed) {
    window.addEventListener("message", ({ source, data }) => {
      if (source !== parent || data?.type !== "penguin.game-audio" || typeof data.muted !== "boolean") return;
      setMuted(data.muted);
    });
    parent.postMessage({ type: "penguin.game-audio-ready" }, "*");
  } else {
    window.addEventListener("DOMContentLoaded", () => {
      button = document.createElement("button");
      button.type = "button";
      const lang = new URLSearchParams(location.search).get("lang") || navigator.language;
      button.lang = /^zh\b/i.test(lang) ? "zh" : "en";
      button.style.cssText = "position:fixed;z-index:1000;top:max(10px,env(safe-area-inset-top));right:max(10px,env(safe-area-inset-right));font:600 14px system-ui;color:white;background:#172232;border:1px solid #8797ac;border-radius:8px;padding:8px 12px;min-height:38px;cursor:pointer";
      button.addEventListener("click", () => {
        setMuted(!muted);
        resumeAfterInput();
      });
      // The transport ship has separate menu, HUD and pause toolbars. Join the
      // active toolbar as a real flex item, including on narrow touch screens.
      if (window.penguinDeckPointer) {
        button.style.cssText = "position:static;flex:none;pointer-events:auto;font:600 13px system-ui;color:white;background:#172232;border:1px solid #8797ac;border-radius:6px;padding:5px 9px;min-height:32px;cursor:pointer";
        function dock() {
          const menu = document.querySelector("#menu"), pause = document.querySelector("#pause");
          const hud = document.querySelector("#clinks");
          if (!menu || !pause || !hud) return false;
          const row = !pause.classList.contains("hidden") ? document.querySelector("#btnResume")?.parentElement :
            !menu.classList.contains("hidden") ? menu.querySelector(".mlinks") : hud;
          if (row && button.parentNode !== row) row.append(button);
          return true;
        }
        function observeToolbars() {
          if (!dock()) return false;
          const state = new MutationObserver(dock);
          for (const panel of document.querySelectorAll("#menu, #pause")) state.observe(panel, { attributes: true, attributeFilter: ["class"] });
          return true;
        }
        if (!observeToolbars()) {
          const setup = new MutationObserver(() => { if (observeToolbars()) setup.disconnect(); });
          setup.observe(document.body, { childList: true, subtree: true });
        }
      } else document.body.append(button);
      setMuted(false);
    });
  }
})();
