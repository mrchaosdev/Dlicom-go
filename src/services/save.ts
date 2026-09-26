import { z } from 'zod';
import { GEAR } from '../content/equipment';
import { ENERGY_MAX, RUN_ENERGY_COST, STARTING_ENERGY, recoverInterruptedEnergy } from '../game/meta/energy';
export const SAVE_KEY = 'dlicom_attack_v1';
const equipmentId = z.string().refine((id) => !!GEAR[id], 'Unknown equipment ID');
const schema = z
  .object({
    version: z.literal(2),
    account: z.object({
      bits: z.number().int().min(0).max(1e9),
      xp: z.number().int().min(0).max(1e9),
      runs: z.number().int().min(0),
      wins: z.number().int().min(0),
      unlockedChapters: z.number().int().min(1).max(4).default(1),
      bestScore: z.number().min(0),
      inventory: z.record(equipmentId, z.number().int().min(1).max(5)),
      equipped: z.object({ weapon: equipmentId, armor: equipmentId, module: equipmentId }),
      achievements: z.array(z.string()).max(100),
      energy: z.number().int().min(0).max(ENERGY_MAX),
      energyUpdatedAt: z.number().int().min(0),
      activeRunEnergy: z.union([z.literal(0), z.literal(RUN_ENERGY_COST)]),
      dailyClaimedOn: z.string().regex(/^(?:|\d{4}-\d{2}-\d{2})$/),
    }),
    settings: z.object({
      music: z.number().min(0).max(1),
      sfx: z.number().min(0).max(1),
      reducedMotion: z.boolean(),
      speed: z.union([z.literal(1), z.literal(2)]),
    }),
  })
  .superRefine((save, ctx) => {
    for (const [slot, id] of Object.entries(save.account.equipped))
      if (!save.account.inventory[id] || GEAR[id]?.slot !== slot)
        ctx.addIssue({
          code: 'custom',
          path: ['account', 'equipped', slot],
          message: 'Equipment must be owned and match its slot',
        });
  });
export type SaveFile = z.infer<typeof schema>;
export function defaultSave(now = Date.now()): SaveFile {
  return {
    version: 2,
    account: {
      bits: 0,
      xp: 0,
      runs: 0,
      wins: 0,
      unlockedChapters: 1,
      bestScore: 0,
      inventory: { weapon_packet_blaster: 1, armor_firewall_shell: 1, module_viral_chip: 1 },
      equipped: {
        weapon: 'weapon_packet_blaster',
        armor: 'armor_firewall_shell',
        module: 'module_viral_chip',
      },
      achievements: [],
      energy: STARTING_ENERGY,
      energyUpdatedAt: now,
      activeRunEnergy: 0,
      dailyClaimedOn: '',
    },
    settings: { music: 0.25, sfx: 0.5, reducedMotion: false, speed: 1 },
  };
}
export function migrateSave(raw: unknown, now = Date.now()): SaveFile {
  if (raw && typeof raw === 'object' && 'version' in raw && raw.version === 1
    && 'account' in raw && raw.account && typeof raw.account === 'object') {
    const previous = raw as Record<string, unknown> & { account: Record<string, unknown> };
    return schema.parse({
      ...previous,
      version: 2,
      account: {
        ...previous.account,
        energy: STARTING_ENERGY,
        energyUpdatedAt: now,
        activeRunEnergy: 0,
        dailyClaimedOn: '',
      },
    });
  }
  return schema.parse(raw);
}
export function loadSave(storage: Pick<Storage, 'getItem' | 'setItem'>, now = Date.now()): {
  save: SaveFile;
  warning: string;
} {
  let raw: string | null = null;
  try {
    raw = storage.getItem(SAVE_KEY);
    if (!raw) {
      const save = defaultSave(now);
      try {
        storage.setItem(SAVE_KEY, JSON.stringify(save));
        return { save, warning: '' };
      } catch {
        return { save, warning: 'Browser storage unavailable. Progress lasts for this session.' };
      }
    }
    const migrated = migrateSave(JSON.parse(raw), now);
    const interrupted = migrated.account.activeRunEnergy > 0;
    const save = { ...migrated, account: recoverInterruptedEnergy(migrated.account, now) };
    let warning = interrupted ? 'The interrupted run ended. Its 5 energy was returned.' : '';
    if (JSON.stringify(save) !== raw) {
      try {
        storage.setItem(SAVE_KEY, JSON.stringify(save));
      } catch {
        warning = 'Progress is available this session, but browser storage could not save it.';
      }
    }
    return {
      save,
      warning,
    };
  } catch (error) {
    console.warn('Save recovery:', error);
    if (raw) {
      try {
        storage.setItem(`${SAVE_KEY}_backup`, raw);
        storage.setItem(SAVE_KEY, JSON.stringify(defaultSave(now)));
      } catch {
        /* Storage can be unavailable; defaults remain playable. */
      }
    }
    return {
      save: defaultSave(now),
      warning: 'Your save could not be loaded. A fresh local profile is ready.',
    };
  }
}
export function writeSave(storage: Pick<Storage, 'setItem'>, save: SaveFile): string {
  try {
    storage.setItem(SAVE_KEY, JSON.stringify(migrateSave(save)));
    return '';
  } catch {
    return 'Progress is available this session, but browser storage could not save it.';
  }
}
export const accountLevel = (xp: number) => Math.min(6, 1 + Math.floor(xp / 120));
