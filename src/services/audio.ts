import { Howl } from 'howler';
import { ASSETS } from '../content/assets';
import type { SaveFile } from './save';
let music: Howl | undefined;
let sounds: Record<string, Howl> = {};
let enabled = false;
export function startAudio(settings: SaveFile['settings']) {
  if (!enabled) {
    enabled = true;
    music = new Howl({ src: [ASSETS.music_feed], loop: true, volume: settings.music });
    sounds = Object.fromEntries(
      ['attack', 'crit', 'ultimate', 'select'].map((name) => [
        name,
        new Howl({
          src: [ASSETS[`sfx_${name}` as keyof typeof ASSETS]],
          volume: settings.sfx,
          pool: 8,
        }),
      ]),
    );
    music.play();
  }
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
  if (hidden) music?.pause();
  else if (enabled && !music?.playing()) music?.play();
}
