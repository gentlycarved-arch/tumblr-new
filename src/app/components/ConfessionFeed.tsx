import { useState, useEffect } from "react";

interface Props {
  confessions: string[];
  darkMode: boolean;
  onOpen: () => void;
}

const ROTATE_MS = 5000;

/**
 * Sits directly under the "leave a confession" button: cycles one confession at a time
 * as a small preview; clicking it opens the full confessions page.
 */
export function ConfessionFeed({ confessions, darkMode, onOpen }: Props) {
  const [idx, setIdx] = useState(0);

  useEffect(() => { setIdx(0); }, [confessions.length]);

  useEffect(() => {
    if (confessions.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % confessions.length), ROTATE_MS);
    return () => clearInterval(t);
  }, [confessions.length]);

  if (confessions.length === 0) return null;

  const font = "font-['Favorit_Tumblr:Medium',sans-serif]";
  const panelBg = darkMode ? "#1A1A1A" : "#FAFAFA";
  const ring = darkMode
    ? "0 0 0 1.5px rgba(255,255,255,0.28), 0 10px 30px rgba(0,0,0,0.4)"
    : "0 0 0 1.5px rgba(0,0,0,0.1), 0 10px 30px rgba(0,0,0,0.18)";
  const muted = darkMode ? "#c0bcbc" : "#888484";

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`${font} mt-2 text-left rounded-[12px] px-3 py-2 text-[12px] leading-snug w-[260px] max-w-[78vw]`}
      style={{ background: panelBg, color: muted, boxShadow: ring }}
    >
      <span style={{ opacity: 0.55 }}>anon:</span> “{confessions[idx]}”
      <div className="text-[10px] opacity-50 mt-1">
        tap to read all {confessions.length}
      </div>
    </button>
  );
}
