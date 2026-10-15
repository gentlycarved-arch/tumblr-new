import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import type { ConfessionKind, ConfessionStatus, HiringConfession, HiringDetails } from "../../hooks/useConfessions";
import { ConfessionComposeCard } from "./ConfessionComposeCard";
import { glossyButtonStyle } from "./glossyButton";

const LEVELS = ["student", "intern", "junior", "mid", "senior", "staff", "lead"];
const GLOSSY_BLUE = "radial-gradient(70% 70% at 50% 30%, #3f6191, #1b3155)";
const STAGES = [
  "application", "recruiter screen", "hiring manager chat", "portfolio review", "take-home",
  "design exercise / whiteboard", "app critique", "panel", "final round", "offer", "after a rejection", "ghosted",
];
// Suggestions only; anyone can type any company.
const COMMON_COMPANIES = [
  "Google", "Meta", "Apple", "Amazon", "Microsoft", "Netflix", "Airbnb", "Uber", "Spotify", "Figma", "Stripe",
  "Shopify", "Adobe", "Atlassian", "Notion", "Canva", "Wealthsimple", "RBC", "TD", "Scotiabank",
];

const HIRING_INTRO = "anonymous stories of bad hiring practices in design interviews. no people's names.";
const FREE_SPACE_BLURB = "anonymous, unfiltered thoughts on anything.";

type Tab = "general" | "hiring";
const EASE = "cubic-bezier(0.22, 0.8, 0.24, 1)";

interface Props {
  darkMode: boolean;
  origin: DOMRect | null; // the button it grows out of
  initialTab: Tab;
  startComposing: boolean;
  confessions: string[];
  hiring: HiringConfession[];
  status: ConfessionStatus;
  error: string | null;
  onSubmit: (text: string, kind: ConfessionKind, details?: HiringDetails) => void;
  onClose: () => void;
}

/**
 * Confessions as their own full-screen page over the landing page: it grows out of the
 * button that opened it. Two sections: "a free space" and bad hiring practices in design
 * interviews, each with its own way to add one.
 */
export function ConfessionsPage({ darkMode, origin, initialTab, startComposing, confessions, hiring, status, error, onSubmit, onClose }: Props) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [composing, setComposing] = useState(startComposing);
  const [shown, setShown] = useState(false);
  const [companyFilter, setCompanyFilter] = useState<string | null>(null);

  const reduceMotion = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const dur = reduceMotion ? 0 : 480;
  // Clipped down to the opening button, then released to the full screen
  const from = origin
    ? `inset(${origin.top}px ${window.innerWidth - origin.right}px ${window.innerHeight - origin.bottom}px ${origin.left}px round 20px)`
    : "inset(40% 40% 40% 40% round 20px)";

  useLayoutEffect(() => { requestAnimationFrame(() => setShown(true)); }, []);

  function close() {
    setShown(false);
    setTimeout(onClose, dur);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const font = "font-['Favorit_Tumblr:Medium',sans-serif]";
  const pageBg = darkMode ? "#141414" : "#F4F4F5";
  const cardBg = darkMode ? "#1F1F1F" : "#FFFFFF";
  const ring = darkMode ? "0 0 0 1px rgba(255,255,255,0.1)" : "0 0 0 1px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)";
  const heading = darkMode ? "#E5E1E1" : "#2a2a2a";
  const body = darkMode ? "#cfcbcb" : "#3a3a3a";
  const muted = darkMode ? "#a8a4a4" : "#888484";
  const softBg = darkMode ? "#2a2a2a" : "#e9eaed";

  const companies = useMemo(
    () => [...new Set(hiring.map((h) => h.details?.company).filter((c): c is string => !!c))].sort((a, b) => a.localeCompare(b)),
    [hiring],
  );
  const shownHiring = companyFilter ? hiring.filter((h) => h.details?.company === companyFilter) : hiring;

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "general", label: "a free space", count: confessions.length },
    { id: "hiring", label: "bad hiring practices", count: hiring.length },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="confessions"
      className={`${font} fixed inset-0 overflow-y-auto`}
      style={{
        zIndex: 90,
        background: pageBg,
        color: body,
        clipPath: shown ? "inset(0px 0px 0px 0px round 0px)" : from,
        transition: `clip-path ${dur}ms ${EASE}`,
      }}
    >
      <div
        className="max-w-[1080px] mx-auto px-8 max-sm:px-4 pt-8 max-sm:pt-5 pb-24"
        style={{ opacity: shown ? 1 : 0, transition: `opacity ${dur * 0.7}ms ${EASE} ${shown ? dur * 0.3 : 0}ms` }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-4">
            <h2 className="text-[30px] max-sm:text-[24px] leading-none" style={{ color: heading }}>confessions</h2>
            <div role="tablist" aria-label="sections" className="inline-flex self-start rounded-full p-1" style={{ background: softBg }}>
              {tabs.map((t) => (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={tab === t.id}
                  onClick={() => { setTab(t.id); setComposing(false); }}
                  className="rounded-full px-4 max-sm:px-3 py-[7px] text-[13px] leading-none transition-[background-color,color,box-shadow] duration-200"
                  style={tab === t.id
                    ? { background: cardBg, color: heading, boxShadow: "0 1px 3px rgba(0,0,0,0.12)" }
                    : { color: muted }}
                >
                  {t.label} <span style={{ opacity: 0.55 }}>{t.count}</span>
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close confessions"
            className="shrink-0 size-[38px] rounded-full flex items-center justify-center text-[18px] leading-none"
            style={{ background: softBg, color: muted }}
          >
            ×
          </button>
        </div>

        <div className="mt-6 flex items-end justify-between gap-6 max-sm:flex-col max-sm:items-start">
          <p className="text-[14px] leading-relaxed max-w-[560px]" style={{ color: muted }}>
            {tab === "general" ? FREE_SPACE_BLURB : HIRING_INTRO}
          </p>
          {!composing && (
            <button
              type="button"
              onClick={() => setComposing(true)}
              className="shrink-0 px-4 py-2 rounded-full text-[14px] leading-none whitespace-nowrap active:scale-95"
              style={glossyButtonStyle(false)}
            >
              {tab === "general" ? "+ leave a confession" : "+ share"}
            </button>
          )}
        </div>

        {composing && (
          <div className="mt-5 rounded-[16px] p-5 max-sm:p-4 w-[460px] max-w-full" style={{ background: cardBg, boxShadow: ring }}>
            {tab === "general" ? (
              <ConfessionComposeCard
                darkMode={darkMode}
                status={status}
                error={error}
                onSubmit={(text) => onSubmit(text, "general")}
                onCancel={() => setComposing(false)}
                intro="anonymous. nothing hateful or personal; it'll be flagged."
              />
            ) : (
              <HiringCompose
                darkMode={darkMode}
                status={status}
                error={error}
                companies={companies}
                onSubmit={(text, details) => onSubmit(text, "hiring", details)}
                onCancel={() => setComposing(false)}
              />
            )}
          </div>
        )}

        {tab === "hiring" && companies.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-1.5">
            {[null, ...companies].map((c) => (
              <button
                key={c ?? "all"}
                type="button"
                onClick={() => setCompanyFilter(c)}
                className="rounded-full px-3 py-1.5 text-[12px] leading-none"
                style={companyFilter === c ? { background: heading, color: pageBg } : { background: softBg, color: muted }}
              >
                {c ?? "all companies"}
              </button>
            ))}
          </div>
        )}

        <div className="mt-6 columns-3 max-lg:columns-2 max-sm:columns-1 gap-3">
          {tab === "general"
            ? confessions.map((c, i) => (
                <figure key={i} className="break-inside-avoid mb-3 rounded-[14px] p-4" style={{ background: cardBg, boxShadow: ring }}>
                  <blockquote className="text-[15px] leading-relaxed" style={{ color: body }}>“{c}”</blockquote>
                  <figcaption className="mt-2 text-[11px]" style={{ color: muted }}>anon</figcaption>
                </figure>
              ))
            : shownHiring.map((h, i) => (
                <figure key={i} className="break-inside-avoid mb-3 rounded-[14px] p-4" style={{ background: cardBg, boxShadow: ring }}>
                  <HiringTags details={h.details} darkMode={darkMode} />
                  <blockquote className="text-[15px] leading-relaxed" style={{ color: body }}>“{h.text}”</blockquote>
                  <figcaption className="mt-2 text-[11px]" style={{ color: muted }}>anon</figcaption>
                </figure>
              ))}
        </div>

        {tab === "hiring" && hiring.length === 0 && !composing && (
          <p className="text-[14px]" style={{ color: muted }}>nothing here yet. be the first.</p>
        )}
      </div>
    </div>
  );
}

function HiringTags({ details, darkMode }: { details?: HiringDetails; darkMode: boolean }) {
  const tags = [details?.company, details?.stage, details?.level].filter(Boolean);
  if (!tags.length) return null;
  return (
    <div className="flex flex-wrap gap-1 mb-2.5">
      {tags.map((t, i) => (
        <span key={i} className="rounded-full px-2 py-[3px] text-[11px] leading-none"
          style={i === 0 && details?.company
            ? { background: darkMode ? "#2c3f55" : "#e3edf9", color: darkMode ? "#cfe0f5" : "#2f5b8f" }
            : { background: darkMode ? "#2a2a2a" : "#f0f0f2", color: darkMode ? "#bdb9b9" : "#6a6767" }}>
          {t}
        </span>
      ))}
    </div>
  );
}

/** Level first, then stage, then company (it becomes a tag once added), then what happened. */
function HiringCompose({ darkMode, status, error, companies, onSubmit, onCancel }: {
  darkMode: boolean; status: ConfessionStatus; error: string | null; companies: string[];
  onSubmit: (text: string, details: HiringDetails) => void; onCancel: () => void;
}) {
  const [level, setLevel] = useState("");
  const [stage, setStage] = useState("");
  const [company, setCompany] = useState("");
  const [draft, setDraft] = useState("");

  const muted = darkMode ? "#a8a4a4" : "#888484";
  const heading = darkMode ? "#E5E1E1" : "#4a4a4a";
  const softBg = darkMode ? "#2a2a2a" : "#e9eaed";
  const field: React.CSSProperties = {
    background: darkMode ? "#2a2a2a" : "#fff",
    color: darkMode ? "#E0E0E0" : "#212529",
    border: `1px solid ${darkMode ? "#3a3a3a" : "#d0d1d4"}`,
  };
  const label = (t: string) => <div className="text-[12px] mb-1.5" style={{ color: heading }}>{t}</div>;
  const suggestions = [...new Set([...companies, ...COMMON_COMPANIES])];

  function addCompany() {
    const c = draft.trim().replace(/\s+/g, " ").slice(0, 40);
    if (c) setCompany(c);
    setDraft("");
  }

  return (
    <ConfessionComposeCard
      darkMode={darkMode}
      status={status}
      error={error}
      onSubmit={(text) => onSubmit(text, { level, stage, company })}
      onCancel={onCancel}
      title="share a bad hiring practice"
      intro="all optional. nothing about you is stored."
      placeholder="what happened?"
    >
      <LevelSlider darkMode={darkMode} value={level} onChange={setLevel} />

      <label className="block">
        {label("interview stage")}
        <select value={stage} onChange={(e) => setStage(e.target.value)} className="w-full rounded-[10px] px-3 py-2 text-[13px] outline-none" style={field}>
          <option value="">choose a stage</option>
          {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </label>

      <div>
        {label("company")}
        {company ? (
          <span className="inline-flex items-center gap-1.5 rounded-full pl-3 pr-1.5 py-1 text-[13px] leading-none"
            style={{ background: darkMode ? "#2c3f55" : "#e3edf9", color: darkMode ? "#cfe0f5" : "#2f5b8f" }}>
            ✓ {company}
            <button type="button" onClick={() => setCompany("")} aria-label={`remove ${company}`}
              className="size-[18px] rounded-full flex items-center justify-center text-[13px] leading-none"
              style={{ background: "rgba(0,0,0,0.08)" }}>×</button>
          </span>
        ) : (
          <div className="flex gap-1.5">
            <input
              list="confession-companies"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addCompany(); } }}
              onBlur={addCompany}
              placeholder="type a company, press enter"
              maxLength={40}
              className="flex-1 min-w-0 rounded-[10px] px-3 py-2 text-[13px] outline-none"
              style={field}
            />
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={addCompany} disabled={!draft.trim()}
              className="rounded-[10px] px-3 text-[13px]" style={{ background: softBg, color: draft.trim() ? heading : muted }}>
              add
            </button>
            <datalist id="confession-companies">
              {suggestions.map((c) => <option key={c} value={c} />)}
            </datalist>
          </div>
        )}
      </div>
    </ConfessionComposeCard>
  );
}

/**
 * "your level" as a stepped slider: drag (or use arrow keys) between the main stops.
 * Untouched it's unset (and left out of the post).
 */
function LevelSlider({ darkMode, value, onChange }: { darkMode: boolean; value: string; onChange: (v: string) => void }) {
  const i = LEVELS.indexOf(value);
  const set = i >= 0;
  const pct = set ? (i / (LEVELS.length - 1)) * 100 : 0;
  const heading = darkMode ? "#E5E1E1" : "#4a4a4a";
  const muted = darkMode ? "#8a8686" : "#a8a4a4";
  const track = darkMode ? "#2a2a2a" : "#e9eaed";

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-[12px]" style={{ color: heading }}>your level</span>
        {!set && <span className="text-[11px]" style={{ color: muted }}>slide to choose</span>}
      </div>
      {/* the track sits 9px in on each side so the thumb's centre lands exactly on the first and last stops */}
      <div className="relative h-[22px] mx-[9px]">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[6px] rounded-full" style={{ background: track, boxShadow: "inset 0 1px 2px rgba(0,0,0,0.12)" }} />
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[6px] rounded-full transition-[width] duration-150"
          style={{ width: `${pct}%`, background: GLOSSY_BLUE }} />
        {LEVELS.map((l, k) => (
          <span key={l} aria-hidden className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 size-[8px] rounded-full"
            style={{ left: `${(k / (LEVELS.length - 1)) * 100}%`, background: set && k <= i ? "#ffffff" : darkMode ? "#4a4a4a" : "#cfd1d6", boxShadow: "0 0 0 1px rgba(0,0,0,0.08)" }} />
        ))}
        <span aria-hidden className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 size-[18px] rounded-full transition-[left] duration-150 pointer-events-none"
          style={{
            left: `${pct}%`,
            background: set ? GLOSSY_BLUE : darkMode ? "#3a3a3a" : "#ffffff",
            boxShadow: set ? "0 0 0 1px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.35)" : "0 0 0 1px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.2)",
          }} />
        <input
          type="range"
          min={0}
          max={LEVELS.length - 1}
          step={1}
          value={set ? i : 0}
          onChange={(e) => onChange(LEVELS[Number(e.target.value)])}
          onPointerDown={(e) => { if (!set) onChange(LEVELS[Math.round(Number((e.target as HTMLInputElement).value))]); }}
          aria-label="your level"
          aria-valuetext={set ? value : "not chosen"}
          className="absolute -inset-x-[9px] inset-y-0 w-[calc(100%+18px)] opacity-0 cursor-pointer"
        />
      </div>
      <div className="relative h-[14px] mt-1.5 mx-[9px]">
        {LEVELS.map((l, k) => (
          <button key={l} type="button" onClick={() => onChange(l)} tabIndex={-1}
            className="absolute -translate-x-1/2 text-[10.5px] leading-none whitespace-nowrap"
            style={{ left: `${(k / (LEVELS.length - 1)) * 100}%`, color: k === i ? heading : muted, fontWeight: k === i ? 600 : 400 }}>
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}
