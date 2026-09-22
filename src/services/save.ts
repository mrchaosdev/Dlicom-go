import { z } from 'zod';
import { GEAR } from '../content/equipment';
export const SAVE_KEY = 'dlicom_attack_v1';
const equipmentId = z.string().refine((id) => !!GEAR[id], 'Unknown equipment ID');
const schema = z
  .object({
    version: z.literal(1),
    account: z.object({
      bits: z.number().int().min(0).max(1e9),
      xp: z.number().int().min(0).max(1e9),
      runs: z.number().int().min(0),
      wins: z.number().int().min(0),
      bestScore: z.number().min(0),
      inventory: z.record(equipmentId, z.number().int().min(1).max(5)),
      equipped: z.object({ weapon: equipmentId, armor: equipmentId, module: equipmentId }),
      achievements: z.array(z.string()).max(100),
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
export function defaultSave(): SaveFile {
  return {
    version: 1,
    account: {
      bits: 0,
      xp: 0,
      runs: 0,
      wins: 0,
      bestScore: 0,
      inventory: { weapon_packet_blaster: 1, armor_firewall_shell: 1, module_viral_chip: 1 },
      equipped: {
        weapon: 'weapon_packet_blaster',
        armor: 'armor_firewall_shell',
        module: 'module_viral_chip',
      },
      achievements: [],
    },
    settings: { music: 0.25, sfx: 0.5, reducedMotion: false, speed: 1 },
  };
}
export function migrateSave(raw: unknown): SaveFile {
  return schema.parse(raw);
}
export function loadSave(storage: Pick<Storage, 'getItem' | 'setItem'>): {
  save: SaveFile;
  warning: string;
} {
  let raw: string | null = null;
  try {
    raw = storage.getItem(SAVE_KEY);
    return { save: raw ? migrateSave(JSON.parse(raw)) : defaultSave(), warning: '' };
  } catch (error) {
    console.warn('Save recovery:', error);
    if (raw) {
      try {
        storage.setItem(`${SAVE_KEY}_backup`, raw);
      } catch {
        /* Storage can be unavailable; defaults remain playable. */
      }
    }
    return {
      save: defaultSave(),
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
