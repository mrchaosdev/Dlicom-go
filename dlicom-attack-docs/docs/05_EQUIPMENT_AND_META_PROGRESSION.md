# Equipment and Meta Progression

## 1. Why equipment exists

Equipment gives:
- long-term progression
- reason to replay
- pre-run strategic choice
- reward outside individual run

It should not require pet complexity.

## Energy and daily check-in

Per the later human direction, starting a run costs **5 Energy**. Energy restores at **1 point every 10 elapsed minutes**. The current reversible defaults are 15 starting Energy and a cap of 20. A daily local-calendar check-in grants 5 more Energy when there is room for the full reward. Remaining Energy carries forward; there is no paid refill.

Energy is deducted once when a run starts. An unfinished run ends on reload and returns its reserved 5 Energy, so browser interruption does not waste an attempt. Completed wins and defeats keep the cost. Version-1 local saves migrate to the version-2 Energy schema.

---

## 2. Equipment slots

Jam target:

- Weapon
- Armor
- Module

Only 3 slots.

This keeps UI manageable.

---

## 3. Weapon examples

### Packet Blaster
+ATK
Passive:
basic attack damage +10%.

### Moderator Hammer
+ATK
Passive:
Ban Hammer triggers every 3 attacks instead of 4.

### Viral Launcher
+ATK
Passive:
Viral explosion damage +20%.

### Encryption Blade
+ATK
Passive:
after Dodge, next attack +30%.

### Overdrive Core
+ATK
Passive:
start battle +20 Rage.

### DliClip Cannon
+ATK
Passive:
critical hit DliClip damage +25%.

---

## 4. Armor examples

### Firewall Shell
+HP
Shield generation +15%.

### Creator Hoodie
+HP
Healing +10%.

### Moderator Vest
+DEF
Debuffed enemies deal -8% damage.

### Zero-Knowledge Cloak
+HP
Dodge +4%.

### Anti-Spam Plating
+DEF
Bot enemies deal -10% damage.

### Core Armor
+HP/+DEF
Below 25% HP gain temporary DR.

---

## 5. Module examples

### Viral Chip
Crit +4%.

### Combo Router
Combo +6%.

### Counter Protocol
Counter +6%.

### Rage Cache
start battle +10 Rage.

### Safe Mode
damage reduction +4%.

### Trust Module
boss damage +8%.

---

## 6. Rarity

Equipment rarity:

- Common
- Rare
- Epic
- Legendary

Rarity controls:
- base stat
- passive strength
- max upgrade level

---

## 7. Upgrade system

Currency:
**Bits**

Upgrade costs:

```text
Level 1 → 2: 100
2 → 3: 180
3 → 4: 300
4 → 5: 500
```

Jam scope:
max equipment level 5.

No complex fusion.

Per the later human direction, the loadout screen also has an Inventory and a gear Shop. Inventory groups owned gear by the three existing slots and allows equipping or upgrading any owned item, including items outside the active loadout. The Shop spends earned account Bits to buy a specific unowned item at level 1 and immediately equips it for the next run. Repeated purchases of an owned item are unavailable. Current reversible rarity prices are Common 150, Rare 350, Epic 750 and Legendary 1400 Bits. This adds no extra currency, slots, backend or payment flow.

The later chest request adds two optional Bits purchases in that Shop. A **Gear chest costs 250 Bits** and reveals one random unowned equipment item. The base rarity weights are Common 55%, Rare 30%, Epic 12%, Legendary 3%; tiers with no unowned items are skipped and the remaining weights are normalized. The chest closes when the full collection is owned. A **Skill chest costs 200 Bits** and reveals one currently unlocked skill with no unmet prerequisites. It is queued at Rank 1 for the next run. Only one skill may be queued; the skill remains queued if that run is interrupted or the page reloads, and is consumed when the run ends. These prices and weights are reversible balance assumptions. Chest draws use seeded RNG, show the result immediately, and remain local-save only.

The later skin request adds a Skins tab beside Loadout, Inventory and Shop. Signal Blue and three complete Dili costumes are available without Bits cost: Night Operative, Solar Vanguard and Glitch Phantom. Each has distinct armor, weapon styling and effects across eight combat poses. Skin choice is cosmetic, stored in versioned local save, and applied to all Dili combat poses at the start of the next run. No skin adds stats or changes skill rules. The stable save IDs remain `neon_rose`, `solar_circuit` and `jade_glitch` for compatibility with existing version-4 saves.

---

## 8. Drop system

Run completion:
guaranteed equipment chest.

Boss:
higher rarity odds.

Example:
- Common 55%
- Rare 30%
- Epic 12%
- Legendary 3%

---

## 9. Account level

Earn XP from:
- completed nodes
- elite kills
- boss kills

Account level unlocks:
- new skill pool
- new equipment
- chapters
- cosmetics

Avoid raw +50% permanent ATK from account level.
Meta power should remain moderate.

---

## 10. Unlock progression

Level 1:
Packet/Firewall skills

Level 2:
Ban Hammer

Level 3:
Crit/DliClip

Level 4:
Moderation

Level 5:
Encryption

Level 6:
Viral

This gradually teaches systems.

---

## 11. Achievements

Examples:

- First Login — finish first battle
- Clean Feed — win a battle without taking damage
- Moderator — apply 20 debuffs in one run
- Viral — trigger 25 explosions in one battle
- No Signal — dodge 5 attacks in one battle
- Hammer Time — deal 5,000 damage with Ban Hammer
- DCO Energy — defeat all four bosses
- Chaos Engineer — trigger 100 combat events in a turn
