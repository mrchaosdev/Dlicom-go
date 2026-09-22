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
