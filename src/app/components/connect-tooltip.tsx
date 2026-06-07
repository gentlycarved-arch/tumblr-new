import { useState } from "react";
import { ChevronDown, ArrowUpRight } from "lucide-react";

const links = [
  { name: "Are.na", url: "https://www.are.na/tahreem-saood/channels" },
  { name: "Cosmos", url: "https://www.cosmos.so/gentlycarved" },
  { name: "Tumblr", url: "https://www.tumblr.com/gentlycarved" },
  { name: "X", url: "https://x.com/gentlycarved" },
];

export function ConnectTooltip({ darkMode = false }: { darkMode?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        boxShadow: darkMode
          ? "inset 0 0 6px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.4)"
          : "inset 0 0 6px rgba(0,0,0,0.18), 0 4px 12px rgba(0,0,0,0.12)",
        background: darkMode ? "#2a2a2a" : "white",
        transition: "background 600ms ease, box-shadow 600ms ease",
      }}
      className="w-[280px] max-sm:w-[calc(100vw-32px)] max-sm:max-w-[320px] rounded-[13px] p-4 text-left font-['Favorit_Tumblr:Regular',sans-serif]"
    >
      <p
        className="font-['Favorit_Tumblr:Medium',sans-serif] text-[13px] mb-1.5"
        style={{ color: darkMode ? "#f0f0f0" : "#1a1a1a", transition: "color 600ms ease" }}
      >
        Hi! I'm Tahreem Rehman.
      </p>
      <p
        className="text-[13px] leading-[1.5] mb-3 whitespace-pre-line"
        style={{ color: darkMode ? "#aaaaaa" : "#555", transition: "color 600ms ease" }}
      >
        {"I craft made-to-measure interfaces for experts in their fields.\n\nCurrently the Founding Designer at GeologicAI, where I help Geologists use AI to find minerals.\n\nI live in Toronto, Canada.\n\nThis page was inspired by a screenshot of Lindsay Lohan on Tumblr's login page, from years ago. It's sitting here as a fun placeholder while I build out my new website."}
      </p>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-[13px] text-[#3b82f6] hover:text-[#2563eb] transition-colors"
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
                    className="text-[13px]"
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
  );
}
