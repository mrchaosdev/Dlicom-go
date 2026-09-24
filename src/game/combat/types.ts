export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';
export type Archetype =
  'packet' | 'hammer' | 'firewall' | 'viral' | 'moderation' | 'encryption' | 'rage' | 'heal';
export type DamageTag = 'basic' | 'skill' | 'ultimate' | 'status' | 'reflect' | 'true';
export type StatusId =
  'burn' | 'glitch' | 'vulnerable' | 'silence' | 'slow' | 'corrupted' | 'marked';
export interface Status {
  id: StatusId;
  turns: number;
  stacks: number;
  power: number;
  source: string;
}
export interface Stats {
  maxHp: number;
  atk: number;
  def: number;
  critRate: number;
  critDamage: number;
  comboRate: number;
  counterRate: number;
  dodgeRate: number;
  lifesteal: number;
  damageReduction: number;
  basicDamage: number;
  rageGain: number;
  ragePerAttack: number;
  ultimateDamage: number;
  shieldPower: number;
  healingPower: number;
  bossDamage: number;
  eliteDamage: number;
  debuffDamage: number;
  cleanPacket: number;
  counterDamage: number;
  hammerDamage: number;
  hammerInterval: number;
  explosionDamage: number;
  startRage: number;
  shieldReduction: number;
  glitchedReduction: number;
  maxCombo: number;
  comboMomentum: number;
  dodgeFollowup: number;
  debuffedReduction: number;
  botReduction: number;
  lowHpReduction: number;
  viralLauncher: number;
  clipDamage: number;
  rageLeechReduction: number;
}
export const BASE_STATS: Stats = {
  maxHp: 1000,
  atk: 100,
  def: 50,
  critRate: 0.05,
  critDamage: 1.5,
  comboRate: 0,
  counterRate: 0,
  dodgeRate: 0.03,
  lifesteal: 0,
  damageReduction: 0,
  basicDamage: 0,
  rageGain: 1,
  ragePerAttack: 20,
  ultimateDamage: 0,
  shieldPower: 1,
  healingPower: 1,
  bossDamage: 0,
  eliteDamage: 0,
  debuffDamage: 0,
  cleanPacket: 0,
  counterDamage: 0,
  hammerDamage: 0,
  hammerInterval: 4,
  explosionDamage: 0,
  startRage: 0,
  shieldReduction: 0,
  glitchedReduction: 0,
  maxCombo: 3,
  comboMomentum: 0,
  dodgeFollowup: 0,
  debuffedReduction: 0,
  botReduction: 0,
  lowHpReduction: 0,
  viralLauncher: 0,
  clipDamage: 0,
  rageLeechReduction: 0,
};
export interface Actor {
  id: string;
  name: string;
  hp: number;
  shield: number;
  stats: Stats;
  statuses: Status[];
  tier: 'hero' | 'normal' | 'elite' | 'boss';
  kind: string;
  modifier?: string;
}
export type Trigger =
  | 'battle_start'
  | 'turn_start'
  | 'basic'
  | 'crit'
  | 'combo'
  | 'counter'
  | 'dodge'
  | 'kill'
  | 'shield_break'
  | 'ultimate'
  | 'debuff'
  | 'low_hp'
  | 'battle_end';
export type Action =
  | { kind: 'damage'; value: number; target: 'target' | 'all' | 'strongest'; label: string }
  | { kind: 'shield' | 'heal' | 'rage'; value: number }
  | { kind: 'status'; status: StatusId; turns: number; value: number }
  | { kind: 'next_crit'; value: number }
  | { kind: 'extra_basic'; value: number };
export type Effect =
  | { type: 'modifier'; stat: keyof Stats; value: number }
  | {
      type: 'trigger';
      on: Trigger;
      every?: number;
      chance?: number;
      once?: boolean;
      comboIndex?: number;
      action: Action;
    }
  | {
      type: 'rule';
      rule:
        | 'lethal'
        | 'revive'
        | 'first_dodge'
        | 'last_word'
        | 'repost'
        | 'bounce'
        | 'permanent_ban'
        | 'mass_ban'
        | 'execute'
        | 'infinite_scroll'
        | 'end_to_end'
        | 'excess_heal'
        | 'full_moderation'
        | 'bandwidth'
        | 'overflow'
        | 'share_count'
        | 'network_effect'
        | 'adaptation'
        | 'final_push'
        | 'main_character';
      value: number;
    };
export interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  rarity: Rarity;
  tags: Archetype[];
  prerequisites: string[];
  maxRank: number;
  unlockLevel: number;
  effects: Effect[];
}
export type OwnedSkills = Record<string, number>;
export interface CombatEvent {
  type:
    | 'damage'
    | 'dodge'
    | 'heal'
    | 'shield'
    | 'status'
    | 'ultimate'
    | 'death'
    | 'summon'
    | 'warning'
    | 'revive'
    | 'rage';
  source: string;
  target: string;
  amount: number;
  label: string;
  crit?: boolean;
  tag?: DamageTag;
}
export interface BattleStats {
  damageDealt: number;
  damageTaken: number;
  highestHit: number;
  kills: number;
  crits: number;
  combos: number;
  counters: number;
  dodges: number;
  ultimates: number;
}
export const emptyBattleStats = (): BattleStats => ({
  damageDealt: 0,
  damageTaken: 0,
  highestHit: 0,
  kills: 0,
  crits: 0,
  combos: 0,
  counters: 0,
  dodges: 0,
  ultimates: 0,
});
