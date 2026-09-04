import { useState, useEffect } from "react";
import { X, ArrowUpRight } from "lucide-react";
import work02 from "../../assets/portfolio/work-02.mp4";
import work03 from "../../assets/portfolio/work-03.mp4";
import work04 from "../../assets/portfolio/work-04.mp4";
import workSoap from "../../assets/portfolio/work-soap.jpg";
import workTahreemBg from "../../assets/portfolio/work-tahreem-bg.jpg";
import workTshirt from "../../assets/portfolio/work-tshirt.jpg";
import workIris from "../../assets/portfolio/work-iris.jpg";
import workGallery from "../../assets/portfolio/work-gallery.jpg";
import workNative from "../../assets/portfolio/work-native.jpg";
import workHalftone from "../../assets/portfolio/work-halftone.jpg";
import workDesk from "../../assets/portfolio/work-desk.jpg";
import workPosterBoard from "../../assets/portfolio/work-poster-board.jpg";
import workPosters from "../../assets/portfolio/work-posters.gif";
import workBelieve from "../../assets/portfolio/work-believe-douthat.png";
import filmFresco from "../../assets/portfolio/film-fresco.jpg";
import filmWater from "../../assets/portfolio/film-water.jpg";
import filmStreet from "../../assets/portfolio/film-street.jpg";
import filmInterior from "../../assets/portfolio/film-interior.jpg";
import filmCafe from "../../assets/portfolio/film-cafe.jpg";
import filmBoat from "../../assets/portfolio/film-boat.jpg";
import meMetallic from "../../assets/portfolio/new-pp-metal.png";
import work05 from "../../assets/portfolio/work-05.mp4";
import workGeoai from "../../assets/portfolio/work-geoai.png";
import workTrailer from "../../assets/portfolio/work-trailer.png";
import workCyanometer from "../../assets/portfolio/work-cyanometer.jpeg";
import workCyanometerHistorical from "../../assets/portfolio/work-cyanometer-historical.gif";
import workPosterLuke from "../../assets/portfolio/work-poster-luke.png";
import workPosterSherry from "../../assets/portfolio/work-poster-sherry.png";
import workCrossword from "../../assets/portfolio/work-crossword.png";
import workCoretable2 from "../../assets/portfolio/work-coretable-2.png";
import workCoretable3 from "../../assets/portfolio/work-coretable-3.png";
import workMemeticMap from "../../assets/portfolio/work-memetic-map.png";
import filmCeiling from "../../assets/portfolio/film-ceiling.jpg";
import filmRoad from "../../assets/portfolio/film-road.jpg";
import filmCrowdHill from "../../assets/portfolio/film-crowd-hill.jpg";
import filmStreetMecca from "../../assets/portfolio/film-street-mecca.jpg";
import work06 from "../../assets/portfolio/work-06.mov";
import work07 from "../../assets/portfolio/work-07.mov";
import tumblrIcon from "../../assets/portfolio/tumblr-icon.png";
import filmLakeTerrace from "../../assets/portfolio/film-lake-terrace.jpg";
import filmPoolside from "../../assets/portfolio/film-poolside.jpg";
import filmMiswak from "../../assets/portfolio/film-miswak.jpg";
import workTumblrLandingpage from "../../assets/portfolio/work-tumblr-landingpage.png";

interface Props {
  darkMode: boolean;
  onClose: () => void;
}

const NAV_LINKS: { label: string; href: string }[] = [
  { label: "x/twitter", href: "https://x.com/gentlycarved" },
  { label: "are.na", href: "https://www.are.na/tahreem-rehman/channels" },
  { label: "linkedin", href: "https://www.linkedin.com/in/tahreem-saood/" },
  { label: "email", href: "mailto:gentlycarved@gmail.com" },
];

function NavPill({ children, onClick, href }: { children: React.ReactNode; onClick?: () => void; href?: string }) {
  const className =
    "font-['Favorit_Tumblr:Medium',sans-serif] text-[13px] max-sm:text-[12px] leading-none whitespace-nowrap underline underline-offset-2 transition-colors";
  const style: React.CSSProperties = {
    color: "#2a2a2a",
    textDecorationColor: "#b8b4b4",
  };
  const hoverProps = {
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.textDecorationColor = "#2a2a2a"; },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.textDecorationColor = "#b8b4b4"; },
  };
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className} style={style} {...hoverProps}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className} style={style} {...hoverProps}>
      {children}
    </button>
  );
}

/** Bio popover shown from the Info pill, matching the bio used elsewhere on the site. */
function InfoPopover({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 flex items-start justify-center px-6 pt-24 max-sm:pt-16"
      style={{ background: "rgba(0,0,0,0.45)", zIndex: 100 }}
      onClick={onClose}
    >
      <div
        className="font-['Favorit_Tumblr:Regular',sans-serif] rounded-[14px] p-5 w-[380px] max-w-full text-[14px] leading-[1.65]"
        style={{ background: "#FAFAFA", color: "#3A3A3A", boxShadow: "0 10px 30px rgba(0,0,0,0.25)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="mb-3">
          Currently the Founding Product Designer at{" "}
          <a href="https://geologic.ai" target="_blank" rel="noopener noreferrer" className="underline">GeologicAI</a>
          , where I design AI tools for geologists working to uncover what's hidden inside rock. I'm drawn to niche
          problems, complicated systems, and the challenge of making them feel remarkably simple.
        </p>
        <p className="mb-3">
          Previously, I worked on payroll at{" "}
          <a href="https://www.freshbooks.com" target="_blank" rel="noopener noreferrer" className="underline">FreshBooks</a>
          , design research at{" "}
          <a href="https://www.rbc.com" target="_blank" rel="noopener noreferrer" className="underline">RBC</a>
          , and a range of product and service design projects across finance, technology, and beyond.
        </p>
        <p>
          I'm also interested in film photography, fashion, industrial design, old books, and{" "}
          <a href="https://www.are.na/tahreem-rehman/channels" target="_blank" rel="noopener noreferrer" className="underline">
            collecting things from the internet
          </a>
          .
        </p>
      </div>
    </div>
  );
}

type Cell =
  | { type: "image"; src: string }
  | { type: "video"; src: string }
  | { type: "writing"; text: string; href?: string }
  | { type: "tools" };

const ARENA_CHANNEL_SLUG = "ujoh1nntq5m";

interface ArenaTool {
  title: string;
  url: string;
  thumb?: string;
}

/** Card matching the site's popup design language (see ConnectTooltip), listing
 * Link blocks pulled live from the "🧰" are.na channel. */
function ToolsCard() {
  const [tools, setTools] = useState<ArenaTool[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`https://api.are.na/v2/channels/${ARENA_CHANNEL_SLUG}?per=100`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const links: ArenaTool[] = (data.contents || [])
          .filter((c: any) => c.class === "Link" && c.source?.url)
          .map((c: any) => ({ title: c.title || c.source.url, url: c.source.url, thumb: c.image?.thumb?.url }));
        setTools(links);
      })
      .catch(() => { if (!cancelled) setError(true); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div
      className="rounded-[13px] p-5"
      style={{
        background: "#FAFAFA",
        boxShadow: "inset 0 0 6px rgba(0,0,0,0.18), 0 8px 32px rgba(0,0,0,0.28), 0 2px 8px rgba(0,0,0,0.16)",
      }}
    >
      <p className="font-['Favorit_Tumblr:Medium',sans-serif] text-[16px] mb-3" style={{ color: "#212529" }}>
        my design toolbox
      </p>
      {error && (
        <p className="font-['Favorit_Tumblr:Regular',sans-serif] text-[13px]" style={{ color: "#888" }}>
          couldn't load the are.na channel right now.
        </p>
      )}
      {!error && !tools && (
        <p className="font-['Favorit_Tumblr:Regular',sans-serif] text-[13px]" style={{ color: "#888" }}>
          loading…
        </p>
      )}
      {tools && (
        <ul className="flex flex-col gap-0.5 h-[480px] overflow-y-auto">
          {tools.map((tool, i) => (
            <li key={i}>
              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-[6px] transition-colors"
                style={{ background: "transparent" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f4f4f4")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <span className="flex items-center gap-2 min-w-0">
                  {tool.thumb && (
                    <img src={tool.thumb} alt="" className="w-6 h-6 rounded-[4px] object-cover flex-shrink-0" style={{ background: "#eee" }} />
                  )}
                  <span className="font-['Favorit_Tumblr:Regular',sans-serif] text-[14px] truncate" style={{ color: "#212529" }}>
                    {tool.title}
                  </span>
                </span>
                <ArrowUpRight size={14} style={{ color: "#888", flexShrink: 0 }} />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Real work + writing snippets in the gaps, matching the reference's checkerboard
// rhythm — the "empty" cells carry a bit of writing instead of sitting blank.
// Writing tiles with an href are real posts from x.com/gentlycarved, linked back to the original.
const CELLS: Cell[] = [
  { type: "tools" },
  { type: "writing", text: "most people overthink taste, its just an instinct", href: "https://x.com/gentlycarved/status/2019074356308050205" },
  { type: "image", src: workPosterSherry },
  { type: "writing", text: "you will simply not improve as a designer if you don't do 100 iterations of an idea.", href: "https://x.com/gentlycarved/status/2095690790747934922" },
  { type: "image", src: workSoap },
  { type: "image", src: workTshirt },

  { type: "image", src: workNative },
  { type: "video", src: work02 },
  { type: "writing", text: "the interface you design becomes truly scalable when users can dream inside of it. It should be easy for them to imagine new realities inside of it.", href: "https://x.com/gentlycarved/status/1981473473978368370" },
  { type: "image", src: workGallery },

  { type: "image", src: workGeoai },
  { type: "image", src: filmWater },
  { type: "writing", text: "I will always need a design canvas before working in code", href: "https://x.com/gentlycarved/status/2038664880505376825" },
  { type: "image", src: workHalftone },

  { type: "video", src: work03 },
  { type: "image", src: workIris },
  { type: "writing", text: "The Iris color tool was inspired by an 18th-century cyanometer — a device for measuring the blueness of the sky.", href: "https://x.com/gentlycarved/status/2028332716291150208" },
  { type: "image", src: workCyanometerHistorical },
  { type: "image", src: workTrailer },

  { type: "image", src: filmCafe },
  { type: "image", src: filmBoat },

  { type: "writing", text: "\"when you design interfaces you are —literally— designing the sensory organs people use to perceive information\"", href: "https://x.com/gentlycarved/status/2023526271381368924" },
  { type: "image", src: filmRoad },
  { type: "writing", text: "\"What we call 'interface' in the context of computer technology already exists within us: a network that mediates our subjectivity, that synthesizes what we perceive and the world that is perceived.\" — Seiko Mikami (Molecular Informatics, 2004)" },
  { type: "image", src: workPosterBoard },
  { type: "image", src: filmStreet },
  { type: "image", src: workCyanometer },

  { type: "writing", text: "something so millennial-coded about seeing photorealistic & device mockups on a design portfolio (sorry)", href: "https://x.com/gentlycarved/status/2049563662898131135" },
  { type: "image", src: workPosters },
  { type: "video", src: work04 },
  { type: "image", src: workBelieve },

  { type: "writing", text: "These flowers are Tulipa sprengeri — their survival connects to what Douthat's talk was about: what we choose to preserve.", href: "https://x.com/gentlycarved/status/2095245562584928618" },
  { type: "image", src: filmFresco },
  { type: "video", src: work05 },
  { type: "writing", text: "AI is only as effective as your judgement, imagination and articulation.", href: "https://x.com/gentlycarved/status/1955336976531411447" },

  { type: "image", src: workTahreemBg },
  { type: "writing", text: "we're still making chat interfaces because AI is unreliable.", href: "https://x.com/gentlycarved/status/2084455071849624051" },
  { type: "image", src: workDesk },
  { type: "writing", text: "sometimes I'm like, yeah well your website is beautiful because the images are beautiful", href: "https://x.com/gentlycarved/status/1937236176882061778" },

  { type: "image", src: filmInterior },
  { type: "writing", text: "6.5 billion for a design agency. I have so many thoughts, but I'm mostly optimistic simply because this allows designers to lead these crazy times", href: "https://x.com/gentlycarved/status/1925247370591105232" },
  { type: "image", src: filmCrowdHill },
  { type: "writing", text: "if you like my work, ask me to go through a work trial and then meet me after for a chat, I feel like this would make design hiring a bit easier.", href: "https://x.com/gentlycarved/status/2058990882976645145" },
  { type: "image", src: filmPoolside },
  { type: "writing", text: "Sincerely, but with a lightness of touch." },
  { type: "image", src: workMemeticMap },
  { type: "writing", text: "Designing for Geologists →", href: "https://x.com/gentlycarved/status/2026095227929235775" },
  { type: "image", src: filmMiswak },
  { type: "writing", text: "Designing for Geologists — Field Notes #2 →", href: "https://x.com/gentlycarved/status/2047497932421693589" },

  { type: "image", src: workCoretable2 },
  { type: "image", src: workCoretable3 },
  { type: "video", src: work06 },

  { type: "image", src: workPosterLuke },
  { type: "image", src: workCrossword },

  { type: "video", src: work07 },
  { type: "image", src: filmCeiling },
  { type: "image", src: filmStreetMecca },

  { type: "image", src: filmLakeTerrace },
  { type: "image", src: workTumblrLandingpage },
];

function WritingCell({ text, href }: { text: string; href?: string }) {
  const color = "#5a5757";
  const content = (
    <div
      className="font-['Favorit_Tumblr:Medium',sans-serif] text-[19px] max-sm:text-[16px] leading-snug"
      style={{ color }}
    >
      {text}
    </div>
  );

  return (
    <div className="flex items-center px-3 py-4 max-sm:px-2 max-sm:py-3">
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-70 transition-opacity"
          style={{ color }}
        >
          {content}
        </a>
      ) : (
        content
      )}
    </div>
  );
}

/** An image or video tile: fuzzy vignette by default, which fades away into a metal-stroke frame on hover. */
function ProjectTile({
  cell,
  cellBg,
  onOpen,
}: {
  cell: Extract<Cell, { type: "image" | "video" }>;
  cellBg: string;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="View full size"
      className="project-tile relative w-full overflow-hidden block cursor-zoom-in"
    >
      {cell.type === "image" ? (
        <img src={cell.src} alt="" loading="lazy" className="block w-full h-auto" style={{ background: cellBg }} />
      ) : (
        <video src={cell.src} autoPlay muted loop playsInline className="block w-full h-auto" style={{ background: cellBg }} />
      )}
      <div className="fuzzy-overlay" style={{ background: cellBg }} />
      <div className="metal-frame" />
    </button>
  );
}

/** Full-size view of a single tile, opened by clicking it in the grid. */
function Lightbox({ cell, onClose }: { cell: Extract<Cell, { type: "image" | "video" }>; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-6 max-sm:p-3"
      style={{ background: "rgba(0,0,0,0.86)", zIndex: 95 }}
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="fixed flex items-center justify-center rounded-full"
        style={{ top: 20, right: 20, width: 36, height: 36, background: "rgba(255,255,255,0.12)", color: "#fff" }}
      >
        <X size={17} strokeWidth={2} />
      </button>
      {cell.type === "image" ? (
        <img
          src={cell.src}
          alt=""
          className="max-w-full max-h-full object-contain"
          style={{ borderRadius: 4 }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <video
          src={cell.src}
          controls
          autoPlay
          loop
          playsInline
          className="max-w-full max-h-full object-contain"
          style={{ borderRadius: 4 }}
          onClick={(e) => e.stopPropagation()}
        />
      )}
    </div>
  );
}

/** Full-screen portfolio grid, shown once the visitor enters the password. Always light —
 * this stays its own consistent gallery regardless of the site's dark mode toggle. */
export function PortfolioView({ onClose }: Omit<Props, "darkMode">) {
  const bg = "#ffffff";
  const cellBg = "#fff";
  const [lightbox, setLightbox] = useState<Extract<Cell, { type: "image" | "video" }> | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <div className="fixed inset-0 overflow-y-auto" style={{ background: bg, zIndex: 80 }}>
      <button
        type="button"
        onClick={onClose}
        title="return to landing page"
        aria-label="Return to landing page"
        className="fixed flex items-center group"
        style={{ top: 16, left: 16, zIndex: 90 }}
      >
        <img
          src={tumblrIcon}
          alt=""
          className="w-8 h-8 rounded-full opacity-50 group-hover:opacity-100 transition-opacity"
        />
      </button>
      <style>{`
        .project-tile { border-radius: 4px; }
        .project-tile .fuzzy-overlay {
          --fuzz: 14px;
          position: absolute;
          inset: 0;
          -webkit-mask-image:
            linear-gradient(to right, black, transparent var(--fuzz), transparent calc(100% - var(--fuzz)), black),
            linear-gradient(to bottom, black, transparent var(--fuzz), transparent calc(100% - var(--fuzz)), black);
          mask-image:
            linear-gradient(to right, black, transparent var(--fuzz), transparent calc(100% - var(--fuzz)), black),
            linear-gradient(to bottom, black, transparent var(--fuzz), transparent calc(100% - var(--fuzz)), black);
          transition: opacity 400ms ease;
        }
        .project-tile:hover .fuzzy-overlay { opacity: 0; }
        .project-tile .metal-frame {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          pointer-events: none;
          opacity: 0;
          padding: 2px;
          background: linear-gradient(135deg, #f2f2f2 0%, #8a8a8a 28%, #ffffff 50%, #6b6b6b 72%, #f2f2f2 100%);
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          transition: opacity 400ms ease;
        }
        .project-tile:hover .metal-frame { opacity: 1; }
      `}</style>
      <div className="max-w-[1200px] mx-auto px-3 pb-6 pt-16 max-sm:px-2 max-sm:pb-4 max-sm:pt-10">
        <div className="flex justify-center mb-16 max-sm:mb-12">
          <img
            src={meMetallic}
            alt="Tahreem, as a kid"
            className="w-[190px] max-sm:w-[145px] h-auto"
          />
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-start mb-16 px-1 gap-2">
          <div />
          <div className="flex flex-col items-center text-center gap-2 max-w-[420px]">
            <div className="font-['Favorit_Tumblr:Medium',sans-serif] text-[15px]" style={{ color: "#2a2a2a" }}>
              Tahreem Rehman
            </div>
            <div className="font-['Favorit_Tumblr:Regular',sans-serif] text-[13px] leading-snug" style={{ color: "#5a5757" }}>
              Founding Product Designer at GeologicAI, building AI tools for geologists to uncover what's hidden in rock.
              <br />
              Drawn to niche problems and complex systems that need to feel simple.
            </div>
            <div className="flex items-center justify-center gap-4 mt-1">
              <NavPill onClick={() => setInfoOpen(true)}>info</NavPill>
              {NAV_LINKS.map((link) => (
                <NavPill key={link.label} href={link.href}>{link.label}</NavPill>
              ))}
            </div>
          </div>
          <div />
        </div>

        {infoOpen && <InfoPopover onClose={() => setInfoOpen(false)} />}

        <div className="columns-2 sm:columns-3 gap-2 max-sm:gap-1.5">
          {CELLS.map((cell, i) => (
            <div key={i} className="break-inside-avoid mb-2 max-sm:mb-1.5">
              {cell.type === "writing" ? (
                <WritingCell text={cell.text} href={cell.href} />
              ) : cell.type === "tools" ? (
                <ToolsCard />
              ) : (
                <ProjectTile cell={cell} cellBg={cellBg} onOpen={() => setLightbox(cell)} />
              )}
            </div>
          ))}
        </div>
      </div>

      {lightbox && <Lightbox cell={lightbox} onClose={() => setLightbox(null)} />}
    </div>
  );
}
