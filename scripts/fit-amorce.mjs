#!/usr/bin/env node
// Compute the poem font size for every Amorce card.
//
// Amorce auto-fits the poem text at render time (binary search for the largest
// size that fits the box) and never stores the result, so the site has to
// recompute it. Doing that in the browser on 150 cards would cost a visible
// reflow on every load, so it happens here instead and gets baked into
// amorce-poems.json.
//
// The measurement has to match Amorce's fitText.ts exactly, including the real
// webfonts — a fallback face measures differently — so this drives a headless
// Chrome over CDP rather than guessing from font metrics.
//
// Usage: node scripts/fit-amorce.mjs   (run after fetch-amorce.mjs)

import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { FONTS, GOOGLE_FONTS_URL, CANVAS } from './amorce-card.mjs';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9333;
const ROOT = path.join(import.meta.dirname, '..');
const POEMS = path.join(ROOT, 'src', 'content', 'amorce-poems.json');
const TMP = path.join(ROOT, '.cache', 'fit.html');

const poems = JSON.parse(await fs.readFile(POEMS, 'utf8'));

// A page that loads every face, then runs Amorce's own fit for each poem.
const page = `<!doctype html><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${GOOGLE_FONTS_URL}">
<body><script>
const FONTS = ${JSON.stringify(FONTS)};
const POEMS = ${JSON.stringify(poems)};
const PAD = ${CANVAS.innerPad};

// Verbatim port of Amorce's fitFontSize (src/lib/fitText.ts).
function fitFontSize(p) {
  const el = document.createElement('div');
  el.style.cssText = [
    'position:absolute','visibility:hidden','pointer-events:none','top:0','left:-99999px',
    'width:' + p.maxWidth + 'px',
    'font-family:' + p.fontFamily,
    'line-height:' + p.lineHeight,
    'letter-spacing:' + (p.letterSpacing ?? '-0.01em'),
    'font-weight:' + (p.fontWeight ?? 400),
    'white-space:pre-wrap','word-break:break-word','overflow-wrap:break-word'
  ].join(';');
  el.textContent = p.text;
  document.body.appendChild(el);
  let lo = p.minFs ?? 18, hi = p.maxFs ?? 96, best = 0;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    el.style.fontSize = mid + 'px';
    if (el.scrollHeight <= p.maxHeight) { best = mid; lo = mid + 1; } else { hi = mid - 1; }
  }
  document.body.removeChild(el);
  return best || (p.minFs ?? 18);
}

window.__fit = (async () => {
  // document.fonts.ready only settles faces the page actually renders, so ask
  // for each one explicitly before measuring anything.
  await Promise.all(Object.values(FONTS).map(f =>
    document.fonts.load('400 100px ' + f.family.split(',')[0].replace(/"/g, ''))
      .catch(() => {})));
  await document.fonts.ready;

  return POEMS.map(p => {
    const font = FONTS[p.fontId] ?? FONTS.fraunces;
    const out = { id: p.id };
    out.fontSize = fitFontSize({
      text: p.text,
      maxWidth: p.textBox.w - PAD * 2,
      maxHeight: p.textBox.h - PAD * 2,
      fontFamily: font.family, lineHeight: font.lineHeight, maxFs: 120
    });
    // Most titles carry a size the user chose by hand; a few don't.
    if (p.titleFontSize == null && p.title.trim()) {
      const tf = FONTS[p.titleFontId] ?? font;
      out.titleFontSize = fitFontSize({
        text: p.title,
        maxWidth: p.titleBox.w - PAD * 2,
        maxHeight: p.titleBox.h - PAD * 2,
        fontFamily: tf.family, lineHeight: tf.lineHeight, maxFs: 220
      });
    }
    return out;
  });
})();
</script></body>`;

await fs.mkdir(path.dirname(TMP), { recursive: true });
await fs.writeFile(TMP, page);

const chrome = spawn(CHROME, [
  '--headless=new', `--remote-debugging-port=${PORT}`,
  '--disable-gpu', '--no-first-run', '--user-data-dir=/tmp/cdp-fit',
  '--allow-file-access-from-files', 'about:blank'
], { stdio: 'ignore' });

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
let ws, id = 0;
const pending = new Map();
const send = (method, params = {}) => new Promise((res, rej) => {
  const m = { id: ++id, method, params };
  pending.set(m.id, { res, rej });
  ws.send(JSON.stringify(m));
});

try {
  let target;
  for (let i = 0; i < 60; i++) {
    try {
      target = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json())
        .find(t => t.type === 'page');
      if (target) break;
    } catch {}
    await sleep(200);
  }
  if (!target) throw new Error('Chrome debugger never came up');

  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r, { once: true }));
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
      const { res, rej } = pending.get(m.id);
      pending.delete(m.id);
      m.error ? rej(new Error(m.error.message)) : res(m.result);
    }
  });

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.navigate', { url: 'file://' + TMP });
  await sleep(4000);  // let the webfonts arrive

  const r = await send('Runtime.evaluate', {
    expression: 'window.__fit.then(JSON.stringify)',
    awaitPromise: true, returnByValue: true
  });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);

  const fits = new Map(JSON.parse(r.result.value).map(f => [f.id, f]));
  let sized = 0, titled = 0;
  for (const p of poems) {
    const f = fits.get(p.id);
    if (!f) continue;
    p.fontSize = f.fontSize; sized++;
    if (f.titleFontSize != null) { p.titleFontSize = f.titleFontSize; titled++; }
  }
  await fs.writeFile(POEMS, JSON.stringify(poems, null, 2) + '\n');

  const sizes = poems.map(p => p.fontSize).filter(Boolean);
  console.log(`fitted ${sized} poems (${titled} titles too)`);
  console.log(`poem size range: ${Math.min(...sizes)}–${Math.max(...sizes)} px`);
} finally {
  ws?.close();
  chrome.kill();
}
