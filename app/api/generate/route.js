import { NextResponse } from 'next/server';
import { createCanvas, loadImage } from 'canvas';
import path from 'path';

// Y position as fraction of image height — 1 inch lower than original
const NAME_Y_FRACTION = 0.535;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name') || '';

  if (!name.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const templatePath = path.join(process.cwd(), 'public', 'certificate-template.png');
  const img = await loadImage(templatePath);

  const W = img.width;
  const H = img.height;

  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // Draw background template
  ctx.drawImage(img, 0, 0, W, H);

  const nameY = H * NAME_Y_FRACTION;
  const fontSize = Math.round(W * 0.055);
  ctx.font = `bold ${fontSize}px Georgia`;
  ctx.textAlign = 'center';

  const textWidth = ctx.measureText(name).width;
  const padX = fontSize * 1.2;
  const padY = fontSize * 0.55;
  const boxW = textWidth + padX * 2;
  const boxH = fontSize + padY * 2;
  const boxX = W / 2 - boxW / 2;
  const boxY = nameY - fontSize - padY + fontSize * 0.15;

  // White fade (semi-transparent) background behind name
  ctx.save();
  ctx.globalAlpha = 0.82;
  ctx.fillStyle = '#ffffff';
  const r = 14;
  ctx.beginPath();
  ctx.moveTo(boxX + r, boxY);
  ctx.lineTo(boxX + boxW - r, boxY);
  ctx.quadraticCurveTo(boxX + boxW, boxY, boxX + boxW, boxY + r);
  ctx.lineTo(boxX + boxW, boxY + boxH - r);
  ctx.quadraticCurveTo(boxX + boxW, boxY + boxH, boxX + boxW - r, boxY + boxH);
  ctx.lineTo(boxX + r, boxY + boxH);
  ctx.quadraticCurveTo(boxX, boxY + boxH, boxX, boxY + boxH - r);
  ctx.lineTo(boxX, boxY + r);
  ctx.quadraticCurveTo(boxX, boxY, boxX + r, boxY);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Name text
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#1a1a1a';
  ctx.fillText(name, W / 2, nameY);

  const buffer = canvas.toBuffer('image/png');

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': `attachment; filename="certificate-${name.replace(/\s+/g, '-')}.png"`,
    },
  });
}
