# Implementation and verification — v0.2.0

## Implemented

The complete four-chapter route is playable: The Feed / Spam King, DliClips / Loop Phantom, Dili Rooms / Raid Master, and Core Network / Null.exe. A chapter becomes available after victory in the preceding chapter. Chapters use seeded enemy and event selection, chapter-specific enemy pools, boss actions, event pools, chapter unlocks, and distinct encounter scaling. The account save schema safely defaults older version-1 saves to one unlocked chapter.

The content set now contains 70 skills, 18 equipment items, and 20 events. Equipment chest drops roll by the included rarity categories; duplicate items convert to Bits. Event choices cover rewards, healing, shield, short-run buffs, skill drafts, and optional elite encounters.

Each chapter now has its own low-detail procedural battle backdrop, two subtle accent-colored parallax grid layers, and original synthesized music loop. The parallax textures are generated once per scene and move at separate speeds; they pause with combat. The four bosses use original replaceable vector silhouettes through the centralized asset manifest. These are presentation placeholders; final animation and production art remain open.

Skill drafts and the owned-skill list now use eight original 256px archetype icons, covering every current skill family: Packet, Hammer, Firewall, Moderation, Encryption, Viral, Rage, and Heal. Draft cards enter with a short stagger and the art lifts on hover or keyboard focus; the reduced-motion setting and system preference suppress these motions.

Dili now has dedicated Attack, Hurt and Ultimate pose sprites in addition to Idle. Combat events switch poses and return to Idle on the pause/speed-aware presentation clock; Crit, Dodge and Low HP build on those poses with existing impact effects. Victory and Defeat receive short end-of-battle reactions. The [art and animation matrix](ART_ANIMATION_MATRIX.md) records all nine required states, effect coverage and remaining art work.

Combat hits now include a reusable expanding impact spark; critical hits use a warm flash and a short 3–4 px camera shake, Ban Hammer has a larger magenta slam with a 5–7 px shake, and Viral Explosion uses a wider magenta ring. Boss attacks have a stronger lunge, slower projectile, and restrained camera shake so their impacts read distinctly. DliClip projectiles have a distinct color and ultimates use a stronger wave. Status applications show their remaining turns with status-specific rings, and Burn damage uses an orange impact. Healing and shield grants use green and cyan pulses. Dili sidesteps with a ghost fade on dodge and flashes briefly on damage, gains a pulsing aura below 25% HP, and boss warnings pulse around the boss sprite. Actors have subtle idle breathing, with a stronger boss motion; reduced-motion settings turn these idle/hit motions, warning pulses, low-HP aura and camera shake off. Combat effects reuse Phaser objects instead of creating display objects for every hit. Synthesized dodge, heal, shield, shield-break, Ban Hammer, enemy-death, boss-intro, victory, defeat, reward, and Legendary-drop cues now cover the key combat and run-end moments.

Ban Hammer and Viral Explosion also flash their archetype art directly on impact. One pooled Phaser image presents both effects; reduced-motion mode keeps the image static and only fades it.

## Verification

Boss attacks use chapter-colored impact sparks and projectiles so each boss has a distinct combat identity. DliClip projectiles retain their pink signal color. Each boss also has a distinct synthesized attack cue, generated reproducibly with the existing audio script.

Burn ticks and reflected damage present their impacts without replaying the source's attack sound, lunge, or projectile.

- 52 unit/integration tests and 4 Chromium end-to-end tests pass, including deterministic chapter encounters, complete runs through all four bosses, chapter unlocking, chapter-specific battle and audio assets, save compatibility, shield-break feedback, and Null Pulse damage.
- ESLint, TypeScript, production build, and content validation pass.
- Deterministic balance simulations exercised 500 full runs for each chapter with level-6 unlocks and max-level equipment. The heuristic produced 78.8% wins for The Feed, 38.8% for DliClips, 27.0% for Dili Rooms, and 36.0% for Core Network. Core Network tuning reduced early-route attrition: all but 16 of 500 runs reached Null.exe, and the boss remained the main win gate. This is a stress/balance signal, not a human-playtest estimate; optimal build selection is not modeled.
- A separate 100-seed pacing sample with unlocked equipment measured average combat time per run of 163s (Feed), 180s (DliClips), 157s (Rooms), and 143s (Core). The respective 90th-percentile times were 188s, 210s, 192s, and 166s. About 63–66% of modeled combat time is spacing between queued events. These figures exclude the first-battle delay, route transitions, player decisions, and menus; they cannot establish full run length or justify a timing change without playtesting.
- The 8–15 minute session target, human balance, and actual mobile/browser coverage still require playtesting.

## Remaining production work

Final character/boss animation and production art, a chapter-specific audio and VFX pass, human balance and pacing playtests, physical mobile and cross-browser QA, worst-build performance profiling, release build, and Vercel deployment verification remain open.
