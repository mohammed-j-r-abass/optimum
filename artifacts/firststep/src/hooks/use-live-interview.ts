import { useCallback, useEffect, useRef, useState } from 'react';
import { GoogleGenAI, type LiveConnectConfig, type LiveServerMessage, type Session } from '@google/genai';
import { saveLiveTranscripts, startLiveInterview, type Interview, type LiveTranscriptEvent } from '@workspace/api-client-react';
import { PcmPlayer, grabJpeg, mediaError, startMicCapture, type MicCapture } from '@/lib/live-audio';
import { errorMessage } from '@/lib/media';

export type LiveStatus = 'idle' | 'connecting' | 'live' | 'ended' | 'error';
export type SaveState = 'idle' | 'saving' | 'saved' | 'error';
type Queued = { sessionId: string; event: LiveTranscriptEvent };

export const MAX_CALL_MS = 9 * 60 * 1000;
const FRAME_MS = 1100;

function uuid() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => { const r = (Math.random() * 16) | 0; return (c === 'x' ? r : (r & 3) | 8).toString(16); });
}

function startError(e: unknown): string {
  const status = (e as { status?: number } | null)?.status;
  const msg = errorMessage(e);
  if (status === 503 || status === 429) return `Live practice is unavailable right now (the voice service is busy or out of quota). ${msg} You can keep practising by typing.`;
  if (status === 401 || status === 403) return 'The live service refused this session. Please try again in a moment, or type your answers instead.';
  return `Could not start the live call: ${msg}`;
}

export function useLiveInterview(interviewId: string, onSaved: (i: Interview) => void) {
  const [status, setStatus] = useState<LiveStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [pending, setPending] = useState(0);
  const [muted, setMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [caption, setCaption] = useState({ user: '', assistant: '' });
  const [elapsed, setElapsed] = useState(0);
  const [volume, setVolumeState] = useState(1);

  const mounted = useRef(true);
  const gen = useRef(0);
  const sessionRef = useRef<Session | null>(null);
  const sessionIdRef = useRef('');
  const micStream = useRef<MediaStream | null>(null);
  const camStream = useRef<MediaStream | null>(null);
  const cameraGeneration = useRef(0);
  const inCtx = useRef<AudioContext | null>(null);
  const capture = useRef<MicCapture | null>(null);
  const player = useRef<PcmPlayer | null>(null);
  const frameTimer = useRef<number | null>(null);
  const tickTimer = useRef<number | null>(null);
  const endTimer = useRef<number | null>(null);
  const mutedRef = useRef(false);
  const volumeRef = useRef(1);
  const buf = useRef({ user: '', assistant: '' });
  const queue = useRef<Queued[]>([]);
  const saving = useRef(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const onSavedRef = useRef(onSaved);
  onSavedRef.current = onSaved;
  const idRef = useRef(interviewId);
  idRef.current = interviewId;

  const safe = useCallback((fn: () => void) => { if (mounted.current) fn(); }, []);

  const drain = useCallback(async () => {
    if (saving.current || !queue.current.length) return;
    saving.current = true;
    safe(() => setSaveState('saving'));
    try {
      while (queue.current.length) {
        const sid = queue.current[0].sessionId;
        const batch = queue.current.filter((q) => q.sessionId === sid).slice(0, 50);
        const res = await saveLiveTranscripts(idRef.current, { sessionId: sid, events: batch.map((b) => b.event) });
        const ids = new Set(batch.map((b) => b.event.id));
        queue.current = queue.current.filter((q) => !ids.has(q.event.id));
        safe(() => setPending(queue.current.length));
        onSavedRef.current(res);
      }
      safe(() => setSaveState('saved'));
    } catch {
      safe(() => setSaveState('error'));
    } finally {
      saving.current = false;
    }
  }, [safe]);

  const flush = useCallback(() => {
    const sid = sessionIdRef.current;
    const { user, assistant } = buf.current;
    buf.current = { user: '', assistant: '' };
    safe(() => setCaption({ user: '', assistant: '' }));
    if (!sid) return;
    if (user.trim()) queue.current.push({ sessionId: sid, event: { id: uuid(), role: 'user', content: user.trim() } });
    if (assistant.trim()) queue.current.push({ sessionId: sid, event: { id: uuid(), role: 'assistant', content: assistant.trim() } });
    safe(() => setPending(queue.current.length));
    void drain();
  }, [drain, safe]);

  const stopCamera = useCallback(() => {
    cameraGeneration.current++;
    if (frameTimer.current) window.clearInterval(frameTimer.current);
    frameTimer.current = null;
    camStream.current?.getTracks().forEach((t) => t.stop());
    camStream.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    safe(() => setCameraOn(false));
  }, [safe]);

  const release = useCallback(() => {
    [tickTimer, endTimer].forEach((t) => { if (t.current) window.clearInterval(t.current); t.current = null; });
    stopCamera();
    capture.current?.stop(); capture.current = null;
    micStream.current?.getTracks().forEach((t) => t.stop()); micStream.current = null;
    inCtx.current?.close().catch(() => undefined); inCtx.current = null;
    player.current?.close(); player.current = null;
    const s = sessionRef.current; sessionRef.current = null;
    try { s?.close(); } catch { /* already closed */ }
    safe(() => setSpeaking(false));
  }, [stopCamera, safe]);

  const stop = useCallback((why?: string) => {
    gen.current++;
    flush();
    release();
    safe(() => { setStatus((s) => (s === 'error' ? s : 'ended')); if (why) setNotice(why); });
  }, [flush, release, safe]);

  const startCamera = useCallback(async () => {
    const g = gen.current;
    const cameraAttempt = ++cameraGeneration.current;
    setCameraError(null);
    try {
      const cam = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 15 } } });
      if (g !== gen.current || cameraAttempt !== cameraGeneration.current || !mounted.current || !sessionRef.current) { cam.getTracks().forEach((t) => t.stop()); return; }
      camStream.current = cam;
      if (videoRef.current) { videoRef.current.srcObject = cam; videoRef.current.play().catch(() => undefined); }
      canvas.current ??= document.createElement('canvas');
      frameTimer.current = window.setInterval(() => {
        const v = videoRef.current, s = sessionRef.current;
        if (!v || !s || !canvas.current) return;
        const data = grabJpeg(v, canvas.current);
        if (data) { try { s.sendRealtimeInput({ video: { data, mimeType: 'image/jpeg' } }); } catch { /* socket closing */ } }
      }, FRAME_MS);
      setCameraOn(true);
    } catch (e) {
      safe(() => setCameraError(`${mediaError(e, 'Camera')} The call continues voice-only.`));
    }
  }, [safe]);

  const onMessage = useCallback((g: number, m: LiveServerMessage) => {
    if (g !== gen.current) return;
    const sc = m.serverContent;
    if (m.goAway) safe(() => setNotice('The live service will end this call shortly. Your transcript is being saved; use Reconnect to keep going.'));
    if (!sc) return;
    if (sc.inputTranscription?.text) {
      if (buf.current.assistant.trim()) flush();
      buf.current.user += sc.inputTranscription.text;
    }
    for (const part of sc.modelTurn?.parts ?? []) {
      const d = part.inlineData;
      if (d?.data && (!d.mimeType || d.mimeType.startsWith('audio/'))) { player.current?.play(d.data); }
    }
    if (sc.outputTranscription?.text) buf.current.assistant += sc.outputTranscription.text;
    safe(() => { setCaption({ ...buf.current }); setSpeaking(!!player.current?.speaking || !!sc.modelTurn); });
    if (sc.interrupted) { player.current?.interrupt(); flush(); safe(() => setSpeaking(false)); }
    if (sc.turnComplete) flush();
  }, [flush, safe]);

  const start = useCallback(async (withCamera: boolean) => {
    const g = ++gen.current;
    release();
    setError(null); setNotice(null); setCameraError(null); setElapsed(0); setStatus('connecting');
    mutedRef.current = false; setMuted(false);
    const alive = () => g === gen.current && mounted.current;
    try {
      const mic = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true } })
        .catch((e) => { throw new Error(mediaError(e, 'Microphone') + ' You can still type your answers below.'); });
      if (!alive()) { mic.getTracks().forEach((t) => t.stop()); return; }
      micStream.current = mic;
      inCtx.current = new AudioContext();
      player.current = new PcmPlayer(volumeRef.current);
      await Promise.all([inCtx.current.resume(), player.current.ctx.resume()]).catch(() => undefined);

      let live;
      try { live = await startLiveInterview(idRef.current); } catch (e) { throw new Error(startError(e)); }
      if (!alive()) return;
      sessionIdRef.current = live.sessionId;
      const config = JSON.parse(live.config) as LiveConnectConfig;
      const ai = new GoogleGenAI({ apiKey: live.token, httpOptions: { apiVersion: 'v1alpha' } });
      let session: Session;
      try {
        session = await ai.live.connect({
          model: live.model,
          config,
          callbacks: {
            onmessage: (m) => onMessage(g, m),
            onerror: () => {
              if (g !== gen.current) return;
              safe(() => setError('The live connection dropped. Your transcript so far is kept; press Reconnect to continue or type below.'));
            },
            onclose: (e) => {
              if (g !== gen.current) return;
              const reason = e?.reason ? ` (${e.reason.slice(0, 120)})` : '';
              const quota = /quota|exhaust|limit/i.test(e?.reason ?? '');
              gen.current++;
              flush();
              release();
              safe(() => {
                setStatus('ended');
                setNotice(quota ? 'The live service ran out of quota. Your transcript is saved; try again later or keep typing.' : `The live call closed${reason}. Press Reconnect to start a fresh call that continues from your saved transcript.`);
              });
            },
          },
        });
      } catch (e) {
        throw new Error(`The live service rejected the connection. Please retry, or type your answers instead.${e instanceof Error && /quota/i.test(e.message) ? ' (quota reached)' : ''}`);
      }
      if (!alive()) { try { session.close(); } catch { /* noop */ } return; }
      sessionRef.current = session;
      session.sendClientContent({ turns: [{ role: 'user', parts: [{ text: 'Please begin this practice interview with your first question.' }] }], turnComplete: true });

      capture.current = await startMicCapture(inCtx.current, mic, (data) => {
        if (mutedRef.current || g !== gen.current) return;
        try { sessionRef.current?.sendRealtimeInput({ audio: { data, mimeType: 'audio/pcm;rate=16000' } }); } catch { /* socket closing */ }
      });
      if (!alive()) return;

      const started = Date.now();
      const deadline = Math.min(started + MAX_CALL_MS, new Date(live.expiresAt).getTime() - 45_000 || Infinity);
      tickTimer.current = window.setInterval(() => safe(() => setElapsed(Math.floor((Date.now() - started) / 1000))), 1000);
      endTimer.current = window.setTimeout(() => stop('Live calls end after 9 minutes so everything saves cleanly. Press Reconnect to keep going from your saved transcript.'), Math.max(10_000, deadline - Date.now()));
      setStatus('live');
      if (withCamera) void startCamera();
    } catch (e) {
      if (g !== gen.current) return;
      gen.current++;
      release();
      safe(() => { setStatus('error'); setError(e instanceof Error ? e.message : 'Could not start the live call.'); });
    }
  }, [release, onMessage, flush, safe, stop, startCamera]);

  const toggleMute = useCallback(() => {
    const next = !mutedRef.current;
    mutedRef.current = next;
    micStream.current?.getAudioTracks().forEach((t) => { t.enabled = !next; });
    if (next) { try { sessionRef.current?.sendRealtimeInput({ audioStreamEnd: true }); } catch { /* noop */ } }
    setMuted(next);
  }, []);

  const toggleCamera = useCallback(() => { if (camStream.current) stopCamera(); else void startCamera(); }, [startCamera, stopCamera]);
  const setVolume = useCallback((v: number) => { volumeRef.current = v; player.current?.setVolume(v); setVolumeState(v); }, []);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      gen.current++;
      flush();
      release();
    };
  }, [flush, release]);

  const unsaved = pending + (caption.user.trim() || caption.assistant.trim() ? 1 : 0);
  return {
    status, error, notice, saveState, pending, unsaved, muted, cameraOn, cameraError, speaking, caption, elapsed, volume, videoRef,
    start, stop: () => stop(), retrySave: () => void drain(), toggleMute, toggleCamera, setVolume,
    busy: status === 'connecting' || status === 'live' || unsaved > 0 || saveState === 'saving',
  };
}
