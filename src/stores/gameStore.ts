import { create } from 'zustand';
import { defaultSave, loadSave, writeSave, type SaveFile } from '../services/save';
import { RunSession, buyGear, equip, upgrade, upgradeItem } from '../game/run/RunSession';
import type { Slot } from '../content/equipment';
import type { CombatEvent } from '../game/combat/types';
import type { BattleSnapshot } from '../game/combat/CombatEngine';
import { RUN_ENERGY_COST, claimDailyEnergy, rechargeEnergy, spendRunEnergy } from '../game/meta/energy';
import { openChest, type ChestKind, type ChestReward } from '../game/meta/chests';
import { SKIN_BY_ID, type SkinId } from '../content/skins';
function initial() {
  try {
    return loadSave(window.localStorage);
  } catch {
    return {
      save: defaultSave(),
      warning: 'Browser storage unavailable. Progress lasts for this session.',
    };
  }
}
const loaded = initial();
interface GameStore {
  save: SaveFile;
  warning: string;
  run?: RunSession;
  revision: number;
  screen: 'home' | 'guide' | 'equipment' | 'settings' | 'achievements' | 'play';
  paused: boolean;
  speed: 1 | 2;
  events: CombatEvent[];
  snapshot?: BattleSnapshot;
  sequence: number;
  chestReward?: ChestReward;
  navigate: (screen: GameStore['screen']) => void;
  start: (chapterId?: string) => void;
  syncEnergy: () => void;
  claimDailyEnergy: () => void;
  act: (action: 'enter' | 'skill' | 'reroll' | 'rest' | 'event', value?: string | number) => void;
  step: () => void;
  finish: () => void;
  togglePause: () => void;
  toggleSpeed: () => void;
  settings: (settings: Partial<SaveFile['settings']>) => void;
  equip: (id: string) => void;
  upgrade: (slot: Slot) => void;
  upgradeItem: (id: string) => void;
  buyGear: (id: string) => void;
  openChest: (kind: ChestKind) => void;
  clearChestReward: () => void;
  selectSkin: (id: SkinId) => void;
}
export const useGame = create<GameStore>((set, get) => {
  const save = (next: SaveFile) => {
    let warning = '';
    try {
      warning = writeSave(window.localStorage, next);
    } catch {
      warning = 'Progress could not be saved in this browser.';
    }
    set({ save: next, warning });
  };
  const refresh = () => set({ revision: get().revision + 1 });
  return {
    ...loaded,
    revision: 0,
    screen: 'home',
    paused: false,
    speed: loaded.save.settings.speed,
    events: [],
    sequence: 0,
    chestReward: undefined,
    navigate: (screen) => set({ screen }),
    syncEnergy: () => {
      const current = get().save;
      const account = rechargeEnergy(current.account, Date.now());
      if (account !== current.account) save({ ...current, account });
    },
    claimDailyEnergy: () => {
      const current = get().save;
      const account = claimDailyEnergy(current.account, Date.now());
      if (account) save({ ...current, account });
    },
    start: (chapterId = 'chapter_feed') => {
      if (get().run && !get().run?.result) {
        set({ screen: 'play' });
        return;
      }
      const now = Date.now();
      const current = get().save;
      const account = spendRunEnergy(current.account, now);
      if (!account) {
        const refreshed = rechargeEnergy(current.account, now);
        if (refreshed !== current.account) save({ ...current, account: refreshed });
        set({ warning: `A run needs ${RUN_ENERGY_COST} energy. 1 energy returns every 10 minutes.` });
        return;
      }
      const seed = crypto.randomUUID();
      const run = new RunSession(seed, current, chapterId);
      save({ ...current, account });
      set({
        run,
        screen: 'play',
        paused: false,
        events: [],
        snapshot: undefined,
        revision: get().revision + 1,
        speed: get().save.settings.speed,
      });
    },
    act: (action, value) => {
      const run = get().run;
      if (!run) return;
      if (action === 'enter') run.enterNode(Number(value ?? 0));
      else if (action === 'skill') run.selectSkill(String(value));
      else if (action === 'reroll') run.reroll();
      else if (action === 'event') run.event(Number(value));
      else if (action === 'rest') run.rest(value as 'heal' | 'upgrade' | 'shield' | 'shop');
      set({ snapshot: run.engine?.snapshot(), events: [], paused: false });
      refresh();
    },
    step: () => {
      const { run, paused } = get();
      if (!run?.engine || run.phase !== 'battle' || paused) return;
      const events = run.engine.step();
      set({ events, snapshot: run.engine.snapshot(), sequence: get().sequence + 1 });
    },
    finish: () => {
      const run = get().run;
      if (!run?.engine?.outcome || run.phase !== 'battle') return;
      run.finishBattle();
      if (run.result) {
        const settled = run.settle(get().save);
        save({ ...settled, account: {
          ...settled.account,
          activeRunEnergy: 0,
          queuedSkill: settled.account.queuedSkill === run.starterSkill ? '' : settled.account.queuedSkill,
        } });
      }
      refresh();
    },
    togglePause: () => set({ paused: !get().paused }),
    toggleSpeed: () => set({ speed: get().speed === 1 ? 2 : 1 }),
    settings: (settings) => {
      const next = structuredClone(get().save);
      next.settings = { ...next.settings, ...settings };
      save(next);
    },
    equip: (id) => save(equip(get().save, id)),
    upgrade: (slot) => save(upgrade(get().save, slot)),
    upgradeItem: (id) => save(upgradeItem(get().save, id)),
    buyGear: (id) => {
      save(buyGear(get().save, id));
      set({ chestReward: undefined });
    },
    openChest: (kind) => {
      if (kind === 'skill' && get().run && !get().run?.result) return;
      const result = openChest(get().save, kind, crypto.randomUUID());
      if (!result.reward) return;
      save(result.save);
      set({ chestReward: result.reward });
    },
    clearChestReward: () => set({ chestReward: undefined }),
    selectSkin: (id) => {
      if (!SKIN_BY_ID[id] || get().save.account.skinId === id) return;
      const current = get().save;
      save({ ...current, account: { ...current.account, skinId: id } });
    },
  };
});
