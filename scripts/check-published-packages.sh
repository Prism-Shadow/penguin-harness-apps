#!/usr/bin/env bash
set -euo pipefail

gh api --paginate "repos/$GITHUB_REPOSITORY/releases?per_page=100" \
  --jq '.[] | select(.draft == false) | .assets[] | select(.name == "packages.json") | .id' > "$RUNNER_TEMP/catalog-ids"
while read -r id; do
  gh api -H 'Accept: application/octet-stream' "repos/$GITHUB_REPOSITORY/releases/assets/$id" > "$RUNNER_TEMP/previous.json"
  jq -en --slurpfile previous "$RUNNER_TEMP/previous.json" --slurpfile current "$1" \
    'all($current[0][]; . as $p | all($previous[0][] | select(.name == $p.name and .version == $p.version); .integrity == $p.integrity))'
done < "$RUNNER_TEMP/catalog-ids"
