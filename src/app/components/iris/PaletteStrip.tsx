import { useState, useCallback } from 'react';
import { X, Check, Trash2, Download, PlusCircle, Lock, Unlock } from 'lucide-react';
import { Color } from './ColorExtractor';

export interface PaletteEntry {
  id: string;
  color: Color;
  locked?: boolean;
}

interface PaletteStripProps {
  entries: PaletteEntry[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onAddAll?: () => void;
  onToggleLock?: (id: string) => void;
  addAllCount?: number;
}

/* ─── CMYK from RGB ─── */

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

/* ─── Render palette to PNG blob (fully synchronous — no toBlob callback) ─── */

function renderPaletteBlob(entries: PaletteEntry[]): Blob {
  const W = 220;
  const H = 90;
  const scale = 2;
  const totalH = entries.length * H;

  const canvas = document.createElement('canvas');
  canvas.width = W * scale;
  canvas.height = totalH * scale;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(scale, scale);

  entries.forEach((entry, i) => {
    const y = i * H;
    const { color } = entry;
    const cmyk = rgbToCmyk(color.r, color.g, color.b);
    const lum = 0.299 * color.r + 0.587 * color.g + 0.114 * color.b;
    const tc = lum < 140 ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.6)';

    ctx.fillStyle = color.hex;
    ctx.fillRect(0, y, W, H);

    ctx.fillStyle = lum < 140 ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)';
    ctx.fillRect(0, y + H - 1, W, 1);

    ctx.textAlign = 'left';
    ctx.fillStyle = tc;
    ctx.globalAlpha = 1;
    ctx.font = '13px monospace';
    ctx.fillText(color.hex.toUpperCase(), 16, y + 32);

    ctx.globalAlpha = 0.75;
    ctx.font = '12px monospace';
    ctx.fillText(`R${Math.round(color.r)}  G${Math.round(color.g)}  B${Math.round(color.b)}`, 16, y + 52);
    ctx.fillText(`C${cmyk.c}  M${cmyk.m}  Y${cmyk.y}  K${cmyk.k}`, 16, y + 68);
    ctx.globalAlpha = 1;
  });

  // Synchronous: dataURL → binary → Blob (no async gap, preserves user gesture)
  const dataUrl = canvas.toDataURL('image/png');
  const binary = atob(dataUrl.split(',')[1]);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: 'image/png' });
}

/* ─── Download blob as file ─── */

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

/* ─── Single Swatch Row ─── */

function SwatchRow({ entry, onRemove, onToggleLock }: { entry: PaletteEntry; onRemove: (id: string) => void; onToggleLock?: (id: string) => void }) {
  const { color } = entry;
  const luminance = 0.299 * color.r + 0.587 * color.g + 0.114 * color.b;
  const isDark = luminance < 140;
  const textColor = isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.6)';
  const cmyk = rgbToCmyk(color.r, color.g, color.b);

  return (
    <div className="relative group" style={{ width: '100%' }}>
      <div
        className="w-full px-4 py-4 flex flex-col justify-center gap-1"
        style={{
          backgroundColor: color.hex,
          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'}`,
          minHeight: '90px',
        }}
      >
        <span className="text-[13px] tracking-wide font-mono" style={{ color: textColor }}>
          {color.hex.toUpperCase()}
        </span>
        <span className="text-[12px] tracking-wide font-mono" style={{ color: textColor, opacity: 0.75 }}>
          R{Math.round(color.r)} G{Math.round(color.g)} B{Math.round(color.b)}
        </span>
        <span className="text-[12px] tracking-wide font-mono" style={{ color: textColor, opacity: 0.75 }}>
          C{cmyk.c} M{cmyk.m} Y{cmyk.y} K{cmyk.k}
        </span>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onRemove(entry.id); }}
        className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          background: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.08)',
          color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.45)',
        }}
        title="Remove"
      >
        <X className="w-3 h-3" />
      </button>

      {onToggleLock && (
        <button
          onClick={(e) => { e.stopPropagation(); onToggleLock(entry.id); }}
          className={`absolute bottom-2 right-2 w-5 h-5 rounded-full flex items-center justify-center transition-opacity ${entry.locked ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'}`}
          style={{
            background: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.08)',
            color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.45)',
          }}
          title={entry.locked ? 'Unlock color' : 'Lock color'}
        >
          {entry.locked ? <Lock className="w-2.5 h-2.5" /> : <Unlock className="w-2.5 h-2.5" />}
        </button>
      )}
    </div>
  );
}

/* ─── Main PaletteStrip ─── */

export function PaletteStrip({ entries, onRemove, onClear, onAddAll, onToggleLock, addAllCount }: PaletteStripProps) {
  const [feedback, setFeedback] = useState<null | 'saved'>(null);

  const handleDownload = useCallback(() => {
    const blob = renderPaletteBlob(entries);
    downloadBlob(blob, 'iris-palette.png');
    setFeedback('saved');
    setTimeout(() => setFeedback(null), 2500);
  }, [entries]);

  const isEmpty = entries.length === 0;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="flex flex-col overflow-hidden palette-scroll"
        style={{
          width: '220px',
          maxHeight: '720px',
          border: '1px solid #d5d5d5',
          borderRadius: '4px',
          background: '#F4F4E8',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: '1px solid #d5d5d5' }}>
          <span
            className="text-[9px] tracking-[0.15em] uppercase"
            style={{ color: '#777', fontFamily: "'ETBembo', serif" }}
          >
            Palette {!isEmpty && <>&middot; {entries.length}</>}
          </span>
        </div>

        {/* Actions */}
        {onAddAll && (
          <div className="flex" style={{ borderBottom: '1px solid #d5d5d5' }}>
            <button
              onClick={onAddAll}
              disabled={addAllCount === 0}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 transition-all cursor-pointer hover:bg-black/[0.05] disabled:opacity-40 disabled:cursor-default disabled:hover:bg-transparent"
              style={{
                color: '#666',
                background: '#F4F4E8',
              }}
              title="Add all visible wheel colors to palette"
            >
              <div className="flex items-center gap-1.5">
                <PlusCircle className="w-3 h-3" />
                <span className="text-[9px] tracking-[0.1em] uppercase" style={{ fontFamily: "'ETBembo', serif" }}>
                  Add All{addAllCount !== undefined ? ` (${addAllCount})` : ''}
                </span>
              </div>
            </button>
          </div>
        )}

        <div className="flex" style={{ borderBottom: isEmpty ? 'none' : '1px solid #d5d5d5' }}>
          {/* Download PNG */}
          <button
            onClick={handleDownload}
            disabled={isEmpty}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 transition-all cursor-pointer hover:bg-black/[0.05] disabled:opacity-40 disabled:cursor-default disabled:hover:bg-transparent"
            style={{
              color: feedback === 'saved' ? '#16a34a' : '#888',
              borderRight: '1px solid #d5d5d5',
              background: feedback === 'saved' ? '#f0fdf4' : '#F4F4E8',
            }}
            title="Download palette as PNG"
          >
            <div className="flex items-center gap-1.5">
              {feedback === 'saved' ? <Check className="w-3 h-3" /> : <Download className="w-3 h-3" />}
              <span className="text-[9px] tracking-[0.1em] uppercase" style={{ fontFamily: "'ETBembo', serif" }}>
                {feedback === 'saved' ? 'Saved' : 'Save'}
              </span>
            </div>
          </button>

          {/* Clear */}
          <button
            onClick={onClear}
            disabled={isEmpty}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 transition-colors cursor-pointer hover:bg-black/[0.05] disabled:opacity-40 disabled:cursor-default disabled:hover:bg-transparent"
            style={{ color: '#999', background: '#F4F4E8' }}
            title="Clear all"
          >
            <Trash2 className="w-3 h-3" />
            <span className="text-[9px] tracking-[0.1em] uppercase" style={{ fontFamily: "'ETBembo', serif" }}>
              Clear
            </span>
          </button>
        </div>

        {/* Empty state hint */}
        {isEmpty && (
          <div
            className="flex flex-col items-center justify-center py-8 px-4"
            style={{ minHeight: '120px' }}
          >
            <span
              className="text-[10px] tracking-[0.12em] uppercase text-center leading-relaxed"
              style={{ color: '#999', fontFamily: "'ETBembo', serif" }}
            >
              Click segments to<br />build your palette
            </span>
          </div>
        )}

        {/* Swatches */}
        {!isEmpty && (
          <div className="flex flex-col flex-1 min-h-0 overflow-y-auto palette-scroll">
            {entries.map((entry) => (
              <SwatchRow key={entry.id} entry={entry} onRemove={onRemove} onToggleLock={onToggleLock} />
            ))}
          </div>
        )}
      </div>

      {/* Toast */}
      {feedback && (
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-full"
          style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <Check className="w-3 h-3" style={{ color: '#16a34a' }} />
          <span
            className="text-[10px] tracking-[0.05em]"
            style={{ color: '#15803d', fontFamily: "'ETBembo', serif" }}
          >
            Saved as iris-palette.png
          </span>
        </div>
      )}
    </div>
  );
}