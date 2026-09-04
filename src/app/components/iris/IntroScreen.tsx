import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const BOTTOM_COLORS = [
  '#6B3A3A', '#C28B8B', '#8B4F5A', '#4A2030', '#F2D5CC',
  '#D4A898', '#5C3030', '#B85C50', '#D44030', '#F8C8D8',
  '#6A1818', '#1A2040', '#2E6B5E', '#3CA878', '#50C8A0',
  '#408870', '#6B5040', '#3868A8', '#E8A870', '#C89898',
  '#9B6858', '#2A5878', '#D88888', '#486030', '#C0A060',
  '#7848A0', '#E0B898', '#305868', '#B87070', '#588040',
];

const TOP_COLORS = [
  '#E8C8A0', '#2B4A6B', '#78B8A0', '#A85838', '#D0E8D0',
  '#5848A8', '#C86060', '#387858', '#F0D0A0', '#8868B8',
  '#305050', '#E09090', '#4878C0', '#A0D050', '#884848',
  '#60A0B8', '#D8B070', '#385838', '#C0A0D8', '#987060',
  '#48A090', '#C05050', '#6888C0', '#B8A048', '#704060',
  '#50B890', '#D89060', '#284858', '#A07098', '#688848',
];

// Pre-compute random resting heights so they don't change on re-render
const BOTTOM_HEIGHTS = BOTTOM_COLORS.map(() => 48 + Math.random() * 60 + 20);
const TOP_HEIGHTS = TOP_COLORS.map(() => 40 + Math.random() * 50 + 16);
const HOVER_EXTRA = 60;

function hexLuminance(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

interface IntroScreenProps {
  onEnter: () => void;
}

export function IntroScreen({ onEnter }: IntroScreenProps) {
  const [blocksReady, setBlocksReady] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [hoveredBottom, setHoveredBottom] = useState<number | null>(null);
  const [hoveredTop, setHoveredTop] = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setBlocksReady(true), 300);
    return () => clearTimeout(t);
  }, []);

  const handleEnter = () => {
    setExiting(true);
    setTimeout(onEnter, 800);
  };

  const blockSize = 48;
  const gap = 3;

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
          style={{ background: '#F4F4E8' }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          {/* Color blocks at top — hanging down from top edge */}
          <div
            className="absolute top-0 left-0 right-0 flex"
            style={{
              gap: `${gap}px`,
            }}
          >
            {TOP_COLORS.map((color, i) => {
              const isHovered = hoveredTop === i;
              const restHeight = TOP_HEIGHTS[i];
              const isDark = hexLuminance(color) < 140;
              const textColor = isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.65)';

              return (
                <motion.div
                  key={`top-${color}-${i}`}
                  onMouseEnter={() => setHoveredTop(i)}
                  onMouseLeave={() => setHoveredTop(null)}
                  className="relative cursor-pointer flex flex-1 min-w-0 items-end justify-center"
                  style={{
                    backgroundColor: color,
                    borderRadius: '0 0 2px 2px',
                    overflow: 'visible',
                  }}
                  initial={{ height: blockSize, y: -blockSize }}
                  animate={
                    blocksReady
                      ? {
                          height: isHovered ? restHeight + HOVER_EXTRA : restHeight,
                          y: 0,
                        }
                      : {}
                  }
                  transition={{
                    height: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
                    y: { duration: 0.9, delay: blocksReady ? 0.12 * i : 0, ease: [0.22, 1, 0.36, 1] },
                  }}
                >
                  <AnimatePresence>
                    {isHovered && (
                      <motion.span
                        className="absolute pointer-events-none whitespace-nowrap font-mono"
                        style={{
                          bottom: 8,
                          fontSize: '9px',
                          letterSpacing: '0.05em',
                          color: textColor,
                        }}
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2 }}
                      >
                        {color.toUpperCase()}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {/* Title + description */}
          <motion.div
            className="flex flex-col items-center gap-4 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          >
            <h1
              className="tracking-[0.3em] uppercase"
              style={{
                fontFamily: "'ETBembo', serif",
                fontSize: '52px',
                color: '#1a1a1a',
                letterSpacing: '0.35em',
              }}
            >
              Iris
            </h1>
            <p
              className="mt-2 text-center leading-relaxed max-w-[360px]"
              style={{
                fontFamily: "'ETBembo', serif",
                fontSize: '14px',
                color: '#777',
              }}
            >
              Upload an image, extract its palette, and take your colors anywhere.
            </p>
            <p
              className="mt-1 text-center"
              style={{
                fontFamily: "'ETBembo', serif",
                fontSize: '12px',
                color: '#999',
              }}
            >
              Created by{' '}
              <a
                href="https://x.com/gentlycarved"
                target="_blank"
                rel="noopener noreferrer"
                className="underline transition-colors"
                style={{ color: '#777' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#333')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#999')}
              >
                Tahreem Rehman
              </a>
            </p>
          </motion.div>

          {/* Enter button */}
          <motion.button
            onClick={handleEnter}
            className="px-10 py-3 rounded-full border cursor-pointer"
            style={{
              fontFamily: "'ETBembo', serif",
              fontSize: '13px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              background: 'transparent',
            }}
            initial={{ opacity: 0, color: '#666', borderColor: '#ddd' }}
            animate={{ opacity: 1, color: '#666', borderColor: '#ddd' }}
            transition={{ duration: 0.6, delay: 1.2 }}
            whileHover={{
              borderColor: '#333',
              color: '#111',
              scale: 1.05,
              backgroundColor: 'rgba(0,0,0,0.04)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            }}
            whileTap={{ scale: 0.97 }}
          >
            Begin
          </motion.button>

          {/* Color blocks at bottom — floating upward from bottom edge */}
          <div
            className="absolute bottom-0 left-0 right-0 flex items-end"
            style={{
              gap: `${gap}px`,
            }}
          >
            {BOTTOM_COLORS.map((color, i) => {
              const isHovered = hoveredBottom === i;
              const restHeight = BOTTOM_HEIGHTS[i];
              const isDark = hexLuminance(color) < 140;
              const textColor = isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.65)';

              return (
                <motion.div
                  key={`bottom-${color}-${i}`}
                  onMouseEnter={() => setHoveredBottom(i)}
                  onMouseLeave={() => setHoveredBottom(null)}
                  className="relative cursor-pointer flex flex-1 min-w-0 items-start justify-center"
                  style={{
                    backgroundColor: color,
                    borderRadius: '2px 2px 0 0',
                    overflow: 'visible',
                  }}
                  initial={{ height: blockSize, y: blockSize }}
                  animate={
                    blocksReady
                      ? {
                          height: isHovered ? restHeight + HOVER_EXTRA : restHeight,
                          y: 0,
                        }
                      : {}
                  }
                  transition={{
                    height: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
                    y: { duration: 0.9, delay: blocksReady ? 0.12 * (BOTTOM_COLORS.length - 1 - i) : 0, ease: [0.22, 1, 0.36, 1] },
                  }}
                >
                  <AnimatePresence>
                    {isHovered && (
                      <motion.span
                        className="absolute pointer-events-none whitespace-nowrap font-mono"
                        style={{
                          top: 8,
                          fontSize: '9px',
                          letterSpacing: '0.05em',
                          color: textColor,
                        }}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.2 }}
                      >
                        {color.toUpperCase()}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}