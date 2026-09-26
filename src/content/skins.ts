export const SKIN_IDS = ['signal_blue', 'neon_rose', 'solar_circuit', 'jade_glitch'] as const;
export type SkinId = typeof SKIN_IDS[number];
export interface SkinDefinition {
  id: SkinId;
  name: string;
  description: string;
  accent: string;
}
export const SKINS: SkinDefinition[] = [
  { id: 'signal_blue', name: 'Signal Blue', description: 'Dili\'s original network armor.', accent: '#67e7ef' },
  { id: 'neon_rose', name: 'Neon Rose', description: 'A bright magenta signal for every pose.', accent: '#f58ae8' },
  { id: 'solar_circuit', name: 'Solar Circuit', description: 'Warm orange plating with a live-wire glow.', accent: '#ffad70' },
  { id: 'jade_glitch', name: 'Jade Glitch', description: 'A green pulse through Dili\'s whole kit.', accent: '#9cf777' },
];
export const SKIN_BY_ID: Record<SkinId, SkinDefinition> = Object.fromEntries(SKINS.map((skin) => [skin.id, skin])) as Record<SkinId, SkinDefinition>;
