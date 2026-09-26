import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { ASSETS, diliWeaponPoses } from '../../content/assets';
import type { AttackStyle } from '../../content/equipment';
import type { SkinId } from '../../content/skins';
import { GEAR } from '../../content/equipment';
import { getChapter } from '../../content/chapters';
import { useGame } from '../../stores/gameStore';
import { playBossAttackSound, playSound } from '../../services/audio';
import type { Actor, CombatEvent } from '../combat/types';
import type { BattleSnapshot } from '../combat/CombatEngine';
import {
  BASIC_PROJECTILE_MS,
  BOSS_PROJECTILE_MS,
  buildPresentationQueue,
  eventDuration,
  type PresentationCue,
} from './presentation';

const BACKGROUND_PALETTES: Record<string, [number, number, number, number]> = {
  chapter_feed: [0x0d203c, 0x102947, 0x081321, 0x101525],
  chapter_dliclips: [0x201438, 0x2b1d55, 0x10152d, 0x17122c],
  chapter_rooms: [0x321b38, 0x4b2542, 0x17182b, 0x21172b],
  chapter_core: [0x091c35, 0x0c3150, 0x080e24, 0x12122d],
};
const BACKGROUND_SPRITES: Record<string, string> = {
  chapter_feed: ASSETS.background_feed_city,
  chapter_dliclips: ASSETS.background_dliclip_stream,
  chapter_rooms: ASSETS.background_dili_rooms,
  chapter_core: ASSETS.background_core_network,
};
const BOSS_SPRITES: Record<string, { key: string; asset: string }> = {
  chapter_feed: { key: 'king', asset: ASSETS.enemy_boss_spam_king_idle },
  chapter_dliclips: { key: 'loop_phantom', asset: ASSETS.enemy_boss_loop_phantom_idle },
  chapter_rooms: { key: 'raid_master', asset: ASSETS.enemy_boss_raid_master_idle },
  chapter_core: { key: 'null_exe', asset: ASSETS.enemy_boss_null_exe_idle },
};
const ENEMY_SPRITES: Record<string, string> = {
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
const ARMOR_VFX: Record<string, { color: number; accent: number; glyph: string }> = {
  armor_firewall_shell: { color: 0x67e7ef, accent: 0x2a7fa1, glyph: 'F' },
  armor_creator_hoodie: { color: 0xff78c8, accent: 0x7d3b7d, glyph: 'C' },
  armor_zero_knowledge_cloak: { color: 0xa982ff, accent: 0x43327d, glyph: 'Z' },
  armor_moderator_vest: { color: 0xffb45e, accent: 0x8f4d2f, glyph: 'M' },
  armor_antispam_plating: { color: 0x9cf777, accent: 0x3e7d58, glyph: 'A' },
  armor_core_armor: { color: 0xffd773, accent: 0x8b6632, glyph: 'Ω' },
};
const MODULE_VFX: Record<string, { color: number; glyph: string }> = {
  module_viral_chip: { color: 0x83f47a, glyph: 'V' },
  module_combo_router: { color: 0x67e7ef, glyph: 'C' },
  module_counter_protocol: { color: 0xffa45e, glyph: '↻' },
  module_rage_cache: { color: 0xff5d91, glyph: 'R' },
  module_safe_mode: { color: 0x7bb9ff, glyph: 'S' },
  module_trust: { color: 0xffd773, glyph: 'T' },
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
  private enemySlots = new Map<string, number>();
  private enemyBaseTints = new Map<string, number>();
  private breathing = new Map<string, { baseScaleY: number; factor: number }>();
  private queue: PresentationCue[] = [];
  private wait = 0;
  private vitalsSettled = true;
  private numbers: Phaser.GameObjects.Text[] = [];
  private numberIndex = 0;
  private projectile!: Phaser.GameObjects.Arc;
  private impactRing!: Phaser.GameObjects.Arc;
  private impactSpark!: Phaser.GameObjects.Image;
  private slash!: Phaser.GameObjects.Graphics;
  private enemyPulseRings: Phaser.GameObjects.Arc[] = [];
  private enemyPulseIndex = 0;
  private skillImpact!: Phaser.GameObjects.Image;
  private label!: Phaser.GameObjects.Text;
  private ring!: Phaser.GameObjects.Arc;
  private bossWarningRing!: Phaser.GameObjects.Arc;
  private bossWarningBadge!: Phaser.GameObjects.Container;
  private lowHpAura!: Phaser.GameObjects.Arc;
  private armorAura!: Phaser.GameObjects.Arc;
  private armorCore!: Phaser.GameObjects.Arc;
  private moduleOrb!: Phaser.GameObjects.Container;
  private lowHpActive = false;
  private heroPoseWait = 0;
  private outcomePosePending: 'victory' | 'defeat' | null = null;
  private outcomePoseShown = false;
  private parallaxLayers: { sprite: Phaser.GameObjects.TileSprite; speed: number }[] = [];
  private ready = false;
  constructor(
    private readonly chapterId: string,
    private readonly weaponId: string,
    private readonly armorId: string,
    private readonly moduleId: string,
    private readonly attackStyle: AttackStyle,
    private readonly skinId: SkinId,
    private readonly onCue: (event: CombatEvent) => void,
    private readonly onSnapshot: (snapshot: BattleSnapshot) => void,
  ) {
    super('battle');
  }
  preload() {
    const weaponPoses = diliWeaponPoses(this.skinId, this.weaponId);
    this.load.image('battle_background', BACKGROUND_SPRITES[this.chapterId]);
    this.load.image('dili_idle', weaponPoses.idle);
    this.load.image('dili_attack', weaponPoses.attack);
    this.load.image('dili_hurt', weaponPoses.hurt);
    this.load.image('dili_ultimate', weaponPoses.ultimate);
    this.load.image('skill_hammer', ASSETS.skill_hammer);
    this.load.image('skill_viral', ASSETS.skill_viral);
    this.load.image('skill_rage', ASSETS.skill_rage);
    this.load.svg('bot', ASSETS.enemy_bot_placeholder);
    const enemyKinds = new Set([
      ...getChapter(this.chapterId).enemyPool.map((enemy) => enemy.id),
      'spam_bot', // Spam King summons this enemy.
      'raid_bot', // Elite encounters use this enemy in every chapter.
    ]);
    for (const kind of enemyKinds) {
      const asset = ENEMY_SPRITES[kind];
      if (asset) this.load.image(kind, asset);
    }
    const bossSprite = BOSS_SPRITES[this.chapterId];
    this.load.image(bossSprite.key, bossSprite.asset);
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
    const hasBackground = this.textures.exists('battle_background');
    if (hasBackground) this.add.image(380, 255, 'battle_background').setDisplaySize(760, 510);
    const g = this.add.graphics();
    if (hasBackground) {
      g.fillStyle(0x081527, 0.12).fillRect(0, 0, 760, 510);
    } else {
      const [topLeft, topRight, bottomLeft, bottomRight] = BACKGROUND_PALETTES[this.chapterId];
      g.fillGradientStyle(topLeft, topRight, bottomLeft, bottomRight, 1);
      g.fillRect(0, 0, 760, 510);
      drawChapterBackground(g, this.chapterId);
    }
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
    const sparkGraphics = this.make.graphics({ x: 0, y: 0 }, false);
    sparkGraphics.lineStyle(5, 0xffffff);
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      sparkGraphics.lineBetween(
        40 + Math.cos(angle) * 13, 40 + Math.sin(angle) * 13,
        40 + Math.cos(angle) * 34, 40 + Math.sin(angle) * 34,
      );
    }
    sparkGraphics.generateTexture('impact_spark', 80, 80);
    sparkGraphics.destroy();
    this.impactSpark = this.add.image(0, 0, 'impact_spark').setVisible(false).setDepth(17);
    this.slash = this.add.graphics().setVisible(false).setDepth(18);
    for (let i = 0; i < 4; i++)
      this.enemyPulseRings.push(
        this.add.circle(0, 0, 28).setStrokeStyle(4, 0xff78c8).setVisible(false).setDepth(12),
      );
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
    const warningShape = this.add.graphics();
    warningShape.fillStyle(0xffd773).fillRoundedRect(-31, -31, 62, 62, 9);
    warningShape.lineStyle(4, 0x081527).strokeRoundedRect(-31, -31, 62, 62, 9);
    const warningMark = this.add
      .text(0, 1, '!', { fontFamily: 'Arial', fontSize: '43px', fontStyle: 'bold', color: '#081527' })
      .setOrigin(0.5);
    this.bossWarningBadge = this.add
      .container(0, 0, [warningShape, warningMark])
      .setVisible(false)
      .setDepth(21);
    this.lowHpAura = this.add
      .circle(197, 315, 106)
      .setStrokeStyle(4, 0xff5577, 0.7)
      .setScale(0.85)
      .setAlpha(0.3)
      .setVisible(false)
      .setDepth(6);
    const armorVfx = ARMOR_VFX[this.armorId] ?? ARMOR_VFX.armor_firewall_shell;
    this.armorAura = this.add
      .circle(197, 312, 106)
      .setStrokeStyle(3, armorVfx.color, 0.34)
      .setDepth(4);
    this.armorCore = this.add
      .circle(197, 312, 95)
      .setStrokeStyle(1, armorVfx.accent, 0.48)
      .setDepth(4);
    const moduleVfx = MODULE_VFX[this.moduleId] ?? MODULE_VFX.module_viral_chip;
    const moduleBack = this.add.circle(0, 0, 19, 0x081527, 0.92).setStrokeStyle(3, moduleVfx.color, 0.95);
    const moduleDot = this.add.circle(0, -25, 4, moduleVfx.color, 0.9);
    const moduleOrbit = this.add.container(0, 0, [moduleDot]);
    const moduleGlyph = this.add.text(0, 0, moduleVfx.glyph, {
      fontFamily: 'monospace', fontSize: '17px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5);
    this.moduleOrb = this.add.container(112, 211, [moduleBack, moduleOrbit, moduleGlyph]).setDepth(7);
    if (!useGame.getState().save.settings.reducedMotion) {
      this.tweens.add({ targets: this.armorAura, scale: 1.05, alpha: 0.62, duration: 1400, yoyo: true, repeat: -1 });
      this.tweens.add({ targets: moduleOrbit, angle: 360, duration: 1800, repeat: -1 });
    }
    this.add.text(18, 482, `${GEAR[this.armorId].name.toUpperCase()}  ◇  ${GEAR[this.moduleId].name.toUpperCase()}`, {
      fontFamily: 'monospace', fontSize: '10px', color: '#86a9bd',
    }).setDepth(8);
    this.label = this.add
      .text(380, 420, '', {
        fontFamily: 'monospace',
        fontSize: '20px',
        fontStyle: 'bold',
        color: '#d2fbff',
        backgroundColor: '#152941',
        padding: { x: 14, y: 10 },
        align: 'center',
        wordWrap: { width: 680 },
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
    if (state.snapshot) {
      this.sync(state.snapshot);
      this.onSnapshot(state.snapshot);
    }
  }
  private spawn(actor: Actor, index: number, summoned = false) {
    const hero = actor.id === 'dili';
    const boss = actor.tier === 'boss';
    if (boss) playSound('boss_intro');
    const enemyPositions = [[510, 244], [630, 303], [430, 333]];
    const [x, y] = hero ? [197, 303] : enemyPositions[index % enemyPositions.length];
    const bossKeys: Record<string, string> = {
      boss_spam_king: 'king',
      boss_loop_phantom: 'loop_phantom',
      boss_raid_master: 'raid_master',
      boss_null_exe: 'null_exe',
    };
    const enemyKind = actor.kind === 'raid_minion' ? 'raid_bot' : actor.kind;
    const sprite = this.add.image(
      x,
      y,
      hero ? 'dili_idle' : boss ? bossKeys[actor.kind] ?? 'king' : ENEMY_SPRITES[enemyKind] ? enemyKind : 'bot',
    );
    const size = hero ? 230 : boss ? 245 : summoned ? 135 : 155;
    sprite
      .setDisplaySize(size, (size * sprite.height) / sprite.width)
      .setDepth(hero ? 5 : 4 + index);
    const breathing = { baseScaleY: sprite.scaleY, factor: 1 };
    this.breathing.set(actor.id, breathing);
    if (!useGame.getState().save.settings.reducedMotion) {
      this.tweens.add({
        targets: breathing,
        factor: boss ? 1.04 : 1.018,
        duration: boss ? 1500 : 2100,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.InOut',
      });
    }
    if (actor.tier === 'elite') {
      this.enemyBaseTints.set(actor.id, 0xffb080);
      sprite.setTint(0xffb080);
    }
    this.sprites.set(actor.id, sprite);
    if (!hero) this.enemySlots.set(actor.id, index);
    if (summoned && !boss) sprite.setAlpha(0).setY(y + 18);
    if (boss) this.showBossIntro(actor, sprite, x, y);
  }
  private pulseEnemy(x: number, y: number, color: number, reduced: boolean) {
    const ring = this.enemyPulseRings[this.enemyPulseIndex++ % this.enemyPulseRings.length];
    this.tweens.killTweensOf(ring);
    ring.setPosition(x, y).setStrokeStyle(4, color).setScale(0.55).setAlpha(0.9).setVisible(true);
    this.tweens.add({
      targets: ring,
      scale: reduced ? 1.4 : 3.3,
      alpha: 0,
      duration: reduced ? 120 : 300,
      onComplete: () => ring.setVisible(false),
    });
  }
  private flashEnemy(target: Phaser.GameObjects.Image, id: string, color: number, reduced: boolean) {
    target.setTint(color);
    const restoreTint = () => {
      if (!target.active) return;
      const baseTint = this.enemyBaseTints.get(id);
      if (baseTint) target.setTint(baseTint);
      else target.clearTint();
    };
    if (reduced) {
      this.tweens.addCounter({ from: 0, to: 1, duration: 90, onComplete: restoreTint });
    } else {
      this.tweens.add({
        targets: target,
        x: target.x + 11,
        angle: 6,
        duration: 80,
        yoyo: true,
        onComplete: restoreTint,
      });
    }
  }
  private showBossIntro(actor: Actor, sprite: Phaser.GameObjects.Image, x: number, y: number) {
    const reduced = useGame.getState().save.settings.reducedMotion;
    const color = BOSS_ATTACK_COLORS[actor.kind] ?? 0xff78c8;
    if (!reduced) {
      sprite.setPosition(x + 30, y + 16).setAlpha(0);
      this.tweens.add({ targets: sprite, x, y, alpha: 1, duration: 480, ease: 'Cubic.Out' });
    }
    const banner = this.add.container(380, reduced ? 430 : 447).setDepth(22);
    const backdrop = this.add.rectangle(0, 0, 394, 76, 0x081527, 0.93)
      .setStrokeStyle(2, color, 0.9);
    const tag = this.add.text(0, -20, 'BOSS SIGNAL', {
      fontFamily: 'monospace', fontSize: '13px', color: '#c9d8e8',
    }).setOrigin(0.5);
    const name = this.add.text(0, 10, actor.name.toUpperCase(), {
      fontFamily: 'Barlow Condensed', fontSize: '36px', fontStyle: 'bold',
      color: `#${color.toString(16).padStart(6, '0')}`,
    }).setOrigin(0.5);
    banner.add([backdrop, tag, name]).setAlpha(reduced ? 1 : 0);
    this.tweens.add({
      targets: banner,
      alpha: reduced ? 0 : 1,
      ...(reduced ? { delay: 450, duration: 150 } : { y: 430, duration: 220, yoyo: true, hold: 320 }),
      onComplete: () => banner.destroy(),
    });
  }
  private showHeroPose(texture: 'dili_idle' | 'dili_attack' | 'dili_hurt' | 'dili_ultimate', duration: number) {
    const hero = this.sprites.get('dili');
    if (!hero) return;
    hero.setTexture(texture).setDisplaySize(230, (230 * hero.height) / hero.width);
    const breathing = this.breathing.get('dili');
    if (breathing) breathing.baseScaleY = hero.scaleY;
    this.heroPoseWait = duration;
  }
  sync(snapshot: BattleSnapshot, events: CombatEvent[] = []) {
    if (!this.ready) return;
    const summonedIds = new Set(events.filter((event) => event.type === 'summon').map((event) => event.target));
    const livingIds = new Set(snapshot.enemies.filter((actor) => actor.hp > 0).map((actor) => actor.id));
    [snapshot.hero, ...snapshot.enemies].forEach((actor) => {
      if (actor.id !== 'dili' && actor.hp <= 0) return;
      if (!this.sprites.has(actor.id)) {
        const occupied = new Set(
          [...this.enemySlots].filter(([id]) => livingIds.has(id)).map(([, slot]) => slot),
        );
        const slot = [0, 1, 2].find((index) => !occupied.has(index)) ?? this.enemySlots.size % 3;
        this.spawn(actor, slot, summonedIds.has(actor.id));
      }
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
    this.queue.push(...buildPresentationQueue(events));
    this.queue = this.queue.slice(0, 200);
    this.vitalsSettled = false;
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
  private showSlash(x: number, y: number, reduced: boolean) {
    this.tweens.killTweensOf(this.slash);
    this.slash.clear()
      .lineStyle(10, 0x62eff3, 0.95).arc(0, 0, 72, -1.35, 1.35).strokePath()
      .lineStyle(3, 0xe5ffff, 0.95).arc(0, 0, 82, -1.2, 1.2).strokePath();
    this.slash.setPosition(x - 16, y).setScale(reduced ? 1 : 0.55).setAlpha(1).setVisible(true);
    this.tweens.add({
      targets: this.slash,
      scale: reduced ? 1 : 1.3,
      alpha: 0,
      duration: reduced ? 90 : 200,
      onComplete: () => this.slash.setVisible(false),
    });
  }
  private present(event: PresentationCue) {
    const target = this.sprites.get(event.target),
      source = this.sprites.get(event.source);
    const reduced = useGame.getState().save.settings.reducedMotion;
    if ('amount' in event && event.type !== 'damage')
      this.onCue(event);
    if (event.type === 'crit_anticipation' && source) {
      if (event.source === 'dili') this.showHeroPose('dili_attack', 110);
      this.tweens.killTweensOf(this.ring);
      this.ring
        .setPosition(source.x, source.y)
        .setStrokeStyle(4, 0xffd773)
        .setScale(0.65)
        .setAlpha(0.9)
        .setVisible(true);
      this.tweens.add({
        targets: this.ring,
        scale: reduced ? 1 : 1.7,
        alpha: 0,
        duration: reduced ? 70 : 100,
        onComplete: () => this.ring.setVisible(false),
      });
      return;
    }
    if (event.type === 'rage_burst' && source) {
      this.tweens.killTweensOf(this.skillImpact);
      this.skillImpact
        .setTexture('skill_rage')
        .setPosition(source.x, source.y)
        .setScale(0.22)
        .setAngle(0)
        .setAlpha(0.9)
        .setVisible(true);
      this.tweens.add({
        targets: this.skillImpact,
        scale: reduced ? 0.3 : 0.62,
        alpha: 0,
        duration: reduced ? 100 : 180,
        onComplete: () => this.skillImpact.setVisible(false),
      });
      return;
    }
    if (event.type === 'warning' || event.type === 'ultimate') {
      this.tweens.killTweensOf(this.label);
      this.label.setText(event.label).setPosition(380, 420).setColor('#d2fbff').setAlpha(1);
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
        const color = BOSS_ATTACK_COLORS[event.source] ?? 0xff68c8;
        this.label.setColor(`#${color.toString(16).padStart(6, '0')}`);
        this.tweens.killTweensOf(this.bossWarningRing);
        this.bossWarningRing
          .setPosition(source.x, source.y)
          .setStrokeStyle(4, color)
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
        this.tweens.killTweensOf(this.bossWarningBadge);
        this.bossWarningBadge
          .setPosition(source.x + 160, source.y - 56)
          .setScale(reduced ? 1 : 0.85)
          .setAlpha(1)
          .setVisible(true);
        this.tweens.add({
          targets: this.bossWarningBadge,
          ...(reduced ? {} : { y: source.y - 66, scale: 1.08 }),
          alpha: 0,
          duration: reduced ? 450 : 600,
          onComplete: () => this.bossWarningBadge.setVisible(false),
        });
        if (!reduced) {
          source.setTint(color);
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
    if (!target) {
      if (event.type === 'damage') this.onCue(event);
      return;
    }
    if (event.type === 'damage') {
      const indirectDamage = event.tag === 'status' || event.tag === 'reflect';
      const bossAttack = event.source.startsWith('boss_') && !indirectDamage;
      const bladeBasic = event.source === 'dili' && event.tag === 'basic' && this.attackStyle === 'blade';
      const hammerBasic = event.source === 'dili' && event.tag === 'basic' && this.attackStyle === 'hammer';
      if (event.source === 'dili' && !indirectDamage)
        this.showHeroPose('dili_attack', event.crit ? 300 : 230);
      const impact = () => {
        this.onCue(event);
        if (!target.active) return;
        if (event.target === 'dili' && event.source !== 'dili')
          this.showHeroPose('dili_hurt', 220);
        if (!indirectDamage) {
          if (event.label === 'Ban Hammer' || hammerBasic) playSound('hammer');
          else if (bladeBasic) playSound('sword');
          else if (bossAttack) playBossAttackSound(event.source);
          else playSound(event.crit ? 'crit' : 'attack');
        }
        const hammer = event.label === 'Ban Hammer' || hammerBasic;
        const viralExplosion = event.label === 'Viral Explosion';
        if (bladeBasic) this.showSlash(target.x, target.y, reduced);
        const statusColor = event.tag === 'status' ? STATUS_COLORS[event.label.toLowerCase()] : undefined;
        const impactColor = hammer
          ? 0xff78c8
          : viralExplosion
            ? 0xc879ff
            : statusColor ?? (bossAttack
              ? BOSS_ATTACK_COLORS[event.source] ?? 0x76f5ff
              : event.crit ? 0xffd773 : 0x76f5ff);
        const reducedScale = reduced && (hammer || viralExplosion);
        this.tweens.killTweensOf(this.impactRing);
        this.impactRing
          .setPosition(target.x, target.y)
          .setStrokeStyle(hammer || viralExplosion || event.crit || statusColor ? 5 : 3, impactColor)
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
        this.tweens.killTweensOf(this.impactSpark);
        this.impactSpark
          .setPosition(target.x, target.y)
          .setTint(impactColor)
          .setScale(reduced ? 0.75 : 0.4)
          .setAlpha(0.95)
          .setVisible(true);
        this.tweens.add({
          targets: this.impactSpark,
          scale: reduced ? 0.75 : event.crit ? 1.25 : 1,
          alpha: 0,
          duration: reduced ? 90 : 130,
          onComplete: () => this.impactSpark.setVisible(false),
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
        if (event.target === 'dili') {
          if (!reduced) this.tweens.add({ targets: target, angle: 5, duration: 70, yoyo: true });
        } else {
          this.flashEnemy(target, event.target, event.crit ? 0xffe2a8 : 0xd4faff, reduced);
        }
        this.floating(target, event);
      };
      if (source && !reduced && (bladeBasic || hammerBasic)) {
        this.tweens.killTweensOf(source);
        source.setX(197);
        this.tweens.add({
          targets: source,
          x: target.x - (bladeBasic ? 105 : 115),
          duration: 125,
          ease: 'Cubic.Out',
          onComplete: () => {
            impact();
            this.tweens.add({ targets: source, x: 197, duration: 140, ease: 'Cubic.In' });
          },
        });
      } else if (source && !reduced && !indirectDamage) {
        this.tweens.add({
          targets: source,
          x: source.x + (source.x < target.x ? 1 : -1) * (bossAttack ? 15 : 8),
          duration: bossAttack ? 95 : 65,
          yoyo: true,
        });
        this.tweens.killTweensOf(this.projectile);
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
          duration: bossAttack ? BOSS_PROJECTILE_MS : BASIC_PROJECTILE_MS,
          onComplete: () => {
            this.projectile.setVisible(false);
            impact();
          },
        });
      } else impact();
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
        .setColor('#72e5ff')
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
      if (event.target !== 'dili') {
        this.pulseEnemy(target.x, target.y, 0xff78c8, reduced);
        target.setTint(0xffa2c8);
      }
      this.tweens.killTweensOf(target);
      this.tweens.add({
        targets: target,
        alpha: 0,
        ...(reduced ? {} : { y: target.y + 20, angle: 12 }),
        duration: reduced ? 100 : 300,
        onComplete: () => {
          if (event.target === 'dili') return;
          const breathing = this.breathing.get(event.target);
          if (breathing) this.tweens.killTweensOf(breathing);
          this.breathing.delete(event.target);
          this.sprites.delete(event.target);
          this.enemySlots.delete(event.target);
          this.enemyBaseTints.delete(event.target);
          target.destroy();
        },
      });
    } else if (event.type === 'summon') {
      const y = target.y - (target.alpha === 0 ? 18 : 0);
      const color = event.source.includes('raid_master') ? 0xffbb73 : 0xff78c8;
      this.pulseEnemy(target.x, y, color, reduced);
      this.tweens.killTweensOf(target);
      if (reduced) target.setY(y).setAlpha(1);
      else this.tweens.add({ targets: target, y, alpha: 1, duration: 260, ease: 'Cubic.Out' });
    }
  }
  update(_time: number, delta: number) {
    const state = useGame.getState();
    this.tweens.timeScale = state.paused ? 0 : state.speed;
    if (state.paused) return;
    for (const [id, breathing] of this.breathing) {
      const sprite = this.sprites.get(id);
      if (sprite)
        sprite.scaleY = breathing.baseScaleY * (state.save.settings.reducedMotion ? 1 : breathing.factor);
    }
    const hero = this.sprites.get('dili');
    if (hero) {
      this.armorAura.setPosition(hero.x, hero.y + 9);
      this.armorCore.setPosition(hero.x, hero.y + 9);
      this.moduleOrb.setPosition(hero.x - 85, hero.y - 92);
    }
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
    if (this.wait <= 0 && !this.queue.length && !this.vitalsSettled) {
      this.vitalsSettled = true;
      if (state.snapshot) this.onSnapshot(state.snapshot);
    }
    if (this.wait <= 0 && !this.queue.length && this.outcomePosePending && !this.outcomePoseShown) {
      this.outcomePoseShown = true;
      this.showOutcomePose(this.outcomePosePending, state.save.settings.reducedMotion);
    }
  }
}
export default function BattleCanvas({
  onCue,
  onSnapshot,
}: {
  onCue: (event: CombatEvent) => void;
  onSnapshot: (snapshot: BattleSnapshot) => void;
}) {
  const parent = useRef<HTMLDivElement>(null);
  const scene = useRef<BattleScene | null>(null);
  const handlers = useRef({ onCue, onSnapshot });
  handlers.current = { onCue, onSnapshot };
  const sequence = useGame((s) => s.sequence);
  const chapterId = useGame((s) => s.run?.chapterId ?? 'chapter_feed');
  const weaponId = useGame((s) => s.run?.weaponId ?? 'weapon_packet_blaster');
  const armorId = useGame((s) => s.run?.armorId ?? 'armor_firewall_shell');
  const moduleId = useGame((s) => s.run?.moduleId ?? 'module_viral_chip');
  const attackStyle = useGame((s) => s.run?.weaponStyle ?? 'ranged');
  const skinId = useGame((s) => s.run?.skinId ?? 'signal_blue');
  useEffect(() => {
    const mount = parent.current!;
    const current = new BattleScene(
      chapterId,
      weaponId,
      armorId,
      moduleId,
      attackStyle,
      skinId,
      (event) => handlers.current.onCue(event),
      (snapshot) => handlers.current.onSnapshot(snapshot),
    );
    scene.current = current;
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: mount,
      width: 760,
      height: 510,
      transparent: true,
      scene: current,
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_HORIZONTALLY },
      render: { antialias: true },
      audio: { noAudio: true },
      banner: false,
    });
    return () => {
      game.destroy(true);
      mount.replaceChildren();
      scene.current = null;
    };
  }, [chapterId, weaponId, armorId, moduleId, attackStyle, skinId]);
  useEffect(() => {
    const state = useGame.getState();
    if (state.snapshot) scene.current?.sync(state.snapshot, state.events);
    scene.current?.enqueue(state.events);
  }, [sequence]);
  return (
    <div
      className="battle-canvas"
      ref={parent}
      role="img"
      data-weapon-id={weaponId}
      data-armor-id={armorId}
      data-module-id={moduleId}
      aria-label={`Dili automatically battles in ${getChapter(chapterId).name} with ${GEAR[weaponId].name}, ${GEAR[armorId].name}, and ${GEAR[moduleId].name}`}
    />
  );
}
