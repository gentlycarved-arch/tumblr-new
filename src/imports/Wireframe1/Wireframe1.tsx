import { useState, useEffect } from "react";
import bgImage from "../Wireframe_-_2.png";
import logoImage from "../Group_3.png";
import { ConnectTooltip } from "../../app/components/connect-tooltip";
import { useArenaSlideshow } from "../../hooks/useArenaSlideshow";

// Each phrase can have typos: { after: string, wrong: string }
// meaning: after typing `after`, type `wrong` chars then backspace before continuing
type Typo = { after: string; wrong: string };
type PhraseConfig = { text: string; typos?: Typo[] };

const PHRASE_CONFIGS: PhraseConfig[] = [
  // "Daydreaner" → fixes to "Daydreamer"
  { text: "& Daydreamer", typos: [{ after: "& Daydrea", wrong: "ner" }] },
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

function Group() {
  return (
    <div className="absolute inset-[33.3%_33.59%_57.08%_33.71%] max-sm:inset-[28%_10%_60%_10%]">
      <img alt="" className="block size-full object-contain" src={logoImage} />
    </div>
  );
}

function Frame({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const [hover, setHover] = useState(false);

  const ringed = hover || open;

  return (
    <div
      className="absolute right-[39%] top-[55%] -translate-y-1/2 max-sm:right-[10%] max-sm:top-[54.5%]"
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
              <stop offset="0%" stopColor="#b8b5b5" />
              <stop offset="100%" stopColor="#848181" />
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
        <span className="relative z-10 font-['Inter:Medium',sans-serif] font-medium text-[14px] text-white leading-none select-none"
          style={{ textShadow: "0 1px 2px rgba(0,0,0,0.4)" , fontSize: "12px" }}>?</span>
      </button>

      {/* Desktop tooltip — appears to the right of the button */}
      {open && (
        <div className="hidden sm:block absolute left-[32px] top-1/2 -translate-y-1/2 z-50">
          <ConnectTooltip />
        </div>
      )}
    </div>
  );
}

function ModeToggle({ darkMode, onToggle }: { darkMode: boolean; onToggle: () => void }) {
  const [hover, setHover] = useState(false);

  const TRACK_W = 80;
  const TRACK_H = 42;
  const KNOB = 34;
  const PAD = (TRACK_H - KNOB) / 2;
  const knobX = darkMode ? TRACK_W - KNOB - PAD : PAD;

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
        onClick={onToggle}
        aria-label="Toggle dark/light mode"
        style={{ width: TRACK_W, height: TRACK_H, position: "relative" }}
      >
        <svg width={TRACK_W} height={TRACK_H} viewBox={`0 0 ${TRACK_W} ${TRACK_H}`} fill="none">
          <defs>
            <radialGradient id="knobGrad" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#c8c5c5" />
              <stop offset="100%" stopColor="#909090" />
            </radialGradient>
          </defs>

          {/* Track */}
          <rect x="0.5" y="0.5" width={TRACK_W - 1} height={TRACK_H - 1} rx={TRACK_H / 2} ry={TRACK_H / 2}
            fill="rgba(200,198,198,0.55)"
            stroke="rgba(0,0,0,0.13)"
            strokeWidth="1"
          />
          {/* Track inset shadow top */}
          <rect x="1" y="1" width={TRACK_W - 2} height={TRACK_H / 2} rx={(TRACK_H / 2) - 1} ry={(TRACK_H / 2) - 1}
            fill="rgba(0,0,0,0.06)"
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
              // Moon
              <path
                d={`M${KNOB / 2 + 3} ${TRACK_H / 2 - 1.5}a4 4 0 01-4-4 4 4 0 01.4-1.8A4 4 0 1${KNOB / 2 + 3} ${TRACK_H / 2 - 1.5}z`}
                fill="white"
                opacity="0.9"
              />
            ) : (
              // Sun
              <g>
                <circle cx={KNOB / 2} cy={TRACK_H / 2} r="3" fill="white" opacity="0.9" />
                {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
                  const rad = deg * Math.PI / 180;
                  const cx = KNOB / 2;
                  const cy = TRACK_H / 2;
                  return (
                    <line
                      key={deg}
                      x1={cx + Math.cos(rad) * 5}
                      y1={cy + Math.sin(rad) * 5}
                      x2={cx + Math.cos(rad) * 6.5}
                      y2={cy + Math.sin(rad) * 6.5}
                      stroke="white"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      opacity="0.9"
                    />
                  );
                })}
              </g>
            )}
          </g>
        </svg>
      </button>

      {/* Tooltip — desktop only, slides down below toggle */}
      <div
        className="hidden sm:block absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          opacity: hover ? 1 : 0,
          transform: hover ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(-4px)",
          transition: "opacity 200ms ease, transform 200ms ease",
        }}
      >
        {/* Arrow pointing up */}
        <div className="flex justify-center mb-[-1px]">
          <div className="w-0 h-0"
            style={{
              borderLeft: "5px solid transparent",
              borderRight: "5px solid transparent",
              borderBottom: "5px solid rgba(255,255,255,0.92)",
            }}
          />
        </div>
        <div
          className="px-3 py-2 rounded-[10px] text-[12px] font-['Inter:Regular',sans-serif] text-[#444] leading-snug text-center"
          style={{
            width: 190,
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(8px)",
            boxShadow: "0 2px 10px rgba(0,0,0,0.12), inset 0 0 0 1px rgba(0,0,0,0.07)",
          }}
        >
          {darkMode
            ? "Dark mode — showing moodier images from your curated collection."
            : "Light mode — showing brighter images from your curated collection."}
        </div>
      </div>
    </div>
  );
}

function Typewriter() {
  const { displayed, pausing } = useTypewriter();
  return (
    <p className="absolute font-['Favorit_Tumblr:Medium',sans-serif] leading-[normal] left-[38.5%] max-sm:left-[11%] max-sm:right-[11%] not-italic text-[#afacac] text-[22px] max-sm:text-[18px] top-[53.9%] max-sm:top-[53%] tracking-[-0.44px]">
      {displayed}
      <span
        className="inline-block w-[2px] h-[22px] max-sm:h-[18px] bg-[#afacac] ml-[2px] align-[-4px]"
        style={{ animation: pausing ? "blink 1s steps(1) infinite" : "none", opacity: pausing ? undefined : 1 }}
      />
    </p>
  );
}

const DARK_SLUG  = "gently-carved-dark-mode";
const LIGHT_SLUG = "gently-carved-light-mode";

export default function Wireframe() {
  const [darkMode, setDarkMode] = useState(false);
  const slug = darkMode ? DARK_SLUG : LIGHT_SLUG;
  const { currentSrc, nextSrc, fading, fadeDuration } = useArenaSlideshow(bgImage, slug);
  const [tooltipOpen, setTooltipOpen] = useState(false);

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
        <ModeToggle darkMode={darkMode} onToggle={() => setDarkMode((v) => !v)} />
        <Group />
        <a
          href="mailto:gentlycarved@gmail.com"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 50% 35%, #7eb4e0 0%, #6a9fd8 35%, #5688be 70%, #4a7aaa 100%)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.55), inset 0 -2px 4px rgba(0,0,0,0.25), 0 2px 4px rgba(0,0,0,0.25)",
          }}
          className="absolute hover:brightness-90 active:brightness-90 active:translate-y-px transition-all border border-[rgba(255,255,255,0.35)] border-solid inset-[61.43%_37.62%_32.62%_37.68%] max-sm:inset-[61%_8%_32%_8%] rounded-[10px] flex items-center justify-center"
        >
          <span
            style={{ textShadow: "0 1px 1px rgba(0,0,0,0.25)" }}
            className="font-['Favorit_Tumblr:Medium',sans-serif] leading-[normal] not-italic text-[22px] max-sm:text-[18px] text-center text-white tracking-[-0.52px]"
          >
            Portfolio Request
          </span>
        </a>
        <div className="absolute inset-[46.19%_37.62%_41.41%_37.68%] max-sm:inset-[44%_8%_42%_8%] pointer-events-none rounded-[13px]">
          <div aria-hidden="true" className="absolute bg-white inset-0 rounded-[13px]" />
          <div className="absolute inset-0 rounded-[inherit] shadow-[inset_0px_0px_5.8px_-1px_black]" />
          <div aria-hidden="true" className="absolute border-0 border-[#2f2f2f] border-solid inset-0 rounded-[13px]" />
        </div>
        <div className="absolute h-px left-[37.68%] right-[37.62%] top-[52%] max-sm:left-[10%] max-sm:right-[10%] max-sm:top-[51%] bg-[#CAC5C5]" />
        <p className="absolute font-['Favorit_Tumblr:Medium',sans-serif] leading-[normal] left-[38.5%] max-sm:left-[11%] max-sm:right-[11%] not-italic text-[#afacac] text-[22px] max-sm:text-[18px] top-[47.8%] max-sm:top-[46%] tracking-[-0.44px]">Product Designer</p>
        <Typewriter />
        <Frame open={tooltipOpen} onToggle={() => setTooltipOpen((v) => !v)} />
      </div>

      {/* Mobile overlay — rendered at root level so fixed positioning works correctly */}
      {tooltipOpen && (
        <div
          className="sm:hidden fixed inset-0 flex items-center justify-center px-6"
          style={{ zIndex: 100 }}
          onClick={() => setTooltipOpen(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <ConnectTooltip />
          </div>
        </div>
      )}
    </div>
  );
}
