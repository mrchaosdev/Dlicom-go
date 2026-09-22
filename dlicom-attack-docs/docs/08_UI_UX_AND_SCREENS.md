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
- Equipment
- Achievements
- Settings

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

## Reward
drop reveal.

## Boss Intro
boss name + animation.

## Run Summary
stats + rewards + share.

## Equipment
inventory and upgrade.

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
