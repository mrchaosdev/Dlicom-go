import { SKILLS } from '../src/content/skills';
import { EQUIPMENT } from '../src/content/equipment';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { validateContent } from '../src/content/validate';
validateContent();
for (const file of [
  'background-feed-city.webp',
  'background-dliclip-stream.webp',
  'background-dili-rooms.webp',
  'background-core-network.webp',
  'dili-idle.webp',
  'dili-attack.webp',
  'dili-sword-idle.webp',
  'dili-sword-attack.webp',
  'dili-hammer-idle.webp',
  'dili-hammer-attack.webp',
  'dili-hurt.webp',
  'dili-ultimate.webp',
  'skill-packet.webp',
  'skill-hammer.webp',
  'skill-firewall.webp',
  'skill-moderation.webp',
  'skill-encryption.webp',
  'skill-viral.webp',
  'skill-rage.webp',
  'skill-heal.webp',
  'chest-gear.webp',
  'chest-skin.webp',
  'spam-bot.svg',
  'spam-bot.webp',
  'scam-link.webp',
  'bug.webp',
  'raid-bot.webp',
  'fake-account.webp',
  'data-leech.webp',
  'corrupted-clip.webp',
  'toxic-reply.webp',
  'popup.webp',
  'null-fragment.webp',
  'spam-king.svg',
  'loop-phantom.svg',
  'raid-master.svg',
  'null-exe.svg',
  'spam-king.webp',
  'loop-phantom.webp',
  'raid-master.webp',
  'null-exe.webp',
  'dliclips-loop.mp3',
  'rooms-loop.mp3',
  'core-loop.mp3',
  'feed-loop.mp3',
  'attack.mp3',
  'crit.mp3',
  'ultimate.mp3',
  'select.mp3',
  'dodge.mp3',
  'heal.mp3',
  'shield.mp3',
  'death.mp3',
  'boss-intro.mp3',
  'victory.mp3',
  'defeat.mp3',
  'reward.mp3',
  'legendary.mp3',
  'hammer.mp3',
  'sword.mp3',
  'shield-break.mp3',
  'boss-king-attack.mp3',
  'boss-phantom-attack.mp3',
  'boss-raid-attack.mp3',
  'boss-null-attack.mp3',
])
  if (!existsSync(`public/assets/${file}`)) throw new Error(`Asset missing: ${file}`);
for (const file of [
  'background-feed-city.webp',
  'background-dliclip-stream.webp',
  'background-dili-rooms.webp',
  'background-core-network.webp',
]) {
  const bytes = statSync(`public/assets/${file}`).size;
  if (bytes > 200_000) throw new Error(`Compressed background too large: ${file} (${bytes} > 200000)`);
}
for (const file of [
  'dili-idle.webp', 'dili-attack.webp', 'dili-hurt.webp', 'dili-ultimate.webp',
  'skill-packet.webp', 'skill-hammer.webp', 'skill-firewall.webp', 'skill-moderation.webp',
  'skill-encryption.webp', 'skill-viral.webp', 'skill-rage.webp', 'skill-heal.webp',
  'spam-bot.webp', 'scam-link.webp', 'bug.webp', 'raid-bot.webp', 'fake-account.webp',
  'data-leech.webp', 'corrupted-clip.webp', 'toxic-reply.webp', 'popup.webp',
  'null-fragment.webp', 'spam-king.webp', 'loop-phantom.webp', 'raid-master.webp', 'null-exe.webp',
]) {
  const bytes = statSync(`public/assets/${file}`).size;
  if (bytes > 200_000) throw new Error(`Compressed runtime art too large: ${file} (${bytes} > 200000)`);
}
for (const file of ['dili-sword-idle.webp', 'dili-sword-attack.webp', 'dili-hammer-idle.webp', 'dili-hammer-attack.webp']) {
  const bytes = statSync(`public/assets/${file}`).size;
  if (bytes > 150_000) throw new Error(`Compressed weapon pose too large: ${file} (${bytes} > 150000)`);
}
for (const skin of ['rose', 'solar', 'jade']) {
  for (const pose of ['idle', 'attack', 'sword-idle', 'sword-attack', 'hammer-idle', 'hammer-attack', 'hurt', 'ultimate']) {
    const file = `dili-skin-${skin}-${pose}.webp`;
    if (!existsSync(`public/assets/${file}`)) throw new Error(`Skin pose missing: ${file}`);
    const bytes = statSync(`public/assets/${file}`).size;
    if (bytes > 120_000) throw new Error(`Compressed skin pose too large: ${file} (${bytes} > 120000)`);
  }
}
for (const weapon of ['overdrive', 'viral', 'dliclip']) {
  for (const skin of ['signal', 'rose', 'solar', 'jade']) {
    for (const pose of ['idle', 'attack']) {
      const file = `dili-weapon-${weapon}-${skin}-${pose}.webp`;
      if (!existsSync(`public/assets/${file}`)) throw new Error(`Weapon pose missing: ${file}`);
      const bytes = statSync(`public/assets/${file}`).size;
      if (bytes > 120_000) throw new Error(`Compressed weapon pose too large: ${file} (${bytes} > 120000)`);
    }
  }
}
for (const file of ['chest-gear.webp', 'chest-skin.webp']) {
  const bytes = statSync(`public/assets/${file}`).size;
  if (bytes > 100_000) throw new Error(`Compressed chest art too large: ${file} (${bytes} > 100000)`);
}
for (const item of EQUIPMENT) {
  const file = `equipment/${item.id.replaceAll('_', '-')}.webp`;
  if (!existsSync(`public/assets/${file}`)) throw new Error(`Equipment art missing: ${file}`);
  const bytes = statSync(`public/assets/${file}`).size;
  if (bytes > 85_000) throw new Error(`Compressed equipment art too large: ${file} (${bytes} > 85000)`);
}
for (const file of readdirSync('public/assets/equipment'))
  if (!file.endsWith('.webp')) throw new Error(`Equipment runtime art must be WebP: ${file}`);
for (const file of [
  'dliclips-loop.mp3', 'rooms-loop.mp3', 'core-loop.mp3', 'feed-loop.mp3',
  'attack.mp3', 'crit.mp3', 'ultimate.mp3', 'select.mp3', 'dodge.mp3', 'heal.mp3',
  'shield.mp3', 'death.mp3', 'boss-intro.mp3', 'victory.mp3', 'defeat.mp3', 'reward.mp3',
  'legendary.mp3', 'hammer.mp3', 'sword.mp3', 'shield-break.mp3', 'boss-king-attack.mp3',
  'boss-phantom-attack.mp3', 'boss-raid-attack.mp3', 'boss-null-attack.mp3',
]) {
  const bytes = statSync(`public/assets/${file}`).size;
  if (bytes > 120_000) throw new Error(`Compressed audio too large: ${file} (${bytes} > 120000)`);
}
for (const file of readdirSync('public/assets'))
  if (file.endsWith('.wav') || file.endsWith('.png'))
    throw new Error(`Source-only media must stay outside public/assets: ${file}`);
console.log(
  `Validated ${SKILLS.length} skills, ${EQUIPMENT.length} equipment definitions and all runtime assets.`,
);
