import { NextResponse } from 'next/server';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

export async function GET() {
  try {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return NextResponse.json({ error: 'Not configured' }, { status: 500 });
    }
    const headers = {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
    };
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/events?select=type,name,created_at&order=created_at.desc&limit=1000`,
      { headers }
    );
    const events = await res.json();
    const visits = events.filter(e => e.type === 'visit');
    const downloads = events.filter(e => e.type === 'download');
    const nameCounts = {};
    downloads.forEach(e => {
      if (e.name) nameCounts[e.name] = (nameCounts[e.name] || 0) + 1;
    });
    const topNames = Object.entries(nameCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([name, count]) => ({ name, count }));
    const days = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      days[d.toISOString().slice(0, 10)] = { visits: 0, downloads: 0 };
    }
    events.forEach(e => {
      const day = e.created_at.slice(0, 10);
      if (days[day]) days[day][e.type === 'visit' ? 'visits' : 'downloads']++;
    });
    return NextResponse.json({
      totalVisits: visits.length,
      totalDownloads: downloads.length,
      topNames,
      daily: Object.entries(days).map(([date, counts]) => ({ date, ...counts })),
      recentDownloads: downloads.slice(0, 10).map(e => ({ name: e.name, time: e.created_at })),
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
