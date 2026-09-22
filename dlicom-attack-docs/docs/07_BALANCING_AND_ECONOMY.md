# Balancing and Economy

## 1. Primary target

The player should win Chapter 1 on:
- first 1–3 attempts if choices are reasonable.

The player should not need grinding to understand fun.

---

## 2. Base Dili stats

Suggested:

```text
HP: 1000
ATK: 100
DEF: 50
Crit Rate: 5%
Crit Damage: 150%
Combo: 0%
Counter: 0%
Dodge: 3%
Rage: 0/100
```

---

## 3. Enemy scaling by node

Example multiplier:

```text
Node 1   0.80
Node 2   0.90
Node 3   1.00
Node 4   1.25 Elite
Node 5   -
Node 6   1.15
Node 7   -
Node 8   1.45 Elite
Node 9   1.35
Node 10  -
Node 11  1.70 Elite
Node 12  2.20 Boss
```

Apply to base chapter enemy stats.

---

## 4. HP/ATK chapter scaling

Chapter multiplier:

```text
Chapter 1: 1.00
Chapter 2: 1.35
Chapter 3: 1.80
Chapter 4: 2.40
```

Avoid exponential runaway before content exists.

---

## 5. Skill power budget

Approximate single-skill power:

Common:
8–20% improvement.

Rare:
20–40%.

Epic:
40–70% or new mechanic.

Legendary:
rule-changing, not just +100%.

---

## 6. Defensive target

A balanced build should survive:
~12–18 direct boss hits.

A glass cannon:
~6–10.

Tank:
~20+.

---

## 7. Boss target time-to-kill

Boss 1:
45–60 s at x1.

Later:
60–90 s.

If >120 s:
boring.

If <15 s without extreme build:
too easy.

---

## 8. Currency

Primary:
Bits.

Sources:
- node clear
- run complete
- boss
- achievement

No premium currency for jam.

Example:
normal node 20 Bits
elite 50
boss 150
run complete 100

Typical Chapter 1 clear:
~400–550 Bits.

---

## 9. Upgrade economy

Player should afford:
1–2 useful equipment upgrades after a run.

Avoid:
5 runs for one level.

---

## 10. Rerolls

Player receives:
1 free reroll per run.

Possible skill:
+1 reroll.

This reduces bad RNG.

---

## 11. Score formula

Example:

```text
Score =
  enemiesKilled × 100
+ eliteKills × 1000
+ bossKill × 5000
+ remainingHP% × 20
+ difficultyBonus
+ speedBonus
```

Do not let speed dominate quality.

---

## 12. Balance spreadsheet columns

Track:

```text
id
name
chapter
hp
atk
def
turn_interval
skill_multiplier
rarity
expected_ttk
expected_damage_taken
notes
```

---

## 13. Balance process

1. lock formulas
2. create baseline build
3. simulate encounters
4. test extreme builds
5. tune enemies
6. tune skill rarity
7. collect playtest data
8. adjust

Never balance by random individual tweaks without a baseline.
