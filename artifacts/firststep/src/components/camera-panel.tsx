import { useEffect, useRef, useState, type MutableRefObject } from 'react';
import { Camera, CameraOff, ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { errorMessage } from '@/lib/media';

export function CameraPanel({ snapshot, onSnapshot, liveActive = false, liveConnected = false, frameRef }: {
  snapshot: string | null; onSnapshot: (dataUrl: string | null) => void;
  liveActive?: boolean; liveConnected?: boolean; frameRef?: MutableRefObject<string | null>;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [on, setOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [starting, setStarting] = useState(false);
  const generation = useRef(0);

  useEffect(() => {
    if (!liveConnected) setSharing(false);
  }, [liveConnected]);
  useEffect(() => {
    if (frameRef) frameRef.current = null;
    if (!on || !sharing || !liveConnected || !frameRef) return;
    const timer = window.setInterval(() => {
      const video = videoRef.current;
      if (!video?.videoWidth || video.readyState < 2) { frameRef.current = null; return; }
      const canvas = document.createElement('canvas');
      canvas.width = 320; canvas.height = 240;
      canvas.getContext('2d')?.drawImage(video, 0, 0, 320, 240);
      frameRef.current = canvas.toDataURL('image/jpeg', 0.6);
    }, 1000);
    return () => { window.clearInterval(timer); frameRef.current = null; };
  }, [on, sharing, liveConnected, frameRef]);

  function stopCam() {
    generation.current++;
    if (frameRef) frameRef.current = null;
    setSharing(false);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setOn(false);
  }
  useEffect(() => () => {
    generation.current++;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    if (frameRef) frameRef.current = null;
  }, [frameRef]);

  async function startCam() {
    const attempt = ++generation.current;
    setError(null);
    setStarting(true);
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      if (attempt !== generation.current) { s.getTracks().forEach(t => t.stop()); return; }
      streamRef.current = s;
      s.getVideoTracks()[0].onended = stopCam;
      setOn(true);
      requestAnimationFrame(() => { if (videoRef.current) { videoRef.current.srcObject = s; videoRef.current.play().catch(() => undefined); } });
    } catch (e) {
      setError(e instanceof DOMException && e.name === 'NotAllowedError' ? 'Camera permission was blocked. Practice works fine without it.' : `Camera could not start: ${errorMessage(e)}`);
    } finally {
      if (attempt === generation.current) setStarting(false);
    }
  }

  function capture() {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    const c = document.createElement('canvas');
    c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext('2d')?.drawImage(v, 0, 0);
    onSnapshot(c.toDataURL('image/jpeg', 0.8));
  }

  return (
    <div className="rounded-2xl border bg-card p-4" data-testid="panel-camera">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-ink">Camera (optional)</p>
        {on ? (
          <Button size="sm" variant="ghost" onClick={stopCam} data-testid="button-camera-off"><CameraOff className="mr-1.5 h-3.5 w-3.5" /> Turn off</Button>
        ) : (
          <Button size="sm" variant="outline" onClick={startCam} disabled={starting} data-testid="button-camera-on"><Camera className="mr-1.5 h-3.5 w-3.5" />{starting ? 'Starting…' : 'Preview camera'}</Button>
        )}
      </div>
      {on ? (
        <video ref={videoRef} muted playsInline className="aspect-video w-full -scale-x-100 rounded-xl bg-ink object-cover" data-testid="video-preview" />
      ) : (
        <div className="grid aspect-video place-items-center rounded-xl bg-muted text-center text-xs text-muted-foreground"><span className="px-6">Your video stays on this device. Nothing is sent unless you choose to share a snapshot.</span></div>
      )}
      {error && <p className="mt-2 text-sm text-destructive" data-testid="text-camera-error">{error}</p>}
      {on && <p className="mt-2 text-xs text-muted-foreground" role="status">
        {sharing && liveConnected ? 'Sharing live frames with Google Gemini (about one per second). Not stored by FirstStep.' : 'Local preview only. No camera frames are being sent.'}
      </p>}
      {on && liveConnected && <label className="mt-3 flex items-start gap-2 text-xs">
        <input type="checkbox" checked={sharing} onChange={e => {
          if (frameRef) frameRef.current = null;
          setSharing(e.target.checked);
        }} data-testid="consent-live-camera" />
        I agree to send live camera frames to Google Gemini for lighting and framing tips only. This never affects my score. Uncheck to stop sharing.
      </label>}
      {on && (
        <Button size="sm" className="mt-3 w-full" onClick={capture} disabled={liveActive} data-testid="button-share-snapshot"><ImageIcon className="mr-1.5 h-3.5 w-3.5" /> Attach snapshot to typed answer</Button>
      )}
      {snapshot && (
        <div className="rise mt-3 flex items-center gap-3 rounded-xl bg-secondary/60 p-2">
          <img src={snapshot} alt="Snapshot to share" className="h-12 w-16 rounded-md object-cover" />
          <p className="flex-1 text-xs text-secondary-foreground">Attached to your next answer. The coach only comments on lighting and framing.</p>
          <button onClick={() => onSnapshot(null)} aria-label="Remove snapshot" className="p-1" data-testid="button-remove-snapshot"><X className="h-4 w-4" /></button>
        </div>
      )}
    </div>
  );
}
