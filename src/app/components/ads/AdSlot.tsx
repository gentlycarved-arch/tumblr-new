import { useState } from "react";
import { activeAd, type Ad } from "./adConfig";
import { AdPopups, RetroStyles } from "./RetroPopup";
import { AdvertiseModal } from "./AdvertiseModal";

const HOUSE_AD: Ad = {
  company: "tahreem.cv",
  headline: "YOUR AD HERE!!!",
  body: "Want your company on this website? Two levels of annoying, starting at $200.",
  cta: "YES!",
  noLabel: "no thanks",
  href: "#advertise",
  template: "classic",
  flash: 2,
  annoy: 1,
  startsOn: "",
};

const SEEN_KEY = "tahreem-ad-seen";

function seenThisSession(): boolean {
  try { return sessionStorage.getItem(SEEN_KEY) === "1"; } catch { return false; }
}
function markSeen() {
  try { sessionStorage.setItem(SEEN_KEY, "1"); } catch { /* private mode: just show it again next time */ }
}

/** Retro banner across the whole top edge that reopens the order form after the pop-up is gone. */
function AdBanner({ onClick }: { onClick: () => void }) {
  const text = "★ YOUR AD HERE ★ advertise on tahreem.cv ★ click me ★ YOUR AD HERE ★ two levels of annoying ★ starting at $200 ★";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Advertise on this website"
      className="absolute overflow-hidden flex items-center text-left top-0 inset-x-0 h-[22px] max-sm:h-[24px] leading-none hover:brightness-105"
      style={{
        zIndex: 35,
        background: "#ffeb00",
        border: "2px solid",
        borderColor: "#fff8a0 #806c00 #806c00 #fff8a0",
        fontFamily: "Tahoma, Verdana, sans-serif",
        animation: "fadeIn 400ms ease",
      }}
    >
      <RetroStyles />
      <span className="retro-marquee text-[11px] font-bold leading-none" style={{ color: "#0000cc", animationDuration: "14s" }}>
        {text}
      </span>
    </button>
  );
}

/**
 * The site's ad slot: today's paid ad if one is running, otherwise a "your ad here"
 * pop-up (once per session) with yes / no thanks, then a banner at the top that
 * reopens the order form.
 */
export function AdSlot({ darkMode }: { darkMode: boolean }) {
  const [show, setShow] = useState(() => !seenThisSession());
  const [ordering, setOrdering] = useState(false);
  const paid = activeAd();
  const ad = paid ?? HOUSE_AD;

  function onCta() {
    if (paid) window.open(paid.href, "_blank", "noopener");
    else setOrdering(true);
  }

  return (
    <>
      {show && <AdPopups ad={ad} onCta={onCta} onDone={() => { markSeen(); setShow(false); }} delayMs={paid ? undefined : 6000} />}
      {!paid && !show && !ordering && <AdBanner onClick={() => setOrdering(true)} />}
      {ordering && <AdvertiseModal darkMode={darkMode} onClose={() => setOrdering(false)} />}
    </>
  );
}
