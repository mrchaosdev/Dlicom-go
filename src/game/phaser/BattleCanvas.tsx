import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { ASSETS } from '../../content/assets';
import { getChapter } from '../../content/chapters';
import { useGame } from '../../stores/gameStore';
import { playBossAttackSound, playSound } from '../../services/audio';
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
const PARALLAX_COLORS: Record<string, number> = {
  chapter_feed: 0x46c5d9,
  chapter_dliclips: 0xdd72d1,
  chapter_rooms: 0xf0a16e,
  chapter_core: 0x8d88fa,
};
const BOSS_ATTACK_COLORS: Record<string, number> = {
  boss_spam_king: 0xff8a6d,
  boss_loop_phantom: 0xc879ff,
  boss_raid_master: 0xf0a16e,
  boss_null_exe: 0x8d88fa,
};
const STATUS_COLORS: Record<string, number> = {
  burn: 0xff9858,
  glitch: 0xb67cff,
  vulnerable: 0xff78c8,
  silence: 0x7bb9ff,
  slow: 0x65d9d1,
  marked: 0xffd773,
  corrupted: 0xd081ff,
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
  private skillImpact!: Phaser.GameObjects.Image;
  private label!: Phaser.GameObjects.Text;
  private ring!: Phaser.GameObjects.Arc;
  private bossWarningRing!: Phaser.GameObjects.Arc;
  private lowHpAura!: Phaser.GameObjects.Arc;
  private lowHpActive = false;
  private heroPoseWait = 0;
  private outcomePosePending: 'victory' | 'defeat' | null = null;
  private outcomePoseShown = false;
  private parallaxLayers: { sprite: Phaser.GameObjects.TileSprite; speed: number }[] = [];
  private ready = false;
  constructor(private readonly chapterId: string) {
    super('battle');
  }
  preload() {
    this.load.image('dili_idle', ASSETS.dili_idle);
    this.load.image('dili_attack', ASSETS.dili_attack);
    this.load.image('dili_hurt', ASSETS.dili_hurt);
    this.load.image('dili_ultimate', ASSETS.dili_ultimate);
    this.load.image('skill_hammer', ASSETS.skill_hammer);
    this.load.image('skill_viral', ASSETS.skill_viral);
    this.load.svg('bot', ASSETS.enemy_spam_bot_idle);
    const bossSprite = BOSS_SPRITES[this.chapterId];
    this.load.svg(bossSprite.key, bossSprite.asset);
  }
  private addParallaxLayer(name: string, color: number, alpha: number, speed: number, offset: number) {
    const graphics = this.make.graphics({ x: 0, y: 0 }, false);
    graphics.lineStyle(1, color, 0.34);
    for (let row = 0; row < 8; row++) {
      for (let column = 0; column < 8; column++) {
        const x = column * 32 + ((row + offset) % 2) * 16;
        const y = row * 32;
        graphics.fillStyle(color, 0.56).fillCircle(x % 256, y, offset ? 1.2 : 1.8);
        graphics.lineBetween(x, y, x + 32, y);
        if ((row + column + offset) % 2 === 0) graphics.lineBetween(x, y, x + 16, y + 32);
      }
    }
    graphics.generateTexture(name, 256, 256);
    graphics.destroy();
    const sprite = this.add.tileSprite(380, 255, 760, 510, name).setAlpha(alpha).setDepth(1);
    this.parallaxLayers.push({ sprite, speed });
  }
  create() {
    const chapter = getChapter(this.chapterId);
    const [topLeft, topRight, bottomLeft, bottomRight] = BACKGROUND_PALETTES[this.chapterId];
    const g = this.add.graphics();
    g.fillGradientStyle(topLeft, topRight, bottomLeft, bottomRight, 1);
    g.fillRect(0, 0, 760, 510);
    drawChapterBackground(g, this.chapterId);
    const accent = PARALLAX_COLORS[this.chapterId];
    this.addParallaxLayer(`${this.chapterId}_far_grid`, accent, 0.12, 2, 0);
    this.addParallaxLayer(`${this.chapterId}_near_grid`, accent, 0.08, 6, 1);
    this.add
      .text(24, 25, `${chapter.name.toUpperCase()} / SECTOR ${String(chapter.order).padStart(2, '0')}`, {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#6d99b3',
      })
      .setDepth(2);
    this.add
      .text(733, 25, '● LIVE', { fontFamily: 'monospace', fontSize: '12px', color: '#62e6bd' })
      .setOrigin(1, 0)
      .setDepth(2);
    this.projectile = this.add.circle(0, 0, 6, 0x7bffff).setVisible(false).setDepth(15);
    this.impactRing = this.add
      .circle(0, 0, 18)
      .setStrokeStyle(4, 0x76f5ff)
      .setVisible(false)
      .setDepth(16);
    this.skillImpact = this.add.image(0, 0, 'skill_hammer').setVisible(false).setDepth(18);
    this.ring = this.add
      .circle(200, 290, 30)
      .setStrokeStyle(5, 0x76f5ff)
      .setVisible(false)
      .setDepth(14);
    this.bossWarningRing = this.add
      .circle(0, 0, 36)
      .setStrokeStyle(4, 0xff68c8)
      .setVisible(false)
      .setDepth(14);
    this.lowHpAura = this.add
      .circle(197, 315, 106)
      .setStrokeStyle(4, 0xff5577, 0.7)
      .setScale(0.85)
      .setAlpha(0.3)
      .setVisible(false)
      .setDepth(6);
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
    if (!useGame.getState().save.settings.reducedMotion) {
      const restingScale = sprite.scaleY;
      this.tweens.add({
        targets: sprite,
        scaleY: restingScale * (boss ? 1.04 : 1.018),
        duration: boss ? 1500 : 2100,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.InOut',
      });
    }
    if (actor.kind === 'scam_link') sprite.setTint(0xffcc99);
    if (actor.kind === 'bug') sprite.setTint(0xa3ffbb);
    if (actor.tier === 'elite') sprite.setTint(0xffb080);
    this.sprites.set(actor.id, sprite);
  }
  private showHeroPose(texture: 'dili_idle' | 'dili_attack' | 'dili_hurt' | 'dili_ultimate', duration: number) {
    const hero = this.sprites.get('dili');
    if (!hero) return;
    hero.setTexture(texture).setDisplaySize(230, (230 * hero.height) / hero.width);
    this.heroPoseWait = duration;
  }
  sync(snapshot: BattleSnapshot) {
    if (!this.ready) return;
    [snapshot.hero, ...snapshot.enemies].forEach((actor, i) => {
      if (!this.sprites.has(actor.id)) this.spawn(actor, Math.max(0, i - 1));
    });
    const hero = this.sprites.get('dili');
    const reduced = useGame.getState().save.settings.reducedMotion;
    if (hero) {
      this.lowHpAura.setPosition(hero.x, hero.y + 12);
      const lowHp = snapshot.hero.hp <= snapshot.hero.stats.maxHp * 0.25;
      if (lowHp && !reduced && !this.lowHpActive) {
        this.lowHpActive = true;
        this.lowHpAura.setVisible(true);
        this.tweens.add({
          targets: this.lowHpAura,
          alpha: 0.72,
          scale: 1.08,
          duration: 850,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.InOut',
        });
      } else if ((!lowHp || reduced) && this.lowHpActive) {
        this.lowHpActive = false;
        this.tweens.killTweensOf(this.lowHpAura);
        this.lowHpAura.setVisible(false).setAlpha(0.3).setScale(0.85);
      }
    }
  }
  enqueue(events: CombatEvent[]) {
    this.queue.push(...events.filter((e) => e.type !== 'rage'));
    this.queue = this.queue.slice(0, 200);
    this.outcomePosePending = useGame.getState().snapshot?.outcome ?? null;
  }
  private showOutcomePose(outcome: 'victory' | 'defeat', reduced: boolean) {
    const hero = this.sprites.get('dili');
    if (!hero) return;
    if (outcome === 'victory') {
      this.showHeroPose('dili_idle', 0);
      hero.setTint(0xa8ffe8);
      if (!reduced)
        this.tweens.add({ targets: hero, y: hero.y - 14, angle: -5, duration: 150, yoyo: true });
    } else if (useGame.getState().snapshot?.hero.hp) {
      this.showHeroPose('dili_hurt', 0);
      hero.setTint(0x8195b1);
      if (!reduced)
        this.tweens.add({ targets: hero, y: hero.y + 16, angle: 12, alpha: 0.45, duration: 280 });
    }
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
          ? `${event.label.toUpperCase()} ${event.amount}T`
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
        this.showHeroPose('dili_ultimate', 700);
        playSound('ultimate');
        this.tweens.killTweensOf(this.ring);
        this.ring.setPosition(200, 290).setStrokeStyle(5, 0x76f5ff);
        this.ring.setVisible(true).setScale(1).setAlpha(0.9);
        this.tweens.add({ targets: this.ring, scale: reduced ? 3 : 18, alpha: 0, duration: 700 });
        if (!reduced) this.cameras.main.shake(200, 0.012);
      } else if (event.source.startsWith('boss_') && source) {
        this.tweens.killTweensOf(this.bossWarningRing);
        this.bossWarningRing
          .setPosition(source.x, source.y)
          .setStrokeStyle(4, 0xff68c8)
          .setScale(0.7)
          .setAlpha(0.85)
          .setVisible(true);
        this.tweens.add({
          targets: this.bossWarningRing,
          scale: reduced ? 1.5 : 3.4,
          alpha: 0,
          duration: reduced ? 180 : 600,
          onComplete: () => this.bossWarningRing.setVisible(false),
        });
        if (!reduced) {
          source.setTint(0xff74ca);
          this.tweens.add({
            targets: source,
            alpha: 0.72,
            duration: 100,
            repeat: 2,
            yoyo: true,
            onComplete: () => source.clearTint().setAlpha(1),
          });
        }
      }
    }
    if (!target) return;
    if (event.type === 'damage') {
      const indirectDamage = event.tag === 'status' || event.tag === 'reflect';
      const bossAttack = event.source.startsWith('boss_') && !indirectDamage;
      if (event.source === 'dili' && !indirectDamage)
        this.showHeroPose('dili_attack', event.crit ? 210 : 150);
      else if (event.target === 'dili' && event.source !== 'dili')
        this.showHeroPose('dili_hurt', 220);
      if (!indirectDamage) {
        if (event.label === 'Ban Hammer') playSound('hammer');
        else if (bossAttack) playBossAttackSound(event.source);
        else playSound(event.crit ? 'crit' : 'attack');
      }
      const hammer = event.label === 'Ban Hammer';
      const viralExplosion = event.label === 'Viral Explosion';
      const statusColor = event.tag === 'status' ? STATUS_COLORS[event.label.toLowerCase()] : undefined;
      const reducedScale = reduced && (hammer || viralExplosion);
      this.tweens.killTweensOf(this.impactRing);
      this.impactRing
        .setPosition(target.x, target.y)
        .setStrokeStyle(
          hammer || viralExplosion || event.crit || statusColor ? 5 : 3,
          hammer
            ? 0xff78c8
            : viralExplosion
              ? 0xc879ff
              : statusColor ??
                (bossAttack
                  ? (BOSS_ATTACK_COLORS[event.source] ?? 0x76f5ff)
                  : event.crit
                    ? 0xffd773
                    : 0x76f5ff),
        )
        .setScale(0.35)
        .setAlpha(0.95)
        .setVisible(true);
      this.tweens.add({
        targets: this.impactRing,
        scale: reducedScale
          ? 2.5
          : hammer
            ? 4.6
            : viralExplosion
              ? 5.2
              : statusColor
                ? 2.9
                : event.crit
                  ? 3.2
                  : 2.4,
        alpha: 0,
        duration: reduced
          ? 100
          : hammer
            ? 360
            : viralExplosion
              ? 280
              : statusColor
                ? 210
                : event.crit
                  ? 190
                  : 130,
        onComplete: () => this.impactRing.setVisible(false),
      });
      if (hammer || viralExplosion) {
        this.tweens.killTweensOf(this.skillImpact);
        this.skillImpact
          .setTexture(hammer ? 'skill_hammer' : 'skill_viral')
          .setPosition(target.x, target.y - (hammer && !reduced ? 34 : 0))
          .setScale(hammer ? 0.35 : 0.22)
          .setAngle(0)
          .setAlpha(0.85)
          .setVisible(true);
        this.tweens.add({
          targets: this.skillImpact,
          alpha: 0,
          ...(reduced
            ? {}
            : hammer
              ? { y: target.y - 4, scale: 0.5, angle: -10 }
              : { scale: 0.72, angle: 18 }),
          duration: reduced ? 100 : hammer ? 360 : 300,
          onComplete: () => this.skillImpact.setVisible(false),
        });
      }
      if (!reduced && bossAttack) this.cameras.main.shake(100, 0.0025);
      else if (!reduced && hammer) this.cameras.main.shake(120, 0.009);
      else if (event.crit && !reduced) this.cameras.main.shake(90, 0.005);
      if (event.target === 'dili' && event.source !== 'dili' && !reduced) {
        target.setTint(0xff607c);
        this.tweens.add({
          targets: target,
          alpha: 0.7,
          duration: 70,
          yoyo: true,
          onComplete: () => target.clearTint().setAlpha(1),
        });
      }
      if (source && !reduced && !indirectDamage) {
        this.tweens.add({
          targets: source,
          x: source.x + (source.x < target.x ? 1 : -1) * (bossAttack ? 15 : 8),
          duration: bossAttack ? 95 : 65,
          yoyo: true,
        });
        this.projectile
          .setFillStyle(
            event.label.startsWith('DliClip')
              ? 0xff78c8
              : bossAttack
                ? (BOSS_ATTACK_COLORS[event.source] ?? 0x7bffff)
                : 0x7bffff,
          )
          .setPosition(source.x, source.y)
          .setVisible(true)
          .setAlpha(1);
        this.tweens.add({
          targets: this.projectile,
          x: target.x,
          y: target.y,
          duration: bossAttack ? 190 : 140,
          onComplete: () => this.projectile.setVisible(false),
        });
      }
      if (!reduced) this.tweens.add({ targets: target, angle: 5, duration: 70, yoyo: true });
      this.floating(target, event);
    } else if (event.type === 'dodge' || event.type === 'heal' || event.type === 'shield') {
      if (event.type === 'dodge' && event.target === 'dili') this.showHeroPose('dili_idle', 0);
      playSound(event.type);
      if (event.type === 'heal' || event.type === 'shield') {
        this.tweens.killTweensOf(this.impactRing);
        this.impactRing
          .setPosition(target.x, target.y)
          .setStrokeStyle(4, event.type === 'heal' ? 0x8affb6 : 0x72e5ff)
          .setScale(0.55)
          .setAlpha(0.85)
          .setVisible(true);
        this.tweens.add({
          targets: this.impactRing,
          scale: reduced ? 1.5 : 2.8,
          alpha: 0,
          duration: reduced ? 100 : 240,
          onComplete: () => this.impactRing.setVisible(false),
        });
      }
      if (event.type === 'dodge' && event.target === 'dili' && !reduced) {
        const direction = source && source.x < target.x ? 1 : -1;
        this.tweens.add({
          targets: target,
          x: target.x + direction * 24,
          alpha: 0.35,
          duration: 85,
          yoyo: true,
          onComplete: () => target.setAlpha(1),
        });
      }
      this.floating(target, event);
    } else if (event.type === 'shield_break') {
      playSound('shield_break');
      this.tweens.killTweensOf(this.label);
      this.label
        .setText(event.label)
        .setPosition(target.x, target.y - 105)
        .setAlpha(1);
      this.tweens.add({
        targets: this.label,
        alpha: 0,
        y: target.y - (reduced ? 105 : 135),
        duration: reduced ? 100 : 450,
      });
      this.tweens.killTweensOf(this.impactRing);
      this.impactRing
        .setPosition(target.x, target.y)
        .setStrokeStyle(5, 0x72e5ff)
        .setScale(0.5)
        .setAlpha(0.95)
        .setVisible(true);
      this.tweens.add({
        targets: this.impactRing,
        scale: reduced ? 1.1 : 4,
        alpha: 0,
        duration: reduced ? 100 : 220,
        onComplete: () => this.impactRing.setVisible(false),
      });
    } else if (event.type === 'status') {
      const color = STATUS_COLORS[event.label.toLowerCase()] ?? 0xb67cff;
      this.tweens.killTweensOf(this.impactRing);
      this.impactRing
        .setPosition(target.x, target.y)
        .setStrokeStyle(3, color)
        .setScale(0.7)
        .setAlpha(0.8)
        .setVisible(true);
      this.tweens.add({
        targets: this.impactRing,
        scale: reduced ? 1.7 : 2.3,
        alpha: 0,
        duration: reduced ? 100 : 200,
        onComplete: () => this.impactRing.setVisible(false),
      });
      this.floating(target, event);
    } else if (event.type === 'revive')
      this.floating(target, event);
    else if (event.type === 'death') {
      if (event.target === 'dili') this.showHeroPose('dili_hurt', 0);
      playSound('death');
      this.tweens.add({ targets: target, alpha: 0, duration: reduced ? 100 : 300 });
    } else if (event.type === 'summon') target.setAlpha(1);
  }
  update(_time: number, delta: number) {
    const state = useGame.getState();
    this.tweens.timeScale = state.paused ? 0 : state.speed;
    if (state.paused) return;
    if (state.save.settings.reducedMotion && this.lowHpActive) {
      this.lowHpActive = false;
      this.tweens.killTweensOf(this.lowHpAura);
      this.lowHpAura.setVisible(false).setAlpha(0.3).setScale(0.85);
    }
    const elapsed = (Math.min(delta, 50) / 1000) * state.speed;
    this.parallaxLayers.forEach(({ sprite, speed }) => {
      sprite.tilePositionX += elapsed * speed;
    });
    if (this.heroPoseWait > 0) {
      this.heroPoseWait -= Math.min(delta, 100) * state.speed;
      if (this.heroPoseWait <= 0) this.showHeroPose('dili_idle', 0);
    }
    this.wait -= Math.min(delta, 100) * state.speed;
    if (this.wait <= 0 && this.queue.length) {
      const event = this.queue.shift()!;
      this.present(event);
      this.wait = eventDuration(event);
    }
    if (this.wait <= 0 && !this.queue.length && this.outcomePosePending && !this.outcomePoseShown) {
      this.outcomePoseShown = true;
      this.showOutcomePose(this.outcomePosePending, state.save.settings.reducedMotion);
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
