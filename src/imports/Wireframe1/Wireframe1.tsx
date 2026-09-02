import { useState, useEffect, useRef } from "react";
import bgImage from "../Wireframe_-_2.png";
import logoImage from "../Group_3.png";
import logoImageDark from "../Group_3_dark.png";
import { ConnectTooltip } from "../../app/components/connect-tooltip";
import { AddImageFlow } from "../../app/components/AddImageFlow";
import { SongBanner, SONG_BAR_HEIGHT } from "../../app/components/SongBanner";
import { ConfessionFlow } from "../../app/components/ConfessionFlow";
import { ConfessionSheetMobile } from "../../app/components/ConfessionSheetMobile";
import { useArenaSlideshow, type SlideMode } from "../../hooks/useArenaSlideshow";
import { useUploads } from "../../hooks/useUploads";
import { useConfessions } from "../../hooks/useConfessions";

// Each phrase can have typos: { after: string, wrong: string }
// meaning: after typing `after`, type `wrong` chars then backspace before continuing
type Typo = { after: string; wrong: string };
type PhraseConfig = { text: string; typos?: Typo[] };

const PHRASE_CONFIGS: PhraseConfig[] = [
  // "Daydreaner" → fixes to "Daydreamer"
  { text: "& Daydreamer", typos: [{ after: "& Daydrea", wrong: "ner" }] },
  // backtracks "mer" → types "ming on the Internet"
  { text: "& Daydreaming on the Internet" },
  // "Coph" → backtracks → "Coffee Drinker"
  { text: "& Drip Coffee Drinker", typos: [{ after: "& Drip Co", wrong: "ph" }] },
  // "Watv" → backtracks → "Watching Mad Men"
  { text: "& Watching Mad Men", typos: [{ after: "& Wat", wrong: "v" }] },
  // "Photg" → backtracks → "Photographer"
  { text: "& Film Photographer", typos: [{ after: "& Film Phot", wrong: "g" }] },
  // "Turkihs" → backtracks → "Turkish Eggs"
  { text: "& Addicted to Turkish Eggs", typos: [{ after: "& Addicted to Turki", wrong: "hs" }] },
  // "Stillo" → backtracks → "Still on Tumblr"
  { text: "& Still on Tumblr", typos: [{ after: "& Still", wrong: "o" }] },
  // "Obsesed" → backtracks → "Obsessed with Images"
  { text: "& Obsessed with Images", typos: [{ after: "& Obses", wrong: "ed" }] },
];

// Build the full sequence of displayed strings for typing a phrase from `startFrom`
function buildTypingScript(from: string, config: PhraseConfig): string[] {
  const { text, typos = [] } = config;
  const steps: string[] = [];
  let current = from;

  // Collect typo triggers keyed by the string state that triggers them
  const typoMap = new Map<string, Typo>();
  for (const typo of typos) {
    typoMap.set(typo.after, typo);
  }

  let i = from.length;
  while (i <= text.length) {
    // Check if current string triggers a typo
    const typo = typoMap.get(current);
    if (typo && typo.wrong.length > 0) {
      // Type wrong chars
      let withWrong = current;
      for (const ch of typo.wrong) {
        withWrong += ch;
        steps.push(withWrong);
      }
      // Backspace wrong chars
      for (let b = 0; b < typo.wrong.length; b++) {
        withWrong = withWrong.slice(0, -1);
        steps.push(withWrong);
      }
      typoMap.delete(current);
    }
    if (i < text.length) {
      current = text.slice(0, i + 1);
      steps.push(current);
    }
    i++;
  }
  return steps;
}

const PAUSE_MS = 2800;

function typeDelay() {
  if (Math.random() < 0.1) return 280 + Math.random() * 250;
  return 90 + Math.random() * 110;
}

function backspaceDelay(isCorrection = false) {
  if (isCorrection) return 80 + Math.random() * 60; // faster when fixing typo
  if (Math.random() < 0.12) return 180 + Math.random() * 150;
  return 55 + Math.random() * 60;
}

function commonPrefixLen(a: string, b: string) {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return i;
}

function useTypewriter() {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [displayed, setDisplayed] = useState(PHRASE_CONFIGS[0].text);
  const [phase, setPhase] = useState<"pausing" | "deleting" | "typing">("pausing");
  const [script, setScript] = useState<string[]>([]);
  const [scriptIdx, setScriptIdx] = useState(0);

  useEffect(() => {
    const current = PHRASE_CONFIGS[phraseIdx].text;
    const nextIdx = (phraseIdx + 1) % PHRASE_CONFIGS.length;
    const next = PHRASE_CONFIGS[nextIdx];
    const stopAt = commonPrefixLen(current, next.text);

    if (phase === "pausing") {
      const t = setTimeout(() => setPhase("deleting"), PAUSE_MS);
      return () => clearTimeout(t);
    }

    if (phase === "deleting") {
      if (displayed.length > stopAt) {
        const t = setTimeout(() => setDisplayed((d) => d.slice(0, -1)), backspaceDelay());
        return () => clearTimeout(t);
      } else {
        // Build the typing script for the next phrase
        const newScript = buildTypingScript(displayed, next);
        setScript(newScript);
        setScriptIdx(0);
        setPhraseIdx(nextIdx);
        setPhase("typing");
      }
    }

    if (phase === "typing") {
      if (scriptIdx < script.length) {
        // Detect if this step is a correction (going backwards in length)
        const isCorrection = scriptIdx > 0 && script[scriptIdx].length < script[scriptIdx - 1].length;
        const delay = isCorrection ? backspaceDelay(true) : typeDelay();
        const t = setTimeout(() => {
          setDisplayed(script[scriptIdx]);
          setScriptIdx((s) => s + 1);
        }, delay);
        return () => clearTimeout(t);
      } else {
        setPhase("pausing");
      }
    }
  }, [phase, displayed, phraseIdx, script, scriptIdx]);

  const pausing = phase === "pausing";
  return { displayed, pausing };
}

function Group({ darkMode }: { darkMode: boolean }) {
  return (
    <div className="absolute inset-[33.3%_33.59%_57.08%_33.71%] max-sm:inset-[28%_10%_60%_10%]">
      <img
        alt=""
        className="block size-full object-contain"
        src={logoImage}
        style={{
          filter: darkMode
            ? "drop-shadow(0 1px 6px rgba(0,0,0,0.45))"
            : "drop-shadow(0 1px 3px rgba(0,0,0,0.55)) drop-shadow(0 0 1px rgba(0,0,0,0.4))",
          transition: "filter 600ms ease",
        }}
      />
    </div>
  );
}

function Frame({ open, onToggle, darkMode }: { open: boolean; onToggle: () => void; darkMode: boolean }) {
  const [hover, setHover] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Desktop: click anywhere outside the button/card to dismiss it.
  // (Mobile renders its own full-screen dismiss overlay at the root.)
  useEffect(() => {
    if (!open) return;
    function onDown(e: PointerEvent) {
      if (window.innerWidth < 640) return; // mobile handles its own dismissal
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) onToggle();
    }
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open, onToggle]);

  const ringed = hover || open;

  return (
    <div
      className="absolute right-[38.5%] top-[55%] -translate-y-1/2 max-sm:right-[11%] max-sm:top-[54.5%]"
      ref={rootRef}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <button
        type="button"
        onClick={onToggle}
        className="relative size-[26px] flex items-center justify-center z-[51]"
        aria-label="About this site"
      >
        <svg className="absolute inset-0 size-full" fill="none" viewBox="0 0 28 28">
          <defs>
            <radialGradient id="btnGradBase" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#9e9b9b" />
              <stop offset="100%" stopColor="#636060" />
            </radialGradient>
            <radialGradient id="btnGradHover" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#a5a2a2" />
              <stop offset="100%" stopColor="#6e6b6b" />
            </radialGradient>
            <linearGradient id="btnStroke" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.45)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.2)" />
            </linearGradient>
          </defs>
          {/* Base fill */}
          <circle cx="14" cy="14" r="13.5"
            fill={`url(#btnGrad${ringed ? "Hover" : "Base"})`}
          />
          {/* Clean consistent border */}
          <circle cx="14" cy="14" r="13.5"
            fill="none"
            stroke="rgba(0,0,0,0.15)"
            strokeWidth="1"
          />
          {/* Outer ring on hover */}
          {ringed && !open && (
            <circle cx="14" cy="14" r="12.5"
              fill="none"
              stroke="rgba(255,255,255,0.6)"
              strokeWidth="1"
            />
          )}
        </svg>
        <span className="relative z-10 font-['Inter:Medium',sans-serif] font-medium text-white leading-none select-none"
          style={{ textShadow: "0 1px 2px rgba(0,0,0,0.4)", fontSize: "16px", lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>?</span>
      </button>

      {/* Desktop tooltip — appears to the right of the button */}
      {open && (
        <div className="hidden sm:block absolute left-[32px] top-1/2 -translate-y-1/2 z-50">
          <ConnectTooltip darkMode={darkMode} />
        </div>
      )}
    </div>
  );
}

function ModeToggle({ darkMode, onToggle, pushDown }: { darkMode: boolean; onToggle: () => void; pushDown?: boolean }) {
  const TRACK_W = 80;
  const TRACK_H = 42;
  const KNOB = 34;
  const PAD = (TRACK_H - KNOB) / 2;
  const knobX = darkMode ? TRACK_W - KNOB - PAD : PAD;

  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center"
      style={{ zIndex: 10, top: pushDown ? SONG_BAR_HEIGHT + 12 : 32, transition: "top 250ms ease" }}
    >
      {/* The toggle switch */}
      <button
        type="button"
        onClick={onToggle}
        aria-label="Cycle light / auto / dark mode"
        style={{
          width: TRACK_W, height: TRACK_H, position: "relative",
          filter: darkMode ? "drop-shadow(0 0 10px rgba(255,255,255,0.18))" : "none",
          transition: "filter 600ms ease",
        }}
      >
        <svg width={TRACK_W} height={TRACK_H} viewBox={`0 0 ${TRACK_W} ${TRACK_H}`} fill="none">
          <defs>
            <radialGradient id="knobGrad" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#a8a5a5" />
              <stop offset="100%" stopColor="#707070" />
            </radialGradient>
            <radialGradient id="knobGradDark" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#5a5757" />
              <stop offset="100%" stopColor="#3a3838" />
            </radialGradient>
            <clipPath id="moonClip">
              <circle cx={KNOB / 2} cy={TRACK_H / 2} r="7" />
            </clipPath>
            <filter id="moonSoft" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="0.45" />
            </filter>
          </defs>

          {/* Track — light layer (white/light gray) */}
          <rect x="0.5" y="0.5" width={TRACK_W - 1} height={TRACK_H - 1} rx={TRACK_H / 2} ry={TRACK_H / 2}
            fill="rgba(235,233,233,0.85)"
            stroke="rgba(0,0,0,0.12)"
            strokeWidth="1"
            style={{ opacity: darkMode ? 0 : 1, transition: "opacity 600ms ease" }}
          />
          {/* Track — dark layer (charcoal) */}
          <rect x="0.5" y="0.5" width={TRACK_W - 1} height={TRACK_H - 1} rx={TRACK_H / 2} ry={TRACK_H / 2}
            fill="#1A1A1A"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="1.5"
            style={{ opacity: darkMode ? 1 : 0, transition: "opacity 600ms ease" }}
          />
          {/* Knob */}
          <circle
            cx={knobX + KNOB / 2}
            cy={TRACK_H / 2}
            r={KNOB / 2}
            fill={darkMode ? "url(#knobGradDark)" : "url(#knobGrad)"}
            style={{ transition: "cx 250ms ease" }}
          />
          {/* Knob border */}
          <circle
            cx={knobX + KNOB / 2}
            cy={TRACK_H / 2}
            r={KNOB / 2}
            fill="none"
            stroke="rgba(0,0,0,0.15)"
            strokeWidth="1"
            style={{ transition: "cx 250ms ease" }}
          />
          {/* Knob top highlight */}
          <circle
            cx={knobX + KNOB / 2}
            cy={TRACK_H / 2}
            r={KNOB / 2 - 1}
            fill="none"
            stroke="rgba(255,255,255,0.45)"
            strokeWidth="1"
            style={{ transition: "cx 250ms ease" }}
          />

          {/* Icon inside knob */}
          <g style={{ transition: "transform 250ms ease", transform: `translateX(${knobX}px)` }}>
            {darkMode ? (
              // Skeuomorphic Moon — white crescent with softened glow edges
              <g filter="url(#moonSoft)">
                {/* Main crescent body */}
                <circle cx={KNOB / 2} cy={TRACK_H / 2} r="7" fill="white" clipPath="url(#moonClip)" />
                {/* Cutout circle to form crescent */}
                <circle cx={KNOB / 2 + 5} cy={TRACK_H / 2 - 1.5} r="5.8" fill="url(#knobGradDark)" clipPath="url(#moonClip)" />
                {/* Top-left highlight for depth */}
                <circle cx={KNOB / 2 - 1} cy={TRACK_H / 2 - 2.5} r="7" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="0.8" clipPath="url(#moonClip)" />
                {/* Bottom shadow for depth */}
                <circle cx={KNOB / 2 + 1} cy={TRACK_H / 2 + 1} r="7" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="1" clipPath="url(#moonClip)" />
              </g>
            ) : (
              // Skeuomorphic Sun — white with depth
              <g>
                {/* Rays with slight shadow */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
                  const rad = deg * Math.PI / 180;
                  const cx = KNOB / 2;
                  const cy = TRACK_H / 2;
                  return (
                    <line
                      key={deg}
                      x1={cx + Math.cos(rad) * 6.2}
                      y1={cy + Math.sin(rad) * 6.2}
                      x2={cx + Math.cos(rad) * 8.2}
                      y2={cy + Math.sin(rad) * 8.2}
                      stroke="rgba(0,0,0,0.15)"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  );
                })}
                {/* White rays on top */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
                  const rad = deg * Math.PI / 180;
                  const cx = KNOB / 2;
                  const cy = TRACK_H / 2;
                  return (
                    <line
                      key={deg}
                      x1={cx + Math.cos(rad) * 6.2}
                      y1={cy + Math.sin(rad) * 6.2}
                      x2={cx + Math.cos(rad) * 8.2}
                      y2={cy + Math.sin(rad) * 8.2}
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  );
                })}
                {/* Core shadow */}
                <circle cx={KNOB / 2} cy={TRACK_H / 2} r="4.8" fill="rgba(0,0,0,0.1)" />
                {/* White core */}
                <circle cx={KNOB / 2} cy={TRACK_H / 2} r="4.5" fill="white" />
                {/* Top highlight */}
                <circle cx={KNOB / 2 - 0.8} cy={TRACK_H / 2 - 1} r="4.5" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" />
              </g>
            )}
          </g>
        </svg>
      </button>

    </div>
  );
}

function Typewriter({ darkMode }: { darkMode: boolean }) {
  const { displayed, pausing } = useTypewriter();
  const color = darkMode ? "#c0bcbc" : "#888484";
  return (
    <p
      className="absolute font-['Favorit_Tumblr:Medium',sans-serif] leading-[normal] left-[38.5%] right-[41%] max-sm:left-[11%] max-sm:right-[16%] not-italic text-[22px] max-sm:text-[18px] top-[53.9%] max-sm:top-[53%] tracking-[-0.44px] overflow-hidden whitespace-nowrap"
      style={{ color, transition: "color 600ms ease" }}
    >
      {displayed}
      <span
        className="inline-block w-[2px] h-[22px] max-sm:h-[18px] ml-[2px] align-[-4px]"
        style={{
          background: color,
          transition: "background 600ms ease",
          animation: pausing ? "blink 1s steps(1) infinite" : "none",
          opacity: pausing ? undefined : 1,
        }}
      />
    </p>
  );
}

const MAIN_SLUG = "nothing-tykp-p8vhpo";

export default function Wireframe() {
  // 'auto' until the user touches the toggle, then locked to 'dark' or 'light'
  const [mode, setMode] = useState<SlideMode>('auto');
  const { images: uploads, commentByUrl, songByUrl, configured: uploadsOn, status: uploadStatus, error: uploadError, upload, addByLink } = useUploads();
  const { confessions, configured: confOn, status: confStatus, error: confError, submit: submitConfession } = useConfessions();
  const { currentSrc, nextSrc, fading, fadeDuration, currentMode } = useArenaSlideshow(bgImage, MAIN_SLUG, mode, uploads);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  // While a visitor is adding an image, blank the slideshow and show their pick as a preview.
  const [addingImage, setAddingImage] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // Theme frozen at the moment the add flow opens, so the hidden slideshow can't flip it mid-add.
  const frozenDark = useRef<boolean | null>(null);

  // In auto mode the UI follows the current image's tone; in manual mode it's fixed.
  const liveDark = mode === 'auto' ? currentMode === 'dark' : mode === 'dark';
  const darkMode = frozenDark.current !== null ? frozenDark.current : liveDark;

  // If the current background is a visitor upload with a note, caption it.
  const caption = !addingImage ? (commentByUrl[currentSrc] || "") : "";
  const currentSong = !addingImage ? (songByUrl[currentSrc] || "") : "";

  function handleAddingChange(adding: boolean) {
    frozenDark.current = adding ? liveDark : null;
    setAddingImage(adding);
  }

  function handleToggle() {
    // Flip to the opposite of whatever's showing, and lock it in (filters the slideshow)
    setMode(darkMode ? 'light' : 'dark');
  }

  return (
    <div className="bg-white relative size-full overflow-hidden" data-name="Wireframe - 1">
      {/* Next image sits beneath, preloaded and ready */}
      <img
        alt=""
        src={nextSrc}
        className="absolute inset-0 size-full object-cover pointer-events-none"
        style={{ zIndex: 0 }}
      />
      {/* Current image on top — fades out to reveal next. Hidden while adding an image. */}
      <img
        alt=""
        src={currentSrc}
        className="absolute inset-0 size-full object-cover pointer-events-none"
        style={{
          zIndex: 1,
          opacity: addingImage ? 0 : fading ? 0 : 1,
          transition: `opacity ${addingImage ? 300 : fadeDuration}ms ease-in-out`,
        }}
      />
      {/* Blank canvas + live preview shown while a visitor is adding an image */}
      {addingImage && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 1, background: darkMode ? "#141414" : "#ECECEC", transition: "background 300ms ease" }}
        >
          {previewUrl && (
            <img
              key={previewUrl}
              alt=""
              src={previewUrl}
              className="absolute inset-0 size-full object-cover"
              style={{ animation: "fadeIn 300ms ease" }}
            />
          )}
        </div>
      )}
      {/* All content above the background layers (z-index: 2+) */}
      <div className="absolute inset-0" style={{ zIndex: 2 }}>
        {/* Dark / Light mode toggle */}
        <ModeToggle darkMode={darkMode} onToggle={handleToggle} pushDown={!!currentSong} />
        <Group darkMode={darkMode} />
        {/* Portfolio Request button — two gradient layers, opacity-transitioned */}
        <style>{`
          .btn-glow {
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.55), inset 0 -2px 4px rgba(0,0,0,0.25), 0 2px 4px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.35);
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to   { opacity: 1; }
          }
        `}</style>
        <a
          href="mailto:gentlycarved@gmail.com"
          className="btn-glow absolute active:translate-y-px inset-[61.43%_37.62%_32.62%_37.68%] max-sm:inset-[61%_8%_32%_8%] rounded-[10px] flex items-center justify-center"
        >
          {/* Light gradient layer */}
          <div className="absolute inset-0 rounded-[inherit]" style={{
            backgroundImage: "radial-gradient(ellipse at 50% 35%, #7eb4e0 0%, #6a9fd8 35%, #5688be 70%, #4a7aaa 100%)",
            opacity: darkMode ? 0 : 1,
            transition: "opacity 600ms ease",
          }} />
          {/* Dark gradient layer */}
          <div className="absolute inset-0 rounded-[inherit]" style={{
            backgroundImage: "radial-gradient(ellipse at 50% 35%, #3a5068 0%, #2c3f55 35%, #1f2e3e 70%, #151f2b 100%)",
            opacity: darkMode ? 1 : 0,
            transition: "opacity 600ms ease",
          }} />
          <span
            style={{ textShadow: "0 1px 1px rgba(0,0,0,0.25)", position: "relative", zIndex: 3 }}
            className="font-['Favorit_Tumblr:Medium',sans-serif] leading-[normal] not-italic text-[22px] max-sm:text-[18px] text-center text-white tracking-[-0.52px]"
          >
            Portfolio Request
          </span>
        </a>

        {/* Input field box */}
        <div className="absolute inset-[46.19%_37.62%_41.41%_37.68%] max-sm:inset-[44%_8%_42%_8%] pointer-events-none rounded-[13px]"
          style={{
            boxShadow: darkMode
              ? "0 0 0 1.5px rgba(255,255,255,0.3), 0 0 24px rgba(255,255,255,0.08)"
              : "0 0 0 1.5px rgba(0,0,0,0.1)",
            transition: "box-shadow 600ms ease",
          }}
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-[13px]"
            style={{
              background: darkMode ? "#1A1A1A" : "#FAFAFA",
              transition: "background 600ms ease",
            }}
          />
          <div className="absolute inset-0 rounded-[inherit] shadow-[inset_0px_0px_5.8px_-1px_black]" />
        </div>

        {/* Divider */}
        <div
          className="absolute h-px left-[37.68%] right-[37.62%] top-[52%] max-sm:left-[10%] max-sm:right-[10%] max-sm:top-[51%]"
          style={{
            background: darkMode ? "#4a4a4a" : "#CAC5C5",
            transition: "background 600ms ease",
          }}
        />

        {/* Product Designer text */}
        <p
          className="absolute font-['Favorit_Tumblr:Medium',sans-serif] leading-[normal] left-[38.5%] max-sm:left-[11%] max-sm:right-[11%] not-italic text-[22px] max-sm:text-[18px] top-[47.8%] max-sm:top-[46%] tracking-[-0.44px]"
          style={{
            color: darkMode ? "#c0bcbc" : "#888484",
            transition: "color 600ms ease",
          }}
        >Product Designer</p>
        <Typewriter darkMode={darkMode} />
        <Frame open={tooltipOpen} onToggle={() => setTooltipOpen((v) => !v)} darkMode={darkMode} />
        {/* Visitor image upload — only shown once Supabase is configured */}
        {uploadsOn && (
          <AddImageFlow
            darkMode={darkMode}
            status={uploadStatus}
            error={uploadError}
            onFile={upload}
            onLink={addByLink}
            onAddingChange={handleAddingChange}
            onPreviewChange={setPreviewUrl}
            pushDown={!!currentSong}
          />
        )}

        {/* Anonymous confessions — desktop: submit box + feed underneath it */}
        {confOn && (
          <ConfessionFlow
            darkMode={darkMode}
            status={confStatus}
            error={confError}
            confessions={confessions}
            onSubmit={submitConfession}
            pushDown={!!currentSong}
          />
        )}
        {/* Anonymous confessions — mobile: swipe-up bottom sheet */}
        {confOn && (
          <ConfessionSheetMobile
            darkMode={darkMode}
            status={confStatus}
            error={confError}
            confessions={confessions}
            onSubmit={submitConfession}
          />
        )}

        {/* Top banner: the current background image's attached song, if it has one */}
        {currentSong && <SongBanner song={currentSong} darkMode={darkMode} />}

        {/* Caption for the current background, when it's a visitor upload with a note */}
        {caption && (
          <div
            key={caption}
            className={`absolute ${currentSong ? "max-sm:top-12" : "max-sm:top-9"} max-sm:left-4 max-sm:max-w-[38vw] sm:bottom-6 sm:left-6 sm:max-w-[280px]`}
            style={{ zIndex: 30, animation: "fadeIn 500ms ease" }}
          >
            <div
              className="font-['Favorit_Tumblr:Medium',sans-serif] text-[13px] max-sm:text-[11px] leading-snug px-3 py-2 max-sm:px-2.5 max-sm:py-1.5 rounded-[10px]"
              style={{
                background: darkMode ? "rgba(26,26,26,0.78)" : "rgba(248,248,248,0.9)",
                color: darkMode ? "#E0E0E0" : "#3a3a3a",
                boxShadow: darkMode
                  ? "0 0 0 1px rgba(255,255,255,0.14), 0 2px 10px rgba(0,0,0,0.3)"
                  : "0 0 0 1px rgba(0,0,0,0.07), 0 2px 10px rgba(0,0,0,0.14)",
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
                transition: "background 400ms ease, color 400ms ease",
              }}
            >
              <span style={{ opacity: 0.55 }}>“</span>{caption}<span style={{ opacity: 0.55 }}>”</span>
            </div>
          </div>
        )}
      </div>

      {/* Mobile overlay — rendered at root level so fixed positioning works correctly */}
      {tooltipOpen && (
        <div
          className="sm:hidden fixed inset-0 flex items-center justify-center px-6"
          style={{ zIndex: 100 }}
          onClick={() => setTooltipOpen(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <ConnectTooltip darkMode={darkMode} onClose={() => setTooltipOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
