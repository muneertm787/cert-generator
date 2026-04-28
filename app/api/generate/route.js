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
  const templateBuffer = fs.readFileSync(templatePath);

  const meta = await sharp(templateBuffer).metadata();
  const W = meta.width;
  const H = meta.height;

  const fontSize = Math.round(W * 0.042);
  const nameY = Math.round(H * NAME_Y_FRACTION);

  // Use sharp's native Pango text rendering — works on Vercel Linux with no font install needed
  // Liberation Sans is bundled with sharp's libvips on Vercel
  const textResult = await sharp({
    text: {
      text: `<span font="Liberation Sans Bold ${fontSize}" color="black">${name.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</span>`,
      rgba: true,
      dpi: 72,
    }
  }).toBuffer({ resolveWithObject: true });

  const { width: tW, height: tH, channels } = textResult.info;

  // Center horizontally, align bottom of text to nameY
  const left = Math.max(0, Math.round((W - tW) / 2));
  const top = Math.max(0, Math.round(nameY - tH));

  const outputBuffer = await sharp(templateBuffer)
    .composite([{
      input: textResult.data,
      raw: { width: tW, height: tH, channels },
      left,
      top,
    }])
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
