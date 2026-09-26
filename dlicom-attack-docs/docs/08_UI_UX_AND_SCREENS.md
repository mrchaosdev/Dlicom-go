# UI / UX and Screen Specification

## 1. UX principle

The game must be usable with one thumb.

Primary actions:
large tap targets.

Avoid:
tiny desktop-first UI.

---

# 2. Screen list

## Boot / Preload
- logo
- loading bar
- asset preload status

## Title
- Play
- How to play
- Equipment
- Achievements
- Settings

## How to play
- Explain the first-run loop: loadout, route choices, automatic combat, skill drafts, boss and rewards.
- Include mobile-readable steps and a direct action to start or resume a run.

## Chapter Select
- 4 chapter cards
- lock states
- best score
- boss preview

## Loadout
- Dili preview
- Weapon
- Armor
- Module
- stats summary
- Start

## Route Map
- current node
- next choices
- path preview
- run stats

## Battle
Main gameplay.

## Skill Draft
3 cards.

## Event
event art + choices.

## Rest
heal / upgrade / shield.

At Node 10, label the Rest location Signal Bazaar and show the optional 80 run-Bits Rare-or-better draft purchase. Disable this choice when the run cannot afford it.

## Reward
drop reveal.

## Boss Intro
boss name + animation.

## Run Summary
stats + rewards + share.

## Equipment
inventory and upgrade.

Use Loadout, Inventory and Shop tabs. Show owned counts and current levels in Inventory; show price and affordability in Shop. Keep the three-slot loadout visible in its own tab. Short node-arrival transitions may mark route, combat, draft, event and rest changes; they must not add page overflow and must respect reduced-motion settings.

The Loadout area also includes a Skins tab with four Dili previews. Show the selected state clearly, preserve the choice after reload, and explain that changes to an active run's appearance apply next run. The four tabs must fit a 320 CSS-pixel viewport without horizontal scrolling.

The Shop also offers Gear and Skill chests. Show exact Bits prices, the gear chest's base rarity weights, the one-skill queue limit, and a visible reward reveal. The queued skill must be visible from Loadout before starting a run. Chest reveal animation respects reduced motion and must not introduce horizontal overflow on small phones.

## Settings
music
SFX
reduced motion
battle speed default

---

# 3. Battle layout

Portrait:

```text
┌────────────────────┐
│ Node 7     x2  ||  │
│ Boss HP / enemy HP │
│                    │
│      ENEMY         │
│                    │
│      effects       │
│                    │
│       DILI         │
│                    │
│ HP ████████        │
│ Rage █████         │
│                    │
│ active skill icons │
└────────────────────┘
```

Desktop:
center phone-like battle stage with side panels for:
- stats
- skills
- combat log optional

---

# 4. Skill draft card

Each card includes:

- rarity
- icon
- name
- one-line effect
- synergy tags
- NEW / UPGRADE indicator

Example:

```text
EPIC

DLICLIP BOUNCE

DliClip hits 2 additional enemies.

[crit] [packet]
```

Do not use paragraph text.

---

# 5. Feedback

Every attack needs at least:
- movement
- impact
- sound
- damage number

Crit:
larger text.

Ultimate:
screen-level treatment.

Kill:
small burst.

Legendary pickup:
special reveal.

---

# 6. Damage numbers

Normal:
small.

Crit:
1.3× size + `CRIT`.

Heal:
`+120`.

Shield:
`+80 SHIELD`.

Do not spawn unlimited numbers.
Merge rapid multi-hits when necessary.

---

# 7. Status icons

Tap/hover:
show tooltip.

Examples:
- Burn
- Glitch
- Vulnerable
- Silence
- Shield
- Mark

---

# 8. Accessibility

Include:
- reduced motion
- SFX/music volume
- no information encoded only by color
- readable text contrast
- minimum touch targets ~44px
- pause button always visible
