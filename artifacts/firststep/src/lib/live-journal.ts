import { closeLiveSession, saveLiveTranscript } from '@workspace/api-client-react';

export type TranscriptEvent = { id: string; role: 'user' | 'assistant'; content: string; partial: boolean };
type Journal = { id: string; events: TranscriptEvent[]; user: string; assistant: string };
export const liveJournalKey = (kind: string, id: string) => `firststep-live:${kind}:${id}`;
export function readJournal(key: string): Journal | null {
  try { return JSON.parse(sessionStorage.getItem(key) ?? 'null'); } catch { return null; }
}
export function writeJournal(key: string, journal: Journal) {
  try { sessionStorage.setItem(key, JSON.stringify(journal)); return true; } catch { return false; }
}
export function removeJournal(key: string, id: string) {
  try { if (readJournal(key)?.id === id) sessionStorage.removeItem(key); } catch { /* Storage can be disabled by the browser. */ }
}
export function transcriptEvents(user: string, assistant: string): TranscriptEvent[] {
  const events: TranscriptEvent[] = [];
  for (const [role, text] of [['user', user], ['assistant', assistant]] as const) {
    for (let offset = 0; offset < text.trim().length; offset += 15000) {
      events.push({ id: crypto.randomUUID(), role, content: text.trim().slice(offset, offset + 15000), partial: true });
    }
  }
  return events;
}
/** Tokenless, tab-scoped outbox. Never put media or a provider credential here. */
export async function recoverJournal(key: string) {
  const journal = readJournal(key);
  if (!journal) return;
  journal.events.push(...transcriptEvents(journal.user, journal.assistant));
  journal.user = ''; journal.assistant = '';
  writeJournal(key, journal);
  while (journal.events.length) {
    const batch = journal.events.slice(0, 20);
    await saveLiveTranscript(journal.id, { events: batch }, { signal: AbortSignal.timeout(10000) });
    journal.events.splice(0, batch.length);
    writeJournal(key, journal);
  }
  await closeLiveSession(journal.id, { signal: AbortSignal.timeout(10000) });
  removeJournal(key, journal.id);
}
