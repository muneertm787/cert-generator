import { NextResponse } from 'next/server';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const NAME_Y_FRACTION = 0.555; // moved a little down from 0.535

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

  const fontSize = Math.round(W * 0.032); // 2pt less than previous (-2), so -4 total
  const nameY = Math.round(H * NAME_Y_FRACTION);

  function escapeXml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  const svgOverlay = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <text
    x="${W / 2}"
    y="${nameY}"
    font-family="Consolas, monospace"
    font-size="${fontSize}"
    font-weight="bold"
    fill="#1a1a1a"
    text-anchor="middle"
  >${escapeXml(name)}</text>
</svg>`;

  const outputBuffer = await sharp(templateBuffer)
    .composite([{ input: Buffer.from(svgOverlay), top: 0, left: 0 }])
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
