import { NextResponse } from 'next/server';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const NAME_Y_FRACTION = 0.535;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const name = (searchParams.get('name') || '').trim();

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const templatePath = path.join(process.cwd(), 'public', 'certificate-template.png');
  const templateBuffer = fs.readFileSync(templatePath);

  const meta = await sharp(templateBuffer).metadata();
  const W = meta.width;
  const H = meta.height;

  const fontSize = Math.round(W * 0.055);
  const nameY = Math.round(H * NAME_Y_FRACTION);

  const estimatedCharWidth = fontSize * 0.58;
  const textWidth = name.length * estimatedCharWidth;
  const padX = fontSize * 1.2;
  const padY = fontSize * 0.5;
  const boxW = Math.round(textWidth + padX * 2);
  const boxH = Math.round(fontSize + padY * 2);
  const boxX = Math.round(W / 2 - boxW / 2);
  const boxY = Math.round(nameY - fontSize - padY + fontSize * 0.1);
  const r = 12;

  function escapeXml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  const svgOverlay = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <rect x="${boxX}" y="${boxY}" width="${boxW}" height="${boxH}" rx="${r}" ry="${r}" fill="white" fill-opacity="0.82"/>
  <text x="${W / 2}" y="${nameY}" font-family="Georgia, Times New Roman, serif" font-size="${fontSize}" font-weight="bold" fill="#1a1a1a" text-anchor="middle">${escapeXml(name)}</text>
</svg>`;

  const svgBuffer = Buffer.from(svgOverlay);

  const outputBuffer = await sharp(templateBuffer)
    .composite([{ input: svgBuffer, top: 0, left: 0 }])
    .png()
    .toBuffer();

  const safeName = name.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-');

  return new NextResponse(outputBuffer, {
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': `attachment; filename="certificate-${safeName}.png"`,
      'Cache-Control': 'no-store',
    },
  });
}
