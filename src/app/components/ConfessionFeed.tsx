import { useState, useEffect } from "react";

interface Props {
  confessions: string[];
  darkMode: boolean;
}

const ROTATE_MS = 5000;

/**
 * Sits directly under the "leave a confession" button. Collapsed, it cycles one
 * confession at a time as a small preview; clicking it opens the full scrollable list.
 */
export function ConfessionFeed({ confessions, darkMode }: Props) {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);

  useEffect(() => { setIdx(0); }, [confessions.length]);

  useEffect(() => {
    if (open || confessions.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % confessions.length), ROTATE_MS);
    return () => clearInterval(t);
  }, [open, confessions.length]);

  if (confessions.length === 0) return null;

  const font = "font-['Favorit_Tumblr:Medium',sans-serif]";
  const panelBg = darkMode ? "#1A1A1A" : "#FAFAFA";
  const ring = darkMode
    ? "0 0 0 1.5px rgba(255,255,255,0.28), 0 10px 30px rgba(0,0,0,0.4)"
    : "0 0 0 1.5px rgba(0,0,0,0.1), 0 10px 30px rgba(0,0,0,0.18)";
  const muted = darkMode ? "#c0bcbc" : "#888484";
  const heading = darkMode ? "#E5E1E1" : "#4a4a4a";

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
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

  return (
    <div
      className={`${font} mt-2 rounded-[12px] w-[280px] max-w-[82vw] flex flex-col overflow-hidden`}
      style={{ background: panelBg, boxShadow: ring }}
    >
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="flex items-center justify-between px-3 py-2 text-[13px]"
        style={{ color: heading }}
      >
        confessions ({confessions.length})
        <span style={{ opacity: 0.6, fontSize: 16, lineHeight: 1 }}>×</span>
      </button>
      <div className="overflow-y-auto px-3 pb-3 flex flex-col gap-2.5" style={{ maxHeight: 260, color: muted }}>
        {confessions.map((c, i) => (
          <div key={i} className="text-[12px] leading-snug">“{c}”</div>
        ))}
      </div>
    </div>
  );
}
