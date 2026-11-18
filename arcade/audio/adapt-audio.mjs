import { readFileSync } from "node:fs";

const bridge = readFileSync(new URL("./game-audio.js", import.meta.url), "utf8");

function replaceOnce(html, pattern, makeReplacement, name) {
  if ([...html.matchAll(pattern)].length !== 1) {
    throw new Error("Expected one " + name + ". Check the selected upstream game's audio output.");
  }
  return html.replace(pattern, makeReplacement);
}

// Apply only to the three pinned original single-file builds. The callback keeps
// the compiler's local variable names and works with both compact and debug builds.
export function adaptAudio(html, gameId) {
  const games = ["cf-transport-ship", "qq-speed", "pelican-bike"];
  if (!games.includes(gameId)) throw new Error("Unknown arcade game: " + gameId);
  let result = replaceOnce(html, /\.connect\(\s*([\w$]+)\.destination\s*\)/g,
    (_, ctx) => ".connect(window.penguinGameAudio.output(" + ctx + "))", "Web Audio destination");
  if (gameId === "cf-transport-ship") {
    result = replaceOnce(result, /\b([\w$]+)\.speak\(\s*([\w$]+)\s*\)/g,
      (_, engine, utterance) => "window.penguinGameAudio.speak(" + engine + "," + utterance + ")", "speech output");
  }
  return replaceOnce(result, /<head\b[^>]*>/gi, (head) => head + "\n<script>\n" + bridge + "\n</script>", "document head");
}
