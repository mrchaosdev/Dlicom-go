import type { Stats, Rarity } from '../game/combat/types';
export type EventEffect =
  | { type: 'bits' | 'xp'; amount: number }
  | { type: 'heal' | 'damage' | 'shield'; fraction: number }
  | { type: 'buff'; stat: keyof Stats; value: number; battles: number }
  | { type: 'skill'; rarity: Rarity }
  | { type: 'elite_fight' }
  | { type: 'random_cache' };
export interface EventChoice { label: string; outcomeText: string; effects: EventEffect[] }
export interface EventDefinition { id: string; title: string; body: string; chapters?: string[]; choices: EventChoice[] }
const choice = (label: string, outcomeText: string, ...effects: EventEffect[]): EventChoice => ({ label, outcomeText, effects });
const CHAPTER_1 = ['chapter_feed'];
const CHAPTER_2 = ['chapter_dliclips'];
const CHAPTER_3 = ['chapter_rooms'];
const CHAPTER_4 = ['chapter_core'];
export const EVENTS: EventDefinition[] = [
  { id: 'suspicious_plugin', title: 'Suspicious Plugin', body: 'A mysterious plugin promises more reach. How much do you trust it?', chapters: CHAPTER_1, choices: [
    choice('Install', 'Plugin installed. Lost 20% max HP; choose an Epic or better skill.', { type: 'damage', fraction: .2 }, { type: 'skill', rarity: 'epic' }),
    choice('Scan', 'Scan complete. Choose a verified Rare or better skill.', { type: 'skill', rarity: 'rare' }),
    choice('Ignore', 'Plugin ignored. +20 Bits.', { type: 'bits', amount: 20 }),
  ] },
  { id: 'infinite_scroll_event', title: 'Infinite Scroll', body: 'The Feed keeps going. One more scroll might change everything.', chapters: CHAPTER_1, choices: [
    choice('Continue scrolling', 'One more scroll. Lost 15% max HP; choose a skill.', { type: 'damage', fraction: .15 }, { type: 'skill', rarity: 'common' }),
    choice('Close the Feed', 'Dili disconnected to recharge. Healed 15% max HP.', { type: 'heal', fraction: .15 }),
  ] },
  { id: 'encryption_key', title: 'Encryption Key', body: 'A forgotten key opens a private lane through the network.', chapters: CHAPTER_1, choices: [
    choice('Use the key', 'Encryption key active. Dodge +4% for the rest of this run.', { type: 'buff', stat: 'dodgeRate', value: .04, battles: 99 }),
    choice('Sell the key', 'Key sold. +30 Bits.', { type: 'bits', amount: 30 }),
  ] },
  { id: 'creator_drop', title: 'Creator Drop', body: 'A featured creator shares a packet amplifier with the community.', chapters: CHAPTER_1, choices: [
    choice('Feature the post', 'Your build gains +10% basic damage this run.', { type: 'buff', stat: 'basicDamage', value: .1, battles: 99 }),
    choice('Skip the post', 'The connection stays quiet. +15 Bits.', { type: 'bits', amount: 15 }),
  ] },
  { id: 'server_cache', title: 'Server Cache', body: 'An unmarked cache hums between two corrupted server racks.', chapters: CHAPTER_1, choices: [
    choice('Open the cache', 'The cache contains either a Bits bonus or a small trap.', { type: 'random_cache' }),
    choice('Leave it alone', 'Dili avoids the unknown connection and recovers 10% HP.', { type: 'heal', fraction: .1 }),
  ] },
  { id: 'moderation_queue', title: 'Moderation Queue', body: 'A wave of hostile posts spills out of an unattended queue.', chapters: CHAPTER_1, choices: [
    choice('Clear the queue', 'Queue cleared. Earn a Rare skill and the elite reward.', { type: 'elite_fight' }),
    choice('Ignore the queue', 'Dili steps back and recovers 10% HP.', { type: 'heal', fraction: .1 }),
  ] },
  { id: 'viral_clip', title: 'Viral Clip', body: 'A clip is gaining momentum. A little boost could turn it into a movement.', chapters: CHAPTER_1, choices: [
    choice('Boost it', 'Packet feed accelerated: basic damage +15% for the next 2 battles.', { type: 'buff', stat: 'basicDamage', value: .15, battles: 2 }),
    choice('Archive it', 'The clip is archived. +25 Bits.', { type: 'bits', amount: 25 }),
  ] },
  { id: 'unknown_dm', title: 'Unknown DM', body: 'A private message appears from an account with no history.', chapters: CHAPTER_1, choices: [
    choice('Open the message', 'A friendly source sends 25 Bits.', { type: 'bits', amount: 25 }),
    choice('Block the sender', 'The message is blocked. Gain +15% Shield power next battle.', { type: 'buff', stat: 'shieldPower', value: .15, battles: 1 }),
  ] },
  { id: 'patch_notes', title: 'Patch Notes', body: 'A rushed update is ready. Its change log leaves a few questions unanswered.', chapters: CHAPTER_1, choices: [
    choice('Install stable', 'The safe update increases Dili’s DEF by 6 for this run.', { type: 'buff', stat: 'def', value: 6, battles: 99 }),
    choice('Try experimental', 'Choose an Epic skill; the unstable install costs 15% HP.', { type: 'skill', rarity: 'epic' }, { type: 'damage', fraction: .15 }),
  ] },
  { id: 'community_raid', title: 'Community Raid', body: 'A hostile group is organizing on the edge of the feed.', chapters: CHAPTER_1, choices: [
    choice('Defend the room', 'The coordinated raid is cleared. Earn an elite reward.', { type: 'elite_fight' }),
    choice('Lock the room', 'Room locked. Dili loses 10 Bits, but the connection stays safe.', { type: 'bits', amount: -10 }),
  ] },
  { id: 'packet_market', title: 'Packet Market', body: 'Traveling signal traders offer a tuned packet.', chapters: CHAPTER_2, choices: [
    choice('Buy the tuner', 'A new tuner improves Dili’s ATK by 10 for this run.', { type: 'buff', stat: 'atk', value: 10, battles: 99 }),
    choice('Sell spare bandwidth', 'Traders pay 35 Bits.', { type: 'bits', amount: 35 }),
  ] },
  { id: 'archived_meme', title: 'Archived Meme', body: 'A forgotten clip still makes the old channel laugh.', chapters: CHAPTER_2, choices: [
    choice('Repost the archive', 'The repost draws a Rare skill offer.', { type: 'skill', rarity: 'rare' }),
    choice('Close the archive', 'Old memories restore 12% max HP.', { type: 'heal', fraction: .12 }),
  ] },
  { id: 'offline_update', title: 'Offline Update', body: 'The relay requests a quiet restart while the stream is empty.', chapters: CHAPTER_2, choices: [
    choice('Restart now', 'The relays restart. Recover 20% HP.', { type: 'heal', fraction: .2 }),
    choice('Keep streaming', 'Dili keeps the current route and gains 20 Bits.', { type: 'bits', amount: 20 }),
  ] },
  { id: 'twin_signal', title: 'Twin Signal', body: 'Two clips land at the exact same instant.', chapters: CHAPTER_2, choices: [
    choice('Follow both', 'Both feeds boost packet damage by 10% for the next two battles.', { type: 'buff', stat: 'basicDamage', value: .1, battles: 2 }),
    choice('Follow the quiet one', 'A focused stream earns 25 Bits.', { type: 'bits', amount: 25 }),
  ] },
  { id: 'data_dividend', title: 'Data Dividend', body: 'The archive returns a small share of the network’s bandwidth.', chapters: CHAPTER_3, choices: [
    choice('Claim the dividend', 'A secure refund restores 30% HP.', { type: 'heal', fraction: .3 }),
    choice('Keep the channel open', 'Keep moving and earn 40 Bits.', { type: 'bits', amount: 40 }),
  ] },
  { id: 'help_queue', title: 'Help Queue', body: 'Two community members are asking for moderation at once.', chapters: CHAPTER_3, choices: [
    choice('Moderate the thread', 'The pile-on is silenced. Choose a Rare or better skill.', { type: 'skill', rarity: 'rare' }),
    choice('Shield the room', 'A trusted helper sets up a temporary firewall.', { type: 'shield', fraction: .25 }),
  ] },
  { id: 'mirror_thread', title: 'Mirror Thread', body: 'A mirrored thread makes every reply land twice as hard.', chapters: CHAPTER_3, choices: [
    choice('Join the debate', 'Dili’s Counter damage increases by 25% for this run.', { type: 'buff', stat: 'counterDamage', value: .25, battles: 99 }),
    choice('Lock replies', 'The thread is archived for 25 Bits.', { type: 'bits', amount: 25 }),
  ] },
  { id: 'frequency_swap', title: 'Frequency Swap', body: 'A quiet room trades one signal for another.', chapters: CHAPTER_3, choices: [
    choice('Take the signal', 'The signal strengthens the Firewall by 20% for this run.', { type: 'buff', stat: 'shieldPower', value: .2, battles: 99 }),
    choice('Trade it in', 'A clean exchange earns 35 Bits.', { type: 'bits', amount: 35 }),
  ] },
  { id: 'slow_mode_forum', title: 'Slow-Mode Forum', body: 'A calm channel has been protected from the latest bot wave.', chapters: CHAPTER_4, choices: [
    choice('Enable slow mode', 'Signal stability increases damage reduction by 8%.', { type: 'buff', stat: 'damageReduction', value: .08, battles: 99 }),
    choice('Donate bandwidth', 'The forum sends 45 Bits.', { type: 'bits', amount: 45 }),
  ] },
  { id: 'core_checksum', title: 'Core Checksum', body: 'The network core detects a small mismatch in Dili’s own connection.', chapters: CHAPTER_4, choices: [
    choice('Run the checksum', 'Data repaired: recover 25% HP and 25 Rage.', { type: 'heal', fraction: .25 }, { type: 'buff', stat: 'startRage', value: 25, battles: 1 }),
    choice('Accept the checksum', 'Dili keeps the current signal and chooses a Rare skill.', { type: 'skill', rarity: 'rare' }),
  ] },
];

export function eventsForChapter(chapterId: string) {
  const pool = EVENTS.filter(event => !event.chapters || event.chapters.includes(chapterId));
  if (pool.length < 2) throw new Error(`Chapter ${chapterId} needs at least 2 events`);
  return pool;
}
