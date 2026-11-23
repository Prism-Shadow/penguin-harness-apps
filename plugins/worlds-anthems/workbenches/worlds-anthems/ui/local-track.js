import { originalRecording } from "./originals.js";

// Keep the local channel on the same transport as the official streams.
export function openLocalTrack(id, onEvent) {
  const audio = new Audio();
  let closed = false;
  audio.preload = "auto";
  audio.onloadedmetadata = () => {
    onEvent("DURATION", audio.duration * 1000);
    onEvent("READY");
  };
  audio.ontimeupdate = () => onEvent("PLAY_PROGRESS", audio.currentTime * 1000);
  audio.onseeked = () => onEvent("SEEK", audio.currentTime * 1000);
  audio.onplaying = () => onEvent("PLAY");
  audio.onpause = () => {
    if (!audio.ended) onEvent("PAUSE");
  };
  audio.onended = () => onEvent("FINISH");
  audio.onerror = () => onEvent("ERROR");
  const src = URL.createObjectURL(originalRecording(id));
  audio.src = src;
  return {
    close() {
      closed = true;
      audio.onpause =
        audio.onended =
        audio.onerror =
        audio.onplaying =
        audio.onloadedmetadata =
        audio.ontimeupdate =
        audio.onseeked =
          null;
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      URL.revokeObjectURL(src);
    },
    send(method, value) {
      if (method === "play")
        void audio.play().catch(() => {
          if (!closed) onEvent("PLAY_REJECTED");
        });
      else if (method === "pause") audio.pause();
      else if (method === "seekTo") audio.currentTime = value / 1000;
      else if (method === "setVolume") audio.volume = value / 100;
    },
  };
}
