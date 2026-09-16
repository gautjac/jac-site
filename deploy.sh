#!/bin/bash
# Deploy jac-site to Netlify (jacgautreau.com) and push the source to GitHub.
#
# Auth comes from the Netlify CLI session (`netlify login`), not from a token in
# this file — the old hardcoded token was committed to a public repo and has
# since been revoked. Never put one back here.
#
# Note the poem images (instagram-poems/, public/poems-amorce/) are gitignored,
# so they reach the site through this CLI deploy and not through git.
#
# Usage: ./deploy.sh

set -euo pipefail
cd "$(dirname "$0")"

SITE_ID=c6d62188-0bf4-4988-88de-b3459c460864

if ! npx netlify-cli status >/dev/null 2>&1; then
  echo "Not logged in to Netlify. Run: npx netlify-cli login"
  exit 1
fi

echo "Refreshing poems from Amorce…"
node scripts/fetch-amorce.mjs
node scripts/fit-amorce.mjs

echo "Building…"
npm run build

echo "Deploying…"
npx netlify-cli deploy --prod --dir=dist --site="$SITE_ID"

echo "Pushing to GitHub…"
git add -A
git diff --cached --quiet || git commit -m "Deploy $(date '+%Y-%m-%d %H:%M')"
git pull origin main --rebase --quiet
git push origin main --quiet

echo "Done — https://jacgautreau.com"
