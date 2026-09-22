# v0.1 implementation assumptions

Source order follows AGENTS.md. Chapter 1 is the initial public milestone in `13_GAME_JAM_ROADMAP.md`; unavailable chapters are explicitly labeled as later builds. No specification files were rewritten to pretend missing final content is complete.

## Reversible numeric defaults

- Base hero and formulas are the supplied values: 1000 HP, 100 ATK, 50 DEF, 5% crit, 150% crit damage, 3% dodge, 100 Rage, 180% ATK ultimate.
- Chapter 1 base enemy HP/ATK/DEF: Spam Bot 400/24/12, Scam Link 360/26/16, Bug 240/32/8, Raid Bot 650/40/28, Spam King 1800/30/35. The documented node multipliers apply. Boss summons: 130 HP, 26 ATK, 8 DEF. Maximum three living enemies.
- Spam Flood multiplier is 1.6. Below 30% HP the King adds a 60% basic hit. Summoned bots start acting next turn. These attack strengths were unspecified.
- Glitch reduces outgoing damage by 10%; Slow Mode adds 15%. Scam Link Vulnerable is 15%. Burn uses the specified source-ATK 20% per stack where applied; cap five stacks, refresh duration. Silence blocks special abilities, not basic attacks. Slow skips even turns. Corrupted is stored for future content; no current skill invents a Corrupted consumer.
- Rest Shield: 25% max HP for next battle. Rest always also drafts, matching nodes 5 and 10's documented skill cadence.
- Infinite Scroll event costs/heals 15% max HP. Encryption Key gives +4% run Dodge or 30 Bits. Suspicious Plugin uses documented 20% HP cost / Epic+ / Rare+ alternatives, or 20 Bits. Event HP costs cannot kill Dili.
- Account XP: battle 10, elite 30, boss 80, non-combat node 10; 120 XP per account level, capped at six. Levels unlock the specified families; they give no raw stat power.
- All v0.1 gear is Common. Three starting items, six chest unlocks. Gear rarity rolls are deferred. Weapon/armor base stats gain 20% per upgrade; module upgrades add 3 DEF per level, with passive values fixed. Costs use the exact 100/180/300/500 table. Duplicate chest items convert to 50 Bits. Only winning a run grants a chest.
- Upgradeable skills: Packet Boost only, using the supplied 20/35/50% values. Other rule-changing skills remain one-time.
- Ultimate bonus packets: three at 45% ATK (coefficient unspecified). Repost repeats once at 40% explosion damage; no extra random repeat chance is invented.
- Network Effect counts damaging skill activations, not each AoE target. Its own generated explosion does not increment its activation count. DliClip bounces to up to two distinct additional living enemies. Status and reflected damage cannot counter.
- Base attacks and counters can crit. Secondary proc damage does not itself roll crit, avoiding invented proc feedback. All basic attacks, including counter/extra basic attacks, count toward periodic basic triggers and generate Rage.
- Second Chance is once per run, as the narrow conservative interpretation of "once"; Never Log Off is explicitly once per run. Consumed flags survive encounter transitions. Emergency Patch is once per battle.
- Default combo cap means three **extra** basic attacks, increased to five by Endless Feed. Chain Reaction triggers once at the third attack of the current chain. Overflow replaces the fifth basic's single target with all enemies; it does not duplicate damage on the primary target.
- Damage first computes the pending shield/HP result to determine whether lethal prevention applies; dodge is checked before committing direct damage. Shield still absorbs before HP. This reconciles the trigger priority list with the explicit "dodge completely avoids direct attack damage" rule.
- Status durations tick at turn end, including the application turn. Boss Rage checks execute after the current turn's chains and status ticks, matching the micro-loop order; no animation callback can block them.
- 150-turn failsafe ends a stalled battle as a defeat. A chain limit only skips remaining effects, warns once that turn, and lets the run continue.
- At ×1, the minimum turn presentation is 2.8 seconds; event-dense turns can take longer. Warning anticipation is 600 ms; Ultimate 800 ms. ×2 halves time only. Leaving the tab automatically pauses combat.

## Intentional first-milestone limits

Active runs are in memory; only account and settings are saved as specified. Refreshing ends the run, disclosed in Settings. A future run-resume save needs a separate versioned schema including RNG state.

Chapter 1 uses fixed GDD node types, with three seeded encounter alternatives at later normal nodes. It does not invent a new branching node topology. Event pools, final equipment rarity/drop tables and later chapters remain production work.

The combat timing targets imply about three minutes of combat for this chapter. Adding short decisions still falls below the overall 8–15 minute target. We keep both requirements visible instead of padding combat with blocking waits; resolve through human playtesting before final release.
