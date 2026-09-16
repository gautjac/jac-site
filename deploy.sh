#!/bin/bash
# Deploy jac-site to jacgautreau.com.
#
# The Netlify project builds from GitHub (gautjac/jac-site, branch main), so a
# push IS the deploy. An earlier version of this script also ran a CLI
# `--prod` deploy; that raced the git build and always lost, which silently
# published a site missing any file that wasn't committed. Push only.
#
# That also means everything the site serves has to be in git — including the
# poem images under instagram-poems/ and public/poems-amorce/.
#
# Auth is the GitHub remote. The Netlify token this file used to hardcode was
# committed to a public repo and has been revoked; never put one back.
#
# Usage: ./deploy.sh

set -euo pipefail
cd "$(dirname "$0")"

echo "Refreshing poems from Amorce…"
node scripts/fetch-amorce.mjs
node scripts/fit-amorce.mjs

echo "Building locally to catch errors before pushing…"
npm run build

git add -A
if git diff --cached --quiet; then
  echo "Nothing to deploy — working tree matches HEAD."
else
  git commit -m "Deploy $(date '+%Y-%m-%d %H:%M')"
fi

echo "Pushing — Netlify builds from this push…"
git pull origin main --rebase --quiet
git push origin main --quiet

echo
echo "Pushed. Netlify is building: https://app.netlify.com/projects/jac-gautreau/deploys"
echo "Live in a minute or two at https://jacgautreau.com"
