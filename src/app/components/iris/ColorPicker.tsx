import exampleImage1 from 'figma:asset/9002480c806d2c7adc3c655220e291bf769b506a.png';
import exampleImage2 from 'figma:asset/96f02ba5b4911e9e58deea502147c8ff134be5ae.png';
import exampleImage3 from 'figma:asset/4a4b8a14fce613d111829123ce5ede1268a82da7.png';
import exampleImage4 from 'figma:asset/d44145ecbc42269f8c2f69423a1a8c654dda5c27.png';
import exampleImage5 from 'figma:asset/f38eb21dd656849d7cf03c65fe256ba96310cb39.png';
import exampleImage6 from 'figma:asset/6aaef60ac79bb84ea88431df4240350246042a68.png';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { extractColors, Color } from './ColorExtractor';
import { ColorWheel } from './ColorWheel';
import { PaletteStrip, PaletteEntry } from './PaletteStrip';
import { CreatedByLink } from './CreatedByLink';
import { AddOwnMenu } from './AddOwnMenu';

let nextId = 1;

const ARENA_PALETTE_SLUG = 'color-palette-qtw3s8lypli';
const FALLBACK_EXAMPLES = [exampleImage1, exampleImage2, exampleImage3, exampleImage4, exampleImage5, exampleImage6];

export function ColorPicker() {
  const [exampleImages, setExampleImages] = useState<string[]>(FALLBACK_EXAMPLES);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [colors, setColors] = useState<Color[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paletteEntries, setPaletteEntries] = useState<PaletteEntry[]>([]);
  const [selectedSegmentIndex, setSelectedSegmentIndex] = useState<number | null>(null);
  const [visibleColorIndices, setVisibleColorIndices] = useState<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pull the "try an example" thumbnails live from the are.na color-palette channel.
  useEffect(() => {
    let cancelled = false;
    fetch(`https://api.are.na/v2/channels/${ARENA_PALETTE_SLUG}?per=12`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const urls: string[] = (data.contents || [])
          .map((c: any) => c.image?.display?.url || c.image?.original?.url)
          .filter(Boolean)
          .slice(0, 6);
        if (urls.length) setExampleImages(urls);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // Load an example image by converting it to a data URL
  const handleExampleClick = (src: string) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      setImageSrc(canvas.toDataURL('image/png'));
    };
    img.src = src;
  };

  // Handle paste from clipboard
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
              const result = ev.target?.result as string;
              setImageSrc(result);
            };
            reader.readAsDataURL(file);
          }
          break;
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  useEffect(() => {
    if (!imageSrc) return;
    let cancelled = false;
    setIsProcessing(true);
    setPaletteEntries((prev) => prev.filter((e) => e.locked));
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      if (cancelled) return;
      try {
        const extractedColors = extractColors(img, 12);
        setColors(extractedColors);
      } catch (err) {
        console.error('Error extracting colors:', err);
      } finally {
        setIsProcessing(false);
      }
    };

    img.onerror = () => {
      if (cancelled) return;
      console.error('Error loading image');
      setIsProcessing(false);
    };

    img.src = imageSrc;

    return () => {
      cancelled = true;
    };
  }, [imageSrc]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImageSrc(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSelectSegment = (index: number | null) => {
    setSelectedSegmentIndex(index);
    if (index !== null && colors[index]) {
      const color = colors[index];
      const last = paletteEntries[paletteEntries.length - 1];
      if (last && last.color.hex === color.hex) return;

      setPaletteEntries((prev) => [
        ...prev,
        { id: `swatch-${nextId++}`, color },
      ]);
    }
  };

  const handleRemove = useCallback((id: string) => {
    setPaletteEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const handleClear = useCallback(() => {
    setPaletteEntries((prev) => prev.filter((e) => e.locked));
  }, []);

  const handleToggleLock = useCallback((id: string) => {
    setPaletteEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, locked: !e.locked } : e))
    );
  }, []);

  const handleAddAll = useCallback(() => {
    const existingHexes = new Set(paletteEntries.map((e) => e.color.hex));
    // Only add colors that are currently visible on the wheel (respects harmony filter)
    const colorsToAdd = visibleColorIndices.length > 0
      ? visibleColorIndices.map(i => colors[i]).filter(Boolean)
      : colors;
    const newEntries = colorsToAdd
      .filter((c) => !existingHexes.has(c.hex))
      .map((color) => ({ id: `swatch-${nextId++}`, color }));
    if (newEntries.length > 0) {
      setPaletteEntries((prev) => [...prev, ...newEntries]);
    }
  }, [colors, paletteEntries, visibleColorIndices]);

  const handlePickColorFromImage = useCallback((color: Color) => {
    // Add as a new segment on the wheel
    setColors((prev) => [...prev, color]);
    // Also add to the palette strip
    setPaletteEntries((prev) => [
      ...prev,
      { id: `swatch-${nextId++}`, color },
    ]);
  }, []);

  const handleVisibleColorsChange = useCallback((indices: number[]) => {
    setVisibleColorIndices(indices);
  }, []);

  // Compute how many new colors "Add All" would add
  const addAllCount = (() => {
    const existingHexes = new Set(paletteEntries.map((e) => e.color.hex));
    const colorsToAdd = visibleColorIndices.length > 0
      ? visibleColorIndices.map(i => colors[i]).filter(Boolean)
      : colors;
    return colorsToAdd.filter((c) => !existingHexes.has(c.hex)).length;
  })();

  const hasColors = colors.length > 0;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-8 pb-56 relative"
      style={{ background: '#ffffff' }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Wheel + palette area */}
      <div className="relative">
        {/* Reference images - stay visible even after an image is picked, so it's easy to try another */}
        <motion.div
          className="fixed z-40 flex flex-col items-center gap-3"
          style={{ left: '24px', top: '50%', y: '-55%' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'spring', stiffness: 170, damping: 26 }}
        >
          <span
            className="text-[10px] tracking-[0.15em] uppercase whitespace-nowrap"
            style={{ color: '#332b2b', fontFamily: "'ETBembo', serif" }}
          >
            Try an example
          </span>
          {exampleImages.map((src, i) => (
            <motion.button
              key={i}
              onClick={() => handleExampleClick(src)}
              className="group cursor-pointer rounded-[10px] overflow-hidden border border-transparent hover:border-[#ccc] transition-all"
              style={{ width: '88px', height: '88px' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i, type: 'spring', stiffness: 170, damping: 26 }}
            >
              <img
                src={src}
                alt={`Example ${i + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </motion.button>
          ))}
          <AddOwnMenu onImageUrl={handleExampleClick} fileInputRef={fileInputRef} />
        </motion.div>

        {/* Wheel column - shifts left smoothly */}
        <motion.div
          className="flex flex-col items-center"
        >
          <div className="relative">
            <ColorWheel
              imageSrc={imageSrc}
              colors={colors}
              onCenterClick={handleUploadClick}
              selectedIndex={selectedSegmentIndex}
              onSelectSegment={handleSelectSegment}
              onPickColorFromImage={handlePickColorFromImage}
              onVisibleColorsChange={handleVisibleColorsChange}
            />

            {/* Processing overlay on the wheel */}
            {isProcessing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-20 rounded-full"
                style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(4px)' }}
              >
                <div
                  className="w-12 h-12 rounded-full border-3 animate-spin"
                  style={{ borderColor: '#222 transparent #999 transparent' }}
                />
                <span
                  className="text-sm tracking-[0.15em] uppercase mt-4"
                  style={{ color: '#3a3a3a', fontFamily: "'ETBembo', serif" }}
                >
                  Analyzing...
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Palette strip - absolutely positioned to the right of center, draggable */}
        <AnimatePresence>
          {hasColors && (
            <motion.div
              className="absolute top-0 flex-shrink-0 z-50"
              style={{ width: '220px', left: 'calc(50% + 310px)', cursor: 'grab' }}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ type: 'spring', stiffness: 170, damping: 26 }}
              drag
              dragMomentum={false}
              whileDrag={{ cursor: 'grabbing', scale: 1.02, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
              dragTransition={{ bounceStiffness: 300, bounceDamping: 30 }}
            >
              {/* Drag handle */}
              <div
                className="flex items-center justify-center py-1.5 mb-1 rounded-t-lg select-none"
                style={{ pointerEvents: 'none' }}
              >
                <div className="flex gap-[3px]">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="w-[3px] h-[3px] rounded-full" style={{ background: '#bbb' }} />
                  ))}
                </div>
              </div>
              <PaletteStrip
                entries={paletteEntries}
                onRemove={handleRemove}
                onClear={handleClear}
                onAddAll={handleAddAll}
                onToggleLock={handleToggleLock}
                addAllCount={addAllCount}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <CreatedByLink />
    </div>
  );
}