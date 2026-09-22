# AGENTS.md — DLICOM ATTACK Coding Agent Instructions

> **READ THIS FILE FIRST.**
>
> This repository is governed by a complete design and technical specification for **Dlicom Attack**.
> Do not begin implementation by inventing your own game design, architecture, combat rules, content structure, or feature scope.

---

# 1. Your role

You are the implementation agent for **Dlicom Attack**, a browser-based auto-battle roguelite RPG.

Your job is to:

1. read the supplied documentation,
2. understand the intended game,
3. implement it faithfully,
4. keep the codebase clean and maintainable,
5. surface gaps or contradictions rather than silently redesigning the product.

You are **not** the game designer unless a specification explicitly leaves something open.

Do not turn the project into:
- an arena survival game,
- a manual action RPG,
- a card-only management game,
- a tower defense game,
- a platformer,
- an idle clicker,
- a multiplayer game.

The intended core is:

```text
AUTO BATTLE
    ↓
GAIN / RECEIVE SKILL CHOICE
    ↓
CHOOSE 1 OF 3
    ↓
BUILD SYNERGIES
    ↓
PROGRESS THROUGH RUN NODES
    ↓
ELITES / EVENTS / REST
    ↓
BOSS
    ↓
META REWARDS
    ↓
UPGRADE EQUIPMENT
    ↓
NEW RUN
```

---

# 2. Product identity

## Name

**Dlicom Attack**

## Genre

Browser auto-battle roguelite RPG.

## Primary inspiration

The broad progression/buildcraft structure of games such as Capybara Go.

This is **inspiration only**.

Do not copy:
- copyrighted artwork,
- UI layouts,
- characters,
- exact skills,
- exact item names,
- exact progression tables,
- exact level layouts,
- text,
- sound,
- proprietary assets.

Dlicom Attack must remain an original Dlicom-themed game.

---

# 3. Non-negotiable scope

The following decisions are already made.

Do not change them unless the human explicitly asks.

```text
Platform             Browser
Primary language     English
Hero                 Dili
Combat               Automatic
Movement             No manual movement required
Aiming               No manual aiming required
Run length           ~8–15 minutes
Pet system           NO
PvP                   NO
Multiplayer           NO
Wallet connect        NO
Crypto transactions   NO
Payments              NO
Private-data capture  NO
Backend required      NO
Primary deploy        Vercel
Save                  Local browser save
Mobile support        YES
Desktop support       YES
```

**Pet functionality must not be introduced as a “nice-to-have” during the Game Jam.**

---

# 4. Documentation is the source of truth

Read documentation in this exact order before implementing major systems.

## Tier 0 — mandatory orientation

```text
AGENTS.md
README.md
docs/00_README.md
```

## Tier 1 — understand the game

```text
docs/01_GAME_DESIGN_DOCUMENT.md
docs/02_CORE_LOOP_AND_RUN_STRUCTURE.md
```

Do not implement gameplay until you understand these.

## Tier 2 — gameplay rules

```text
docs/03_COMBAT_SYSTEM.md
docs/04_SKILLS_AND_SYNERGIES.md
docs/05_EQUIPMENT_AND_META_PROGRESSION.md
docs/06_ENEMIES_BOSSES_AND_ENCOUNTERS.md
docs/07_BALANCING_AND_ECONOMY.md
```

These files define the gameplay domain.

## Tier 3 — player-facing implementation

```text
docs/08_UI_UX_AND_SCREENS.md
docs/09_ART_VFX_AUDIO_DIRECTION.md
```

## Tier 4 — engineering contract

```text
docs/10_TECHNICAL_ARCHITECTURE.md
docs/11_DATA_MODELS_AND_SCHEMAS.md
docs/12_QA_ANALYTICS_AND_TESTING.md
```

## Tier 5 — production and release

```text
docs/13_GAME_JAM_ROADMAP.md
docs/14_CONTENT_PRODUCTION_CHECKLIST.md
docs/15_AI_ASSET_PROMPTS.md
docs/16_RELEASE_AND_SUBMISSION.md
```

---

# 5. Precedence when documents conflict

If two specifications appear to conflict, use this precedence:

```text
1. Latest explicit human instruction
2. AGENTS.md
3. 01_GAME_DESIGN_DOCUMENT.md
4. Specialized document for that subsystem
5. 10_TECHNICAL_ARCHITECTURE.md
6. 11_DATA_MODELS_AND_SCHEMAS.md
7. Other documentation
8. Existing implementation
```

Example:

If existing code behaves differently from the combat specification,
**the combat specification wins** unless the human explicitly approved the code change.

Do not preserve a wrong implementation merely because it already exists.

---

# 6. What to do when something is unspecified

Not every tiny implementation detail will be documented.

Use this decision hierarchy:

### A. If the missing detail is purely technical

You may choose a sensible implementation.

Examples:
- helper function naming,
- exact folder for a tiny utility,
- internal algorithm with identical behavior,
- CSS implementation detail,
- test fixture layout.

Keep it simple.

### B. If the missing detail affects gameplay balance but not product direction

Choose the smallest reversible default.

Document the assumption.

Example:

```text
ASSUMPTION:
Enemy attack animation = 350 ms until final VFX timing is supplied.
```

### C. If the missing detail changes gameplay, scope, economy, progression, or architecture

Do **not** silently invent it.

Examples:
- adding a pet system,
- introducing mana,
- changing auto combat to manual combat,
- adding login,
- introducing premium currency,
- replacing Phaser,
- changing 3 equipment slots into 8,
- inventing multiplayer.

Stop and surface the decision.

---

# 7. Implementation philosophy

The project should be:

```text
content-driven
deterministic where practical
strongly typed
testable
modular
mobile-friendly
fast to iterate
```

Avoid:

```text
god classes
scene-specific business logic
magic strings
random Math.random() calls throughout the code
large switch statements for every skill
duplicated formulas
React components mutating combat state directly
Phaser sprites owning combat rules
```

---

# 8. Mandatory architecture separation

The game has three major layers.

## Domain layer — Pure TypeScript

Owns:
- combat calculations,
- RNG,
- statuses,
- trigger resolution,
- damage,
- rage,
- run generation,
- rewards,
- skill rules.

It must be testable without Phaser or React.

Example:

```text
src/game/combat/
src/game/run/
src/game/rng/
```

## Phaser presentation layer

Owns:
- sprites,
- battle animation,
- particles,
- projectiles,
- camera shake,
- visual timelines.

Phaser receives combat events.

Phaser must **not** be the authority on:
- HP,
- damage,
- skill effects,
- status duration,
- RNG outcomes.

## React application layer

Owns:
- title/menu,
- chapter select,
- equipment,
- skill draft UI,
- events,
- run summary,
- settings.

React must not contain duplicate combat formulas.

---

# 9. Core combat rule

Combat logic resolves first.

Animation presents the resolved result.

Use the pattern:

```text
Combat Engine
     ↓
Combat Events
     ↓
Presentation Queue
     ↓
Phaser Animation
```

Example domain output:

```ts
[
  {
    type: "DAMAGE",
    sourceId: "dili",
    targetId: "spam_bot_1",
    amount: 182,
    crit: true
  },
  {
    type: "RAGE_GAIN",
    actorId: "dili",
    amount: 20
  }
]
```

Do not couple the logical result to whether an animation callback fires.

---

# 10. Seeded RNG is mandatory

Gameplay randomness must be reproducible.

Use a seeded RNG abstraction.

Do not use:

```ts
Math.random()
```

inside:
- combat,
- skill drafts,
- encounter generation,
- drops,
- event outcomes.

The same seed + same inputs should produce the same logical result.

This is important for:
- testing,
- bug reproduction,
- future daily runs,
- balancing.

---

# 11. Trigger safety is mandatory

Dlicom Attack intentionally contains chained skill effects.

Therefore the engine must defend against infinite loops.

Implement hard safeguards consistent with the combat spec.

At minimum:

```text
MAX_COMBO_CHAIN
MAX_TRIGGER_DEPTH
MAX_EVENTS_PER_TURN
```

If a guard is exceeded:

1. stop the chain safely,
2. emit a developer warning,
3. keep the run playable,
4. do not crash the browser.

---

# 12. Skill implementation rule

Skills should primarily be data-driven.

Prefer:

```ts
SkillDefinition
TriggerDefinition
ModifierDefinition
ProcDefinition
```

over:

```ts
if (skillId === "packet_boost") ...
else if (skillId === "viral_packet") ...
else if ...
```

Special rule-changing Legendary skills may use custom resolvers when a generic effect model becomes unreasonable.

Do not over-engineer a DSL just to avoid five lines of custom logic.

---

# 13. Content IDs

Use stable machine IDs.

Format:

```text
snake_case
```

Examples:

```text
packet_boost
ban_hammer
viral_packet
spam_bot
boss_spam_king
weapon_packet_blaster
chapter_feed
```

Never use display names as persistent IDs.

---

# 14. Save-file rules

The save is versioned.

Never persist arbitrary current Zustand state directly without a stable schema.

Example:

```ts
{
  version: 1,
  account: {...},
  settings: {...}
}
```

Every future breaking save change must provide migration.

A malformed save must not permanently brick the game.

Fallback behavior:
- detect,
- preserve/log where possible,
- recover to valid defaults.

---

# 15. Asset handling

The current reference mascot is:

```text
assets/dili-mascot-reference.png
```

Treat it as a visual reference, not necessarily the final runtime sprite.

Runtime assets should use descriptive keys.

Example:

```text
dili_idle
dili_attack
dili_hurt
dili_ultimate

enemy_spam_bot_idle
enemy_spam_bot_attack

vfx_packet
vfx_ban_hammer
vfx_viral_explosion
```

Do not hardcode `/public/...` asset URLs throughout the codebase.

Centralize asset manifests.

---

# 16. Placeholder asset policy

During implementation, placeholder assets are allowed.

They must:

- preserve intended dimensions/layout,
- be clearly replaceable,
- not change gameplay,
- use stable asset keys.

Do not block domain implementation because final art is not ready.

Do not mistake placeholders for final polish.

---

# 17. Game feel matters

This Game Jam is not won by having the most systems.

Prioritize:

```text
impact
clarity
responsiveness
skill synergy
boss readability
audio feedback
VFX
polish
```

A correct attack should visibly feel like an attack.

At minimum a damaging action should produce appropriate combinations of:

- motion,
- hit reaction,
- damage number,
- impact VFX,
- SFX.

---

# 18. Mobile-first rule

Every major screen must remain usable around:

```text
360 × 800
390 × 844
412 × 915
```

Do not build a desktop-only UI and “fix mobile later”.

Touch targets should generally be at least ~44 CSS pixels.

No gameplay choice may depend only on hover.

---

# 19. Performance rules

Target:
- smooth modern desktop,
- viable modern mobile.

Avoid uncontrolled creation of:

- particles,
- projectiles,
- damage-number DOM nodes,
- Phaser objects,
- event listeners.

Use pooling where it improves high-frequency combat objects.

Late-game synergy builds are the stress test.

---

# 20. Testing requirements

Do not treat tests as optional cleanup.

At minimum create unit tests for:

```text
damage
defense
crit
combo
counter
dodge
shield
rage
ultimate
status duration
lethal prevention
revive
skill prerequisites
seeded RNG
```

Use deterministic tests.

For complicated skill chains, add regression tests whenever a bug is fixed.

---

# 21. Recommended implementation order

Unless the human gives a different order, build in this sequence.

## Milestone 1 — Vertical combat slice

Goal:

```text
Dili
vs
Spam Bot
```

Required:
- battle loads,
- turn loop,
- HP,
- basic attack,
- damage,
- enemy attack,
- death,
- victory/defeat.

No menu polish required.

---

## Milestone 2 — Combat systems

Add:

```text
Crit
Combo
Counter
Dodge
Shield
Rage
Ultimate
Statuses
```

Add tests before expanding content heavily.

---

## Milestone 3 — Skill engine

Add:
- SkillDefinition
- skill ownership
- triggers
- draft 1 of 3
- rarity
- prerequisites
- reroll
- ~20 representative skills

Prove all six intended archetypes can be expressed.

---

## Milestone 4 — One complete run

Implement:

```text
start run
battle
skill draft
event
elite
rest
boss
run summary
```

Use Chapter 1 only.

At this point the game must already be genuinely playable.

---

## Milestone 5 — Meta progression

Implement:
- Bits,
- equipment,
- upgrades,
- unlocks,
- save/load.

---

## Milestone 6 — Content expansion

Add:
- remaining skills,
- enemies,
- events,
- chapters,
- bosses.

Do not expand content before the core is stable.

---

## Milestone 7 — Game feel

Polish:
- final sprites,
- VFX,
- SFX,
- music,
- camera feedback,
- skill-card presentation,
- boss intros.

---

## Milestone 8 — Release

Perform:
- mobile QA,
- browser QA,
- balance pass,
- save migration check,
- production build,
- Vercel deployment.

---

# 22. Definition of done for a feature

A gameplay feature is not complete merely because the happy path works.

A feature is considered complete when:

1. intended behavior matches docs,
2. types are correct,
3. edge cases are handled,
4. tests exist where appropriate,
5. UI communicates the behavior,
6. no obvious console errors occur,
7. mobile remains functional,
8. save compatibility is considered if persistent.

---

# 23. Do not prematurely expand scope

Before implementing a new feature, ask:

```text
Is this explicitly in the docs?
Does this improve the final Game Jam product?
Does this threaten completion of core polish?
```

If it is not in the specification, default answer is:

**do not add it.**

Especially avoid unsolicited:

- pets,
- crafting trees,
- guilds,
- social login,
- multiplayer,
- marketplace,
- blockchain,
- cloud accounts,
- complex quest systems,
- procedurally generated lore,
- giant inventories.

---

# 24. Do not rewrite stable systems for fashion

Do not replace a working architecture because another framework is trendier.

Examples:

- Do not migrate React to another frontend framework.
- Do not replace Phaser because a different game engine exists.
- Do not add a backend when local save is enough.
- Do not introduce ECS unless there is a concrete need.
- Do not introduce Redux when Zustand is sufficient.

Optimize for:
**shipping a polished game**.

---

# 25. Human-facing progress reports

When reporting implementation progress, use this format:

```text
COMPLETED
- ...

CURRENT
- ...

NEXT
- ...

BLOCKERS / DECISIONS NEEDED
- ...

TEST STATUS
- ...
```

Do not report a subsystem as complete if:
- tests fail,
- critical placeholders make it unusable,
- integration is broken.

---

# 26. When asked to implement a large task

Do not attempt the entire game as one uncontrolled mega-edit.

Break work into vertical slices.

Preferred:

```text
1. inspect relevant docs
2. inspect existing code
3. implement one coherent subsystem
4. typecheck
5. test
6. run/build
7. summarize
8. proceed
```

Avoid:
hundreds of speculative files created before verifying the first playable loop.

---

# 27. When changing existing code

Before editing:

1. search for existing implementation,
2. identify ownership,
3. inspect related tests,
4. preserve public contracts where reasonable.

Do not create:

```text
CombatEngine2
NewCombatEngine
CombatEngineFinal
CombatEngineFixed
```

Refactor intentionally.

---

# 28. Error handling

Player-facing errors:
short and recoverable.

Developer errors:
clear enough to diagnose.

Content validation failures in development should identify:
- file/item ID,
- field,
- expected value,
- actual value.

Never silently ignore broken content definitions.

---

# 29. Naming convention

Recommended:

```text
Types / classes       PascalCase
functions             camelCase
variables             camelCase
constants             UPPER_SNAKE_CASE
content IDs           snake_case
React components      PascalCase
files                  follow project convention consistently
```

Do not mix naming styles randomly.

---

# 30. Commit-sized thinking

Even if commits are not actually being created, structure work as if each milestone could be reviewed independently.

A good implementation step should answer:

```text
What changed?
Why?
What docs require it?
How was it verified?
```

---

# 31. Game Jam priority hierarchy

When time is limited:

```text
1. Working core combat
2. Fun skill synergies
3. Complete run
4. Boss
5. Clear UI
6. Game feel / audio / VFX
7. Mobile stability
8. Content volume
9. Extra systems
```

One excellent chapter beats four broken chapters.

A polished 40-skill pool beats 100 broken skills.

---

# 32. Minimum viable final product

If the deadline becomes critical, the final game is still acceptable with:

```text
1 polished chapter
1 boss
40+ skills
6 viable archetypes
3 equipment slots
multiple equipment items
events
rest node
elite encounter
run summary
local save
audio
VFX
mobile support
```

Do not sacrifice the core game to hit an arbitrary content count.

---

# 33. Acceptance test for “this is actually Dlicom Attack”

A new player should be able to:

1. open the browser game,
2. understand how to start without documentation,
3. equip Dili,
4. enter a run,
5. watch Dili automatically fight,
6. receive meaningful 1-of-3 skill choices,
7. develop a recognizable build,
8. encounter events and elites,
9. fight a boss,
10. win or lose,
11. receive rewards,
12. improve equipment,
13. start another run with a reason to try a different build.

If that loop is not functional, the product is not yet complete.

---

# 34. Final instruction

When in doubt, return to the product pillars:

```text
BUILDCRAFT
SPECTACLE
SHORT DECISIONS
DLICOM IDENTITY
REPLAYABILITY
```

Do not optimize for maximum feature count.

Optimize for the moment when a late-run Dili triggers:

```text
BASIC ATTACK
→ COMBO
→ CRIT
→ DLICLIP
→ BOUNCE
→ VULNERABLE
→ VIRAL EXPLOSION
→ RAGE FULL
→ ULTIMATE
```

and the player thinks:

> “What the hell did I just build?”

That is the target experience.
