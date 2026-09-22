import { SKILLS } from '../../content/skills';
import type { OwnedSkills, Rarity, SkillDefinition } from '../combat/types';
import { SeededRng } from '../rng/SeededRng';
const weights: Record<Rarity, number> = { common: 58, rare: 28, epic: 11, legendary: 3 };
export function eligibleSkills(owned: OwnedSkills, level: number) {
  return SKILLS.filter(
    (s) =>
      s.unlockLevel <= level &&
      (owned[s.id] ?? 0) < s.maxRank &&
      s.prerequisites.every((id) => owned[id]),
  );
}
export function generateDraft(
  rng: SeededRng,
  owned: OwnedSkills,
  level: number,
  pity = 0,
  elite = false,
  minimum?: Rarity,
): SkillDefinition[] {
  const order: Rarity[] = ['common', 'rare', 'epic', 'legendary'];
  let pool = eligibleSkills(owned, level).filter(
    (s) => !minimum || order.indexOf(s.rarity) >= order.indexOf(minimum),
  );
  const tags = SKILLS.filter((s) => owned[s.id]).flatMap((s) => s.tags);
  const result: SkillDefinition[] = [];
  for (let i = 0; i < 3 && pool.length; i++) {
    const candidates =
      i === 0 && pity >= 3 && pool.some((s) => s.rarity !== 'common')
        ? pool.filter((s) => s.rarity !== 'common')
        : pool;
    const rarity = rng.weighted(
      order.filter((r) => candidates.some((s) => s.rarity === r)),
      (r) => weights[r] * (elite && r !== 'common' ? 1.5 : 1),
    );
    const selected = rng.weighted(
      candidates.filter((s) => s.rarity === rarity),
      (s) => (s.tags.some((tag) => tags.filter((t) => tag === t).length >= 3) ? 1.25 : 1),
    );
    result.push(selected);
    pool = pool.filter((s) => s.id !== selected.id);
  }
  return result;
}
