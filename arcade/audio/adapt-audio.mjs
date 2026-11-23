import { patchAudio } from "./patch-audio.js";
import { readFileSync } from "node:fs";

const bridge = readFileSync(
  new URL("./game-audio.js", import.meta.url),
  "utf8",
);
const deckImpact = readFileSync(
  new URL("./deck-impact.js", import.meta.url),
  "utf8",
);

const deckInput = readFileSync(
  new URL("./deck-input.js", import.meta.url),
  "utf8",
);

const deckSurfaces = readFileSync(
  new URL("./deck-surfaces.js", import.meta.url),
  "utf8",
);

export const audioSources = { bridge, deckImpact, deckInput, deckSurfaces };

export function adaptAudio(html, gameId) {
  return patchAudio(html, gameId, audioSources);
}
