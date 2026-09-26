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
  { id: 'neon_rose', name: 'Night Operative', description: 'Tactical stealth armor with a magenta signal edge.', accent: '#ff46dc' },
  { id: 'solar_circuit', name: 'Solar Vanguard', description: 'White-gold command armor powered by a sun core.', accent: '#ffb52e' },
  { id: 'jade_glitch', name: 'Glitch Phantom', description: 'A hooded data-cloak breaking into jade pixels.', accent: '#45f2c0' },
];
export const SKIN_BY_ID: Record<SkinId, SkinDefinition> = Object.fromEntries(SKINS.map((skin) => [skin.id, skin])) as Record<SkinId, SkinDefinition>;
