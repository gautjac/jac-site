// The Amorce "canvas" card, described once.
//
// Ported from the Amorce app (src/lib/fonts.ts and the Canvas layout in
// src/components/Layouts.tsx) so the site re-renders a shared card exactly as
// Amorce composed it. Every card in the library uses the canvas layout.
//
// Shared by scripts/fit-amorce.mjs (measurement) and the PoemCard component
// (rendering), so the two can't drift apart.

export const GOOGLE_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,700;0,9..144,900;1,9..144,400;1,9..144,700' +
  '&family=Inter:wght@400;500;700' +
  '&family=EB+Garamond:ital,wght@0,400;0,500;0,700;1,400' +
  '&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400' +
  '&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,700;1,400' +
  '&family=Libre+Caslon+Text:ital,wght@0,400;0,700;1,400' +
  '&family=Caveat:wght@400;500;700' +
  '&family=Space+Grotesk:wght@400;500;700' +
  '&family=Abril+Fatface&family=Cinzel:wght@400;500;700;900' +
  '&family=DM+Serif+Display:ital@0;1&family=Italiana&family=Syne:wght@400;500;600;700;800' +
  '&family=Pinyon+Script&family=Young+Serif&family=Gloock' +
  '&family=Quicksand:wght@400;500;600;700&family=Londrina+Outline' +
  '&family=Mozilla+Headline:wght@400;500;600;700' +
  '&family=Stack+Sans+Text:wght@400;500;700&display=swap';

// Line heights are tuned per face upstream; keep them in step with fonts.ts.
export const FONTS = {
  'fraunces':          { family: 'Fraunces, serif',             lineHeight: 1.22 },
  'eb-garamond':       { family: '"EB Garamond", serif',        lineHeight: 1.28 },
  'playfair':          { family: '"Playfair Display", serif',   lineHeight: 1.22 },
  'cormorant':         { family: '"Cormorant Garamond", serif', lineHeight: 1.24 },
  'libre-caslon':      { family: '"Libre Caslon Text", serif',  lineHeight: 1.3  },
  'inter':             { family: 'Inter, sans-serif',           lineHeight: 1.3  },
  'space-grotesk':     { family: '"Space Grotesk", sans-serif', lineHeight: 1.26 },
  'caveat':            { family: 'Caveat, cursive',             lineHeight: 1.18 },
  'abril-fatface':     { family: '"Abril Fatface", serif',      lineHeight: 1.18 },
  'cinzel':            { family: 'Cinzel, serif',               lineHeight: 1.2  },
  'italiana':          { family: 'Italiana, serif',             lineHeight: 1.2  },
  'pinyon-script':     { family: '"Pinyon Script", cursive',    lineHeight: 1.35 },
  'dm-serif-display':  { family: '"DM Serif Display", serif',   lineHeight: 1.2  },
  'syne':              { family: 'Syne, sans-serif',            lineHeight: 1.25 },
  'young-serif':       { family: '"Young Serif", serif',        lineHeight: 1.3  },
  'gloock':            { family: 'Gloock, serif',               lineHeight: 1.2  },
  'quicksand':         { family: 'Quicksand, sans-serif',       lineHeight: 1.3  },
  'londrina-outline':  { family: '"Londrina Outline", display', lineHeight: 1.18 },
  'mozilla-headline':  { family: '"Mozilla Headline", sans-serif', lineHeight: 1.18 },
  'stack-sans-text':   { family: '"Stack Sans Text", sans-serif',  lineHeight: 1.3 }
};

// Instagram-portrait card. Every geometry value stored per poem — textBox,
// titleBox, font sizes — is in this coordinate space.
export const CANVAS = {
  w: 1080,
  h: 1350,
  innerPad: 10,
  light: '#F5F1EA',
  dark: '#0B0D12',
  lightShadow: '0 2px 12px rgba(11,13,18,0.55), 0 0 1px rgba(11,13,18,0.4)',
  darkShadow: '0 1px 2px rgba(245,241,234,0.55)',
  footer: { left: 48, bottom: 36, size: 20, tracking: '0.18em', opacity: 0.6 * 0.82 }
};

export const getFont = (id) => FONTS[id] ?? FONTS.fraunces;

// px in card space → a container-query unit, so a card scales to any width
// while keeping every stored coordinate exact.
export const u = (px) => `${(px * 100 / CANVAS.w).toFixed(4)}cqw`;

// The drop shadows are px-tuned upstream, so they have to scale with the card.
export const textShadow = (light) => light
  ? `0 ${u(2)} ${u(12)} rgba(11,13,18,0.55), 0 0 ${u(1)} rgba(11,13,18,0.4)`
  : `0 ${u(1)} ${u(2)} rgba(245,241,234,0.55)`;
