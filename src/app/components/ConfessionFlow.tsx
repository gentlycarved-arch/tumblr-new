import { useRef, useState } from "react";
import type { ConfessionKind, ConfessionStatus, HiringConfession, HiringDetails } from "../../hooks/useConfessions";
import { ConfessionFeed } from "./ConfessionFeed";
import { ConfessionsPage } from "./ConfessionsPage";
import { glossyButtonStyle } from "./glossyButton";

interface Props {
  darkMode: boolean;
  status: ConfessionStatus;
  error: string | null;
  confessions: string[];
  hiring: HiringConfession[];
  onSubmit: (text: string, kind?: ConfessionKind, details?: HiringDetails) => void;
}

/**
 * Desktop-only: the "leave a confession" button (top-left) with a rotating preview under
 * it. Either one opens the confessions as a full-screen page that grows out of the button.
 * Mobile uses the swipe-up ConfessionSheetMobile instead (see Wireframe1).
 */
export function ConfessionFlow({ darkMode, status, error, confessions, hiring, onSubmit }: Props) {
  const [page, setPage] = useState<{ origin: DOMRect | null; composing: boolean } | null>(null);
  const [hover, setHover] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const font = "font-['Favorit_Tumblr:Medium',sans-serif]";

  const open = (composing: boolean) => setPage({ origin: buttonRef.current?.getBoundingClientRect() ?? null, composing });

  return (
    <>
      <div
        className="hidden sm:flex absolute flex-col items-start top-6 left-6"
        style={{ zIndex: 40 }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <button
          ref={buttonRef}
          type="button"
          onClick={() => open(true)}
          className={`${font} px-4 py-2 rounded-full text-[15px] leading-none whitespace-nowrap active:scale-95`}
          style={glossyButtonStyle(hover)}
        >
          leave a confession
        </button>
        <ConfessionFeed confessions={confessions} darkMode={darkMode} onOpen={() => open(false)} />
      </div>

      {page && (
        <ConfessionsPage
          darkMode={darkMode}
          origin={page.origin}
          initialTab="general"
          startComposing={page.composing}
          confessions={confessions}
          hiring={hiring}
          status={status}
          error={error}
          onSubmit={(text, kind, details) => onSubmit(text, kind, details)}
          onClose={() => setPage(null)}
        />
      )}
    </>
  );
}
