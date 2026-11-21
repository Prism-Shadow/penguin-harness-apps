import { readFileSync } from "node:fs";

const bridge = readFileSync(new URL("./game-audio.js", import.meta.url), "utf8");
const deckImpact = readFileSync(new URL("./deck-impact.js", import.meta.url), "utf8");

const deckInput = readFileSync(new URL("./deck-input.js", import.meta.url), "utf8");

const deckSurfaces = readFileSync(new URL("./deck-surfaces.js", import.meta.url), "utf8");

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
  let scripts = bridge;
  if (gameId === "cf-transport-ship") {
    scripts += "\n" + deckImpact + "\n" + deckInput + "\n" + deckSurfaces;
    result = replaceOnce(result, /\bstartAmbient\(\)\s*\{/g,
      (method) => method + "window.penguinDeckSurfaces(this);", "ship audio mixer initialization");
    result = replaceOnce(result, /(?<![\w$.])lock\(\)\s*\{[\s\S]{0,1100}?\}\s*(?=onLockChange\(\))/g,
      () => "lock(){window.penguinDeckPointer(this)}", "game pointer lock");
    result = replaceOnce(result, /\bplayShot\(\s*([\w$]+),\s*([\w$]+),\s*([\w$]+)\s*\)\s*\{/g,
      (method, kind, position, options) => method +
        "if (" + position + " == null && " + kind + ' !== "knife" && ' + kind + ' !== "grenade" && !' + options + "?.suppressed) window.penguinDeckImpact(this.ctx,this._sfx);", "local arcade effect");
    result = replaceOnce(result, /\b([\w$]+)\.speak\(\s*([\w$]+)\s*\)/g,
      (_, engine, utterance) => "window.penguinGameAudio.speak(" + engine + "," + utterance + ")", "speech output");
  }
  return replaceOnce(result, /<head\b[^>]*>/gi, (head) => head + "\n<script>\n" + scripts + "\n</script>", "document head");
}
