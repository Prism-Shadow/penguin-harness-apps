// This page runs on an opaque data: origin. The publisher's script can drive its
// visible iframe without sharing the authenticated PenguinHarness app's origin.
function startWidget(src) {
  const frame = document.querySelector("iframe");
  const emit = (type, value) =>
    parent.postMessage({ channel: "worlds-widget", type, value }, "*");
  frame.src = src;
  const script = document.createElement("script");
  script.src = "https://w.soundcloud.com/player/api.js";
  script.onerror = () => emit("ERROR");
  script.onload = () => {
    const Widget = window.SC?.Widget;
    if (!Widget) {
      emit("ERROR");
      return;
    }
    const player = Widget(frame);
    for (const event of [
      "READY",
      "PLAY",
      "PAUSE",
      "FINISH",
      "ERROR",
      "PLAY_PROGRESS",
      "SEEK",
    ]) {
      player.bind(Widget.Events[event], (data) => {
        emit(event, data?.currentPosition);
        if (event === "READY") player.getDuration((ms) => emit("DURATION", ms));
      });
    }
    window.addEventListener("message", (event) => {
      if (event.source !== parent || event.data?.channel !== "worlds-control")
        return;
      const { method, value } = event.data;
      if (method === "play") player.play();
      else if (method === "pause") player.pause();
      else if (method === "setVolume" && Number.isFinite(value))
        player.setVolume(Math.max(0, Math.min(100, value)));
      else if (method === "seekTo" && Number.isFinite(value))
        player.seekTo(Math.max(0, value));
    });
  };
  document.head.append(script);
}

export function openWidget(frame, url, onEvent) {
  const receive = (event) => {
    if (
      event.origin === "null" &&
      event.source === frame.contentWindow &&
      event.data?.channel === "worlds-widget"
    )
      onEvent(event.data.type, event.data.value);
  };
  window.addEventListener("message", receive);
  frame.setAttribute("sandbox", "allow-scripts allow-same-origin allow-popups");
  frame.allow = "autoplay; encrypted-media";
  const html =
    '<!doctype html><meta charset="utf-8"><meta name="referrer" content="no-referrer"><style>html,body,iframe{margin:0;border:0;display:block;width:100%;height:100%}</style><iframe title="SoundCloud" allow="autoplay; encrypted-media"></iframe><script>(' +
    startWidget.toString() +
    ")(" +
    JSON.stringify(url).replaceAll("<", "\\u003c") +
    ")</script>";
  frame.src = "data:text/html;charset=utf-8," + encodeURIComponent(html);
  return {
    close: () => window.removeEventListener("message", receive),
    send: (method, value) =>
      frame.contentWindow?.postMessage(
        { channel: "worlds-control", method, value },
        "*",
      ),
  };
}
