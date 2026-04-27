'use client';
import { useState, useRef, useEffect } from 'react';

export default function Home() {
  const [name, setName] = useState('');
  const [previewName, setPreviewName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);

  // Draw certificate preview on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageLoaded) return;

    const img = imgRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    ctx.drawImage(img, 0, 0);

    if (previewName) {
      const width = canvas.width;
      const height = canvas.height;
      const nameY = Math.round(height * 0.418);
      const nameCenterX = Math.round(width * 0.5);

      // Clear original name
      ctx.fillStyle = '#f5f0e8';
      ctx.fillRect(nameCenterX - 520, nameY - 38, 1040, 55);

      // Draw custom name
      let fontSize = Math.round(height * 0.052);
      const maxWidth = width * 0.65;
      ctx.font = `italic ${fontSize}px Georgia, "Times New Roman", serif`;
      let textWidth = ctx.measureText(previewName).width;
      while (textWidth > maxWidth && fontSize > 20) {
        fontSize -= 2;
        ctx.font = `italic ${fontSize}px Georgia, "Times New Roman", serif`;
        textWidth = ctx.measureText(previewName).width;
      }

      ctx.fillStyle = '#1a1a2e';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(previewName, nameCenterX, nameY);
    }
  }, [previewName, imageLoaded]);

  const handlePreview = () => {
    if (!name.trim()) {
      setError('Please enter a name');
      return;
    }
    setError('');
    setPreviewName(name.trim());
  };

  const handleDownload = async () => {
    if (!name.trim()) {
      setError('Please enter a name');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate certificate');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate-${name.trim().replace(/\s+/g, '-')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="main">
      <div className="header">
        <div className="logo">🏅</div>
        <h1>Certificate Generator</h1>
        <p>Ghaith Al Emarat Volunteering Team — Proud of UAE</p>
      </div>

      <div className="card">
        <div className="input-group">
          <label htmlFor="nameInput">Enter Recipient Name</label>
          <div className="input-row">
            <input
              id="nameInput"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePreview()}
              placeholder="e.g. Ahmed Mohammed Al Rashid"
              className="name-input"
              maxLength={80}
            />
          </div>
          {error && <p className="error">{error}</p>}
          <div className="btn-row">
            <button onClick={handlePreview} className="btn btn-preview">
              👁 Preview
            </button>
            <button onClick={handleDownload} className="btn btn-download" disabled={loading}>
              {loading ? (
                <span className="spinner">⏳ Generating…</span>
              ) : (
                '⬇ Download PNG'
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="preview-section">
        <h2>Certificate Preview</h2>
        <div className="canvas-wrapper">
          {/* Hidden original image for canvas source */}
          <img
            ref={imgRef}
            src="/certificate-template.png"
            alt="template"
            style={{ display: 'none' }}
            onLoad={() => setImageLoaded(true)}
          />
          <canvas ref={canvasRef} className="cert-canvas" />
          {!imageLoaded && (
            <div className="loading-overlay">Loading template…</div>
          )}
        </div>
        {previewName && (
          <p className="preview-label">Previewing for: <strong>{previewName}</strong></p>
        )}
      </div>

      <style jsx>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .main {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a1628 0%, #1a2f4a 40%, #0d2035 100%);
          padding: 40px 20px 60px;
          font-family: 'Segoe UI', system-ui, sans-serif;
          color: #fff;
        }

        .header {
          text-align: center;
          margin-bottom: 36px;
        }

        .logo {
          font-size: 48px;
          margin-bottom: 12px;
        }

        .header h1 {
          font-size: clamp(1.8rem, 4vw, 2.8rem);
          font-weight: 700;
          background: linear-gradient(90deg, #e8c96d, #f5e4a0, #c8963c);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 8px;
        }

        .header p {
          color: #8aacc8;
          font-size: 1rem;
          letter-spacing: 0.5px;
        }

        .card {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 16px;
          padding: 32px;
          max-width: 680px;
          margin: 0 auto 40px;
          backdrop-filter: blur(10px);
        }

        .input-group label {
          display: block;
          font-size: 0.9rem;
          font-weight: 600;
          color: #a8c8e8;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .input-row {
          display: flex;
          gap: 0;
        }

        .name-input {
          flex: 1;
          background: rgba(255,255,255,0.08);
          border: 1.5px solid rgba(255,255,255,0.2);
          border-radius: 10px;
          padding: 14px 18px;
          font-size: 1.1rem;
          color: #fff;
          outline: none;
          transition: border-color 0.2s;
          width: 100%;
        }

        .name-input::placeholder { color: rgba(255,255,255,0.3); }
        .name-input:focus { border-color: #e8c96d; }

        .error {
          color: #ff7070;
          font-size: 0.85rem;
          margin-top: 8px;
        }

        .btn-row {
          display: flex;
          gap: 12px;
          margin-top: 20px;
          flex-wrap: wrap;
        }

        .btn {
          flex: 1;
          min-width: 140px;
          padding: 14px 24px;
          border: none;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-preview {
          background: rgba(255,255,255,0.1);
          border: 1.5px solid rgba(255,255,255,0.25);
          color: #fff;
        }
        .btn-preview:hover { background: rgba(255,255,255,0.18); }

        .btn-download {
          background: linear-gradient(135deg, #c8963c, #e8c96d);
          color: #1a1000;
        }
        .btn-download:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(200,150,60,0.4); }
        .btn-download:disabled { opacity: 0.6; cursor: not-allowed; }

        .preview-section {
          max-width: 960px;
          margin: 0 auto;
          text-align: center;
        }

        .preview-section h2 {
          font-size: 1.3rem;
          font-weight: 600;
          color: #a8c8e8;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 20px;
        }

        .canvas-wrapper {
          position: relative;
          background: rgba(0,0,0,0.3);
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .cert-canvas {
          width: 100%;
          height: auto;
          display: block;
        }

        .loading-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,0.5);
          color: #aaa;
          font-size: 1.1rem;
        }

        .preview-label {
          margin-top: 14px;
          font-size: 0.95rem;
          color: #8aacc8;
        }

        .preview-label strong {
          color: #e8c96d;
        }
      `}</style>
    </main>
  );
}
