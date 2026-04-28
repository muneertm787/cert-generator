'use client';
import { useRef, useState, useEffect } from 'react';

const NAME_Y_FRACTION = 0.555;
const DATE_X_FRACTION = 0.720;
const DATE_Y_FRACTION = 0.860;

function formatDate(date) {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function Home() {
  const [name, setName] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [expired, setExpired] = useState(false);
  const [expiryDate, setExpiryDate] = useState(null);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'visit' }) }).catch(() => {});
    // Check expiry from server
    fetch('/api/expiry').then(r => r.json()).then(data => {
      setExpired(data.expired);
      setExpiryDate(data.expiryDate);
    }).catch(() => {});
  }, []);

  function drawCertificate(canvas, img, nameText) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(img, 0, 0, W, H);
    if (nameText.trim()) {
      const fontSize = Math.round(W * 0.024);
      ctx.font = `bold ${fontSize}px Verdana, Geneva, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#000000';
      ctx.fillText(nameText, W / 2, H * NAME_Y_FRACTION);
    }
    const dateFontSize = Math.round(W * 0.018);
    ctx.font = `bold ${dateFontSize}px Verdana, Geneva, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#000000';
    ctx.fillText(formatDate(new Date()), W * DATE_X_FRACTION, H * DATE_Y_FRACTION);
  }

  useEffect(() => {
    const canvas = canvasRef.current, img = imgRef.current;
    if (!canvas || !img || !img.complete) return;
    drawCertificate(canvas, img, name);
  }, [name]);

  function handleImageLoad() {
    const canvas = canvasRef.current, img = imgRef.current;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    drawCertificate(canvas, img, name);
  }

  async function handleDownload() {
    if (!name.trim() || expired) return;
    setDownloading(true);
    try {
      fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'download', name: name.trim() }) }).catch(() => {});
      const res = await fetch(`/api/generate?name=${encodeURIComponent(name)}`);
      if (res.status === 403) { setExpired(true); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate-${name.replace(/\s+/g, '-')}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  if (expired) {
    return (
      <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 16px', fontFamily: 'Georgia, serif' }}>
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', padding: '48px 40px', maxWidth: 480, width: '100%', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fef2f2', border: '2px solid #fca5a5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 28 }}>
            🔒
          </div>
          <h1 style={{ color: '#b22222', fontSize: '1.5rem', margin: '0 0 12px' }}>Certificate Generator Closed</h1>
          <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: 1.6, margin: '0 0 8px' }}>
            This certificate generator has expired and is no longer accepting requests.
          </p>
          {expiryDate && (
            <p style={{ color: '#999', fontSize: '0.85rem', margin: 0 }}>
              Expired on {new Date(expiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          )}
          <div style={{ marginTop: 24, padding: '12px 16px', background: '#f9fafb', borderRadius: 8, fontSize: '0.85rem', color: '#555' }}>
            Ghaith Al Emarat Volunteering Team
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 16px', fontFamily: 'Georgia, serif' }}>
      <h1 style={{ color: '#b22222', fontSize: '1.6rem', marginBottom: 8, textAlign: 'center' }}>Certificate Generator</h1>
      <p style={{ color: '#555', marginBottom: 24, textAlign: 'center', fontSize: '0.95rem' }}>Ghaith Al Emarat Volunteering Team</p>
      <div style={{ display: 'flex', gap: 12, marginBottom: 28, width: '100%', maxWidth: 560 }}>
        <input type="text" placeholder="Enter recipient name…" value={name} onChange={e => setName(e.target.value)}
          style={{ flex: 1, padding: '12px 16px', fontSize: '1rem', border: '2px solid #ccc', borderRadius: 8, outline: 'none', fontFamily: 'Verdana, sans-serif' }} />
        <button onClick={handleDownload} disabled={!name.trim() || downloading}
          style={{ padding: '12px 22px', background: name.trim() ? '#b22222' : '#ccc', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.95rem', cursor: name.trim() ? 'pointer' : 'not-allowed', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
          {downloading ? 'Generating…' : '⬇ Download'}
        </button>
      </div>
      <img ref={imgRef} src="/certificate-template.png" alt="" style={{ display: 'none' }} onLoad={handleImageLoad} />
      <div style={{ width: '100%', maxWidth: 860, boxShadow: '0 8px 32px rgba(0,0,0,0.18)', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>
    </main>
  );
}
