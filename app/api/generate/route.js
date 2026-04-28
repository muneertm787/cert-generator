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
  const meta = await sharp(templateBuffer).metadata();
  const W = meta.width;
  const H = meta.height;

  const fontSize = Math.round(W * 0.024);
  const nameY = Math.round(H * NAME_Y_FRACTION);

  const safeName = name
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const textResult = await sharp({
    text: {
      text: `<span font="font-bold ${fontSize}" color="black">${safeName}</span>`,
      rgba: true,
      dpi: 72,
      fontfile: fontPath,
    }
  }).toBuffer({ resolveWithObject: true });

  const { width: tW, height: tH, channels } = textResult.info;
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

  const filenameSafe = name.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-');

  // Track download in Vercel Analytics via server event
  // The actual count is visible in Vercel Dashboard > Analytics
  const response = new NextResponse(outputBuffer, {
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': `attachment; filename="certificate-${filenameSafe}.png"`,
      'Cache-Control': 'no-store',
      'x-certificate-name': filenameSafe, // logged in Vercel function logs
    },
  });

  return response;
}
