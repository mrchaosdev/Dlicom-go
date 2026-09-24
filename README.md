# Dlicom Attack

Build an overpowered Dili, chain Dlicom-themed skills, and fight through a corrupted social network. A browser auto-battle roguelite built with React, TypeScript and Phaser 3.

**Version 0.2.0 — four playable chapters.** Clear each boss to unlock the next corrupted layer of the network.

![Dlicom Attack home](artifacts/home-desktop.png)

## Play locally

Use Node.js 22 or newer.

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. Choose an unlocked chapter and watch Dili fight automatically. Between fights, choose one of three skills. Reach that chapter's boss at node 12, collect Bits and equipment, upgrade your loadout, and try another build.

- Mouse/touch only; no aiming or manual movement.
- Pause and ×1/×2 during battle.
- Tap a skill/status to inspect it.
- Music, SFX, reduced motion and default speed in Settings.
- Equipment, Bits, account unlocks, records and settings save locally. An active run is in memory; refreshing ends it. A malformed save is backed up where storage permits and defaults recover safely.

## Included in v0.2

- Four complete chapter routes: The Feed / Spam King, DliClips / Loop Phantom, Dili Rooms / Raid Master, and Core Network / Null.exe. Win to unlock the next chapter.
- Each run has 12 nodes, normal battles, elites, events, rest, its chapter boss, victory/defeat, rewards and retry.
- Seeded combat, encounters, skill drafts and chest drops. Seed appears in the result text for reproduction.
- Crit, capped combo, counter, dodge, shields, statuses, lifesteal, Rage/Ultimate, lethal prevention and once-per-run revive.
- All 70 starter skill definitions; prerequisites, four skill rarities, affinity weighting, Rare+ pity, Packet Boost ranks and one free reroll.
- Six build families unlock across account levels 1–6, following the supplied progression order.
- Three equipment slots, 18 equipment items across four rarities, five upgrade levels and a chest on victory.
- Twenty seeded events with choices, run buffs, healing, Bits, skill drafts and optional elite fights.
- Dili reference-based generated sprite, original vector enemy placeholders, procedural Feed City, bounded VFX/text objects, and original synthesized music/SFX.
- Responsive desktop/mobile UI, keyboard focus states, local fonts and local audio.

## Architecture

| Layer | Ownership |
| --- | --- |
| `src/game/combat`, `src/game/run`, `src/game/rng` | Pure TypeScript combat, triggers, seeded RNG, drafts, rewards and run transitions |
| `src/game/phaser` | Presentation events, sprite motion, projectiles, VFX and bounded animation queue |
| `src/app`, `src/stores` | React screens and Zustand orchestration; no duplicate combat formulas |
| `src/content` | Skills, gear, encounters, centralized assets and Zod validation |
| `src/services` | Versioned save boundary and Howler audio |

Combat resolves before animation. Presentation callbacks never determine HP, rewards, death or progression. Trigger guards cap combo, depth and event counts; a 150-turn stalemate ends as a recoverable defeat.

## Verification

```sh
npm run typecheck
npm run lint
npm run validate:content
npm test
npm run build
npx playwright install chromium
npm run test:e2e
npm run simulate
```

CI runs types, lint, validation, unit/integration tests, build and Chromium browser tests. Simulations use a deterministic bot with a simple damage-oriented draft heuristic; they are not human playtests.

See [verification and balance report](docs/IMPLEMENTATION_STATUS.md) for measured results and limitations.

## Deploy

Import `mrchaosdev/Dlicom-go` into Vercel. Root directory: repository root. Build command: `npm run build`. Output directory: `dist`. `vercel.json` is included. No backend, secrets or environment variables are needed. GitHub push alone does not create a Vercel deployment.

## Remaining production work

- Final enemy art, Dili state sprites, expanded SFX and chapter backgrounds. Current vector enemies are replaceable placeholders.
- Human balance/pacing pass: the deterministic later-chapter stress bot wins 27.3% of max-gear Dili Rooms runs and 16.7% of max-gear Core Network runs. It does not model human build choices. The overall 8–15 minute target has **not** been met or verified; the encounter and full-run targets need a deliberate pacing pass.
- Real Android/iOS device testing, Firefox/Edge QA, long-session performance profiling, deployed smoke test, trailer and final submission.
- Share result currently copies text and seed; graphical share-card export remains future work.

## Specification and provenance

Read [AGENTS.md](AGENTS.md), [BOT_READ_FIRST.md](BOT_READ_FIRST.md), then the [documentation index](dlicom-attack-docs/docs/00_README.md). The supplied [master spec](DLICOM_ATTACK_MASTER_SPEC.md) and original documentation are preserved. Reversible defaults and ambiguity resolutions are recorded in [implementation assumptions](docs/ASSUMPTIONS.md).

Artwork/audio sources and the exact image prompt are in [asset credits](docs/ASSET_CREDITS.md). No third-party game art, characters, UI layout, proprietary content or audio were copied. Supplied Dlicom reference art retains its original ownership.

No pets. No wallet connection. No seed phrases. No payments or crypto transactions. No account registration, backend or private-data capture. No analytics or external font requests.
