#!/usr/bin/env node
// Pull the Amorce poem library, mirror every background image, and emit
// web-sized derivatives.
//
// The library lives in Firestore (collection `amorce_poems`) and is served by
// Amorce's own /api/library function. Its imageUrl points at fal.media — a
// third-party host with no retention guarantee — so originals are cached in
// .cache/amorce/ (gitignored) and optimized copies are written into public/.
//
// fal returns lossless WebP at ~1.2 MB per 1024² image; re-encoding lossy
// takes the whole set from ~164 MB to something shippable.
//
// Usage: node scripts/fetch-amorce.mjs
// Safe to re-run: cached originals are reused, so it only fetches what's new.

import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const API = 'https://jac-amorce.netlify.app/api/library';
const ROOT = path.join(import.meta.dirname, '..');
const CACHE = path.join(ROOT, '.cache', 'amorce');
const PUB = path.join(ROOT, 'public', 'poems-amorce');
const THUMB = path.join(PUB, 'thumb');
const OUT = path.join(ROOT, 'src', 'content', 'amorce-poems.json');

// Cards render at most 1080 px wide; thumbs sit in a 2–5 column grid.
const FULL_W = 1080, FULL_Q = 78;
const THUMB_W = 480, THUMB_Q = 72;

const extFor = (url) => {
  const m = new URL(url).pathname.match(/\.(jpe?g|png|webp|avif)$/i);
  return m ? m[0].toLowerCase() : '.jpg';
};

console.log('Fetching library…');
const res = await fetch(API);
if (!res.ok) throw new Error(`Library fetch failed: ${res.status}`);
const raw = await res.json();
console.log(`  ${raw.length} poems`);

await fs.mkdir(CACHE, { recursive: true });
await fs.mkdir(THUMB, { recursive: true });

let fetched = 0, cached = 0, encoded = 0, failed = 0;
const poems = [];

for (const p of raw) {
  if (!p.text?.trim() || !p.imageUrl) { failed++; continue; }

  const orig = path.join(CACHE, `${p.id}${extFor(p.imageUrl)}`);
  const full = path.join(PUB, `${p.id}.webp`);
  const thumb = path.join(THUMB, `${p.id}.webp`);

  try {
    if (existsSync(orig)) {
      cached++;
    } else {
      const r = await fetch(p.imageUrl);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      await fs.writeFile(orig, Buffer.from(await r.arrayBuffer()));
      fetched++;
    }

    if (!existsSync(full) || !existsSync(thumb)) {
      await sharp(orig).resize(FULL_W, null, { withoutEnlargement: true })
        .webp({ quality: FULL_Q }).toFile(full);
      await sharp(orig).resize(THUMB_W, null, { withoutEnlargement: true })
        .webp({ quality: THUMB_Q }).toFile(thumb);
      encoded++;
      process.stdout.write(`  · ${p.id}\n`);
    }
  } catch (err) {
    console.warn(`  ✗ ${p.id}: ${err.message}`);
    failed++;
    continue;
  }

  // Only what the card renderer needs. `fontSize` is deliberately absent
  // upstream — the poem text is auto-fitted, so fit-amorce.mjs adds it later.
  poems.push({
    id: p.id,
    date: p.seed?.date ?? p.createdAt?.slice(0, 10) ?? '',
    title: p.title ?? '',
    text: p.text,
    lang: p.seed?.language ?? 'en',
    nucleus: p.seed?.nucleus ?? '',
    image: `/poems-amorce/${p.id}.webp`,
    thumb: `/poems-amorce/thumb/${p.id}.webp`,
    fontId: p.fontId ?? 'fraunces',
    titleFontId: p.titleFontId ?? p.fontId ?? 'fraunces',
    titleFontSize: p.titleFontSize,
    textBox: p.textBox ?? { x: 90, y: 360, w: 900, h: 700 },
    titleBox: p.titleBox ?? { x: 90, y: 110, w: 900, h: 200 },
    textColor: p.textColor ?? 'light',
    footer: p.footer,
    durationSec: p.durationSec,
    createdAt: p.createdAt
  });
}

poems.sort((a, b) => b.date.localeCompare(a.date));
await fs.writeFile(OUT, JSON.stringify(poems, null, 2) + '\n');

console.log(`\nfetched ${fetched} · cached ${cached} · encoded ${encoded} · failed ${failed}`);
console.log(`wrote ${poems.length} poems → src/content/amorce-poems.json`);
