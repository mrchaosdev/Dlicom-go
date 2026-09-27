import { EQUIPMENT, type Equipment } from '../src/content/equipment';
import { CombatEngine, makeActor } from '../src/game/combat/CombatEngine';
import { BASE_STATS, type Stats } from '../src/game/combat/types';

const SAMPLES = Number(process.env.EQUIPMENT_SAMPLES ?? 500);
const TURNS = Number(process.env.EQUIPMENT_TURNS ?? 24);

function statsFor(weapon: Equipment): Stats {
  const stats = { ...BASE_STATS };
  for (const [key, value] of Object.entries(weapon.stats))
    stats[key as keyof Stats] += value;
  return stats;
}

const weapons = EQUIPMENT.filter(
  (equipment): equipment is Extract<Equipment, { slot: 'weapon' }> => equipment.slot === 'weapon',
);

const report = weapons.map((weapon) => {
  let damage = 0;
  let damageTaken = 0;
  let ultimates = 0;
  let procs = 0;
  for (let sample = 0; sample < SAMPLES; sample++) {
    const engine = new CombatEngine({
      seed: `equipment:${weapon.id}:${sample}`,
      stats: statsFor(weapon),
      weapon: weapon.combat,
      enemies: [makeActor('target', 'Training Bot', {
        maxHp: 1_000_000,
        atk: 15,
        def: 50,
        dodgeRate: 0,
      })],
    });
    for (let turn = 0; turn < TURNS; turn++) {
      const events = engine.step();
      if (weapon.combat.proc)
        procs += events.filter((event) => event.label === weapon.combat.proc?.label).length;
    }
    damage += engine.stats.damageDealt;
    damageTaken += engine.stats.damageTaken;
    ultimates += engine.stats.ultimates;
  }
  return {
    id: weapon.id,
    rarity: weapon.rarity ?? 'common',
    averageDamage: Math.round(damage / SAMPLES),
    averageDamageTaken: Math.round(damageTaken / SAMPLES),
    averageUltimates: Number((ultimates / SAMPLES).toFixed(2)),
    averageWeaponProcs: Number((procs / SAMPLES).toFixed(2)),
  };
});

console.log(JSON.stringify({ samples: SAMPLES, turns: TURNS, weapons: report }, null, 2));
