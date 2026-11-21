"""Bundle a private copy of Transport Ship into an importable Penguin workbench."""
import argparse
import re
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("html", type=Path, help="self-contained game HTML")
parser.add_argument("output", type=Path, help="new workbench ZIP")
args = parser.parse_args()
game = args.html.read_bytes()
if not re.search(rb"<html[\s>]", game, re.I) or not re.search(rb"<script[\s>]", game, re.I):
    parser.error("Expected a self-contained game HTML")
if len(game) > 5 * 1024 * 1024:
    parser.error("The game HTML exceeds the workbench's 5 MB per-file limit")
source = Path(__file__).resolve().parents[2] / "plugins/harbor-pulse/workbenches/harbor-pulse"
with ZipFile(args.output, "x", ZIP_DEFLATED) as archive:
    for file in sorted(source.rglob("*")):
        if file.is_file():
            data = file.read_bytes()
            if file.name == "game-config.js":
                data = data.replace(b"export default {", b'export default {\n  "bundled": true,', 1)
            archive.writestr("harbor-pulse/" + file.relative_to(source).as_posix(), data)
    archive.writestr("harbor-pulse/ui/game.html", game)
print(args.output)
