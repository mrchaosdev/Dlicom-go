import { describe, expect, it } from 'vitest';
import type { CombatEvent } from '../src/game/combat/types';
import { applyCueVitals, buildPresentationQueue, eventDuration, turnDuration } from '../src/game/phaser/presentation';

describe('combat presentation cues', () => {
  it('places a short anticipation before a critical hit and a Rage burst before Ultimate', () => {
    const events: CombatEvent[] = [
      { type: 'rage', source: 'dili', target: 'dili', amount: 20, label: 'Rage' },
      { type: 'damage', source: 'dili', target: 'spam_bot_1', amount: 182, label: 'Packet', crit: true },
      { type: 'ultimate', source: 'dili', target: 'spam_bot_1', amount: 0, label: 'Dili Overdrive' },
    ];

    const queue = buildPresentationQueue(events);
    expect(queue.map((cue) => cue.type)).toEqual([
      'crit_anticipation',
      'damage',
      'rage_burst',
      'ultimate',
    ]);
    expect(queue[1]).toBe(events[1]);
    expect(queue[3]).toBe(events[2]);
    expect(eventDuration(queue[0])).toBe(70);
    expect(eventDuration(queue[2])).toBe(150);
    expect(turnDuration(Array.from({ length: 12 }, () => events[1]))).toBe(5390);
  });

  it('keeps ordinary Rage gain out of the animation queue', () => {
    const events: CombatEvent[] = [
      { type: 'rage', source: 'dili', target: 'dili', amount: 20, label: 'Rage' },
      { type: 'damage', source: 'dili', target: 'spam_bot_1', amount: 100, label: 'Packet' },
    ];
    expect(buildPresentationQueue(events)).toEqual([events[1]]);
  });

  it('keeps each damage cue open until its projectile and impact finish', () => {
    const hit: CombatEvent = {
      type: 'damage', source: 'dili', target: 'spam_bot_1', amount: 100, label: 'Packet',
    };
    expect(eventDuration(hit)).toBe(290);
    expect(eventDuration({ ...hit, crit: true })).toBe(350);
    expect(eventDuration({ ...hit, label: 'Ban Hammer' })).toBe(520);
    expect(eventDuration({ ...hit, label: 'Viral Explosion' })).toBe(460);
    expect(eventDuration({ ...hit, source: 'boss_spam_king' })).toBe(330);
    expect(eventDuration({ ...hit, tag: 'status' })).toBe(220);
  });

  it('holds displayed vitals until the matching resolved cue is presented', () => {
    const initial = { dili: { hp: 100, shield: 20 } };
    const hit: CombatEvent = {
      type: 'damage', source: 'bot', target: 'dili', amount: 45, label: 'Packet',
      targetHp: 75, targetShield: 0,
    };
    expect(applyCueVitals(initial, hit)).toEqual({ dili: { hp: 75, shield: 0 } });
    expect(initial.dili).toEqual({ hp: 100, shield: 20 });
    expect(applyCueVitals(initial, { ...hit, targetHp: undefined })).toBe(initial);
  });
});
