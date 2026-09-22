# Skills and Synergies

## 1. Skill system principles

A good skill should do at least one:

- create a build direction
- strengthen a build direction
- connect two systems
- solve a weakness
- create a visible payoff

Avoid boring skills that are only:
`+3% ATK`

Flat stat skills can exist, but should be minority.

---

# 2. Skill tags

```ts
type SkillTag =
  | "packet"
  | "basic"
  | "crit"
  | "combo"
  | "counter"
  | "hammer"
  | "firewall"
  | "viral"
  | "moderation"
  | "encryption"
  | "rage"
  | "status"
  | "heal"
  | "boss";
```

---

# 3. Rarity

### Common
Foundation.

### Rare
Strong specialization.

### Epic
Build-defining.

### Legendary
Rule-changing.

---

# 4. Starter skill library

## Packet / Basic Attack

### 1. Packet Boost — Common
Basic Attack Damage +20%.

### 2. Double Packet — Rare
Basic attack fires a second packet for 45% damage.

### 3. Triple Packet — Epic
If Double Packet is active, add a third packet for 30% damage.

### 4. Viral Packet — Rare
Basic attacks have 25% chance to repeat at 60% damage.

### 5. Clean Packet — Common
Basic attacks deal +25% damage to debuffed enemies.

### 6. Packet Compression — Rare
Basic attack damage +35%, Rage gain -5.

### 7. Packet Overflow — Epic
Every 5th basic attack hits all enemies.

### 8. Infinite Scroll — Legendary
Every successful Combo increases Basic Attack Damage by 5% for the battle, up to 100%.

---

## Crit

### 9. Sharp Signal — Common
Crit Rate +8%.

### 10. Critical Upload — Rare
Crit Damage +35%.

### 11. Clip on Crit — Rare
Critical hits launch a DliClip dealing 60% ATK.

### 12. DliClip Bounce — Epic
DliClip bounces to 2 additional enemies.

### 13. Viral Critical — Epic
Critical hits apply Vulnerable +10% for 2 turns.

### 14. Trending Now — Legendary
Every 3rd critical hit triggers an extra basic attack.

---

## Combo

### 15. Rapid Feed — Common
Combo Rate +10%.

### 16. Feed Momentum — Rare
Each Combo in the same turn gains +12% damage.

### 17. Combo Upload — Rare
Combo attack gains +10 Rage.

### 18. Chain Reaction — Epic
Third attack in a Combo chain causes a 100% ATK explosion.

### 19. Endless Feed — Legendary
Max Combo Chain +2 and Combo Rate +15%.

---

## Counter

### 20. Auto Reply — Common
Counter Rate +10%.

### 21. Toxic Reply — Rare
Counter applies Glitch.

### 22. Reflective Moderation — Rare
Counter grants Shield equal to 5% max HP.

### 23. Ratio — Epic
Counter deals +80% damage if enemy has Vulnerable.

### 24. Last Word — Legendary
First time each turn Dili is hit, Counter is guaranteed.

---

## Ban Hammer

### 25. Ban Hammer — Common
Every 4 basic attacks, smash target for 140% ATK.

### 26. Heavy Ban — Rare
Ban Hammer damage +60%.

### 27. Mass Ban — Epic
Ban Hammer also deals 70% damage to all other enemies.

### 28. Mark for Review — Rare
Basic attacks have 20% chance to Mark target.

### 29. Permanent Ban — Epic
Ban Hammer consumes Mark to deal +150% damage.

### 30. Zero Tolerance — Legendary
Ban Hammer executes non-boss enemies below 12% HP.

---

## Firewall

### 31. Firewall — Common
Gain Shield equal to 8% max HP every 4 turns.

### 32. Reinforced Firewall — Rare
Shield generation +50%.

### 33. Packet Filter — Rare
While shielded, damage taken -15%.

### 34. Firewall Pulse — Epic
When Shield breaks, deal 100% ATK to all enemies.

### 35. Emergency Patch — Epic
Below 30% HP, immediately gain 25% max HP Shield once per battle.

### 36. Unbreakable Session — Legendary
Excess Shield generation converts 50% into healing.

---

## Viral / Explosion

### 37. Viral Seed — Common
Kills have 20% chance to damage all enemies for 60% ATK.

### 38. Repost — Rare
Viral explosions can trigger another Viral explosion at 40% damage.

### 39. Trending Explosion — Epic
Viral explosion damage +80%.

### 40. Share Count — Rare
Each enemy killed grants +3% explosion damage this battle.

### 41. Network Effect — Legendary
Every 5th damaging skill creates a Viral explosion.

---

## Moderation / Control

### 42. Auto Mod — Common
Every 4 turns, apply Glitch to strongest enemy.

### 43. Slow Mode — Rare
Glitched enemies deal -15% damage.

### 44. Timeout — Rare
Every 6 turns, Silence one non-boss enemy for 1 turn.

### 45. Community Notes — Epic
Debuffed enemies take +18% damage.

### 46. Trust & Safety — Epic
When applying a debuff, gain 2% max HP Shield.

### 47. Full Moderation Suite — Legendary
Applying Glitch also applies Vulnerable.

---

## Encryption / Dodge

### 48. Encrypted Session — Common
Dodge +6%.

### 49. Hidden Route — Rare
After Dodge, gain +20% Crit Rate for next attack.

### 50. Private Channel — Rare
After Dodge, heal 2% max HP.

### 51. Zero Knowledge — Epic
First direct hit in each battle is automatically dodged.

### 52. Ghost Packet — Epic
Dodging launches a 90% ATK packet.

### 53. End-to-End — Legendary
After 3 Dodges, become untargetable for one enemy action.

---

## Rage / Ultimate

### 54. Faster Upload — Common
Rage gain +20%.

### 55. Overclock — Rare
Ultimate damage +40%.

### 56. Rage Cache — Rare
Start battle with 30 Rage.

### 57. Ultimate Packet Storm — Epic
Ultimate launches 3 extra packets.

### 58. Overdrive Shield — Epic
Casting Ultimate grants 15% max HP Shield.

### 59. Infinite Bandwidth — Legendary
After Ultimate, basic attacks gain +35% damage for 3 turns.

---

## Healing / Survival

### 60. Recovery Packet — Common
Heal 2% max HP after battle.

### 61. Healthy Community — Rare
Every 5 kills heals 3% max HP.

### 62. Lifeline — Rare
Lifesteal +6%.

### 63. Second Chance — Epic
Prevent lethal damage once; remain at 1 HP and gain 15% Shield.

### 64. Community Support — Epic
Healing effects +40%.

### 65. Never Log Off — Legendary
Once per run, revive with 35% HP.

---

## Boss / Elite specialization

### 66. Boss Hunter — Rare
Damage to bosses +20%.

### 67. Elite Cleaner — Common
Damage to elites +15%.

### 68. Adaptation — Epic
After 10 turns against same enemy, gain +30% damage.

### 69. Final Push — Epic
Below 25% HP, damage +35%.

### 70. Main Character Energy — Legendary
Against bosses, Crit +15%, Dodge +10%, Rage Gain +20%.

---

# 5. Upgrade ranks

Some skills can rank up:

```text
Rank I
Rank II
Rank III
```

Example:

Packet Boost:
- I: +20%
- II: +35%
- III: +50%

Do not allow every skill to rank.
Rule-changing skills should usually be one-time.

---

# 6. Synergy examples

## Packet Storm

```text
Double Packet
+ Viral Packet
+ Sharp Signal
+ Clip on Crit
+ DliClip Bounce
+ Trending Now
```

Result:
many projectiles and crit chains.

## Hammer Execution

```text
Ban Hammer
+ Mark for Review
+ Permanent Ban
+ Heavy Ban
+ Zero Tolerance
```

Result:
slow setup, huge burst.

## Firewall Reactor

```text
Firewall
+ Reinforced Firewall
+ Firewall Pulse
+ Packet Filter
+ Emergency Patch
```

Result:
tank who explodes when shields break.

## Counter Moderator

```text
Auto Reply
+ Toxic Reply
+ Community Notes
+ Ratio
+ Last Word
```

Result:
enemy attacks create its own punishment.

## Encryption Assassin

```text
Encrypted Session
+ Hidden Route
+ Ghost Packet
+ Zero Knowledge
+ Critical Upload
```

Result:
dodge leads to burst.

## Rage Machine

```text
Faster Upload
+ Rage Cache
+ Combo Upload
+ Overclock
+ Ultimate Packet Storm
+ Infinite Bandwidth
```

Result:
frequent ultimate loops.

---

# 7. Draft generation

Skill offer should avoid nonsense.

If player has:
- no Ban Hammer
do not heavily offer Hammer-only upgrades.

Use affinity score:

```text
baseWeight
+ tagSynergy
+ ownedPrerequisite
- incompatiblePenalty
```

Example:
`Permanent Ban` should require `Ban Hammer`.

---

# 8. Pity system

If player receives no Rare+ skill for 3 drafts:
next draft guarantees Rare+.

If player has 3+ skills with same tag:
increase matching skill offer weight by 25%.

This encourages build completion without making runs identical.
