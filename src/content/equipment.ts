import {
  BASE_STATS,
  type Rarity,
  type Stats,
  type WeaponCombatProfile,
} from '../game/combat/types';

export type Slot = 'weapon' | 'armor' | 'module';
export type AttackStyle = 'ranged' | 'blade' | 'hammer';

interface EquipmentBase {
  id: string;
  name: string;
  description: string;
  rarity?: Rarity;
  stats: Partial<Stats>;
}

export type Equipment = EquipmentBase & (
  | { slot: 'weapon'; attackStyle: AttackStyle; combat: WeaponCombatProfile }
  | { slot: 'armor' | 'module'; attackStyle?: never; combat?: never }
);

export const EQUIPMENT: Equipment[] = [
  {
    id: 'weapon_packet_blaster',
    name: 'Packet Blaster',
    slot: 'weapon',
    description: '+10 ATK · Basic damage +8% · Combo chance +5%',
    stats: { atk: 10, basicDamage: 0.08, comboRate: 0.05 },
    attackStyle: 'ranged',
    combat: { basicLabel: 'Packet Burst' },
  },
  {
    id: 'weapon_moderator_hammer',
    name: 'Moderator Hammer',
    slot: 'weapon',
    description: '+10 ATK · Every 3rd basic adds a 55% ATK Ban Hammer',
    stats: { atk: 10 },
    attackStyle: 'hammer',
    combat: {
      basicLabel: 'Hammer Swing',
      proc: {
        trigger: 'basic_count',
        every: 3,
        damage: 0.55,
        target: 'target',
        label: 'Ban Hammer',
      },
    },
  },
  {
    id: 'weapon_overdrive_core',
    name: 'Overdrive Core',
    slot: 'weapon',
    description: '+8 ATK · Start with 20 Rage · Basics grant +5 Rage',
    stats: { atk: 8, startRage: 20, ragePerAttack: 5 },
    attackStyle: 'ranged',
    combat: { basicLabel: 'Overdrive Bolt' },
  },
  {
    id: 'weapon_viral_launcher',
    name: 'Viral Launcher',
    slot: 'weapon',
    rarity: 'rare',
    description: '+10 ATK · Every 4th basic detonates a 60% ATK Viral Explosion',
    stats: { atk: 10, viralLauncher: 0.15 },
    attackStyle: 'ranged',
    combat: {
      basicLabel: 'Viral Round',
      proc: {
        trigger: 'basic_count',
        every: 4,
        damage: 0.6,
        target: 'all',
        label: 'Viral Explosion',
      },
    },
  },
  {
    id: 'weapon_encryption_blade',
    name: 'Encryption Blade',
    slot: 'weapon',
    rarity: 'rare',
    description: '+10 ATK · Dodge +5% · After Dodge, next slash +80%',
    stats: { atk: 10, dodgeRate: 0.05, dodgeFollowup: 0.8 },
    attackStyle: 'blade',
    combat: { basicLabel: 'Encryption Slash' },
  },
  {
    id: 'weapon_dliclip_cannon',
    name: 'DliClip Cannon',
    slot: 'weapon',
    rarity: 'epic',
    description: '+12 ATK · Crit +4% · Crits launch a 90% ATK DliClip',
    stats: { atk: 12, critRate: 0.04, clipDamage: 0.2 },
    attackStyle: 'ranged',
    combat: {
      basicLabel: 'DliClip Shot',
      proc: {
        trigger: 'crit',
        damage: 0.9,
        target: 'target',
        label: 'DliClip Repost',
      },
    },
  },
  {
    id: 'armor_firewall_shell',
    name: 'Firewall Shell',
    slot: 'armor',
    description: '+110 HP · Shield generation +20%',
    stats: { maxHp: 110, shieldPower: 0.2 },
  },
  {
    id: 'armor_creator_hoodie',
    name: 'Creator Hoodie',
    slot: 'armor',
    description: '+80 HP · Healing +18% · Lifesteal +2%',
    stats: { maxHp: 80, healingPower: 0.18, lifesteal: 0.02 },
  },
  {
    id: 'armor_zero_knowledge_cloak',
    name: 'Zero-Knowledge Cloak',
    slot: 'armor',
    description: '+80 HP · Dodge +5%',
    stats: { maxHp: 80, dodgeRate: 0.05 },
  },
  {
    id: 'armor_moderator_vest',
    name: 'Moderator Vest',
    slot: 'armor',
    description: '+6 DEF · Debuffed enemies deal 12% less damage',
    stats: { def: 6, debuffedReduction: 0.12 },
  },
  {
    id: 'armor_antispam_plating',
    name: 'Anti-Spam Plating',
    slot: 'armor',
    rarity: 'rare',
    description: '+10 DEF · Bot enemies deal 15% less damage',
    stats: { def: 10, botReduction: 0.15 },
  },
  {
    id: 'armor_core_armor',
    name: 'Core Armor',
    slot: 'armor',
    rarity: 'epic',
    description: '+80 HP · +7 DEF · Below 25% HP, gain 20% damage reduction',
    stats: { maxHp: 80, def: 7, lowHpReduction: 0.2 },
  },
  {
    id: 'module_viral_chip',
    name: 'Viral Chip',
    slot: 'module',
    description: 'Critical chance +3% · Viral explosions +12%',
    stats: { critRate: 0.03, explosionDamage: 0.12 },
  },
  {
    id: 'module_combo_router',
    name: 'Combo Router',
    slot: 'module',
    description: 'Combo chance +7%',
    stats: { comboRate: 0.07 },
  },
  {
    id: 'module_counter_protocol',
    name: 'Counter Protocol',
    slot: 'module',
    description: 'Counter chance +7%',
    stats: { counterRate: 0.07 },
  },
  {
    id: 'module_rage_cache',
    name: 'Rage Cache',
    slot: 'module',
    description: 'Start battles with 15 Rage',
    stats: { startRage: 15 },
  },
  {
    id: 'module_safe_mode',
    name: 'Safe Mode',
    slot: 'module',
    rarity: 'rare',
    description: 'Damage taken −6%',
    stats: { damageReduction: 0.06 },
  },
  {
    id: 'module_trust',
    name: 'Trust Module',
    slot: 'module',
    rarity: 'legendary',
    description: 'Boss damage +15% · Elite damage +8%',
    stats: { bossDamage: 0.15, eliteDamage: 0.08 },
  },
];

export const GEAR: Record<string, Equipment> = Object.fromEntries(
  EQUIPMENT.map((equipment) => [equipment.id, equipment]),
);

export function weaponAttackStyle(id: string): AttackStyle {
  const item = GEAR[id];
  if (!item || item.slot !== 'weapon') throw new Error(`Expected an equipped weapon, got ${id}`);
  return item.attackStyle;
}

export function weaponCombatProfile(id: string): WeaponCombatProfile {
  const item = GEAR[id];
  if (!item || item.slot !== 'weapon') throw new Error(`Expected an equipped weapon, got ${id}`);
  return item.combat;
}

export const UPGRADE_COSTS = [100, 180, 300, 500];
export const GEAR_PRICES: Record<Rarity, number> = {
  common: 150,
  rare: 350,
  epic: 750,
  legendary: 1400,
};

export const gearPrice = (item: Equipment) => GEAR_PRICES[item.rarity ?? 'common'];

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
    if (item.slot === 'module')
      result.def = (result.def ?? 0) + ((inventory[id] ?? 1) - 1) * 3;
  }
  return result;
}
