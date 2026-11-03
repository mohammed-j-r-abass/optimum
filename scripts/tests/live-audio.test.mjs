import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('../../artifacts/firststep/src/lib/pcm-worklet.js', import.meta.url), 'utf8');
function processor(sampleRate) {
  const packets = [];
  let Processor;
  runInNewContext(source, {
    AudioWorkletProcessor: class {
      port = { postMessage: buffer => packets.push(new Int16Array(buffer).slice()) };
    },
    sampleRate, Int16Array,
    registerProcessor: (_name, implementation) => { Processor = implementation; },
  });
  return { node: new Processor(), packets };
}

for (const rate of [16000, 44100, 48000, 96000]) {
  test(`${rate} Hz microphone produces 32 ms mono packets without long-term drift`, () => {
    const { node, packets } = processor(rate);
    const frames = rate * 10;
    for (let start = 0; start < frames; start += 128) {
      node.process([[new Float32Array(Math.min(128, frames - start)).fill(0.25)]]);
    }
    assert.equal(packets.length, Math.floor(160000 / 512));
    assert.ok(packets.every(p => p.length === 512));
    assert.ok(packets.every(p => [...p].every(value => value === 8191)));
  });
}
test('PCM output clips safely and preserves the sign of speech samples', () => {
  const { node, packets } = processor(16000);
  node.process([[new Float32Array(512).fill(2)]]);
  node.process([[new Float32Array(512).fill(-2)]]);
  assert.equal(packets[0][0], 32767);
  assert.equal(packets[1][0], -32768);
});
test('a missing microphone input does not emit stale audio or end the processor', () => {
  const { node, packets } = processor(48000);
  assert.equal(node.process([]), true);
  assert.equal(packets.length, 0);
});
