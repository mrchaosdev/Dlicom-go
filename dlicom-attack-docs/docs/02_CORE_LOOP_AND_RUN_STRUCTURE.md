# Core Loop and Run Structure

## 1. Macro loop

```text
HOME
↓
Choose chapter
↓
Prepare equipment
↓
Start run
↓
Battle / Event / Upgrade nodes
↓
Choose skills
↓
Boss
↓
Rewards
↓
Upgrade account
↓
Run again
```

## 2. Micro combat loop

```text
Turn Start
↓
start-of-turn passives
↓
Dili basic attack
↓
combo check
↓
on-hit effects
↓
crit resolution
↓
enemy action
↓
dodge / block / shield
↓
counter check
↓
status ticks
↓
rage check
↓
ultimate if Rage >= cap
↓
death triggers
↓
Turn End
```

## 3. Level/skill cadence

Recommended skill offers per 12-node run:

- after Node 1
- after Node 2
- after Node 4 Elite
- after Node 5 Rest
- after Node 6
- after Node 8 Elite
- after Node 9
- after Node 10
- after Node 11 Elite

Total:
~9 major choices per run.

Random events can add 1–2 extra skills.

Target final build:
10–12 skills/upgrades.

## 4. Encounter types

### Battle
Standard enemies.

### Elite
Stronger enemy with modifier.

### Event
Choice with reward/risk.

### Rest
Choose:
- heal 30%
- upgrade a skill
- gain shield for next battle

Per the later human direction, Node 10 is also a Signal Bazaar. The player may spend 80 Bits earned during that run instead of taking a normal Rest service. The purchase opens a 1-of-3 Rare-or-better skill draft. This is an in-run build choice, and spent Bits are absent from the end-of-run payout. The other Rest choices remain available at Node 10.

### Cache
Choose one:
- Bits
- temporary stat boost
- random equipment fragment

### Boss
Final chapter encounter.

## 5. Path system

For jam scope:
use a simple 3-column route rather than a huge map.

Example:

```text
        Battle
       /      \
   Event      Battle
      \       /
       Elite
      /     \
   Rest    Cache
      \     /
      Boss
```

The path should communicate risk.

Color/category icon:
- Battle: sword
- Elite: skull
- Event: question mark
- Rest: heart
- Cache: box
- Boss: crown

## 6. Event design rules

Each event should have:
- 1 short setup
- 2–3 choices
- clear but not fully predictable risk

Example:

**Unverified Creator Tool**

A mysterious plugin promises +50% reach.

Choices:
- Install
- Scan
- Ignore

Possible effects:
- temporary attack buff
- Chaos debuff
- Bits
- skill reroll

## 7. Run pacing target

Minute 0–2:
player forms initial build direction.

Minute 2–5:
synergies begin.

Minute 5–8:
build identity becomes obvious.

Minute 8+:
spectacle and boss test.

## 8. Fail-state handling

On death:
- freeze action
- slow motion 300 ms
- collapse VFX
- show "Run Ended"
- show one useful stat
- offer immediate retry

Avoid:
long defeat animation
forced home return
unskippable dialog
