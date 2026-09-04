import { useState, useEffect, useRef } from "react";

interface Props {
  darkMode: boolean;
  onClose: () => void;
  onUnlock: () => void;
}

// Soft gate only — this string ships in the public bundle, so it's a speed bump for
// casual visitors, not real security. Fine for a "peek at my work" portfolio.
const PORTFOLIO_PASSWORD = "affogato";

const BLUE_LIGHT = "radial-gradient(ellipse at 50% 35%, #7eb4e0 0%, #6a9fd8 35%, #5688be 70%, #4a7aaa 100%)";
const BLUE_DARK = "radial-gradient(ellipse at 50% 35%, #3a5068 0%, #2c3f55 35%, #1f2e3e 70%, #151f2b 100%)";

/** Small password prompt, styled like the other popups, that unlocks the portfolio view. */
export function PortfolioGate({ darkMode, onClose, onUnlock }: Props) {
  const [value, setValue] = useState("");
  const [wrong, setWrong] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const panelBg = darkMode ? "#1A1A1A" : "#FAFAFA";
  const ring = darkMode
    ? "0 0 0 1.5px rgba(255,255,255,0.28), 0 10px 30px rgba(0,0,0,0.4)"
    : "0 0 0 1.5px rgba(0,0,0,0.1), 0 10px 30px rgba(0,0,0,0.18)";
  const muted = darkMode ? "#c0bcbc" : "#888484";
  const heading = darkMode ? "#E5E1E1" : "#4a4a4a";
  const font = "font-['Favorit_Tumblr:Medium',sans-serif]";
  const secondaryBtn: React.CSSProperties = {
    background: darkMode ? "#2a2a2a" : "#e9eaed",
    color: darkMode ? "#d8d4d4" : "#5a5757",
  };

  function submit() {
    if (value.trim().toLowerCase() === PORTFOLIO_PASSWORD.toLowerCase()) {
      onUnlock();
    } else {
      setWrong(true);
      setValue("");
      inputRef.current?.focus();
    }
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center px-6"
      style={{ background: "rgba(0,0,0,0.45)", zIndex: 90 }}
      onClick={onClose}
    >
      <div
        className={`${font} rounded-[14px] p-5 w-[320px] max-w-full flex flex-col gap-3`}
        style={{ background: panelBg, boxShadow: ring, color: muted }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-[16px]" style={{ color: heading }}>portfolio access</div>
        <div className="text-[12px] leading-snug -mt-1 opacity-80">
          my work is mostly NDA so it's private, ask for my password to take a peak. you can also{" "}
          <a
            href="mailto:gentlycarved@gmail.com?subject=can%20i%20see%20your%20portfolio%3F&body=hey%2C%20can%20i%20see%20your%20portfolio%3F"
            className="underline"
            onClick={(e) => e.stopPropagation()}
          >
            email me
          </a>{" "}
          for it.
        </div>

        <input
          ref={inputRef}
          type="password"
          value={value}
          onChange={(e) => { setValue(e.target.value); setWrong(false); }}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
          placeholder="password"
          className="w-full rounded-[10px] px-3 py-2.5 text-[14px] outline-none"
          style={{
            background: darkMode ? "#2a2a2a" : "#fff",
            color: darkMode ? "#E0E0E0" : "#212529",
            border: `1px solid ${wrong ? "#d05a5a" : darkMode ? "#3a3a3a" : "#d0d1d4"}`,
          }}
        />
        {wrong && (
          <div className="text-[12px] -mt-2" style={{ color: "#d05a5a" }}>
            that's not it, try again.
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-[10px] py-2.5 text-[14px]"
            style={secondaryBtn}
          >
            cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!value.trim()}
            className="flex-1 rounded-[10px] py-2.5 text-[14px] text-white"
            style={{ background: darkMode ? BLUE_DARK : BLUE_LIGHT, opacity: value.trim() ? 1 : 0.55, cursor: value.trim() ? "pointer" : "default" }}
          >
            enter
          </button>
        </div>
      </div>
    </div>
  );
}
