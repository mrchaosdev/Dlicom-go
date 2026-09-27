import type { Archetype } from '../game/combat/types';
import { weaponAttackStyle } from './equipment';
import type { SkinId } from './skins';

const asset = (file: string) => `${import.meta.env.BASE_URL}assets/${file}`;
export const ASSETS = {
  background_feed_city: asset('background-feed-city.webp'),
  background_dliclip_stream: asset('background-dliclip-stream.webp'),
  background_dili_rooms: asset('background-dili-rooms.webp'),
  background_core_network: asset('background-core-network.webp'),
  dili_idle: asset('dili-idle.webp'),
  dili_attack: asset('dili-attack.webp'),
  dili_sword_idle: asset('dili-sword-idle.webp'),
  dili_sword_attack: asset('dili-sword-attack.webp'),
  dili_hammer_idle: asset('dili-hammer-idle.webp'),
  dili_hammer_attack: asset('dili-hammer-attack.webp'),
  dili_hurt: asset('dili-hurt.webp'),
  dili_ultimate: asset('dili-ultimate.webp'),
  skill_packet: asset('skill-packet.webp'),
  skill_hammer: asset('skill-hammer.webp'),
  skill_firewall: asset('skill-firewall.webp'),
  skill_moderation: asset('skill-moderation.webp'),
  skill_encryption: asset('skill-encryption.webp'),
  skill_viral: asset('skill-viral.webp'),
  skill_rage: asset('skill-rage.webp'),
  skill_heal: asset('skill-heal.webp'),
  chest_gear: asset('chest-gear.webp'),
  chest_skin: asset('chest-skin.webp'),
  enemy_bot_placeholder: asset('spam-bot.svg'),
  enemy_spam_bot_idle: asset('spam-bot.webp'),
  enemy_scam_link_idle: asset('scam-link.webp'),
  enemy_bug_idle: asset('bug.webp'),
  enemy_raid_bot_idle: asset('raid-bot.webp'),
  enemy_fake_account_idle: asset('fake-account.webp'),
  enemy_data_leech_idle: asset('data-leech.webp'),
  enemy_corrupted_clip_idle: asset('corrupted-clip.webp'),
  enemy_toxic_reply_idle: asset('toxic-reply.webp'),
  enemy_popup_idle: asset('popup.webp'),
  enemy_null_fragment_idle: asset('null-fragment.webp'),
  enemy_boss_spam_king_idle: asset('spam-king.webp'),
  enemy_boss_loop_phantom_idle: asset('loop-phantom.webp'),
  enemy_boss_raid_master_idle: asset('raid-master.webp'),
  enemy_boss_null_exe_idle: asset('null-exe.webp'),
  music_feed: asset('feed-loop.mp3'),
  music_dliclips: asset('dliclips-loop.mp3'),
  music_rooms: asset('rooms-loop.mp3'),
  music_core: asset('core-loop.mp3'),
  sfx_attack: asset('attack.mp3'),
  sfx_crit: asset('crit.mp3'),
  sfx_ultimate: asset('ultimate.mp3'),
  sfx_select: asset('select.mp3'),
  sfx_dodge: asset('dodge.mp3'),
  sfx_heal: asset('heal.mp3'),
  sfx_shield: asset('shield.mp3'),
  sfx_death: asset('death.mp3'),
  sfx_boss_intro: asset('boss-intro.mp3'),
  sfx_victory: asset('victory.mp3'),
  sfx_defeat: asset('defeat.mp3'),
  sfx_reward: asset('reward.mp3'),
  sfx_legendary: asset('legendary.mp3'),
  sfx_hammer: asset('hammer.mp3'),
  sfx_sword: asset('sword.mp3'),
  sfx_shield_break: asset('shield-break.mp3'),
  sfx_boss_king_attack: asset('boss-king-attack.mp3'),
  sfx_boss_phantom_attack: asset('boss-phantom-attack.mp3'),
  sfx_boss_raid_attack: asset('boss-raid-attack.mp3'),
  sfx_boss_null_attack: asset('boss-null-attack.mp3'),
};

export const CHAPTER_BACKGROUNDS: Record<string, string> = {
  chapter_feed: ASSETS.background_feed_city,
  chapter_dliclips: ASSETS.background_dliclip_stream,
  chapter_rooms: ASSETS.background_dili_rooms,
  chapter_core: ASSETS.background_core_network,
};

export const ENEMY_SPRITES: Record<string, string> = {
  spam_bot: ASSETS.enemy_spam_bot_idle,
  scam_link: ASSETS.enemy_scam_link_idle,
  bug: ASSETS.enemy_bug_idle,
  raid_bot: ASSETS.enemy_raid_bot_idle,
  fake_account: ASSETS.enemy_fake_account_idle,
  data_leech: ASSETS.enemy_data_leech_idle,
  corrupted_clip: ASSETS.enemy_corrupted_clip_idle,
  toxic_reply: ASSETS.enemy_toxic_reply_idle,
  popup: ASSETS.enemy_popup_idle,
  null_fragment: ASSETS.enemy_null_fragment_idle,
};

export const BOSS_ART: Record<string, string> = {
  boss_spam_king: ASSETS.enemy_boss_spam_king_idle,
  boss_loop_phantom: ASSETS.enemy_boss_loop_phantom_idle,
  boss_raid_master: ASSETS.enemy_boss_raid_master_idle,
  boss_null_exe: ASSETS.enemy_boss_null_exe_idle,
};

export const SKILL_ART: Record<Archetype, string> = {
  packet: ASSETS.skill_packet,
  hammer: ASSETS.skill_hammer,
  firewall: ASSETS.skill_firewall,
  moderation: ASSETS.skill_moderation,
  encryption: ASSETS.skill_encryption,
  viral: ASSETS.skill_viral,
  rage: ASSETS.skill_rage,
  heal: ASSETS.skill_heal,
};

export const EQUIPMENT_ART: Record<string, string> = {
  weapon_packet_blaster: asset('equipment/weapon-packet-blaster.webp'),
  weapon_moderator_hammer: asset('equipment/weapon-moderator-hammer.webp'),
  weapon_overdrive_core: asset('equipment/weapon-overdrive-core.webp'),
  weapon_viral_launcher: asset('equipment/weapon-viral-launcher.webp'),
  weapon_encryption_blade: asset('equipment/weapon-encryption-blade.webp'),
  weapon_dliclip_cannon: asset('equipment/weapon-dliclip-cannon.webp'),
  armor_firewall_shell: asset('equipment/armor-firewall-shell.webp'),
  armor_creator_hoodie: asset('equipment/armor-creator-hoodie.webp'),
  armor_zero_knowledge_cloak: asset('equipment/armor-zero-knowledge-cloak.webp'),
  armor_moderator_vest: asset('equipment/armor-moderator-vest.webp'),
  armor_antispam_plating: asset('equipment/armor-antispam-plating.webp'),
  armor_core_armor: asset('equipment/armor-core-armor.webp'),
  module_viral_chip: asset('equipment/module-viral-chip.webp'),
  module_combo_router: asset('equipment/module-combo-router.webp'),
  module_counter_protocol: asset('equipment/module-counter-protocol.webp'),
  module_rage_cache: asset('equipment/module-rage-cache.webp'),
  module_safe_mode: asset('equipment/module-safe-mode.webp'),
  module_trust: asset('equipment/module-trust.webp'),
};

export type DiliPose = 'idle' | 'attack' | 'sword_idle' | 'sword_attack' | 'hammer_idle' | 'hammer_attack' | 'hurt' | 'ultimate';
const costumeAssetSet = (name: string): Record<DiliPose, string> => ({
  idle: asset(`dili-skin-${name}-idle.webp`),
  attack: asset(`dili-skin-${name}-attack.webp`),
  sword_idle: asset(`dili-skin-${name}-sword-idle.webp`),
  sword_attack: asset(`dili-skin-${name}-sword-attack.webp`),
  hammer_idle: asset(`dili-skin-${name}-hammer-idle.webp`),
  hammer_attack: asset(`dili-skin-${name}-hammer-attack.webp`),
  hurt: asset(`dili-skin-${name}-hurt.webp`),
  ultimate: asset(`dili-skin-${name}-ultimate.webp`),
});
export const DILI_SKIN_ASSETS: Record<SkinId, Record<DiliPose, string>> = {
  signal_blue: {
    idle: ASSETS.dili_idle,
    attack: ASSETS.dili_attack,
    sword_idle: ASSETS.dili_sword_idle,
    sword_attack: ASSETS.dili_sword_attack,
    hammer_idle: ASSETS.dili_hammer_idle,
    hammer_attack: ASSETS.dili_hammer_attack,
    hurt: ASSETS.dili_hurt,
    ultimate: ASSETS.dili_ultimate,
  },
  neon_rose: costumeAssetSet('rose'),
  solar_circuit: costumeAssetSet('solar'),
  jade_glitch: costumeAssetSet('jade'),
};

export interface DiliWeaponPoseSet {
  idle: string;
  attack: string;
  hurt: string;
  ultimate: string;
}
const rangedVariantAssetSet = (skin: string) => ({
  weapon_overdrive_core: {
    idle: asset(`dili-weapon-overdrive-${skin}-idle.webp`),
    attack: asset(`dili-weapon-overdrive-${skin}-attack.webp`),
  },
  weapon_viral_launcher: {
    idle: asset(`dili-weapon-viral-${skin}-idle.webp`),
    attack: asset(`dili-weapon-viral-${skin}-attack.webp`),
  },
  weapon_dliclip_cannon: {
    idle: asset(`dili-weapon-dliclip-${skin}-idle.webp`),
    attack: asset(`dili-weapon-dliclip-${skin}-attack.webp`),
  },
});
const RANGED_WEAPON_VARIANTS: Record<SkinId, Record<string, { idle: string; attack: string }>> = {
  signal_blue: rangedVariantAssetSet('signal'),
  neon_rose: rangedVariantAssetSet('rose'),
  solar_circuit: rangedVariantAssetSet('solar'),
  jade_glitch: rangedVariantAssetSet('jade'),
};
export function diliWeaponPoses(skinId: SkinId, weaponId: string): DiliWeaponPoseSet {
  const costume = DILI_SKIN_ASSETS[skinId];
  const style = weaponAttackStyle(weaponId);
  if (style === 'blade')
    return { idle: costume.sword_idle, attack: costume.sword_attack, hurt: costume.sword_idle, ultimate: costume.sword_attack };
  if (style === 'hammer')
    return { idle: costume.hammer_idle, attack: costume.hammer_attack, hurt: costume.hammer_idle, ultimate: costume.hammer_attack };
  if (weaponId === 'weapon_packet_blaster')
    return { idle: costume.idle, attack: costume.attack, hurt: costume.hurt, ultimate: costume.ultimate };
  const variant = RANGED_WEAPON_VARIANTS[skinId][weaponId];
  if (!variant) throw new Error(`Missing Dili ranged weapon art for ${skinId}:${weaponId}`);
  return { ...variant, hurt: variant.idle, ultimate: variant.attack };
}
