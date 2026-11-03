import { arrayBufferToBase64 } from '@/lib/media';

export const INPUT_RATE = 16000;
export const OUTPUT_RATE = 24000;

export type MicCapture = { stop: () => void };

/** Streams mic audio as 16 kHz mono 16-bit little-endian PCM (base64 chunks). AudioWorklet first, ScriptProcessor fallback. */
export async function startMicCapture(ctx: AudioContext, stream: MediaStream, onChunk: (b64: string) => void): Promise<MicCapture> {
  const src = ctx.createMediaStreamSource(stream);
  const sink = ctx.createGain();
  sink.gain.value = 0;
  sink.connect(ctx.destination);
  try {
    await ctx.audioWorklet.addModule(`${import.meta.env.BASE_URL}pcm-capture-worklet.js`);
    const node = new AudioWorkletNode(ctx, 'pcm-capture', { processorOptions: { targetRate: INPUT_RATE } });
    node.port.onmessage = (e: MessageEvent<ArrayBuffer>) => onChunk(arrayBufferToBase64(e.data));
    src.connect(node);
    node.connect(sink);
    return { stop: () => { node.port.onmessage = null; try { src.disconnect(); node.disconnect(); sink.disconnect(); } catch { /* already gone */ } } };
  } catch {
    const proc = ctx.createScriptProcessor(4096, 1, 1);
    const ratio = Math.max(1, ctx.sampleRate / INPUT_RATE);
    let pos = 0, acc = 0, cnt = 0;
    proc.onaudioprocess = (e) => {
      const ch = e.inputBuffer.getChannelData(0);
      const out = new Int16Array(Math.ceil(ch.length / ratio) + 1);
      let n = 0;
      for (let i = 0; i < ch.length; i++) {
        acc += ch[i]; cnt++; pos += 1;
        if (pos >= ratio) {
          pos -= ratio;
          const s = Math.max(-1, Math.min(1, acc / cnt));
          acc = 0; cnt = 0;
          out[n++] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }
      }
      if (n) onChunk(arrayBufferToBase64(out.slice(0, n).buffer));
    };
    src.connect(proc);
    proc.connect(sink);
    return { stop: () => { proc.onaudioprocess = null; try { src.disconnect(); proc.disconnect(); sink.disconnect(); } catch { /* already gone */ } } };
  }
}

/** Gapless ordered playback of 24 kHz PCM chunks, interruptible. */
export class PcmPlayer {
  ctx: AudioContext;
  private gain: GainNode;
  private next = 0;
  private sources = new Set<AudioBufferSourceNode>();
  constructor(volume = 1) {
    this.ctx = new AudioContext({ sampleRate: OUTPUT_RATE });
    this.gain = this.ctx.createGain();
    this.gain.gain.value = volume;
    this.gain.connect(this.ctx.destination);
  }
  get speaking() { return this.sources.size > 0; }
  setVolume(v: number) { this.gain.gain.value = v; }
  play(b64: string) {
    const bin = atob(b64);
    const len = Math.floor(bin.length / 2);
    if (!len) return;
    const view = new DataView(new ArrayBuffer(len * 2));
    for (let i = 0; i < len * 2; i++) view.setUint8(i, bin.charCodeAt(i));
    const buf = this.ctx.createBuffer(1, len, OUTPUT_RATE);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = view.getInt16(i * 2, true) / 0x8000;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.connect(this.gain);
    const at = Math.max(this.next, this.ctx.currentTime + 0.03);
    src.start(at);
    this.next = at + buf.duration;
    this.sources.add(src);
    src.onended = () => { this.sources.delete(src); };
  }
  interrupt() {
    this.sources.forEach((s) => { try { s.stop(); } catch { /* not started */ } s.disconnect(); });
    this.sources.clear();
    this.next = 0;
  }
  close() { this.interrupt(); this.ctx.close().catch(() => undefined); }
}

export function grabJpeg(video: HTMLVideoElement, canvas: HTMLCanvasElement): string | null {
  const w0 = video.videoWidth, h0 = video.videoHeight;
  if (!w0 || !h0) return null;
  const scale = Math.min(1, 640 / w0, 480 / h0);
  canvas.width = Math.round(w0 * scale);
  canvas.height = Math.round(h0 * scale);
  canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
  const url = canvas.toDataURL('image/jpeg', 0.6);
  return url.slice(url.indexOf(',') + 1);
}

export function mediaError(e: unknown, what: string): string {
  const name = e instanceof DOMException ? e.name : '';
  if (name === 'NotAllowedError' || name === 'SecurityError') return `${what} permission was blocked. Allow it from the icon in your browser's address bar, then try again.`;
  if (name === 'NotFoundError' || name === 'OverconstrainedError') return `No ${what.toLowerCase()} was found. Plug one in or check your system settings.`;
  if (name === 'NotReadableError' || name === 'AbortError') return `Your ${what.toLowerCase()} is busy in another app or tab. Close it there and try again.`;
  return `We could not start your ${what.toLowerCase()}.`;
}
