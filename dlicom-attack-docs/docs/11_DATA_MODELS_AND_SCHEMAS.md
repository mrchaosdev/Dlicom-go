# Data Models and Schemas

## 1. Skill

```ts
export type SkillRarity =
  | "common"
  | "rare"
  | "epic"
  | "legendary";

export interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  rarity: SkillRarity;
  tags: SkillTag[];
  prerequisites?: string[];
  maxRank: number;
  effects: SkillEffect[];
}
```

---

## 2. Skill effect

```ts
export type SkillEffect =
  | ModifierEffect
  | TriggerEffect
  | StatusEffectDefinition
  | ProcEffect;

export interface ModifierEffect {
  type: "MODIFIER";
  stat: string;
  operation: "ADD" | "ADD_PERCENT" | "MULTIPLY";
  value: number;
}
```

---

## 3. Trigger

```ts
export type TriggerType =
  | "BATTLE_START"
  | "TURN_START"
  | "BEFORE_ATTACK"
  | "AFTER_ATTACK"
  | "ON_HIT"
  | "ON_CRIT"
  | "ON_COMBO"
  | "ON_COUNTER"
  | "ON_DODGE"
  | "ON_DAMAGE_TAKEN"
  | "ON_KILL"
  | "ON_SHIELD_BREAK"
  | "ON_ULTIMATE"
  | "TURN_END";
```

---

## 4. Character stats

```ts
export interface CombatStats {
  maxHp: number;
  hp: number;
  atk: number;
  def: number;

  critRate: number;
  critDamage: number;

  comboRate: number;
  counterRate: number;
  dodgeRate: number;

  lifesteal: number;
  damageReduction: number;

  rage: number;
  rageCap: number;
  rageGainMultiplier: number;
}
```

---

## 5. Status

```ts
export interface StatusInstance {
  id: string;
  sourceId: string;
  stacks: number;
  remainingTurns: number;
}
```

---

## 6. Enemy

```ts
export interface EnemyDefinition {
  id: string;
  name: string;
  tier: "normal" | "elite" | "boss";
  tags: string[];
  baseStats: BaseStats;
  abilities: EnemyAbility[];
  assetKey: string;
}
```

---

## 7. Equipment

```ts
export interface EquipmentDefinition {
  id: string;
  name: string;
  slot: "weapon" | "armor" | "module";
  rarity: SkillRarity;
  baseStats: Partial<BaseStats>;
  passiveId?: string;
  maxLevel: number;
}
```

---

## 8. Chapter

```ts
export interface ChapterDefinition {
  id: string;
  name: string;
  order: number;
  backgroundKey: string;
  musicKey: string;
  enemyPool: string[];
  elitePool: string[];
  bossId: string;
  statMultiplier: number;
}
```

---

## 9. Run state

```ts
export interface RunState {
  seed: string;
  chapterId: string;
  nodeIndex: number;

  hp: number;
  maxHp: number;

  skills: OwnedSkill[];
  temporaryModifiers: RuntimeModifier[];

  rerollsRemaining: number;

  stats: RunStats;
}
```

---

## 10. Run statistics

```ts
export interface RunStats {
  damageDealt: number;
  damageTaken: number;
  healingDone: number;
  shieldsGenerated: number;

  enemiesKilled: number;
  elitesKilled: number;
  bossesKilled: number;

  crits: number;
  combos: number;
  counters: number;
  dodges: number;
  ultimates: number;

  highestHit: number;
}
```

---

## 11. Event node

```ts
export interface EventDefinition {
  id: string;
  title: string;
  body: string;
  imageKey?: string;
  choices: EventChoice[];
}

export interface EventChoice {
  label: string;
  outcomeText: string;
  effects: EventEffect[];
}
```

---

## 12. Validation

Use Zod for content loading.

Fail fast in dev if:
- duplicate IDs
- invalid rarity
- missing prerequisite
- bad asset key
- impossible range

Add content validation script:

```bash
npm run validate:content
```

---

## 13. Content IDs

Use snake_case.

Examples:

```text
packet_boost
ban_hammer
spam_bot
boss_spam_king
weapon_packet_blaster
chapter_feed
```

Never rely on display name as ID.
