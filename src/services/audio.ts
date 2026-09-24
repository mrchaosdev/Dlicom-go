import { Howl } from 'howler';
import { ASSETS } from '../content/assets';
import type { SaveFile } from './save';
let music: Howl | undefined;
let sounds: Record<string, Howl> = {};
let enabled = false;
let suspended = false;
let musicChapter = 'chapter_feed';
const MUSIC_BY_CHAPTER: Record<string, string> = {
  chapter_feed: ASSETS.music_feed,
  chapter_dliclips: ASSETS.music_dliclips,
  chapter_rooms: ASSETS.music_rooms,
  chapter_core: ASSETS.music_core,
};

function loadMusic(volume: number) {
  music = new Howl({ src: [MUSIC_BY_CHAPTER[musicChapter] ?? ASSETS.music_feed], loop: true, volume });
  if (!suspended) music.play();
}

export function startAudio(settings: SaveFile['settings'], chapterId?: string) {
  if (!enabled) {
    enabled = true;
    sounds = Object.fromEntries(
      ['attack', 'crit', 'ultimate', 'select', 'dodge', 'heal', 'shield', 'death', 'boss_intro', 'victory', 'defeat'].map((name) => [
        name,
        new Howl({
          src: [ASSETS[`sfx_${name}` as keyof typeof ASSETS]],
          volume: settings.sfx,
          pool: 8,
        }),
      ]),
    );
  }
  const nextChapter = chapterId && chapterId in MUSIC_BY_CHAPTER ? chapterId : musicChapter;
  if (nextChapter !== musicChapter) {
    music?.stop();
    music?.unload();
    musicChapter = nextChapter;
    music = undefined;
  }
  if (!music) loadMusic(settings.music);
  updateAudio(settings);
}
export function updateAudio(settings: SaveFile['settings']) {
  music?.volume(settings.music);
  Object.values(sounds).forEach((sound) => sound.volume(settings.sfx));
}
export function playSound(name: string) {
  sounds[name]?.play();
}
export function suspendAudio(hidden: boolean) {
  suspended = hidden;
  if (hidden) music?.pause();
  else if (enabled && !music?.playing()) music?.play();
}
