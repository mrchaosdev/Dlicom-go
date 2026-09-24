import { BASE_STATS, type Rarity, type Stats } from '../game/combat/types';
export type Slot = 'weapon' | 'armor' | 'module';
export interface Equipment {
  id: string;
  name: string;
  slot: Slot;
  description: string;
  rarity?: Rarity;
  stats: Partial<Stats>;
}
export const EQUIPMENT: Equipment[] = [
  {
    id: 'weapon_packet_blaster',
    name: 'Packet Blaster',
    slot: 'weapon',
    description: '+10 ATK · Basic damage +10%',
    stats: { atk: 10, basicDamage: 0.1 },
  },
  {
    id: 'weapon_moderator_hammer',
    name: 'Moderator Hammer',
    slot: 'weapon',
    description: '+10 ATK · Hammer every 3 basics',
    stats: { atk: 10, hammerInterval: -1 },
  },
  {
    id: 'weapon_overdrive_core',
    name: 'Overdrive Core',
    slot: 'weapon',
    description: '+10 ATK · Start with 20 Rage',
    stats: { atk: 10, startRage: 20 },
  },
  {
    id: 'weapon_viral_launcher', name: 'Viral Launcher', slot: 'weapon', rarity: 'rare',
    description: '+12 ATK · Viral explosions +20%', stats: { atk: 12, viralLauncher: 0.2 },
  },
  {
    id: 'weapon_encryption_blade', name: 'Encryption Blade', slot: 'weapon', rarity: 'rare',
    description: '+12 ATK · After a Dodge, your next attack +30%', stats: { atk: 12, dodgeFollowup: 0.3 },
  },
  {
    id: 'weapon_dliclip_cannon', name: 'DliClip Cannon', slot: 'weapon', rarity: 'epic',
    description: '+14 ATK · Critical DliClip damage +25%', stats: { atk: 14, clipDamage: 0.25 },
  },
  {
    id: 'armor_firewall_shell',
    name: 'Firewall Shell',
    slot: 'armor',
    description: '+100 HP · Shield generation +15%',
    stats: { maxHp: 100, shieldPower: 0.15 },
  },
  {
    id: 'armor_creator_hoodie',
    name: 'Creator Hoodie',
    slot: 'armor',
    description: '+100 HP · Healing +10%',
    stats: { maxHp: 100, healingPower: 0.1 },
  },
  {
    id: 'armor_zero_knowledge_cloak',
    name: 'Zero-Knowledge Cloak',
    slot: 'armor',
    description: '+100 HP · Dodge +4%',
    stats: { maxHp: 100, dodgeRate: 0.04 },
  },
  {
    id: 'armor_moderator_vest', name: 'Moderator Vest', slot: 'armor',
    description: '+6 DEF · Debuffed enemies deal 8% less damage', stats: { def: 6, debuffedReduction: 0.08 },
  },
  {
    id: 'armor_antispam_plating', name: 'Anti-Spam Plating', slot: 'armor', rarity: 'rare',
    description: '+8 DEF · Bot enemies deal 10% less damage', stats: { def: 8, botReduction: 0.1 },
  },
  {
    id: 'armor_core_armor', name: 'Core Armor', slot: 'armor', rarity: 'epic',
    description: '+60 HP · +6 DEF · Below 25% HP, gain 15% damage reduction', stats: { maxHp: 60, def: 6, lowHpReduction: 0.15 },
  },
  {
    id: 'module_viral_chip',
    name: 'Viral Chip',
    slot: 'module',
    description: 'Critical chance +4%',
    stats: { critRate: 0.04 },
  },
  {
    id: 'module_combo_router',
    name: 'Combo Router',
    slot: 'module',
    description: 'Combo chance +6%',
    stats: { comboRate: 0.06 },
  },
  {
    id: 'module_counter_protocol',
    name: 'Counter Protocol',
    slot: 'module',
    description: 'Counter chance +6%',
    stats: { counterRate: 0.06 },
  },
  {
    id: 'module_rage_cache', name: 'Rage Cache', slot: 'module',
    description: 'Start battles with 10 Rage', stats: { startRage: 10 },
  },
  {
    id: 'module_safe_mode', name: 'Safe Mode', slot: 'module', rarity: 'rare',
    description: 'Damage taken −4%', stats: { damageReduction: 0.04 },
  },
  {
    id: 'module_trust', name: 'Trust Module', slot: 'module', rarity: 'legendary',
    description: 'Boss damage +8%', stats: { bossDamage: 0.08 },
  },
];
export const GEAR = Object.fromEntries(EQUIPMENT.map((e) => [e.id, e]));
export const UPGRADE_COSTS = [100, 180, 300, 500];
export function loadoutStats(
  equipped: Record<Slot, string>,
  inventory: Record<string, number>,
): Stats {
  const stats = { ...BASE_STATS };
  for (const [stat, value] of Object.entries(gearStats(equipped, inventory)))
    stats[stat as keyof Stats] += value;
  return stats;
}
export function gearStats(
  equipped: Record<Slot, string>,
  inventory: Record<string, number>,
): Partial<Stats> {
  const result: Partial<Stats> = {};
  for (const id of Object.values(equipped)) {
    const item = GEAR[id];
    for (const [key, value] of Object.entries(item.stats)) {
      const stat = key as keyof Stats;
      const scale = ['atk', 'maxHp', 'def'].includes(stat)
        ? 1 + ((inventory[id] ?? 1) - 1) * 0.2
        : 1;
      result[stat] = (result[stat] ?? 0) + value * scale;
    }
    if (item.slot === 'module') result.def = (result.def ?? 0) + ((inventory[id] ?? 1) - 1) * 3;
  }
  return result;
}
