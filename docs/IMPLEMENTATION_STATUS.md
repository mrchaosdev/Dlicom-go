# Implementation and verification — v0.2.0

## Implemented

The complete four-chapter route is playable: The Feed / Spam King, DliClips / Loop Phantom, Dili Rooms / Raid Master, and Core Network / Null.exe. A chapter becomes available after victory in the preceding chapter. Chapters use seeded enemy and event selection, chapter-specific enemy pools, boss actions, event pools, chapter unlocks, and distinct encounter scaling. The account save schema safely defaults older version-1 saves to one unlocked chapter.

The content set now contains 70 skills, 18 equipment items, and 20 events. Equipment chest drops roll by the included rarity categories; duplicate items convert to Bits. Event choices cover rewards, healing, shield, short-run buffs, skill drafts, and optional elite encounters.

## Verification

- 51 unit/integration tests pass, including deterministic chapter encounters, complete runs through all four bosses, chapter unlocking, save compatibility, and Null Pulse damage.
- ESLint, TypeScript, production build, and content validation pass.
- Deterministic balance simulations exercised 250–300 full runs for each later chapter with level-6 unlocks and max-level equipment. The heuristic produced 27.3% wins for Dili Rooms and 16.7% for Core Network. This is a stress/balance signal, not a human-playtest estimate; optimal build selection is not modeled.
- Chapter simulation remains a tuning target. At present the later chapters are intentionally demanding, especially Core Network. The 8–15 minute session target and actual mobile/browser coverage still require playtesting.

## Remaining production work

Distinct final art and themed backgrounds for the later chapters, final audio and VFX pass, human balance and pacing playtests, physical mobile and cross-browser QA, worst-build performance profiling, release build, and Vercel deployment verification remain open.
