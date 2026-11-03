import type { CvDocument, CvEntry, CvSection } from '@workspace/api-client-react';

const BULLET = /^\s*(?:[-*\u2022\u25AA\u25CF\u2013]|\d+[.)])\s+/;

function isHeading(line: string): boolean {
  const t = line.trim();
  if (!t || t.length > 48 || BULLET.test(t)) return false;
  if (/^(?:education|(?:work |professional |relevant |volunteer )?experience|projects|(?:technical |key |core )?skills|volunteering|(?:awards|certifications|qualifications|leadership)(?: and activities)?|summary|professional summary|profile|languages|interests|references)$/i.test(t.replace(/:$/, ''))) return true;
  if (/^[A-Z][A-Za-z &/]+:$/.test(t)) return true;
  const letters = t.replace(/[^A-Za-z]/g, '');
  return letters.length >= 3 && letters === letters.toUpperCase() && !/[.,;]$/.test(t);
}

function clean(s: string) {
  return s.replace(/^#+\s*/, '').replace(/\*\*/g, '').trim();
}

/** Turn a legacy plain-text CV into the structured shape without inventing or dropping content. */
export function parseLegacyCv(text: string): CvDocument {
  const lines = text.replace(/\r/g, '').split('\n').map((l) => l.replace(/\s+$/, ''));
  let i = 0;
  while (i < lines.length && !lines[i].trim()) i++;
  const name = clean(lines[i] ?? '');
  i++;
  const contact: string[] = [];
  while (i < lines.length && !isHeading(clean(lines[i]))) {
    const t = clean(lines[i]);
    if (!t && contact.length) { i++; break; }
    if (t) contact.push(...t.split(/\s*[|\u2022\u00B7]\s*/).filter(Boolean));
    i++;
  }
  const sections: CvSection[] = [];
  let section: CvSection | null = null;
  let entry: CvEntry | null = null;
  const newEntry = (heading: string): CvEntry => ({ heading, detail: '', location: '', date: '', bullets: [] });
  for (; i < lines.length; i++) {
    const raw = lines[i];
    const t = clean(raw);
    if (!t) { entry = null; continue; }
    if (isHeading(t)) {
      section = { title: t.replace(/:$/, ''), entries: [] };
      sections.push(section);
      entry = null;
      continue;
    }
    if (!section) { section = { title: '', entries: [] }; sections.push(section); }
    if (BULLET.test(t)) {
      if (!entry) { entry = newEntry(''); section.entries.push(entry); }
      entry.bullets.push(t.replace(BULLET, ''));
    } else if (entry && entry.bullets.length === 0 && entry.heading && !entry.detail) {
      entry.detail = t;
    } else {
      entry = newEntry(t);
      section.entries.push(entry);
    }
  }
  return { name, contact, sections };
}

export function getCvDocument(cv: string, doc?: CvDocument): CvDocument | null {
  if (doc && doc.name && doc.sections?.length) return doc;
  if (cv?.trim()) return parseLegacyCv(cv);
  return null;
}
