# Combat System

## 1. Combat model

Recommended implementation:
**deterministic turn resolver with animated presentation**

Game logic should not depend on animation timing.

This makes:
- replay/testing easier
- bugs easier to reproduce
- speed x2 possible
- balancing safer

The combat engine produces events such as:

```ts
[
  { type: "ATTACK_START", actor: "dili" },
  { type: "DAMAGE", source: "dili", target: "bot_1", amount: 182, crit: true },
  { type: "STATUS_APPLY", target: "bot_1", status: "vulnerable", stacks: 1 },
  { type: "RAGE_GAIN", actor: "dili", amount: 20 }
]
```

Presentation layer animates those events.

---

## 2. Base damage

Recommended formula:

```text
RawDamage = ATK × SkillMultiplier

DefenseFactor = 100 / (100 + DEF)

FinalDamage = RawDamage × DefenseFactor × modifiers
```

Minimum:
1 damage

This avoids negative damage and keeps DEF scaling smooth.

---

## 3. Critical

Default:
- Crit Rate: 5%
- Crit Damage: 150%

Formula:

```text
if crit:
  damage *= CritDamage
```

Cap recommendations:
- Crit Rate hard cap: 100%
- normal balancing target: 5–60%

---

## 4. Combo

Combo means:
after a basic attack, Dili has a chance to perform another basic attack.

Default:
0%

Example:
30% Combo means each basic attack can proc one additional attack.

To prevent infinite loops:
- max combo chain default: 3
- skills can raise max to 5

Pseudo:

```ts
while (comboProc && chain < maxComboChain) {
  performBasicAttack();
  chain++;
}
```

---

## 5. Counter

When Dili receives a direct attack:
Counter Rate chance to immediately basic attack attacker.

Default:
0%

Counter cannot counter:
- DoT ticks
- environmental damage
- reflected damage

Counter attacks can trigger:
- crit
- on-hit
- packet skills

But cannot recursively trigger another counter.

---

## 6. Dodge

Dodge completely avoids direct attack damage.

Default:
3%

Dodge does not avoid:
- guaranteed boss mechanics
- status already applied
- true damage

---

## 7. Shield

Shield is an extra health layer.

Damage order:

```text
Shield
↓
HP
```

Shield expires:
- when consumed
- or at battle end unless a skill says otherwise

Recommended shield cap:
100% max HP.

---

## 8. Status effects

### Burn
Damage at turn end.

### Glitch
Reduces target accuracy/damage.

### Vulnerable
Target takes extra damage.

### Silence
Prevents special ability.

### Slow
Reduces attack frequency / turn priority.

### Corrupted
Stacking debuff; some builds consume stacks for burst.

### Marked
Next Ban Hammer hit deals bonus damage.

---

## 9. DoT formula

Example Burn:

```text
BurnDamage = SourceATK × 20% × stacks
```

Stacks:
max 5 by default.

Duration:
3 turns.

Refresh:
new application refreshes duration.

---

## 10. Rage

Base:
- +20 on basic attack
- +10 when receiving direct damage
- cap 100

Ultimate auto-casts at cap.

Ultimate execution occurs:
after current trigger chain completes.

This avoids interrupting a combo halfway.

---

## 11. Trigger priority

When multiple effects trigger simultaneously:

1. lethal prevention
2. shield/block
3. dodge
4. direct damage
5. on-hit
6. crit triggers
7. status application
8. kill triggers
9. rage gain
10. ultimate check
11. turn-end effects

Document this order and never change casually.

---

## 12. Damage categories

Use categories:

```ts
type DamageTag =
  | "basic"
  | "skill"
  | "ultimate"
  | "status"
  | "reflect"
  | "true";
```

This allows targeted modifiers.

---

## 13. Enemy targeting

Jam scope:
- Dili always targets lowest-HP enemy by default
- bosses are always targeted when alone
- AoE skills hit all

Optional skill:
**Smart Moderation**
targets the enemy with highest ATK.

---

## 14. Battle speed

Supported:
- x1
- x2

Do not add x4 before polishing x2.

Game logic remains unchanged.
Only presentation time scales.

---

## 15. Anti-infinite safeguards

Must implement:
- max combo depth
- max trigger depth
- per-turn trigger count
- event queue length guard

Recommended:

```text
MAX_COMBO_CHAIN = 5
MAX_TRIGGER_DEPTH = 12
MAX_EVENTS_PER_TURN = 200
```

If exceeded:
log warning and safely stop chain.
