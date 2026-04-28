import { NextResponse } from 'next/server';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const NAME_Y_FRACTION = 0.555;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const name = (searchParams.get('name') || '').trim();

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const templatePath = path.join(process.cwd(), 'public', 'certificate-template.png');
  const fontPath = path.join(process.cwd(), 'public', 'font-bold.ttf');

  const templateBuffer = fs.readFileSync(templatePath);
  const fontBase64 = fs.readFileSync(fontPath).toString('base64');

  const meta = await sharp(templateBuffer).metadata();
  const W = meta.width;
  const H = meta.height;

  const fontSize = Math.round(W * 0.042);
  const nameY = Math.round(H * NAME_Y_FRACTION);

  function escapeXml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  // Embed font as base64 so it works on any server (Vercel Linux) without installed fonts
  const svgOverlay = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      @font-face {
        font-family: 'CertFont';
        src: url('data:font/truetype;base64,${fontBase64}') format('truetype');
        font-weight: bold;
      }
    </style>
  </defs>
  <text
    x="${W / 2}"
    y="${nameY}"
    font-family="CertFont, Arial, sans-serif"
    font-size="${fontSize}"
    font-weight="bold"
    fill="#000000"
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
