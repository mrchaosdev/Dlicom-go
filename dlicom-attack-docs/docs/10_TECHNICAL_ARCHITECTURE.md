# Technical Architecture

## 1. Recommended stack

```text
Vite
TypeScript
React
Phaser 3
Zustand
Howler.js
Zod
Vitest
Playwright
ESLint
Prettier
```

Deploy:
Vercel.

No backend required for jam.

---

## 2. Division of responsibility

### React
- menus
- chapter select
- equipment
- skill draft overlay
- event screens
- summary
- settings

### Phaser
- battle scene
- sprites
- projectiles
- VFX
- camera shake
- animation timeline

### Pure TypeScript domain layer
- combat rules
- skill resolution
- RNG
- damage formulas
- run state

This separation is critical.

Do not put combat formulas inside Phaser sprite classes.

---

## 3. Recommended repository

```text
dlicom-attack/
├─ public/
│  └─ assets/
├─ src/
│  ├─ app/
│  │  ├─ routes/
│  │  ├─ screens/
│  │  └─ components/
│  │
│  ├─ game/
│  │  ├─ phaser/
│  │  │  ├─ scenes/
│  │  │  ├─ objects/
│  │  │  ├─ effects/
│  │  │  └─ adapters/
│  │  │
│  │  ├─ combat/
│  │  │  ├─ CombatEngine.ts
│  │  │  ├─ DamageResolver.ts
│  │  │  ├─ TriggerResolver.ts
│  │  │  ├─ StatusResolver.ts
│  │  │  ├─ TargetResolver.ts
│  │  │  └─ RageResolver.ts
│  │  │
│  │  ├─ run/
│  │  │  ├─ RunGenerator.ts
│  │  │  ├─ EncounterGenerator.ts
│  │  │  └─ RewardResolver.ts
│  │  │
│  │  └─ rng/
│  │     └─ SeededRng.ts
│  │
│  ├─ content/
│  │  ├─ skills/
│  │  ├─ enemies/
│  │  ├─ bosses/
│  │  ├─ equipment/
│  │  ├─ chapters/
│  │  └─ events/
│  │
│  ├─ stores/
│  │  ├─ accountStore.ts
│  │  ├─ runStore.ts
│  │  └─ settingsStore.ts
│  │
│  ├─ schemas/
│  ├─ services/
│  │  ├─ save/
│  │  └─ audio/
│  ├─ utils/
│  └─ main.tsx
│
├─ tests/
├─ docs/
└─ package.json
```

---

## 4. State ownership

Account state:
- equipment
- Bits
- unlocks
- achievements
- settings

Run state:
- current HP
- current node
- skills
- temporary buffs
- run currency
- seed

Combat state:
temporary; created per encounter.

---

## 5. Save system

Use localStorage.

Version it.

Example:

```ts
type SaveFile = {
  version: 1;
  account: AccountState;
  settings: SettingsState;
};
```

Always add migration function.

```ts
migrateSave(raw)
```

Never assume old saves match current structure.

---

## 6. RNG

Use seeded RNG.

Why:
- reproducible bugs
- deterministic tests
- shareable seeds later

Example:
`mulberry32` or similar small PRNG.

Do not use `Math.random()` throughout the domain layer.

---

## 7. Content-driven design

Skills/enemies/equipment should be data.

Do not hardcode every item in scene code.

Example:

```ts
export const packetBoost: SkillDefinition = {
  id: "packet_boost",
  rarity: "common",
  tags: ["packet", "basic"],
  effects: [
    {
      type: "MODIFIER",
      stat: "basicDamage",
      operation: "ADD_PERCENT",
      value: 0.20
    }
  ]
};
```

---

## 8. Combat engine API

Suggested:

```ts
const engine = new CombatEngine({
  seed,
  player,
  enemies,
  skills
});

const result = engine.step();
```

`step()` returns presentation events.

Phaser consumes events.

---

## 9. Event bus

Use typed events.

```ts
type CombatEvent =
  | DamageEvent
  | HealEvent
  | StatusEvent
  | ProjectileEvent
  | DeathEvent
  | UltimateEvent;
```

Presentation must not mutate combat state.

---

## 10. Performance

Target:
60 FPS.

Rules:
- pool projectiles
- pool damage text
- cap particles
- preload chapter assets
- compress textures
- use texture atlases after MVP if needed

---

## 11. Mobile

Test:
- 360×800
- 390×844
- 412×915

Landscape desktop:
1366×768
1920×1080.

---

## 12. Build commands

Recommended:

```bash
npm run dev
npm run build
npm run test
npm run test:e2e
npm run lint
npm run typecheck
```

CI should fail on:
- TypeScript errors
- unit test failure
- lint errors

---

## 13. No backend architecture

For jam:

```text
Browser
├─ game
├─ local save
└─ static assets

Vercel CDN
```

Enough.

If leaderboard is added:
Supabase can be a later module.
