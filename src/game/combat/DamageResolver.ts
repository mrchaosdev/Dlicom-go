export function damageAmount(
  atk: number,
  multiplier: number,
  defense: number,
  modifier = 1,
  critMultiplier = 1,
): number {
  return Math.max(
    1,
    Math.round(
      ((atk * multiplier * 100) / (100 + Math.max(0, defense))) *
        Math.max(0, modifier) *
        critMultiplier,
    ),
  );
}
export function absorbDamage(hp: number, shield: number, damage: number) {
  const absorbed = Math.min(shield, damage);
  return {
    hp: Math.max(0, hp - (damage - absorbed)),
    shield: shield - absorbed,
    absorbed,
    lostHp: Math.min(hp, damage - absorbed),
  };
}
