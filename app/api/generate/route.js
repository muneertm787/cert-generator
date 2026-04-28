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

  // Font size: same formula as client, minus 2px
  const fontSize = Math.round(W * 0.055) - 2;
  const nameY = Math.round(H * NAME_Y_FRACTION);

  function escapeXml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  // No white background — just the name text in Verdana
  const svgOverlay = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <text
    x="${W / 2}"
    y="${nameY}"
    font-family="Verdana, sans-serif"
    font-size="${fontSize}"
    font-weight="bold"
    fill="#1a1a1a"
    text-anchor="middle"
  >${escapeXml(name)}</text>
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
