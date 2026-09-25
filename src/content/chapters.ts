export interface ChapterDefinition {
  id: string;
  name: string;
  theme: string;
  order: number;
  bossId: string;
  bossName: string;
  bossDescription: string;
  bossHp: number;
  bossAtk: number;
  multiplier: number;
  eliteHp: number;
  eliteAtk: number;
  enemyPool: { id: string; name: string; hp: number; atk: number; def: number }[];
}

export const CHAPTERS: ChapterDefinition[] = [
  {
    id: 'chapter_feed', name: 'The Feed', theme: 'A social feed corrupted by endless spam.', order: 1,
    bossId: 'boss_spam_king', bossName: 'Spam King', bossDescription: 'Summons bots every 3 turns. Spam Flood every 5. Enrages below 30% HP.', bossHp: 1800, bossAtk: 30, multiplier: 1, eliteHp: 650, eliteAtk: 40,
    enemyPool: [
      { id: 'spam_bot', name: 'Spam Bot', hp: 400, atk: 24, def: 12 },
      { id: 'scam_link', name: 'Scam Link', hp: 360, atk: 26, def: 16 },
      { id: 'bug', name: 'Bug', hp: 240, atk: 32, def: 8 },
    ],
  },
  {
    id: 'chapter_dliclips', name: 'DliClips', theme: 'A viral short-video stream stuck in a corrupted loop.', order: 2,
    bossId: 'boss_loop_phantom', bossName: 'Loop Phantom', bossDescription: 'Repeats its last move, marks Dili, and rewinds part of its HP once.', bossHp: 1400, bossAtk: 26, multiplier: 1.35, eliteHp: 500, eliteAtk: 34,
    enemyPool: [
      { id: 'fake_account', name: 'Fake Account', hp: 350, atk: 26, def: 12 },
      { id: 'data_leech', name: 'Data Leech', hp: 390, atk: 24, def: 14 },
      { id: 'corrupted_clip', name: 'Corrupted Clip', hp: 300, atk: 28, def: 10 },
    ],
  },
  {
    id: 'chapter_rooms', name: 'Dili Rooms', theme: 'Community rooms flooded by a hostile raid.', order: 3,
    bossId: 'boss_raid_master', bossName: 'Raid Master', bossDescription: 'Commands two minions, reinforces their shield, and Silences Dili.', bossHp: 1050, bossAtk: 22, multiplier: 1.8, eliteHp: 400, eliteAtk: 30,
    enemyPool: [
      { id: 'toxic_reply', name: 'Toxic Reply', hp: 300, atk: 26, def: 14 },
      { id: 'popup', name: 'Pop-up', hp: 340, atk: 24, def: 18 },
      { id: 'raid_bot', name: 'Raid Bot', hp: 380, atk: 30, def: 18 },
    ],
  },
  {
    id: 'chapter_core', name: 'Core Network', theme: 'A corrupted cyber infrastructure surrounding the system core.', order: 4,
    bossId: 'boss_null_exe', bossName: 'Null.exe', bossDescription: 'Glitch field at 60%, overclock below 25%, and an unavoidable NULL PULSE.', bossHp: 940, bossAtk: 12, multiplier: 2.4, eliteHp: 295, eliteAtk: 23,
    enemyPool: [
      { id: 'null_fragment', name: 'Null Fragment', hp: 230, atk: 20, def: 45 },
      { id: 'data_leech', name: 'Data Leech', hp: 270, atk: 18, def: 28 },
      { id: 'corrupted_clip', name: 'Corrupted Clip', hp: 210, atk: 23, def: 24 },
    ],
  },
];
export function getChapter(id: string) {
  const chapter = CHAPTERS.find(c => c.id === id);
  if (!chapter) throw new Error(`Unknown chapter: ${id}`);
  return chapter;
}
