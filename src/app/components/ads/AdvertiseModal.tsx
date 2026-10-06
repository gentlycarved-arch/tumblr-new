import { useState } from "react";
import {
  AD_CONTACT_EMAIL, AD_PAYMENT_LINKS, AD_TEMPLATES, AD_TIERS, ANNOY_LEVELS, FLASH_LEVELS, tierFor,
  type Ad, type AdTemplate, type AdTier,
} from "./adConfig";
import { AdBody, AdPopups, MessageAlert, RetroStyles, RetroWindow, useShake } from "./RetroPopup";

const FONT = "font-['Favorit_Tumblr:Medium',sans-serif]";
const BLUE_LIGHT = "radial-gradient(ellipse at 50% 35%, #7eb4e0 0%, #6a9fd8 35%, #5688be 70%, #4a7aaa 100%)";
const BLUE_DARK = "radial-gradient(ellipse at 50% 35%, #3a5068 0%, #2c3f55 35%, #1f2e3e 70%, #151f2b 100%)";

/** A 1–5 scale with a line under it saying what the current level does. */
function Scale({ label, value, onChange, levels, darkMode }: {
  label: string; value: number; onChange: (v: number) => void; levels: string[]; darkMode: boolean;
}) {
  const muted = darkMode ? "#a8a4a4" : "#888484";
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between text-[13px]">
        <span>{label}</span>
        <span style={{ color: muted }}>{value} / 5</span>
      </div>
      <div className="flex gap-1.5" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${label} ${n}`}
            onClick={() => onChange(n)}
            className="flex-1 h-[26px] rounded-[7px] text-[12px] transition-colors"
            style={{
              background: n <= value ? (darkMode ? BLUE_DARK : BLUE_LIGHT) : darkMode ? "#2a2a2a" : "#e9eaed",
              color: n <= value ? "#fff" : muted,
              boxShadow: n <= value ? "inset 0 1px 0 rgba(255,255,255,0.4), 0 1px 2px rgba(0,0,0,0.2)" : "none",
            }}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="text-[12px] leading-snug" style={{ color: muted }}>{levels[value - 1]}</div>
    </div>
  );
}

/** The ad drawn in place, flashing/shaking/alerting at the chosen levels. */
function LivePreview({ ad }: { ad: Ad }) {
  const shakeKey = useShake(ad.annoy >= 4);
  return (
    <div className="flex flex-col items-center p-6 max-sm:p-4 min-h-[300px] justify-center">
      <div key={shakeKey} className={shakeKey ? "retro-shake" : ""}>
        <RetroWindow title={`${ad.company} — Special Offer!!`} onClose={() => {}} width={300} flashing={ad.flash >= 5}>
          <AdBody ad={ad} onCta={() => {}} />
        </RetroWindow>
      </div>
      {/* Tucked under the main window's corner, like it just popped up on top */}
      {ad.annoy >= 3 && (
        <div className="self-end -mt-3 mr-1 scale-[0.85] origin-top-right">
          <MessageAlert onClose={() => {}} onCta={() => {}} />
        </div>
      )}
    </div>
  );
}

/** Order form for a pop-up ad, styled like the landing page; the ad itself stays retro. */
export function AdvertiseModal({ darkMode, onClose }: { darkMode: boolean; onClose: () => void }) {
  const [template, setTemplate] = useState<AdTemplate>("classic");
  const [flash, setFlash] = useState(AD_TIERS.annoying.preset.flash);
  const [annoy, setAnnoy] = useState(AD_TIERS.annoying.preset.annoy);
  const [form, setForm] = useState({ company: "", headline: "", body: "", href: "", image: "", email: "" });
  const [previewing, setPreviewing] = useState(false);
  const [sent, setSent] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const tier = tierFor(flash, annoy);
  const t = AD_TIERS[tier];
  const ad: Ad = {
    company: form.company || "Your Company",
    headline: form.headline || "Your headline here!!",
    body: form.body || "One line about what you're selling.",
    cta: template === "system" ? "OK" : "CLICK HERE!",
    href: form.href || "#",
    image: form.image || undefined,
    template,
    flash,
    annoy,
    startsOn: "",
  };
  const ready = form.company.trim() && form.headline.trim() && form.href.trim() && form.email.trim();

  const panelBg = darkMode ? "#1A1A1A" : "#FAFAFA";
  const ring = darkMode
    ? "0 0 0 1.5px rgba(255,255,255,0.28), 0 10px 30px rgba(0,0,0,0.4)"
    : "0 0 0 1.5px rgba(0,0,0,0.1), 0 10px 30px rgba(0,0,0,0.18)";
  const heading = darkMode ? "#E5E1E1" : "#4a4a4a";
  const muted = darkMode ? "#a8a4a4" : "#888484";
  const softBg = darkMode ? "#2a2a2a" : "#e9eaed";
  const field = "w-full rounded-[10px] px-3 py-2 text-[14px] outline-none";
  const fieldStyle: React.CSSProperties = {
    background: darkMode ? "#2a2a2a" : "#fff",
    color: darkMode ? "#E0E0E0" : "#212529",
    border: `1px solid ${darkMode ? "#3a3a3a" : "#d0d1d4"}`,
  };

  function pickTier(id: AdTier) {
    setFlash(AD_TIERS[id].preset.flash);
    setAnnoy(AD_TIERS[id].preset.annoy);
  }

  function sendAndPay() {
    const subject = `ad order: ${t.name} ($${t.price}) for ${form.company}`;
    const body = [
      `tier: ${t.name} ($${t.price}, ${t.days} days)`,
      `template: ${AD_TEMPLATES[template].name}`,
      `flashiness: ${flash}/5, annoyance: ${annoy}/5`,
      `company: ${form.company}`,
      `headline: ${form.headline}`,
      `pitch: ${form.body}`,
      `link: ${form.href}`,
      `image: ${form.image || "(none)"}`,
      `contact email: ${form.email}`,
    ].join("\n");
    // Stripe in a new tab first (still inside the click, so it isn't blocked), then the order email
    window.open(`${AD_PAYMENT_LINKS[tier]}?prefilled_email=${encodeURIComponent(form.email)}`, "_blank", "noopener");
    window.location.href = `mailto:${AD_CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  const label = (text: string) => <span className="text-[12px]" style={{ color: muted }}>{text}</span>;

  return (
    <>
      <RetroStyles />
      <div
        className="fixed inset-0 flex items-start justify-center px-4 py-10 max-sm:py-4 overflow-y-auto"
        style={{ background: "rgba(0,0,0,0.45)", zIndex: 110 }}
        onClick={onClose}
      >
        <div
          className={`${FONT} relative rounded-[14px] w-[880px] max-w-full grid grid-cols-[1fr_1.05fr] max-md:grid-cols-1 overflow-hidden`}
          style={{ background: panelBg, boxShadow: ring, color: heading, animation: "fadeIn 200ms ease" }}
          onClick={(e) => e.stopPropagation()}
        >
          <button type="button" onClick={onClose} aria-label="Close" className="absolute top-3 right-3 z-10 size-[26px] rounded-full text-[15px] leading-none"
            style={{ background: softBg, color: muted }}>×</button>

          <div className="p-5 flex flex-col gap-4 max-md:order-2">
            <div className="flex flex-col gap-1 pr-8">
              <div className="text-[18px]">advertise on my website</div>
              <div className="text-[13px] leading-snug" style={{ color: muted }}>
                pick a template, choose how flashy and how annoying it gets, then pay. I approve every ad before it goes up, and if I don't approve yours, you get a 100% full refund.
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="tier">
              {(Object.keys(AD_TIERS) as AdTier[]).map((id) => {
                const def = AD_TIERS[id];
                const on = tier === id;
                const hot = id === "very-annoying";
                // annoying-ish stays calm and blue; extremely annoying is a shimmering hot gradient
                const style: React.CSSProperties = hot
                  ? {
                      color: "#fff",
                      textShadow: "0 1px 2px rgba(120,0,40,0.45)",
                      boxShadow: on
                        ? "0 0 0 2px #fff, 0 0 0 4px #ff2d95, 0 6px 22px rgba(255,45,149,0.45)"
                        : "0 0 0 1px rgba(255,45,149,0.4)",
                      filter: on ? "none" : "saturate(0.8)",
                    }
                  : {
                      background: on
                        ? darkMode ? "linear-gradient(180deg, #26364a, #1f2c3d)" : "linear-gradient(180deg, #f3f8fe, #e2edf9)"
                        : darkMode ? "#1f2630" : "#f6f9fd",
                      boxShadow: on ? `0 0 0 2px ${darkMode ? "#5b84b3" : "#6a9fd8"}` : `0 0 0 1px ${darkMode ? "#2f3b4a" : "#dbe5f1"}`,
                    };
                const priceColor = hot ? "#fff" : darkMode ? "#9ec3ee" : "#3a6ea5";
                const sub = hot ? "rgba(255,255,255,0.9)" : muted;
                return (
                  <button key={id} type="button" role="radio" aria-checked={on} onClick={() => pickTier(id)}
                    className={`relative text-left rounded-[12px] p-3 flex flex-col gap-0.5 transition-[box-shadow,filter] duration-200 ${hot ? "retro-hot" : ""}`}
                    style={style}>
                    {hot && (
                      <span className="absolute -top-2 -right-1.5 rotate-[8deg] rounded-full px-2 py-[3px] text-[10px] leading-none font-bold"
                        style={{ background: "#ffeb00", color: "#d40000", boxShadow: "0 1px 3px rgba(0,0,0,0.25)", textShadow: "none" }}>
                        ★ HOT ★
                      </span>
                    )}
                    <span className="text-[13px]">{def.name}{hot ? "!!" : ""}</span>
                    <span className="text-[20px]" style={{ color: priceColor }}>${def.price}</span>
                    <span className="text-[12px]" style={{ color: sub }}>up to level {def.maxLevel} · stays up {def.days} days</span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-1.5">
              {label("template")}
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(AD_TEMPLATES) as AdTemplate[]).map((id) => (
                  <button key={id} type="button" onClick={() => setTemplate(id)} aria-pressed={template === id}
                    className="rounded-full px-3 py-1.5 text-[13px] leading-none transition-colors"
                    style={template === id
                      ? { background: darkMode ? BLUE_DARK : BLUE_LIGHT, color: "#fff", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4)" }
                      : { background: softBg, color: heading }}>
                    {AD_TEMPLATES[id].name}
                  </button>
                ))}
              </div>
            </div>

            <Scale label="flashiness" value={flash} onChange={setFlash} levels={FLASH_LEVELS} darkMode={darkMode} />
            <Scale label="annoyance" value={annoy} onChange={setAnnoy} levels={ANNOY_LEVELS} darkMode={darkMode} />

            <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-2">
              <label className="flex flex-col gap-1">{label("company name")}<input className={field} style={fieldStyle} value={form.company} onChange={set("company")} maxLength={40} /></label>
              <label className="flex flex-col gap-1">{label("your email")}<input className={field} style={fieldStyle} type="email" value={form.email} onChange={set("email")} /></label>
              <label className="flex flex-col gap-1">{label("headline")}<input className={field} style={fieldStyle} value={form.headline} onChange={set("headline")} maxLength={40} placeholder="FREE STUFF INSIDE!!" /></label>
              <label className="flex flex-col gap-1">{label("link people go to")}<input className={field} style={fieldStyle} type="url" value={form.href} onChange={set("href")} placeholder="https://" /></label>
              <label className="flex flex-col gap-1 col-span-2 max-sm:col-span-1">{label("one line pitch")}<input className={field} style={fieldStyle} value={form.body} onChange={set("body")} maxLength={90} /></label>
              <label className="flex flex-col gap-1 col-span-2 max-sm:col-span-1">{label("image link (optional)")}<input className={field} style={fieldStyle} type="url" value={form.image} onChange={set("image")} placeholder="https://…png" /></label>
            </div>

            {sent && (
              <div className="text-[13px] leading-snug rounded-[10px] px-3 py-2" style={{ background: softBg }}>
                thanks! payment opened in a new tab and your order email is ready to send. your ad goes up once I've approved it. if I don't, you get a 100% full refund.
              </div>
            )}

            <div className="flex gap-2">
              <button type="button" onClick={() => setPreviewing(true)} className="flex-1 rounded-[10px] py-2.5 text-[14px]" style={{ background: softBg, color: heading }}>
                try it for real
              </button>
              <button type="button" onClick={sendAndPay} disabled={!ready}
                className="btn-glow flex-1 rounded-[10px] py-2.5 text-[14px] text-white"
                style={{ background: darkMode ? BLUE_DARK : BLUE_LIGHT, opacity: ready ? 1 : 0.55, cursor: ready ? "pointer" : "default", textShadow: "0 1px 1px rgba(0,0,0,0.25)" }}>
                send + pay ${t.price}
              </button>
            </div>
          </div>

          <div className="flex flex-col max-md:order-1" style={{ background: darkMode ? "#141414" : "#eeeeef" }}>
            <div className="pl-5 pr-14 pt-4 text-[12px]" style={{ color: muted }}>
              live preview
            </div>
            <div className="flex-1 flex items-center justify-center">
              <LivePreview ad={ad} />
            </div>
          </div>
        </div>
      </div>
      {previewing && <AdPopups ad={ad} delayMs={150} onCta={() => {}} onDone={() => setPreviewing(false)} />}
    </>
  );
}
