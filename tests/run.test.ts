import { describe, expect, it, vi } from 'vitest';
import { defaultSave, loadSave, migrateSave, SAVE_KEY, writeSave } from '../src/services/save';
import { equip, RunSession, upgrade } from '../src/game/run/RunSession';
import { NODES } from '../src/content/encounters';
import { CHAPTERS } from '../src/content/chapters';
const winRun = (chapterId = 'chapter_feed') => {
  const run = new RunSession('integration', defaultSave(), chapterId);
  run.baseStats.atk = 10000;
  for (let step = 0; step < 100 && !run.result; step++) {
    if (run.phase === 'route') run.enterNode();
    else if (run.phase === 'battle') {
      while (!run.engine!.outcome) run.engine!.step();
      run.finishBattle();
    } else if (run.phase === 'draft') run.selectSkill(run.draft[0]);
    else if (run.phase === 'rest') run.rest('heal');
    else run.event(1);
  }
  return run;
};
describe('run progression', () => {
  it('plays all twelve nodes through boss, reward, upgrade and another run', () => {
    const run = winRun();
    expect(run.result).toBe('victory');
    expect(run.cleared).toBe(12);
    expect(run.elites).toBe(3);
    expect(run.rewardGear).toBeTruthy();
    const save = run.settle(defaultSave());
    expect(save.account.wins).toBe(1);
    expect(save.account.bits).toBeGreaterThanOrEqual(480);
    expect(save.account.achievements).toContain('first_login');
    const upgraded = upgrade(save, 'weapon');
    expect(upgraded.account.bits).toBe(save.account.bits - 100);
    expect(upgraded.account.inventory.weapon_packet_blaster).toBe(2);
    expect(new RunSession('next', upgraded).baseStats.atk).toBeGreaterThan(
      new RunSession('next', defaultSave()).baseStats.atk,
    );
  });
  it.each(CHAPTERS.map((chapter) => [chapter.id, Math.min(4, chapter.order + 1)] as const))(
    'completes %s and unlocks the next chapter',
    (chapterId, nextChapter) => {
      const run = winRun(chapterId);
      expect(run.result).toBe('victory');
      expect(run.chapter.id).toBe(chapterId);
      expect(run.settle(defaultSave()).account.unlockedChapters).toBe(nextChapter);
    },
  );
  it('never pays run rewards twice', () => {
    const run = winRun(),
      paid = run.settle(defaultSave());
    expect(run.settle(paid)).toEqual(paid);
  });
  it('blocks invalid draft picks, duplicate actions and repeated free rerolls', () => {
    const run = new RunSession('phase-guards', defaultSave());
    run.selectSkill('never_log_off');
    expect(run.skills).toEqual({});
    run.enterNode();
    const e = run.engine;
    run.enterNode();
    expect(run.engine).toBe(e);
    while (!e!.outcome) e!.step();
    run.finishBattle();
    run.finishBattle();
    expect(run.bits).toBe(20);
    run.reroll();
    run.reroll();
    expect(run.rerolls).toBe(0);
  });
  it('supports a terminal defeat with partial rewards', () => {
    const run = new RunSession('dead', defaultSave());
    run.enterNode();
    run.engine!.hero.hp = 1;
    run.engine!.hero.stats.dodgeRate = 0;
    run.engine!.enemies[0].stats.atk = 10000;
    run.engine!.step();
    run.finishBattle();
    expect(run.result).toBe('defeat');
    expect(run.settle(defaultSave()).account.runs).toBe(1);
  });
  it('does not equip unavailable items or buy unaffordable upgrades', () => {
    const save = defaultSave();
    expect(equip(save, 'weapon_moderator_hammer')).toEqual(save);
    expect(upgrade(save, 'weapon')).toEqual(save);
  });
  it('captures the equipped attack style for the entire run', () => {
    const save = defaultSave();
    save.account.inventory.weapon_encryption_blade = 1;
    save.account.equipped.weapon = 'weapon_encryption_blade';
    const run = new RunSession('blade-style', save);
    expect(run.weaponStyle).toBe('blade');
    save.account.inventory.weapon_moderator_hammer = 1;
    save.account.equipped.weapon = 'weapon_moderator_hammer';
    expect(run.weaponStyle).toBe('blade');
    expect(new RunSession('hammer-style', save).weaponStyle).toBe('hammer');
  });
  it('route definition matches the GDD', () =>
    expect(NODES).toEqual([
      'battle',
      'battle',
      'event',
      'elite',
      'rest',
      'battle',
      'event',
      'elite',
      'battle',
      'rest',
      'elite',
      'boss',
    ]));
});
describe('save compatibility and recovery', () => {
  it('roundtrips version 2 and migrates version 1 without losing progress', () => {
    const now = 1_700_000_000_000;
    const current = defaultSave(now);
    expect(migrateSave(JSON.parse(JSON.stringify(current)), now)).toEqual(current);
    const legacy = JSON.parse(JSON.stringify(current));
    legacy.version = 1;
    legacy.account.bits = 750;
    delete legacy.account.energy;
    delete legacy.account.energyUpdatedAt;
    delete legacy.account.activeRunEnergy;
    delete legacy.account.dailyClaimedOn;
    const migrated = migrateSave(legacy, now);
    expect(migrated.version).toBe(2);
    expect(migrated.account.bits).toBe(750);
    expect(migrated.account.energy).toBe(15);
  });
  it.each([
    '{bad',
    JSON.stringify({ version: 99 }),
    JSON.stringify({ ...defaultSave(), account: { ...defaultSave().account, bits: -1 } }),
  ])('recovers malformed saves without destroying backup', (raw) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const data = new Map([[SAVE_KEY, raw]]);
    const storage = {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => {
        data.set(key, value);
      },
    };
    const now = 1_700_000_000_000;
    const result = loadSave(storage, now);
    expect(result.save).toEqual(defaultSave(now));
    expect(result.warning).toBeTruthy();
    expect(data.get(`${SAVE_KEY}_backup`)).toBe(raw);
    warn.mockRestore();
  });
  it('rejects equipped items in the wrong slot', () => {
    const save = defaultSave();
    save.account.equipped.weapon = 'armor_firewall_shell';
    expect(() => migrateSave(save)).toThrow();
  });
  it('keeps the game playable when storage quota is exhausted', () => {
    expect(
      writeSave(
        {
          setItem: () => {
            throw new Error('Quota exceeded');
          },
        },
        defaultSave(),
      ),
    ).toContain('could not save');
  });
});
