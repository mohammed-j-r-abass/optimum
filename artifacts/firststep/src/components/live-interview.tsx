import { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, Headphones, Loader2, Mic, MicOff, PhoneOff, Radio, RefreshCw, Volume2 } from 'lucide-react';
import type { Interview } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { useLiveInterview } from '@/hooks/use-live-interview';

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export function LiveInterview({ interviewId, onSaved, onBusyChange }: {
  interviewId: string;
  onSaved: (i: Interview) => void;
  onBusyChange: (busy: boolean) => void;
}) {
  const live = useLiveInterview(interviewId, onSaved);
  const [shareCam, setShareCam] = useState(false);
  const busyRef = useRef(onBusyChange);
  busyRef.current = onBusyChange;
  useEffect(() => { busyRef.current(live.busy); }, [live.busy]);

  const active = live.status === 'live';
  const connecting = live.status === 'connecting';
  const left = Math.max(0, 9 * 60 - live.elapsed);

  return (
    <div className="rise overflow-hidden rounded-2xl border bg-card" data-testid="panel-live">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-secondary/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="relative z-0 grid h-7 w-7 place-items-center">
            {active && <span className="pulse-ring absolute inset-0 rounded-full" />}
            <Radio className={`h-4 w-4 ${active ? 'text-clay' : 'text-muted-foreground'}`} />
          </span>
          <p className="text-sm font-semibold text-ink">Live interview</p>
          <span className={`rounded-full px-2 py-0.5 font-mono text-[11px] ${active ? 'bg-clay/15 text-clay' : 'bg-muted text-muted-foreground'}`} data-testid="status-live">
            {active ? `Live · ${mmss(live.elapsed)} · ${mmss(left)} left` : connecting ? 'Connecting' : live.status === 'ended' ? 'Call ended' : live.status === 'error' ? 'Not connected' : 'Ready'}
          </span>
        </div>
        <SaveBadge state={live.saveState} pending={live.pending} onRetry={live.retrySave} />
      </div>

      <div className="grid gap-4 p-4 md:grid-cols-[1fr_220px]">
        <div className="space-y-3">
          {!active && !connecting && (
            <div className="space-y-3">
              <p className="text-sm text-ink">Talk with the interviewer in real time. Speak naturally; you can interrupt, and it will stop and listen.</p>
              <label className="flex cursor-pointer items-start gap-2 rounded-xl border p-3 text-sm hover:border-clay/50" data-testid="label-share-camera">
                <input type="checkbox" checked={shareCam} onChange={(e) => setShareCam(e.target.checked)} className="mt-0.5 accent-[hsl(var(--clay))]" data-testid="checkbox-share-camera" />
                <span><span className="font-medium text-ink">Share camera with AI</span><span className="block text-xs text-muted-foreground">Optional. Only used for observable tips like framing, lighting and background, or things you ask about.</span></span>
              </label>
              <p className="flex items-start gap-2 text-xs text-muted-foreground"><Headphones className="mt-0.5 h-3.5 w-3.5 shrink-0" />Headphones work best so the interviewer does not hear itself.</p>
              <Button onClick={() => live.start(shareCam)} disabled={live.unsaved > 0 || live.saveState === 'saving'} className="w-full justify-center whitespace-normal py-6 text-left" data-testid="button-start-live">
                <Mic className="mr-2 h-4 w-4 shrink-0" />
                {live.status === 'idle' ? 'Start live call' : 'Reconnect'}: send my microphone{shareCam ? ' and camera' : ''} to Google
              </Button>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Audio{shareCam ? ' and video frames' : ''} stream to Google's Gemini Live service during the call. Optimum saves the written transcript, not audio or video. Google processes the stream under its service policies. {live.status !== 'idle' && 'Reconnect starts a new call that continues from your saved transcript.'} The interviewer does not infer emotions, personality or ability from your appearance.
              </p>
            </div>
          )}
          {connecting && <p className="flex items-center gap-2 py-6 text-sm text-muted-foreground" data-testid="text-live-connecting"><Loader2 className="h-4 w-4 animate-spin" />Asking for permission and connecting...</p>}
          {active && (
            <>
              <div className="min-h-[96px] rounded-xl bg-background/70 p-3 text-sm" data-testid="text-live-caption">
                {live.caption.assistant && <p><span className="font-semibold text-clay">Interviewer: </span>{live.caption.assistant}</p>}
                {live.caption.user && <p className="mt-1 text-ink/80"><span className="font-semibold text-ink">You: </span>{live.caption.user}</p>}
                {!live.caption.assistant && !live.caption.user && <p className="text-muted-foreground">{live.speaking ? 'Interviewer is speaking...' : 'Listening. Finished lines move into the conversation above.'}</p>}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" onClick={live.toggleMute} data-testid="button-live-mute">{live.muted ? <MicOff className="mr-1.5 h-4 w-4" /> : <Mic className="mr-1.5 h-4 w-4" />}{live.muted ? 'Unmute' : 'Mute'}</Button>
                <Button variant="outline" size="sm" onClick={live.toggleCamera} data-testid="button-live-camera">{live.cameraOn ? <CameraOff className="mr-1.5 h-4 w-4" /> : <Camera className="mr-1.5 h-4 w-4" />}{live.cameraOn ? 'Stop camera' : 'Share camera'}</Button>
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground"><Volume2 className="h-4 w-4" />
                  <input type="range" min={0} max={1} step={0.05} value={live.volume} onChange={(e) => live.setVolume(Number(e.target.value))} className="w-20 accent-[hsl(var(--ink))]" aria-label="Interviewer volume" data-testid="input-live-volume" />
                </label>
                <Button size="sm" onClick={live.stop} className="ml-auto bg-clay hover:bg-clay/90" data-testid="button-live-stop"><PhoneOff className="mr-1.5 h-4 w-4" />End call</Button>
              </div>
              {live.muted && <p className="text-xs text-muted-foreground">Muted: nothing from your microphone is sent.</p>}
            </>
          )}
          {live.notice && <p className="rounded-lg bg-millet/20 px-3 py-2 text-sm text-ink" data-testid="text-live-notice">{live.notice}</p>}
          {live.error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" data-testid="text-live-error">{live.error}</p>}
          {live.cameraError && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" data-testid="text-camera-error">{live.cameraError}</p>}
        </div>

        <div className="space-y-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-ink">
            <video ref={live.videoRef} muted playsInline className={`h-full w-full -scale-x-100 object-cover ${live.cameraOn ? '' : 'hidden'}`} data-testid="video-live-preview" />
            {!live.cameraOn && <div className="grid h-full place-items-center text-center text-xs text-primary-foreground/60"><div><CameraOff className="mx-auto mb-1 h-5 w-5" />Camera off</div></div>}
          </div>
          <p className={`text-[11px] ${live.cameraOn ? 'font-medium text-clay' : 'text-muted-foreground'}`} data-testid="text-camera-state">
            {live.cameraOn ? 'Camera shared with AI — sampled about once per second' : 'Camera not shared'}
          </p>
        </div>
      </div>
    </div>
  );
}

function SaveBadge({ state, pending, onRetry }: { state: string; pending: number; onRetry: () => void }) {
  if (state === 'error') return (
    <button onClick={onRetry} className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive" data-testid="button-retry-save">
      <RefreshCw className="h-3 w-3" />Not saved ({pending}) - retry
    </button>
  );
  if (state === 'saving' || pending > 0) return <span className="inline-flex items-center gap-1 text-xs text-muted-foreground" data-testid="status-save"><Loader2 className="h-3 w-3 animate-spin" />Saving transcript</span>;
  if (state === 'saved') return <span className="text-xs text-muted-foreground" data-testid="status-save">Saved</span>;
  return null;
}
