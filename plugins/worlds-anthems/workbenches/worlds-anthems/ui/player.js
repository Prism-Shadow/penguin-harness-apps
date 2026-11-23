import { tracks, trackUrl, playerUrl } from "./tracks.js";
import { openLocalTrack } from "./local-track.js";
import { openWidget } from "./widget.js";

const $ = (id) => document.getElementById(id);
let hostLanguage = "";
try {
  hostLanguage = window.parent.document.documentElement.lang;
} catch {}
const zh = (
  new URLSearchParams(location.search).get("lang") ||
  hostLanguage ||
  navigator.language
).startsWith("zh");
document.documentElement.lang = zh ? "zh-CN" : "en";
const labels = zh
  ? {
      title: "全球总决赛主题曲",
      list: "历届曲目",
      loading: "正在连接 SoundCloud…",
      ready: "可以播放",
      playing: "正在播放",
      paused: "已暂停",
      ended: "播放结束",
      waiting: "正在请求播放…",
      failed: "内嵌播放不可用。可在 SoundCloud 打开曲目。",
      slow: "播放器尚未响应。可前往 SoundCloud 或选择下方的离线原创曲目。",
      previous: "上一首",
      next: "下一首",
      play: "播放",
      pause: "暂停",
      mute: "静音",
      unmute: "取消静音",
      volume: "音量",
      seek: "播放进度",
      edition: "2020 年改编版",
      link: "在 SoundCloud 打开",
    }
  : {
      title: "Worlds Anthems",
      list: "Season playlist",
      loading: "Connecting to SoundCloud…",
      ready: "Ready",
      playing: "Playing",
      paused: "Paused",
      ended: "Finished",
      waiting: "Requesting playback…",
      failed: "Embedding is unavailable. Open this track on SoundCloud.",
      slow: "The player has not responded. Open SoundCloud or select the offline original below.",
      previous: "Previous track",
      next: "Next track",
      play: "Play",
      pause: "Pause",
      mute: "Mute",
      unmute: "Unmute",
      volume: "Volume",
      seek: "Playback position",
      edition: "2020 arrangement",
      link: "Open on SoundCloud",
    };
document.title = labels.title;
document.querySelector("h1").textContent = labels.title;
$("playlist-title").textContent = labels.list;
for (const id of ["previous", "next", "volume", "seek"])
  $(id).setAttribute("aria-label", labels[id]);
$("origin").setAttribute("aria-label", labels.link);
const local = {
  name: "Northbound",
  artist: "PenguinHarness",
  year: "2026",
  season: zh ? "原创" : "Original",
  shade: "#87c5b6",
  recording: "northbound",
};
const library = [
  ...tracks,
  local,
  { ...local, name: "Afterglow", shade: "#e7af8b", recording: "afterglow" },
];
let repeat = false;
$("repeat").textContent = zh ? "循环列表" : "Repeat playlist";
$("repeat").onclick = () => {
  repeat = !repeat;
  $("repeat").setAttribute("aria-pressed", String(repeat));
};
$("offline-title").textContent = zh ? "离线原创" : "Offline original";

let choice = 0,
  ready = false,
  playing = false,
  duration = 0,
  volume = 70,
  lastVolume = 70;
let widget = null,
  timer,
  dragging = false,
  pendingSeek = null,
  seekTimer;
const format = (ms) =>
  Math.floor(ms / 60000) +
  ":" +
  String(Math.floor(ms / 1000) % 60).padStart(2, "0");
function state(message) {
  $("status").textContent = message;
}
function volumeTo(n) {
  volume = Math.max(0, Math.min(100, n));
  $("volume").value = String(volume);
  $("mute").textContent = volume === 0 ? "◖×" : "◖))";
  $("mute").setAttribute("aria-label", volume ? labels.mute : labels.unmute);
  if (ready) widget.send("setVolume", volume);
}
function playButton() {
  $("play").disabled = !ready;
  $("play").textContent = playing ? "Ⅱ" : "▶";
  $("play").setAttribute("aria-label", playing ? labels.pause : labels.play);
}
function select(index, start = false) {
  widget?.close();
  const track = library[index];
  dragging = false;
  pendingSeek = null;
  clearTimeout(seekTimer);
  choice = index;
  clearTimeout(timer);
  ready = false;
  playing = false;
  duration = 0;
  widget = null;
  $("position").textContent = "0:00";
  $("duration").textContent = "–:––";
  $("seek").disabled = true;
  $("seek").value = "0";
  state(
    track.recording
      ? zh
        ? "正在加载本地音频…"
        : "Loading local audio…"
      : labels.loading,
  );
  playButton();
  $("track-title").textContent = track.name;
  $("artist").textContent = track.artist;
  $("edition").textContent =
    track.season +
    " / " +
    track.year +
    (track.edition ? " · " + labels.edition : "");
  $("origin").hidden = !!track.recording;
  if (!track.recording) $("origin").href = trackUrl(track);
  $("embed").hidden = !!track.recording;
  document.documentElement.style.setProperty("--accent", track.shade);
  for (const [i, button] of [...document.querySelectorAll(".track")].entries())
    button.setAttribute("aria-current", String(i === index));
  // Each load has its own frame so late callbacks from the previous track cannot change this one.
  $("embed").replaceChildren();
  if (!track.recording)
    timer = setTimeout(() => {
      if (!ready) state(labels.slow);
    }, 10000);
  let failed = false;
  function receive(event, value) {
    if (failed) return;
    switch (event) {
      case "READY":
        clearTimeout(timer);
        ready = true;
        volumeTo(volume);
        playButton();
        state(labels.ready);
        if (start) requestPlay();
        break;
      case "DURATION":
        if (Number.isFinite(value) && value > 0) {
          duration = value;
          $("duration").textContent = format(value);
          $("seek").max = String(value);
          $("seek").disabled = false;
        }
        break;
      case "PLAY":
      case "PAUSE":
        clearTimeout(timer);
        playing = event === "PLAY";
        playButton();
        state(playing ? labels.playing : labels.paused);
        break;
      case "FINISH":
        playing = false;
        playButton();
        state(labels.ended);
        if (index < (track.recording ? library.length : tracks.length) - 1)
          select(index + 1, true);
        else if (repeat) select(track.recording ? tracks.length : 0, true);
        break;
      case "PLAY_REJECTED":
        clearTimeout(timer);
        playing = false;
        playButton();
        state(labels.ready);
        break;
      case "PLAY_PROGRESS":
      case "SEEK":
        if (
          dragging ||
          (pendingSeek !== null && Math.abs(value - pendingSeek) > 1500)
        )
          break;
        if (Number.isFinite(value) && value >= 0) {
          pendingSeek = null;
          $("position").textContent = format(value);
          $("seek").value = String(value);
        }
        break;
      case "ERROR":
        failed = true;
        clearTimeout(timer);
        ready = false;
        playing = false;
        playButton();
        $("seek").disabled = true;
        state(
          track.recording
            ? zh
              ? "本地音频无法播放"
              : "The local audio file could not be played."
            : labels.failed,
        );
        break;
    }
  }
  if (track.recording) {
    widget = openLocalTrack(track.recording, receive);
  } else {
    const frame = document.createElement("iframe");
    frame.title = "SoundCloud · " + track.name;
    $("embed").append(frame);
    widget = openWidget(frame, playerUrl(track), receive);
  }
}
function requestPlay() {
  if (!ready) return;
  state(labels.waiting);
  clearTimeout(timer);
  timer = setTimeout(() => {
    if (!playing) state(library[choice].recording ? labels.ready : labels.slow);
  }, 6000);
  widget.send("play");
}
function toggle() {
  if (!ready) return;
  if (playing) widget.send("pause");
  else requestPlay();
}
function step(delta) {
  select((choice + delta + library.length) % library.length, playing);
}
for (const [index, track] of library.entries()) {
  const li = document.createElement("li"),
    button = document.createElement("button");
  button.type = "button";
  button.className = "track";
  for (const [cls, value] of [
    ["season", track.season],
    ["name", track.name],
    ["year", track.year],
  ]) {
    const span = document.createElement("span");
    span.className = cls;
    span.textContent = value;
    button.append(span);
  }
  button.onclick = () => {
    if (index === choice && ready) toggle();
    else select(index, true);
  };
  li.append(button);
  $(track.recording ? "offline-tracks" : "tracks").append(li);
}
$("play").onclick = toggle;
$("previous").onclick = () => step(-1);
$("next").onclick = () => step(1);
$("mute").onclick = () => {
  if (volume) {
    lastVolume = volume;
    volumeTo(0);
  } else volumeTo(lastVolume);
};
$("volume").oninput = (event) => volumeTo(Number(event.target.value));
const seek = $("seek");
seek.onpointerdown = () => {
  dragging = true;
};
seek.onpointerup = seek.onpointercancel = () => {
  dragging = false;
};
seek.oninput = () => {
  $("position").textContent = format(Number(seek.value));
};
seek.onchange = () => {
  if (!ready || !duration) return;
  pendingSeek = Number(seek.value);
  widget.send("seekTo", pendingSeek);
  clearTimeout(seekTimer);
  seekTimer = setTimeout(() => {
    pendingSeek = null;
  }, 1500);
};
document.addEventListener("keydown", (event) => {
  if (
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.target.closest(
      "input,textarea,select,a,button,[contenteditable=true]",
    )
  )
    return;
  const actions = {
    " ": toggle,
    ArrowLeft: () => step(-1),
    ArrowRight: () => step(1),
    ArrowUp: () => volumeTo(volume + 5),
    ArrowDown: () => volumeTo(volume - 5),
  };
  if (Object.hasOwn(actions, event.key)) {
    event.preventDefault();
    actions[event.key]();
  }
});
volumeTo(volume);
select(navigator.onLine === false ? tracks.length : 0);
