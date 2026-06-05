import { useState } from "react";
import { ChevronDown, ArrowUpRight } from "lucide-react";

const links = [
  { name: "Are.na", url: "https://www.are.na/tahreem-saood/channels" },
  { name: "Cosmos", url: "https://www.cosmos.so/gentlycarved" },
  { name: "Tumblr", url: "https://www.tumblr.com/gentlycarved" },
  { name: "X", url: "https://x.com/gentlycarved" },
];

export function ConnectTooltip() {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        boxShadow:
          "inset 0 0 6px rgba(0,0,0,0.18), 0 4px 12px rgba(0,0,0,0.12)",
      }}
      className="w-[280px] max-sm:w-[calc(100vw-32px)] max-sm:max-w-[320px] rounded-[13px] bg-white p-4 text-left font-['Favorit_Tumblr:Regular',sans-serif]"
    >
      <p className="font-['Favorit_Tumblr:Medium',sans-serif] text-[13px] text-[#1a1a1a] mb-1.5">Hi! I'm Tahreem Rehman.</p>
      <p className="text-[13px] leading-[1.5] text-[#555] mb-3 whitespace-pre-line">
        {"I craft made-to-measure interfaces for experts in their fields.\n\nCurrently the Founding Designer at GeologicAI, where I help Geologists use AI to find minerals.\n\nI live in Toronto, Canada.\n\nThis page was inspired by a screenshot of Lindsay Lohan on Tumblr's login page, from years ago. It's sitting here as a fun placeholder while I build out my new website."}
      </p>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-[13px] text-[#3b82f6] hover:text-[#2563eb] transition-colors"
      >
        <span>{open ? "Close" : "Find me on the internet"}</span>
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
                  className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-[6px] hover:bg-[#f4f4f4] transition-colors"
                >
                  <span className="text-[13px] text-[#1a1a1a]">{link.name}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#888]" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
