import { describe, expect, it } from 'vitest';
import { defaultSave, loadSave, SAVE_KEY } from '../src/services/save';
import {
  ENERGY_MAX,
  ENERGY_REGEN_MS,
  canClaimDailyEnergy,
  claimDailyEnergy,
  energyCountdown,
  rechargeEnergy,
  recoverInterruptedEnergy,
  spendRunEnergy,
} from '../src/game/meta/energy';

const NOW = 1_700_000_000_000;

describe('energy economy', () => {
  it('restores exactly one energy per ten minutes and retains partial progress', () => {
    const account = { ...defaultSave(NOW).account, energy: 0 };
    expect(rechargeEnergy(account, NOW + ENERGY_REGEN_MS - 1).energy).toBe(0);
    const first = rechargeEnergy(account, NOW + ENERGY_REGEN_MS + 30_000);
    expect(first.energy).toBe(1);
    expect(energyCountdown(first, NOW + ENERGY_REGEN_MS + 30_000)).toBe(ENERGY_REGEN_MS - 30_000);
    expect(rechargeEnergy(first, NOW + 3 * ENERGY_REGEN_MS).energy).toBe(3);
    const full = rechargeEnergy(account, NOW + 25 * ENERGY_REGEN_MS);
    expect(full.energy).toBe(ENERGY_MAX);
    expect(full.energyUpdatedAt).toBe(NOW + 25 * ENERGY_REGEN_MS);
  });

  it('spends five energy once per run and starts a fresh timer from full', () => {
    const full = { ...defaultSave(NOW).account, energy: ENERGY_MAX };
    const spent = spendRunEnergy(full, NOW + 1000)!;
    expect(spent.energy).toBe(15);
    expect(spent.activeRunEnergy).toBe(5);
    expect(spent.energyUpdatedAt).toBe(NOW + 1000);
    expect(spendRunEnergy({ ...spent, energy: 4 }, NOW + 1000)).toBeNull();
  });

  it('claims five energy once per local day without wasting a full-bar reward', () => {
    const account = defaultSave(NOW).account;
    expect(canClaimDailyEnergy(account, NOW)).toBe(true);
    const claimed = claimDailyEnergy(account, NOW)!;
    expect(claimed.energy).toBe(20);
    expect(claimDailyEnergy(claimed, NOW)).toBeNull();
    expect(canClaimDailyEnergy({ ...account, energy: 16 }, NOW)).toBe(false);
    const nextDay = NOW + 24 * 60 * 60 * 1000;
    expect(canClaimDailyEnergy({ ...claimed, energy: 15, energyUpdatedAt: nextDay }, nextDay)).toBe(true);
  });

  it('refunds an interrupted run once and preserves offline recharge', () => {
    const save = defaultSave(NOW);
    save.account.energy = 10;
    save.account.activeRunEnergy = 5;
    const data = new Map([[SAVE_KEY, JSON.stringify(save)]]);
    const loaded = loadSave({ getItem: (key) => data.get(key) ?? null, setItem: (key, value) => { data.set(key, value); } }, NOW + ENERGY_REGEN_MS);
    expect(loaded.save.account.energy).toBe(16);
    expect(loaded.save.account.activeRunEnergy).toBe(0);
    expect(loaded.warning).toContain('returned');
    expect(recoverInterruptedEnergy(loaded.save.account, NOW + ENERGY_REGEN_MS).energy).toBe(16);
  });
});
