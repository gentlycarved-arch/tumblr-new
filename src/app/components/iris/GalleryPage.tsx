import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Loader2, Download, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { fetchGalleryEntries, GalleryEntry } from './Gallery';
import { Color } from './ColorExtractor';

function rgbToCmyk(r: number, g: number, b: number) {
  const rr = r / 255;
  const gg = g / 255;
  const bb = b / 255;
  const k = 1 - Math.max(rr, gg, bb);
  if (k >= 1) return { c: 0, m: 0, y: 0, k: 100 };
  const c = Math.round(((1 - rr - k) / (1 - k)) * 100);
  const m = Math.round(((1 - gg - k) / (1 - k)) * 100);
  const y = Math.round(((1 - bb - k) / (1 - k)) * 100);
  return { c, m, y, k: Math.round(k * 100) };
}

function renderPaletteRowBlob(colors: Color[]): Blob {
  const swatchW = 120;
  const swatchH = 90;
  const scale = 2;
  const W = colors.length * swatchW;
  const H = swatchH;

  const canvas = document.createElement('canvas');
  canvas.width = W * scale;
  canvas.height = H * scale;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(scale, scale);

  colors.forEach((color, i) => {
    const x = i * swatchW;
    const cmyk = rgbToCmyk(color.r, color.g, color.b);
    const lum = 0.299 * color.r + 0.587 * color.g + 0.114 * color.b;
    const tc = lum < 140 ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.6)';

    ctx.fillStyle = color.hex;
    ctx.fillRect(x, 0, swatchW, H);

    // Separator
    if (i > 0) {
      ctx.fillStyle = lum < 140 ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)';
      ctx.fillRect(x, 0, 1, H);
    }

    ctx.fillStyle = tc;
    ctx.textAlign = 'left';
    ctx.globalAlpha = 1;
    ctx.font = '11px monospace';
    ctx.fillText(color.hex.toUpperCase(), x + 10, 30);

    ctx.globalAlpha = 0.7;
    ctx.font = '9px monospace';
    ctx.fillText(`R${color.r} G${color.g} B${color.b}`, x + 10, 50);
    ctx.fillText(`C${cmyk.c} M${cmyk.m} Y${cmyk.y} K${cmyk.k}`, x + 10, 64);
    ctx.globalAlpha = 1;
  });

  const dataUrl = canvas.toDataURL('image/png');
  const binary = atob(dataUrl.split(',')[1]);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: 'image/png' });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/* ─── Single Gallery Card ─── */

function GalleryCard({ entry, index }: { entry: GalleryEntry; index: number }) {
  const [saved, setSaved] = useState(false);
  const colors = entry.palette && entry.palette.length > 0 ? entry.palette : entry.colors;

  const handleDownload = useCallback(() => {
    const blob = renderPaletteRowBlob(colors);
    const safeName = (entry.author || 'anonymous').toLowerCase().replace(/\s+/g, '-');
    downloadBlob(blob, `iris-palette-${safeName}.png`);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }, [colors, entry.author]);

  return (
    <motion.div
      className="flex flex-col gap-3"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
    >
      {/* Info row */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <span
            className="text-[11px] tracking-[0.08em]"
            style={{ color: '#555', fontFamily: "'ETBembo', serif" }}
          >
            {entry.author || 'Anonymous'}
          </span>
          <span
            className="text-[10px]"
            style={{ color: '#ccc', fontFamily: "'ETBembo', serif" }}
          >
            {formatDate(entry.createdAt)}
          </span>
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border cursor-pointer transition-all hover:border-[#777] hover:text-[#333] hover:bg-black/[0.03] hover:shadow-[0_2px_12px_rgba(0,0,0,0.08)]"
          style={{
            fontFamily: "'ETBembo', serif",
            fontSize: '10px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: saved ? '#16a34a' : '#888',
            borderColor: saved ? '#86efac' : '#ccc',
            background: saved ? '#f0fdf4' : '#F4F4E8',
          }}
        >
          {saved ? <Check className="w-3 h-3" /> : <Download className="w-3 h-3" />}
          {saved ? 'Saved' : 'Download'}
        </button>
      </div>

      {/* Horizontal palette strip */}
      <div
        className="flex overflow-hidden"
        style={{
          borderRadius: '4px',
          border: '1px solid #d5d5d5',
        }}
      >
        {colors.map((color, i) => {
          const lum = 0.299 * color.r + 0.587 * color.g + 0.114 * color.b;
          const isDark = lum < 140;
          const tc = isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.6)';
          const cmyk = rgbToCmyk(color.r, color.g, color.b);

          return (
            <div
              key={i}
              className="flex-1 flex flex-col justify-center gap-0.5 px-2 py-2"
              style={{
                backgroundColor: color.hex,
                minHeight: '58px',
                borderRight: i < colors.length - 1
                  ? `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}`
                  : undefined,
              }}
            >
              <span className="text-[9px] font-mono tracking-wide" style={{ color: tc }}>
                {color.hex.toUpperCase()}
              </span>
              <span className="text-[7px] font-mono" style={{ color: tc, opacity: 0.7 }}>
                R{Math.round(color.r)} G{Math.round(color.g)} B{Math.round(color.b)}
              </span>
              <span className="text-[7px] font-mono" style={{ color: tc, opacity: 0.7 }}>
                C{cmyk.c} M{cmyk.m} Y{cmyk.y} K{cmyk.k}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ─── Gallery Page ─── */

export function GalleryPage() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<GalleryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchGalleryEntries();
      setEntries(data);
    } catch (err: any) {
      console.error('Error fetching gallery:', err);
      setError(err.message || 'Failed to load gallery');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: '#F4F4E8' }}
    >
      {/* Header */}
      <header
        className="flex items-center gap-4 px-8 py-6"
        style={{ borderBottom: '1px solid #e0e0e0' }}
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer transition-all hover:border-[#777] hover:text-[#333] hover:bg-black/[0.03] hover:shadow-[0_2px_12px_rgba(0,0,0,0.08)]"
          style={{
            fontFamily: "'ETBembo', serif",
            fontSize: '11px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#666',
            borderColor: '#ccc',
          }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>
        <div className="flex-1" />
        <div className="text-center">
          <h1
            className="tracking-[0.2em] uppercase"
            style={{
              fontFamily: "'ETBembo', serif",
              fontSize: '24px',
              color: '#1a1a1a',
            }}
          >
            Gallery
          </h1>
          <p
            className="mt-1"
            style={{
              fontFamily: "'ETBembo', serif",
              fontSize: '12px',
              color: '#888',
              letterSpacing: '0.08em',
            }}
          >
            Community palettes — download any as PNG
          </p>
        </div>
        <div className="flex-1" />
        <div style={{ width: '72px' }} />
      </header>

      {/* Content */}
      <main className="flex-1 px-8 py-10 max-w-[1000px] mx-auto w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#ccc' }} />
            <span
              className="text-xs tracking-[0.12em] uppercase"
              style={{ color: '#888', fontFamily: "'ETBembo', serif" }}
            >
              Loading...
            </span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24">
            <span
              className="text-xs"
              style={{ color: '#c44', fontFamily: "'ETBembo', serif" }}
            >
              {error}
            </span>
            <button
              onClick={loadEntries}
              className="text-xs underline cursor-pointer hover:text-[#555] transition-colors"
              style={{ color: '#666', fontFamily: "'ETBembo', serif" }}
            >
              Retry
            </button>
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24">
            <span
              className="text-sm tracking-[0.1em]"
              style={{ color: '#999', fontFamily: "'ETBembo', serif" }}
            >
              No palettes saved yet
            </span>
            <span
              className="text-xs"
              style={{ color: '#ddd', fontFamily: "'ETBembo', serif" }}
            >
              Be the first to share your palette
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {entries.map((entry, idx) => (
              <GalleryCard key={entry.id} entry={entry} index={idx} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}