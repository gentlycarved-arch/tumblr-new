import { useState } from "react";
import { ChevronDown, ArrowUpRight, X } from "lucide-react";

const links = [
  { name: "Are.na", url: "https://www.are.na/tahreem-saood/channels" },
  { name: "Cosmos", url: "https://www.cosmos.so/gentlycarved" },
  { name: "Tumblr", url: "https://www.tumblr.com/gentlycarved" },
  { name: "X", url: "https://x.com/gentlycarved" },
];

export function ConnectTooltip({ darkMode = false, onClose }: { darkMode?: boolean; onClose?: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        boxShadow: darkMode
          ? "inset 0 0 6px rgba(0,0,0,0.4), 0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)"
          : "inset 0 0 6px rgba(0,0,0,0.18), 0 8px 32px rgba(0,0,0,0.28), 0 2px 8px rgba(0,0,0,0.16)",
        background: darkMode ? "#2a2a2a" : "white",
        transition: "background 600ms ease, box-shadow 600ms ease",
        overflow: "hidden",
      }}
      className="w-[280px] max-sm:w-[calc(100vw-32px)] max-sm:max-w-[320px] rounded-[13px] text-left font-['Favorit_Tumblr:Regular',sans-serif]"
    >
      {/* Card content */}
      <div className="p-4">
        <p
          className="font-['Favorit_Tumblr:Medium',sans-serif] text-[16px] mb-1.5"
          style={{ color: darkMode ? "#f0f0f0" : "#1a1a1a", transition: "color 600ms ease" }}
        >
          Hi! I'm Tahreem Rehman.
        </p>
        <p
          className="text-[16px] leading-[1.55] mb-3 whitespace-pre-line"
          style={{ color: darkMode ? "#aaaaaa" : "#555", transition: "color 600ms ease" }}
        >
          {"I design made-to-measure interfaces, tools shaped around how experts think, not the other way around. These days that means helping geologists use AI to find minerals, as Founding Designer at GeologicAI.\n\nThis page is a placeholder for now, inspired by a Lindsay Lohan screenshot on Tumblr's login page I stumbled on years ago and never forgot. You can request for my portfolio or just to chat."}
        </p>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1 text-[16px] transition-colors"
          style={{ color: darkMode ? "#7eb8f7" : "#3a7fd4" }}
        >
          <span>{open ? "Close" : "My digital footprint"}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>

        <div
          className={`grid transition-all duration-200 ${open ? "grid-rows-[1fr] opacity-100 mt-2" : "grid-rows-[0fr] opacity-0"}`}
        >
          <div className="overflow-hidden">
            <ul className="flex flex-col gap-0.5">
              {links.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-[6px] transition-colors"
                    style={{ background: "transparent" }}
                    onMouseEnter={e => (e.currentTarget.style.background = darkMode ? "rgba(255,255,255,0.07)" : "#f4f4f4")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <span
                      className="text-[16px]"
                      style={{ color: darkMode ? "#e0e0e0" : "#1a1a1a" }}
                    >{link.name}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" style={{ color: darkMode ? "#888" : "#888" }} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Mobile-only close strip */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="sm:hidden w-full flex items-center justify-center py-3"
          style={{
            background: darkMode ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)",
            borderTop: darkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.07)",
          }}
        >
          <X
            strokeWidth={2}
            className="w-4 h-4"
            style={{ color: darkMode ? "#888" : "#999" }}
          />
        </button>
      )}
    </div>
  );
}
