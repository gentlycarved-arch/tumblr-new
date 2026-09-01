import { useState, useEffect } from "react";
import type { ConfessionStatus } from "../../hooks/useConfessions";
import { MAX_CONFESSION_LEN } from "../../lib/uploads";

interface Props {
  darkMode: boolean;
  status: ConfessionStatus;
  error: string | null;
  onSubmit: (text: string) => void;
  onCancel: () => void;
}

const BLUE_LIGHT = "radial-gradient(ellipse at 50% 35%, #7eb4e0 0%, #6a9fd8 35%, #5688be 70%, #4a7aaa 100%)";
const BLUE_DARK = "radial-gradient(ellipse at 50% 35%, #3a5068 0%, #2c3f55 35%, #1f2e3e 70%, #151f2b 100%)";

/** The "a free space" compose card: shared by the desktop popup and the mobile sheet. */
export function ConfessionComposeCard({ darkMode, status, error, onSubmit, onCancel }: Props) {
  const [text, setText] = useState("");
  const [justSent, setJustSent] = useState(false);

  const busy = status === "sending";

  useEffect(() => {
    if (status !== "success") return;
    setJustSent(true);
    setText("");
    const t = setTimeout(() => { setJustSent(false); onCancel(); }, 1600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const panelBg = darkMode ? "#1A1A1A" : "#FAFAFA";
  const muted = darkMode ? "#c0bcbc" : "#888484";
  const heading = darkMode ? "#E5E1E1" : "#4a4a4a";
  const font = "font-['Favorit_Tumblr:Medium',sans-serif]";
  const secondaryBtn: React.CSSProperties = {
    background: darkMode ? "#2a2a2a" : "#e9eaed",
    color: darkMode ? "#d8d4d4" : "#5a5757",
  };

  function submit() {
    const v = text.trim();
    if (!v || busy) return;
    onSubmit(v);
  }

  if (justSent) {
    return (
      <div className={`${font} py-6 text-center text-[15px]`} style={{ background: panelBg, color: heading, borderRadius: 14 }}>
        posted, anonymously. thank you. ✨
      </div>
    );
  }

  return (
    <div className={`${font} flex flex-col gap-3`} style={{ color: muted }}>
      <div className="text-[15px]" style={{ color: heading }}>a free space</div>
      <div className="text-[12px] leading-snug -mt-1 opacity-80">
        anonymous. your unfiltered thoughts on the future, tech, your career, AI, life,
        anything. nothing personal, hateful, or inappropriate, please; it'll be flagged.
      </div>

      <div className="flex flex-col gap-1">
        <textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_CONFESSION_LEN))}
          onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit(); }}
          placeholder="say it here…"
          rows={4}
          disabled={busy}
          className="w-full rounded-[10px] px-3 py-2.5 text-[13px] outline-none resize-none"
          style={{
            background: darkMode ? "#2a2a2a" : "#fff",
            color: darkMode ? "#E0E0E0" : "#212529",
            border: `1px solid ${darkMode ? "#3a3a3a" : "#d0d1d4"}`,
          }}
        />
        <div className="text-[11px] opacity-45 text-right pr-0.5">{text.length}/{MAX_CONFESSION_LEN}</div>
      </div>

      {status === "error" && error && (
        <div className="text-[12px] px-0.5" style={{ color: "#d05a5a" }}>{error}</div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="flex-1 rounded-[10px] py-2.5 text-[14px]"
          style={secondaryBtn}
        >
          cancel
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={busy || !text.trim()}
          className="flex-1 rounded-[10px] py-2.5 text-[14px] text-white flex items-center justify-center gap-2"
          style={{
            background: text.trim() && !busy ? (darkMode ? BLUE_DARK : BLUE_LIGHT) : (darkMode ? "#3a3a3a" : "#c7ccd2"),
            cursor: text.trim() && !busy ? "pointer" : "default",
          }}
        >
          {busy ? (
            <svg className="animate-spin" width="15" height="15" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
              <path d="M14 8a6 6 0 0 0-6-6" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : "post"}
        </button>
      </div>
    </div>
  );
}
