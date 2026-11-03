import { useEffect, useRef, useState } from 'react';
import { Loader2, Mic, Play, Square } from 'lucide-react';
import { useVoiceConversation, type VoiceInput, type VoiceResult } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { arrayBufferToBase64, base64ToBlobUrl, encodeWav, errorMessage } from '@/lib/media';

type VoiceTurn = { id: number; heard: string; reply: string; url: string };
type VoiceRequest = VoiceInput & { applicationId?: string; interviewId?: string };
type VoiceResponse = VoiceResult & { userTranscript?: string };

const TARGET_RATE = 16000;
const MAX_BYTES = 6 * 1024 * 1024;

function downsample(chunks: Float32Array[], from: number): Float32Array[] {
  if (from <= TARGET_RATE) return chunks;
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const flat = new Float32Array(total);
  let o = 0;
  for (const c of chunks) { flat.set(c, o); o += c.length; }
  const ratio = from / TARGET_RATE;
  const out = new Float32Array(Math.floor(total / ratio));
  for (let i = 0; i < out.length; i++) {
    const start = Math.floor(i * ratio);
    const end = Math.min(total, Math.floor((i + 1) * ratio));
    let sum = 0;
    for (let j = start; j < end; j++) sum += flat[j];
    out[i] = sum / Math.max(1, end - start);
  }
  return [out];
}

/**
 * Records microphone audio as 16 kHz mono WAV via WebAudio, sends it to the
 * speech-to-speech endpoint, and plays the spoken reply. When an application or
 * interview id is passed, the backend stores both transcripts in that
 * conversation and onSaved lets the caller refetch.
 */
export function VoicePanel({ buildContext, applicationId, interviewId, onSaved, onRecordingChange, who = 'Coach', saveNote }: {
  buildContext: () => string;
  applicationId?: string;
  interviewId?: string;
  onSaved?: () => void;
  onRecordingChange?: (recording: boolean) => void;
  who?: string;
  saveNote: string;
}) {
  const voice = useVoiceConversation();
  const [recording, setRecording] = useState(false);
  useEffect(() => { onRecordingChange?.(recording); }, [recording, onRecordingChange]);
  const [error, setError] = useState<string | null>(null);
  const [turns, setTurns] = useState<VoiceTurn[]>([]);
  const [seconds, setSeconds] = useState(0);
  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const procRef = useRef<ScriptProcessorNode | null>(null);
  const chunksRef = useRef<Float32Array[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlsRef = useRef<string[]>([]);
  const onSavedRef = useRef(onSaved);
  onSavedRef.current = onSaved;
  const persisted = !!(applicationId || interviewId);

  function cleanup() {
    procRef.current?.disconnect();
    procRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    ctxRef.current?.close().catch(() => undefined);
    ctxRef.current = null;
    if (timerRef.current) window.clearInterval(timerRef.current);
  }

  useEffect(() => () => {
    cleanup();
    audioRef.current?.pause();
    urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  async function start() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true } });
      streamRef.current = stream;
      const ctx = new AudioContext();
      ctxRef.current = ctx;
      const src = ctx.createMediaStreamSource(stream);
      const proc = ctx.createScriptProcessor(4096, 1, 1);
      chunksRef.current = [];
      proc.onaudioprocess = (e) => { chunksRef.current.push(new Float32Array(e.inputBuffer.getChannelData(0))); };
      src.connect(proc);
      proc.connect(ctx.destination);
      procRef.current = proc;
      setSeconds(0);
      timerRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
      setRecording(true);
    } catch (e) {
      cleanup();
      setError(e instanceof DOMException && e.name === 'NotAllowedError'
        ? 'Microphone permission was blocked. Allow it in your browser settings, or keep typing below.'
        : `We could not start the microphone: ${errorMessage(e)}`);
    }
  }

  function stop() {
    const sampleRate = ctxRef.current?.sampleRate ?? 44100;
    const chunks = chunksRef.current;
    setRecording(false);
    cleanup();
    if (chunks.length < 3) { setError('That was very short. Keep recording a moment longer while you speak.'); return; }
    const wav = encodeWav(downsample(chunks, sampleRate), Math.min(sampleRate, TARGET_RATE));
    if (wav.byteLength > MAX_BYTES) { setError('That recording is too long to send. Try answering in under three minutes.'); return; }
    const payload: VoiceRequest = { audio: arrayBufferToBase64(wav), context: buildContext(), applicationId, interviewId };
    voice.mutate(
      { data: payload },
      {
        onSuccess: (raw) => {
          const res = raw as VoiceResponse;
          const url = base64ToBlobUrl(res.audio);
          urlsRef.current.push(url);
          setTurns((t) => [...t, { id: Date.now(), heard: res.userTranscript ?? '', reply: res.transcript, url }]);
          play(url);
          onSavedRef.current?.();
        },
        onError: (e) => setError(`The spoken reply did not come through: ${errorMessage(e)}`),
      },
    );
  }

  function play(url: string) {
    audioRef.current?.pause();
    const a = new Audio(url);
    audioRef.current = a;
    a.play().catch(() => setError('Your browser blocked playback. Press the play button on the reply.'));
  }

  return (
    <div className="rounded-2xl border bg-secondary/50 p-4" data-testid="panel-voice">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative z-0">
          {recording && <span className="pulse-ring absolute inset-0 rounded-full" />}
          <Button type="button" onClick={recording ? stop : start} disabled={voice.isPending} className={`rounded-full ${recording ? 'bg-clay hover:bg-clay/90' : ''}`} data-testid="button-voice-toggle">
            {voice.isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : recording ? <Square className="mr-1.5 h-4 w-4" /> : <Mic className="mr-1.5 h-4 w-4" />}
            {voice.isPending ? `${who} is replying` : recording ? `Stop and send (${seconds}s)` : 'Speak instead'}
          </Button>
        </div>
        <p className="max-w-md text-xs text-muted-foreground">{who} answers out loud. {saveNote}</p>
      </div>
      {error && <p className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" data-testid="text-voice-error">{error}</p>}
      {turns.length > 0 && (
        <ul className="mt-4 space-y-2">
          {turns.map((t, i) => (
            <li key={t.id} className="rise rounded-xl bg-card p-3 text-sm" data-testid={`voice-turn-${i}`}>
              <p className="text-xs text-muted-foreground">You said{t.heard ? `: "${t.heard}"` : ' (words could not be transcribed)'}</p>
              <div className="mt-2 flex items-start gap-2">
                <button onClick={() => play(t.url)} className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink text-primary-foreground transition-transform hover:scale-105" aria-label="Play reply" data-testid={`button-play-${i}`}><Play className="h-3.5 w-3.5" /></button>
                <p><span className="font-semibold text-clay">{who}: </span>{t.reply}</p>
              </div>
            </li>
          ))}
          <li className="text-[11px] text-muted-foreground">
            {persisted ? 'Both sides of each spoken turn are written into your saved conversation above.' : 'Spoken turns here are not saved.'}
          </li>
        </ul>
      )}
    </div>
  );
}
