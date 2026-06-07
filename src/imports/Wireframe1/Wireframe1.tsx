import { useState } from "react";
import bgImage from "../Wireframe_-_2.png";
import logoImage from "../Group_3.png";
import { ConnectTooltip } from "../../app/components/connect-tooltip";
import { useArenaSlideshow } from "../../hooks/useArenaSlideshow";

function Group() {
  return (
    <div className="absolute inset-[33.3%_33.59%_57.08%_33.71%] max-sm:inset-[28%_10%_60%_10%]">
      <img alt="" className="block size-full object-contain" src={logoImage} />
    </div>
  );
}

function Frame() {
  const [hover, setHover] = useState(false);
  const [open, setOpen] = useState(false);

  const ringed = hover || open;

  return (
    <div
      className="absolute right-[39%] top-[54%] max-sm:right-[10%] max-sm:top-[54.5%] max-sm:-translate-y-1/2"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative size-[28px] flex items-center justify-center z-[51]"
        aria-label="About this site"
      >
        <svg className="absolute inset-0 size-full" fill="none" viewBox="0 0 28 28">
          {/* Base circle with skeuomorphic gradient */}
          <circle cx="14" cy="14" r="13.5"
            fill={`url(#btnGrad${ringed ? "Hover" : "Base"})`}
          />
          {/* Top highlight */}
          <circle cx="14" cy="14" r="13.5"
            fill="none"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="1"
          />
          {/* Inner shadow at bottom */}
          <circle cx="14" cy="14" r="13.5"
            fill="none"
            stroke="rgba(0,0,0,0.18)"
            strokeWidth="1.5"
            strokeDasharray="44 44"
            strokeDashoffset="22"
          />
          {/* Outer ring on hover */}
          {ringed && !open && (
            <circle cx="14" cy="14" r="12.5"
              fill="none"
              stroke="rgba(255,255,255,0.7)"
              strokeWidth="1"
            />
          )}
          <defs>
            <radialGradient id="btnGradBase" cx="50%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#b0adad" />
              <stop offset="100%" stopColor="#888585" />
            </radialGradient>
            <radialGradient id="btnGradHover" cx="50%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#9e9b9b" />
              <stop offset="100%" stopColor="#707070" />
            </radialGradient>
          </defs>
        </svg>
        <span className="relative z-10 font-['Inter:Medium',sans-serif] font-medium text-[14px] text-white leading-none select-none"
          style={{ textShadow: "0 1px 2px rgba(0,0,0,0.4)" }}>?</span>
      </button>

      {open && (
        <>
          {/* Mobile backdrop — tap anywhere to close */}
          <div
            className="hidden max-sm:block fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-[32px] top-1/2 -translate-y-1/2 z-50 max-sm:fixed max-sm:left-1/2 max-sm:top-1/2 max-sm:-translate-x-1/2 max-sm:-translate-y-1/2">
            <ConnectTooltip />
          </div>
        </>
      )}
    </div>
  );
}

export default function Wireframe() {
  const { currentSrc, nextSrc, fading, fadeDuration } = useArenaSlideshow(bgImage);

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
      <p className="absolute font-['Favorit_Tumblr:Medium',sans-serif] leading-[normal] left-[38.5%] max-sm:left-[11%] max-sm:right-[11%] not-italic text-[#afacac] text-[22px] max-sm:text-[18px] top-[53.9%] max-sm:top-[53%] tracking-[-0.44px]">
        & Daydreamer<span className="inline-block w-[2px] h-[22px] max-sm:h-[18px] bg-[#afacac] ml-[2px] align-[-4px] animate-[blink_1s_steps(1)_infinite]" />
      </p>
      <Frame />
      </div>
    </div>
  );
}