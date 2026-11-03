import { GoogleGenAI, Modality, type LiveServerMessage, type Session } from '@google/genai';
import { createLiveSession, saveLiveTranscript, closeLiveSession, type LiveSessionResult } from '@workspace/api-client-react';
import { arrayBufferToBase64 } from './media';
import workletUrl from './pcm-worklet.js?url';
import { liveJournalKey, writeJournal, removeJournal, transcriptEvents, type TranscriptEvent } from './live-journal';

export type LiveState = 'off' | 'connecting' | 'listening' | 'speaking' | 'reconnecting' | 'saving' | 'unsaved';
type Options = {
  targetId: string; kind: 'interview' | 'application';
  frame: () => string | null;
  state: (state: LiveState) => void;
  text: (user: string, assistant: string) => void;
  error: (message: string) => void;
  saved: () => void;
  pending: (events: { role: string; content: string }[]) => void;
  connected: (value: boolean) => void;
};

/** Media bytes go straight to Gemini, never to our database. Only text is saved. */
export class LiveConversation {
  private credential?: LiveSessionResult;
  private session?: Session;
  private context?: AudioContext;
  private stream?: MediaStream;
  private worklet?: AudioWorkletNode;
  private legacyProcessor?: ScriptProcessorNode;
  private output = new Set<AudioBufferSourceNode>();
  private nextAudioTime = 0;
  private frameTimer?: number;
  private expiryTimer?: number;
  private retryTimer?: number;
  private connectTimer?: number;
  private generation = 0;
  private reconnects = 0;
  private handle?: string;
  private stopped = false;
  private ready = false;
  private user = '';
  private assistant = '';
  private queue: TranscriptEvent[] = [];
  private saving?: Promise<void>;
  private closed = false;
  private muted = false;
  private readonly journalKey: string;
  private storageWarning = false;
  constructor(private options: Options) {
    this.journalKey = liveJournalKey(options.kind, options.targetId);
  }

  private persist() {
    if (!this.credential) return;
    if (!writeJournal(this.journalKey, { id: this.credential.id, events: this.queue, user: this.user, assistant: this.assistant }) && !this.storageWarning) {
      this.storageWarning = true;
      this.options.error('Your browser cannot keep a recovery copy. Keep this page open until the transcript has saved.');
    }
  }

  private async bounded<T>(promise: Promise<T>, ms: number): Promise<T> {
    let timer: number | undefined;
    try {
      return await Promise.race([promise, new Promise<never>((_, reject) => {
        timer = window.setTimeout(() => reject(new Error('Audio startup timed out')), ms);
      })]);
    } finally { window.clearTimeout(timer); }
  }

  private sendAudio(data: ArrayBuffer) {
    if (this.ready && !this.muted && !this.stopped) {
      try { this.session?.sendRealtimeInput({ audio: { data: arrayBufferToBase64(data), mimeType: 'audio/pcm;rate=16000' } }); }
      catch { this.dropped(); }
    }
  }

  private async capture(stream: MediaStream) {
    const context = this.context!;
    const source = context.createMediaStreamSource(stream);
    try {
      await this.bounded(context.audioWorklet.addModule(workletUrl), 2500);
      if (this.stopped) return;
      this.worklet = new AudioWorkletNode(context, 'live-pcm');
      this.worklet.port.onmessage = ({ data }: MessageEvent<ArrayBuffer>) => this.sendAudio(data);
      source.connect(this.worklet);
      this.worklet.connect(context.destination);
    } catch {
      if (this.stopped) return;
      // Compatibility path for browsers unable to start AudioWorklet. Keep the
      // same streaming PCM contract; never fall back to recorded whole turns.
      const processor = context.createScriptProcessor(1024, 1, 1);
      this.legacyProcessor = processor;
      let phase = 0, sum = 0, count = 0;
      processor.onaudioprocess = event => {
        const samples: number[] = [];
        for (const sample of event.inputBuffer.getChannelData(0)) {
          sum += sample; count++; phase += 16000;
          if (phase >= context.sampleRate) {
            const value = Math.max(-1, Math.min(1, sum / count));
            samples.push(value < 0 ? value * 32768 : value * 32767);
            phase -= context.sampleRate; sum = 0; count = 0;
          }
        }
        this.sendAudio(Int16Array.from(samples).buffer);
        event.outputBuffer.getChannelData(0).fill(0);
      };
      source.connect(processor); processor.connect(context.destination);
    }
  }

  async start() {
    this.options.state('connecting');
    try {
      // Called from a user gesture, before network waits, to unlock audio on mobile.
      this.context = new AudioContext();
      await this.bounded(this.context.resume(), 5000);
      const stream = await this.bounded(navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      }).then(value => {
        if (this.stopped) value.getTracks().forEach(track => track.stop());
        return value;
      }), 45000);
      if (this.stopped) { stream.getTracks().forEach(t => t.stop()); return; }
      this.stream = stream;
      stream.getAudioTracks()[0].onended = () => {
        this.options.error('Microphone disconnected. The live call has ended; you can keep typing.');
        void this.stop();
      };
      await this.capture(stream);
      if (this.stopped) return;
      const credential = await createLiveSession({ targetId: this.options.targetId, kind: this.options.kind, microphoneConsent: true }, { signal: AbortSignal.timeout(15000) });
      this.credential = credential;
      this.persist();
      if (this.stopped) { await this.close(); return; }
      this.expiryTimer = window.setTimeout(() => {
        this.options.error('This live session has reached its 20-minute limit. Start another when you are ready.');
        void this.stop();
      }, Math.max(0, Date.parse(credential.expiresAt) - Date.now()));
      await this.connect();
      this.frameTimer = window.setInterval(() => {
        const frame = this.options.frame();
        if (frame && this.ready && !this.stopped) {
          try { this.session?.sendRealtimeInput({ video: { data: frame.split(',')[1], mimeType: 'image/jpeg' } }); }
          catch { this.dropped(); }
        }
      }, 1000);
    } catch {
      this.options.error('Live conversation could not start. Check microphone permission and Gemini Live access, or type your answer instead.');
      await this.stop();
    }
  }

  private async connect() {
    if (!this.credential || this.stopped) return;
    const generation = ++this.generation;
    this.ready = false;
    this.options.connected?.(false);
    this.options.state(this.reconnects ? 'reconnecting' : 'connecting');
    this.connectTimer = window.setTimeout(() => this.dropped(), 12000);
    const ai = new GoogleGenAI({ apiKey: this.credential.token, httpOptions: { apiVersion: 'v1beta' } });
    const session = await ai.live.connect({
      model: this.credential.model,
      config: {
        responseModalities: [Modality.AUDIO],
        inputAudioTranscription: {}, outputAudioTranscription: {},
        sessionResumption: this.handle ? { handle: this.handle } : {},
        contextWindowCompression: { slidingWindow: {} },
      },
      callbacks: {
        onmessage: message => { if (generation === this.generation && !this.stopped) this.message(message); },
        onerror: () => { if (generation === this.generation) this.dropped(); },
        onclose: () => { if (generation === this.generation) this.dropped(); },
      },
    });
    if (this.stopped || generation !== this.generation) { session.close(); return; }
    this.session = session;
    if (!this.handle && !this.reconnects) {
      session.sendClientContent({ turns: [{ role: 'user', parts: [{ text: 'Begin the live practice. Briefly repeat the current question from our saved conversation so I can answer aloud.' }] }], turnComplete: true });
    }
  }

  private message(message: LiveServerMessage) {
    if (message.setupComplete) {
      window.clearTimeout(this.connectTimer);
      this.ready = true;
      this.options.connected?.(true);
      this.options.state('listening');
    }
    if (message.sessionResumptionUpdate?.resumable && message.sessionResumptionUpdate.newHandle) {
      this.handle = message.sessionResumptionUpdate.newHandle;
    }
    const content = message.serverContent;
    if (content) {
      if (content.inputTranscription?.text) this.user += content.inputTranscription.text;
      if (content.outputTranscription?.text) this.assistant += content.outputTranscription.text;
      this.persist();
      this.options.text(this.user, this.assistant);
      if (content.interrupted) {
        this.interrupt();
        this.flush(true);
      } else {
        for (const part of content.modelTurn?.parts ?? []) {
          if (part.inlineData?.data && part.inlineData.mimeType?.startsWith('audio/pcm')) {
            const rate = Number(/rate=(\d+)/.exec(part.inlineData.mimeType)?.[1] ?? 24000);
            this.play(part.inlineData.data, rate);
          }
        }
      }
      if (content.turnComplete) {
        this.flush(false);
        this.reconnects = 0;
        if (!this.output.size) this.options.state('listening');
      }
    }
    if (message.goAway) this.dropped();
  }

  private play(base64: string, rate: number) {
    if (!this.context) return;
    const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    const pcm = new DataView(bytes.buffer);
    const buffer = this.context.createBuffer(1, bytes.length / 2, rate);
    const samples = buffer.getChannelData(0);
    for (let i = 0; i < samples.length; i++) samples[i] = pcm.getInt16(i * 2, true) / 32768;
    const node = this.context.createBufferSource();
    node.buffer = buffer; node.connect(this.context.destination);
    this.nextAudioTime = Math.max(this.context.currentTime, this.nextAudioTime);
    node.start(this.nextAudioTime);
    this.nextAudioTime += buffer.duration;
    this.output.add(node);
    node.onended = () => {
      this.output.delete(node);
      if (!this.output.size && this.ready && !this.stopped) this.options.state('listening');
    };
    this.options.state('speaking');
  }

  interrupt() {
    for (const source of this.output) { source.stop(); source.disconnect(); }
    this.output.clear(); this.nextAudioTime = 0;
  }

  mute(value: boolean) {
    this.muted = value;
    this.stream?.getAudioTracks().forEach(t => { t.enabled = !value; });
    if (value && this.ready) this.session?.sendRealtimeInput({ audioStreamEnd: true });
  }

  private dropped() {
    if (this.stopped || this.retryTimer) return;
    this.ready = false;
    this.options.connected?.(false);
    ++this.generation;
    window.clearTimeout(this.connectTimer);
    this.session?.close(); this.session = undefined;
    this.interrupt();
    this.flush(true);
    // A token permits one new session, but multiple resumptions. Never replay
    // microphone packets: they may already have been heard before the drop.
    if (!this.handle || this.reconnects >= 3) {
      this.options.error('The live connection ended. Your transcribed words are saved below. You can restart or use text; repeat any words that were not transcribed.');
      void this.stop(); return;
    }
    this.options.state('reconnecting');
    this.retryTimer = window.setTimeout(() => {
      this.retryTimer = undefined;
      void this.connect().catch(() => this.dropped());
    }, 500 * 2 ** this.reconnects++);
  }

  private flush(partial: boolean) {
    this.queue.push(...transcriptEvents(this.user, this.assistant).map(event => ({ ...event, partial })));
    this.user = ''; this.assistant = '';
    this.persist();
    this.options.pending?.([...this.queue]);
    this.options.text('', '');
    void this.save().catch(() => undefined);
  }

  private save(): Promise<void> {
    if (this.saving) return this.saving;
    this.saving = (async () => {
      while (this.queue.length && this.credential) {
        const batch = this.queue.slice(0, 20);
        await saveLiveTranscript(this.credential.id, { events: batch }, { keepalive: true, signal: AbortSignal.timeout(10000) });
        this.queue.splice(0, batch.length);
        this.persist();
        this.options.pending?.([...this.queue]);
        this.options.saved();
      }
    })().catch(() => {
      this.options.error('Some transcript text is not saved yet. Keep this page open and retry saving before finishing.');
      throw new Error('Transcript not saved');
    }).finally(() => { this.saving = undefined; });
    return this.saving;
  }

  private async close() {
    if (this.credential && !this.closed) {
      await closeLiveSession(this.credential.id, { keepalive: true, signal: AbortSignal.timeout(10000) });
      this.closed = true;
      removeJournal(this.journalKey, this.credential.id);
    }
  }

  async stop() {
    this.stopped = true; this.ready = false; ++this.generation;
    window.clearTimeout(this.retryTimer); window.clearTimeout(this.expiryTimer);
    window.clearTimeout(this.connectTimer); window.clearInterval(this.frameTimer);
    this.session?.close(); this.session = undefined;
    this.stream?.getTracks().forEach(t => { t.onended = null; t.stop(); });
    this.worklet?.disconnect();
    this.legacyProcessor?.disconnect();
    this.interrupt();
    void this.context?.close().catch(() => undefined);
    this.options.connected?.(false);
    this.flush(true);
    await this.retrySave();
  }

  async retrySave() {
    this.options.state('saving');
    try {
      await this.save();
      await this.close();
      this.options.state('off');
    } catch {
      this.options.state('unsaved');
      this.options.error('The transcript or session could not finish saving. Keep this page open and press Retry saving.');
    }
  }
}
