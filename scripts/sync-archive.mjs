#!/usr/bin/env node
// Stage the 2020–2021 poem images for the build.
//
// instagram-poems/ is an instaloader dump: 365 jpgs plus 480 .json.xz metadata
// sidecars. public/poems used to be a symlink to the whole folder, which
// shipped every sidecar to production for nothing. This copies just the images.
//
// Hardlinks, so the 58 MB isn't duplicated on disk. Both directories are
// gitignored; the images reach the site through the CLI deploy.
//
// Usage: node scripts/sync-archive.mjs

import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.join(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'instagram-poems');
const DEST = path.join(ROOT, 'public', 'poems');

if (!existsSync(SRC)) {
  console.warn('instagram-poems/ not found — skipping the 2020–2021 archive.');
  process.exit(0);
}

await fs.mkdir(DEST, { recursive: true });

const want = (await fs.readdir(SRC))
  .filter(f => f.endsWith('.jpg') && !f.includes('profile_pic'));

let linked = 0;
for (const f of want) {
  const dest = path.join(DEST, f);
  if (existsSync(dest)) continue;
  try {
    await fs.link(path.join(SRC, f), dest);       // same volume: free
  } catch {
    await fs.copyFile(path.join(SRC, f), dest);   // different volume: fall back
  }
  linked++;
}

// Drop anything that is no longer in the source.
const keep = new Set(want);
let removed = 0;
for (const f of await fs.readdir(DEST)) {
  if (!keep.has(f)) { await fs.rm(path.join(DEST, f), { force: true }); removed++; }
}

console.log(`archive: ${want.length} images staged (${linked} new, ${removed} removed)`);
