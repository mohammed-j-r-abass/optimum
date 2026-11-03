import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { buildCvPdf } from '../src/lib/cv-pdf';
import { parseLegacyCv } from '../src/lib/cv-model';
import type { CvDocument } from '@workspace/api-client-react';

const sample: CvDocument = {
  name: 'Ama Mensah',
  contact: ['ama@example.com', 'Accra, Ghana'],
  sections: [
    { title: 'Education', entries: [{ heading: 'University of Ghana', detail: 'Bachelor of Science in Computer Science', location: 'Accra', date: 'Expected 2027', bullets: [] }] },
    { title: 'Projects', entries: [{ heading: 'Community appointment tool', detail: 'Python, SQLite', location: '', date: '2026', bullets: ['Built a tool to organise community appointments.', 'Worked with two classmates to test booking conflicts.'] }] },
  ],
};
const plain = 'Ama Mensah\nama@example.com | Accra\n\nEducation\nUniversity of Ghana\nBSc Computer Science\n\nProjects\nCommunity tool\n- Built an appointment organiser.\n';
const legacy = parseLegacyCv(plain);
assert.equal(legacy.name, 'Ama Mensah');
assert.equal(legacy.sections.length, 2);
assert.ok(JSON.stringify(legacy).includes('Built an appointment organiser.'));
const noHeaders = parseLegacyCv('Ama Mensah\nama@example.com\n\nAn account of real community experience.');
assert.ok(JSON.stringify(noHeaders).includes('An account of real community experience.'));

for (const [label, doc] of [
  ['short', sample],
  ['one-page', { ...sample, sections: [
    ...sample.sections,
    { title: 'Skills & Interests', entries: [
      { heading: 'Languages', detail: 'Python, SQL, JavaScript', date: '', location: '', bullets: [] },
      { heading: 'Tools', detail: 'SQLite, Git, spreadsheets', date: '', location: '', bullets: [] },
    ] },
    { title: 'Experience', entries: [
      { heading: 'Community volunteer', detail: 'Neighbourhood learning centre', date: '2025–2026', location: '', bullets: [
        'Welcomed learners, answered questions and helped organise weekly sessions at the local community learning centre.',
        'Maintained attendance records and worked with other volunteers to prepare learning materials before each session.',
      ] },
    ] },
    { title: 'Leadership Experience', entries: [
      { heading: 'Class project coordinator', detail: 'University group project', date: '2026', location: '', bullets: [
        'Coordinated tasks for a team of classmates and checked that everyone could explain the final project.',
        'Recorded meeting notes and helped the team practise presenting its work in a clear, structured way.',
      ] },
    ] },
  ] }],
  ['long', { ...sample, sections: [{ title: 'Projects', entries: Array.from({ length: 24 }, (_, i) => ({ heading: `Project ${i + 1}`, detail: 'A detailed project with multiple responsibilities', date: '2026', location: 'Community centre', bullets: Array.from({ length: 4 }, (_, b) => `Evidence ${i + 1}.${b + 1}: ${'Delivered practical support and documented work carefully. '.repeat(5)}`) })) }] }],
] as const) {
  const blob = await buildCvPdf(doc);
  const bytes = Buffer.from(await blob.arrayBuffer());
  assert.equal(bytes.subarray(0, 5).toString(), '%PDF-');
  assert.ok(bytes.length > 1500);
  await writeFile(`/tmp/firststep-cv-${label}.pdf`, bytes);
  console.log(`PASS ${label}: real PDF generated (${bytes.length} bytes)`);
}
console.log('PASS legacy mixed-case headings and unheaded content preserved');
