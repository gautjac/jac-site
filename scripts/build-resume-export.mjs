#!/usr/bin/env node
// Regenerate resume-export.md / resume-export-fr.md from the content JSON.
//
// These markdown files used to be maintained by hand and drifted five months
// behind the site. They are now derived, so src/content/{en,fr}.json stays the
// single source of truth. (The PDF button is window.print(), so it never drifts.)
//
// Usage: node scripts/build-resume-export.mjs

import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.join(import.meta.dirname, '..');

const HEAD = {
  en: { tagline: 'Creative Director · Producer · Digital Creator', place: 'Atlantic Canada' },
  fr: { tagline: 'Directeur de création · Producteur · Créateur numérique', place: 'Canada atlantique' }
};

const line = (...parts) => parts.filter(Boolean).join(' — ');

// The export is read away from the site, so site-relative links need a host.
const abs = (u) => (u?.startsWith('/') ? `https://jacgautreau.com${u}` : u);

function render(lang, content) {
  const { sections } = content.resume;
  const { tagline, place } = HEAD[lang];
  const out = [
    '# Jac Gautreau', '',
    `**${tagline}**`, '',
    `${place} · jac@jacgautreau.com`, '', '---', ''
  ];

  const section = (title, body) => { out.push(`## ${title}`, '', ...body, '---', ''); };

  section(sections.experience.title, sections.experience.items.flatMap(i =>
    [line(`**${i.role}**`, i.organization), `*${i.period}*`, ...(i.context ? [i.context] : []), '']
  ));

  section(sections.education.title, sections.education.items.flatMap(i =>
    [line(`**${i.degree}**`, i.institution), `*${i.period}*`, '']
  ));

  section(sections.skills.title, [sections.skills.content, '']);

  section(sections.highlights.title, sections.highlights.items.flatMap(i => [
    line(`**${i.project}**`, i.year),
    ...(i.context ? [i.context] : []),
    ...(i.url ? [abs(i.url)] : []),
    ...(i.linkedProjects ?? []).map(p => `- ${p.name}: ${p.url}`),
    i.roles.join(' · '),
    ''
  ]));

  section(sections.awards.title, sections.awards.items.flatMap(i =>
    [line(`**${i.award}**`, i.project, i.result, i.year), '']
  ));

  // Last section: no trailing rule.
  out.push(`## ${sections.leadership.title}`, '');
  out.push(...sections.leadership.items.flatMap(i =>
    [line(`**${i.role}**`, i.organization), `*${i.period}*`, '']
  ));

  return out.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';
}

for (const [lang, file] of [['en', 'resume-export.md'], ['fr', 'resume-export-fr.md']]) {
  const content = JSON.parse(await fs.readFile(path.join(ROOT, 'src/content', `${lang}.json`), 'utf8'));
  const dest = path.join(ROOT, file);
  await fs.writeFile(dest, render(lang, content));
  console.log(`wrote ${file}`);
}
