import { z } from 'zod';
import { BASE_STATS, type SkillDefinition } from '../game/combat/types';
import { SKILLS } from './skills';
import { EQUIPMENT } from './equipment';
import { CHAPTERS } from './chapters';
import { EVENTS, eventsForChapter } from './events';
const id = z.string().regex(/^[a-z][a-z0-9_]+$/);
const action = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('damage'),
    value: z.number().positive(),
    target: z.enum(['target', 'all', 'strongest']),
    label: z.string().min(1),
  }),
  z.object({
    kind: z.literal('status'),
    status: z.enum(['burn', 'glitch', 'vulnerable', 'silence', 'slow', 'corrupted', 'marked']),
    turns: z.number().int().positive(),
    value: z.number().min(0),
  }),
  ...(['shield', 'heal', 'rage', 'next_crit', 'extra_basic'] as const).map((kind) =>
    z.object({ kind: z.literal(kind), value: z.number().positive() }),
  ),
]);
const effect = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('modifier'),
    stat: z.string().refine((s) => s in BASE_STATS, 'Expected a known combat stat'),
    value: z.number().finite(),
  }),
  z.object({
    type: z.literal('trigger'),
    on: z.enum([
      'battle_start',
      'turn_start',
      'basic',
      'crit',
      'combo',
      'counter',
      'dodge',
      'kill',
      'shield_break',
      'ultimate',
      'debuff',
      'low_hp',
      'battle_end',
    ]),
    every: z.number().int().positive().optional(),
    chance: z.number().min(0).max(1).optional(),
    once: z.boolean().optional(),
    comboIndex: z.number().int().min(1).max(5).optional(),
    action,
  }),
  z.object({
    type: z.literal('rule'),
    rule: z.enum([
      'lethal',
      'revive',
      'first_dodge',
      'last_word',
      'repost',
      'bounce',
      'permanent_ban',
      'mass_ban',
      'execute',
      'infinite_scroll',
      'end_to_end',
      'excess_heal',
      'full_moderation',
      'bandwidth',
      'overflow',
      'share_count',
      'network_effect',
      'adaptation',
      'final_push',
      'main_character',
    ]),
    value: z.number().finite(),
  }),
]);
const skillSchema = z.object({
  id,
  name: z.string().min(1),
  description: z.string().min(1),
  rarity: z.enum(['common', 'rare', 'epic', 'legendary']),
  tags: z
    .array(
      z.enum(['packet', 'hammer', 'firewall', 'viral', 'moderation', 'encryption', 'rage', 'heal']),
    )
    .min(1),
  prerequisites: z.array(id),
  maxRank: z.number().int().min(1).max(3),
  unlockLevel: z.number().int().min(1).max(6),
  effects: z.array(effect).min(1),
});
export function validateContent(skills: SkillDefinition[] = SKILLS) {
  const ids = new Set<string>();
  for (const s of skills) {
    const parsed = skillSchema.safeParse(s);
    if (!parsed.success) throw new Error(`${s.id}: ${parsed.error.message}`);
    if (ids.has(s.id)) throw new Error(`Duplicate skill ID: ${s.id}`);
    ids.add(s.id);
    for (const prerequisite of s.prerequisites)
      if (!skills.some((s) => s.id === prerequisite))
        throw new Error(`${s.id}.prerequisites: expected existing ID, got ${prerequisite}`);
  }
  const walk = (skill: SkillDefinition, path: string[]) => {
    if (path.includes(skill.id))
      throw new Error(`${skill.id}.prerequisites: cycle ${path.join(' -> ')}`);
    for (const required of skill.prerequisites)
      walk(
        skills.find((s) => s.id === required)!,
        [...path, skill.id],
      );
  };
  skills.forEach((s) => walk(s, []));
  for (const item of EQUIPMENT) {
    if (ids.has(item.id)) throw new Error(`Duplicate item ID: ${item.id}`);
    ids.add(item.id);
    z.object({
      id,
      name: z.string().min(1),
      slot: z.enum(['weapon', 'armor', 'module']),
      stats: z.record(z.number().finite()),
    }).parse(item);
  }
  if (EQUIPMENT.length !== 18) throw new Error(`Expected 18 equipment definitions, got ${EQUIPMENT.length}`);
  const chapterIds = new Set<string>();
  for (const chapter of CHAPTERS) {
    if (chapterIds.has(chapter.id)) throw new Error(`Duplicate chapter ID: ${chapter.id}`);
    chapterIds.add(chapter.id);
    z.object({
      id,
      name: z.string().min(1),
      order: z.number().int().positive(),
      bossId: id,
      bossName: z.string().min(1),
      bossHp: z.number().positive(),
      bossAtk: z.number().positive(),
      multiplier: z.number().min(1),
      eliteHp: z.number().positive(),
      eliteAtk: z.number().positive(),
      enemyPool: z.array(z.object({ id, name: z.string().min(1), hp: z.number().positive(), atk: z.number().positive(), def: z.number().min(0) })).min(1),
    }).parse(chapter);
    if (eventsForChapter(chapter.id).length < 2) throw new Error(`${chapter.id}: expected at least 2 events`);
  }
  if (CHAPTERS.length !== 4) throw new Error(`Expected 4 chapters, got ${CHAPTERS.length}`);
  const eventIds = new Set<string>();
  for (const event of EVENTS) {
    if (ids.has(event.id) || eventIds.has(event.id)) throw new Error(`Duplicate content ID: ${event.id}`);
    eventIds.add(event.id);
    z.object({
      id,
      title: z.string().min(1),
      body: z.string().min(1),
      chapters: z.array(id).optional(),
      choices: z.array(z.object({ label: z.string().min(1), outcomeText: z.string().min(1), effects: z.array(z.unknown()) })).min(2),
    }).parse(event);
  }
  if (EVENTS.length !== 20) throw new Error(`Expected 20 events, got ${EVENTS.length}`);
}
