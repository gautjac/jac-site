# Jac Gautreau - Personal Website

**Live:** https://jac-gautreau.netlify.app

## Stack
- Astro (static site generator)
- Tailwind CSS
- Netlify hosting

## Project Structure
```
src/
  content/
    en.json      # English content
    fr.json      # French content
  layouts/
    Layout.astro # Base layout
  pages/
    index.astro  # English homepage
    fr/
      index.astro # French homepage
public/
  images/        # Project images
    acadictionnaire.jpg
    acadictionnaire-2.jpg
    acadictionnaire-3.jpg
    ar-whale.jpg
```

## Content Editing

All site content is in JSON files:
- **English:** `src/content/en.json`
- **French:** `src/content/fr.json`

### Adding Project Images
1. Add image to `public/images/`
2. Update the project's `images` array in both `en.json` and `fr.json`:
```json
{
  "title": "Project Name",
  "description": "Description",
  "category": "Category / Type",
  "images": ["/images/your-image.jpg"]
}
```

## Development
```bash
npm install
npm run dev      # Start dev server
npm run build    # Build for production
```

## Deployment

**Site ID:** `c6d62188-0bf4-4988-88de-b3459c460864`

```bash
# Build first
npm run build

# Deploy (token in podcast-summaries/.env)
NETLIFY_AUTH_TOKEN=nfp_YxDKbaSR3z3xTJPNbDPvJcPHCBySoq2Z1fe3 \
npx netlify-cli deploy --prod --dir=dist --site=c6d62188-0bf4-4988-88de-b3459c460864
```

## Portfolio Projects Status
- ✅ **Acadictionnaire** — 3 carousel images
- ❌ **Tracadie Story** — needs images
- ❌ **Ocean School** — needs images
- ✅ **AR Whale** — orca image added 2026-02-21

## Notes
- Bilingual: EN at `/`, FR at `/fr`
- Dark theme with gold accents
- Mobile-responsive grid layout
- Project cards support image carousels (multiple images in array)
