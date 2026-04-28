import { NextResponse } from 'next/server';

export async function GET() {
  const expiryDate = process.env.EXPIRY_DATE; // e.g. "2026-05-31"
  if (!expiryDate) {
    return NextResponse.json({ expired: false, expiryDate: null });
  }
  const now = new Date();
  const expiry = new Date(expiryDate);
  expiry.setHours(23, 59, 59, 999); // expires at end of day
  return NextResponse.json({ expired: now > expiry, expiryDate });
}
