import { runInNewContext } from "node:vm";
import { afterEach, expect, it, vi } from "vitest";
import { openWidget } from "../workbenches/worlds-anthems/ui/widget.js";
import {
  playerUrl,
  tracks,
  trackUrl,
} from "../workbenches/worlds-anthems/ui/tracks.js";

afterEach(() => vi.unstubAllGlobals());

it("opens the same official recording in the widget and the external fallback", () => {
  expect(tracks.map((track) => track.season)).toEqual([
    "S4",
    "S5",
    "S7",
    "S9",
    "S11",
    "S13",
    "S14",
    "S15",
  ]);
  for (const track of tracks) {
    const url = new URL(playerUrl(track));
    expect(url.origin + url.pathname).toBe("https://w.soundcloud.com/player/");
    expect(url.searchParams.get("url")).toBe(
      "https://api.soundcloud.com/tracks/" + track.soundcloudId,
    );
    expect(new URL(trackUrl(track)).origin).toBe("https://soundcloud.com");
  }
});

it("routes official widget events and limits controls to its own app frame", () => {
  const callbacks = new Map();
  const official = {
    bind: (name, fn) => callbacks.set(name, fn),
    getDuration: (fn) => fn(168000),
    play: vi.fn(),
    pause: vi.fn(),
    seekTo: vi.fn(),
    setVolume: vi.fn(),
  };
  const Widget = Object.assign(() => official, {
    Events: Object.fromEntries(
      [
        "READY",
        "PLAY",
        "PAUSE",
        "FINISH",
        "ERROR",
        "PLAY_PROGRESS",
        "SEEK",
      ].map((name) => [name, name]),
    ),
  });
  const onEvent = vi.fn();
  const pageWindow = {
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
  vi.stubGlobal("window", pageWindow);
  const frame = {
    setAttribute: vi.fn(),
    contentWindow: { postMessage: vi.fn() },
  };
  const url = playerUrl(tracks[0]),
    bridge = openWidget(frame, url, onEvent);
  const receive = pageWindow.addEventListener.mock.calls[0][1];
  const post = (source, origin, type, value) =>
    receive({
      source,
      origin,
      data: { channel: "worlds-widget", type, value },
    });
  post({}, "null", "PLAY");
  post(frame.contentWindow, "https://soundcloud.com", "PLAY");
  expect(onEvent).not.toHaveBeenCalled();
  const parent = {
    postMessage: ({ type, value }) =>
      post(frame.contentWindow, "null", type, value),
  };
  const content = { addEventListener: vi.fn(), SC: { Widget } };
  const iframe = {};
  const document = {
    querySelector: () => iframe,
    createElement: () => ({}),
    head: { append: (script) => script.onload() },
  };
  const html = decodeURIComponent(frame.src.slice(frame.src.indexOf(",") + 1));
  runInNewContext(html.match(/<script>([\s\S]*)<\/script>/)[1], {
    document,
    window: content,
    parent,
  });
  expect(iframe.src).toBe(url);
  callbacks.get("READY")();
  expect(onEvent.mock.calls).toEqual([
    ["READY", undefined],
    ["DURATION", 168000],
  ]);
  const control = content.addEventListener.mock.calls[0][1];
  const command = (method, value, source = parent) =>
    control({ source, data: { channel: "worlds-control", method, value } });
  command("play", undefined, {});
  expect(official.play).not.toHaveBeenCalled();
  command("play");
  command("pause");
  command("seekTo", 6000);
  command("setVolume", 108);
  expect(official.play).toHaveBeenCalledOnce();
  expect(official.pause).toHaveBeenCalledOnce();
  expect(official.seekTo).toHaveBeenCalledWith(6000);
  expect(official.setVolume).toHaveBeenCalledWith(100);
  callbacks.get("PLAY_PROGRESS")({ currentPosition: 6500 });
  expect(onEvent).toHaveBeenLastCalledWith("PLAY_PROGRESS", 6500);
  bridge.send("pause");
  expect(frame.contentWindow.postMessage).toHaveBeenCalledWith(
    { channel: "worlds-control", method: "pause", value: undefined },
    "*",
  );
  bridge.close();
  expect(pageWindow.removeEventListener).toHaveBeenCalledWith(
    "message",
    receive,
  );
});
