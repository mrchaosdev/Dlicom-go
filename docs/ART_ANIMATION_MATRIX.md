# Art and animation implementation matrix

This tracks the implementation against `dlicom-attack-docs/docs/09_ART_VFX_AUDIO_DIRECTION.md` and its asset prompts. Combat results remain owned by the TypeScript engine; Phaser only presents its events.

## Visual system and asset budget

The visual anchor is the supplied Dili mascot: rounded helmet and speech-bubble face against a navy cyber world. Cyan identifies Dili's data attacks and protection; magenta marks corruption, viral spread and heavier threats; warm orange marks raid pressure and some critical or boss impacts. Retro chat windows, filmstrips and broken data rings connect each chapter to the game's social-network setting. Silhouettes and value contrast matter more than tiny line detail at mobile size.

| Asset class | Runtime size | On-screen role |
| --- | --- | --- |
| Dili poses | Transparent square PNGs; new poses 512 x 512 | 230 logical px wide on the 760 x 510 battle canvas |
| Normal enemies | Transparent 512 x 512 PNGs | 155 logical px wide, including elites |
| Bosses | Transparent 768 x 768 PNGs | 245 logical px wide, larger than Dili |
| Skill archetype icons | Transparent 256 x 256 PNGs | Draft cards, owned-skill list and selected battle effects |
| Battle backgrounds | Four 1024 x 680 PNGs with procedural fallback | One environment per chapter, clear center floor behind fighters, two subtle moving parallax grids |

The battle canvas scales as one unit for desktop and mobile. At a 390 px phone width, the normal enemy silhouette is about 70 px wide and a boss about 110 px. Art is loaded per chapter through the central asset manifest rather than hardcoded URLs. Source and attribution are recorded in [asset credits](ASSET_CREDITS.md).

During battle, the chapter image and HUD stay inside a single viewport on the documented phone sizes and desktop. The build list opens from the battle toolbar, so inspecting skills does not make the page scroll. Phaser centers the canvas horizontally; vertical centering is handled by the page layout to prevent an extra blank margin from pushing the combat HUD off-screen.

## Dili states

| Required state | Runtime asset | Presentation | Status |
| --- | --- | --- | --- |
| Idle | `dili-idle.png` | Subtle breathing tween | Implemented |
| Attack | `dili-attack.png` | Short lunge and packet projectile; pose returns to Idle on the presentation clock | Implemented |
| Crit | Attack pose | 70 ms yellow anticipation ring, warm impact flash, larger damage number and short camera shake | Implemented with shared pose |
| Hurt | `dili-hurt.png` | Brief red tint and hit reaction; returns to Idle | Implemented |
| Dodge | Idle pose | Sidestep and ghost fade | Implemented with shared pose |
| Ultimate | `dili-ultimate.png` | 700 ms network wave and camera feedback; returns to Idle | Implemented |
| Low HP | Idle pose | Pulsing aura below 25% HP | Implemented with shared pose |
| Victory | Idle pose | Mint tint and short bounce after the final combat event | Implemented with shared pose |
| Defeat | Hurt pose | Collapse and fade; the 150-turn stalemate also gets a defeat pose | Implemented with shared pose |

Pose changes use the same pause and speed clock as the combat presentation queue. Reduced-motion mode suppresses positional tweens and camera shake while leaving readable pose and color changes. The three new pose PNGs are transparent 512 × 512 assets; Idle remains the existing supplied-reference-based runtime sprite. They are separate poses, not a frame animation sheet.

Idle has a different source resolution from the other poses. Breathing now animates a relative factor and recalculates the base scale on each texture change, so Attack, Hurt and Ultimate keep their intended on-screen size. This was checked against mobile battle captures.

## Skill art and effects

All eight skill archetypes now have original 256 × 256 transparent icons in the central manifest: Packet, Hammer, Firewall, Moderation, Encryption, Viral, Rage, and Heal. The draft and owned-skill UI share these assets. Draft entry is staggered; keyboard focus and hover lift the art. Both the game setting and system reduced-motion preference suppress those animations.

| Effect family | Current battle presentation |
| --- | --- |
| Packet / DliClip | Cyan projectile; DliClip projectile is magenta |
| Crit | 70 ms yellow source-ring anticipation before the damage cue, Attack pose and stronger hit feedback |
| Ban Hammer | Hammer art slam, magenta impact ring and stronger shake |
| Viral Explosion | Viral art expansion and wide magenta ring |
| Firewall / Shield | Cyan shield pulse and separate shield-break cue |
| Heal | Green pulse and heal sound |
| Status damage | Status-colored impact without replaying attack motion or sound |
| Ultimate | Dili charge pose, network wave, screen feedback and sound |
| Rage full | 150 ms Rage-art burst immediately before Ultimate; ordinary Rage gains stay unobtrusive |
| Dodge | Ghost fade and sidestep |
| Boss warning | Ring and tint around the boss |

Impact objects, skill-art overlay, projectiles and damage numbers are reused instead of created per hit. Crit and Rage cues are generated only in the presentation queue; the combat engine remains the sole authority for damage, Rage and Ultimate. The turn clock includes the extra presentation cue durations so fast chains do not overlap the next turn.

| Cue | Presentation time | Readability rule |
| --- | --- | --- |
| Basic projectile | 140 ms; boss projectile 190 ms | Cyan or boss color, one reused projectile object |
| Basic impact | 130 ms | Small ring, damage number and hit reaction |
| Crit anticipation / impact | 70 ms / 190 ms | Gold source ring before damage, larger number and restrained shake |
| Ban Hammer | 360 ms | Hammer image descends, magenta ring and stronger shake |
| Viral Explosion | 280-300 ms | Viral image expands and impact ring covers a wider area |
| Rage burst / Ultimate | 150 ms / 700-800 ms | Rage icon flashes before Dili's network wave; no long cinematic |
| Boss warning | 600 ms | Source ring, flash and label before the major move |

Normal Rage gain has no floating text because it happens repeatedly; the HUD bar communicates progress. Reduced-motion mode keeps the meaningful pose, color, label and damage number but replaces travel, bounce and shake with short fades. Combat events always resolve before any of these effects, so a slow or skipped tween cannot change the battle result.

## Enemy and boss art

All ten normal enemy kinds and four bosses now have distinct original transparent sprites. Raid Master's summoned Raid Minions share Raid Bot art. Existing enemies have idle breathing, attack lunge, hurt reaction and defeat fade; character-specific attack and hurt poses remain open. The battle scene loads only the enemy art needed for its chapter, plus Spam Bot for Spam King's summons and Raid Bot for elites.

| Enemy | Silhouette and mechanic cue |
| --- | --- |
| Spam Bot | Stacked chat windows and notification dots; frequent basic pressure |
| Scam Link | Twisted glowing chain and warning pointer; Vulnerable threat |
| Bug | Round insect with broken pixel wings; Glitch threat |
| Fake Account | Overlapping profile masks and light limbs; evasive Dodge threat |
| Data Leech | Wide segmented siphon worm; Rage theft |
| Corrupted Clip | Forward-leaning video screen and torn filmstrips; burst damage |
| Toxic Reply | Spiky speech bubble with boxing gloves; counter threat |
| Pop-up | Walking window holding a broad cyan shield; ally protection |
| Raid Bot | Heavy armored unit and alert lights; elite bruiser and Raid Minion art |
| Null Fragment | Dense dark shard with broken blue rings; high defense |

| Boss | Silhouette | Existing telegraph and hit cue |
| --- | --- | --- |
| Spam King | Signal-bar crown over a stack of notification windows | Warning ring, magenta flash, heavy lunge and chapter-specific attack sound |
| Loop Phantom | Hooded specter surrounded by looping filmstrips | Warning ring, violet projectile, rewind-themed art and chapter-specific attack sound |
| Raid Master | Broad armored commander with an orange raid shield | Warning ring, orange projectile, summoned Raid Bot minions and chapter-specific attack sound |
| Null.exe | Void eye within broken blue data rings | Warning ring, violet projectile, NULL PULSE label and chapter-specific attack sound |

## Remaining production checks

1. Add character-specific attack and hurt poses only where the one-sprite tweens fail a mobile readability playtest.
2. Review Dili pose alignment, enemy silhouettes and boss scale on physical Android/iOS devices.
3. Run human pacing, readability and worst-build performance playtests before calling art final.

Automated validation checks that all runtime assets exist. Local verification covers typecheck, lint, unit tests, build and Chromium end-to-end flows; physical mobile and cross-browser art QA remain outstanding.
