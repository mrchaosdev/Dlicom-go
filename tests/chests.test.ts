import { describe, expect, it } from 'vitest';
import { EQUIPMENT } from '../src/content/equipment';
import { SKIN_BY_ID, SKINS } from '../src/content/skins';
import { canOpenChest, GEAR_CHEST_COST, openChest, SKIN_CHEST_COST } from '../src/game/meta/chests';
import { defaultSave, loadSave, migrateSave, SAVE_KEY } from '../src/services/save';

describe('shop chests', () => {
  it('draws an unowned gear item deterministically and charges once', () => {
    const save = defaultSave();
    save.account.bits = 1000;
    const first = openChest(save, 'gear', 'gear-seed');
    const repeat = openChest(save, 'gear', 'gear-seed');
    expect(first).toEqual(repeat);
    expect(first.reward?.kind).toBe('gear');
    expect(first.reward?.id).toBeTruthy();
    expect(save.account.inventory[first.reward!.id]).toBeUndefined();
    expect(first.save.account.inventory[first.reward!.id]).toBe(1);
    expect(first.save.account.bits).toBe(1000 - GEAR_CHEST_COST);
    expect(save.account.bits).toBe(1000);
    const second = openChest(first.save, 'gear', 'gear-seed');
    expect(second.reward?.id).not.toBe(first.reward?.id);
  });
  it('does not sell empty or unaffordable chests', () => {
    const save = defaultSave();
    expect(canOpenChest(save, 'gear')).toBe(false);
    expect(canOpenChest(save, 'skin')).toBe(false);
    expect(openChest(save, 'gear', 'seed')).toEqual({ save });
    save.account.bits = 10000;
    for (const item of EQUIPMENT) save.account.inventory[item.id] = 1;
    expect(canOpenChest(save, 'gear')).toBe(false);
    expect(openChest(save, 'gear', 'seed')).toEqual({ save });
  });
  it('unlocks and equips an unowned skin deterministically without duplicates', () => {
    const save = defaultSave();
    save.account.bits = 500;
    const result = openChest(save, 'skin', 'skin-seed');
    expect(result.reward?.kind).toBe('skin');
    const id = result.reward!.id;
    expect(SKIN_BY_ID[id as keyof typeof SKIN_BY_ID]).toBeTruthy();
    expect(save.account.ownedSkins).not.toContain(id);
    expect(result.save.account.bits).toBe(500 - SKIN_CHEST_COST);
    expect(result.save.account.ownedSkins).toContain(id);
    expect(result.save.account.skinId).toBe(id);
    const second = openChest(result.save, 'skin', 'skin-seed');
    expect(second.reward?.id).not.toBe(id);
    expect(new Set(second.save.account.ownedSkins).size).toBe(second.save.account.ownedSkins.length);
  });
  it('closes the skin chest when every costume is owned', () => {
    const save = defaultSave();
    save.account.bits = 1000;
    save.account.ownedSkins = SKINS.map((skin) => skin.id);
    expect(canOpenChest(save, 'skin')).toBe(false);
    expect(openChest(save, 'skin', 'skin-seed')).toEqual({ save });
  });
  it('rejects a corrupt queued-skill ID during save validation', () => {
    const save = defaultSave();
    save.account.queuedSkill = 'unknown_skill';
    expect(() => migrateSave(save)).toThrow();
  });
  it('keeps a queued skill when an interrupted run is recovered', () => {
    const now = 1_700_000_000_000;
    const save = defaultSave(now);
    save.account.queuedSkill = 'packet_boost';
    save.account.activeRunEnergy = 5;
    save.account.energy = 10;
    const data = new Map([[SAVE_KEY, JSON.stringify(save)]]);
    const loaded = loadSave({
      getItem: (key) => data.get(key) ?? null,
      setItem: (key, value) => { data.set(key, value); },
    }, now);
    expect(loaded.save.account.queuedSkill).toBe('packet_boost');
    expect(loaded.save.account.activeRunEnergy).toBe(0);
    expect(loaded.save.account.energy).toBe(15);
  });
});
