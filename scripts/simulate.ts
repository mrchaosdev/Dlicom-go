import { RunSession } from '../src/game/run/RunSession';
import { defaultSave } from '../src/services/save';
import { NODES } from '../src/content/encounters';
import { SKILL_BY_ID } from '../src/content/skills';
import { turnDuration } from '../src/game/phaser/presentation';
const runs = Number(process.env.SIM_RUNS ?? 1000);
let wins = 0,
  battles = 0,
  turns = 0,
  damage = 0,
  seconds = 0;
const timings: Record<string, { battles: number; seconds: number }> = {};
const reached: Record<number, number> = {};
for (let i = 0; i < runs; i++) {
  const save = defaultSave();
  if (process.env.SIM_UNLOCKED) save.account.xp = 600;
  const run = new RunSession(`simulation-${i}`, save);
  let guard = 0;
  while (!run.result && guard++ < 100) {
    if (run.phase === 'route') {
      reached[run.node + 1] = (reached[run.node + 1] ?? 0) + 1;
      run.enterNode(i % 3);
    } else if (run.phase === 'battle') {
      battles++;
      const kind = NODES[run.node];
      timings[kind] ??= { battles: 0, seconds: 0 };
      timings[kind].battles++;
      while (!run.engine!.outcome) {
        const duration = turnDuration(run.engine!.step()) / 1000;
        seconds += duration;
        timings[kind].seconds += duration;
        turns++;
      }
      damage += run.engine!.stats.damageDealt;
      run.finishBattle();
    } else if (run.phase === 'draft') {
      const score = (id: string) =>
        [
          'double_packet',
          'packet_boost',
          'packet_compression',
          'overclock',
          'lifeline',
          'recovery_packet',
        ].includes(id)
          ? 10
          : { common: 1, rare: 2, epic: 3, legendary: 4 }[SKILL_BY_ID[id].rarity];
      run.selectSkill([...run.draft].sort((a, b) => score(b) - score(a))[0]);
    } else if (run.phase === 'rest')
      run.rest(run.hp < run.baseStats.maxHp * 0.8 ? 'heal' : 'shield');
    else if (run.phase === 'event') run.event(run.eventId === 0 ? 1 : run.eventId === 1 ? 1 : 0);
  }
  if (!run.result) throw new Error(`Run stuck at ${run.node} ${NODES[run.node]}`);
  if (run.result === 'victory') wins++;
}
console.log(
  JSON.stringify(
    {
      runs,
      battles,
      wins,
      winRate: wins / runs,
      averageTurnsPerBattle: turns / battles,
      averageDamagePerBattle: Math.round(damage / battles),
      averageCombatSecondsPerRun: Math.round(seconds / runs),
      averageSecondsByKind: Object.fromEntries(
        Object.entries(timings).map(([kind, value]) => [
          kind,
          Math.round(value.seconds / value.battles),
        ]),
      ),
      nodesReached: reached,
    },
    null,
    2,
  ),
);
