# AI Asset Prompt Bible

Use the supplied Dili reference image whenever the image tool supports reference-image generation.

The goal is **consistency**, not random pretty images.

---

# 1. Global style block

Reuse this concept:

> 2D stylized cyber mascot game art, dark navy background, cyan and electric blue primary palette, magenta and yellow accent lights, retro internet popup motifs, playful chaotic social-network aesthetic, crisp silhouette, clean readable shapes, game asset, no text, no watermark.

---

# 2. Dili idle

> Preserve the exact mascot identity and helmet silhouette from the reference. Dili standing in a relaxed combat pose, front three-quarter view, holding a compact glowing data blaster, friendly confident expression, transparent background, centered full body, 2D game sprite.

---

# 3. Dili attack

> Same Dili character, same proportions and costume, dynamic recoil pose firing a cyan data packet projectile, energetic motion, readable silhouette, transparent background, no environment.

---

# 4. Dili hurt

> Same Dili character recoiling backward from an impact, surprised expression, small digital glitch fragments, transparent background.

---

# 5. Dili ultimate

> Same Dili mascot charging a huge circular neon network pulse, cyan energy rings, magenta glitch sparks, powerful heroic pose, transparent background.

---

# 6. Spam Bot

> Small hostile bot made from stacked retro chat windows and repeated “message” symbols without readable words, goofy but dangerous, cyan-magenta cyber palette, transparent background, 2D game enemy sprite.

---

# 7. Scam Link

> Mischievous cyber creature shaped around a suspicious glowing chain-link icon, red warning accents, deceptive smile, retro popup fragments, transparent background.

---

# 8. Bug

> Cute corrupted software bug creature, angular glitch wings, broken pixels, neon cyan and magenta, transparent background.

---

# 9. Spam King boss

> Large boss made from a throne of stacked notification windows and bot parts, crown shaped like signal bars, massive silhouette, humorous cyber villain, dark navy/cyan/magenta palette, transparent background.

---

# 10. Null.exe boss

> Abstract final cyber entity, black void core surrounded by broken blue data rings and magenta corruption, intimidating but readable 2D boss silhouette, transparent background.

---

# 11. Background: Feed City

> Wide 2D game background, futuristic social-feed city made from floating windows, message panels and neon data lanes, dark navy night, cyan lights, magenta accents, clear central battle floor, layered parallax composition, no characters, no text.

---

# 12. Skill icons

General:

> square game skill icon, simple bold symbol, dark navy base, cyan/magenta energy, high contrast, centered, readable at 64 pixels, no text, no border.

Examples:
- Ban Hammer: glowing moderation hammer
- Firewall: hex shield
- DliClip: bouncing play-button data shard
- Viral: branching network explosion
- Encryption: locked signal
- Rage: overclocked core

---

# 13. Consistency rules

Always preserve:
- Dili helmet shape
- body proportions
- cyan/blue identity
- 2D style

Avoid:
- realistic humans
- photorealism
- complex backgrounds on sprites
- random costume redesign
- illegible text
- watermark

---

# 14. Dili costume set

Use the matching generated idle master in `assets/skin-source/` as the costume reference and the original Signal Blue pose as the action reference. Preserve the action reference's pose, expression, framing and proportions while carrying every structural costume detail into the new pose. Require a genuine transparent alpha background with no floor, scenery, text, logo, watermark, border or cast shadow.

Generate all eight poses for each costume:

```text
idle
attack
sword-idle
sword-attack
hammer-idle
hammer-attack
hurt
ultimate
```

## Night Operative

> Same Dili mascot wearing charcoal-black tactical armor with a high collar, short split stealth mantle, segmented forearm and shin guards, belt pouches, magenta helmet rim and sharp magenta signal circuitry. Black-metal weapons share magenta energy cores. Ultimate creates a magenta-black signal burst with sharp digital arcs. Preserve Dili's blue face, round transparent helmet, antenna and cute proportions. Polished 2D game sprite, thick clean outline, readable silhouette, transparent background.

## Solar Vanguard

> Same Dili mascot wearing sculpted white and warm-gold modular command armor, broad angular shoulder guards, orange split cape, sunburst chest badge, gold bracers and boots, white-gold helmet crown and amber energy seams. White-gold weapons share radiant amber cores. Ultimate creates an angular amber-gold solar flare. Preserve Dili's blue face, round transparent helmet, antenna and cute proportions. Polished 2D game sprite, thick clean outline, readable silhouette, transparent background.

## Glitch Phantom

> Same Dili mascot wearing a deep midnight-teal hooded data-cloak with an asymmetric torn pixel hem, floating data shards, faceted jade armor, luminous circuit cracks, one angular shoulder guard and jade headset details. Dark weapons split into jade data effects. Ultimate creates a teal-jade data rupture with pixel shards and broken circuit arcs. Preserve Dili's blue face, round transparent helmet, antenna and cute proportions. Polished 2D game sprite, thick clean outline, readable silhouette, transparent background.

---

# 15. Ranged weapon variants

Use the matching costume idle or attack master as the only image reference. Preserve the costume, character, hands, pose, face, helmet, silhouette and transparent framing. Replace only the firearm. Generate idle and attack for Signal Blue, Night Operative, Solar Vanguard and Glitch Phantom. Costume colors may tune the energy and trim while the weapon structure remains consistent.

- **Overdrive Core:** compact forearm-supported energy cannon, large visible gyroscope reactor centered in the receiver, two stacked capacitor cylinders, short vented barrel, tight reactor rings and concentrated overclock bolt.
- **Viral Launcher:** chunky asymmetric bio-digital launcher, translucent capsule chamber, branching network-node tubes, warning fins, wide hexagonal muzzle and a projectile made of connected viral nodes.
- **DliClip Cannon:** compact cinematic data-projector cannon, triangular play-button muzzle aperture, two clip-frame cartridges, glowing timeline rail, angular broadcast fins and a rectangular video-data projectile with frame echoes.

Always require genuine alpha transparency and exclude scenery, floor, text, letters, logos, watermarks, borders, extra limbs, swords and hammers.

---

# 16. Equipment inventory art

Generate each item as a separate square image using the built-in image generation workflow. Shared prompt:

> Polished 2D browser RPG inventory equipment art for Dlicom Attack, chunky hand-painted shapes, subtle cel shading, crisp readable edges, neon cyber-social-network roguelite style. Exactly one complete item centered in a three-quarter view with generous transparent margin. Dramatic clean neon rim light. Genuinely transparent background. No character, hands, mannequin, pedestal, frame, environment, text, letters, numbers, logo or watermark. The item must remain legible at 160 pixels.

Item subjects and palettes:

- **Packet Blaster:** compact cyan data blaster with a glowing packet chamber and restrained magenta accents.
- **Moderator Hammer:** oversized mechanical moderation hammer with a broad head, magenta impact core and cyan circuit accents.
- **Overdrive Core:** compact hand cannon built around an amber reactor, vented barrel and energy rings.
- **Viral Launcher:** chunky wide-muzzle launcher with a translucent green bio-digital canister and purple accents.
- **Encryption Blade:** one-handed cyan energy sword made from interlocking encrypted segments with a dark tech hilt.
- **DliClip Cannon:** sleek magenta broadcast cannon with pulse rails and a circular media-reel chamber.
- **Firewall Shell:** heavy cyan chest armor with layered shield plates and a glowing hexagonal core.
- **Creator Hoodie:** oversized navy hooded jacket with magenta stream seams and light shoulder armor.
- **Zero-Knowledge Cloak:** angular midnight-violet hooded cloak with translucent encrypted patterns and cyan edges.
- **Moderator Vest:** charcoal tactical vest with orange straps, utility panels and a luminous shield plate.
- **Anti-Spam Plating:** bulky segmented gunmetal armor with green pulse barriers.
- **Core Armor:** prestigious heavy navy armor with gold reactor ribs and broad shoulders.
- **Viral Chip:** hexagonal dark circuit chip with a contained neon-green spreading core.
- **Combo Router:** triangular cyan router with multiple packet ports and two linked energy loops.
- **Counter Protocol:** circular armored processor with opposing amber curved energy shapes.
- **Rage Cache:** reinforced memory cartridge with a blazing red-magenta core and heat vents.
- **Safe Mode:** square blue safety processor with layered shield shutters around a calm luminous core.
- **Trust Module:** rare diamond-shaped navy processor with two interlocking gold energy links.

Export each selected transparent master at 512 × 512 WebP, quality 82 and alpha quality 92. Keep source PNG files outside `public`; runtime files belong in `public/assets/equipment/`.

---

# 17. Skin Chest

> Premium futuristic wardrobe chest for Dlicom Attack, dark navy metal with gold structural trim, opened slightly with a small round Dili-style helmet silhouette and cyan, magenta, gold, and jade costume materials spilling out. Polished 2D game inventory art, chunky hand-painted shapes, subtle cel shading, crisp edges, celebratory multicolor neon rim light. Exactly one chest centered in a front three-quarter view with generous transparent margin. Genuinely transparent background. No full character, hands, environment, pedestal, frame, text, letters, numbers, logo, or watermark. Readable at 160 pixels.

Export only the 512 × 512 runtime asset to `public/assets/chest-skin.webp` at WebP quality 82 and alpha quality 92. Do not copy the heavier PNG master into the repository.
