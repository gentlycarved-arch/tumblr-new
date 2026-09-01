import { useRef, useState, useEffect, useCallback } from "react";
import type { UploadStatus } from "../../hooks/useUploads";
import { MAX_COMMENT_LEN } from "../../lib/uploads";

interface Props {
  darkMode: boolean;
  status: UploadStatus;
  error: string | null;
  onFile: (file: File, comment: string, song: string) => void;
  onLink: (url: string, comment: string, song: string) => void;
  onAddingChange: (adding: boolean) => void;   // blanks the background while true
  onPreviewChange: (url: string | null) => void; // shows a preview image on the background
}

type Step = "idle" | "pick" | "review";

// Primary action gradient — reuses the "Portfolio Request" button look for consistency.
const BLUE_LIGHT = "radial-gradient(ellipse at 50% 35%, #7eb4e0 0%, #6a9fd8 35%, #5688be 70%, #4a7aaa 100%)";
const BLUE_DARK = "radial-gradient(ellipse at 50% 35%, #3a5068 0%, #2c3f55 35%, #1f2e3e 70%, #151f2b 100%)";

/**
 * "add an image" flow. Opening it blanks the background; picking a file or link
 * shows it full-bleed so the visitor can see how it looks behind the site, add a note,
 * and submit. Sits bottom-center on mobile, top-right on desktop.
 */
export function AddImageFlow({ darkMode, status, error, onFile, onLink, onAddingChange, onPreviewChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const objUrlRef = useRef<string | null>(null);
  const [step, setStep] = useState<Step>("idle");
  const [hover, setHover] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingLink, setPendingLink] = useState<string | null>(null);
  const [linkInput, setLinkInput] = useState("");
  const [linkErr, setLinkErr] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [comment, setComment] = useState("");
  const [song, setSong] = useState("");

  const busy = status === "uploading";

  const clearObjUrl = useCallback(() => {
    if (objUrlRef.current) { URL.revokeObjectURL(objUrlRef.current); objUrlRef.current = null; }
  }, []);

  const reset = useCallback(() => {
    clearObjUrl();
    setStep("idle"); setPendingFile(null); setPendingLink(null);
    setLinkInput(""); setLinkErr(null); setChecking(false); setComment(""); setSong("");
    onAddingChange(false); onPreviewChange(null);
  }, [clearObjUrl, onAddingChange, onPreviewChange]);

  // A successful add returns us to the resting state.
  useEffect(() => { if (status === "success") reset(); }, [status, reset]);
  useEffect(() => () => clearObjUrl(), [clearObjUrl]);

  function open() {
    setStep("pick");
    onAddingChange(true);
  }

  function useFile(file: File) {
    clearObjUrl();
    const url = URL.createObjectURL(file);
    objUrlRef.current = url;
    setPendingFile(file); setPendingLink(null);
    onPreviewChange(url);
    setStep("review");
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) useFile(f);
    e.target.value = "";
  }

  const previewingRef = useRef(false);
  function previewLink(v: string) {
    if (!v || previewingRef.current) return;
    previewingRef.current = true;
    setChecking(true); setLinkErr(null);
    const img = new Image();
    img.onload = () => {
      previewingRef.current = false;
      setChecking(false);
      clearObjUrl();
      setPendingLink(v); setPendingFile(null);
      onPreviewChange(v);
      setStep("review");
    };
    img.onerror = () => {
      previewingRef.current = false;
      setChecking(false);
      setLinkErr("Couldn't load that link — try right-click → Copy image address.");
    };
    img.src = v;
  }

  // Auto-preview a pasted/typed link shortly after it looks like a complete URL.
  useEffect(() => {
    const v = linkInput.trim();
    if (!v || !/^https?:\/\/.+\..+/i.test(v)) return;
    const t = setTimeout(() => previewLink(v), 650);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkInput]);

  function chooseAnother() {
    clearObjUrl();
    setPendingFile(null); setPendingLink(null); setLinkErr(null);
    onPreviewChange(null);
    setStep("pick");
  }

  function submit() {
    if (busy) return;
    if (pendingFile) onFile(pendingFile, comment, song);
    else if (pendingLink) onLink(pendingLink, comment, song);
  }

  // ---- shared styling ----
  const panelBg = darkMode ? "#1A1A1A" : "#FAFAFA";
  const ring = darkMode
    ? "0 0 0 1.5px rgba(255,255,255,0.28), 0 10px 30px rgba(0,0,0,0.4)"
    : "0 0 0 1.5px rgba(0,0,0,0.1), 0 10px 30px rgba(0,0,0,0.18)";
  const muted = darkMode ? "#c0bcbc" : "#888484";
  const heading = darkMode ? "#E5E1E1" : "#4a4a4a";
  const font = "font-['Favorit_Tumblr:Medium',sans-serif]";
  const fieldStyle: React.CSSProperties = {
    background: darkMode ? "#2a2a2a" : "#fff",
    color: darkMode ? "#E0E0E0" : "#212529",
    border: `1px solid ${darkMode ? "#3a3a3a" : "#d0d1d4"}`,
  };
  const secondaryBtn: React.CSSProperties = {
    background: darkMode ? "#2a2a2a" : "#e9eaed",
    color: darkMode ? "#d8d4d4" : "#5a5757",
  };
  const primaryBtn: React.CSSProperties = { background: darkMode ? BLUE_DARK : BLUE_LIGHT };

  return (
    <div
      className={`absolute flex flex-col max-sm:items-center sm:items-end
        max-sm:bottom-20 max-sm:left-1/2 max-sm:-translate-x-1/2
        sm:top-6 sm:right-6`}
      style={{ zIndex: 40 }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Library picker (no capture) and, on mobile, a direct-to-camera picker */}
      <input ref={inputRef} type="file" accept="image/*" onChange={onFileChange} className="hidden" />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={onFileChange} className="hidden" />

      {step === "idle" && (
        <button
          type="button"
          onClick={open}
          className={`${font} px-4 py-2 rounded-full text-[15px] leading-none whitespace-nowrap`}
          style={{
            background: darkMode ? "rgba(26,26,26,0.82)" : "rgba(248,248,248,0.9)",
            color: hover ? (darkMode ? "#fff" : "#2a2a2a") : heading,
            boxShadow: darkMode
              ? "0 0 0 1px rgba(255,255,255,0.18), 0 2px 10px rgba(0,0,0,0.3)"
              : "0 0 0 1px rgba(0,0,0,0.08), 0 2px 10px rgba(0,0,0,0.14)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            transition: "color 160ms ease, background 300ms ease",
          }}
        >
          add an image
        </button>
      )}

      {step !== "idle" && (
        <div
          className={`${font} rounded-[14px] p-4 w-[320px] max-w-[88vw] flex flex-col gap-3`}
          style={{ background: panelBg, boxShadow: ring, color: muted }}
        >
          {step === "pick" && (
            <>
              <div className="text-[15px]" style={{ color: heading }}>add an image</div>
              <div className="text-[12px] leading-snug -mt-1 opacity-70">
                visible to everyone who visits — it'll join the rotating background.
              </div>

              {/* Desktop: one file picker */}
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="hidden sm:block w-full rounded-[10px] py-2.5 text-[14px]"
                style={secondaryBtn}
              >
                choose from your device
              </button>

              {/* Mobile: camera roll, or open the camera to take a photo */}
              <div className="sm:hidden flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="w-full rounded-[10px] py-2.5 text-[14px]"
                  style={secondaryBtn}
                >
                  🖼️ choose from camera roll
                </button>
                <button
                  type="button"
                  onClick={() => cameraRef.current?.click()}
                  className="w-full rounded-[10px] py-2.5 text-[14px]"
                  style={secondaryBtn}
                >
                  📷 take a photo
                </button>
              </div>

              <div className="flex items-center gap-2 text-[12px] opacity-60">
                <div className="h-px flex-1" style={{ background: darkMode ? "#3a3a3a" : "#dcdde0" }} />
                or
                <div className="h-px flex-1" style={{ background: darkMode ? "#3a3a3a" : "#dcdde0" }} />
              </div>

              <div className="flex flex-col gap-1.5">
                <input
                  value={linkInput}
                  onChange={(e) => { setLinkInput(e.target.value); setLinkErr(null); }}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); previewLink(linkInput.trim()); } }}
                  placeholder="paste a link — cosmos, are.na, anywhere"
                  className="w-full rounded-[10px] px-3 py-2.5 text-[13px] outline-none"
                  style={fieldStyle}
                />
                {checking
                  ? <div className="text-[12px] px-0.5 opacity-70">loading…</div>
                  : linkErr
                    ? <div className="text-[12px] px-0.5" style={{ color: "#d05a5a" }}>{linkErr}</div>
                    : <div className="text-[12px] px-0.5 opacity-50">paste a link — it previews automatically</div>}
              </div>

              <button type="button" onClick={reset} className="rounded-[10px] py-2.5 text-[14px]" style={secondaryBtn}>
                cancel
              </button>
            </>
          )}

          {step === "review" && (
            <>
              <div className="flex flex-col gap-1">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value.slice(0, MAX_COMMENT_LEN))}
                  placeholder="why do you like this image?"
                  rows={2}
                  disabled={busy}
                  className="w-full rounded-[10px] px-3 py-2.5 text-[13px] outline-none resize-none"
                  style={fieldStyle}
                />
                <div className="text-[11px] opacity-45 text-right pr-0.5">{comment.length}/{MAX_COMMENT_LEN}</div>
              </div>

              <input
                value={song}
                onChange={(e) => setSong(e.target.value)}
                placeholder="🎵 attach a song (optional) — youtube, apple music, spotify"
                disabled={busy}
                className="w-full rounded-[10px] px-3 py-2.5 text-[13px] outline-none"
                style={fieldStyle}
              />

              {status === "error" && error && (
                <div className="text-[12px] px-0.5" style={{ color: "#d05a5a" }}>{error}</div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={chooseAnother}
                  disabled={busy}
                  className="flex-1 rounded-[10px] py-2.5 text-[14px]"
                  style={secondaryBtn}
                >
                  choose another
                </button>
                <button
                  type="button"
                  onClick={submit}
                  disabled={busy}
                  className="flex-1 rounded-[10px] py-2.5 text-[14px] text-white flex items-center justify-center gap-2"
                  style={{ ...primaryBtn, cursor: busy ? "default" : "pointer" }}
                >
                  {busy ? (
                    <>
                      <svg className="animate-spin" width="15" height="15" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
                        <path d="M14 8a6 6 0 0 0-6-6" stroke="white" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      submitting…
                    </>
                  ) : "submit"}
                </button>
              </div>

              <button type="button" onClick={reset} disabled={busy} className="text-[12px] opacity-60" style={{ color: muted }}>
                cancel
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
