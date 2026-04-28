'use client';

import { useRef, useState, useEffect } from 'react';

export default function Home() {
  const [name, setName] = useState('');
  const [downloading, setDownloading] = useState(false);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);

  const NAME_Y_FRACTION = 0.555; // moved a little down from 0.535

  function drawCertificate(canvas, img, nameText) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(img, 0, 0, W, H);

    if (!nameText.trim()) return;

    const nameY = H * NAME_Y_FRACTION;
    const fontSize = Math.round(W * 0.055) - 8; // 2pt less than previous (which was already -2)
    ctx.font = `bold ${fontSize}px Consolas, monospace`;
    ctx.textAlign = 'center';
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#1a1a1a';
    ctx.fillText(nameText, W / 2, nameY);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !img.complete) return;
    drawCertificate(canvas, img, name);
  }, [name]);

  function handleImageLoad() {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    drawCertificate(canvas, img, name);
  }

  async function handleDownload() {
    if (!name.trim()) return;
    setDownloading(true);
    try {
      const res = await fetch(`/api/generate?name=${encodeURIComponent(name)}`);
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

  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '32px 16px',
      fontFamily: 'Georgia, serif',
    }}>
      <h1 style={{ color: '#b22222', fontSize: '1.6rem', marginBottom: 8, textAlign: 'center' }}>
        Certificate Generator
      </h1>
      <p style={{ color: '#555', marginBottom: 24, textAlign: 'center', fontSize: '0.95rem' }}>
        Ghaith Al Emarat Volunteering Team
      </p>

      <div style={{ display: 'flex', gap: 12, marginBottom: 28, width: '100%', maxWidth: 560 }}>
        <input
          type="text"
          placeholder="Enter recipient name…"
          value={name}
          onChange={e => setName(e.target.value)}
          style={{
            flex: 1,
            padding: '12px 16px',
            fontSize: '1rem',
            border: '2px solid #ccc',
            borderRadius: 8,
            outline: 'none',
            fontFamily: 'Consolas, monospace',
          }}
        />
        <button
          onClick={handleDownload}
          disabled={!name.trim() || downloading}
          style={{
            padding: '12px 22px',
            background: name.trim() ? '#b22222' : '#ccc',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: '0.95rem',
            cursor: name.trim() ? 'pointer' : 'not-allowed',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
          }}
        >
          {downloading ? 'Generating…' : '⬇ Download'}
        </button>
      </div>

      <img
        ref={imgRef}
        src="/certificate-template.png"
        alt=""
        style={{ display: 'none' }}
        onLoad={handleImageLoad}
      />

      <div style={{
        width: '100%',
        maxWidth: 860,
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        borderRadius: 12,
        overflow: 'hidden',
        background: '#fff',
      }}>
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      </div>
    </main>
  );
}
