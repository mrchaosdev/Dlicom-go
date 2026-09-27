import { EQUIPMENT } from '../../content/equipment';
import { SKINS } from '../../content/skins';
import type { SaveFile } from '../../services/save';
import { SeededRng } from '../rng/SeededRng';
import type { Rarity } from '../combat/types';

export type ChestKind = 'gear' | 'skin';
export interface ChestReward { kind: ChestKind; id: string }
export const GEAR_CHEST_COST = 250;
export const SKIN_CHEST_COST = 200;
const rarityWeight: Record<Rarity, number> = { common: 55, rare: 30, epic: 12, legendary: 3 };
const rarities: Rarity[] = ['common', 'rare', 'epic', 'legendary'];
function drawRarity(rng: SeededRng, available: Rarity[]): Rarity {
  return rng.weighted(rarities.filter((rarity) => available.includes(rarity)), (rarity) => rarityWeight[rarity]);
}

export function canOpenChest(save: SaveFile, kind: ChestKind): boolean {
  if (kind === 'gear')
    return save.account.bits >= GEAR_CHEST_COST
      && EQUIPMENT.some((item) => !save.account.inventory[item.id]);
  return save.account.bits >= SKIN_CHEST_COST
    && SKINS.some((skin) => !save.account.ownedSkins.includes(skin.id));
}

export function openChest(save: SaveFile, kind: ChestKind, seed: string): {
  save: SaveFile;
  reward?: ChestReward;
} {
  if (!canOpenChest(save, kind)) return { save };
  const rng = new SeededRng(seed);
  const next = structuredClone(save);
  if (kind === 'gear') {
    const pool = EQUIPMENT.filter((item) => !next.account.inventory[item.id]);
    const rarity = drawRarity(rng, pool.map((item) => item.rarity ?? 'common'));
    const item = rng.pick(pool.filter((item) => (item.rarity ?? 'common') === rarity));
    next.account.bits -= GEAR_CHEST_COST;
    next.account.inventory[item.id] = 1;
    return { save: next, reward: { kind, id: item.id } };
  }
  const skin = rng.pick(SKINS.filter((item) => !next.account.ownedSkins.includes(item.id)));
  next.account.bits -= SKIN_CHEST_COST;
  next.account.ownedSkins.push(skin.id);
  next.account.skinId = skin.id;
  return { save: next, reward: { kind, id: skin.id } };
}
