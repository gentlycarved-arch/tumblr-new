import { SaveDialog } from './SaveDialog';
import { Grid3x3, Save, Check } from 'lucide-react';

import exampleImage1 from 'figma:asset/9002480c806d2c7adc3c655220e291bf769b506a.png';
import exampleImage2 from 'figma:asset/96f02ba5b4911e9e58deea502147c8ff134be5ae.png';
import exampleImage3 from 'figma:asset/4a4b8a14fce613d111829123ce5ede1268a82da7.png';
import exampleImage4 from 'figma:asset/d44145ecbc42269f8c2f69423a1a8c654dda5c27.png';
import exampleImage5 from 'figma:asset/f38eb21dd656849d7cf03c65fe256ba96310cb39.png';
import exampleImage6 from 'figma:asset/6aaef60ac79bb84ea88431df4240350246042a68.png';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { extractColors, Color } from './ColorExtractor';
import { ColorWheel } from './ColorWheel';
import { PaletteStrip, PaletteEntry } from './PaletteStrip';
import { saveToGallery } from './Gallery';

// Resize image to a thumbnail for gallery storage
function resizeImageForGallery(dataUrl: string, maxSize: number = 400): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

let nextId = 1;

const ARENA_PALETTE_SLUG = 'color-palette-qtw3s8lypli';
const FALLBACK_EXAMPLES = [exampleImage1, exampleImage2, exampleImage3, exampleImage4, exampleImage5, exampleImage6];

export function ColorPicker() {
  const navigate = useNavigate();
  const [exampleImages, setExampleImages] = useState<string[]>(FALLBACK_EXAMPLES);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [colors, setColors] = useState<Color[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paletteEntries, setPaletteEntries] = useState<PaletteEntry[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
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

  const handleSaveToGallery = async (authorName: string) => {
    if (colors.length === 0 || saving || !imageSrc) return;
    setSaving(true);
    const thumbnail = await resizeImageForGallery(imageSrc);
    const ok = await saveToGallery({
      colors,
      palette: paletteEntries.map((e) => e.color),
      title: `Palette · ${colors.length} colors`,
      author: authorName,
      imageSrc: thumbnail,
    });
    setSaving(false);
    if (ok) {
      setSaveDialogOpen(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

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
  const [examplesHover, setExamplesHover] = useState(false);
  const showExamples = !hasColors || examplesHover;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-8 pb-56 relative"
      style={{ background: '#F4F4E8' }}
    >
      {/* Gallery button - top left */}
      <button
        onClick={() => navigate('/iris/gallery')}
        className="fixed top-6 left-6 z-40 flex items-center gap-2 px-4 py-2 rounded-full border cursor-pointer transition-all hover:border-[#777] hover:text-[#333] hover:bg-black/[0.03] hover:shadow-[0_2px_12px_rgba(0,0,0,0.08)]"
        style={{
          fontFamily: "'ETBembo', serif",
          fontSize: '11px',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: '#666',
          borderColor: '#ccc',
          background: 'rgba(244,244,232,0.9)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <Grid3x3 className="w-3.5 h-3.5" />
        Gallery
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Header - always centered */}
      <motion.div
        className="text-center mb-16"
      >
        <h1
          className="tracking-[0.08em]"
          style={{
            color: '#736A6A',
            fontFamily: "'ETBembo', serif",
          }}
        >
          Iris
        </h1>
        <p
          className="text-xs tracking-[0.12em] mt-1.5"
          style={{ color: '#666', fontFamily: "'ETBembo', serif" }}
        >
          {hasColors
            ? <>Click segments or the image to pick colors</>
            : <>Upload or paste an image to extract its palette</>}
        </p>
        <p
          className="text-[9.5px] tracking-[0.08em] mt-1.5"
          style={{ color: '#777', fontFamily: "'ETBembo', serif" }}
        >
          created by{' '}
          <a
            href="https://x.com/gentlycarved"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-[#ccc] underline-offset-2 hover:decoration-[#999] transition-colors"
          >
            Tahreem Rehman
          </a>
        </p>
      </motion.div>

      {/* Wheel + palette area */}
      <div className="relative">
        {/* Hover trigger: while exploring a picked image, nudge the mouse to the far left to bring the examples back. */}
        {hasColors && (
          <div
            className="fixed left-0 top-0 h-full z-30"
            style={{ width: '140px' }}
            onMouseEnter={() => setExamplesHover(true)}
            onMouseLeave={() => setExamplesHover(false)}
          />
        )}

        {/* Reference images - positioned below gallery button, top-left */}
        <AnimatePresence>
          {showExamples && (
            <motion.div
              className="fixed z-40 flex flex-col items-center gap-3"
              style={{ left: '24px', top: '50%', y: '-55%' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 170, damping: 26 }}
              onMouseEnter={() => setExamplesHover(true)}
              onMouseLeave={() => setExamplesHover(false)}
            >
              <span
                className="text-[10px] tracking-[0.15em] uppercase whitespace-nowrap"
                style={{ color: '#5c5252', fontFamily: "'ETBembo', serif" }}
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
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[10px] tracking-[0.1em] uppercase underline underline-offset-2 whitespace-nowrap mt-1"
                style={{ color: '#5c5252', fontFamily: "'ETBembo', serif" }}
              >
                or upload your own
              </button>
            </motion.div>
          )}
        </AnimatePresence>

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
                  style={{ color: '#777', fontFamily: "'ETBembo', serif" }}
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
              {/* Save to Gallery button - above palette */}
              <div className="flex justify-center mb-2.5">
                <button
                  onClick={() => setSaveDialogOpen(true)}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full border cursor-pointer transition-all hover:border-[#777] hover:text-[#333] hover:bg-black/[0.03] hover:shadow-[0_2px_12px_rgba(0,0,0,0.08)] disabled:opacity-50"
                  style={{
                    fontFamily: "'ETBembo', serif",
                    fontSize: '11px',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase' as const,
                    color: saved ? '#16a34a' : '#888',
                    borderColor: saved ? '#86efac' : '#ccc',
                    background: saved ? '#f0fdf4' : '#F4F4E8',
                  }}
                >
                  {saved ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      Save to Gallery
                    </>
                  )}
                </button>
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

      {/* Save Dialog overlay */}
      <SaveDialog
        isOpen={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        onConfirm={handleSaveToGallery}
        saving={saving}
      />
    </div>
  );
}