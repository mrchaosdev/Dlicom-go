# Art and animation implementation matrix

This tracks the implementation against `dlicom-attack-docs/docs/09_ART_VFX_AUDIO_DIRECTION.md` and its asset prompts. Combat results remain owned by the TypeScript engine; Phaser only presents its events.

## Dili states

| Required state | Runtime asset | Presentation | Status |
| --- | --- | --- | --- |
| Idle | `dili-idle.png` | Subtle breathing tween | Implemented |
| Attack | `dili-attack.png` | Short lunge and packet projectile; pose returns to Idle on the presentation clock | Implemented |
| Crit | Attack pose | Warm impact flash, larger damage number, short camera shake | Implemented with shared pose |
| Hurt | `dili-hurt.png` | Brief red tint and hit reaction; returns to Idle | Implemented |
| Dodge | Idle pose | Sidestep and ghost fade | Implemented with shared pose |
| Ultimate | `dili-ultimate.png` | 700 ms network wave and camera feedback; returns to Idle | Implemented |
| Low HP | Idle pose | Pulsing aura below 25% HP | Implemented with shared pose |
| Victory | Idle pose | Mint tint and short bounce after the final combat event | Implemented with shared pose |
| Defeat | Hurt pose | Collapse and fade; the 150-turn stalemate also gets a defeat pose | Implemented with shared pose |

Pose changes use the same pause and speed clock as the combat presentation queue. Reduced-motion mode suppresses positional tweens and camera shake while leaving readable pose and color changes. The three new pose PNGs are transparent 512 × 512 assets; Idle remains the existing supplied-reference-based runtime sprite. They are separate poses, not a frame animation sheet.

## Skill art and effects

All eight skill archetypes now have original 256 × 256 transparent icons in the central manifest: Packet, Hammer, Firewall, Moderation, Encryption, Viral, Rage, and Heal. The draft and owned-skill UI share these assets. Draft entry is staggered; keyboard focus and hover lift the art. Both the game setting and system reduced-motion preference suppress those animations.

| Effect family | Current battle presentation |
| --- | --- |
| Packet / DliClip | Cyan projectile; DliClip projectile is magenta |
| Ban Hammer | Hammer art slam, magenta impact ring and stronger shake |
| Viral Explosion | Viral art expansion and wide magenta ring |
| Firewall / Shield | Cyan shield pulse and separate shield-break cue |
| Heal | Green pulse and heal sound |
| Status damage | Status-colored impact without replaying attack motion or sound |
| Ultimate | Dili charge pose, network wave, screen feedback and sound |
| Dodge | Ghost fade and sidestep |
| Boss warning | Ring and tint around the boss |

Impact objects, skill-art overlay, projectiles and damage numbers are reused instead of created per hit. The current Rage gain event has no dedicated burst, and crit has impact feedback but no separate anticipation pose; these are polish gaps.

## Enemy and boss art

Spam Bot, Scam Link, Bug and Raid Bot have distinct original transparent sprites. The other six normal enemy kinds still use the shared vector fallback. The four bosses have distinct original vector silhouettes, but they remain replaceable placeholders. Existing enemies have idle breathing, attack lunge, hurt reaction and defeat fade; final character-specific poses and production art are still open. The battle scene loads only the enemy art needed for its chapter, plus Spam Bot for Spam King's summons and Raid Bot for elites.

## Remaining production checks

1. Create distinct art for the six remaining normal enemies and finalize boss art/attack readability.
2. Add Rage burst and crit anticipation without extending combat resolution time.
3. Review Dili pose alignment and silhouette size on physical Android/iOS devices.
4. Run human pacing, readability and worst-build performance playtests before calling art final.

Automated validation checks that all runtime assets exist. Local verification covers typecheck, lint, unit tests, build and Chromium end-to-end flows; physical mobile and cross-browser art QA remain outstanding.
