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
        background: darkMode ? "#1A1A1A" : "#FAFAFA",
        transition: "background 600ms ease, box-shadow 600ms ease",
        overflow: "hidden",
      }}
      className="w-[340px] max-sm:w-[calc(100vw-32px)] max-sm:max-w-[320px] rounded-[13px] text-left"
    >
      {/* Card content */}
      <div className="p-5 max-sm:p-4">
        <p
          className="font-['Favorit_Tumblr:Medium',sans-serif] text-[16px] max-sm:text-[16px] mb-2 leading-[1.3]"
          style={{ color: darkMode ? "#E0E0E0" : "#212529", transition: "color 600ms ease" }}
        >
I'm Tahreem Rehman,
        </p>
        <p
          className="font-['Favorit_Tumblr:Regular',sans-serif] text-[16px] max-sm:text-[15px] leading-[1.65] mb-3 whitespace-pre-line"
          style={{ color: darkMode ? "#B8B8B8" : "#3A3A3A", transition: "color 600ms ease" }}
        >
          {"I design made-to-measure experiences for experts in their craft and daydreamers on the internet. Currently as Founding Designer at GeologicAI, where geologists use AI to find minerals.\n\nA placeholder while I build my portfolio, inspired by Tumblr, where I first started designing on the internet."}
        </p>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1 text-[16px] max-sm:text-[15px] transition-colors"
          style={{ color: darkMode ? "#7ab2f0" : "#3a7fd4" }}
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
                      className="text-[16px] max-sm:text-[15px]"
                      style={{ color: darkMode ? "#E0E0E0" : "#212529" }}
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
