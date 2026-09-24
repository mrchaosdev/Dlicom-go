import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { ASSETS } from '../../content/assets';
import { getChapter } from '../../content/chapters';
import { useGame } from '../../stores/gameStore';
import { playSound } from '../../services/audio';
import type { Actor, CombatEvent } from '../combat/types';
import type { BattleSnapshot } from '../combat/CombatEngine';
import { eventDuration } from './presentation';

const BACKGROUND_PALETTES: Record<string, [number, number, number, number]> = {
  chapter_feed: [0x0d203c, 0x102947, 0x081321, 0x101525],
  chapter_dliclips: [0x201438, 0x2b1d55, 0x10152d, 0x17122c],
  chapter_rooms: [0x321b38, 0x4b2542, 0x17182b, 0x21172b],
  chapter_core: [0x091c35, 0x0c3150, 0x080e24, 0x12122d],
};
const BOSS_SPRITES: Record<string, { key: string; asset: string }> = {
  chapter_feed: { key: 'king', asset: ASSETS.enemy_boss_spam_king_idle },
  chapter_dliclips: { key: 'loop_phantom', asset: ASSETS.enemy_boss_loop_phantom_idle },
  chapter_rooms: { key: 'raid_master', asset: ASSETS.enemy_boss_raid_master_idle },
  chapter_core: { key: 'null_exe', asset: ASSETS.enemy_boss_null_exe_idle },
};

function drawChapterBackground(g: Phaser.GameObjects.Graphics, chapterId: string) {
  if (chapterId === 'chapter_feed') {
    for (let i = 0; i < 12; i++) {
      const x = i * 72 - 10, y = 105 + ((i * 43) % 110), h = 285 - y;
      g.fillStyle(0x132c46, 0.65).fillRoundedRect(x, y, 54, h, 3);
      g.lineStyle(1, 0x2a6581, 0.45).strokeRoundedRect(x, y, 54, h, 3);
      g.lineBetween(x, y + 13, x + 54, y + 13);
      for (let j = 0; j < 4; j++)
        g.fillStyle(j % 2 ? 0x74529e : 0x3184a0, 0.45).fillRect(x + 8, y + 25 + j * 22, 36, 3);
    }
    g.lineStyle(1, 0x27506b, 0.5);
    for (let x = -400; x < 1300; x += 110) g.lineBetween(380 + (x - 380) * 0.18, 280, x, 510);
    for (let y = 285; y < 510; y += 30) g.lineBetween(0, y, 760, y);
    g.lineStyle(2, 0x43d8e4, 0.3).strokeEllipse(200, 427, 235, 38);
    g.lineStyle(2, 0xba75e8, 0.25).strokeEllipse(565, 338, 270, 46);
  } else if (chapterId === 'chapter_dliclips') {
    for (let i = 0; i < 9; i++) {
      const x = 28 + i * 92, y = 112 + (i % 3) * 24;
      g.fillStyle(0x362956, 0.52).fillRoundedRect(x, y, 70, 136, 7);
      g.lineStyle(2, 0xd77fe6, 0.4).strokeRoundedRect(x, y, 70, 136, 7);
      g.fillStyle(i % 2 ? 0x62dedb : 0xff76ca, 0.4).fillCircle(x + 35, y + 49, 19);
      g.fillStyle(0xe8e6ff, 0.75).fillTriangle(x + 32, y + 41, x + 32, y + 58, x + 46, y + 49);
      g.fillStyle(0xd58fea, 0.45).fillRoundedRect(x + 12, y + 92, 46, 4, 2);
      g.fillStyle(0x74dfe2, 0.35).fillRoundedRect(x + 12, y + 104, 32, 4, 2);
    }
    g.lineStyle(3, 0xff74ca, 0.32).lineBetween(0, 440, 760, 440);
    for (let x = 20; x < 760; x += 46) g.fillStyle(0x8f72ee, 0.5).fillCircle(x, 440, 3);
    g.lineStyle(2, 0x74e9e1, 0.3).strokeCircle(555, 318, 132);
  } else if (chapterId === 'chapter_rooms') {
    for (let i = 0; i < 8; i++) {
      const x = 22 + i * 96, y = 112 + (i % 2) * 102;
      g.fillStyle(0x452a42, 0.48).fillRoundedRect(x, y, 80, 72, 10);
      g.lineStyle(2, 0xf1a16c, 0.35).strokeRoundedRect(x, y, 80, 72, 10);
      g.fillStyle(0xffc17a, 0.35).fillRoundedRect(x + 12, y + 17, 40, 5, 2);
      g.fillStyle(0x9ee9dc, 0.3).fillRoundedRect(x + 12, y + 31, 55, 5, 2);
      g.fillStyle(0xd47ba9, 0.3).fillRoundedRect(x + 12, y + 45, 32, 5, 2);
    }
    g.lineStyle(2, 0xeba06b, 0.3);
    for (let x = 60; x < 760; x += 130) g.lineBetween(x, 90, x + 50, 455);
    g.lineStyle(2, 0x7adbd4, 0.25).strokeEllipse(378, 425, 650, 78);
  } else {
    g.lineStyle(2, 0x53dce3, 0.27);
    for (let i = 0; i < 12; i++) {
      const y = 100 + i * 28, x = i % 2 ? 35 : 725;
      g.lineBetween(x, y, 380, 270 + (i % 3) * 35);
      g.fillStyle(i % 2 ? 0x9b72f2 : 0x5fe3e0, 0.42).fillCircle(x, y, 4);
    }
    g.lineStyle(2, 0xa477f4, 0.3).strokeCircle(380, 292, 142).strokeCircle(380, 292, 111);
    g.lineStyle(1, 0x5fe3e0, 0.25);
    for (let x = 40; x < 760; x += 40) g.lineBetween(x, 460, x, 510);
    for (let y = 465; y < 510; y += 12) g.lineBetween(0, y, 760, y);
  }
}

class BattleScene extends Phaser.Scene {
  private sprites = new Map<string, Phaser.GameObjects.Image>();
  private queue: CombatEvent[] = [];
  private wait = 0;
  private numbers: Phaser.GameObjects.Text[] = [];
  private numberIndex = 0;
  private projectile!: Phaser.GameObjects.Arc;
  private impactRing!: Phaser.GameObjects.Arc;
  private label!: Phaser.GameObjects.Text;
  private ring!: Phaser.GameObjects.Arc;
  private ready = false;
  constructor(private readonly chapterId: string) {
    super('battle');
  }
  preload() {
    this.load.image('dili_idle', ASSETS.dili_idle);
    this.load.svg('bot', ASSETS.enemy_spam_bot_idle);
    const bossSprite = BOSS_SPRITES[this.chapterId];
    this.load.svg(bossSprite.key, bossSprite.asset);
  }
  create() {
    const chapter = getChapter(this.chapterId);
    const [topLeft, topRight, bottomLeft, bottomRight] = BACKGROUND_PALETTES[this.chapterId];
    const g = this.add.graphics();
    g.fillGradientStyle(topLeft, topRight, bottomLeft, bottomRight, 1);
    g.fillRect(0, 0, 760, 510);
    drawChapterBackground(g, this.chapterId);
    this.add.text(24, 25, `${chapter.name.toUpperCase()} / SECTOR ${String(chapter.order).padStart(2, '0')}`, {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#6d99b3',
    });
    this.add
      .text(733, 25, '● LIVE', { fontFamily: 'monospace', fontSize: '12px', color: '#62e6bd' })
      .setOrigin(1, 0);
    this.projectile = this.add.circle(0, 0, 6, 0x7bffff).setVisible(false).setDepth(15);
    this.impactRing = this.add
      .circle(0, 0, 18)
      .setStrokeStyle(4, 0x76f5ff)
      .setVisible(false)
      .setDepth(16);
    this.ring = this.add
      .circle(200, 290, 30)
      .setStrokeStyle(5, 0x76f5ff)
      .setVisible(false)
      .setDepth(14);
    this.label = this.add
      .text(380, 82, '', {
        fontFamily: 'monospace',
        fontSize: '20px',
        fontStyle: 'bold',
        color: '#d2fbff',
        backgroundColor: '#152941',
        padding: { x: 14, y: 10 },
      })
      .setOrigin(0.5)
      .setDepth(30)
      .setAlpha(0);
    for (let i = 0; i < 18; i++)
      this.numbers.push(
        this.add
          .text(0, 0, '', {
            fontFamily: 'Arial',
            fontSize: '24px',
            fontStyle: 'bold',
            stroke: '#071221',
            strokeThickness: 5,
          })
          .setOrigin(0.5)
          .setDepth(25)
          .setVisible(false),
      );
    this.ready = true;
    const state = useGame.getState();
    if (state.snapshot) this.sync(state.snapshot);
  }
  private spawn(actor: Actor, index: number) {
    const hero = actor.id === 'dili';
    const boss = actor.tier === 'boss';
    if (boss) playSound('boss_intro');
    const x = hero ? 197 : 510 + (index % 2) * 120;
    const y = hero ? 303 : 244 + (index % 2) * 59;
    const bossKeys: Record<string, string> = {
      boss_spam_king: 'king',
      boss_loop_phantom: 'loop_phantom',
      boss_raid_master: 'raid_master',
      boss_null_exe: 'null_exe',
    };
    const sprite = this.add.image(x, y, hero ? 'dili_idle' : boss ? bossKeys[actor.kind] ?? 'king' : 'bot');
    const size = hero ? 230 : boss ? 205 : 123;
    sprite
      .setDisplaySize(size, (size * sprite.height) / sprite.width)
      .setDepth(hero ? 5 : 4 + index);
    if (actor.kind === 'scam_link') sprite.setTint(0xffcc99);
    if (actor.kind === 'bug') sprite.setTint(0xa3ffbb);
    if (actor.tier === 'elite') sprite.setTint(0xffb080);
    this.sprites.set(actor.id, sprite);
  }
  sync(snapshot: BattleSnapshot) {
    if (!this.ready) return;
    [snapshot.hero, ...snapshot.enemies].forEach((actor, i) => {
      if (!this.sprites.has(actor.id)) this.spawn(actor, Math.max(0, i - 1));
    });
  }
  enqueue(events: CombatEvent[]) {
    this.queue.push(...events.filter((e) => e.type !== 'rage'));
    this.queue = this.queue.slice(0, 200);
  }
  private floating(target: Phaser.GameObjects.Image, event: CombatEvent) {
    const text = this.numbers[this.numberIndex++ % this.numbers.length];
    this.tweens.killTweensOf(text);
    const message =
      event.type === 'damage'
        ? `${event.crit ? 'CRIT ' : ''}${event.amount}`
        : event.type === 'dodge'
          ? 'DODGE'
          : event.type === 'status'
            ? event.label.toUpperCase()
            : `+${event.amount} ${event.type.toUpperCase()}`;
    text
      .setText(message)
      .setFontSize(event.crit ? 31 : 22)
      .setColor(
        event.type === 'heal'
          ? '#8affb6'
          : event.type === 'shield'
            ? '#72e5ff'
            : event.crit
              ? '#ffd773'
              : '#ffffff',
      )
      .setPosition(target.x, target.y - 80)
      .setAlpha(1)
      .setVisible(true);
    this.tweens.add({
      targets: text,
      y: text.y - 40,
      alpha: 0,
      duration: 700,
      onComplete: () => text.setVisible(false),
    });
  }
  private present(event: CombatEvent) {
    const target = this.sprites.get(event.target),
      source = this.sprites.get(event.source);
    const reduced = useGame.getState().save.settings.reducedMotion;
    if (event.type === 'warning' || event.type === 'ultimate') {
      this.tweens.killTweensOf(this.label);
      this.label.setText(event.label).setAlpha(1);
      this.tweens.add({ targets: this.label, alpha: 0, delay: 450, duration: 250 });
      if (event.type === 'ultimate') {
        playSound('ultimate');
        this.ring.setVisible(true).setScale(1).setAlpha(0.9);
        this.tweens.add({ targets: this.ring, scale: reduced ? 3 : 18, alpha: 0, duration: 700 });
        if (!reduced) this.cameras.main.shake(200, 0.012);
      }
    }
    if (!target) return;
    if (event.type === 'damage') {
      playSound(event.crit ? 'crit' : 'attack');
      this.tweens.killTweensOf(this.impactRing);
      this.impactRing
        .setPosition(target.x, target.y)
        .setStrokeStyle(event.crit ? 5 : 3, event.crit ? 0xffd773 : 0x76f5ff)
        .setScale(0.35)
        .setAlpha(0.95)
        .setVisible(true);
      this.tweens.add({
        targets: this.impactRing,
        scale: event.crit ? 3.2 : 2.4,
        alpha: 0,
        duration: event.crit ? 190 : 130,
        onComplete: () => this.impactRing.setVisible(false),
      });
      if (event.crit && !reduced) this.cameras.main.shake(90, 0.005);
      if (source && !reduced) {
        this.tweens.add({
          targets: source,
          x: source.x + (source.x < target.x ? 8 : -8),
          duration: 65,
          yoyo: true,
        });
        this.projectile.setPosition(source.x, source.y).setVisible(true).setAlpha(1);
        this.tweens.add({
          targets: this.projectile,
          x: target.x,
          y: target.y,
          duration: 140,
          onComplete: () => this.projectile.setVisible(false),
        });
      }
      if (!reduced) this.tweens.add({ targets: target, angle: 5, duration: 70, yoyo: true });
      this.floating(target, event);
    } else if (event.type === 'dodge' || event.type === 'heal' || event.type === 'shield') {
      playSound(event.type);
      this.floating(target, event);
    } else if (['status', 'revive'].includes(event.type))
      this.floating(target, event);
    else if (event.type === 'death') {
      playSound('death');
      this.tweens.add({ targets: target, alpha: 0, duration: reduced ? 100 : 300 });
    } else if (event.type === 'summon') target.setAlpha(1);
  }
  update(_time: number, delta: number) {
    const state = useGame.getState();
    this.tweens.timeScale = state.paused ? 0 : state.speed;
    if (state.paused) return;
    this.wait -= Math.min(delta, 100) * state.speed;
    if (this.wait <= 0 && this.queue.length) {
      const event = this.queue.shift()!;
      this.present(event);
      this.wait = eventDuration(event);
    }
  }
}
export default function BattleCanvas() {
  const parent = useRef<HTMLDivElement>(null);
  const scene = useRef<BattleScene | null>(null);
  const sequence = useGame((s) => s.sequence);
  const chapterId = useGame((s) => s.run?.chapterId ?? 'chapter_feed');
  useEffect(() => {
    const current = new BattleScene(chapterId);
    scene.current = current;
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: parent.current!,
      width: 760,
      height: 510,
      transparent: true,
      scene: current,
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      render: { antialias: true },
      audio: { noAudio: true },
      banner: false,
    });
    return () => {
      game.destroy(true);
      scene.current = null;
    };
  }, [chapterId]);
  useEffect(() => {
    const state = useGame.getState();
    if (state.snapshot) scene.current?.sync(state.snapshot);
    scene.current?.enqueue(state.events);
  }, [sequence]);
  return (
    <div
      className="battle-canvas"
      ref={parent}
      role="img"
      aria-label={`Dili automatically battles in ${getChapter(chapterId).name}`}
    />
  );
}
