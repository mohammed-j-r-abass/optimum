import { useEffect, useRef, useState, type MutableRefObject } from 'react';
import { Mic, MicOff, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LiveConversation, type LiveState } from '@/lib/live-conversation';
import { liveJournalKey, readJournal, recoverJournal } from '@/lib/live-journal';

export function VoicePanel({ applicationId, interviewId, onSaved, who = 'Coach', saveNote, frameRef, onLiveChange, onConnectionChange, onRecordingChange, disabled = false }: {
  buildContext: () => string;
  applicationId?: string; interviewId?: string; onSaved?: () => void;
  who?: string; saveNote: string;
  frameRef?: MutableRefObject<string | null>;
  onLiveChange?: (active: boolean) => void;
  onConnectionChange?: (connected: boolean) => void;
  onRecordingChange?: (recording: boolean) => void;
  disabled?: boolean;
}) {
  const [state, setState] = useState<LiveState>('off');
  const [consent, setConsent] = useState(false);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState({ user: '', assistant: '' });
  const [pending, setPending] = useState<{ role: string; content: string }[]>([]);
  const call = useRef<LiveConversation | null>(null);
  const callbacks = useRef({ onSaved, onLiveChange, frameRef, onConnectionChange });
  callbacks.current = { onSaved, onLiveChange, frameRef, onConnectionChange };
  const mounted = useRef(true);
  const active = state !== 'off';
  const connected = state === 'listening' || state === 'speaking';
  useEffect(() => {
    onRecordingChange?.(active);
    return () => onRecordingChange?.(false);
  }, [active, onRecordingChange]);
  const journalKey = liveJournalKey(interviewId ? 'interview' : 'application', interviewId || applicationId || '');

  async function recover() {
    setState('saving'); callbacks.current.onLiveChange?.(true);
    try {
      await recoverJournal(journalKey);
      if (mounted.current) {
        setState('off'); callbacks.current.onLiveChange?.(false);
        callbacks.current.onSaved?.();
      }
    } catch {
      if (mounted.current) {
        setState('unsaved');
        setError('An earlier live session needs to finish saving. Keep this page open and retry saving.');
      }
    }
  }
  useEffect(() => {
    mounted.current = true;
    if (readJournal(journalKey)) void recover();
    return () => { mounted.current = false; void call.current?.stop(); };
  }, [journalKey]);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    const pagehide = () => { void call.current?.stop(); };
    const blockNavigation = (event: MouseEvent) => {
      if ((event.target as Element).closest('a[href]')) {
        event.preventDefault(); event.stopPropagation();
        setError('End the live conversation and save its transcript before leaving this page.');
      }
    };
    if (active) {
      window.addEventListener('beforeunload', warn);
      window.addEventListener('pagehide', pagehide);
      document.addEventListener('click', blockNavigation, true);
    }
    return () => {
      window.removeEventListener('beforeunload', warn);
      window.removeEventListener('pagehide', pagehide);
      document.removeEventListener('click', blockNavigation, true);
    };
  }, [active]);

  function start() {
    const targetId = interviewId || applicationId;
    if (!targetId || !consent || active || disabled) return;
    setError(''); setMuted(false);
    const live = new LiveConversation({
      targetId, kind: interviewId ? 'interview' : 'application',
      frame: () => callbacks.current.frameRef?.current ?? null,
      state: value => {
        if (!mounted.current) return;
        setState(value); callbacks.current.onLiveChange?.(value !== 'off');
      },
      text: (user, assistant) => { if (mounted.current) setDraft({ user, assistant }); },
      error: message => { if (mounted.current) setError(message); },
      saved: () => callbacks.current.onSaved?.(),
      pending: events => { if (mounted.current) setPending(events); },
      connected: value => { if (mounted.current) callbacks.current.onConnectionChange?.(value); },
    });
    call.current = live;
    void live.start();
  }

  return (
    <div className="rounded-2xl border bg-secondary/50 p-4" data-testid="panel-voice">
      <p className="text-sm font-semibold">Live conversation with {who}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Gemini Live hears your microphone while connected and replies aloud. You can speak over a reply to interrupt.
        Audio is sent to Google to process, not stored by FirstStep. Transcripts are saved. {saveNote}
        Camera sharing needs a separate choice. Only answer text counts toward your score, never your voice or appearance.
      </p>
      {!active && <label className="my-3 flex items-start gap-2 text-sm">
        <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} data-testid="consent-live-audio" />
        I agree to share my microphone with Google Gemini for this live conversation.
      </label>}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {!active ? <Button onClick={start} disabled={disabled || !consent || !(applicationId || interviewId)} data-testid="button-voice-toggle"><Mic className="mr-2 h-4 w-4" />Start live conversation</Button> : <>
          <Button onClick={() => void call.current?.stop()} disabled={state === 'saving' || state === 'unsaved'} data-testid="button-end-live"><Square className="mr-2 h-4 w-4" />End live / use text</Button>
          {connected && <Button variant="outline" onClick={() => { call.current?.mute(!muted); setMuted(!muted); }} data-testid="button-mute-live">
            {muted ? <MicOff className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}{muted ? 'Unmute microphone' : 'Mute microphone'}
          </Button>}
          {state === 'unsaved' && <Button onClick={() => void (call.current ? call.current.retrySave() : recover())} data-testid="button-retry-transcript">Retry saving</Button>}
        </>}
        <span role="status" aria-live="polite" className="text-xs" data-testid="live-status">
          {state === 'off' ? 'Microphone off. Text is always available.' : state === 'reconnecting' ? 'Reconnecting — microphone is not being sent.' : state === 'listening' ? muted ? 'Connected · microphone muted' : 'Connected · listening' : state === 'speaking' ? `${who} is speaking · ${muted ? 'microphone muted' : 'you can interrupt'}` : state === 'unsaved' ? 'Transcript not yet saved' : state === 'saving' ? 'Saving transcript…' : 'Connecting…'}
        </span>
      </div>
      {(draft.user || draft.assistant) && <div className="mt-3 space-y-2 text-sm" data-testid="live-transcript">
        {draft.user && <p><strong>You (transcribing): </strong>{draft.user}</p>}
        {draft.assistant && <p><strong>{who}: </strong>{draft.assistant}</p>}
      </div>}
      {pending.length > 0 && <div className="mt-3 rounded-xl border p-3 text-sm" data-testid="pending-live-transcript">
        <p className="font-semibold">Waiting to save — keep this page open</p>
        {pending.map((event, i) => <p key={i}><strong>{event.role === 'user' ? 'You' : who}: </strong>{event.content}</p>)}
      </div>}
      {error && <p role="alert" className="mt-3 text-sm text-destructive" data-testid="text-voice-error">{error}</p>}
      <p className="mt-2 text-xs text-muted-foreground">On a connection drop, we try to reconnect up to three times. Words not transcribed cannot be saved or scored. End the call before sending a typed answer.</p>
    </div>
  );
}
