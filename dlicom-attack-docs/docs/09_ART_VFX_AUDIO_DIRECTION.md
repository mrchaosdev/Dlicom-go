# Art, VFX and Audio Direction

## Shop chest art

The equipment and skill chests have original transparent cyber-fantasy illustrations in `assets/chest-source/`, with compressed runtime WebP assets in `public/assets/`. Equipment uses navy metal with cyan and magenta circuitry; the skill chest uses a violet translucent core. The Shop shows these as large objects, then reveals the chest beside the actual gear icon or skill art. The reward reveal is decorative and respects reduced motion; text remains the source of reward information.

## Dili cosmetic skins

Dili has four selectable costumes: the original Signal Blue, Night Operative, Solar Vanguard and Glitch Phantom. These are complete outfit designs rather than color transforms. Every costume includes ranged idle/attack, sword idle/attack, hammer idle/attack, hurt and ultimate. The generated transparent PNG masters live in `assets/skin-source/`; 512 x 512 transparent runtime WebP files live in `public/assets/`. Skins alter only presentation; combat rules and stats are unchanged. The selected skin is saved locally and captured when a run starts, so changing it while a run is active affects the next run.

- **Night Operative** uses charcoal tactical armor, a high collar, split stealth mantle, segmented guards, belt pouches and magenta signal circuitry. Its gun, sword, hammer and ultimate share black-metal construction with magenta energy.
- **Solar Vanguard** uses sculpted white-gold command armor, broad shoulder guards, an orange split cape and a sun-core badge. Its weapons and ultimate use radiant amber energy.
- **Glitch Phantom** uses a midnight-teal hooded data-cloak, asymmetric pixel-torn hem, faceted jade armor, circuit cracks and floating data shards. Its weapons and ultimate break into jade data effects.

Preserve Dili's blue face, speech-bubble head, round transparent helmet, antenna and friendly proportions across all costumes. Keep a costume's silhouette, materials, weapon design and energy language consistent through its complete eight-pose set. Runtime assets are encoded as transparent WebP at quality 86.

## Ranged weapon identity

Ranged weapons must be identifiable from the battle sprite, not only from UI text. Packet Blaster keeps the costume's base gun. The other three weapons have idle/attack masters for all four costumes in `assets/weapon-source/`, with compressed 512 x 512 runtime WebP files in `public/assets/`.

- **Overdrive Core:** visible gyroscope reactor, stacked capacitors, short vented barrel and tight reactor-ring discharge.
- **Viral Launcher:** asymmetric capsule chamber, branching node tubes, warning fins, hexagonal muzzle and connected-node payload.
- **DliClip Cannon:** triangular play aperture, clip-frame cartridges, timeline rail, broadcast fins and video-frame projectile echoes.

The exact equipped weapon ID selects the art. Costume colors may affect trim and energy, but the weapon's silhouette and core motif must remain recognizable. Sword and hammer retain their dedicated costume pose sets. Hurt and ultimate presentation must preserve the equipped weapon: Packet Blaster can use its dedicated reaction/ultimate art, while other weapons keep their own idle/attack sprite under the reaction motion and VFX.

## Armor and module presence

Armor and modules remain compatible with every costume through presentation overlays rather than repainting the costume sprite. The equipped armor creates a color-coded double protective aura behind Dili. The equipped module appears as a small orbiting core with its own color and glyph. Their full names appear along the arena edge and the home hero tags always show the actual equipped items. These effects follow Dili's combat movement, respect reduced-motion settings and are captured with the run loadout.

## 1. Art identity

Use the provided Dili mascot reference as anchor.

Visual keywords:

- neon cyan
- navy/black
- magenta accents
- retro popup windows
- cyber social network
- cute mascot
- corrupted data
- glitch
- arcade impact

Avoid generic fantasy swords/castles.

---

## 2. Dili animation strategy

No hand-drawn frame animation required.

Use:
- AI-generated state sprites
- tween animation
- squash/stretch
- screen shake
- particles
- overlays

Required Dili states:

1. Idle
2. Attack
3. Crit
4. Hurt
5. Dodge
6. Ultimate
7. Low HP
8. Victory
9. Defeat

Each can be one image plus code motion.

---

## 3. Enemy animation strategy

For each enemy:

- idle
- attack
- hurt
- defeat

Can be:
single PNG + transform animations.

---

## 4. VFX library

Need reusable effects:

- packet projectile
- impact spark
- crit flash
- shield
- shield break
- fire/glitch DoT
- ban hammer slam
- DliClip projectile
- viral explosion
- rage burst
- ultimate wave
- heal
- dodge ghost
- boss warning

---

## 5. Effect timing

Basic projectile:
150–250 ms.

Impact:
80–150 ms.

Crit anticipation:
50–100 ms.

Ban Hammer:
300–500 ms.

Ultimate:
700–1200 ms.

Avoid long blocking cinematics.

---

## 6. Screen shake

Use sparingly.

Normal:
0–2 px.

Crit:
3–4 px.

Hammer:
5–7 px.

Boss ultimate:
8–10 px.

Reduced-motion mode:
disable shake.

---

## 7. Backgrounds

Chapter 1:
Feed City.

Chapter 2:
DliClip Stream.

Chapter 3:
Dili Rooms.

Chapter 4:
Core Network.

Backgrounds should be:
- layered for parallax
- low detail behind character
- strong silhouette readability

---

## 8. UI style

Blend:
retro OS popup + modern game card.

Use:
- square/rounded hybrid panels
- pixel-style icons optionally
- bright rarity border
- clear typography

Do not make it look like enterprise SaaS.

---

## 9. Audio

Music:
1 loop per chapter.

SFX:
- tap
- skill select
- attack
- crit
- hammer
- shield
- break
- dodge
- ultimate
- enemy death
- boss intro
- victory
- defeat
- reward
- legendary pickup

Audio is essential for game feel.

---

## 10. Music implementation

Web audio restrictions:
start music after user interaction.

Cache assets.

Use compressed:
`.ogg` preferred, `.mp3` fallback if needed.

---

## 11. Asset resolution

Dili:
1024×1024 source, downscale runtime.

Enemies:
512–1024.

Icons:
256 source.

Background:
1920×1080 source.

UI:
SVG where possible.

Optimize before deploy.
