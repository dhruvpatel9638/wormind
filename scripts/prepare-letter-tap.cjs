// Derive a responsive drag clip from the original effect, preserving its tone.
// Run with: node scripts/prepare-letter-tap.cjs
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const source = fs.readFileSync(path.join(__dirname, '../assets/sounds/btn_1.wav'));
assert.equal(source.toString('ascii', 0, 4), 'RIFF');
assert.equal(source.toString('ascii', 8, 12), 'WAVE');
let format, data;
for (let offset = 12; offset + 8 <= source.length;) {
  const length = source.readUInt32LE(offset + 4);
  const id = source.toString('ascii', offset, offset + 4);
  if (id === 'fmt ') format = source.subarray(offset + 8, offset + 8 + length);
  if (id === 'data') data = source.subarray(offset + 8, offset + 8 + length);
  offset += 8 + length + (length % 2);
}
assert.ok(format && data);
assert.equal(format.readUInt16LE(0), 1, 'PCM required');
assert.equal(format.readUInt16LE(14), 16, '16-bit samples required');
const channels = format.readUInt16LE(2);
const rate = format.readUInt32LE(4);
const frameSize = format.readUInt16LE(12);
const frames = data.length / frameSize;
let first = frames, last = 0;
for (let frame = 0; frame < frames; frame++) {
  for (let channel = 0; channel < channels; channel++) {
    if (Math.abs(data.readInt16LE(frame * frameSize + channel * 2)) > 10) {
      first = Math.min(first, frame);
      last = frame;
    }
  }
}
assert.ok(first < last, 'Effect must contain audible samples');
const padding = Math.ceil(rate * 0.002);
const start = Math.max(0, first - padding);
const end = Math.min(frames, last + padding + 1);
const trimmed = Buffer.from(data.subarray(start * frameSize, end * frameSize));
const trimmedFrames = trimmed.length / frameSize;
for (let frame = 0; frame < trimmedFrames; frame++) {
  const gain = Math.min(1, frame / padding, (trimmedFrames - frame - 1) / padding);
  for (let channel = 0; channel < channels; channel++) {
    const offset = frame * frameSize + channel * 2;
    trimmed.writeInt16LE(Math.round(trimmed.readInt16LE(offset) * gain), offset);
  }
}
const header = Buffer.alloc(44);
header.write('RIFF');
header.writeUInt32LE(36 + trimmed.length, 4);
header.write('WAVEfmt ', 8);
header.writeUInt32LE(16, 16);
format.copy(header, 20, 0, 16);
header.write('data', 36);
header.writeUInt32LE(trimmed.length, 40);
fs.writeFileSync(path.join(__dirname, '../assets/sounds/letter_tap.wav'), Buffer.concat([header, trimmed]));
console.log(`Letter tap: removed ${(start / rate * 1000).toFixed(1)} ms of leading silence; ${(trimmedFrames / rate * 1000).toFixed(1)} ms clip.`);
