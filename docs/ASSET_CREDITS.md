# Asset provenance

- `dlicom-attack-docs/assets/dili-mascot-reference.png`: supplied Dlicom mascot reference poster, preserved unchanged.
- `public/assets/dili-idle.png`: generated using the built-in image-generation tool from the supplied reference; used in menu and battle with presentation tweens. It is one state sprite, not a completed animation sheet.
- `public/assets/dili-attack.png`, `dili-hurt.png`, `dili-ultimate.png`: original pose variants generated with the built-in image-generation tool using the existing Dili runtime sprite as the identity reference, then resized to transparent 512px PNGs. They preserve the helmet, face, suit, cape and blaster design.
- `public/assets/skill-packet.png`, `skill-hammer.png`, `skill-firewall.png`, `skill-viral.png`, `skill-rage.png`: original skill-archetype icons generated with the built-in image-generation tool from the supplied prompt direction, then resized to 256px PNG for browser use. The Ban Hammer image served as a style reference for the other four. They contain no copied game artwork.
- `public/assets/skill-moderation.png`, `skill-encryption.png`, `skill-heal.png`: original matching archetype icons generated with the built-in image-generation tool, then resized to 256px PNG for browser use.
- `public/assets/spam-bot.png`, `scam-link.png`, `bug.png`, `raid-bot.png`: original enemy sprites generated with the built-in image-generation tool from the design prompts, then resized to transparent 512px PNGs. Spam Bot, Scam Link, Bug and Raid Bot have distinct silhouettes in combat.
- `public/assets/spam-bot.svg`, `spam-king.svg`: original code-authored vector placeholders. The bot SVG remains a fallback for enemy kinds awaiting final artwork. The four boss SVGs are distinct placeholders.
- Feed City: original procedural Phaser graphics; menu chapter illustrations use CSS shapes.
- `public/assets/attack.wav`, `crit.wav`, `ultimate.wav`, `select.wav`, `dodge.wav`, `heal.wav`, `shield.wav`, `shield-break.wav`, `death.wav`, `hammer.wav`, `boss-intro.wav`, `victory.wav`, `defeat.wav`, `reward.wav`, `legendary.wav` and four chapter loops (`feed-loop.wav`, `dliclips-loop.wav`, `rooms-loop.wav`, `core-loop.wav`): original synthesized audio from `scripts/audio.mjs`. Run `node scripts/audio.mjs` to reproduce. No samples or third-party music used.
- Icons: Lucide, ISC license, installed as `lucide-react`.
- Local fonts: Barlow Condensed, DM Sans and Space Mono, SIL Open Font License, bundled through their `@fontsource` packages. See package license files. No remote font calls.

## Exact image-generation prompt

Use case: stylized-concept. Asset type: transparent full-body 2D browser game sprite. Reference image: the supplied Dlicom mascot poster, identity reference only. Create Dili in a relaxed combat pose facing right, holding a compact cyan data blaster. Preserve the distinctive large round glass space helmet, blue speech-bubble face with expressive dark happy eyes, small blue astronaut body, cute proportions. Crisp hand-illustrated cyber mascot aesthetic, navy/cobalt/cyan, tiny magenta accents. Entire character and weapon visible with generous transparent margin, centered. Actual transparent background with alpha. No poster, no text, no chair, no computer, no scenery, no watermark. One character only.

Mode: built-in image generation, reference-image input. Final workspace asset: `public/assets/dili-idle.png`. The reference poster is identity guidance, not a runtime sprite.
