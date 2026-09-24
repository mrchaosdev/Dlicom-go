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
wav('dodge', 0.2, (t) => Math.sin(2 * Math.PI * (850 - 650 * t) * t) * Math.exp(-t * 18) * 0.24);
wav('heal', 0.38, (t) => Math.sin(2 * Math.PI * (420 * t + 480 * t * t)) * Math.sin(Math.PI * t / 0.38) * 0.2);
wav('shield', 0.28, (t) => (Math.sin(2 * Math.PI * 392 * t) + Math.sin(2 * Math.PI * 587 * t)) * Math.exp(-t * 9) * 0.16);
wav('death', 0.32, (t) => Math.sin(2 * Math.PI * (520 * t - 500 * t * t)) * Math.exp(-t * 11) * 0.25);
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
const loop = (file, notes, options) => {
  const beatLength = options.beatLength ?? 0.5;
  wav(file, 8, (t) => {
    const step = Math.floor(t / beatLength), beat = t % beatLength;
    const note = notes[step % notes.length];
    const bass = options.bass[(Math.floor(step / 2)) % options.bass.length];
    const pluck = Math.sin(2 * Math.PI * note * t) * Math.exp(-beat * options.decay) * options.pluck;
    const overtone = Math.sin(2 * Math.PI * note * 2 * t) * Math.exp(-beat * options.decay * 1.7) * options.overtone;
    const low = Math.sin(2 * Math.PI * bass * t) * options.low;
    const pulse = step % 4 === 0 ? Math.sin(2 * Math.PI * (options.kick + beat * 18) * beat) * Math.exp(-beat * 16) * options.pulse : 0;
    return pluck + overtone + low + pulse;
  });
};
loop('dliclips-loop',
  [293.66, 369.99, 440, 587.33, 493.88, 440, 369.99, 659.25, 587.33, 440, 369.99, 493.88, 440, 369.99, 293.66, 369.99],
  { bass: [73.42, 92.5, 110, 92.5], pluck: 0.105, overtone: 0.035, low: 0.055, decay: 11, kick: 68, pulse: 0.045 },
);
loop('rooms-loop',
  [196, 246.94, 293.66, 246.94, 220, 261.63, 329.63, 261.63, 174.61, 220, 261.63, 220, 196, 246.94, 293.66, 246.94],
  { bass: [98, 123.47, 110, 87.31], pluck: 0.085, overtone: 0.025, low: 0.075, decay: 7, kick: 54, pulse: 0.025 },
);
loop('core-loop',
  [110, 130.81, 146.83, 164.81, 123.47, 146.83, 164.81, 220, 110, 130.81, 155.56, 164.81, 103.83, 123.47, 146.83, 196],
  { bass: [55, 65.41, 51.91, 61.74], pluck: 0.08, overtone: 0.045, low: 0.095, decay: 5, kick: 42, pulse: 0.055 },
);
