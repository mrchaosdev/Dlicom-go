export const ACHIEVEMENT_IDS = {
  firstBattle: 'first_login',
  firstBoss: 'feed_cleaner',
} as const;

export const ACHIEVEMENTS = [
  {
    id: ACHIEVEMENT_IDS.firstBattle,
    name: 'First Login',
    description: 'Clear your first battle.',
  },
  {
    id: ACHIEVEMENT_IDS.firstBoss,
    name: 'Feed Cleaner',
    description: 'Defeat the Spam King.',
  },
] as const;
