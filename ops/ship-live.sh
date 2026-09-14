#!/usr/bin/env bash
# Numbered Design Lab North ship: iteration, notes, tag, git, live web recreate.
# Does nothing unless confirm matches. Ordinary lab Send must not call this.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
REQUEST="${SHIP_REQUEST:-$ROOT/_meta/ship/request.json}"
CONFIRM_WANT="${CONFIRM:-}"
NOTES="${NOTES:-}"
KIND="${KIND:-ship}"

if [[ -f "$REQUEST" ]]; then
  CONFIRM_WANT="${CONFIRM_WANT:-$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1])).get("confirm",""))' "$REQUEST")}"
  NOTES="${NOTES:-$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1])).get("notes",""))' "$REQUEST")}"
  KIND="${KIND:-$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1])).get("kind","ship"))' "$REQUEST")}"
fi

if [[ "$KIND" == "hotfix" ]]; then
  EXPECT="hotfix"
else
  EXPECT="push to git and live"
  KIND="ship"
fi

if [[ "${CONFIRM_WANT,,}" != "$EXPECT" ]]; then
  echo "Refuse: confirm must be exactly: $EXPECT" >&2
  echo "Ordinary Send does not deploy. Use the Push / Hotfix button." >&2
  exit 2
fi

if [[ "${DRY_RUN:-}" == "1" ]]; then
  echo "dry-run: would ship kind=$KIND notes=${NOTES:0:80}"
  exit 0
fi

NOW="$(date +%Y-%m-%dT%H:%M:%S%:z)"
CUR="$(tr -d '[:space:]' < memory/ITERATION)"
NEXT=$((CUR + 1))
TAG="dln-${NEXT}"
SUMMARY="${NOTES:-Numbered ship ${TAG}}"
SUMMARY="$(printf '%s' "$SUMMARY" | tr '\n' ' ' | cut -c1-180)"

printf '%s\n' "$NEXT" > memory/ITERATION
printf '{"n":%s,"t":"%s","tag":"%s","s":%s}\n' "$NEXT" "$NOW" "$TAG" "$(python3 -c 'import json,sys; print(json.dumps(sys.argv[1]))' "$SUMMARY")" >> memory/iterations.jsonl
printf '{"t":"%s","k":"ver","p":"%s","s":%s,"d":"numbered ship"}\n' "$NOW" "$TAG" "$(python3 -c 'import json,sys; print(json.dumps(sys.argv[1]))' "$SUMMARY")" >> memory/CHANGELOG.jsonl
printf '{"t":"%s","n":%s,"tag":"%s","kind":"%s","s":%s}\n' "$NOW" "$NEXT" "$TAG" "$KIND" "$(python3 -c 'import json,sys; print(json.dumps(sys.argv[1]))' "$SUMMARY")" >> memory/ship-notes.jsonl

git add memory/ITERATION memory/iterations.jsonl memory/CHANGELOG.jsonl memory/ship-notes.jsonl
git commit -m "$(cat <<EOF
Ship ${TAG}: ${SUMMARY}

EOF
)"
git tag "$TAG"
/home/main/_meta/bin/gh-push.sh DLN main "$TAG"

# Live: rsync hub (accounts excluded) then recreate web only.
"$ROOT/deploy/sync-to-vps.sh"
ssh -o BatchMode=yes -o IdentitiesOnly=yes -i "${HOME}/.ssh/id_ed25519_dln" "${DLN_SSH_HOST:-dln-vps}" \
  "cd /srv/dln/repo/deploy && docker compose up -d --build --no-deps web"

mkdir -p "$ROOT/_meta/ship"
printf '{"lastTag":"%s","at":"%s","kind":"%s"}\n' "$TAG" "$NOW" "$KIND" > "$ROOT/_meta/ship/last.json"
echo "shipped $TAG"
