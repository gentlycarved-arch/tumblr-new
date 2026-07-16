import { useRef, useState, useEffect } from "react";
import type { UploadStatus } from "../../hooks/useUploads";

interface Props {
  darkMode: boolean;
  status: UploadStatus;
  error: string | null;
  onFile: (file: File) => void;
  onLink: (url: string) => void;
}

/** A small skeuomorphic "+" button (bottom-right) with a menu: upload from device, or paste a link. */
export function UploadButton({ darkMode, status, error, onFile, onLink }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [hover, setHover] = useState(false);
  const [open, setOpen] = useState(false);
  const [linkMode, setLinkMode] = useState(false);
  const [link, setLink] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Surface status changes as a briefly-visible toast.
  useEffect(() => {
    let msg: string | null = null;
    if (status === "uploading") msg = "Adding your image…";
    else if (status === "success") msg = "Added to the slideshow ✨";
    else if (status === "error") msg = error ?? "Something went wrong.";
    if (!msg) return;

    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    if (status !== "uploading") {
      toastTimer.current = setTimeout(() => setToast(null), 3400);
    }
    if (status === "success") {
      setOpen(false);
      setLinkMode(false);
      setLink("");
    }
  }, [status, error]);

  const busy = status === "uploading";
  const panelBg = darkMode ? "#1A1A1A" : "linear-gradient(180deg, #F4F5F7 0%, #E8E9EC 100%)";
  const textCol = darkMode ? "#E0E0E0" : "#212529";
  const rowHover = darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";

  function pickFile() {
    if (busy) return;
    inputRef.current?.click();
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onFile(file);
    e.target.value = "";
  }

  function submitLink() {
    const v = link.trim();
    if (!v || busy) return;
    onLink(v);
  }

  return (
    <div
      className="absolute bottom-6 right-6 flex flex-col items-end gap-2"
      style={{ zIndex: 40 }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Toast */}
      {toast && (
        <div
          className="px-3 py-2 rounded-[10px] text-[13px] font-['Favorit_Tumblr:Medium',sans-serif] leading-snug max-w-[260px] text-right"
          style={{
            background: panelBg,
            color: status === "error" ? "#d05a5a" : textCol,
            filter: "drop-shadow(0 3px 8px rgba(0,0,0,0.18))",
          }}
        >
          {toast}
        </div>
      )}

      {/* Menu panel */}
      {open && (
        <div
          className="rounded-[12px] overflow-hidden font-['Favorit_Tumblr:Medium',sans-serif]"
          style={{ background: panelBg, color: textCol, width: 240, filter: "drop-shadow(0 4px 14px rgba(0,0,0,0.22))" }}
        >
          {!linkMode ? (
            <>
              <button
                type="button"
                onClick={pickFile}
                disabled={busy}
                className="w-full text-left px-4 py-3 text-[14px] flex items-center gap-2.5"
                style={{ background: "transparent", transition: "background 120ms" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = rowHover)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <span style={{ fontSize: 16 }}>🖼️</span>
                <span>Upload from device</span>
              </button>
              <div style={{ height: 1, background: darkMode ? "#333" : "#dcdde0" }} />
              <button
                type="button"
                onClick={() => setLinkMode(true)}
                disabled={busy}
                className="w-full text-left px-4 py-3 text-[14px] flex items-center gap-2.5"
                style={{ background: "transparent", transition: "background 120ms" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = rowHover)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <span style={{ fontSize: 16 }}>🔗</span>
                <span>Paste a link</span>
              </button>
            </>
          ) : (
            <div className="p-3 flex flex-col gap-2">
              <div className="text-[12px] opacity-70 px-0.5">Cosmos, Are.na, or any image link</div>
              <input
                autoFocus
                value={link}
                onChange={(e) => setLink(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") submitLink(); }}
                placeholder="https://…"
                disabled={busy}
                className="w-full rounded-[8px] px-2.5 py-2 text-[13px] outline-none"
                style={{
                  background: darkMode ? "#2a2a2a" : "#fff",
                  color: textCol,
                  border: `1px solid ${darkMode ? "#3a3a3a" : "#d0d1d4"}`,
                }}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setLinkMode(false); setLink(""); }}
                  disabled={busy}
                  className="flex-1 rounded-[8px] py-2 text-[13px]"
                  style={{ background: darkMode ? "#2a2a2a" : "#e9eaed", color: textCol }}
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={submitLink}
                  disabled={busy || !link.trim()}
                  className="flex-1 rounded-[8px] py-2 text-[13px] text-white"
                  style={{ background: link.trim() && !busy ? "#5688be" : "#8aa8c8", cursor: link.trim() && !busy ? "pointer" : "default" }}
                >
                  Add
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/*" onChange={onChange} className="hidden" />

      {/* The "+" button (toggles the menu) */}
      <button
        type="button"
        onClick={() => { setOpen((v) => !v); setLinkMode(false); }}
        aria-label="Add your own image to the slideshow"
        aria-expanded={open}
        className="relative size-[38px] flex items-center justify-center"
        style={{
          filter: darkMode ? "drop-shadow(0 1px 6px rgba(0,0,0,0.45))" : "drop-shadow(0 1px 4px rgba(0,0,0,0.35))",
          cursor: "pointer",
        }}
      >
        <svg className="absolute inset-0 size-full" fill="none" viewBox="0 0 28 28">
          <defs>
            <radialGradient id="upGradBase" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#9e9b9b" />
              <stop offset="100%" stopColor="#636060" />
            </radialGradient>
            <radialGradient id="upGradHover" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#a5a2a2" />
              <stop offset="100%" stopColor="#6e6b6b" />
            </radialGradient>
          </defs>
          <circle cx="14" cy="14" r="13.5" fill={`url(#upGrad${hover || open ? "Hover" : "Base"})`} />
          <circle cx="14" cy="14" r="13.5" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
          {(hover || open) && (
            <circle cx="14" cy="14" r="12.5" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
          )}
        </svg>

        {busy ? (
          <svg className="relative z-10 animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
            <path d="M14 8a6 6 0 0 0-6-6" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : (
          <span
            className="relative z-10 text-white leading-none select-none"
            style={{
              textShadow: "0 1px 2px rgba(0,0,0,0.4)",
              fontSize: "22px",
              lineHeight: 1,
              fontWeight: 300,
              transform: open ? "rotate(45deg)" : "none",
              transition: "transform 180ms ease",
            }}
          >
            +
          </span>
        )}
      </button>
    </div>
  );
}
