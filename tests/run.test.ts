import { describe, expect, it, vi } from 'vitest';
import { defaultSave, loadSave, migrateSave, SAVE_KEY, writeSave } from '../src/services/save';
import { buyGear, equip, RUN_SHOP_COST, RunSession, upgrade, upgradeItem } from '../src/game/run/RunSession';
import { EQUIPMENT, gearPrice, GEAR, weaponAttackStyle } from '../src/content/equipment';
import { SKILL_BY_ID } from '../src/content/skills';
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
  it('buys a specific item once, equips it, and upgrades owned unequipped gear', () => {
    const save = defaultSave();
    expect(buyGear(save, 'unknown_item')).toBe(save);
    expect(buyGear(save, 'weapon_encryption_blade')).toBe(save);
    save.account.bits = 500;
    const bought = buyGear(save, 'weapon_encryption_blade');
    expect(gearPrice(GEAR.weapon_encryption_blade)).toBe(350);
    expect(bought.account.bits).toBe(150);
    expect(bought.account.inventory.weapon_encryption_blade).toBe(1);
    expect(bought.account.equipped.weapon).toBe('weapon_encryption_blade');
    expect(buyGear(bought, 'weapon_encryption_blade')).toBe(bought);
    const upgraded = upgradeItem(bought, 'weapon_packet_blaster');
    expect(upgraded.account.bits).toBe(50);
    expect(upgraded.account.inventory.weapon_packet_blaster).toBe(2);
    expect(upgradeItem(upgraded, 'unknown_item')).toBe(upgraded);
    expect(upgradeItem(upgraded, 'weapon_packet_blaster')).toBe(upgraded);
    expect(save.account.bits).toBe(500);
  });
  it('spends run Bits at the second rest for a Rare-or-better draft', () => {
    const run = new RunSession('signal-bazaar', defaultSave());
    run.node = 4;
    run.phase = 'rest';
    run.bits = RUN_SHOP_COST;
    run.rest('shop');
    expect(run.phase).toBe('rest');
    expect(run.bits).toBe(RUN_SHOP_COST);
    run.node = 9;
    run.bits = RUN_SHOP_COST - 1;
    run.rest('shop');
    expect(run.phase).toBe('rest');
    expect(run.bits).toBe(RUN_SHOP_COST - 1);
    run.bits = RUN_SHOP_COST;
    run.rest('shop');
    expect(run.bits).toBe(0);
    expect(run.cleared).toBe(1);
    expect(run.phase).toBe('draft');
    expect(run.draft.length).toBeGreaterThan(0);
    expect(run.draft.every((id) => SKILL_BY_ID[id].rarity !== 'common')).toBe(true);
    run.reroll();
    expect(run.draft.every((id) => SKILL_BY_ID[id].rarity !== 'common')).toBe(true);
    run.rest('shop');
    expect(run.bits).toBe(0);
    run.selectSkill(run.draft[0]);
    expect(run.node).toBe(10);
  });
  it('captures the equipped attack style for the entire run', () => {
    const save = defaultSave();
    save.account.inventory.weapon_encryption_blade = 1;
    save.account.equipped.weapon = 'weapon_encryption_blade';
    const run = new RunSession('blade-style', save);
    expect(run.weaponId).toBe('weapon_encryption_blade');
    expect(run.armorId).toBe('armor_firewall_shell');
    expect(run.moduleId).toBe('module_viral_chip');
    expect(run.weaponStyle).toBe('blade');
    save.account.inventory.weapon_moderator_hammer = 1;
    save.account.equipped.weapon = 'weapon_moderator_hammer';
    save.account.inventory.armor_zero_knowledge_cloak = 1;
    save.account.equipped.armor = 'armor_zero_knowledge_cloak';
    save.account.inventory.module_combo_router = 1;
    save.account.equipped.module = 'module_combo_router';
    expect(run.weaponId).toBe('weapon_encryption_blade');
    expect(run.armorId).toBe('armor_firewall_shell');
    expect(run.moduleId).toBe('module_viral_chip');
    expect(run.weaponStyle).toBe('blade');
    expect(new RunSession('hammer-style', save).weaponStyle).toBe('hammer');
  });
  it('requires every weapon to declare its presentation style', () => {
    expect(EQUIPMENT.filter((item) => item.slot === 'weapon').map((item) => item.attackStyle)).toEqual([
      'ranged', 'hammer', 'ranged', 'ranged', 'blade', 'ranged',
    ]);
    expect(weaponAttackStyle('weapon_encryption_blade')).toBe('blade');
    expect(() => weaponAttackStyle('armor_firewall_shell')).toThrow('Expected an equipped weapon');
  });
  it('captures a cosmetic skin for the entire run without changing combat stats', () => {
    const save = defaultSave();
    const baseline = new RunSession('skin-seed', save);
    save.account.skinId = 'neon_rose';
    const rose = new RunSession('skin-seed', save);
    expect(rose.skinId).toBe('neon_rose');
    expect(rose.baseStats).toEqual(baseline.baseStats);
    save.account.skinId = 'jade_glitch';
    expect(rose.skinId).toBe('neon_rose');
    expect(new RunSession('skin-seed', save).skinId).toBe('jade_glitch');
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
  it('roundtrips version 4 and migrates versions 1, 2 and 3 without losing progress', () => {
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
    expect(migrated.version).toBe(4);
    expect(migrated.account.bits).toBe(750);
    expect(migrated.account.energy).toBe(15);
    expect(migrated.account.queuedSkill).toBe('');
    expect(migrated.account.skinId).toBe('signal_blue');
    const previous = JSON.parse(JSON.stringify(current));
    previous.version = 2;
    previous.account.bits = 420;
    delete previous.account.queuedSkill;
    const migratedPrevious = migrateSave(previous, now);
    expect(migratedPrevious.version).toBe(4);
    expect(migratedPrevious.account.bits).toBe(420);
    expect(migratedPrevious.account.energy).toBe(current.account.energy);
    expect(migratedPrevious.account.queuedSkill).toBe('');
    const chestVersion = JSON.parse(JSON.stringify(current));
    chestVersion.version = 3;
    chestVersion.account.queuedSkill = 'packet_boost';
    delete chestVersion.account.skinId;
    const migratedChestVersion = migrateSave(chestVersion, now);
    expect(migratedChestVersion.version).toBe(4);
    expect(migratedChestVersion.account.queuedSkill).toBe('packet_boost');
    expect(migratedChestVersion.account.skinId).toBe('signal_blue');
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
  it('rejects an unknown saved skin ID', () => {
    const save = defaultSave();
    (save.account as { skinId: string }).skinId = 'unknown_skin';
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
