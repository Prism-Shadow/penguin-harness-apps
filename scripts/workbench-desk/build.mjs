/** Install the shared desk sources beside each standalone workbench before it is packed. */
import { copyFile } from "node:fs/promises";

const shared = new URL("./", import.meta.url);
const deskApps = [
  "action-minutes",
  "daily-draw",
  "fridge-keeper",
  "party-charades",
  "tabletop-desk",
];
for (const slug of deskApps) {
  const target = new URL(`../../plugins/${slug}/workbenches/${slug}/`, shared);
  for (const file of ["desk-kit.ts", "ui/desk-kit.js", "ui/desk-kit.css"]) {
    await copyFile(
      new URL(file.split("/").at(-1), shared),
      new URL(file, target),
    );
  }
}
