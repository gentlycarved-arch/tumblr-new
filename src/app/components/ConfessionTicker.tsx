import { useState, useEffect } from "react";

interface Props {
  confessions: string[];
  darkMode: boolean;
}

const INTERVAL_MS = 9000;
const FADE_MS = 600;

/** Cycles anonymous confessions one at a time, low in the center of the screen. */
export function ConfessionTicker({ confessions, darkMode }: Props) {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => { setIdx(0); }, [confessions.length]);

  useEffect(() => {
    if (confessions.length < 2) return;
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % confessions.length);
        setVisible(true);
      }, FADE_MS);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [confessions.length]);

  if (confessions.length === 0) return null;
  const text = confessions[idx] ?? "";

  return (
    <div
      className="absolute pointer-events-none max-sm:bottom-36 sm:bottom-8 left-1/2 -translate-x-1/2 w-[440px] max-w-[86vw] text-center"
      style={{ zIndex: 25 }}
    >
      <div
        className="font-['Favorit_Tumblr:Medium',sans-serif] text-[13px] leading-snug px-4 py-2 rounded-[10px] inline-block"
        style={{
          background: darkMode ? "rgba(26,26,26,0.7)" : "rgba(248,248,248,0.82)",
          color: darkMode ? "#d6d2d2" : "#4a4a4a",
          boxShadow: darkMode ? "0 2px 10px rgba(0,0,0,0.3)" : "0 2px 10px rgba(0,0,0,0.12)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          opacity: visible ? 1 : 0,
          transition: `opacity ${FADE_MS}ms ease`,
        }}
      >
        <span style={{ opacity: 0.5 }}>anon:</span> <em>“{text}”</em>
      </div>
    </div>
  );
}
