import { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { errorMessage } from '@/lib/media';

export function CameraPanel({ snapshot, onSnapshot }: { snapshot: string | null; onSnapshot: (dataUrl: string | null) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [on, setOn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function stopCam() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setOn(false);
  }
  useEffect(() => () => { streamRef.current?.getTracks().forEach((t) => t.stop()); }, []);

  async function startCam() {
    setError(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      streamRef.current = s;
      setOn(true);
      requestAnimationFrame(() => { if (videoRef.current) { videoRef.current.srcObject = s; videoRef.current.play().catch(() => undefined); } });
    } catch (e) {
      setError(e instanceof DOMException && e.name === 'NotAllowedError' ? 'Camera permission was blocked. Practice works fine without it.' : `Camera could not start: ${errorMessage(e)}`);
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
        <p className="text-sm font-semibold text-ink">Camera check (optional)</p>
        {on ? (
          <Button size="sm" variant="ghost" onClick={stopCam} data-testid="button-camera-off"><CameraOff className="mr-1.5 h-3.5 w-3.5" /> Turn off</Button>
        ) : (
          <Button size="sm" variant="outline" onClick={startCam} data-testid="button-camera-on"><Camera className="mr-1.5 h-3.5 w-3.5" /> Turn on</Button>
        )}
      </div>
      {on ? (
        <video ref={videoRef} muted playsInline className="aspect-video w-full -scale-x-100 rounded-xl bg-ink object-cover" data-testid="video-preview" />
      ) : (
        <div className="grid aspect-video place-items-center rounded-xl bg-muted text-center text-xs text-muted-foreground"><span className="px-6">Your video stays on this device. Nothing is sent unless you choose to share a snapshot.</span></div>
      )}
      {error && <p className="mt-2 text-sm text-destructive" data-testid="text-camera-error">{error}</p>}
      {on && (
        <Button size="sm" className="mt-3 w-full" onClick={capture} data-testid="button-share-snapshot"><ImageIcon className="mr-1.5 h-3.5 w-3.5" /> Share snapshot with coach</Button>
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
