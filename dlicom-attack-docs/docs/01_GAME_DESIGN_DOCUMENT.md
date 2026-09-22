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
