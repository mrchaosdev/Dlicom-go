import { SKILLS } from '../src/content/skills';
import { EQUIPMENT } from '../src/content/equipment';
import { existsSync } from 'node:fs';
import { validateContent } from '../src/content/validate';
validateContent();
for (const file of [
  'dili-idle.png',
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
])
  if (!existsSync(`public/assets/${file}`)) throw new Error(`Asset missing: ${file}`);
console.log(
  `Validated ${SKILLS.length} skills, ${EQUIPMENT.length} equipment definitions and all runtime assets.`,
);
