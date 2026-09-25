import { spawnSync } from 'node:child_process';

interface SimulationReport {
  runs: number;
  battles: number;
  bossVictories: number;
  medianBossVictorySeconds: number | null;
  winRate: number;
}

const samples = [
  { chapter: 'chapter_feed', minBossSeconds: 45, maxBossSeconds: 60 },
  { chapter: 'chapter_dliclips', minBossSeconds: 60, maxBossSeconds: 90 },
  { chapter: 'chapter_rooms', minBossSeconds: 60, maxBossSeconds: 90 },
  { chapter: 'chapter_core', minBossSeconds: 60, maxBossSeconds: 90 },
];
const runsPerChapter = 2500;
const results = samples.map((sample) => {
  const result = spawnSync(
    process.execPath,
    ['node_modules/tsx/dist/cli.mjs', 'scripts/simulate.ts'],
    {
      encoding: 'utf8',
      env: {
        ...process.env,
        SIM_RUNS: String(runsPerChapter),
        SIM_CHAPTER: sample.chapter,
        SIM_UNLOCKED: '1',
      },
    },
  );
  if (result.error) throw result.error;
  if (result.status !== 0)
    throw new Error(`${sample.chapter} simulation failed:\n${result.stderr}`);

  const report = JSON.parse(result.stdout) as SimulationReport;
  if (report.runs !== runsPerChapter || report.bossVictories === 0)
    throw new Error(`${sample.chapter} did not produce the expected complete sample`);
  if (report.medianBossVictorySeconds === null
    || report.medianBossVictorySeconds < sample.minBossSeconds
    || report.medianBossVictorySeconds > sample.maxBossSeconds)
    throw new Error(
      `${sample.chapter} median boss victory time ${report.medianBossVictorySeconds}s `
      + `is outside ${sample.minBossSeconds}-${sample.maxBossSeconds}s`,
    );

  return {
    chapter: sample.chapter,
    runs: report.runs,
    battles: report.battles,
    winRate: report.winRate,
    bossVictories: report.bossVictories,
    medianBossVictorySeconds: report.medianBossVictorySeconds,
  };
});

console.log(JSON.stringify({
  runs: results.reduce((total, result) => total + result.runs, 0),
  battles: results.reduce((total, result) => total + result.battles, 0),
  chapters: results,
}, null, 2));
