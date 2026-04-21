#!/usr/bin/env bash
set -euo pipefail

# Push UploadThing env vars from .env to Vercel (production + preview).
# Run: bash scripts/push-uploadthing-env.sh

cd "$(dirname "$0")/.."

if ! command -v vercel >/dev/null; then
  echo "vercel CLI not found. Install with: npm i -g vercel" >&2
  exit 1
fi

if [ ! -f .vercel/project.json ]; then
  echo "Project not linked. Running 'vercel link' first..."
  vercel link
fi

# Read values from .env (strips quotes)
get() {
  grep -E "^$1=" .env | head -1 | sed -E "s/^$1=//; s/^['\"]//; s/['\"]$//"
}

TOKEN=$(get UPLOADTHING_TOKEN)
SECRET=$(get UPLOADTHING_SECRET)
APP_ID=$(get UPLOADTHING_APP_ID)
PUBLIC_APP_ID=$(get NEXT_PUBLIC_UPLOADTHING_APP_ID)

push() {
  local name="$1"
  local value="$2"
  for env in production preview; do
    # Remove existing value (ignore errors if not set), then add.
    vercel env rm "$name" "$env" --yes >/dev/null 2>&1 || true
    printf '%s' "$value" | vercel env add "$name" "$env"
  done
}

push UPLOADTHING_TOKEN "$TOKEN"
push UPLOADTHING_SECRET "$SECRET"
push UPLOADTHING_APP_ID "$APP_ID"
push NEXT_PUBLIC_UPLOADTHING_APP_ID "$PUBLIC_APP_ID"

echo ""
echo "Env vars pushed. Redeploying production..."
vercel --prod
