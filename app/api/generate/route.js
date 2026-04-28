import { NextResponse } from 'next/server';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const NAME_Y_FRACTION = 0.555;

// Date position — bottom right "Date of Issue" area
const DATE_X_FRACTION = 0.720; // center of date area
const DATE_Y_FRACTION = 0.860; // just above the line

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

  // Format today's date: "29 April 2026"
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const nameFontSize = Math.round(W * 0.024);
  const dateFontSize = Math.round(W * 0.018); // slightly smaller than name

  const nameY = Math.round(H * NAME_Y_FRACTION);
  const dateY = Math.round(H * DATE_Y_FRACTION);
  const dateX = Math.round(W * DATE_X_FRACTION);

  function esc(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // Render name text
  const nameTextResult = await sharp({
    text: {
      text: `<span font="font-bold ${nameFontSize}" color="black">${esc(name)}</span>`,
      rgba: true,
      dpi: 72,
      fontfile: fontPath,
    }
  }).toBuffer({ resolveWithObject: true });

  // Render date text
  const dateTextResult = await sharp({
    text: {
      text: `<span font="font-bold ${dateFontSize}" color="black">${esc(dateStr)}</span>`,
      rgba: true,
      dpi: 72,
      fontfile: fontPath,
    }
  }).toBuffer({ resolveWithObject: true });

  const { width: nW, height: nH, channels: nC } = nameTextResult.info;
  const { width: dW, height: dH, channels: dC } = dateTextResult.info;

  // Center name horizontally
  const nameLeft = Math.max(0, Math.round((W - nW) / 2));
  const nameTop = Math.max(0, Math.round(nameY - nH));

  // Center date around its X position
  const dateLeft = Math.max(0, Math.round(dateX - dW / 2));
  const dateTop = Math.max(0, Math.round(dateY - dH));

  const outputBuffer = await sharp(templateBuffer)
    .composite([
      { input: nameTextResult.data, raw: { width: nW, height: nH, channels: nC }, left: nameLeft, top: nameTop },
      { input: dateTextResult.data, raw: { width: dW, height: dH, channels: dC }, left: dateLeft, top: dateTop },
    ])
    .png()
    .toBuffer();

  const filenameSafe = name.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-');

  return new NextResponse(outputBuffer, {
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': `attachment; filename="certificate-${filenameSafe}.png"`,
      'Cache-Control': 'no-store',
    },
  });
}
