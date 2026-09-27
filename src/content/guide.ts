import type { Archetype, StatusId } from '../game/combat/types';
import {
  ASSETS,
  BOSS_ART,
  CHAPTER_BACKGROUNDS,
  DILI_SKIN_ASSETS,
  ENEMY_SPRITES,
  EQUIPMENT_ART,
  SKILL_ART,
} from './assets';
import { BASE_STATS } from '../game/combat/types';
import { MAX_COMBO_CHAIN } from '../game/combat/CombatEngine';
import {
  DAILY_ENERGY_REWARD,
  ENERGY_MAX,
  ENERGY_REGEN_MS,
  RUN_ENERGY_COST,
  STARTING_ENERGY,
} from '../game/meta/energy';
import { GEAR_CHEST_COST, SKIN_CHEST_COST } from '../game/meta/chests';
import {
  DRAFT_PITY_THRESHOLD,
  DRAFT_RARITY_WEIGHTS,
  ELITE_DRAFT_BONUS,
} from '../game/run/Draft';
import {
  DUPLICATE_GEAR_BITS,
  EMPTY_DRAFT_BITS,
  NODE_REWARDS,
  NONCOMBAT_NODE_XP,
  REST_HEAL_FRACTION,
  REST_SHIELD_FRACTION,
  RUN_SHOP_COST,
  STARTING_REROLLS,
} from '../game/run/RunSession';
import { CHAPTERS } from './chapters';
import { NODES } from './encounters';
import { EQUIPMENT, GEAR_PRICES, UPGRADE_COSTS } from './equipment';
import { SKILLS } from './skills';
import { SKINS } from './skins';
import { ACHIEVEMENTS } from './achievements';
import { XP_PER_LEVEL, MAX_ACCOUNT_LEVEL } from '../services/save';

export type GuideImageStyle = 'sprite' | 'item' | 'art' | 'boss';
export interface GuideEntry {
  term: string;
  text: string;
  meta?: string;
  image?: string;
  imageStyle?: GuideImageStyle;
  backdrop?: string;
  status?: StatusId;
}
export interface GuideGalleryItem {
  label: string;
  caption?: string;
  image: string;
}
export interface GuideSection {
  id: string;
  title: string;
  summary: string;
  entries: GuideEntry[];
  gallery?: { style: 'scene' | 'portrait'; items: GuideGalleryItem[] };
}

export const GUIDE_BANNER = {
  backdrop: CHAPTER_BACKGROUNDS.chapter_feed,
  enemy: ENEMY_SPRITES.spam_bot,
};

const pct = (value: number) => `${Math.round(value * 100)}%`;
const list = (items: string[]) =>
  items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`;
const nodeNumbers = (kind: (typeof NODES)[number]) =>
  NODES.flatMap((node, index) => (node === kind ? [index + 1] : []));
const totalWeight = Object.values(DRAFT_RARITY_WEIGHTS).reduce((sum, value) => sum + value, 0);
const draftOdds = (Object.entries(DRAFT_RARITY_WEIGHTS) as [string, number][])
  .map(([rarity, weight]) => `${rarity[0].toUpperCase()}${rarity.slice(1)} ${Math.round((weight / totalWeight) * 100)}%`)
  .join(' · ');
const bazaarNode = NODES.lastIndexOf('rest') + 1;
const regenMinutes = ENERGY_REGEN_MS / 60000;

export const ARCHETYPE_LABELS: Record<Archetype, string> = {
  packet: 'Packet',
  hammer: 'Hammer',
  firewall: 'Firewall',
  viral: 'Viral',
  moderation: 'Moderation',
  encryption: 'Encryption',
  rage: 'Rage',
  heal: 'Heal',
};

export const ARCHETYPE_GUIDE: Record<Archetype, { role: string; keySkills: string[] }> = {
  packet: {
    role: 'Makes every basic attack count: extra packets, Critical hits, Combos, DliClips and bonus damage against elites and bosses. The largest and most flexible family.',
    keySkills: ['packet_boost', 'double_packet', 'rapid_feed', 'clip_on_crit'],
  },
  hammer: {
    role: 'Every few basics Dili smashes with a heavy Ban Hammer. Add Mark, splash damage and executes for burst damage.',
    keySkills: ['ban_hammer', 'heavy_ban', 'mark_for_review', 'permanent_ban'],
  },
  firewall: {
    role: 'Generates Shield on a timer, on Counters and on Ultimate, then punishes enemies when that Shield breaks. The safest way to survive long fights.',
    keySkills: ['firewall', 'reinforced_firewall', 'packet_filter', 'firewall_pulse'],
  },
  viral: {
    role: 'Kills and damaging skills set off area explosions. Weak against a single target, excellent in crowded fights.',
    keySkills: ['viral_seed', 'trending_explosion', 'repost', 'network_effect'],
  },
  moderation: {
    role: 'Glitch, Silence and Vulnerable weaken enemies, and debuffed enemies take extra damage.',
    keySkills: ['auto_mod', 'timeout', 'community_notes', 'full_moderation_suite'],
  },
  encryption: {
    role: 'Dodge hits and strike back with Counters. Rewards evasion with healing, Critical chance and free attacks.',
    keySkills: ['auto_reply', 'encrypted_session', 'ghost_packet', 'last_word'],
  },
  rage: {
    role: 'Fills the DLI Overdrive meter faster and makes each Ultimate hit harder. Pairs with every other family.',
    keySkills: ['faster_upload', 'rage_cache', 'overclock', 'combo_upload'],
  },
  heal: {
    role: 'Lifesteal, healing after battles and once-per-run protection from a lethal hit. Keeps a run alive between rest stops.',
    keySkills: ['lifeline', 'recovery_packet', 'second_chance', 'never_log_off'],
  },
};

export const ENEMY_GUIDE: Record<string, string> = {
  spam_bot: 'Plain attacker. The easiest target in the network.',
  scam_link: 'Every 3rd turn makes Dili Vulnerable (+15% damage taken) for 2 turns.',
  bug: 'Each attack has a 25% chance to Glitch Dili (−10% damage dealt) for 2 turns.',
  fake_account: 'Dodges 25% of Dili\'s direct hits.',
  data_leech: 'Every 2nd turn steals up to 15 Rage, delaying your Ultimate.',
  corrupted_clip: 'Every 2nd turn fires an extra Corrupted Burst for 60% of its ATK.',
  toxic_reply: 'Every 3rd turn adds a Toxic Retort for 65% of its ATK.',
  popup: 'Every 3rd turn shields its allies for 12% of their max HP. Area damage breaks those shields quickly.',
  raid_bot: 'A tougher attacker with high HP and defense.',
  null_fragment: 'Very high defense. Bonus damage, Vulnerable and Critical hits help most.',
};

export const BOSS_GUIDE: Record<string, string> = {
  boss_spam_king: 'Summons a Spam Bot every 3rd turn while fewer than 3 enemies stand. Every 5th turn Spam Flood hits for 160% ATK. Below 30% HP it attacks an extra time. Area damage clears the bots.',
  boss_loop_phantom: 'Every 3rd turn it makes Dili Vulnerable (+20%) and repeats its last move. Once, at 50% HP, it rewinds 30% of its max HP — plan for more damage than its HP bar shows.',
  boss_raid_master: 'Turn 1 summons two Raid Minions. While a minion lives the boss gains Shield each turn (up to 30% HP). Every 4th turn Silence Wave stops Dili\'s skills from triggering for 2 turns.',
  boss_null_exe: 'At 60% HP it Glitches Dili and cuts healing by 35% for the rest of the fight. Below 25% HP its ATK rises 35%. Every 5th turn NULL PULSE deals 18% of Dili\'s max HP and cannot be dodged — Shield still absorbs it.',
};

export const ELITE_MODIFIER_GUIDE: Record<string, string> = {
  Overclocked: 'ATK +30%.',
  Mirrored: 'Reflects 10% of each direct hit it takes back at Dili (reduced by Dili\'s DEF).',
  Shielded: 'Starts with a Shield equal to 30% of its HP.',
  Viral: 'When it dies it deals 60% of its ATK to Dili as true damage.',
  Encrypted: 'Dodges 15% of Dili\'s direct hits.',
};

const archetypeLevel = (tag: Archetype) =>
  Math.min(...SKILLS.filter((skill) => skill.tags[0] === tag).map((skill) => skill.unlockLevel));
const archetypes = (Object.keys(ARCHETYPE_GUIDE) as Archetype[]).sort(
  (a, b) => archetypeLevel(a) - archetypeLevel(b),
);
const skillName = (id: string) => SKILLS.find((skill) => skill.id === id)?.name ?? id;
const weapons = EQUIPMENT.filter((item) => item.slot === 'weapon');

export const GUIDE_STEPS = [
  {
    title: 'Prepare your loadout',
    text: `Open Loadout and equip a weapon, armor and module. The weapon decides how Dili attacks. Each run costs ${RUN_ENERGY_COST} energy.`,
  },
  {
    title: 'Pick a connection on the route',
    text: `A chapter is ${NODES.length} nodes long. At most battle nodes you choose one of three lanes — each card lists the enemies you will face.`,
  },
  {
    title: 'Watch Dili fight automatically',
    text: 'Attacks, skills and enemy turns resolve on their own. Pause or switch between ×1 and ×2 speed whenever you want.',
  },
  {
    title: 'Choose 1 of 3 skills',
    text: 'After most nodes you draft a skill. Pick skills from the same family so they trigger and boost each other.',
  },
  {
    title: 'Beat the boss, then get stronger',
    text: `Node ${NODES.length} is the chapter boss. Bits you earn are kept even if you lose — spend them on gear, upgrades and chests between runs.`,
  },
];

export const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: 'route',
    title: 'The run & route map',
    summary: `Every chapter follows the same ${NODES.length}-node route. Your HP carries over from node to node, so every fight matters.`,
    gallery: {
      style: 'scene',
      items: CHAPTERS.map((chapter) => ({
        label: chapter.name,
        caption: `Chapter ${chapter.order}`,
        image: CHAPTER_BACKGROUNDS[chapter.id],
      })),
    },
    entries: [
      { term: 'Battle', meta: `Nodes ${nodeNumbers('battle').join(', ')}`, text: `Normal enemies. From node 2 you pick one of three lanes (Data lane, Side channel, Open frequency) with different enemy lineups. Reward: ${NODE_REWARDS.battle.bits} Bits and a skill draft.` },
      { term: 'Event', meta: `Nodes ${nodeNumbers('event').join(', ')}`, text: 'An unknown signal with a short choice: Bits, healing, Shield, temporary stat buffs, a skill draft or an optional elite fight. Some choices cost HP or Bits — read before tapping.' },
      { term: 'Elite', meta: `Nodes ${nodeNumbers('elite').join(', ')}`, text: `A single strong Raid Bot with a random modifier (see Enemies). Reward: ${NODE_REWARDS.elite.bits} Bits and a draft with better Rare, Epic and Legendary odds.` },
      { term: 'Rest stop', meta: `Node ${nodeNumbers('rest')[0]}`, text: `Choose one: heal ${pct(REST_HEAL_FRACTION)} max HP, upgrade one skill by a rank, or prepare a Shield of ${pct(REST_SHIELD_FRACTION)} max HP for the next battle. A skill draft follows.` },
      { term: 'Signal Bazaar', meta: `Node ${bazaarNode}`, text: `A rest stop with a shop. Besides the rest options you can spend ${RUN_SHOP_COST} run Bits on a guaranteed Rare-or-better skill offer.` },
      { term: 'Boss', meta: `Node ${NODES.length}`, text: `The chapter boss. Victory pays ${NODE_REWARDS.boss.bits} Bits, drops a piece of equipment and unlocks the next chapter.` },
      { term: 'Shield between fights', text: 'Shield from skills and events disappears when a battle ends. Only the rest-stop Shield and event Shields carry into the next battle.' },
      { term: 'Chapters', text: `${CHAPTERS.length} chapters: ${list(CHAPTERS.map((chapter) => `${chapter.name} (${chapter.bossName})`))}. Each one is harder than the last and uses its own enemies and events. Beat a boss to unlock the next chapter.` },
    ],
  },
  {
    id: 'combat',
    title: 'How combat works',
    summary: 'You never aim or tap to attack. Each turn resolves in a fixed order, and your skills react to what happens.',
    entries: [
      { term: '1 · Basic attack', image: ASSETS.dili_attack, imageStyle: 'sprite', text: 'Dili attacks the enemy with the lowest HP. Weapons change this attack\'s name and add their own passive.' },
      { term: '2 · Combo', text: `Each Combo roll grants another free basic attack in the same turn, up to ${BASE_STATS.maxCombo} extra (skills can raise the cap to ${MAX_COMBO_CHAIN}). Base Combo chance is 0% — it comes from gear and skills.` },
      { term: '3 · Enemy turn', text: 'Each living enemy attacks Dili and may use its special ability.' },
      { term: '4 · Status tick', text: 'Status effects on every fighter count down by one turn.' },
      { term: '5 · Ultimate', image: ASSETS.dili_ultimate, imageStyle: 'sprite', text: 'If the DLI Overdrive meter is full (100 Rage), Dili unleashes an Ultimate that hits every enemy for 180% ATK.' },
      { term: 'Rage', text: `Each basic attack gives +${BASE_STATS.ragePerAttack} Rage and each direct hit Dili takes gives +10. The meter empties when the Ultimate fires.` },
      { term: 'Critical hit', text: `Basic attacks and Counters can crit for ×${BASE_STATS.critDamage} damage. Base chance ${pct(BASE_STATS.critRate)}.` },
      { term: 'Counter', text: 'When an enemy hits Dili directly, a Counter fires a free basic attack straight back. Base chance 0%.' },
      { term: 'Dodge', text: `Completely avoids a direct hit. Base chance ${pct(BASE_STATS.dodgeRate)}. Some attacks, such as NULL PULSE, cannot be dodged.` },
      { term: 'Shield', text: 'Absorbs damage before HP. It can never exceed max HP.' },
      { term: 'ATK & DEF', text: 'Damage = ATK × skill power × 100 ÷ (100 + target DEF). Higher DEF always reduces damage but never blocks it completely.' },
      { term: 'Lifesteal', text: 'Heals Dili for a share of the direct damage dealt.' },
      { term: 'Win & lose', image: ASSETS.dili_hurt, imageStyle: 'sprite', text: 'Defeat every enemy to win. The run ends if Dili reaches 0 HP. A fight still running after 150 turns times out as a defeat.' },
    ],
  },
  {
    id: 'statuses',
    title: 'Status effects',
    summary: 'Coloured chips under a health bar show active statuses and turns remaining. Tap a chip in battle to inspect it.',
    entries: [
      { term: 'Vulnerable', status: 'vulnerable', text: 'Takes extra damage (usually +10–20%). Skills apply it to enemies; Scam Link and Loop Phantom apply it to Dili.' },
      { term: 'Glitch', status: 'glitch', text: 'Deals 10% less damage. Moderation skills Glitch enemies; Bug and Null.exe Glitch Dili.' },
      { term: 'Silence', status: 'silence', text: 'On an enemy: blocks its special abilities (Timeout never silences bosses). On Dili: skill triggers stop firing — basic attacks and the Ultimate still work.' },
      { term: 'Marked', status: 'marked', text: 'Applied by Mark for Review. Permanent Ban consumes the Mark for a much bigger Ban Hammer.' },
      { term: 'Debuffed', text: 'An enemy with any status is "debuffed". Clean Packet and Community Notes deal extra damage to debuffed enemies.' },
    ],
  },
  {
    id: 'skills',
    title: 'Skills & drafting',
    summary: 'Skills are your build. They last for the current run only, so every run is a new chance to try something different.',
    entries: [
      { term: 'Choose 1 of 3', text: 'After battles, elites, rest stops and some events you pick one of three skill cards. Each card shows rarity, family and exact effect.' },
      { term: 'Rarity', text: `Common, Rare, Epic and Legendary. Normal draft odds: ${draftOdds}. Legendary skills change the rules of combat.` },
      { term: 'Elite drafts', text: `After an elite, Rare, Epic and Legendary cards are ×${ELITE_DRAFT_BONUS} as likely.` },
      { term: 'Bad-luck protection', text: `After ${DRAFT_PITY_THRESHOLD} drafts in a row with only Common cards, the next draft guarantees at least one Rare or better.` },
      { term: 'Reroll', text: `You have ${STARTING_REROLLS} reroll per run. It replaces all three cards with a new offer.` },
      { term: 'Synergy', text: 'Once you own 3 or more skills of a family, cards from that family appear more often. The Build panel names your leading family.' },
      { term: 'Prerequisites', text: 'Some skills only appear after you own another one — for example Triple Packet needs Double Packet, and Heavy Ban needs Ban Hammer.' },
      { term: 'Ranks', text: 'A few skills (such as Packet Boost) can be taken again for a stronger rank. The rest-stop upgrade also adds a rank.' },
      { term: 'Nothing left', text: `If no skill can be offered, you receive ${EMPTY_DRAFT_BITS} Bits instead.` },
    ],
  },
  {
    id: 'archetypes',
    title: 'Skill families',
    summary: `${SKILLS.length} skills in ${archetypes.length} families. Families unlock as your operator level rises.`,
    entries: archetypes.map((tag) => ({
      term: ARCHETYPE_LABELS[tag],
      meta: `Level ${archetypeLevel(tag)} · ${SKILLS.filter((skill) => skill.tags[0] === tag).length} skills`,
      image: SKILL_ART[tag],
      imageStyle: 'art' as const,
      text: `${ARCHETYPE_GUIDE[tag].role} Key skills: ${list(ARCHETYPE_GUIDE[tag].keySkills.map(skillName))}.`,
    })),
  },
  {
    id: 'enemies',
    title: 'Enemies & elites',
    summary: 'Enemy stats scale up through the route and with each chapter. Silence stops their special abilities.',
    entries: [
      ...CHAPTERS.flatMap((chapter) =>
        chapter.enemyPool
          .filter((enemy, index, pool) => pool.findIndex((other) => other.id === enemy.id) === index)
          .map((enemy): GuideEntry => ({
            term: enemy.name,
            meta: chapter.name,
            text: ENEMY_GUIDE[enemy.id],
            image: ENEMY_SPRITES[enemy.id],
            imageStyle: 'sprite',
          })),
      ).filter((entry, index, all) => all.findIndex((other) => other.term === entry.term) === index),
      {
        term: 'Elites',
        meta: 'Elite nodes',
        text: 'Every elite is a Raid Bot with one random modifier, shown under its name in battle and on the route card.',
        image: ENEMY_SPRITES.raid_bot,
        imageStyle: 'sprite',
      },
      ...Object.entries(ELITE_MODIFIER_GUIDE).map(([modifier, text]) => ({
        term: `${modifier} elite`,
        meta: 'Elite modifier',
        text,
      })),
    ],
  },
  {
    id: 'bosses',
    title: 'Bosses',
    summary: 'Boss warnings flash above the arena before big attacks. Each boss rewards a different build.',
    entries: CHAPTERS.map((chapter) => ({
      term: chapter.bossName,
      meta: `Chapter ${chapter.order} · ${chapter.name}`,
      text: BOSS_GUIDE[chapter.bossId],
      image: BOSS_ART[chapter.bossId],
      imageStyle: 'boss',
      backdrop: CHAPTER_BACKGROUNDS[chapter.id],
    })),
  },
  {
    id: 'gear',
    title: 'Equipment, shop & skins',
    summary: 'Equipment is permanent and carries into every run. Change it from Loadout between runs.',
    gallery: {
      style: 'portrait',
      items: SKINS.map((skin) => ({ label: skin.name, caption: 'Skin', image: DILI_SKIN_ASSETS[skin.id].idle })),
    },
    entries: [
      { term: 'Three slots', text: 'Weapon (attack style and combat passive), Armor (HP, DEF and defensive passives) and Module (utility such as Combo, Counter, Rage or boss damage).' },
      ...weapons.map((item): GuideEntry => ({
        term: item.name,
        meta: 'Weapon',
        text: `${item.description}.`,
        image: EQUIPMENT_ART[item.id],
        imageStyle: 'item',
      })),
      { term: 'Upgrades', text: `Each item goes from level 1 to ${UPGRADE_COSTS.length + 1}. Costs: ${UPGRADE_COSTS.join(' / ')} Bits. Each level adds 20% of the item's base ATK, HP and DEF; modules also gain +3 DEF per level.` },
      { term: 'Shop', text: `Buy a specific item you do not own: Common ${GEAR_PRICES.common}, Rare ${GEAR_PRICES.rare}, Epic ${GEAR_PRICES.epic}, Legendary ${GEAR_PRICES.legendary} Bits. It is equipped immediately.` },
      { term: 'Gear Chest', image: ASSETS.chest_gear, imageStyle: 'item', text: `${GEAR_CHEST_COST} Bits for a random item you do not own yet — cheaper than the shop, but you cannot choose.` },
      { term: 'Boss drops', text: `Each boss victory drops a random item. A duplicate becomes ${DUPLICATE_GEAR_BITS} Bits instead.` },
      { term: 'Skins', image: ASSETS.chest_skin, imageStyle: 'item', text: `${SKINS.length} Dili costumes (${list(SKINS.map((skin) => skin.name))}). A Skin Chest costs ${SKIN_CHEST_COST} Bits, unlocks one costume you do not own and equips it. Skins are cosmetic only.` },
    ],
  },
  {
    id: 'progress',
    title: 'Rewards, levels & energy',
    summary: 'Every run moves your account forward, win or lose.',
    entries: [
      { term: 'Run rewards', text: `Battle ${NODE_REWARDS.battle.bits} Bits / ${NODE_REWARDS.battle.xp} XP · Elite ${NODE_REWARDS.elite.bits} Bits / ${NODE_REWARDS.elite.xp} XP · Boss ${NODE_REWARDS.boss.bits} Bits / ${NODE_REWARDS.boss.xp} XP · Event or rest ${NONCOMBAT_NODE_XP} XP.` },
      { term: 'Keep what you earn', text: 'Bits and XP earned during a run are added to your account when it ends — even after a defeat.' },
      { term: 'Operator level', text: `Every ${XP_PER_LEVEL} XP raises your operator level, up to level ${MAX_ACCOUNT_LEVEL}. New levels unlock new skill families.` },
      { term: 'Energy', text: `A run costs ${RUN_ENERGY_COST} energy. You start with ${STARTING_ENERGY}, hold up to ${ENERGY_MAX}, and regain 1 every ${regenMinutes} minutes.` },
      { term: 'Daily check-in', text: `Claim +${DAILY_ENERGY_REWARD} energy once per day on the Home screen (you need room for it: ${ENERGY_MAX - DAILY_ENERGY_REWARD} energy or less).` },
      { term: 'Interrupted runs', text: `Closing the page ends the current run, but its ${RUN_ENERGY_COST} energy is returned the next time you open the game.` },
      { term: 'Score', text: 'Enemies defeated, elites cleared, victory and remaining HP all add to the run score. Your best score appears on Home.' },
      { term: 'Achievements', text: `${ACHIEVEMENTS.length} achievements to collect. Check them on the Records screen.` },
      { term: 'Saving', text: 'Progress saves automatically in this browser. Clearing site data or using a private window starts a fresh profile.' },
    ],
  },
  {
    id: 'controls',
    title: 'Screens & controls',
    summary: 'Everything works with taps or clicks. Nothing depends on hover or fast reflexes.',
    entries: [
      { term: 'Pause', text: 'Freezes the battle at any moment. Nothing is decided while paused.' },
      { term: '×1 / ×2 speed', text: 'Speeds up the battle presentation. The result is identical at either speed. Set the default in Settings.' },
      { term: 'Build', text: 'Opens your installed skills during a run. Tap a skill to read its effect.' },
      { term: 'Status chips', text: 'Tap a status under any health bar to see its name and remaining turns.' },
      { term: 'Combat log', text: 'The last few combat events are listed beside the arena.' },
      { term: 'Resume connection', text: 'Leaving a run from the menu keeps it in progress. Return to Home and tap Resume connection.' },
      { term: 'Settings', text: 'Music and sound volume, reduced motion (turns off screen shake and attack movement) and default battle speed.' },
    ],
  },
  {
    id: 'tips',
    title: 'Beginner tips',
    summary: 'Short answers to the questions new operators ask most.',
    entries: [
      { term: 'Focus on one family', text: 'Two or three skills that trigger each other beat five unrelated ones. Pick a direction by your third draft.' },
      { term: 'Watch your HP', text: 'HP does not refill between battles. If you are low before an elite, heal at the rest stop or pick safe event choices.' },
      { term: 'Crowds vs. single targets', text: 'Area damage (Viral, Mass Ban, Packet Overflow, the Ultimate) shines against groups and summoning bosses; Packet and Hammer burst shines against elites and bosses.' },
      { term: 'Save the reroll', text: 'Use your one reroll when a draft offers nothing for your build, ideally after an elite where the odds are better.' },
      { term: 'Lost a run?', text: 'You still keep the Bits and XP. Upgrade your weapon first — it affects every attack.' },
      { term: 'Stuck on a boss?', text: 'Read its pattern above, then try another weapon or skill family. A new build is often faster than a stronger one.' },
    ],
  },
];
