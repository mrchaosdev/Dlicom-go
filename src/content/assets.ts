const asset = (file: string) => `${import.meta.env.BASE_URL}assets/${file}`;
export const ASSETS = {
  dili_idle: asset('dili-idle.png'),
  enemy_spam_bot_idle: asset('spam-bot.svg'),
  enemy_boss_spam_king_idle: asset('spam-king.svg'),
  enemy_boss_loop_phantom_idle: asset('loop-phantom.svg'),
  enemy_boss_raid_master_idle: asset('raid-master.svg'),
  enemy_boss_null_exe_idle: asset('null-exe.svg'),
  music_feed: asset('feed-loop.wav'),
  music_dliclips: asset('dliclips-loop.wav'),
  music_rooms: asset('rooms-loop.wav'),
  music_core: asset('core-loop.wav'),
  sfx_attack: asset('attack.wav'),
  sfx_crit: asset('crit.wav'),
  sfx_ultimate: asset('ultimate.wav'),
  sfx_select: asset('select.wav'),
};
