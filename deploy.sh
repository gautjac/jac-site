#!/bin/bash
# Deploy script for jac-site (jac-gautreau.netlify.app)
# Usage: ./deploy.sh

cd "$(dirname "$0")"

export NETLIFY_AUTH_TOKEN=nfp_YxDKbaSR3z3xTJPNbDPvJcPHCBySoq2Z1fe3
export NETLIFY_SITE_ID=c6d62188-0bf4-4988-88de-b3459c460864

echo "Building..."
npm run build

echo "Deploying to Netlify..."
npx netlify-cli deploy --prod --dir=dist --site=$NETLIFY_SITE_ID

echo "Done! Site: https://jacgautreau.com"
