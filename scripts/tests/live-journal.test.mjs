import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';

const source = readFileSync(new URL('../../artifacts/firststep/src/lib/live-journal.ts', import.meta.url), 'utf8');
const js = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
function setup(api = {}) {
  const storage = new Map();
  const writes = [];
  const closed = [];
  const exports = {};
  runInNewContext(js, {
    exports, crypto: { randomUUID }, AbortSignal,
    sessionStorage: {
      getItem: key => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
      removeItem: key => storage.delete(key),
    },
    require: () => ({
      saveLiveTranscript: async (id, body) => { writes.push({ id, ...body }); await api.save?.(id, body); },
      closeLiveSession: async id => { closed.push(id); await api.close?.(id); },
    }),
  });
  return { journal: exports, storage, writes, closed };
}
test('reload recovery saves final draft and pending events before closing the prior call', async () => {
  const { journal, storage, writes, closed } = setup();
  const key = journal.liveJournalKey('interview', 'practice');
  journal.writeJournal(key, { id: 'session', events: [{ id: 'old', role: 'user', content: 'Already queued', partial: false }], user: 'Final words', assistant: 'Final reply' });
  await journal.recoverJournal(key);
  assert.equal(writes[0].events.length, 3);
  assert.equal(writes[0].events[1].content, 'Final words');
  assert.equal(writes[0].events[2].partial, true);
  assert.equal(closed[0], 'session');
  assert.equal(storage.size, 0);
});
test('failed network writes retain stable event identifiers for idempotent retries', async () => {
  let fail = true;
  const { journal, writes, closed } = setup({ save: async () => { if (fail) throw new Error('offline'); } });
  journal.writeJournal('key', { id: 'session', events: [], user: 'My answer', assistant: '' });
  await assert.rejects(journal.recoverJournal('key'), /offline/);
  const firstId = writes[0].events[0].id;
  assert.equal(closed.length, 0);
  assert.equal(journal.readJournal('key').events[0].id, firstId);
  fail = false;
  await journal.recoverJournal('key');
  assert.equal(writes[1].events[0].id, firstId);
  assert.equal(journal.readJournal('key'), null);
});
test('failed close retains recovery state but does not replay already saved text', async () => {
  let fail = true;
  const { journal, writes } = setup({ close: async () => { if (fail) throw new Error('offline'); } });
  journal.writeJournal('key', { id: 'session', events: [], user: 'Saved words', assistant: '' });
  await assert.rejects(journal.recoverJournal('key'));
  assert.equal(journal.readJournal('key').events.length, 0);
  fail = false;
  await journal.recoverJournal('key');
  assert.equal(writes.length, 1);
});
test('long transcripts are chunked within the API limit without losing text', () => {
  const { journal } = setup();
  const text = 'a'.repeat(31000);
  const events = journal.transcriptEvents(text, '');
  assert.equal(events.length, 3);
  assert.ok(events.every(e => e.content.length <= 15000));
  assert.equal(events.map(e => e.content).join(''), text);
});
test('an older call cannot remove a newer calls recovery record', () => {
  const { journal } = setup();
  journal.writeJournal('key', { id: 'new-session', events: [], user: '', assistant: '' });
  journal.removeJournal('key', 'old-session');
  assert.equal(journal.readJournal('key').id, 'new-session');
});
