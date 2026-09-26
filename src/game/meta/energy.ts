export const ENERGY_MAX = 20;
export const STARTING_ENERGY = 15;
export const RUN_ENERGY_COST = 5;
export const DAILY_ENERGY_REWARD = 5;
export const ENERGY_REGEN_MS = 10 * 60 * 1000;

export interface EnergyAccount {
  energy: number;
  energyUpdatedAt: number;
  activeRunEnergy: number;
  dailyClaimedOn: string;
}

export function localDay(now: number): string {
  const date = new Date(now);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function rechargeEnergy<T extends EnergyAccount>(account: T, now: number): T {
  if (account.energy >= ENERGY_MAX) return account;
  const anchor = Math.min(account.energyUpdatedAt, now);
  const restored = Math.floor((now - anchor) / ENERGY_REGEN_MS);
  if (restored <= 0 && anchor === account.energyUpdatedAt) return account;
  const energy = Math.min(ENERGY_MAX, account.energy + restored);
  return {
    ...account,
    energy,
    energyUpdatedAt: energy === ENERGY_MAX ? now : anchor + restored * ENERGY_REGEN_MS,
  };
}

export function spendRunEnergy<T extends EnergyAccount>(account: T, now: number): T | null {
  const refreshed = rechargeEnergy(account, now);
  if (refreshed.energy < RUN_ENERGY_COST) return null;
  return {
    ...refreshed,
    energy: refreshed.energy - RUN_ENERGY_COST,
    energyUpdatedAt: refreshed.energy === ENERGY_MAX ? now : refreshed.energyUpdatedAt,
    activeRunEnergy: RUN_ENERGY_COST,
  };
}

export function canClaimDailyEnergy(account: EnergyAccount, now: number): boolean {
  const refreshed = rechargeEnergy(account, now);
  return refreshed.dailyClaimedOn !== localDay(now)
    && refreshed.energy <= ENERGY_MAX - DAILY_ENERGY_REWARD;
}

export function claimDailyEnergy<T extends EnergyAccount>(account: T, now: number): T | null {
  const refreshed = rechargeEnergy(account, now);
  if (!canClaimDailyEnergy(refreshed, now)) return null;
  return {
    ...refreshed,
    energy: refreshed.energy + DAILY_ENERGY_REWARD,
    dailyClaimedOn: localDay(now),
  };
}

export function recoverInterruptedEnergy<T extends EnergyAccount>(account: T, now: number): T {
  const refreshed = rechargeEnergy(account, now);
  if (!refreshed.activeRunEnergy) return refreshed;
  return {
    ...refreshed,
    energy: Math.min(ENERGY_MAX, refreshed.energy + refreshed.activeRunEnergy),
    energyUpdatedAt: refreshed.energy + refreshed.activeRunEnergy >= ENERGY_MAX
      ? now : refreshed.energyUpdatedAt,
    activeRunEnergy: 0,
  };
}

export function energyCountdown(account: EnergyAccount, now: number): number {
  const refreshed = rechargeEnergy(account, now);
  if (refreshed.energy >= ENERGY_MAX) return 0;
  return Math.max(0, ENERGY_REGEN_MS - (now - refreshed.energyUpdatedAt));
}
