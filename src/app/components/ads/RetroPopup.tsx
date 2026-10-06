import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { Ad } from "./adConfig";

const RETRO_FONT = "Tahoma, Verdana, 'Segoe UI', sans-serif";
const LOUD_FONT = "'Arial Black', Impact, sans-serif";

/** Grey, bevelled window chrome with a navy title bar — the classic 2001 pop-up. */
export function RetroWindow({
  title,
  onClose,
  children,
  width = 340,
  flashing = false,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  width?: number;
  flashing?: boolean;
}) {
  return (
    <div
      role="dialog"
      aria-label={title}
      className={flashing ? "retro-flash" : ""}
      style={{
        width,
        maxWidth: "calc(100vw - 32px)",
        background: "#c0c0c0",
        border: "2px solid",
        borderColor: "#ffffff #404040 #404040 #ffffff",
        boxShadow: "1px 1px 0 #000, 4px 6px 18px rgba(0,0,0,0.35)",
        fontFamily: RETRO_FONT,
        padding: 2,
      }}
    >
      <div
        className="flex items-center justify-between px-1.5 h-[20px] select-none"
        style={{ background: "linear-gradient(90deg, #0a246a 0%, #3a6ea5 60%, #a6caf0 100%)" }}
      >
        <span className="text-white text-[11px] font-bold truncate pr-2">{title}</span>
        <div className="flex gap-[2px]">
          {["_", "□"].map((g) => (
            <span key={g} aria-hidden className="retro-btn w-[16px] h-[14px] text-[9px] leading-[12px] text-center">{g}</span>
          ))}
          <button type="button" onClick={onClose} aria-label="Close" className="retro-btn w-[16px] h-[14px] text-[10px] leading-[11px] font-bold">
            ×
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}

/** The shared keyframes + bevel button style the pop-ups use. */
export function RetroStyles() {
  return (
    <style>{`
      .retro-btn { background:#c0c0c0; color:#000; border:1px solid; border-color:#fff #404040 #404040 #fff; box-shadow: inset -1px -1px 0 #808080; }
      .retro-btn:active { border-color:#404040 #fff #fff #404040; box-shadow:none; }
      @keyframes retroBlink { 0%,49% { opacity:1 } 50%,100% { opacity:0.15 } }
      .retro-blink { animation: retroBlink 0.9s steps(1) infinite; }
      @keyframes retroColors { 0% { color:#d40000 } 33% { color:#0000cc } 66% { color:#008a00 } 100% { color:#d40000 } }
      .retro-colors { animation: retroColors 0.8s steps(3) infinite; }
      @keyframes retroFlash { 0% { outline-color:#ff0000 } 25% { outline-color:#ffff00 } 50% { outline-color:#00ff00 } 75% { outline-color:#00ffff } 100% { outline-color:#ff00ff } }
      .retro-flash { outline: 4px solid #ff0000; animation: retroFlash 0.6s linear infinite; }
      @keyframes retroShake { 0%,100% { translate:0 0 } 20% { translate:-8px 2px } 40% { translate:7px -3px } 60% { translate:-6px 1px } 80% { translate:5px -2px } }
      .retro-shake { animation: retroShake 0.45s ease-in-out; }
      @keyframes retroMarquee { from { transform: translateX(100%) } to { transform: translateX(-100%) } }
      .retro-marquee { display:inline-block; white-space:nowrap; animation: retroMarquee 6s linear infinite; }
      @keyframes retroPop { from { transform: scale(0.6); opacity:0 } to { transform: scale(1); opacity:1 } }
      .retro-pop { animation: retroPop 160ms steps(4) both; }
      @keyframes retroProgress { from { width: 8% } to { width: 92% } }
      @keyframes retroHot { from { background-position: 0% 50% } to { background-position: 300% 50% } }
      .retro-hot { background: linear-gradient(110deg, #ff2d95, #ff7a00, #ffd400, #ff2d95, #ff7a00) 0% 50% / 300% 100%; animation: retroHot 4s linear infinite; }
      @media (prefers-reduced-motion: reduce) { .retro-blink, .retro-colors, .retro-flash, .retro-shake, .retro-marquee, .retro-hot { animation: none !important; } }
    `}</style>
  );
}

function Headline({ ad, color, size }: { ad: Ad; color: string; size: number }) {
  const cls = ad.flash >= 3 ? "retro-colors" : "";
  if (ad.flash >= 4) {
    return (
      <div className="w-full overflow-hidden font-black uppercase" style={{ color, fontSize: size, fontFamily: LOUD_FONT }}>
        <span className={`retro-marquee ${cls}`}>★ {ad.headline} ★</span>
      </div>
    );
  }
  return (
    <div className={`font-black uppercase leading-tight ${cls}`} style={{ color, fontSize: size, fontFamily: LOUD_FONT }}>
      {ad.headline}
    </div>
  );
}

/** The inside of an ad pop-up, drawn in the chosen template. */
export function AdBody({ ad, onCta, onNo }: { ad: Ad; onCta: () => void; onNo?: () => void }) {
  const blink = ad.flash >= 2 ? "retro-blink" : "";
  const no = ad.noLabel && (
    <button type="button" onClick={onNo} className="retro-btn px-3 py-1 text-[12px]">{ad.noLabel}</button>
  );
  const credit = <div className="text-[10px]" style={{ color: "#808080" }}>advertisement · {ad.company}</div>;
  const logo = (cls = "") => ad.logo && <img src={ad.logo} alt={`${ad.company} logo`} className={`max-h-[44px] max-w-[160px] object-contain ${cls}`} />;

  if (ad.template === "system") {
    return (
      <div className="m-[2px] p-3 flex flex-col gap-2.5 text-black" style={{ background: "#d4d0c8" }}>
        <div className="flex gap-3 items-start">
          {ad.logo
            ? <img src={ad.logo} alt={`${ad.company} logo`} className="size-[36px] object-contain shrink-0" />
            : <span className="text-[30px] leading-none" aria-hidden>⚠️</span>}
          <div className="flex flex-col gap-1 min-w-0 flex-1">
            <Headline ad={ad} color="#000080" size={14} />
            <p className="text-[12px] leading-snug">{ad.body}</p>
            {ad.image && <img src={ad.image} alt="" className="max-h-[90px] max-w-full object-contain border border-[#808080] mt-1" />}
          </div>
        </div>
        <div className="h-[14px] border border-[#808080] bg-white p-[1px]">
          <div className="h-full" style={{ background: "repeating-linear-gradient(90deg, #0a246a 0 8px, transparent 8px 10px)", animation: "retroProgress 3s steps(12) infinite" }} />
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onCta} className={`retro-btn px-4 py-1 text-[12px] font-bold ${blink}`}>{ad.cta}</button>
          <span className="retro-btn px-4 py-1 text-[12px]" aria-hidden>Cancel</span>
        </div>
        {credit}
      </div>
    );
  }

  if (ad.template === "winner") {
    return (
      <div
        className="m-[2px] p-3 flex flex-col items-center text-center gap-2"
        style={{ background: "repeating-conic-gradient(from 0deg at 50% 40%, #fff35c 0deg 12deg, #ffd000 12deg 24deg)" }}
      >
        {ad.logo && <div className="bg-white px-2 py-1">{logo()}</div>}
        <div className="text-[11px] font-bold tracking-wide px-2 bg-white" style={{ color: "#d40000" }}>★ CONGRATULATIONS ★</div>
        <Headline ad={ad} color="#0000cc" size={20} />
        {ad.image && <img src={ad.image} alt="" className="max-h-[110px] max-w-full object-contain border-2 border-white" />}
        <p className="text-[12px] leading-snug text-black bg-white/85 px-2 py-1">{ad.body}</p>
        <button type="button" onClick={onCta} className={`px-5 py-1.5 text-[14px] font-black uppercase text-white ${blink}`}
          style={{ background: "#d40000", border: "2px solid", borderColor: "#ff8080 #800000 #800000 #ff8080", fontFamily: LOUD_FONT }}>
          {ad.cta}
        </button>
        <div className="bg-white/85 px-1">{credit}</div>
      </div>
    );
  }

  return (
    <div className="m-[2px] p-3 flex flex-col items-center text-center gap-2" style={{ background: ad.flash >= 3 ? "#fffbe6" : "#ffffff" }}>
      {logo()}
      <Headline ad={ad} color="#d40000" size={17} />
      {ad.image && <img src={ad.image} alt="" className="max-h-[120px] max-w-full object-contain border border-[#808080]" />}
      <p className="text-[12px] leading-snug text-black">{ad.body}</p>
      <div className="flex items-center gap-2">
        <button type="button" onClick={onCta} className={`px-4 py-1.5 text-[13px] font-bold uppercase ${blink}`}
          style={{ background: "#ffeb00", color: "#0000cc", border: "2px solid", borderColor: "#fff8a0 #806c00 #806c00 #fff8a0" }}>
          {ad.cta}
        </button>
        {no}
      </div>
      {credit}
    </div>
  );
}

/** "You have 1 message waiting" — the side pop-up that annoyance level 3+ adds. */
export function MessageAlert({ onClose, onCta }: { onClose: () => void; onCta: () => void }) {
  return (
    <RetroWindow title="Message Alert" onClose={onClose} width={250}>
      <div className="m-[2px] p-3 bg-white text-[12px] text-black flex items-center gap-2">
        <span className="retro-blink text-[18px]" aria-hidden>✉️</span>
        <span>
          You have <b>1 message</b> waiting for you.{" "}
          <button type="button" onClick={onCta} className="underline" style={{ color: "#0000cc" }}>read it</button>
        </span>
      </div>
    </RetroWindow>
  );
}

/** Re-triggers the shake animation every few seconds while `on`. */
export function useShake(on: boolean) {
  const [key, setKey] = useState(0);
  useEffect(() => {
    if (!on) return;
    const t = setInterval(() => setKey((k) => k + 1), 4000);
    return () => clearInterval(t);
  }, [on]);
  return key;
}

const DELAY_BY_ANNOY = [4000, 2500, 2000, 1500, 1000];

type Box = { left: number; top: number; right: number; bottom: number };
const overlaps = (a: Box, b: Box) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

/**
 * Where the main pop-up goes: somewhere that never covers the login field or the
 * Log In button (anything marked data-ad-avoid). Tries the corners first; if none is
 * clear it sits in the bigger gap above or below the login and shrinks to fit.
 */
function placeClearOfLogin(w: number, h: number): CSSProperties {
  const vw = window.innerWidth, vh = window.innerHeight;
  const m = vw < 640 ? 16 : 24;
  const pad = 16; // breathing room around the login, and room for the shake
  const rects = [...document.querySelectorAll<HTMLElement>("[data-ad-avoid]")]
    .map((el) => el.getBoundingClientRect())
    .filter((r) => r.width && r.height);
  const avoid: Box | null = rects.length
    ? {
        left: Math.min(...rects.map((r) => r.left)) - pad,
        top: Math.min(...rects.map((r) => r.top)) - pad,
        right: Math.max(...rects.map((r) => r.right)) + pad,
        bottom: Math.max(...rects.map((r) => r.bottom)) + pad + 40, // + the Log In tooltip under the button
      }
    : null;
  const top = vw < 640 ? 40 : 72; // below the corner buttons
  const spots = [
    { left: vw - m - w, top: vh - m - h },
    { left: m, top: vh - m - h },
    { left: vw - m - w, top },
    { left: m, top },
    { left: (vw - w) / 2, top: vh - m - h },
    { left: (vw - w) / 2, top },
  ];
  for (const s of spots) {
    const box = { left: s.left, top: s.top, right: s.left + w, bottom: s.top + h };
    if (box.left >= 0 && box.top >= 0 && box.right <= vw && box.bottom <= vh && (!avoid || !overlaps(box, avoid))) {
      return { left: s.left, top: s.top };
    }
  }
  // Nothing clear at full size: use the bigger gap above/below the login, scaled down to fit
  const above = { top, bottom: (avoid?.top ?? vh / 2) };
  const below = { top: (avoid?.bottom ?? vh / 2), bottom: vh - m };
  const gap = above.bottom - above.top >= below.bottom - below.top ? above : below;
  const scale = Math.max(0.4, Math.min(1, (gap.bottom - gap.top) / h, (vw - 2 * m) / w));
  return {
    left: (vw - w * scale) / 2,
    top: gap.top + (gap.bottom - gap.top - h * scale) / 2,
    transform: `scale(${scale})`,
    transformOrigin: "top left",
  };
}

/** Keeps the pop-up clear of the login, re-placing it whenever the window resizes. */
function useClearOfLogin(open: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<CSSProperties | null>(null);
  useLayoutEffect(() => {
    if (!open) { setStyle(null); return; }
    const place = () => {
      const el = ref.current;
      if (el) setStyle(placeClearOfLogin(el.offsetWidth, el.offsetHeight));
    };
    place();
    // Re-place on resize, and when the pop-up's own size changes (e.g. its image loads)
    const ro = new ResizeObserver(place);
    if (ref.current) ro.observe(ref.current);
    window.addEventListener("resize", place);
    return () => { ro.disconnect(); window.removeEventListener("resize", place); };
  }, [open]);
  return { ref, style };
}

/**
 * Shows one ad as pop-ups, behaving according to its annoyance level (see ANNOY_LEVELS):
 * sooner at 2, a message pop-up at 3, shaking at 4, and one comeback at 5.
 * Escape always closes everything.
 */
export function AdPopups({ ad, onCta, onDone, delayMs }: { ad: Ad; onCta: () => void; onDone: () => void; delayMs?: number }) {
  const [mainOpen, setMainOpen] = useState(false);
  const [msgOpen, setMsgOpen] = useState(false);
  const [cameBack, setCameBack] = useState(false);
  const shakeKey = useShake(ad.annoy >= 4 && mainOpen);
  const spot = useClearOfLogin(mainOpen);

  useEffect(() => {
    const t = setTimeout(() => { setMainOpen(true); if (ad.annoy >= 3) setMsgOpen(true); }, delayMs ?? DELAY_BY_ANNOY[ad.annoy - 1] ?? 3000);
    return () => clearTimeout(t);
  }, [ad.annoy, delayMs]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setMainOpen(false); setMsgOpen(false); setCameBack(true); onDone(); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onDone]);

  function closeMain() {
    setMainOpen(false);
    if (ad.annoy >= 5 && !cameBack) {
      setCameBack(true);
      setTimeout(() => setMainOpen(true), 15000);
    } else if (!msgOpen) {
      onDone();
    }
  }

  function closeMsg() {
    setMsgOpen(false);
    if (!mainOpen && (ad.annoy < 5 || cameBack)) onDone();
  }

  function cta() {
    setMainOpen(false);
    setMsgOpen(false);
    onCta();
    onDone();
  }

  function dismiss() {
    setMainOpen(false);
    setMsgOpen(false);
    setCameBack(true);
    onDone();
  }

  return (
    <>
      <RetroStyles />
      {mainOpen && (
        <div
          ref={spot.ref}
          className="fixed"
          style={{ zIndex: 120, left: 0, top: 0, ...spot.style, visibility: spot.style ? "visible" : "hidden" }}
        >
          <div className="retro-pop">
            <div key={shakeKey} className={shakeKey ? "retro-shake" : ""}>
              <RetroWindow title={`${ad.company} — Special Offer!!`} onClose={closeMain} flashing={ad.flash >= 5}>
                <AdBody ad={ad} onCta={cta} onNo={dismiss} />
              </RetroWindow>
            </div>
          </div>
        </div>
      )}
      {msgOpen && (
        <div className="fixed top-24 right-6 max-sm:top-20 max-sm:right-4 retro-pop" style={{ zIndex: 121 }}>
          <MessageAlert onClose={closeMsg} onCta={cta} />
        </div>
      )}
    </>
  );
}
