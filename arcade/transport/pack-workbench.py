"""Bundle a private copy of Transport Ship into an importable Penguin workbench."""
import argparse
import base64
import hashlib
import json
import re
from pathlib import Path
from urllib.error import URLError
from urllib.request import Request, urlopen
from zipfile import ZipFile, ZIP_DEFLATED

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--from-author", action="store_true", help="download the pinned original from its author")
parser.add_argument("html", nargs="?", type=Path, help="your self-contained game HTML")
parser.add_argument("output", type=Path, help="new workbench ZIP")
args = parser.parse_args()
if args.from_author == bool(args.html):
    parser.error("Specify either --from-author or a self-contained game HTML")

source = Path(__file__).resolve().parents[2] / "plugins/harbor-pulse/workbenches/harbor-pulse"
prefix = "export default "
config = json.loads((source / "ui/game-config.js").read_text(encoding="utf-8").strip().removeprefix(prefix).removesuffix(";"))
limit = 5 * 1024 * 1024
if args.from_author:
    request = Request(config["url"], headers={"User-Agent": "PenguinHarness-Workbench/1.3", "Accept": "text/html"})
    try:
        with urlopen(request, timeout=30) as response:
            game = response.read(limit + 1)
    except (URLError, TimeoutError) as error:
        parser.error(f"Could not download the game from its author: {error}")
    actual = "sha256-" + base64.b64encode(hashlib.sha256(game).digest()).decode("ascii")
    if actual != config["integrity"]:
        parser.error("The author's download does not match the pinned game. No ZIP was created.")
    config["bundledOfficial"] = True
else:
    game = args.html.read_bytes()
if not re.search(rb"<html[\s>]", game, re.I) or not re.search(rb"<script[\s>]", game, re.I):
    parser.error("Expected a self-contained game HTML")
if len(game) > limit:
    parser.error("The game HTML exceeds the workbench's 5 MB per-file limit")

config["bundled"] = True
with ZipFile(args.output, "x", ZIP_DEFLATED) as archive:
    for file in sorted(source.rglob("*")):
        if file.is_file():
            data = file.read_bytes()
            if file.name == "game-config.js":
                data = (prefix + json.dumps(config, ensure_ascii=False, indent=2) + ";\n").encode("utf-8")
            archive.writestr("harbor-pulse/" + file.relative_to(source).as_posix(), data)
    archive.writestr("harbor-pulse/ui/game.html", game)
print(args.output)
