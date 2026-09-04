import { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { Color } from './ColorExtractor';

interface ColorDetailPanelProps {
  color: Color;
  onClose: () => void;
}

function rgbToCmyk(r: number, g: number, b: number) {
  const rr = r / 255;
  const gg = g / 255;
  const bb = b / 255;
  const k = 1 - Math.max(rr, gg, bb);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  const c = Math.round(((1 - rr - k) / (1 - k)) * 100);
  const m = Math.round(((1 - gg - k) / (1 - k)) * 100);
  const y = Math.round(((1 - bb - k) / (1 - k)) * 100);
  return { c, m, y, k: Math.round(k * 100) };
}

function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function getWcagRating(ratio: number): { label: string; color: string } {
  if (ratio >= 7) return { label: 'AAA', color: '#22c55e' };
  if (ratio >= 4.5) return { label: 'AA', color: '#65a30d' };
  if (ratio >= 3) return { label: 'AA Large', color: '#ca8a04' };
  return { label: 'Fail', color: '#dc2626' };
}

function copyToClipboard(text: string) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    return true;
  } catch {
    return false;
  }
}

export function ColorDetailPanel({ color, onClose }: ColorDetailPanelProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const cmyk = rgbToCmyk(Math.round(color.r), Math.round(color.g), Math.round(color.b));
  const lum = relativeLuminance(color.r, color.g, color.b);
  const whiteLum = relativeLuminance(255, 255, 255);
  const blackLum = relativeLuminance(0, 0, 0);

  const contrastWhite = contrastRatio(lum, whiteLum);
  const contrastBlack = contrastRatio(lum, blackLum);
  const ratingWhite = getWcagRating(contrastWhite);
  const ratingBlack = getWcagRating(contrastBlack);

  const hexStr = color.hex.toUpperCase();
  const rgbStr = `${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)}`;
  const cmykStr = `${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%`;

  const handleCopy = (value: string, field: string) => {
    if (copyToClipboard(value)) {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
    }
  };

  const luminance = 0.299 * color.r + 0.587 * color.g + 0.114 * color.b;
  const isDark = luminance < 140;

  return (
    <div
      className="w-[300px] rounded-lg overflow-hidden"
      style={{
        background: '#fff',
        border: '1px solid #e5e5e5',
        boxShadow: '0 8px 40px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Color preview header */}
      <div
        className="relative h-[100px] flex items-end p-4"
        style={{ backgroundColor: color.hex }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
          style={{
            background: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.08)',
            color: isDark ? '#fff' : '#333',
          }}
        >
          <X className="w-3.5 h-3.5" />
        </button>
        <div>
          <span
            className="text-[11px] tracking-[0.12em] uppercase opacity-80"
            style={{
              color: isDark ? '#fff' : '#111',
              fontFamily: "'ETBembo', serif",
            }}
          >
            {(color.proportion * 100).toFixed(1)}% dominant
          </span>
        </div>
      </div>

      {/* Color values */}
      <div className="p-4 space-y-3">
        <ColorRow
          label="HEX"
          value={hexStr}
          copyValue={hexStr}
          copied={copiedField === 'hex'}
          onCopy={() => handleCopy(hexStr, 'hex')}
        />
        <ColorRow
          label="RGB"
          value={rgbStr}
          copyValue={`rgb(${rgbStr})`}
          copied={copiedField === 'rgb'}
          onCopy={() => handleCopy(`rgb(${rgbStr})`, 'rgb')}
        />
        <ColorRow
          label="CMYK"
          value={cmykStr}
          copyValue={`cmyk(${cmykStr})`}
          copied={copiedField === 'cmyk'}
          onCopy={() => handleCopy(`cmyk(${cmykStr})`, 'cmyk')}
        />

        {/* Divider */}
        <div className="h-px my-1" style={{ background: '#e5e5e5' }} />

        {/* Contrast ratios */}
        <div>
          <span
            className="text-[10px] tracking-[0.15em] uppercase block mb-2"
            style={{ color: '#777', fontFamily: "'ETBembo', serif" }}
          >
            Accessibility Contrast
          </span>

          <div className="space-y-2">
            {/* vs White */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded border flex items-center justify-center"
                  style={{ backgroundColor: '#ffffff', borderColor: '#e5e5e5' }}
                >
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color.hex }} />
                </div>
                <span
                  className="text-[11px]"
                  style={{ color: '#666', fontFamily: "'ETBembo', serif" }}
                >
                  on White
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-mono" style={{ color: '#333' }}>
                  {contrastWhite.toFixed(2)}:1
                </span>
                <span
                  className="text-[9px] tracking-wider px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: ratingWhite.color + '15',
                    color: ratingWhite.color,
                    fontFamily: "'ETBembo', serif",
                  }}
                >
                  {ratingWhite.label}
                </span>
              </div>
            </div>

            {/* vs Black */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded border flex items-center justify-center"
                  style={{ backgroundColor: '#1a1a1a', borderColor: '#333' }}
                >
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color.hex }} />
                </div>
                <span
                  className="text-[11px]"
                  style={{ color: '#666', fontFamily: "'ETBembo', serif" }}
                >
                  on Black
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-mono" style={{ color: '#333' }}>
                  {contrastBlack.toFixed(2)}:1
                </span>
                <span
                  className="text-[9px] tracking-wider px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: ratingBlack.color + '15',
                    color: ratingBlack.color,
                    fontFamily: "'ETBembo', serif",
                  }}
                >
                  {ratingBlack.label}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ColorRow({
  label,
  value,
  copyValue,
  copied,
  onCopy,
}: {
  label: string;
  value: string;
  copyValue: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-baseline gap-2.5">
        <span
          className="text-[10px] tracking-[0.12em] uppercase w-[38px]"
          style={{ color: '#777', fontFamily: "'ETBembo', serif" }}
        >
          {label}
        </span>
        <span className="text-[13px] font-mono" style={{ color: '#333' }}>
          {value}
        </span>
      </div>
      <button
        onClick={onCopy}
        className="w-6 h-6 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ color: '#777' }}
      >
        {copied ? (
          <Check className="w-3 h-3 text-green-600" />
        ) : (
          <Copy className="w-3 h-3" />
        )}
      </button>
    </div>
  );
}
