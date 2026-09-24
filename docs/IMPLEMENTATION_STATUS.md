# Implementation and verification — v0.2.0

## Implemented

The complete four-chapter route is playable: The Feed / Spam King, DliClips / Loop Phantom, Dili Rooms / Raid Master, and Core Network / Null.exe. A chapter becomes available after victory in the preceding chapter. Chapters use seeded enemy and event selection, chapter-specific enemy pools, boss actions, event pools, chapter unlocks, and distinct encounter scaling. The account save schema safely defaults older version-1 saves to one unlocked chapter.

The content set now contains 70 skills, 18 equipment items, and 20 events. Equipment chest drops roll by the included rarity categories; duplicate items convert to Bits. Event choices cover rewards, healing, shield, short-run buffs, skill drafts, and optional elite encounters.

Each chapter now has its own low-detail procedural battle backdrop, two subtle accent-colored parallax grid layers, and original synthesized music loop. The parallax textures are generated once per scene and move at separate speeds; they pause with combat. The four bosses use original replaceable vector silhouettes through the centralized asset manifest. These are presentation placeholders; final animation and production art remain open.

Combat hits now include a reusable expanding impact spark; critical hits use a warm flash and a short 3–4 px camera shake, Ban Hammer has a larger magenta slam with a 5–7 px shake, and Viral Explosion uses a wider magenta ring. Boss attacks have a stronger lunge, slower projectile, and restrained camera shake so their impacts read distinctly. DliClip projectiles have a distinct color and ultimates use a stronger wave. Status applications show their remaining turns with status-specific rings, and Burn damage uses an orange impact. Healing and shield grants use green and cyan pulses. Dili sidesteps with a ghost fade on dodge and flashes briefly on damage, gains a pulsing aura below 25% HP, and boss warnings pulse around the boss sprite. Actors have subtle idle breathing, with a stronger boss motion; reduced-motion settings turn these idle/hit motions, warning pulses, low-HP aura and camera shake off. Combat effects reuse Phaser objects instead of creating display objects for every hit. Synthesized dodge, heal, shield, shield-break, Ban Hammer, enemy-death, boss-intro, victory, defeat, reward, and Legendary-drop cues now cover the key combat and run-end moments.

## Verification

Boss attacks use chapter-colored impact sparks and projectiles so each boss has a distinct combat identity. DliClip projectiles retain their pink signal color. Each boss also has a distinct synthesized attack cue, generated reproducibly with the existing audio script.

- 52 unit/integration tests and 4 Chromium end-to-end tests pass, including deterministic chapter encounters, complete runs through all four bosses, chapter unlocking, chapter-specific battle and audio assets, save compatibility, shield-break feedback, and Null Pulse damage.
- ESLint, TypeScript, production build, and content validation pass.
- Deterministic balance simulations exercised 500 full runs for each chapter with level-6 unlocks and max-level equipment. The heuristic produced 78.8% wins for The Feed, 38.8% for DliClips, 27.0% for Dili Rooms, and 36.0% for Core Network. Core Network tuning reduced early-route attrition: all but 16 of 500 runs reached Null.exe, and the boss remained the main win gate. This is a stress/balance signal, not a human-playtest estimate; optimal build selection is not modeled.
- The 8–15 minute session target, human balance, and actual mobile/browser coverage still require playtesting.

## Remaining production work

Final character/boss animation and production art, a chapter-specific audio and VFX pass, human balance and pacing playtests, physical mobile and cross-browser QA, worst-build performance profiling, release build, and Vercel deployment verification remain open.
