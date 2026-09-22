# Implementation and verification — v0.1.0

## Implemented first public milestone

Chapter 1's start → auto battle → choose 1 of 3 → event/rest/elite → Spam King → summary/reward → equipment upgrade → new run loop is functional. There are 70 skill definitions and nine equipment definitions. Chapters 2–4 are visibly unavailable, not empty playable routes.

## Automated evidence

Current gate: 45 unit/integration tests and 3 Chromium end-to-end tests pass. Production build, strict TypeScript, lint and content validation pass; npm audit reports zero vulnerabilities at verification time.

- Unit/integration suite covers formulas, defense, crit, combo caps/momentum/chain explosions, counters, dodge, shields, Rage, Ultimate, duration/refresh, lethal prevention, revive persistence, skill prerequisites, RNG repeatability, hammer/Mark, Encryption retaliation, Silence, boss summons/Flood/enrage, full run/reward idempotency, upgrades, save corruption/storage failure and content validation.
- Chromium UI tests cover fresh profile, loadout, persisted settings, automatic combat, pause, speed, skill draft/reroll, all twelve node screens, summary, chest, upgrades and reload. The full-screen flow accelerates battles through the store boundary; the first-battle test uses actual timing and Phaser.
- Layout overflow checks: 360×800, 390×844, 412×915, 1366×768. These are browser viewport tests, not claims of physical device coverage.
- Production build and strict TypeScript pass; ESLint, Zod content checks and dependency audit run before push.
- Production-preview smoke test verifies the built assets load, Phaser is deferred until battle, actual combat reaches a three-card draft, and no browser errors or HTTP failures occur. Phaser's optional battle chunk is approximately 340 KB gzip; the initial application JS is approximately 116 KB gzip.

## Deterministic balance simulations

Seed family: `simulation-0` through `simulation-1249`. Starting common loadout, no upgrades. Bot prioritizes Double Packet, Packet Boost, Packet Compression, Overclock, Lifeline and Recovery Packet, then rarity. Rest heals below 80% HP, otherwise prepares Shield. It does not attempt optimal archetype-specific play.

| Pool | Runs | Battles | Wins | Win rate |
| --- | ---: | ---: | ---: | ---: |
| Fresh account, level 1 | 1,250 | 10,000 | 953 | 76.24% |
| All families unlocked, level 6 | 1,250 | 10,000 | 650 | 52.00% |

Fresh-account averages: 6.99 turns per battle, 1,329 damage dealt per battle, 159 seconds of combat per run at ×1. By encounter: normal 13 seconds, elite 18 seconds, boss 55 seconds. All simulations reached node 12; defeats occur at the boss with these seeds/heuristics.

The lower unlocked-pool win rate flags a balance/playtest concern: a damage-oriented heuristic is worse at building specialized families from the larger pool. This is measured, not evidence that all six families are equally balanced. Elite fights are slightly shorter than the target. Overall 8–15 minute pacing remains unmet.

Reproduce on PowerShell:

```powershell
$env:SIM_RUNS = '1250'
npm run simulate
$env:SIM_UNLOCKED = '1'
npm run simulate
Remove-Item Env:SIM_RUNS,Env:SIM_UNLOCKED
```

## Remaining release gates

Physical Android/iOS testing, Firefox/Edge and mobile Safari; worst-build FPS/heap profiling; human synergy/pacing playtests; final sprites; expanded content; graphical share card; Vercel deployment and production URL verification; trailer/submission. No final-release or deployment claim is made by this initial push.
