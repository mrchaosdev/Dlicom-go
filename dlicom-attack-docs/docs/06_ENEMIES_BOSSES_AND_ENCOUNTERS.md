# Enemies, Bosses and Encounters

## 1. Enemy archetypes

### Spam Bot
Low HP, high frequency.

### Scam Link
Medium HP.
Applies Vulnerable.

### Bug
Randomly Glitches Dili.

### Toxic Reply
Counter-focused enemy.

### Fake Account
High Dodge.

### Data Leech
Steals Rage.

### Pop-up
Creates Shield for allies.

### Corrupted Clip
Fast burst damage.

### Raid Bot
Elite bruiser.

### Null Fragment
Late-game high defense.

---

## 2. Enemy composition rules

Normal battle:
1–3 enemies.

Early:
1–2.

Late:
2–3.

Avoid 5+ enemies in jam scope because:
- visual clutter
- animation queue complexity
- balance complexity

---

## 3. Elite modifiers

Elite can roll one modifier:

### Overclocked
+30% ATK.

### Mirrored
reflect 10% direct damage.

### Shielded
starts with 30% HP shield.

### Viral
on death damages Dili.

### Encrypted
+15% Dodge.

---

# 4. Bosses

## Boss 1 — Spam King

Visual:
giant corrupted bot surrounded by floating “GM” windows.

Mechanics:
- normal attack
- every 3 turns summons Spam Bot
- every 5 turns uses Spam Flood AoE
- below 30% HP gains attack speed

Counterplay:
AoE / Viral builds perform well.

---

## Boss 2 — Loop Phantom

Theme:
DliClips corruption.

Mechanics:
- repeats previous ability
- applies Loop Mark
- marked Dili takes extra damage from repeated moves
- periodically rewinds part of its HP once

Counterplay:
burst / Rage build.

---

## Boss 3 — Raid Master

Theme:
hostile community raid.

Mechanics:
- summons 2 minions
- buffs minions
- gains shield while minions live
- Silence ability

Counterplay:
control and target-cleave.

---

## Boss 4 — Null.exe

Theme:
core network corruption.

Mechanics:
Phase 1:
balanced attacks.

Phase 2 at 60%:
Glitch field, reduces healing.

Phase 3 at 25%:
Overclock, heavy attacks.

Signature:
**NULL PULSE**
deals % max HP damage, cannot be dodged.

Counterplay:
well-rounded build.

---

# 5. Boss telegraphing

Even in auto-battle, boss attacks need telegraphs.

Before major skill:
- icon appears
- boss flashes
- 400–700 ms anticipation
- label

Example:

```text
NULL PULSE INCOMING
```

This makes the fight readable and exciting.

---

# 6. Random events

## Event 1 — Suspicious Plugin
Install:
random Epic skill, lose 20% HP.

Scan:
gain Rare skill.

Ignore:
gain small Bits.

## Event 2 — Creator Drop
Feature:
gain Community buff.
Skip:
nothing.

## Event 3 — Server Cache
Open:
reward but chance of Bug battle.

## Event 4 — Moderation Queue
Clear:
fight Elite, gain high reward.
Ignore:
heal 10%.

## Event 5 — Viral Clip
Boost:
+ATK for next 2 battles.
Archive:
gain Bits.

## Event 6 — Unknown DM
Open:
50/50 buff or Glitch debuff.
Block:
small Shield.

## Event 7 — Patch Notes
Stable:
+DEF.
Experimental:
random strong skill + random penalty.

## Event 8 — Community Raid
Defend:
elite fight.
Lock Room:
lose Bits, skip battle.

## Event 9 — Infinite Scroll
Continue:
gain skill, lose HP.
Exit:
heal.

## Event 10 — Encryption Key
Use:
Dodge buff.
Sell:
Bits.

Create at least 20 events by final.
