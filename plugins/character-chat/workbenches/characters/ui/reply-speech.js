// The UI is served beneath the Agent's workbench in its Project, including on a paired machine.
const endpoint = new URL("../../../../../multimodal-tools/t2s/audio", import.meta.url);

export function replySpeech(strings, icon) {
  let active = null;
  const rows = new Map();

  function draw(key) {
    const row = rows.get(key);
    if (!row) return;
    const state = active?.key === key ? active.phase : "idle";
    const s = strings();
    const [glyph, label] =
      state === "loading"
        ? ["stop", s.cancelSpeech]
        : state === "playing"
          ? ["pause", s.pauseSpeech]
          : state === "paused" || state === "ready"
            ? ["aloud", s.playSpeech]
            : ["aloud", s.readAloud];
    row.play.innerHTML = icon(glyph);
    row.play.title = label;
    row.play.setAttribute("aria-label", label);
    row.stop.hidden = !["playing", "paused", "ready"].includes(state);
    row.stop.title = s.stop;
    row.stop.setAttribute("aria-label", s.stop);
    row.note.textContent =
      state === "error" ? s[active.error] : state === "loading" ? s.preparingSpeech : "";
  }

  function stop() {
    if (!active) return;
    const previous = active;
    active = null;
    previous.controller.abort();
    if (previous.audio) {
      previous.audio.onended = previous.audio.onerror = null;
      previous.audio.pause();
      previous.audio.removeAttribute("src");
      previous.audio.load();
    }
    if (previous.url) URL.revokeObjectURL(previous.url);
    draw(previous.key);
  }

  async function play(request) {
    try {
      await request.audio.play();
      if (active !== request) return;
      request.phase = "playing";
    } catch (error) {
      if (active !== request) return;
      if (error.name === "NotAllowedError") request.phase = "ready";
      else {
        request.phase = "error";
        request.error = "speechFailed";
      }
    }
    draw(request.key);
  }

  async function activate(key, text) {
    if (active?.key === key) {
      if (active.phase === "loading") return stop();
      if (active.phase === "playing") {
        active.audio.pause();
        active.phase = "paused";
        return draw(key);
      }
      if (active.phase === "paused" || active.phase === "ready") return play(active);
    }
    stop();
    const request = {
      key,
      phase: "loading",
      controller: new AbortController(),
      error: "speechFailed",
    };
    active = request;
    draw(key);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text }),
        signal: request.controller.signal,
      });
      if (!response.ok) {
        const code = (await response.json().catch(() => null))?.error?.code;
        if (code === "model_unbound") request.error = "speechUnbound";
        else if (response.status === 401 || response.status === 403) request.error = "speechDenied";
        else if (response.status === 404 || response.status === 405)
          request.error = "speechUnavailable";
        throw new Error("Speech unavailable");
      }
      if (!response.headers.get("content-type")?.startsWith("audio/")) {
        request.error = "speechUnavailable";
        throw new Error("Expected audio");
      }
      const blob = await response.blob();
      if (active !== request) return;
      request.url = URL.createObjectURL(blob);
      request.audio = new Audio(request.url);
      request.audio.onended = () => {
        if (active === request) {
          request.audio.currentTime = 0;
          request.phase = "ready";
          draw(key);
        }
      };
      request.audio.onerror = () => {
        if (active === request) {
          request.phase = "error";
          draw(key);
        }
      };
      await play(request);
    } catch {
      if (active !== request) return;
      request.phase = "error";
      draw(key);
    }
  }

  return {
    stop,
    clearRows: () => rows.clear(),
    mount(container, key, text) {
      const playButton = document.createElement("button");
      const stopButton = document.createElement("button");
      for (const button of [playButton, stopButton]) {
        button.type = "button";
        button.className = "cc-icon";
      }
      stopButton.innerHTML = icon("stop");
      playButton.onclick = () => void activate(key, text);
      stopButton.onclick = stop;
      const note = document.createElement("span");
      note.setAttribute("role", "status");
      const actions = document.createElement("div");
      actions.className = "cc-reply-speech";
      actions.append(playButton, stopButton, note);
      container.append(actions);
      rows.set(key, { play: playButton, stop: stopButton, note });
      draw(key);
    },
  };
}
