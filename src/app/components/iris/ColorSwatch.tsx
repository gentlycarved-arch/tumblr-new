import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Color } from './ColorExtractor';

interface ColorSwatchProps {
  color: Color;
  index: number;
}

export function ColorSwatch({ color, index }: ColorSwatchProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(color.hex.toUpperCase());
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Determine if text should be light or dark based on background
  const luminance = 0.299 * color.r + 0.587 * color.g + 0.114 * color.b;
  const textColor = luminance > 140 ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.9)';

  return (
    <div
      className="relative group cursor-pointer transition-transform duration-200 hover:scale-110 hover:z-10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCopy}
    >
      <div
        className="w-[72px] h-[72px] rounded-lg shadow-md flex items-end justify-center pb-1.5 transition-shadow duration-200 hover:shadow-xl"
        style={{ backgroundColor: color.hex }}
      >
        <span
          className="text-[11px] font-mono opacity-60 transition-opacity duration-200"
          style={{ color: textColor }}
        >
          {index + 1}
        </span>
      </div>

      {/* Hex tooltip on hover */}
      {isHovered && (
        <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 bg-black/85 text-white px-2.5 py-1 rounded-md text-xs font-mono whitespace-nowrap z-20 flex items-center gap-1.5 backdrop-blur-sm">
          {copied ? (
            <>
              <Check className="w-3 h-3 text-green-400" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-2.5 h-2.5 opacity-60" />
              <span>{color.hex.toUpperCase()}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
