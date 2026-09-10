import { useEffect, useRef, useState } from "react";

interface Props {
  onImageUrl: (url: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

// Pulls a usable image URL out of a pasted link: a direct image link is used as-is,
// an are.na channel link resolves to its first image block via the public API.
async function resolveImageUrl(input: string): Promise<string | null> {
  const arenaMatch = input.match(/are\.na\/[^/]+\/([a-z0-9-]+)\/?$/i);
  if (arenaMatch) {
    try {
      const res = await fetch(`https://api.are.na/v2/channels/${arenaMatch[1]}?per=20`);
      const data = await res.json();
      const firstImage = (data.contents || []).find((c: any) => c.image?.display?.url || c.image?.original?.url);
      const url = firstImage?.image?.display?.url || firstImage?.image?.original?.url;
      if (url) return url;
    } catch {
      // fall through to treating it as a direct image link
    }
  }
  return input;
}

/** Small popover, styled after the portfolio's AddImageFlow: choose a file, or paste
 * a link (a direct image, or an are.na channel — first image gets used). */
export function AddOwnMenu({ onImageUrl, fileInputRef }: Props) {
  const [open, setOpen] = useState(false);
  const [linkInput, setLinkInput] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previewingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  async function tryLink(raw: string) {
    const value = raw.trim();
    if (!value || previewingRef.current) return;
    previewingRef.current = true;
    setChecking(true);
    setError(null);

    const candidate = await resolveImageUrl(value);
    const img = new Image();
    img.onload = () => {
      previewingRef.current = false;
      setChecking(false);
      onImageUrl(candidate!);
      setOpen(false);
      setLinkInput("");
    };
    img.onerror = () => {
      previewingRef.current = false;
      setChecking(false);
      setError("Couldn't load an image from that link.");
    };
    img.src = candidate!;
  }

  useEffect(() => {
    const v = linkInput.trim();
    if (!v || !/^https?:\/\/.+\..+/i.test(v)) return;
    const t = setTimeout(() => tryLink(v), 650);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkInput]);

  const font = "'ETBembo', serif";

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-[10px] tracking-[0.1em] uppercase underline underline-offset-2 whitespace-nowrap mt-1"
        style={{ color: "#453c3c", fontFamily: font }}
      >
        {open ? "close" : "or add your own"}
      </button>

      {open && (
        <div
          className="absolute z-50 flex flex-col gap-2 rounded-[10px] p-3"
          style={{
            top: "calc(100% + 8px)",
            left: 0,
            width: "220px",
            background: "#fff",
            boxShadow: "0 0 0 1px rgba(0,0,0,0.08), 0 10px 30px rgba(0,0,0,0.18)",
          }}
        >
          <button
            type="button"
            onClick={() => {
              fileInputRef.current?.click();
              setOpen(false);
            }}
            className="w-full rounded-[8px] py-2 text-[11px] tracking-[0.05em] uppercase"
            style={{ fontFamily: font, background: "#f4f4f4", color: "#444" }}
          >
            choose from your device
          </button>

          <div className="flex items-center gap-2 text-[10px] opacity-50" style={{ fontFamily: font }}>
            <div className="h-px flex-1" style={{ background: "#e0e0e0" }} />
            or
            <div className="h-px flex-1" style={{ background: "#e0e0e0" }} />
          </div>

          <input
            value={linkInput}
            onChange={(e) => { setLinkInput(e.target.value); setError(null); }}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); tryLink(linkInput); } }}
            placeholder="paste an image, are.na or cosmos link"
            className="w-full rounded-[8px] px-2.5 py-2 text-[12px] outline-none"
            style={{ fontFamily: font, border: "1px solid #ddd", color: "#333" }}
          />
          {checking ? (
            <div className="text-[10px] px-0.5 opacity-60" style={{ fontFamily: font }}>loading…</div>
          ) : error ? (
            <div className="text-[10px] px-0.5" style={{ fontFamily: font, color: "#c44" }}>{error}</div>
          ) : (
            <div className="text-[10px] px-0.5 opacity-45" style={{ fontFamily: font }}>
              pastes an image link automatically
            </div>
          )}
        </div>
      )}
    </div>
  );
}
