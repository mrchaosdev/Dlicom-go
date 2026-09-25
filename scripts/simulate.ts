import { RunSession } from '../src/game/run/RunSession';
import { defaultSave } from '../src/services/save';
import { NODES } from '../src/content/encounters';
import { SKILL_BY_ID } from '../src/content/skills';
import { eventDuration, turnDuration } from '../src/game/phaser/presentation';
import { EQUIPMENT } from '../src/content/equipment';
const runs = Number(process.env.SIM_RUNS ?? 1000);
if (!Number.isInteger(runs) || runs < 1) throw new Error('SIM_RUNS must be a positive integer');
let wins = 0,
  battles = 0,
  turns = 0,
  damage = 0,
  seconds = 0,
  spacingSeconds = 0;
const combatSecondsPerRun: number[] = [];
const bossVictorySeconds: number[] = [];
const bossDefeatSeconds: number[] = [];
const timings: Record<string, { battles: number; seconds: number }> = {};
const reached: Record<number, number> = {};
const defeatsByNode: Record<number, number> = {};
const victoriesByNode: Record<number, number> = {};
for (let i = 0; i < runs; i++) {
  const save = defaultSave();
  if (process.env.SIM_UNLOCKED) {
    save.account.xp = 600;
    save.account.unlockedChapters = 4;
    for (const item of EQUIPMENT) save.account.inventory[item.id] = 5;
    save.account.equipped = {
      weapon: 'weapon_viral_launcher',
      armor: 'armor_core_armor',
      module: 'module_safe_mode',
    };
  }
  const run = new RunSession(`simulation-${i}`, save, process.env.SIM_CHAPTER ?? 'chapter_feed');
  let runCombatSeconds = 0;
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
      let encounterSeconds = 0;
      while (!run.engine!.outcome) {
        const events = run.engine!.step();
        const duration = turnDuration(events) / 1000;
        seconds += duration;
        encounterSeconds += duration;
        runCombatSeconds += duration;
        spacingSeconds += duration - events.reduce((total, event) => total + eventDuration(event), 0) / 1000;
        timings[kind].seconds += duration;
        turns++;
      }
      const battleNode = run.node + 1;
      const battleResults = run.engine!.outcome === 'victory' ? victoriesByNode : defeatsByNode;
      battleResults[battleNode] = (battleResults[battleNode] ?? 0) + 1;
      if (kind === 'boss') {
        const bossTimes = run.engine!.outcome === 'victory' ? bossVictorySeconds : bossDefeatSeconds;
        bossTimes.push(encounterSeconds);
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
  combatSecondsPerRun.push(runCombatSeconds);
  if (run.result === 'victory') wins++;
}
combatSecondsPerRun.sort((a, b) => a - b);
const combatPercentile = (percent: number) =>
  Math.round(combatSecondsPerRun[Math.ceil((percent / 100) * combatSecondsPerRun.length) - 1]);
const percentile = (values: number[], percent: number) => {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return Math.round(sorted[Math.ceil((percent / 100) * sorted.length) - 1]);
};
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
      medianCombatSecondsPerRun: combatPercentile(50),
      p90CombatSecondsPerRun: combatPercentile(90),
      averageTurnSpacingSecondsPerRun: Math.round(spacingSeconds / runs),
      turnSpacingPercent: Math.round((spacingSeconds / seconds) * 100),
      bossVictories: bossVictorySeconds.length,
      bossDefeats: bossDefeatSeconds.length,
      medianBossVictorySeconds: percentile(bossVictorySeconds, 50),
      p90BossVictorySeconds: percentile(bossVictorySeconds, 90),
      medianBossDefeatSeconds: percentile(bossDefeatSeconds, 50),
      averageSecondsByKind: Object.fromEntries(
        Object.entries(timings).map(([kind, value]) => [
          kind,
          Math.round(value.seconds / value.battles),
        ]),
      ),
      nodesReached: reached,
      battleVictoriesByNode: victoriesByNode,
      battleDefeatsByNode: defeatsByNode,
    },
    null,
    2,
  ),
);
