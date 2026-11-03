// Accumulate 32 ms of mono 16 kHz signed PCM. Resampling carries state across
// render quanta so 44.1/48 kHz devices do not introduce gaps or pitch drift.
class LivePCM extends AudioWorkletProcessor {
  constructor() {
    super();
    this.sum = 0; this.count = 0; this.phase = 0;
    this.samples = new Int16Array(512); this.index = 0;
  }
  process(inputs) {
    const channel = inputs[0]?.[0];
    if (!channel) return true;
    for (const sample of channel) {
      this.sum += sample; this.count++;
      this.phase += 16000;
      if (this.phase >= sampleRate) {
        const value = Math.max(-1, Math.min(1, this.sum / this.count));
        this.samples[this.index++] = value < 0 ? value * 32768 : value * 32767;
        this.sum = 0; this.count = 0; this.phase -= sampleRate;
        if (this.index === this.samples.length) {
          this.port.postMessage(this.samples.buffer, [this.samples.buffer]);
          this.samples = new Int16Array(512); this.index = 0;
        }
      }
    }
    return true;
  }
}
registerProcessor('live-pcm', LivePCM);
