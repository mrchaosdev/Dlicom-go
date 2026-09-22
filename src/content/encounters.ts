import { makeActor } from '../game/combat/CombatEngine';
import { SeededRng } from '../game/rng/SeededRng';
export const NODES = [
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
] as const;
export const NODE_SCALE = [0.8, 0.9, 1, 1.25, 1, 1.15, 1, 1.45, 1.35, 1, 1.7, 2.2];
export const ENEMIES = [
  {
    id: 'spam_bot',
    name: 'Spam Bot',
    hp: 400,
    atk: 24,
    def: 12,
    description: 'Repeated packets. Relentless spam.',
  },
  {
    id: 'scam_link',
    name: 'Scam Link',
    hp: 360,
    atk: 26,
    def: 16,
    description: 'Applies Vulnerable every 3 turns.',
  },
  {
    id: 'bug',
    name: 'Bug',
    hp: 240,
    atk: 32,
    def: 8,
    description: 'May Glitch Dili after attacking.',
  },
];
export function generateEncounter(seed: string, index: number, route = 0) {
  const rng = new SeededRng(`${seed}:encounter:${index}:${route}`);
  const type = NODES[index];
  const scale = NODE_SCALE[index];
  if (type === 'boss')
    return [
      makeActor(
        'boss_spam_king',
        'Spam King',
        { maxHp: Math.round(1800 * scale), atk: Math.round(30 * scale), def: 35 },
        'boss',
      ),
    ];
  if (type === 'elite') {
    const modifier = rng.pick(['Overclocked', 'Mirrored', 'Shielded', 'Viral', 'Encrypted']);
    const enemy = makeActor(
      `raid_bot_${index}`,
      'Raid Bot',
      {
        maxHp: Math.round(650 * scale),
        atk: Math.round(40 * scale * (modifier === 'Overclocked' ? 1.3 : 1)),
        def: 28,
        dodgeRate: modifier === 'Encrypted' ? 0.15 : 0,
      },
      'elite',
      'raid_bot',
    );
    enemy.modifier = modifier;
    if (modifier === 'Shielded') enemy.shield = Math.round(enemy.hp * 0.3);
    return [enemy];
  }
  const count = index === 0 ? 1 : index < 6 ? 2 : 3;
  return Array.from({ length: count }, (_, i) => {
    const def = index === 0 ? ENEMIES[0] : rng.pick(ENEMIES);
    return makeActor(
      `${def.id}_${i}`,
      def.name,
      { maxHp: Math.round(def.hp * scale), atk: Math.round(def.atk * scale), def: def.def },
      'normal',
      def.id,
    );
  });
}
