---

# FILE: 00_README.md

# DLICOM ATTACK — Documentation Pack

> Browser auto-battle roguelite RPG inspired by the *structure* of games such as Capybara Go, rebuilt around Dlicom's identity, mascot, community culture and visual language.

## 1. Product statement

**Dlicom Attack** is a fast-session browser roguelite where the player controls **Dili**, the Dlicom mascot, travelling through corrupted layers of the network. Combat is automatic, but the player shapes each run through skill choices, equipment, random encounters, upgrades and build synergies.

The goal is not to copy another game's art, names, UI, level layouts or exact numerical systems. The inspiration is the successful loop:

**enter run → auto battle → earn levels → choose 1 of 3 skills → create synergies → fight elites/bosses → finish run → improve account → run again**

The Dlicom version must feel like its own game.

## 2. Hard scope decisions

- Platform: browser
- Input: mouse/touch; no mandatory keyboard
- Core: automatic turn-based/semi-turn-based combat
- Character: Dili
- Pet system: **not included**
- Wallet connect: **not included**
- Crypto transactions: **not included**
- Private data: **not collected**
- Backend: optional; not required for final jam build
- Main language: English
- Session target: 8–15 minutes
- Mobile: responsive portrait first
- Desktop: fully supported
- Game Jam deadline: October 5, 23:59 UTC

## 3. Docs map

1. `01_GAME_DESIGN_DOCUMENT.md` — complete GDD
2. `02_CORE_LOOP_AND_RUN_STRUCTURE.md` — exact run flow
3. `03_COMBAT_SYSTEM.md` — combat formulas and triggers
4. `04_SKILLS_AND_SYNERGIES.md` — complete skill framework and starter library
5. `05_EQUIPMENT_AND_META_PROGRESSION.md` — gear/account progression
6. `06_ENEMIES_BOSSES_AND_ENCOUNTERS.md` — enemy and boss design
7. `07_BALANCING_AND_ECONOMY.md` — formulas, rarity and reward tuning
8. `08_UI_UX_AND_SCREENS.md` — all screens and states
9. `09_ART_VFX_AUDIO_DIRECTION.md` — visual/audio bible
10. `10_TECHNICAL_ARCHITECTURE.md` — stack and clean source layout
11. `11_DATA_MODELS_AND_SCHEMAS.md` — TypeScript schemas and content data
12. `12_QA_ANALYTICS_AND_TESTING.md` — QA matrix and telemetry
13. `13_GAME_JAM_ROADMAP.md` — implementation plan to deadline
14. `14_CONTENT_PRODUCTION_CHECKLIST.md` — asset/content checklist
15. `15_AI_ASSET_PROMPTS.md` — prompt bible for consistent AI assets
16. `16_RELEASE_AND_SUBMISSION.md` — release, hosting and submission checklist

## 4. Recommended build target for the jam

A polished final jam build should contain:

- 1 playable hero: Dili
- 4 regions
- 24 normal encounters
- 8 elite encounters
- 4 bosses
- 60+ run skills
- 6 major build archetypes
- 18 equipment items
- 20 random events
- 4 rarity tiers
- 1 complete account progression track
- sound + music + hit feedback
- mobile + desktop
- local save
- final score + share card
- no pet system

That is enough to feel like a complete game without exploding scope.

## 5. Design pillars

### Buildcraft
The player should regularly say:

> “This run I accidentally created a ridiculous build.”

### Spectacle
The player does not manually attack, so the combat must be satisfying to watch.

### Short decisions
Choices should be readable in 3–5 seconds.

### Dlicom identity
Names, enemies, effects, events and progression should feel native to Dlicom rather than like a reskin.

### Replayability
Random skills, encounters and rewards should make two runs meaningfully different.

## 6. Reference asset

`assets/dili-mascot-reference.png`

Use it as the primary visual reference for proportions, helmet silhouette, cyan/blue palette and Dili's personality.


---

# FILE: 01_GAME_DESIGN_DOCUMENT.md

# DLICOM ATTACK — Game Design Document

## 1. High concept

**Genre:** Auto-battle Roguelite RPG  
**Platform:** Web browser  
**Camera:** 2D side-view battle arena  
**Session:** 8–15 minutes  
**Audience:** Dlicom community, casual roguelite players, browser-game players  
**Tone:** chaotic, energetic, cute, cyber, meme-friendly

Dili dives into a corrupted social network where Bots, Scam Links, Bugs, Glitches and hostile data entities are taking over. Dili automatically fights through waves of enemies while the player determines the build by selecting skills, upgrades and equipment.

The player's skill is expressed through **build decisions**, not mechanical reflexes.

---

## 2. Fantasy

The fantasy is:

> “I am building an absurdly overpowered Dili by stacking Dlicom-themed skills until the screen becomes controlled chaos.”

The early run looks simple.

The late run should look ridiculous.

Example progression:

```text
Packet Shot
→ Double Packet
→ Viral Packet
→ Packet Crit
→ Crit launches DliClip
→ DliClip bounces
→ Bounce applies Vulnerability
→ Vulnerable enemies explode on death
→ explosions trigger another Packet
```

That escalation is the heart of the game.

---

## 3. Core player actions

The player can:

- start a run
- watch combat
- change battle speed: x1 / x2
- pause
- inspect status effects
- choose 1 of 3 skills when offered
- choose encounter paths
- choose event outcomes
- equip gear outside the run
- upgrade gear
- spend account currency
- retry chapters
- view run summary
- share score

The player does **not**:

- manually aim
- move with WASD
- control pets
- connect wallet
- pay
- enter private information

---

## 4. Win and fail conditions

### Battle win
All enemies in the encounter reach 0 HP.

### Run win
Defeat the region boss.

### Battle fail
Dili reaches 0 HP.

### Run fail
Battle fail ends the current run.

### Soft recovery
Certain skills can:
- revive once
- prevent lethal damage once
- heal after elite fight

Revive should be rare.

---

## 5. Run structure

A run consists of 12 nodes:

1. Normal battle
2. Normal battle
3. Event
4. Elite
5. Rest / Upgrade
6. Normal battle
7. Event
8. Elite
9. Normal battle
10. Rest / Shop
11. Elite
12. Boss

Target run duration:
- early chapter: 7–9 minutes
- later chapter: 10–15 minutes

---

## 6. Combat rhythm

Combat should feel like:

```text
Dili attacks
→ enemy reacts
→ passive effects trigger
→ enemy attacks
→ defensive triggers resolve
→ status damage resolves
→ next turn
```

Average normal battle:
- 10–25 seconds

Elite:
- 20–40 seconds

Boss:
- 45–90 seconds

The player should rarely watch a single fight for more than 90 seconds.

---

## 7. Stats

Core stats:

- HP
- ATK
- DEF
- Crit Rate
- Crit Damage
- Combo Rate
- Counter Rate
- Dodge Rate
- Lifesteal
- Rage Gain
- Damage Reduction

Secondary run modifiers:

- Skill Damage
- Basic Attack Damage
- Status Damage
- Boss Damage
- Elite Damage
- Healing Power
- Shield Power

---

## 8. Rage system

Every basic attack:
- +20 Rage

Taking damage:
- +10 Rage

Default Rage cap:
- 100

At 100 Rage:
Dili automatically casts the equipped **Ultimate**.

Default ultimate:

**DLI OVERDRIVE**

Deals:
`180% ATK` to all enemies.

After cast:
Rage resets to 0.

Skills can alter:
- Rage gain
- Rage cap
- ultimate damage
- ultimate effects
- ultimate trigger chains

---

## 9. Skill draft system

At specific levels or nodes, show 3 random skills.

The player selects 1.

Rarity:
- Common
- Rare
- Epic
- Legendary

Base offer weights:

```text
Common      58%
Rare        28%
Epic        11%
Legendary    3%
```

Elite rewards can increase high-rarity odds.

Duplicate skills may:
- rank up existing skills
- unlock upgraded versions
- be excluded when maxed

---

## 10. Main build archetypes

### Packet Storm
Focus:
- basic attacks
- extra projectiles
- crit
- chaining

Identity:
fast, visual, screen-filling projectiles

### Ban Hammer
Focus:
- heavy periodic strike
- stun
- execute
- AoE

Identity:
slow but massive impact

### Firewall
Focus:
- shield
- damage reduction
- retaliation
- survival

Identity:
tank build

### Viral
Focus:
- damage multiplication
- chain reactions
- explosions
- kill triggers

Identity:
snowball damage

### Moderation
Focus:
- silence
- debuff
- cleanse
- anti-bot bonuses

Identity:
control/status build

### Encryption
Focus:
- dodge
- counter
- stealth-like protection
- delayed burst

Identity:
technical defensive/offensive hybrid

---

## 11. Difficulty philosophy

The game should not kill new players in the first minute.

Difficulty curve:

```text
Nodes 1–3: teach
Nodes 4–6: test build
Nodes 7–9: punish weak synergy
Nodes 10–11: pressure
Node 12: boss exam
```

The boss should reveal whether the player's build has:
- damage
- survivability
- scaling

---

## 12. Meta progression

Between runs:

- earn Bits
- unlock equipment
- upgrade equipment
- unlock more skills
- unlock chapters
- unlock cosmetics/achievements

No pet progression.

Meta progression should improve consistency, not make player decisions irrelevant.

---

## 13. Chapters

### Chapter 1 — The Feed
Theme:
social feed corrupted by spam

Boss:
Spam King

### Chapter 2 — DliClips
Theme:
viral short-video stream

Boss:
Loop Phantom

### Chapter 3 — Dili Rooms
Theme:
community rooms flooded by hostile entities

Boss:
Raid Master

### Chapter 4 — Core Network
Theme:
deep system / cyber infrastructure

Boss:
Null.exe

---

## 14. Replay hooks

- random skill offers
- random events
- alternate elite modifiers
- equipment drops
- chapter score
- achievements
- daily seeded run later
- difficulty modifiers later

---

## 15. Final run summary

Show:

- chapter
- time
- enemies defeated
- elites defeated
- boss
- damage dealt
- damage taken
- highest hit
- skills acquired
- main build archetype
- score
- new unlocks

Provide:
- Restart
- Home
- Share result

---

## 16. Non-goals for jam

Do not implement before core polish:

- pet system
- PvP
- multiplayer
- guild system
- wallet connect
- account registration
- live chat
- marketplace
- complex crafting
- 3D
- large narrative campaign


---

# FILE: 02_CORE_LOOP_AND_RUN_STRUCTURE.md

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


---

# FILE: 03_COMBAT_SYSTEM.md

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


---

# FILE: 04_SKILLS_AND_SYNERGIES.md

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


---

# FILE: 05_EQUIPMENT_AND_META_PROGRESSION.md

# Equipment and Meta Progression

## 1. Why equipment exists

Equipment gives:
- long-term progression
- reason to replay
- pre-run strategic choice
- reward outside individual run

It should not require pet complexity.

---

## 2. Equipment slots

Jam target:

- Weapon
- Armor
- Module

Only 3 slots.

This keeps UI manageable.

---

## 3. Weapon examples

### Packet Blaster
+ATK
Passive:
basic attack damage +10%.

### Moderator Hammer
+ATK
Passive:
Ban Hammer triggers every 3 attacks instead of 4.

### Viral Launcher
+ATK
Passive:
Viral explosion damage +20%.

### Encryption Blade
+ATK
Passive:
after Dodge, next attack +30%.

### Overdrive Core
+ATK
Passive:
start battle +20 Rage.

### DliClip Cannon
+ATK
Passive:
critical hit DliClip damage +25%.

---

## 4. Armor examples

### Firewall Shell
+HP
Shield generation +15%.

### Creator Hoodie
+HP
Healing +10%.

### Moderator Vest
+DEF
Debuffed enemies deal -8% damage.

### Zero-Knowledge Cloak
+HP
Dodge +4%.

### Anti-Spam Plating
+DEF
Bot enemies deal -10% damage.

### Core Armor
+HP/+DEF
Below 25% HP gain temporary DR.

---

## 5. Module examples

### Viral Chip
Crit +4%.

### Combo Router
Combo +6%.

### Counter Protocol
Counter +6%.

### Rage Cache
start battle +10 Rage.

### Safe Mode
damage reduction +4%.

### Trust Module
boss damage +8%.

---

## 6. Rarity

Equipment rarity:

- Common
- Rare
- Epic
- Legendary

Rarity controls:
- base stat
- passive strength
- max upgrade level

---

## 7. Upgrade system

Currency:
**Bits**

Upgrade costs:

```text
Level 1 → 2: 100
2 → 3: 180
3 → 4: 300
4 → 5: 500
```

Jam scope:
max equipment level 5.

No complex fusion.

---

## 8. Drop system

Run completion:
guaranteed equipment chest.

Boss:
higher rarity odds.

Example:
- Common 55%
- Rare 30%
- Epic 12%
- Legendary 3%

---

## 9. Account level

Earn XP from:
- completed nodes
- elite kills
- boss kills

Account level unlocks:
- new skill pool
- new equipment
- chapters
- cosmetics

Avoid raw +50% permanent ATK from account level.
Meta power should remain moderate.

---

## 10. Unlock progression

Level 1:
Packet/Firewall skills

Level 2:
Ban Hammer

Level 3:
Crit/DliClip

Level 4:
Moderation

Level 5:
Encryption

Level 6:
Viral

This gradually teaches systems.

---

## 11. Achievements

Examples:

- First Login — finish first battle
- Clean Feed — win a battle without taking damage
- Moderator — apply 20 debuffs in one run
- Viral — trigger 25 explosions in one battle
- No Signal — dodge 5 attacks in one battle
- Hammer Time — deal 5,000 damage with Ban Hammer
- DCO Energy — defeat all four bosses
- Chaos Engineer — trigger 100 combat events in a turn


---

# FILE: 06_ENEMIES_BOSSES_AND_ENCOUNTERS.md

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


---

# FILE: 07_BALANCING_AND_ECONOMY.md

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


---

# FILE: 08_UI_UX_AND_SCREENS.md

# UI / UX and Screen Specification

## 1. UX principle

The game must be usable with one thumb.

Primary actions:
large tap targets.

Avoid:
tiny desktop-first UI.

---

# 2. Screen list

## Boot / Preload
- logo
- loading bar
- asset preload status

## Title
- Play
- Equipment
- Achievements
- Settings

## Chapter Select
- 4 chapter cards
- lock states
- best score
- boss preview

## Loadout
- Dili preview
- Weapon
- Armor
- Module
- stats summary
- Start

## Route Map
- current node
- next choices
- path preview
- run stats

## Battle
Main gameplay.

## Skill Draft
3 cards.

## Event
event art + choices.

## Rest
heal / upgrade / shield.

## Reward
drop reveal.

## Boss Intro
boss name + animation.

## Run Summary
stats + rewards + share.

## Equipment
inventory and upgrade.

## Settings
music
SFX
reduced motion
battle speed default

---

# 3. Battle layout

Portrait:

```text
┌────────────────────┐
│ Node 7     x2  ||  │
│ Boss HP / enemy HP │
│                    │
│      ENEMY         │
│                    │
│      effects       │
│                    │
│       DILI         │
│                    │
│ HP ████████        │
│ Rage █████         │
│                    │
│ active skill icons │
└────────────────────┘
```

Desktop:
center phone-like battle stage with side panels for:
- stats
- skills
- combat log optional

---

# 4. Skill draft card

Each card includes:

- rarity
- icon
- name
- one-line effect
- synergy tags
- NEW / UPGRADE indicator

Example:

```text
EPIC

DLICLIP BOUNCE

DliClip hits 2 additional enemies.

[crit] [packet]
```

Do not use paragraph text.

---

# 5. Feedback

Every attack needs at least:
- movement
- impact
- sound
- damage number

Crit:
larger text.

Ultimate:
screen-level treatment.

Kill:
small burst.

Legendary pickup:
special reveal.

---

# 6. Damage numbers

Normal:
small.

Crit:
1.3× size + `CRIT`.

Heal:
`+120`.

Shield:
`+80 SHIELD`.

Do not spawn unlimited numbers.
Merge rapid multi-hits when necessary.

---

# 7. Status icons

Tap/hover:
show tooltip.

Examples:
- Burn
- Glitch
- Vulnerable
- Silence
- Shield
- Mark

---

# 8. Accessibility

Include:
- reduced motion
- SFX/music volume
- no information encoded only by color
- readable text contrast
- minimum touch targets ~44px
- pause button always visible


---

# FILE: 09_ART_VFX_AUDIO_DIRECTION.md

# Art, VFX and Audio Direction

## 1. Art identity

Use the provided Dili mascot reference as anchor.

Visual keywords:

- neon cyan
- navy/black
- magenta accents
- retro popup windows
- cyber social network
- cute mascot
- corrupted data
- glitch
- arcade impact

Avoid generic fantasy swords/castles.

---

## 2. Dili animation strategy

No hand-drawn frame animation required.

Use:
- AI-generated state sprites
- tween animation
- squash/stretch
- screen shake
- particles
- overlays

Required Dili states:

1. Idle
2. Attack
3. Crit
4. Hurt
5. Dodge
6. Ultimate
7. Low HP
8. Victory
9. Defeat

Each can be one image plus code motion.

---

## 3. Enemy animation strategy

For each enemy:

- idle
- attack
- hurt
- defeat

Can be:
single PNG + transform animations.

---

## 4. VFX library

Need reusable effects:

- packet projectile
- impact spark
- crit flash
- shield
- shield break
- fire/glitch DoT
- ban hammer slam
- DliClip projectile
- viral explosion
- rage burst
- ultimate wave
- heal
- dodge ghost
- boss warning

---

## 5. Effect timing

Basic projectile:
150–250 ms.

Impact:
80–150 ms.

Crit anticipation:
50–100 ms.

Ban Hammer:
300–500 ms.

Ultimate:
700–1200 ms.

Avoid long blocking cinematics.

---

## 6. Screen shake

Use sparingly.

Normal:
0–2 px.

Crit:
3–4 px.

Hammer:
5–7 px.

Boss ultimate:
8–10 px.

Reduced-motion mode:
disable shake.

---

## 7. Backgrounds

Chapter 1:
Feed City.

Chapter 2:
DliClip Stream.

Chapter 3:
Dili Rooms.

Chapter 4:
Core Network.

Backgrounds should be:
- layered for parallax
- low detail behind character
- strong silhouette readability

---

## 8. UI style

Blend:
retro OS popup + modern game card.

Use:
- square/rounded hybrid panels
- pixel-style icons optionally
- bright rarity border
- clear typography

Do not make it look like enterprise SaaS.

---

## 9. Audio

Music:
1 loop per chapter.

SFX:
- tap
- skill select
- attack
- crit
- hammer
- shield
- break
- dodge
- ultimate
- enemy death
- boss intro
- victory
- defeat
- reward
- legendary pickup

Audio is essential for game feel.

---

## 10. Music implementation

Web audio restrictions:
start music after user interaction.

Cache assets.

Use compressed:
`.ogg` preferred, `.mp3` fallback if needed.

---

## 11. Asset resolution

Dili:
1024×1024 source, downscale runtime.

Enemies:
512–1024.

Icons:
256 source.

Background:
1920×1080 source.

UI:
SVG where possible.

Optimize before deploy.


---

# FILE: 10_TECHNICAL_ARCHITECTURE.md

# Technical Architecture

## 1. Recommended stack

```text
Vite
TypeScript
React
Phaser 3
Zustand
Howler.js
Zod
Vitest
Playwright
ESLint
Prettier
```

Deploy:
Vercel.

No backend required for jam.

---

## 2. Division of responsibility

### React
- menus
- chapter select
- equipment
- skill draft overlay
- event screens
- summary
- settings

### Phaser
- battle scene
- sprites
- projectiles
- VFX
- camera shake
- animation timeline

### Pure TypeScript domain layer
- combat rules
- skill resolution
- RNG
- damage formulas
- run state

This separation is critical.

Do not put combat formulas inside Phaser sprite classes.

---

## 3. Recommended repository

```text
dlicom-attack/
├─ public/
│  └─ assets/
├─ src/
│  ├─ app/
│  │  ├─ routes/
│  │  ├─ screens/
│  │  └─ components/
│  │
│  ├─ game/
│  │  ├─ phaser/
│  │  │  ├─ scenes/
│  │  │  ├─ objects/
│  │  │  ├─ effects/
│  │  │  └─ adapters/
│  │  │
│  │  ├─ combat/
│  │  │  ├─ CombatEngine.ts
│  │  │  ├─ DamageResolver.ts
│  │  │  ├─ TriggerResolver.ts
│  │  │  ├─ StatusResolver.ts
│  │  │  ├─ TargetResolver.ts
│  │  │  └─ RageResolver.ts
│  │  │
│  │  ├─ run/
│  │  │  ├─ RunGenerator.ts
│  │  │  ├─ EncounterGenerator.ts
│  │  │  └─ RewardResolver.ts
│  │  │
│  │  └─ rng/
│  │     └─ SeededRng.ts
│  │
│  ├─ content/
│  │  ├─ skills/
│  │  ├─ enemies/
│  │  ├─ bosses/
│  │  ├─ equipment/
│  │  ├─ chapters/
│  │  └─ events/
│  │
│  ├─ stores/
│  │  ├─ accountStore.ts
│  │  ├─ runStore.ts
│  │  └─ settingsStore.ts
│  │
│  ├─ schemas/
│  ├─ services/
│  │  ├─ save/
│  │  └─ audio/
│  ├─ utils/
│  └─ main.tsx
│
├─ tests/
├─ docs/
└─ package.json
```

---

## 4. State ownership

Account state:
- equipment
- Bits
- unlocks
- achievements
- settings

Run state:
- current HP
- current node
- skills
- temporary buffs
- run currency
- seed

Combat state:
temporary; created per encounter.

---

## 5. Save system

Use localStorage.

Version it.

Example:

```ts
type SaveFile = {
  version: 1;
  account: AccountState;
  settings: SettingsState;
};
```

Always add migration function.

```ts
migrateSave(raw)
```

Never assume old saves match current structure.

---

## 6. RNG

Use seeded RNG.

Why:
- reproducible bugs
- deterministic tests
- shareable seeds later

Example:
`mulberry32` or similar small PRNG.

Do not use `Math.random()` throughout the domain layer.

---

## 7. Content-driven design

Skills/enemies/equipment should be data.

Do not hardcode every item in scene code.

Example:

```ts
export const packetBoost: SkillDefinition = {
  id: "packet_boost",
  rarity: "common",
  tags: ["packet", "basic"],
  effects: [
    {
      type: "MODIFIER",
      stat: "basicDamage",
      operation: "ADD_PERCENT",
      value: 0.20
    }
  ]
};
```

---

## 8. Combat engine API

Suggested:

```ts
const engine = new CombatEngine({
  seed,
  player,
  enemies,
  skills
});

const result = engine.step();
```

`step()` returns presentation events.

Phaser consumes events.

---

## 9. Event bus

Use typed events.

```ts
type CombatEvent =
  | DamageEvent
  | HealEvent
  | StatusEvent
  | ProjectileEvent
  | DeathEvent
  | UltimateEvent;
```

Presentation must not mutate combat state.

---

## 10. Performance

Target:
60 FPS.

Rules:
- pool projectiles
- pool damage text
- cap particles
- preload chapter assets
- compress textures
- use texture atlases after MVP if needed

---

## 11. Mobile

Test:
- 360×800
- 390×844
- 412×915

Landscape desktop:
1366×768
1920×1080.

---

## 12. Build commands

Recommended:

```bash
npm run dev
npm run build
npm run test
npm run test:e2e
npm run lint
npm run typecheck
```

CI should fail on:
- TypeScript errors
- unit test failure
- lint errors

---

## 13. No backend architecture

For jam:

```text
Browser
├─ game
├─ local save
└─ static assets

Vercel CDN
```

Enough.

If leaderboard is added:
Supabase can be a later module.


---

# FILE: 11_DATA_MODELS_AND_SCHEMAS.md

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


---

# FILE: 12_QA_ANALYTICS_AND_TESTING.md

# QA, Analytics and Testing

## 1. QA priorities

Highest-risk systems:

1. trigger chains
2. save/load
3. skill prerequisites
4. boss phases
5. mobile UI
6. animation/game-state desync
7. infinite combat loops

---

## 2. Unit tests

Must cover:

- damage formula
- DEF scaling
- crit
- combo cap
- counter
- dodge
- shield absorption
- status duration
- rage
- ultimate trigger
- lethal prevention
- revive
- skill prerequisite
- seeded RNG repeatability

---

## 3. Example deterministic test

```ts
it("same seed creates same skill draft", () => {
  const a = generateDraft("seed-123");
  const b = generateDraft("seed-123");

  expect(a).toEqual(b);
});
```

---

## 4. Simulation tests

Create bot simulation.

Run:
10,000 fake battles.

Track:
- win rate
- average turns
- damage
- skill power outliers

This catches broken numbers faster than manual testing.

---

## 5. Playtest checklist

Ask tester:

- Did you understand what happened?
- Did skill choices feel meaningful?
- Could you identify your build?
- Were fights too slow?
- Was text readable?
- Was boss understandable?
- Did you want another run?
- Which skill felt useless?
- Which skill felt broken?

---

## 6. Device matrix

Desktop:
- Chrome
- Edge
- Firefox

Mobile:
- Android Chrome
- iOS Safari if accessible

---

## 7. Performance test

During worst late-run build:

Track:
- FPS
- active sprites
- particles
- event queue length
- JS heap if possible

Target:
stable 60 FPS desktop,
acceptable 45–60 mobile.

---

## 8. Analytics

Optional for jam.

If added, track anonymous gameplay only:

```text
run_started
run_finished
run_failed
skill_selected
boss_started
boss_defeated
chapter_selected
```

Do not collect personal data.

---

## 9. Bug severity

P0:
game cannot start / data loss.

P1:
run cannot progress / boss broken.

P2:
skill wrong / layout broken.

P3:
cosmetic issue.

Fix order:
P0 → P1 → P2 → P3.

---

## 10. Release gate

Do not release final until:

- fresh browser works
- old save works
- mobile controls work
- all bosses can die
- no console spam
- no missing asset
- no infinite loop
- x2 works
- audio respects settings


---

# FILE: 13_GAME_JAM_ROADMAP.md

# Game Jam Roadmap

Deadline:
**October 5, 23:59 UTC**

Goal:
ship a polished, complete game instead of a giant unfinished one.

---

# Phase 1 — Foundation

## Day 1
- Vite/React/TypeScript setup
- Phaser integration
- asset loader
- state stores
- seeded RNG
- basic battle scene

Deliverable:
Dili and one enemy can fight automatically.

## Day 2
- damage resolver
- crit
- combo
- counter
- dodge
- rage
- ultimate
- battle end

Deliverable:
complete combat loop.

---

# Phase 2 — Skill System

## Day 3
- skill schemas
- trigger resolver
- 20 skills
- skill draft UI
- rarity

Deliverable:
first real builds.

## Day 4
- 40+ skills
- prerequisites
- reroll
- skill rank-up
- synergy weighting

Deliverable:
replayable run core.

---

# Phase 3 — Run

## Day 5
- 12-node run
- route choices
- events
- rest
- elite
- reward

## Day 6
- Chapter 1
- Spam King
- run summary
- score
- local save

**Release public v0.1 here.**

---

# Phase 4 — Content

## Day 7
- Chapter 2
- more enemies
- 10 events
- equipment

## Day 8
- Chapter 3
- boss
- 60+ skills
- achievements

## Day 9
- Chapter 4
- final boss
- equipment balance

---

# Phase 5 — Game Feel

## Day 10
- Dili reactions
- hit effects
- crit VFX
- hammer VFX
- ultimate
- screen shake
- particles
- sound

## Day 11
- background
- boss intro
- UI polish
- mobile layout
- rarity animations

---

# Phase 6 — Testing

## Day 12
- community beta
- bug triage
- balance pass
- performance

## Day 13
- final polish
- trailer/clip
- screenshots
- submission text
- deployment verification

---

# Must-ship list

If behind schedule, preserve:

1. Chapter 1 complete
2. 40+ skills
3. 1 boss
4. equipment
5. full run loop
6. sound/VFX
7. mobile
8. final summary

Cut in this order:

1. Chapter 4
2. Chapter 3
3. Chapter 2
4. extra equipment
5. extra events

Never cut:
combat polish.

---

# Public version strategy

### v0.1
core combat + first boss

### v0.2
skill expansion + equipment

### v0.3
more chapters + mobile polish

### v1.0
final jam build

Post clips after meaningful improvements, not every tiny commit.


---

# FILE: 14_CONTENT_PRODUCTION_CHECKLIST.md

# Content Production Checklist

## Character

Dili:
- [ ] idle
- [ ] attack
- [ ] crit
- [ ] hurt
- [ ] dodge
- [ ] ultimate
- [ ] low HP
- [ ] victory
- [ ] defeat

## Enemies

- [ ] Spam Bot
- [ ] Scam Link
- [ ] Bug
- [ ] Toxic Reply
- [ ] Fake Account
- [ ] Data Leech
- [ ] Pop-up
- [ ] Corrupted Clip
- [ ] Raid Bot
- [ ] Null Fragment

## Bosses

- [ ] Spam King
- [ ] Loop Phantom
- [ ] Raid Master
- [ ] Null.exe

## Backgrounds

- [ ] Feed City
- [ ] DliClip Stream
- [ ] Dili Rooms
- [ ] Core Network

## VFX

- [ ] basic packet
- [ ] impact
- [ ] crit
- [ ] shield
- [ ] shield break
- [ ] hammer
- [ ] DliClip
- [ ] Viral explosion
- [ ] Glitch
- [ ] Rage
- [ ] ultimate
- [ ] heal
- [ ] dodge
- [ ] boss warning

## Icons

At least:
- [ ] 70 skill icons
- [ ] status icons
- [ ] equipment icons
- [ ] node icons
- [ ] currency icon
- [ ] achievement icons

## UI

- [ ] title
- [ ] chapter card
- [ ] equipment slots
- [ ] HP
- [ ] Rage
- [ ] skill draft card
- [ ] event panel
- [ ] boss HP
- [ ] pause
- [ ] result screen

## Audio

- [ ] 4 music loops or 1 strong reusable loop
- [ ] attack
- [ ] crit
- [ ] hammer
- [ ] ultimate
- [ ] shield
- [ ] break
- [ ] enemy death
- [ ] boss intro
- [ ] victory
- [ ] defeat
- [ ] skill select
- [ ] legendary

## Text content

- [ ] skill names
- [ ] skill descriptions
- [ ] enemy names
- [ ] boss descriptions
- [ ] 20 random events
- [ ] achievements
- [ ] chapter descriptions
- [ ] tutorial hints


---

# FILE: 15_AI_ASSET_PROMPTS.md

# AI Asset Prompt Bible

Use the supplied Dili reference image whenever the image tool supports reference-image generation.

The goal is **consistency**, not random pretty images.

---

# 1. Global style block

Reuse this concept:

> 2D stylized cyber mascot game art, dark navy background, cyan and electric blue primary palette, magenta and yellow accent lights, retro internet popup motifs, playful chaotic social-network aesthetic, crisp silhouette, clean readable shapes, game asset, no text, no watermark.

---

# 2. Dili idle

> Preserve the exact mascot identity and helmet silhouette from the reference. Dili standing in a relaxed combat pose, front three-quarter view, holding a compact glowing data blaster, friendly confident expression, transparent background, centered full body, 2D game sprite.

---

# 3. Dili attack

> Same Dili character, same proportions and costume, dynamic recoil pose firing a cyan data packet projectile, energetic motion, readable silhouette, transparent background, no environment.

---

# 4. Dili hurt

> Same Dili character recoiling backward from an impact, surprised expression, small digital glitch fragments, transparent background.

---

# 5. Dili ultimate

> Same Dili mascot charging a huge circular neon network pulse, cyan energy rings, magenta glitch sparks, powerful heroic pose, transparent background.

---

# 6. Spam Bot

> Small hostile bot made from stacked retro chat windows and repeated “message” symbols without readable words, goofy but dangerous, cyan-magenta cyber palette, transparent background, 2D game enemy sprite.

---

# 7. Scam Link

> Mischievous cyber creature shaped around a suspicious glowing chain-link icon, red warning accents, deceptive smile, retro popup fragments, transparent background.

---

# 8. Bug

> Cute corrupted software bug creature, angular glitch wings, broken pixels, neon cyan and magenta, transparent background.

---

# 9. Spam King boss

> Large boss made from a throne of stacked notification windows and bot parts, crown shaped like signal bars, massive silhouette, humorous cyber villain, dark navy/cyan/magenta palette, transparent background.

---

# 10. Null.exe boss

> Abstract final cyber entity, black void core surrounded by broken blue data rings and magenta corruption, intimidating but readable 2D boss silhouette, transparent background.

---

# 11. Background: Feed City

> Wide 2D game background, futuristic social-feed city made from floating windows, message panels and neon data lanes, dark navy night, cyan lights, magenta accents, clear central battle floor, layered parallax composition, no characters, no text.

---

# 12. Skill icons

General:

> square game skill icon, simple bold symbol, dark navy base, cyan/magenta energy, high contrast, centered, readable at 64 pixels, no text, no border.

Examples:
- Ban Hammer: glowing moderation hammer
- Firewall: hex shield
- DliClip: bouncing play-button data shard
- Viral: branching network explosion
- Encryption: locked signal
- Rage: overclocked core

---

# 13. Consistency rules

Always preserve:
- Dili helmet shape
- body proportions
- cyan/blue identity
- 2D style

Avoid:
- realistic humans
- photorealism
- complex backgrounds on sprites
- random costume redesign
- illegible text
- watermark


---

# FILE: 16_RELEASE_AND_SUBMISSION.md

# Release and Submission

## 1. Hosting

Recommended:
Vercel.

Build:
```bash
npm run build
```

Output:
`dist/`

---

## 2. Browser requirements

Verify:
- Chrome desktop
- Edge desktop
- Android Chrome
- Safari mobile if possible

---

## 3. First-load performance

Targets:
- initial bundle reasonable
- lazy load later chapter assets
- preload only current chapter
- compressed audio
- WebP/AVIF backgrounds where practical

---

## 4. Jam compliance

Final game must:

- be a new project
- work in browser
- contain no plagiarism
- contain no wallet connection
- request no seed phrase
- perform no transaction/payment
- collect no private data

Keep these rules in README.

---

## 5. Submission package

Prepare:

- game URL
- GitHub URL if public
- title
- one-sentence hook
- 3 screenshots
- 20–40 second gameplay clip
- feature list
- controls
- known limitations
- version number

---

## 6. Suggested submission copy

### Title
**Dlicom Attack**

### Hook
Build an overpowered Dili, chain absurd Dlicom-themed skills, and fight through a corrupted social network in a fast browser roguelite.

### Short description
Dlicom Attack is an auto-battle roguelite built for the Dlicom AI Game Jam. Each run lets you create a different build using Packet attacks, Ban Hammer, Firewall, Viral chains, Moderation tools, Encryption, Crit, Combo and Rage. Defeat corrupted bots, survive elite encounters and take down the network bosses.

No wallet. No transactions. Just chaos.

---

## 7. Trailer structure

0–3 sec:
Dili + title.

3–8:
basic battle.

8–15:
skill selection.

15–25:
late-run crazy build.

25–32:
boss.

32–38:
victory/results.

End:
PLAY DLICOM ATTACK.

---

## 8. Final release checklist

- [ ] production build deployed
- [ ] no console errors
- [ ] save works
- [ ] fresh incognito test
- [ ] all chapters reachable
- [ ] all bosses killable
- [ ] no broken asset URLs
- [ ] audio controls
- [ ] mobile readable
- [ ] share/result works
- [ ] version displayed
- [ ] submission posted before deadline
