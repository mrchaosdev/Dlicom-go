# Dlicom Attack — Game Jam Submission

> Paste-ready English copy for the Dlicom AI Game Jam. Replace the play-link placeholder after the production deployment is live.

## Submission fields

**Title:** Dlicom Attack

**Version:** v0.2.0

**One-sentence hook:** Build an overpowered Dili, chain absurd Dlicom-themed skills, and purge a corrupted social network in a fast browser auto-battle roguelite.

**Short description:** Dlicom Attack is a browser auto-battle roguelite RPG built for the Dlicom AI Game Jam. Guide Dili through four corrupted social-network chapters, choose one of three skills after battles, forge explosive synergies, defeat elites and bosses, then bring equipment and rewards into the next run. No download, wallet, account, or transaction is required.

**Play the game:** [ADD PRODUCTION VERCEL URL]

**Source code:** https://github.com/mrchaosdev/Dlicom-go

## Full description

The Feed has been overrun by spam, scams, toxic replies, looping clips, and corrupted network entities. Dili is going in to clean it up.

Dlicom Attack is a single-player browser auto-battle roguelite RPG. Dili handles movement, targeting, and attacks automatically, while the player makes the decisions that shape each run: which route to take, which skill to draft, when to recover, and which equipment to invest in between attempts.

Every run moves through a 12-node route containing battles, elite encounters, events, rest stops, and a chapter boss. After combat, choose one of three skills and develop a recognizable build from six families: Packet, Ban Hammer, Firewall, Viral, Moderation, and Encryption. Skills can combine with Crit, Combo, Counter, Dodge, Shield, Rage, statuses, lifesteal, lethal prevention, and revive effects.

The goal is to create chains that escalate far beyond a basic attack:

> Basic Attack → Combo → Crit → DliClip → Bounce → Vulnerable → Viral Explosion → Rage Full → Ultimate

Four chapters introduce distinct enemies, environments, music, and bosses: Spam King in The Feed, Loop Phantom in DliClips, Raid Master in Dili Rooms, and Null.exe in the Core Network.

Outside a run, earned Bits upgrade a persistent collection of weapons, armor, and modules. Dili visibly uses the equipped Packet Blaster, Overdrive Core, Viral Launcher, DliClip Cannon, Encryption Blade, or Moderator Hammer in battle. Armor adds a protective aura, modules orbit the hero, and four complete costumes provide different silhouettes and combat poses. The shop also offers gear and skill chests. Runs cost 5 energy, energy regenerates by 1 every 10 minutes, and the daily check-in grants 5 energy.

Dlicom Attack is designed for quick decisions, readable combat, spectacular skill chains, and a reason to experiment with a different build on the next run. It supports desktop and mobile browsers, mouse and touch input, adjustable battle speed, music and SFX controls, and reduced motion.

## Key features

- Four complete chapters with 12-node runs, unique battle backgrounds, enemies, soundtracks, and bosses.
- 70 skills across six build families, four rarities, prerequisites, and one free reroll per draft.
- Deterministic seeded combat, encounters, drafts, event outcomes, and chest rewards.
- Deep combat interactions: Crit, Combo, Counter, Dodge, Shield, statuses, lifesteal, Rage, Ultimate, lethal prevention, and revive.
- 18 persistent equipment items across weapon, armor, and module slots, with five upgrade levels.
- Weapon-specific hero poses, visible armor and modules, four full costumes, combat VFX, hit reactions, damage numbers, SFX, and music.
- 20 seeded events, elite fights, rest nodes, run summaries, rewards, retry flow, daily check-in, energy regeneration, and two chest types.
- Responsive desktop and mobile layouts with mouse and touch controls.
- Versioned local save with safe recovery from malformed data.
- No account, backend, wallet connection, payment, transaction, analytics, or private-data collection.

## How to play

1. Choose a chapter and equip Dili with a weapon, armor, and module.
2. Start a run. Each attempt costs 5 energy.
3. Watch Dili fight automatically; no manual movement or aiming is required.
4. Pick one of three skills after battle and build around its triggers and synergies.
5. Choose routes through battles, elites, events, and rest nodes.
6. Defeat the chapter boss to unlock progression and earn rewards.
7. Spend Bits on equipment upgrades, open chests, and try a new build.

**Controls**

- Mouse or touch: navigate, choose routes, draft skills, equip items, and use shop actions.
- Keyboard: Tab and Shift+Tab move focus; Enter or Space activates the selected control.
- Battle controls: pause/resume and switch between 1× and 2× speed.

## What makes it different

Dlicom Attack puts the buildcraft decision at the center. Combat resolves automatically, so attention stays on short, meaningful choices and on watching the chosen effects interact. A defensive Firewall build, a counter-focused Moderator, a fast Crit/Combo Packet build, and a Viral chain build can travel through the same chapter and produce very different fights.

Its identity is built around an original Dlicom-themed network world: social-feed corruption becomes enemies, moderation becomes a hammer, encryption becomes a blade, packets become projectiles, and viral spread becomes a combat engine. The result is approachable on a phone but deep enough to reward experimentation across repeated runs.

## Technology

- React 19, TypeScript, Vite, Phaser 3, Zustand, Howler, and Zod.
- Pure TypeScript domain logic keeps combat, seeded RNG, triggers, rewards, and run generation separate from rendering.
- Phaser presents resolved combat events through sprites, projectiles, particles, camera feedback, and animation queues.
- React owns menus, route decisions, equipment, shop, skill drafts, events, settings, and summaries.
- Automated unit and browser coverage verifies deterministic systems, progression, save behavior, assets, mobile layout, and complete chapter flows.

## AI and asset disclosure

AI-assisted image generation was used to create original Dili pose variants, costumes, enemies, bosses, skill icons, equipment visuals, chests, and chapter environments from project-specific prompts and the supplied Dlicom mascot reference. Generated masters were edited and exported into optimized runtime assets for the game.

The music and sound effects are original synthesized audio generated from reproducible source scripts; no third-party samples were used. Lucide icons are used under the ISC license, and the bundled Barlow Condensed, DM Sans, and Space Mono fonts use the SIL Open Font License. No artwork, UI, characters, text, or audio from another game was copied.

Design, implementation, testing, documentation, and asset production were completed with AI assistance under a human-directed game specification.

## Known limitations

- Progress is stored only in the current browser. Clearing site data or switching devices does not carry progression across.
- There is no cloud sync, account system, multiplayer, or online leaderboard.
- Character actions use illustrated state poses with presentation animation rather than full frame-by-frame sprite sheets.
- The production URL still needs a final smoke test on physical Android and iOS devices after deployment.

## Suggested media order

1. **Hero image — Home and chapter selection**

   File: `artifacts/home-desktop.png`

   Caption: *Choose a chapter, prepare Dili, and enter the corrupted network.*

2. **Core gameplay — Mobile battle**

   File: `artifacts/battle-mobile.png`

   Caption: *Automatic combat leaves the player free to focus on build decisions and skill chains.*

3. **Buildcraft — Skill draft**

   File: `artifacts/skill-draft-desktop.png`

   Caption: *Choose one of three skills and turn simple attacks into cascading trigger chains.*

4. **Optional mobile overview**

   File: `artifacts/home-mobile.png`

   Caption: *The full preparation and progression loop is designed for portrait mobile play.*

5. **Gameplay video — 26 seconds with game soundtrack**

   File: `artifacts/gameplay-clip.webm`

   Caption: *A quick look at combat, route progression, skill selection, and the Dlicom network aesthetic.*

## Suggested tags

`Roguelite` `Auto Battler` `RPG` `Browser` `Mobile` `Singleplayer` `Strategy` `Buildcraft` `Cyberpunk` `Cute`

## Short announcement post

**Dlicom Attack is ready to enter the network.** Build an overpowered Dili from 70 skills, chain ridiculous effects, defeat four corrupted bosses, and carry upgraded gear into the next run. It is a responsive browser auto-battle roguelite with no download, wallet, or account required.

Play: [ADD PRODUCTION VERCEL URL]

Source: https://github.com/mrchaosdev/Dlicom-go
