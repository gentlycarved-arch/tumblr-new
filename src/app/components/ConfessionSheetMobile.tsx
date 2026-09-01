import { useState, useRef, useEffect } from "react";
import type { ConfessionStatus } from "../../hooks/useConfessions";
import { ConfessionComposeCard } from "./ConfessionComposeCard";

interface Props {
  darkMode: boolean;
  status: ConfessionStatus;
  error: string | null;
  confessions: string[];
  onSubmit: (text: string) => void;
}

const COLLAPSED_PX = 128; // visible height when collapsed: handle + trigger row (+ safe-area room)
const EXPANDED_VH = 86;   // sheet height when swiped open, almost takes over the screen

/**
 * Mobile: a bottom sheet that owns the confession area. Collapsed it shows just a
 * handle and the "leave a confession" trigger; dragging (or tapping) it up reveals
 * every confession in a tall, scrollable panel.
 */
export function ConfessionSheetMobile({ darkMode, status, error, confessions, onSubmit }: Props) {
  const [open, setOpen] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startY: number; startTop: number } | null>(null);

  // dvh (not vh) tracks the real visible area — vh in mobile Safari counts the space
  // behind its own toolbar, which pushes bottom-anchored content out of view.
  const topClosed = `calc(100dvh - ${COLLAPSED_PX}px)`;
  const topOpen = `${100 - EXPANDED_VH}dvh`;

  useEffect(() => {
    const el = sheetRef.current;
    if (!el) return;
    el.style.transition = "top 320ms cubic-bezier(0.32,0.72,0,1)";
    el.style.top = open ? topOpen : topClosed;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function viewportHeight() {
    // visualViewport reflects the actual visible area (excludes the browser's own
    // toolbar/keyboard); window.innerHeight can overreport it, same issue as vh vs dvh.
    return window.visualViewport?.height ?? window.innerHeight;
  }

  function bounds() {
    const vh = viewportHeight();
    const minTop = vh * (1 - EXPANDED_VH / 100); // fully open
    const maxTop = vh - COLLAPSED_PX;            // fully closed
    return { minTop, maxTop };
  }

  function onDragStart(e: React.PointerEvent) {
    const el = sheetRef.current;
    if (!el) return;
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    dragRef.current = { startY: e.clientY, startTop: el.getBoundingClientRect().top };
    el.style.transition = "none";
  }

  function onDragMove(e: React.PointerEvent) {
    const ds = dragRef.current;
    const el = sheetRef.current;
    if (!ds || !el) return;
    const { minTop, maxTop } = bounds();
    const newTop = Math.min(maxTop, Math.max(minTop, ds.startTop + (e.clientY - ds.startY)));
    el.style.top = `${newTop}px`;
  }

  function onDragEnd(e: React.PointerEvent) {
    const ds = dragRef.current;
    const el = sheetRef.current;
    if (!ds || !el) return;
    dragRef.current = null;
    el.style.transition = "top 320ms cubic-bezier(0.32,0.72,0,1)";
    const moved = e.clientY - ds.startY;
    if (Math.abs(moved) < 6) {
      setOpen((o) => !o); // treat as a tap
      return;
    }
    const { minTop, maxTop } = bounds();
    const rectTop = el.getBoundingClientRect().top;
    const progress = (maxTop - rectTop) / (maxTop - minTop); // 0 = closed, 1 = open
    setOpen(progress > 0.3);
  }

  const panelBg = darkMode ? "#1A1A1A" : "#FAFAFA";
  const muted = darkMode ? "#c0bcbc" : "#888484";
  const heading = darkMode ? "#E5E1E1" : "#4a4a4a";
  const font = "font-['Favorit_Tumblr:Medium',sans-serif]";
  const dragHandlers = { onPointerDown: onDragStart, onPointerMove: onDragMove, onPointerUp: onDragEnd, onPointerCancel: onDragEnd };

  function closeAll() {
    setComposeOpen(false);
    setOpen(false);
  }

  return (
    <div className="sm:hidden">
      {open && (
        <div
          className="fixed inset-0"
          style={{ background: "rgba(0,0,0,0.35)", zIndex: 49 }}
          onClick={closeAll}
        />
      )}

      <div
        ref={sheetRef}
        className="fixed left-0 right-0 flex flex-col overflow-hidden"
        style={{
          top: topClosed,
          height: `${EXPANDED_VH}dvh`,
          borderRadius: "20px 20px 0 0",
          background: panelBg,
          boxShadow: darkMode ? "0 -4px 24px rgba(0,0,0,0.45)" : "0 -4px 24px rgba(0,0,0,0.18)",
          zIndex: 50,
        }}
      >
        <div
          className="flex items-center justify-center pt-2.5 pb-1.5 shrink-0"
          style={{ touchAction: "none", cursor: "grab" }}
          {...dragHandlers}
        >
          <div style={{ width: 36, height: 4, borderRadius: 2, background: darkMode ? "#444" : "#d8d8d8" }} />
        </div>

        <div
          className="flex items-center justify-between px-5 shrink-0"
          style={{ touchAction: "none", paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
          {...dragHandlers}
        >
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setComposeOpen(true); setOpen(true); }}
            className={`${font} px-4 py-2 rounded-full text-[14px]`}
            style={{ background: darkMode ? "#2a2a2a" : "#e9eaed", color: heading }}
          >
            leave a confession
          </button>
          <div className={`${font} text-[12px]`} style={{ color: muted, opacity: 0.75 }}>
            {confessions.length ? `${confessions.length} · swipe up` : "swipe up"}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5" style={{ paddingBottom: "max(32px, env(safe-area-inset-bottom))" }}>
          {composeOpen ? (
            <ConfessionComposeCard
              darkMode={darkMode}
              status={status}
              error={error}
              onSubmit={onSubmit}
              onCancel={closeAll}
            />
          ) : confessions.length === 0 ? (
            <div className={`${font} text-[13px] pt-6 text-center`} style={{ color: muted, opacity: 0.6 }}>
              no confessions yet. be the first.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {confessions.map((c, i) => (
                <div key={i} className={`${font} text-[13px] leading-snug`} style={{ color: muted }}>
                  “{c}”
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
