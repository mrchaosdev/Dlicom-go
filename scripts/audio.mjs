import { writeFileSync } from 'node:fs';
function wav(file, duration, sample) {
  const rate = 22050,
    count = Math.floor(duration * rate),
    out = Buffer.alloc(44 + count * 2);
  out.write('RIFF');
  out.writeUInt32LE(out.length - 8, 4);
  out.write('WAVE', 8);
  out.write('fmt ', 12);
  out.writeUInt32LE(16, 16);
  out.writeUInt16LE(1, 20);
  out.writeUInt16LE(1, 22);
  out.writeUInt32LE(rate, 24);
  out.writeUInt32LE(rate * 2, 28);
  out.writeUInt16LE(2, 32);
  out.writeUInt16LE(16, 34);
  out.write('data', 36);
  out.writeUInt32LE(count * 2, 40);
  for (let i = 0; i < count; i++)
    out.writeInt16LE(Math.round(Math.max(-1, Math.min(1, sample(i / rate))) * 32767), 44 + i * 2);
  writeFileSync(`public/assets/${file}.wav`, out);
}
wav(
  'attack',
  0.16,
  (t) => Math.sin(2 * Math.PI * (800 * t - 1700 * t * t)) * Math.exp(-t * 28) * 0.4,
);
wav(
  'crit',
  0.3,
  (t) =>
    (Math.sin(2 * Math.PI * 420 * t) + Math.sin(2 * Math.PI * 840 * t)) * Math.exp(-t * 18) * 0.22,
);
wav(
  'ultimate',
  0.85,
  (t) =>
    (Math.sin(2 * Math.PI * (100 * t + 350 * t * t)) + Math.sin(2 * Math.PI * 65 * t)) *
    Math.sin((Math.PI * t) / 0.85) *
    0.18,
);
wav(
  'select',
  0.25,
  (t) => Math.sin(2 * Math.PI * (t < 0.1 ? 523 : 784) * t) * Math.exp(-t * 15) * 0.3,
);
const notes = [
  130.81, 196, 261.63, 196, 155.56, 233.08, 311.13, 233.08, 103.83, 155.56, 207.65, 155.56, 116.54,
  174.61, 233.08, 174.61,
];
wav('feed-loop', 8, (t) => {
  const beat = t % 0.5;
  const f = notes[Math.floor(t * 2)];
  return (
    Math.sin(2 * Math.PI * f * t) * Math.exp(-beat * 6) * 0.12 +
    Math.sin(2 * Math.PI * f * 2 * t) * Math.exp(-beat * 12) * 0.035
  );
});
