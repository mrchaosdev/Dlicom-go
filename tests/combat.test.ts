import { describe, expect, it, vi } from 'vitest';
import { CombatEngine, makeActor, MAX_EVENTS_PER_TURN } from '../src/game/combat/CombatEngine';
import { absorbDamage, damageAmount } from '../src/game/combat/DamageResolver';
import { SeededRng } from '../src/game/rng/SeededRng';
import { generateDraft, eligibleSkills } from '../src/game/run/Draft';
import { SKILLS, SKILL_BY_ID } from '../src/content/skills';
const dummy = (atk = 1) => makeActor('bot', 'Spam Bot', { maxHp: 100000, atk, def: 0 });
const battle = (extra: Partial<ConstructorParameters<typeof CombatEngine>[0]> = {}) =>
  new CombatEngine({
    seed: 'test',
    enemies: [dummy()],
    stats: { critRate: 0, dodgeRate: 0 },
    ...extra,
  });
describe('combat rules', () => {
  it('uses smooth defense and minimum damage', () => {
    expect(damageAmount(100, 1, 100)).toBe(50);
    expect(damageAmount(100, 1, 0)).toBe(100);
    expect(damageAmount(1, 0.1, 1000)).toBe(1);
  });
  it('multiplies critical damage', () => {
    const e = battle({ stats: { critRate: 1 } });
    expect(e.step().find((x) => x.tag === 'basic' && x.source === 'dili')).toMatchObject({
      amount: 150,
      crit: true,
    });
  });
  it('absorbs shield before hp', () =>
    expect(absorbDamage(100, 40, 60)).toEqual({ hp: 80, shield: 0, absorbed: 40, lostHp: 20 }));
  it('caps combo at three extra attacks by default and five with Endless Feed', () => {
    const a = battle({ stats: { comboRate: 1 } });
    a.step();
    expect(a.stats.combos).toBe(3);
    const b = battle({ stats: { comboRate: 1 }, skills: { endless_feed: 1 } });
    b.step();
    expect(b.stats.combos).toBe(5);
  });
  it('counters direct attacks without recursion', () => {
    const e = battle({ stats: { counterRate: 1, dodgeRate: 0 } });
    e.step();
    expect(e.stats.counters).toBe(1);
  });
  it('dodge avoids direct damage', () => {
    const e = battle({ stats: { dodgeRate: 1 } });
    e.step();
    expect(e.hero.hp).toBe(1000);
    expect(e.stats.dodges).toBe(1);
  });
  it('does not counter or dodge status damage', () => {
    const e = battle({ stats: { dodgeRate: 1, counterRate: 1 } });
    e.applyStatus(e.hero, 'burn', 3, 0.2, 'bot');
    e.step();
    expect(e.hero.hp).toBe(999);
    expect(e.stats.counters).toBe(0);
  });
  it('gains rage from basic and direct incoming damage, then casts after chain', () => {
    const e = battle();
    e.step();
    expect(e.rage).toBe(30);
    e.step();
    e.step();
    const events = e.step();
    expect(e.stats.ultimates).toBe(1);
    expect(e.rage).toBe(0);
    expect(events.some((x) => x.type === 'ultimate')).toBe(true);
  });
  it('ultimate hits every living enemy for 180% ATK', () => {
    const e = battle({
      stats: { startRage: 100, critRate: 0 },
      enemies: [dummy(), { ...dummy(), id: 'bot2' }],
    });
    expect(
      e
        .step()
        .filter((x) => x.tag === 'ultimate')
        .map((x) => x.amount),
    ).toEqual([180, 180]);
  });
  it('refreshes statuses and expires after exactly three ticks', () => {
    const e = battle();
    e.applyStatus(e.hero, 'burn', 3, 0.2, 'bot');
    e.step();
    expect(e.hero.statuses[0].turns).toBe(2);
    e.applyStatus(e.hero, 'burn', 3, 0.2, 'bot');
    expect(e.hero.statuses[0].stacks).toBe(2);
    e.step();
    e.step();
    e.step();
    expect(e.hero.statuses).toEqual([]);
  });
  it('prevents lethal once and persists consumption between battles', () => {
    const e = battle({ enemies: [dummy(10000)], skills: { second_chance: 1 } });
    e.step();
    expect(e.hero.hp).toBe(1);
    expect(e.hero.shield).toBe(150);
    e.step();
    expect(e.outcome).toBe('defeat');
    const next = battle({
      enemies: [dummy(10000)],
      skills: { second_chance: 1 },
      consumed: [...e.consumed],
    });
    next.step();
    expect(next.outcome).toBe('defeat');
  });
  it('revives only once per run', () => {
    const e = battle({ enemies: [dummy(10000)], skills: { never_log_off: 1 } });
    e.step();
    expect(e.hero.hp).toBe(350);
    e.step();
    expect(e.outcome).toBe('defeat');
  });
  it('has terminal victory and defeat states', () => {
    const e = battle({ enemies: [makeActor('bot', 'Bot', { maxHp: 1 })] });
    e.step();
    expect(e.outcome).toBe('victory');
    expect(e.step()).toEqual([]);
  });
  it('continues safely after excessive chains', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const e = battle({
      stats: { comboRate: 1, counterRate: 1, critRate: 1 },
      skills: Object.fromEntries(SKILLS.map((s) => [s.id, 1])),
      enemies: Array.from({ length: 3 }, (_, i) => ({ ...dummy(100), id: `bot${i}` })),
    });
    for (let i = 0; i < 30 && !e.outcome; i++)
      expect(e.step().length).toBeLessThanOrEqual(MAX_EVENTS_PER_TURN);
    expect(e.turn).toBeGreaterThan(0);
    warn.mockRestore();
  });
  it('hits every enemy on the fifth basic without duplicating the original hit', () => {
    const e = battle({
      skills: { packet_overflow: 1 },
      enemies: [dummy(), { ...dummy(), id: 'other' }],
    });
    for (let i = 0; i < 4; i++) e.step();
    const hits = e.step().filter((x) => x.source === 'dili' && x.tag === 'basic');
    expect(hits).toHaveLength(2);
    expect(new Set(hits.map((x) => x.target)).size).toBe(2);
  });
  it('third attack in a combo chain explodes exactly once each turn', () => {
    const e = battle({ stats: { comboRate: 1, critRate: 0 }, skills: { chain_reaction: 1 } });
    for (let i = 0; i < 2; i++)
      expect(e.step().filter((x) => x.label === 'Chain Reaction')).toHaveLength(1);
  });
  it('Feed Momentum grows within the combo and resets next turn', () => {
    const e = battle({ stats: { comboRate: 1, critRate: 0 }, skills: { feed_momentum: 1 } });
    for (let i = 0; i < 2; i++)
      expect(
        e
          .step()
          .filter((x) => x.source === 'dili' && x.tag === 'basic')
          .map((x) => x.amount),
      ).toEqual([100, 112, 124, 136]);
  });
  it('hammer consumes Mark and respects equipment cadence', () => {
    const e = battle({
      skills: { ban_hammer: 1, permanent_ban: 1 },
      stats: { hammerInterval: 3, critRate: 0 },
    });
    e.step();
    e.step();
    e.applyStatus(e.enemies[0], 'marked', 3, 0.1);
    expect(e.step().find((x) => x.label === 'Ban Hammer')).toMatchObject({ amount: 350 });
    expect(e.enemies[0].statuses.some((x) => x.id === 'marked')).toBe(false);
  });
  it('firewall triggers every four turns and caps shield at max HP', () => {
    const e = battle({ skills: { firewall: 1, reinforced_firewall: 1 }, stats: { dodgeRate: 1 } });
    for (let i = 0; i < 3; i++) e.step();
    expect(e.hero.shield).toBe(0);
    e.step();
    expect(e.hero.shield).toBe(120);
    e.hero.shield = 990;
    for (let i = 0; i < 4; i++) e.step();
    expect(e.hero.shield).toBe(1000);
  });
  it('encryption dodge launches Ghost Packet and heals', () => {
    const e = battle({
      hp: 500,
      stats: { dodgeRate: 1, critRate: 0 },
      skills: { private_channel: 1, ghost_packet: 1 },
    });
    const events = e.step();
    expect(e.hero.hp).toBe(520);
    expect(events.find((x) => x.label === 'Ghost Packet')).toMatchObject({ amount: 90 });
  });
  it('silence prevents Scam Link special while allowing its basic', () => {
    const e = battle({ enemies: [{ ...dummy(), kind: 'scam_link' }] });
    e.step();
    e.step();
    e.applyStatus(e.enemies[0], 'silence', 1, 1);
    e.step();
    expect(e.hero.statuses.some((s) => s.id === 'vulnerable')).toBe(false);
    e.step();
    e.step();
    e.step();
    expect(e.hero.statuses.some((s) => s.id === 'vulnerable')).toBe(true);
  });
  it('Spam King summons at three, telegraphs flood at five and speeds up below 30%', () => {
    const e = battle({
      enemies: [
        makeActor('king', 'Spam King', { maxHp: 100000, atk: 10 }, 'boss', 'boss_spam_king'),
      ],
    });
    e.step();
    e.step();
    expect(e.step().some((x) => x.type === 'summon')).toBe(true);
    e.step();
    const fifth = e.step();
    expect(fifth.findIndex((x) => x.type === 'warning')).toBeLessThan(
      fifth.findIndex((x) => x.label === 'Spam Flood'),
    );
    e.enemies[0].hp = 29000;
    expect(e.step().some((x) => x.label === 'Overclocked King')).toBe(true);
  });
  it('Null Pulse deals 18% of Dili max HP as unavoidable true damage', () => {
    const e = battle({
      stats: { atk: 1, maxHp: 1000, dodgeRate: 1 },
      enemies: [makeActor('null', 'Null.exe', { maxHp: 100000, atk: 10 }, 'boss', 'boss_null_exe')],
    });
    let pulse: ReturnType<typeof e.step>[number] | undefined;
    for (let turn = 0; turn < 5; turn++) pulse = e.step().find((event) => event.label === 'NULL PULSE') ?? pulse;
    expect(pulse).toMatchObject({ type: 'damage', amount: 180, target: 'dili' });
    expect(e.hero.hp).toBe(820);
  });
  it('preserves hero damage attribution for burn ticks', () => {
    const e = battle();
    e.applyStatus(e.enemies[0], 'burn', 3, 0.2);
    e.step();
    expect(e.stats.damageDealt).toBe(120);
  });
  it('warns and truncates an overflowing content-driven chain without crashing', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    SKILL_BY_ID.stress_test = {
      id: 'stress_test',
      name: 'Stress test',
      description: 'Test fixture only',
      rarity: 'common',
      tags: ['packet'],
      maxRank: 1,
      unlockLevel: 1,
      prerequisites: [],
      effects: Array.from({ length: 300 }, () => ({
        type: 'trigger',
        on: 'basic',
        action: { kind: 'damage', value: 0.01, target: 'target', label: 'Stress' },
      })),
    };
    try {
      const e = battle({ skills: { stress_test: 1 } });
      expect(e.step()).toHaveLength(MAX_EVENTS_PER_TURN);
      expect(warn).toHaveBeenCalledTimes(1);
      expect(e.hero.hp).toBeGreaterThan(0);
      expect(() => e.step()).not.toThrow();
    } finally {
      delete SKILL_BY_ID.stress_test;
      warn.mockRestore();
    }
  });
});
describe('seeded content', () => {
  it('reproduces random streams', () => {
    const a = new SeededRng('same'),
      b = new SeededRng('same');
    expect(Array.from({ length: 50 }, () => a.next())).toEqual(
      Array.from({ length: 50 }, () => b.next()),
    );
  });
  it('reproduces whole battles', () => {
    const a = battle(),
      b = battle();
    for (let i = 0; i < 10; i++) expect(a.step()).toEqual(b.step());
  });
  it('enforces unlocks, prerequisites and rank caps', () => {
    expect(eligibleSkills({}, 1).some((s) => s.id === 'ban_hammer')).toBe(false);
    expect(eligibleSkills({}, 6).some((s) => s.id === 'triple_packet')).toBe(false);
    expect(
      eligibleSkills({ double_packet: 1, packet_boost: 3 }, 6).some(
        (s) => s.id === 'triple_packet',
      ),
    ).toBe(true);
    expect(eligibleSkills({ packet_boost: 3 }, 6).some((s) => s.id === 'packet_boost')).toBe(false);
  });
  it('offers three distinct choices and Rare+ pity reproducibly', () => {
    const a = generateDraft(new SeededRng('draft'), {}, 6, 3);
    expect(a).toEqual(generateDraft(new SeededRng('draft'), {}, 6, 3));
    expect(new Set(a.map((s) => s.id)).size).toBe(3);
    expect(a[0].rarity).not.toBe('common');
  });
});
