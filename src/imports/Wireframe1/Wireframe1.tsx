import { useState, useEffect, useRef } from "react";
import bgImage from "../Wireframe_-_2.png";
import logoImage from "../Group_3.png";
import logoImageDark from "../Group_3_dark.png";
import { ConnectTooltip } from "../../app/components/connect-tooltip";
import { useArenaSlideshow } from "../../hooks/useArenaSlideshow";

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

  const ringed = hover || open;

  return (
    <div
      className="absolute right-[38.5%] top-[55%] -translate-y-1/2 max-sm:right-[11%] max-sm:top-[55.5%]"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <button
        type="button"
        onClick={onToggle}
        className="relative size-[23px] flex items-center justify-center z-[51]"
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
          style={{ textShadow: "0 1px 2px rgba(0,0,0,0.4)", fontSize: "15px", lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>?</span>
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

function ModeToggle({ darkMode, onToggle }: { darkMode: boolean; onToggle: () => void }) {
  const [hover, setHover] = useState(false);
  const [mobileToast, setMobileToast] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const TRACK_W = 80;
  const TRACK_H = 42;
  const KNOB = 34;
  const PAD = (TRACK_H - KNOB) / 2;
  const knobX = darkMode ? TRACK_W - KNOB - PAD : PAD;

  function handleToggle() {
    onToggle();
    setMobileToast(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setMobileToast(false), 3000);
  }

  return (
    <div
      className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center"
      style={{ zIndex: 10 }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* The toggle switch */}
      <button
        type="button"
        onClick={handleToggle}
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
            <clipPath id="moonClip">
              <circle cx={KNOB / 2} cy={TRACK_H / 2} r="7" />
            </clipPath>
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
            fill="url(#knobGrad)"
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
              // Skeuomorphic Moon — white crescent with depth
              <g>
                {/* Main crescent body */}
                <circle cx={KNOB / 2} cy={TRACK_H / 2} r="7" fill="white" clipPath="url(#moonClip)" />
                {/* Cutout circle to form crescent */}
                <circle cx={KNOB / 2 + 5} cy={TRACK_H / 2 - 1.5} r="5.8" fill="url(#knobGrad)" clipPath="url(#moonClip)" />
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

      {/* Arrow + tooltip — desktop only, fixed to viewport center */}
      {hover && (
        <div
          className="hidden sm:block pointer-events-none fixed"
          style={{
            top: 32 + TRACK_H - 4,
            left: "50%",
            transform: "translateX(-50%)",
            opacity: 1,
            zIndex: 100,
            filter: "drop-shadow(0 3px 8px rgba(0,0,0,0.18))",
          }}
        >
          <div style={{
            width: 12, height: 12,
            background: darkMode ? "#1A1A1A" : "#F4F5F7",
            transform: "rotate(45deg)",
            margin: "0 auto",
            marginBottom: -6,
            borderRadius: 2,
          }} />
          <div
            className="px-3 py-2 rounded-[10px] text-[12px] font-['Favorit_Tumblr:Medium',sans-serif] leading-snug text-center"
            style={{
              width: 210,
              background: darkMode ? "#1A1A1A" : "linear-gradient(180deg, #F4F5F7 0%, #E8E9EC 100%)",
              color: darkMode ? "#E0E0E0" : "#212529",
            }}
          >
            {darkMode
              ? "Dark mode changes to darker coloured images."
              : "Light mode changes to lighter coloured images."}
          </div>
        </div>
      )}

      {/* Mobile toast — appears for 3s after toggling */}
      <div
        className="sm:hidden fixed pointer-events-none"
        style={{
          top: 32 + TRACK_H - 4,
          left: "50%",
          transform: "translateX(-50%)",
          opacity: mobileToast ? 1 : 0,
          transition: "opacity 400ms ease",
          zIndex: 100,
          background: "transparent",
          filter: "drop-shadow(0 3px 10px rgba(0,0,0,0.18))",
        }}
      >
        {/* Arrow */}
        <div style={{
          width: 14, height: 14,
          background: darkMode ? "#1A1A1A" : "#F4F5F7",
          transform: "rotate(45deg)",

          margin: "0 auto",
          marginBottom: -7,
          borderRadius: 2,
        }} />
        {/* Card */}
        <div
          className="px-4 py-3 rounded-[12px] text-[15px] font-['Favorit_Tumblr:Medium',sans-serif] leading-snug text-center"
          style={{
            width: 240,
            background: darkMode ? "#1A1A1A" : "linear-gradient(180deg, #F4F5F7 0%, #E8E9EC 100%)",
            color: darkMode ? "#E0E0E0" : "#212529",
          }}
        >
          {darkMode
            ? "Dark mode changes to darker coloured images."
            : "Light mode changes to lighter coloured images."}
        </div>
      </div>
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

/**
 * Samples image pixels via canvas and returns 'dark' or 'light'.
 * Considers BOTH perceived brightness and color saturation: vivid, highly
 * saturated images bias toward dark mode (so the UI contrasts against them),
 * even when their raw brightness sits in the middle. Falls back to 'light' on CORS errors.
 */
async function detectImageMode(src: string): Promise<'dark' | 'light'> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const SIZE = 64; // sample at 64×64 for speed
      const canvas = document.createElement("canvas");
      canvas.width = SIZE;
      canvas.height = SIZE;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve("light");
      ctx.drawImage(img, 0, 0, SIZE, SIZE);
      try {
        const { data } = ctx.getImageData(0, 0, SIZE, SIZE);
        const pixels = data.length / 4;
        let lumTotal = 0;
        let satTotal = 0;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          // Perceived luminance (ITU-R BT.601)
          lumTotal += 0.299 * r + 0.587 * g + 0.114 * b;
          // HSL-style saturation: (max-min)/(255-|max+min-255|)
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const delta = max - min;
          satTotal += delta === 0 ? 0 : delta / (255 - Math.abs(max + min - 255));
        }
        const avgLum = lumTotal / pixels;       // 0–255
        const avgSat = satTotal / pixels;       // 0–1

        // A saturated image needs darker UI to stay readable, so raise the
        // brightness threshold: the more colorful, the more we lean dark.
        // base 118, +up to ~40 for fully saturated images.
        const threshold = 118 + avgSat * 42;

        resolve(avgLum < threshold ? "dark" : "light");
      } catch {
        resolve("light"); // CORS blocked — fall back gracefully
      }
    };
    img.onerror = () => resolve("light");
    img.src = src;
  });
}

export default function Wireframe() {
  const [darkMode, setDarkMode] = useState(false);
  const [autoMode, setAutoMode] = useState(true); // auto-detect until user overrides
  const { currentSrc, nextSrc, fading, fadeDuration } = useArenaSlideshow(bgImage, MAIN_SLUG);
  const [tooltipOpen, setTooltipOpen] = useState(false);

  // Auto-detect mode from current image until user manually toggles
  useEffect(() => {
    if (!autoMode) return;
    if (!currentSrc || currentSrc === bgImage) return;
    detectImageMode(currentSrc).then((detected) => {
      setDarkMode(detected === 'dark');
    });
  }, [currentSrc, autoMode]);

  function handleToggle() {
    setAutoMode(false); // user manually overriding — pause auto-detect
    setDarkMode((v) => !v);
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
      {/* Current image on top — fades out to reveal next */}
      <img
        alt=""
        src={currentSrc}
        className="absolute inset-0 size-full object-cover pointer-events-none"
        style={{
          zIndex: 1,
          opacity: fading ? 0 : 1,
          transition: `opacity ${fadeDuration}ms ease-in-out`,
        }}
      />
      {/* All content above the background layers (z-index: 2+) */}
      <div className="absolute inset-0" style={{ zIndex: 2 }}>
        {/* Dark / Light mode toggle */}
        <ModeToggle darkMode={darkMode} onToggle={handleToggle} />
        <Group darkMode={darkMode} />
        {/* Portfolio Request button — two gradient layers, opacity-transitioned */}
        <style>{`
          .btn-glow {
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.55), inset 0 -2px 4px rgba(0,0,0,0.25), 0 2px 4px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.35);
          }
          @keyframes strokeSweep {
            0%   { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          .btn-sweep {
            position: absolute;
            inset: -1.5px;
            border-radius: 11.5px;
            padding: 1.5px;
            background: linear-gradient(90deg, transparent 25%, rgba(255,255,255,0.5) 50%, transparent 75%);
            background-size: 300% 100%;
            background-position: -200% 0;
            -webkit-mask:
              linear-gradient(#fff 0 0) content-box,
              linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask:
              linear-gradient(#fff 0 0) content-box,
              linear-gradient(#fff 0 0);
            mask-composite: exclude;
            pointer-events: none;
            opacity: 0;
            transition: opacity 120ms ease;
            z-index: 20;
          }
          .btn-glow:hover .btn-sweep {
            opacity: 1;
            animation: strokeSweep 1s ease forwards;
          }
        `}</style>
        <a
          href="mailto:gentlycarved@gmail.com"
          className="btn-glow absolute active:translate-y-px inset-[61.43%_37.62%_32.62%_37.68%] max-sm:inset-[61%_8%_32%_8%] rounded-[10px] flex items-center justify-center"
        >
          {/* Traveling border glow */}
          <div className="btn-sweep" />
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
