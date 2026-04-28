'use client';
import { useEffect, useState } from 'react';

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  const refresh = () => {
    setLoading(true);
    fetch('/api/stats')
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false); });
  };

  const cardStyle = {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: '20px 24px',
    flex: 1,
    minWidth: 140,
    textAlign: 'center',
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui', color: '#666' }}>
      Loading stats…
    </div>
  );

  if (error || stats?.error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui', color: '#b22222', textAlign: 'center', padding: 32 }}>
      <div>
        <div style={{ fontSize: '1.2rem', marginBottom: 8 }}>⚠ Supabase not connected</div>
        <div style={{ fontSize: '0.9rem', color: '#666' }}>Add SUPABASE_URL and SUPABASE_ANON_KEY to Vercel environment variables.</div>
      </div>
    </div>
  );

  const maxDaily = Math.max(...(stats.daily || []).map(d => Math.max(d.visits, d.downloads)), 1);

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', fontFamily: 'system-ui, sans-serif', padding: '32px 16px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.4rem', color: '#111' }}>Certificate Analytics</h1>
            <p style={{ margin: '4px 0 0', color: '#666', fontSize: '0.85rem' }}>Ghaith Al Emarat Volunteering Team</p>
          </div>
          <button onClick={refresh} style={{ padding: '8px 16px', background: '#b22222', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '0.85rem' }}>
            ↻ Refresh
          </button>
        </div>

        {/* Summary cards */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <div style={cardStyle}>
            <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: 4 }}>Total Visits</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#111' }}>{stats.totalVisits}</div>
          </div>
          <div style={cardStyle}>
            <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: 4 }}>Total Downloads</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#b22222' }}>{stats.totalDownloads}</div>
          </div>
          <div style={cardStyle}>
            <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: 4 }}>Unique Names</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#111' }}>{stats.topNames?.length || 0}</div>
          </div>
        </div>

        {/* Bar chart - last 7 days */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px 24px', marginBottom: 24 }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#111', marginBottom: 16 }}>Last 7 Days</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
            {(stats.daily || []).map(d => (
              <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: 90, gap: 2 }}>
                  <div title={`${d.visits} visits`} style={{ width: '100%', height: `${Math.round((d.visits / maxDaily) * 80)}px`, minHeight: d.visits > 0 ? 4 : 0, background: '#3b82f6', borderRadius: '3px 3px 0 0' }} />
                  <div title={`${d.downloads} downloads`} style={{ width: '100%', height: `${Math.round((d.downloads / maxDaily) * 80)}px`, minHeight: d.downloads > 0 ? 4 : 0, background: '#b22222', borderRadius: '3px 3px 0 0' }} />
                </div>
                <div style={{ fontSize: '10px', color: '#999' }}>{d.date.slice(5)}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12px', color: '#666' }}>
              <div style={{ width: 10, height: 10, background: '#3b82f6', borderRadius: 2 }} /> Visits
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12px', color: '#666' }}>
              <div style={{ width: 10, height: 10, background: '#b22222', borderRadius: 2 }} /> Downloads
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, flexWrap: 'wrap' }}>
          {/* Top names */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px 24px' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#111', marginBottom: 12 }}>Top Certificate Names</div>
            {stats.topNames?.length === 0 && <div style={{ color: '#999', fontSize: '0.85rem' }}>No downloads yet</div>}
            {stats.topNames?.map((n, i) => (
              <div key={n.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: i < stats.topNames.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                <span style={{ fontSize: '0.85rem', color: '#333' }}>{n.name}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#b22222' }}>{n.count}</span>
              </div>
            ))}
          </div>

          {/* Recent downloads */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px 24px' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#111', marginBottom: 12 }}>Recent Downloads</div>
            {stats.recentDownloads?.length === 0 && <div style={{ color: '#999', fontSize: '0.85rem' }}>No downloads yet</div>}
            {stats.recentDownloads?.map((d, i) => (
              <div key={i} style={{ padding: '6px 0', borderBottom: i < stats.recentDownloads.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                <div style={{ fontSize: '0.85rem', color: '#333' }}>{d.name}</div>
                <div style={{ fontSize: '11px', color: '#999' }}>{new Date(d.time).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
