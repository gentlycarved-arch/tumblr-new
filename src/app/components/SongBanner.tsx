import { useState, useEffect, useMemo } from "react";
import { songEmbed } from "../../lib/uploads";

interface Props {
  song: string;    // the current image's song link ("" = none)
  darkMode: boolean;
}

const PLATFORM_COLOR: Record<string, string> = {
  youtube: "#ff3b30",
  spotify: "#1db954",
  apple: "#fc3c6c",
};

function Disc({ color, spinning }: { color: string; spinning: boolean }) {
  return (
    <div
      style={{
        width: 24,
        height: 24,
        borderRadius: "50%",
        flexShrink: 0,
        background: `radial-gradient(circle at 50% 50%, #0e0e0e 0 3px, ${color} 3px 4.2px, #262626 4.2px 8.5px, #333 8.5px 10.5px, #0e0e0e 10.5px 12px)`,
        boxShadow: "0 1px 2px rgba(0,0,0,0.4)",
        animation: spinning ? "songDiscSpin 2.4s linear infinite" : "none",
      }}
    />
  );
}

/**
 * Top banner for the current background image's attached song: a small pill with a
 * spinning-disc icon. YouTube autoplays muted (the only platform browsers allow silent
 * autoplay for) and taps toggle sound; Spotify/Apple Music need one tap to start, since
 * their embeds don't support autoplay at all.
 */
export function SongBanner({ song, darkMode }: Props) {
  const embed = useMemo(() => songEmbed(song), [song]);
  const [muted, setMuted] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => { setMuted(true); setExpanded(false); }, [song]);

  if (!embed) return null;

  const isYouTube = embed.platform === "youtube";
  const spinning = isYouTube || expanded;
  const color = PLATFORM_COLOR[embed.platform] ?? "#888";

  const pillBg = darkMode ? "rgba(26,26,26,0.85)" : "rgba(248,248,248,0.92)";
  const text = darkMode ? "#E5E1E1" : "#2a2a2a";
  const pillShadow = darkMode
    ? "0 0 0 1px rgba(255,255,255,0.18), 0 2px 10px rgba(0,0,0,0.3)"
    : "0 0 0 1px rgba(0,0,0,0.08), 0 2px 10px rgba(0,0,0,0.14)";
  const font = "font-['Favorit_Tumblr:Medium',sans-serif]";

  function handlePillClick() {
    if (isYouTube) { setMuted((m) => !m); return; }
    setExpanded((e) => !e);
  }

  const label = isYouTube
    ? (muted ? "playing, tap for sound" : "tap to mute")
    : (expanded ? "now playing" : "tap to play");

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 flex flex-col items-center" style={{ zIndex: 45 }}>
      <style>{`@keyframes songDiscSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      <button
        type="button"
        onClick={handlePillClick}
        className={`${font} flex items-center gap-2 pl-1.5 pr-3.5 py-1.5 rounded-full text-[13px] leading-none whitespace-nowrap`}
        style={{
          background: pillBg,
          color: text,
          boxShadow: pillShadow,
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }}
      >
        <Disc color={color} spinning={spinning} />
        {label}
      </button>

      {/* YouTube: hidden iframe drives the sound; the pill above is what's visible. */}
      {isYouTube && (
        <iframe
          title="song"
          src={`${embed.embed}?autoplay=1&mute=${muted ? 1 : 0}&playsinline=1&controls=0`}
          width="1"
          height="1"
          style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}
          allow="autoplay; encrypted-media"
        />
      )}

      {/* Spotify / Apple Music: reveal their real player once tapped (no autoplay support). */}
      {!isYouTube && expanded && (
        <div
          className="mt-2 rounded-[14px] overflow-hidden"
          style={{ width: 320, maxWidth: "88vw", background: darkMode ? "#1A1A1A" : "#FAFAFA", boxShadow: pillShadow }}
        >
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
