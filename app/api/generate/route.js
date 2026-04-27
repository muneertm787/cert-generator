import { NextResponse } from 'next/server';
import { createCanvas, loadImage, registerFont } from 'canvas';
import path from 'path';
import fs from 'fs';

export async function POST(request) {
  try {
    const { name } = await request.json();

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Load the certificate template
    const templatePath = path.join(process.cwd(), 'public', 'certificate-template.png');
    const templateBuffer = fs.readFileSync(templatePath);
    const templateImage = await loadImage(templateBuffer);

    const width = templateImage.width;
    const height = templateImage.height;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Draw the template
    ctx.drawImage(templateImage, 0, 0, width, height);

    // ---- Name overlay ----
    // Cover the original name area with a rectangle matching background
    // The name area: roughly y=405 to y=460, centered
    const nameY = Math.round(height * 0.418);
    const nameCenterX = Math.round(width * 0.5);

    // Clear original name with background-matching color
    ctx.fillStyle = '#f5f0e8';
    ctx.fillRect(nameCenterX - 520, nameY - 38, 1040, 55);

    // Draw new name in same italic script style
    const fontSize = Math.round(height * 0.052);
    ctx.font = `italic ${fontSize}px Georgia, "Times New Roman", serif`;
    ctx.fillStyle = '#1a1a2e';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Handle long names by scaling down font
    let finalFontSize = fontSize;
    const maxWidth = width * 0.65;
    ctx.font = `italic ${finalFontSize}px Georgia, "Times New Roman", serif`;
    let textWidth = ctx.measureText(name.trim()).width;
    while (textWidth > maxWidth && finalFontSize > 20) {
      finalFontSize -= 2;
      ctx.font = `italic ${finalFontSize}px Georgia, "Times New Roman", serif`;
      textWidth = ctx.measureText(name.trim()).width;
    }

    ctx.fillText(name.trim(), nameCenterX, nameY);

    // Convert to PNG buffer
    const buffer = canvas.toBuffer('image/png');

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="certificate-${name.replace(/\s+/g, '-')}.png"`,
      },
    });
  } catch (error) {
    console.error('Error generating certificate:', error);
    return NextResponse.json({ error: 'Failed to generate certificate' }, { status: 500 });
  }
}
