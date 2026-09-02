import { useState, useEffect, useMemo } from "react";
import { songEmbed } from "../../lib/uploads";

interface Props {
  song: string;    // the current image's song link ("" = none)
  darkMode: boolean;
}

export const SONG_BAR_HEIGHT = 34; // px — other top-anchored UI shifts down by this when a song is present

const PLATFORM_COLOR: Record<string, string> = {
  youtube: "#ff3b30",
  spotify: "#1db954",
  apple: "#fc3c6c",
};

function Disc({ color, spinning }: { color: string; spinning: boolean }) {
  return (
    <div
      style={{
        width: 16,
        height: 16,
        borderRadius: "50%",
        flexShrink: 0,
        background: `radial-gradient(circle at 50% 50%, #0e0e0e 0 2px, ${color} 2px 2.8px, #262626 2.8px 5.6px, #333 5.6px 7px, #0e0e0e 7px 8px)`,
        animation: spinning ? "songDiscSpin 2.4s linear infinite" : "none",
      }}
    />
  );
}

/**
 * A very simple "now playing" strip pinned across the very top of the page: a slim,
 * full-width bar (not a floating pill) for the current background image's attached song.
 * YouTube autoplays muted (the only platform browsers allow silent autoplay for) and
 * tapping toggles sound; Spotify/Apple Music need one tap to start.
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

  const barBg = darkMode ? "rgba(20,20,20,0.9)" : "rgba(250,250,250,0.94)";
  const text = darkMode ? "#E5E1E1" : "#2a2a2a";
  const font = "font-['Favorit_Tumblr:Medium',sans-serif]";

  function handleClick() {
    if (isYouTube) { setMuted((m) => !m); return; }
    setExpanded((e) => !e);
  }

  const label = isYouTube
    ? (muted ? "now playing, tap for sound" : "tap to mute")
    : (expanded ? "now playing" : "tap to play");

  return (
    <>
      <style>{`@keyframes songDiscSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      <button
        type="button"
        onClick={handleClick}
        className={`${font} absolute top-0 left-0 right-0 flex items-center justify-center gap-2 text-[12px] leading-none`}
        style={{
          height: SONG_BAR_HEIGHT,
          background: barBg,
          color: text,
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          borderBottom: darkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
          zIndex: 60,
        }}
      >
        <Disc color={color} spinning={spinning} />
        {label}
      </button>

      {/* YouTube: hidden iframe drives the sound; the bar above is what's visible. */}
      {isYouTube && (
        <iframe
          title="song"
          src={`${embed.embed}?autoplay=1&mute=${muted ? 1 : 0}&playsinline=1&controls=0`}
          width="1"
          height="1"
          style={{ position: "absolute", top: 0, opacity: 0, pointerEvents: "none" }}
          allow="autoplay; encrypted-media"
        />
      )}

      {/* Spotify / Apple Music: reveal their real player once tapped (no autoplay support). */}
      {!isYouTube && expanded && (
        <div
          className="absolute left-1/2 -translate-x-1/2 rounded-b-[14px] overflow-hidden"
          style={{
            top: SONG_BAR_HEIGHT,
            width: 320,
            maxWidth: "88vw",
            background: darkMode ? "#1A1A1A" : "#FAFAFA",
            boxShadow: darkMode ? "0 6px 20px rgba(0,0,0,0.4)" : "0 6px 20px rgba(0,0,0,0.16)",
            zIndex: 59,
          }}
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
    </>
  );
}
