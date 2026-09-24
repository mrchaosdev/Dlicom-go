import { getChapter } from './chapters';
import { makeActor } from '../game/combat/CombatEngine';
import { SeededRng } from '../game/rng/SeededRng';

export const NODES = ['battle', 'battle', 'event', 'elite', 'rest', 'battle', 'event', 'elite', 'battle', 'rest', 'elite', 'boss'] as const;
export const NODE_SCALE = [.8, .9, 1, 1.25, 1, 1.15, 1, 1.45, 1.35, 1, 1.7, 2.2];
export const ENEMIES = getChapter('chapter_feed').enemyPool;

export function generateEncounter(seed: string, index: number, route = 0, chapterId = 'chapter_feed') {
  const chapter = getChapter(chapterId);
  const rng = new SeededRng(`${seed}:${chapterId}:encounter:${index}:${route}`);
  const type = NODES[index];
  const scale = NODE_SCALE[index] * chapter.multiplier;
  if (type === 'boss') {
    const hp = Math.round(chapter.bossHp * NODE_SCALE[index] * chapter.multiplier);
    return [makeActor(chapter.bossId, chapter.bossName, { maxHp: hp, atk: Math.round(chapter.bossAtk * scale), def: 35 }, 'boss', chapter.bossId)];
  }
  if (type === 'elite') {
    const modifier = rng.pick(['Overclocked', 'Mirrored', 'Shielded', 'Viral', 'Encrypted']);
    const enemy = makeActor(`raid_bot_${index}`, 'Raid Bot', { maxHp: Math.round(chapter.eliteHp * scale), atk: Math.round(chapter.eliteAtk * scale * (modifier === 'Overclocked' ? 1.3 : 1)), def: 28, dodgeRate: modifier === 'Encrypted' ? .15 : 0 }, 'elite', 'raid_bot');
    enemy.modifier = modifier;
    if (modifier === 'Shielded') enemy.shield = Math.round(enemy.hp * .3);
    return [enemy];
  }
  const count = index === 0 ? 1 : chapter.order >= 3 ? (index < 6 ? 1 : 2) : index < 6 ? 2 : 3;
  return Array.from({ length: count }, (_, i) => {
    const def = index === 0 && chapterId === 'chapter_feed' ? ENEMIES[0] : rng.pick(chapter.enemyPool);
    const enemy = makeActor(`${def.id}_${i}`, def.name, { maxHp: Math.round(def.hp * scale), atk: Math.round(def.atk * scale), def: def.def, dodgeRate: def.id === 'fake_account' ? .25 : 0 }, 'normal', def.id);
    return enemy;
  });
}

export function generateEventElite(seed: string, node: number, chapterId: string) {
  const chapter = getChapter(chapterId);
  const rng = new SeededRng(`${seed}:${chapterId}:event-elite:${node}`);
  const modifier = rng.pick(['Overclocked', 'Mirrored', 'Shielded', 'Viral', 'Encrypted']);
  const enemy = makeActor('raid_bot_event', 'Raid Bot', {
    maxHp: Math.round(chapter.eliteHp * NODE_SCALE[3] * chapter.multiplier),
    atk: Math.round(chapter.eliteAtk * NODE_SCALE[3] * chapter.multiplier * (modifier === 'Overclocked' ? 1.3 : 1)),
    def: 28, dodgeRate: modifier === 'Encrypted' ? 0.15 : 0,
  }, 'elite', 'raid_bot');
  enemy.modifier = modifier;
  if (modifier === 'Shielded') enemy.shield = Math.round(enemy.hp * 0.3);
  return [enemy];
}
