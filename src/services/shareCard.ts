export interface ShareCardData {
  outcome: 'victory' | 'defeat';
  chapter: string;
  boss: string;
  score: number;
  damageDealt: number;
  highestHit: number;
  kills: number;
  bits: number;
  duration: string;
  seed: string;
  skin: string;
  weapon: string;
  skills: string[];
  accent: string;
  backgroundUrl: string;
  heroUrl: string;
}

const WIDTH = 1200;
const HEIGHT = 630;

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Unable to load share-card asset: ${source}`));
    image.src = source;
  });
}

function drawCover(context: CanvasRenderingContext2D, image: HTMLImageElement) {
  const scale = Math.max(WIDTH / image.naturalWidth, HEIGHT / image.naturalHeight);
  const width = image.naturalWidth * scale;
  const height = image.naturalHeight * scale;
  context.drawImage(image, (WIDTH - width) / 2, (HEIGHT - height) / 2, width, height);
}

function fitText(context: CanvasRenderingContext2D, value: string, maxWidth: number) {
  if (context.measureText(value).width <= maxWidth) return value;
  let shortened = value;
  while (shortened.length > 1 && context.measureText(`${shortened}...`).width > maxWidth)
    shortened = shortened.slice(0, -1);
  return `${shortened}...`;
}

function canvasBlob(canvas: HTMLCanvasElement, type: string, quality?: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

export async function createShareCard(data: ShareCardData) {
  await document.fonts?.ready;
  const [background, hero] = await Promise.all([
    loadImage(data.backgroundUrl),
    loadImage(data.heroUrl),
  ]);
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas is unavailable in this browser.');

  drawCover(context, background);
  const shade = context.createLinearGradient(0, 0, WIDTH, 0);
  shade.addColorStop(0, 'rgba(5, 13, 27, .98)');
  shade.addColorStop(.6, 'rgba(5, 13, 27, .9)');
  shade.addColorStop(1, 'rgba(5, 13, 27, .42)');
  context.fillStyle = shade;
  context.fillRect(0, 0, WIDTH, HEIGHT);

  context.strokeStyle = 'rgba(116, 240, 238, .12)';
  context.lineWidth = 1;
  for (let x = 0; x < WIDTH; x += 48) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, HEIGHT);
    context.stroke();
  }
  for (let y = 0; y < HEIGHT; y += 48) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(WIDTH, y);
    context.stroke();
  }

  context.fillStyle = data.accent;
  context.fillRect(62, 54, 94, 5);
  context.font = '700 22px "Space Mono", monospace';
  context.fillText('DLICOM ATTACK', 62, 94);
  context.font = '600 15px "Space Mono", monospace';
  context.fillStyle = '#8cb0c2';
  context.fillText(`CHAPTER · ${data.chapter.toUpperCase()}`, 62, 128);

  context.font = '800 53px "Barlow Condensed", sans-serif';
  context.fillStyle = data.outcome === 'victory' ? '#f2ce7d' : '#f18aa6';
  const result = data.outcome === 'victory' ? `${data.boss.toUpperCase()} DEFEATED` : 'CONNECTION LOST';
  context.fillText(fitText(context, result, 650), 62, 196);

  context.font = '800 91px "Barlow Condensed", sans-serif';
  context.fillStyle = '#76eee8';
  context.fillText(data.score.toLocaleString(), 62, 292);
  context.font = '600 14px "Space Mono", monospace';
  context.fillStyle = '#8cb0c2';
  context.fillText('FINAL SCORE', 66, 319);

  const stats = [
    ['DAMAGE', data.damageDealt.toLocaleString()],
    ['HIGHEST HIT', data.highestHit.toLocaleString()],
    ['KILLS', data.kills.toLocaleString()],
    ['BITS', data.bits.toLocaleString()],
  ];
  stats.forEach(([label, value], index) => {
    const x = 62 + index * 150;
    roundedRect(context, x, 352, 136, 74, 10);
    context.fillStyle = 'rgba(16, 35, 54, .9)';
    context.fill();
    context.strokeStyle = 'rgba(118, 238, 232, .22)';
    context.stroke();
    context.font = '600 11px "Space Mono", monospace';
    context.fillStyle = '#7fa0b5';
    context.fillText(label, x + 13, 375);
    context.font = '800 26px "Barlow Condensed", sans-serif';
    context.fillStyle = '#edf8fb';
    context.fillText(value, x + 13, 410);
  });

  context.font = '600 11px "Space Mono", monospace';
  let chipX = 62;
  const chipY = 452;
  for (const skill of data.skills.slice(0, 6)) {
    const label = fitText(context, skill.toUpperCase(), 160);
    const width = Math.min(184, Math.max(76, context.measureText(label).width + 30));
    if (chipX + width > 720) break;
    roundedRect(context, chipX, chipY, width, 35, 17);
    context.fillStyle = 'rgba(26, 50, 70, .94)';
    context.fill();
    context.strokeStyle = 'rgba(118, 238, 232, .25)';
    context.stroke();
    context.fillStyle = '#b6e5e5';
    context.fillText(label, chipX + 15, chipY + 23);
    chipX += width + 8;
  }

  context.font = '600 13px "Space Mono", monospace';
  context.fillStyle = '#9fb7c6';
  context.fillText(`${data.skin} · ${data.weapon} · ${data.duration}`, 62, 532);
  context.font = '500 11px "Space Mono", monospace';
  context.fillStyle = '#728da1';
  context.fillText(fitText(context, `SEED ${data.seed}`, 650), 62, 566);
  context.fillStyle = '#76eee8';
  context.fillText('dlicom-attack.vercel.app', 62, 598);

  const heroHeight = 510;
  const heroWidth = hero.naturalWidth * (heroHeight / hero.naturalHeight);
  const maxHeroWidth = 430;
  const scale = heroWidth > maxHeroWidth ? maxHeroWidth / heroWidth : 1;
  const drawnWidth = heroWidth * scale;
  const drawnHeight = heroHeight * scale;
  context.save();
  context.shadowColor = data.accent;
  context.shadowBlur = 34;
  context.drawImage(hero, 1120 - drawnWidth, HEIGHT - drawnHeight - 18, drawnWidth, drawnHeight);
  context.restore();

  const blob = await canvasBlob(canvas, 'image/webp', .9) ?? await canvasBlob(canvas, 'image/png');
  if (!blob) throw new Error('Unable to encode the share card.');
  return { blob, extension: blob.type === 'image/webp' ? 'webp' : 'png' } as const;
}

export async function downloadShareCard(data: ShareCardData) {
  const { blob, extension } = await createShareCard(data);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const chapter = data.chapter.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  link.href = url;
  link.download = `dlicom-attack-${chapter}-${data.score}.${extension}`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  return link.download;
}
