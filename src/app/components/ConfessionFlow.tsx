import { useState } from "react";
import type { ConfessionStatus } from "../../hooks/useConfessions";
import { ConfessionFeed } from "./ConfessionFeed";
import { ConfessionComposeCard } from "./ConfessionComposeCard";
import { glossyButtonStyle } from "./glossyButton";

interface Props {
  darkMode: boolean;
  status: ConfessionStatus;
  error: string | null;
  confessions: string[];
  onSubmit: (text: string) => void;
}

/**
 * Desktop-only: "a free space" button (top-left) that opens the compose card, with the
 * confessions feed preview popping out underneath it when idle. Mobile uses the
 * swipe-up ConfessionSheetMobile instead (see Wireframe1).
 */
export function ConfessionFlow({ darkMode, status, error, confessions, onSubmit }: Props) {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);

  const panelBg = darkMode ? "#1A1A1A" : "#FAFAFA";
  const ring = darkMode
    ? "0 0 0 1.5px rgba(255,255,255,0.28), 0 10px 30px rgba(0,0,0,0.4)"
    : "0 0 0 1.5px rgba(0,0,0,0.1), 0 10px 30px rgba(0,0,0,0.18)";
  const font = "font-['Favorit_Tumblr:Medium',sans-serif]";

  return (
    <div
      className="hidden sm:flex absolute flex-col items-start top-6 left-6"
      style={{ zIndex: 40 }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`${font} px-4 py-2 rounded-full text-[15px] leading-none whitespace-nowrap active:scale-95`}
          style={glossyButtonStyle(hover)}
        >
          leave a confession
        </button>
      )}

      {!open && <ConfessionFeed confessions={confessions} darkMode={darkMode} />}

      {open && (
        <div
          className="rounded-[14px] p-4 w-[320px] max-w-[88vw]"
          style={{ background: panelBg, boxShadow: ring }}
        >
          <ConfessionComposeCard
            darkMode={darkMode}
            status={status}
            error={error}
            onSubmit={onSubmit}
            onCancel={() => setOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
