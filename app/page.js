'use client';
import { useState, useRef, useEffect } from 'react';

export default function Home() {
  const [name, setName] = useState('');
  const [previewName, setPreviewName] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);

  const drawCertificate = (nameText) => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !imageLoaded) return;

    const ctx = canvas.getContext('2d');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    ctx.drawImage(img, 0, 0);

    if (!nameText) return;

    const width = canvas.width;
    const height = canvas.height;
    const nameY = Math.round(height * 0.418);
    const nameCenterX = Math.round(width * 0.5);

    // Erase original name area
    ctx.fillStyle = '#f5f0e8';
    ctx.fillRect(nameCenterX - 530, nameY - 40, 1060, 58);

    // Draw new name in matching italic style
    let fontSize = Math.round(height * 0.052);
    const maxWidth = width * 0.64;
    ctx.font = `italic ${fontSize}px Georgia, "Times New Roman", serif`;
    while (ctx.measureText(nameText).width > maxWidth && fontSize > 20) {
      fontSize -= 2;
      ctx.font = `italic ${fontSize}px Georgia, "Times New Roman", serif`;
    }

    ctx.fillStyle = '#1a1a2e';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(nameText, nameCenterX, nameY);
  };

  useEffect(() => {
    if (imageLoaded) drawCertificate(previewName);
  }, [previewName, imageLoaded]);

  const handlePreview = () => {
    if (!name.trim()) return;
    setPreviewName(name.trim());
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageLoaded) return;
    const finalName = name.trim() || previewName;
    if (!finalName) return;

    drawCertificate(finalName);
    setDownloading(true);
    setTimeout(() => {
      const link = document.createElement('a');
      link.download = `certificate-${finalName.replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setDownloading(false);
    }, 100);
  };

  return (
    <main className="main">
      <div className="header">
        <div className="logo">🏅</div>
        <h1>Certificate Generator</h1>
        <p>Ghaith Al Emarat Volunteering Team — Proud of UAE</p>
      </div>

      <div className="card">
        <label htmlFor="nameInput">Recipient Name</label>
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
        <div className="btn-row">
          <button onClick={handlePreview} className="btn btn-preview" disabled={!name.trim()}>
            👁 Preview
          </button>
          <button
            onClick={handleDownload}
            className="btn btn-download"
            disabled={downloading || (!previewName && !name.trim())}
          >
            {downloading ? '⏳ Saving…' : '⬇ Download PNG'}
          </button>
        </div>
      </div>

      <div className="preview-section">
        <h2>Certificate Preview</h2>
        <div className="canvas-wrapper">
          <img
            ref={imgRef}
            src="/certificate-template.png"
            alt="template"
            style={{ display: 'none' }}
            onLoad={() => setImageLoaded(true)}
          />
          <canvas ref={canvasRef} className="cert-canvas" />
          {!imageLoaded && (
            <div className="overlay">Loading template…</div>
          )}
          {imageLoaded && !previewName && (
            <div className="overlay">Enter a name above and click Preview</div>
          )}
        </div>
        {previewName && (
          <p className="preview-label">Showing: <strong>{previewName}</strong></p>
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
        .header { text-align: center; margin-bottom: 36px; }
        .logo { font-size: 48px; margin-bottom: 12px; }
        .header h1 {
          font-size: clamp(1.8rem, 4vw, 2.8rem);
          font-weight: 700;
          background: linear-gradient(90deg, #e8c96d, #f5e4a0, #c8963c);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 8px;
        }
        .header p { color: #8aacc8; font-size: 1rem; }
        .card {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 16px;
          padding: 32px;
          max-width: 680px;
          margin: 0 auto 40px;
        }
        label {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          color: #a8c8e8;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .name-input {
          width: 100%;
          background: rgba(255,255,255,0.08);
          border: 1.5px solid rgba(255,255,255,0.2);
          border-radius: 10px;
          padding: 14px 18px;
          font-size: 1.1rem;
          color: #fff;
          outline: none;
          transition: border-color 0.2s;
          margin-bottom: 16px;
        }
        .name-input::placeholder { color: rgba(255,255,255,0.3); }
        .name-input:focus { border-color: #e8c96d; }
        .btn-row { display: flex; gap: 12px; flex-wrap: wrap; }
        .btn {
          flex: 1; min-width: 140px;
          padding: 14px 24px;
          border: none; border-radius: 10px;
          font-size: 1rem; font-weight: 600;
          cursor: pointer; transition: all 0.2s;
        }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-preview {
          background: rgba(255,255,255,0.1);
          border: 1.5px solid rgba(255,255,255,0.25);
          color: #fff;
        }
        .btn-preview:hover:not(:disabled) { background: rgba(255,255,255,0.18); }
        .btn-download {
          background: linear-gradient(135deg, #c8963c, #e8c96d);
          color: #1a1000;
        }
        .btn-download:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(200,150,60,0.4);
        }
        .preview-section { max-width: 960px; margin: 0 auto; text-align: center; }
        .preview-section h2 {
          font-size: 1.1rem; font-weight: 600;
          color: #a8c8e8; text-transform: uppercase;
          letter-spacing: 2px; margin-bottom: 20px;
        }
        .canvas-wrapper {
          position: relative;
          background: rgba(0,0,0,0.3);
          border-radius: 12px; overflow: hidden;
          border: 1px solid rgba(255,255,255,0.1);
          min-height: 200px;
        }
        .cert-canvas { width: 100%; height: auto; display: block; }
        .overlay {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.4); font-size: 1rem;
        }
        .preview-label { margin-top: 14px; font-size: 0.95rem; color: #8aacc8; }
        .preview-label strong { color: #e8c96d; }
      `}</style>
    </main>
  );
}
