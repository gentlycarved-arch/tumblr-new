import { useState, useEffect, useMemo } from "react";
import { songEmbed } from "../../lib/uploads";

interface Props {
  song: string;                              // the current image's song link ("" = none)
  darkMode: boolean;
  onExpandedChange?: (open: boolean) => void; // lets the page pause the slideshow while playing
}

/**
 * Top banner for the current background image's attached song. Collapsed it's a small pill;
 * clicking reveals the platform's embedded player (browsers block autoplay, so it's click-to-play).
 */
export function SongBanner({ song, darkMode, onExpandedChange }: Props) {
  const [open, setOpen] = useState(false);
  const embed = useMemo(() => songEmbed(song), [song]);

  // A new background (new/absent song) collapses the player.
  useEffect(() => { setOpen(false); }, [song]);
  useEffect(() => { onExpandedChange?.(open); }, [open, onExpandedChange]);

  if (!embed) return null;

  const pillBg = darkMode ? "rgba(26,26,26,0.82)" : "rgba(248,248,248,0.9)";
  const text = darkMode ? "#E5E1E1" : "#2a2a2a";
  const pillShadow = darkMode
    ? "0 0 0 1px rgba(255,255,255,0.18), 0 2px 10px rgba(0,0,0,0.3)"
    : "0 0 0 1px rgba(0,0,0,0.08), 0 2px 10px rgba(0,0,0,0.14)";
  const font = "font-['Favorit_Tumblr:Medium',sans-serif]";

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 flex flex-col items-center" style={{ zIndex: 45 }}>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`${font} px-4 py-2 rounded-full text-[14px] leading-none whitespace-nowrap`}
          style={{ background: pillBg, color: text, boxShadow: pillShadow, backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
        >
          🎵 play this image's song
        </button>
      ) : (
        <div
          className="rounded-[14px] overflow-hidden"
          style={{ width: 320, maxWidth: "88vw", background: darkMode ? "#1A1A1A" : "#FAFAFA", boxShadow: pillShadow }}
        >
          <div className={`${font} flex items-center justify-between px-3 py-1.5 text-[12px]`} style={{ color: text }}>
            <span style={{ opacity: 0.7 }}>🎵 {embed.platform}</span>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close player" style={{ color: text, opacity: 0.7, fontSize: 16, lineHeight: 1 }}>×</button>
          </div>
          <iframe
            title="song"
            src={embed.embed}
            width="320"
            height={embed.height}
            style={{ border: 0, display: "block", width: "100%" }}
            allow="autoplay; encrypted-media; clipboard-write; fullscreen; picture-in-picture"
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
}
