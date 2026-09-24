import { SKILLS } from '../src/content/skills';
import { EQUIPMENT } from '../src/content/equipment';
import { existsSync } from 'node:fs';
import { validateContent } from '../src/content/validate';
validateContent();
for (const file of [
  'dili-idle.png',
  'skill-packet.png',
  'skill-hammer.png',
  'skill-firewall.png',
  'skill-viral.png',
  'skill-rage.png',
  'spam-bot.svg',
  'spam-king.svg',
  'loop-phantom.svg',
  'raid-master.svg',
  'null-exe.svg',
  'dliclips-loop.wav',
  'rooms-loop.wav',
  'core-loop.wav',
  'feed-loop.wav',
  'attack.wav',
  'crit.wav',
  'ultimate.wav',
  'select.wav',
  'dodge.wav',
  'heal.wav',
  'shield.wav',
  'death.wav',
  'boss-intro.wav',
  'victory.wav',
  'defeat.wav',
  'reward.wav',
  'legendary.wav',
  'hammer.wav',
  'shield-break.wav',
  'boss-king-attack.wav',
  'boss-phantom-attack.wav',
  'boss-raid-attack.wav',
  'boss-null-attack.wav',
])
  if (!existsSync(`public/assets/${file}`)) throw new Error(`Asset missing: ${file}`);
console.log(
  `Validated ${SKILLS.length} skills, ${EQUIPMENT.length} equipment definitions and all runtime assets.`,
);
