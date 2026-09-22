# QA, Analytics and Testing

## 1. QA priorities

Highest-risk systems:

1. trigger chains
2. save/load
3. skill prerequisites
4. boss phases
5. mobile UI
6. animation/game-state desync
7. infinite combat loops

---

## 2. Unit tests

Must cover:

- damage formula
- DEF scaling
- crit
- combo cap
- counter
- dodge
- shield absorption
- status duration
- rage
- ultimate trigger
- lethal prevention
- revive
- skill prerequisite
- seeded RNG repeatability

---

## 3. Example deterministic test

```ts
it("same seed creates same skill draft", () => {
  const a = generateDraft("seed-123");
  const b = generateDraft("seed-123");

  expect(a).toEqual(b);
});
```

---

## 4. Simulation tests

Create bot simulation.

Run:
10,000 fake battles.

Track:
- win rate
- average turns
- damage
- skill power outliers

This catches broken numbers faster than manual testing.

---

## 5. Playtest checklist

Ask tester:

- Did you understand what happened?
- Did skill choices feel meaningful?
- Could you identify your build?
- Were fights too slow?
- Was text readable?
- Was boss understandable?
- Did you want another run?
- Which skill felt useless?
- Which skill felt broken?

---

## 6. Device matrix

Desktop:
- Chrome
- Edge
- Firefox

Mobile:
- Android Chrome
- iOS Safari if accessible

---

## 7. Performance test

During worst late-run build:

Track:
- FPS
- active sprites
- particles
- event queue length
- JS heap if possible

Target:
stable 60 FPS desktop,
acceptable 45–60 mobile.

---

## 8. Analytics

Optional for jam.

If added, track anonymous gameplay only:

```text
run_started
run_finished
run_failed
skill_selected
boss_started
boss_defeated
chapter_selected
```

Do not collect personal data.

---

## 9. Bug severity

P0:
game cannot start / data loss.

P1:
run cannot progress / boss broken.

P2:
skill wrong / layout broken.

P3:
cosmetic issue.

Fix order:
P0 → P1 → P2 → P3.

---

## 10. Release gate

Do not release final until:

- fresh browser works
- old save works
- mobile controls work
- all bosses can die
- no console spam
- no missing asset
- no infinite loop
- x2 works
- audio respects settings
