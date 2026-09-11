import { useState, useEffect } from "react";
import { Link } from "react-router";
import { X, ArrowUpRight } from "lucide-react";
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
import workAlbumSingles from "../../assets/portfolio/work-album-singles.png";
import workWaxSeal from "../../assets/portfolio/work-wax-seal.jpg";
import workNegativeSpaceButton from "../../assets/portfolio/work-negative-space-button.mp4";
import workKellyEllsworth from "../../assets/portfolio/work-kelly-ellsworth.jpeg";
import workSeverance from "../../assets/portfolio/work-severance.mp4";

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
        className="font-['Favorit_Tumblr:Regular',sans-serif] rounded-[14px] p-5 w-[380px] max-w-full text-[14px] leading-[1.65] max-h-[80vh] overflow-y-auto"
        style={{ background: "#FAFAFA", color: "#3A3A3A", boxShadow: "0 10px 30px rgba(0,0,0,0.25)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="mb-3">I'm a designer.</p>
        <p className="mb-3">
          I have a strong point of view about how I'd like to see the world, and I scratch that itch by creating ideas on the internet.
        </p>
        <p className="mb-3">
          I have a lot of niche interests, and I find ways to realize them into digital experiences, turning whatever I'm curious about that week into something people can actually use or look at.
        </p>
        <p className="mb-3">
          I've taken on roles like design researcher, product designer, book designer, web designer. At the end of the day, I make things. No matter the context, no matter the medium.
        </p>
        <p className="mb-3">
          I've designed specialized tools for geologists and scientific instruments. I've designed playbills for philosophical lectures. I've designed t-shirts. I've designed album covers for indie artists. The through-line isn't the industry, it's that someone had an idea worth shaping, and I showed up to shape it.
        </p>
        <p>
          I like working with people and developing a vision for them, something they'll enjoy using, enjoy seeing, or enjoy holding. Good design should feel like it was made by someone who cared.
        </p>
      </div>
    </div>
  );
}

type Cell =
  | { type: "image"; src: string; width?: number; height?: number; caption?: string }
  | { type: "video"; src: string; width?: number; height?: number; caption?: string }
  | { type: "writing"; text: string; href?: string }
  | { type: "tools" }
  // Two media items that must always render stacked together as one tile —
  // used for a piece of work shown right alongside its inspiration reference.
  | { type: "pair"; top: Extract<Cell, { type: "image" | "video" }>; bottom: Extract<Cell, { type: "image" | "video" }> };

const FILM_CAPTION = "shot on 35mm film by me";

const ARENA_CHANNEL_SLUG = "ujoh1nntq5m";

interface ArenaTool {
  title: string;
  url: string;
  thumb?: string;
}

const ARENA_EMBED_SNIPPET = `<div id="arena-links"></div>
<script>
  fetch('https://api.are.na/v2/channels/YOUR-CHANNEL-SLUG?per=100')
    .then((res) => res.json())
    .then((data) => {
      const container = document.getElementById('arena-links');
      data.contents
        .filter((c) => c.class === 'Link' && c.source?.url)
        .forEach((c) => {
          const a = document.createElement('a');
          a.href = c.source.url;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          a.textContent = c.title || c.source.url;
          a.style.display = 'block';
          container.appendChild(a);
        });
    });
</script>`;

/** Fetches the design-toolbox links from the "🧰" are.na channel. */
function useArenaTools() {
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

  return { tools, error };
}

/** Small clickable teaser shown in the grid: title, description, and a peek at a few
 * tools from the list — opens the full toolbox as a centered modal. */
function ToolsTile({ onOpen }: { onOpen: () => void }) {
  const { tools } = useArenaTools();

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full text-left rounded-[13px] p-5 transition-transform"
      style={{
        background: "#FAFAFA",
        boxShadow: "inset 0 0 4px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08)",
      }}
    >
      <p className="font-['Favorit_Tumblr:Medium',sans-serif] text-[16px] mb-1" style={{ color: "#212529" }}>
        my design toolbox
      </p>
      <p className="font-['Favorit_Tumblr:Regular',sans-serif] text-[13px] leading-snug mb-3" style={{ color: "#888" }}>
        a collection of tools that I use as a designer, gathered on Are.na.
      </p>
      {tools && (
        <ul className="flex flex-col gap-1 mb-2">
          {tools.slice(0, 4).map((tool, i) => (
            <li key={i} className="flex items-center gap-2 min-w-0">
              {tool.thumb && (
                <img src={tool.thumb} alt="" className="w-5 h-5 rounded-[4px] object-cover flex-shrink-0" style={{ background: "#eee" }} />
              )}
              <span className="font-['Favorit_Tumblr:Regular',sans-serif] text-[13px] truncate" style={{ color: "#5a5757" }}>
                {tool.title}
              </span>
            </li>
          ))}
        </ul>
      )}
      <p className="font-['Favorit_Tumblr:Regular',sans-serif] text-[12px]" style={{ color: "#a8a4a4" }}>
        <span className="max-sm:hidden">click to view the rest</span>
        <span className="sm:hidden">tap to see the rest</span>
      </p>
    </button>
  );
}

/** Card matching the site's popup design language (see ConnectTooltip), listing
 * Link blocks pulled live from the "🧰" are.na channel. Shown centered, as a modal,
 * once the ToolsTile teaser in the grid is clicked. */
function ToolsModal({ onClose }: { onClose: () => void }) {
  const { tools, error } = useArenaTools();
  const [showCode, setShowCode] = useState(false);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center px-6"
      style={{ background: "rgba(0,0,0,0.45)", zIndex: 100 }}
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
      <div
        className="rounded-[13px] p-5 w-[460px] max-w-full max-h-[80vh] overflow-y-auto"
        style={{
          background: "#FAFAFA",
          boxShadow: "inset 0 0 4px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-['Favorit_Tumblr:Medium',sans-serif] text-[16px] mb-1" style={{ color: "#212529" }}>
          my design toolbox
        </p>
        <p className="font-['Favorit_Tumblr:Regular',sans-serif] text-[13px] leading-snug mb-3" style={{ color: "#888" }}>
          a collection of tools that I use as a designer, gathered on Are.na.
        </p>
        <Link
          to="/iris"
          className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-[6px] transition-colors mb-1"
          style={{ background: "transparent" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#f4f4f4")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <span className="font-['Favorit_Tumblr:Regular',sans-serif] text-[14px]" style={{ color: "#212529" }}>
            Iris — my color tool
          </span>
          <ArrowUpRight size={14} style={{ color: "#888", flexShrink: 0 }} />
        </Link>
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

        <div className="mt-3 pt-3" style={{ borderTop: "1px solid #e5e5e5" }}>
          <button
            type="button"
            onClick={() => setShowCode((v) => !v)}
            className="font-['Favorit_Tumblr:Regular',sans-serif] text-[13px] underline underline-offset-2 transition-colors"
            style={{ color: "#3a7fd4" }}
          >
            {showCode ? "hide the code ↑" : "want this on your site? here's the code →"}
          </button>

          {showCode && (
            <div className="mt-2">
              <p className="font-['Favorit_Tumblr:Regular',sans-serif] text-[12px] leading-snug mb-2" style={{ color: "#888" }}>
                drop this into any page — swap in your own Are.na channel slug — and it'll render a live list of links from that channel.
              </p>
              <pre
                className="text-[11px] leading-snug p-3 rounded-[8px] overflow-x-auto"
                style={{ background: "#1e1e1e", color: "#d4d4d4" }}
              >
{ARENA_EMBED_SNIPPET}
              </pre>
              <button
                type="button"
                onClick={(e) => {
                  navigator.clipboard.writeText(ARENA_EMBED_SNIPPET);
                  const btn = e.currentTarget;
                  const original = btn.textContent;
                  btn.textContent = "copied!";
                  setTimeout(() => { btn.textContent = original; }, 1500);
                }}
                className="mt-2 font-['Favorit_Tumblr:Medium',sans-serif] text-[12px] px-3 py-1.5 rounded-full transition-colors"
                style={{ background: "#e9eaed", color: "#5a5757" }}
              >
                copy code
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Real work + writing snippets in the gaps, matching the reference's checkerboard
// rhythm — the "empty" cells carry a bit of writing instead of sitting blank.
// Writing tiles with an href are real posts from x.com/gentlycarved, linked back to the original.
const CELLS: Cell[] = [
  { type: "tools" },
  { type: "writing", text: "most people overthink taste, its just an instinct", href: "https://x.com/gentlycarved/status/2019074356308050205" },
  { type: "image", src: workPosterSherry, width: 825, height: 1275, caption: "book design for sherry's intro." },

  { type: "writing", text: "you will simply not improve as a designer if you don't do 100 iterations of an idea.", href: "https://x.com/gentlycarved/status/2095690790747934922" },
  { type: "image", src: workSoap, width: 1935, height: 1440, caption: "concept for gentlycarved studio + logo design" },
  { type: "image", src: filmWater, width: 1600, height: 1060, caption: FILM_CAPTION },
  { type: "image", src: workTshirt, width: 2048, height: 1372, caption: "concept t-shirt for are.na" },
  { type: "image", src: workNative, width: 1920, height: 1080, caption: "website design + identity for Native - native.works" },

  { type: "writing", text: "the interface you design becomes truly scalable when users can dream inside of it. It should be easy for them to imagine new realities inside of it.", href: "https://x.com/gentlycarved/status/1981473473978368370" },
  { type: "image", src: filmCafe, width: 1600, height: 1060, caption: FILM_CAPTION },
  { type: "image", src: workGallery, width: 2522, height: 1391, caption: "Gallery in my color palette tool - Iris" },

  { type: "writing", text: "I will always need a design canvas before working in code", href: "https://x.com/gentlycarved/status/2038664880505376825" },
  { type: "image", src: filmBoat, width: 1600, height: 1060, caption: FILM_CAPTION },
  { type: "image", src: workGeoai, width: 1455, height: 1080, caption: "Reinventing how geologists log core on a striplog interface" },
  { type: "image", src: workHalftone, width: 1786, height: 724, caption: "logo + type experiment for gentlycarved" },

  { type: "writing", text: "The Iris color tool was inspired by an 18th-century cyanometer — a device for measuring the blueness of the sky.", href: "https://x.com/gentlycarved/status/2028332716291150208" },
  { type: "image", src: filmRoad, width: 994, height: 659, caption: FILM_CAPTION },
  { type: "video", src: work03, width: 2298, height: 1248 },
  { type: "image", src: workIris, width: 1871, height: 1388, caption: "screenshot from my color palette tool - Iris" },
  { type: "image", src: filmStreet, width: 1600, height: 1060, caption: FILM_CAPTION },

  { type: "writing", text: "\"when you design interfaces you are —literally— designing the sensory organs people use to perceive information\"", href: "https://x.com/gentlycarved/status/2023526271381368924" },
  { type: "image", src: workCyanometerHistorical, width: 1802, height: 1634, caption: "use cases for my color palette tool - Iris" },

  { type: "writing", text: "\"What we call 'interface' in the context of computer technology already exists within us: a network that mediates our subjectivity, that synthesizes what we perceive and the world that is perceived.\" — Seiko Mikami (Molecular Informatics, 2004)" },
  { type: "image", src: workTrailer, width: 933, height: 419, caption: "sticker design of GeologicAI trailer/core scanner" },
  { type: "image", src: filmFresco, width: 1600, height: 1060, caption: FILM_CAPTION },
  { type: "image", src: workPosterBoard, width: 1125, height: 1019, caption: "screenshot of a random Figma file" },

  { type: "writing", text: "something so millennial-coded about seeing photorealistic & device mockups on a design portfolio (sorry)", href: "https://x.com/gentlycarved/status/2049563662898131135" },
  { type: "image", src: workCyanometer, width: 1280, height: 1137, caption: "cyanometer - the main inspiration for my color palette tool - Iris" },
  { type: "image", src: filmInterior, width: 1600, height: 1060, caption: FILM_CAPTION },
  { type: "image", src: workPosters, width: 1080, height: 1080, caption: "poster design for the Viaduct Season $ by The Toronto Society" },

  { type: "writing", text: "These flowers are Tulipa sprengeri — their survival connects to what Douthat's talk was about: what we choose to preserve.", href: "https://x.com/gentlycarved/status/2095245562584928618" },
  { type: "video", src: work04, width: 1280, height: 720 },
  { type: "image", src: filmCrowdHill, width: 994, height: 659, caption: FILM_CAPTION },

  { type: "writing", text: "AI is only as effective as your judgement, imagination and articulation.", href: "https://x.com/gentlycarved/status/1955336976531411447" },
  { type: "image", src: workBelieve, width: 825, height: 1277, caption: "Iteration of Ross Douthat book advertisement in a playbill" },

  { type: "writing", text: "we're still making chat interfaces because AI is unreliable.", href: "https://x.com/gentlycarved/status/2084455071849624051" },
  { type: "video", src: work05, width: 1280, height: 720 },

  { type: "writing", text: "sometimes I'm like, yeah well your website is beautiful because the images are beautiful", href: "https://x.com/gentlycarved/status/1937236176882061778" },
  { type: "image", src: filmPoolside, width: 1600, height: 1060, caption: FILM_CAPTION },

  { type: "writing", text: "6.5 billion for a design agency. I have so many thoughts, but I'm mostly optimistic simply because this allows designers to lead these crazy times", href: "https://x.com/gentlycarved/status/1925247370591105232" },
  { type: "image", src: workTahreemBg, width: 2529, height: 1402, caption: "landing page for my website" },

  { type: "writing", text: "if you like my work, ask me to go through a work trial and then meet me after for a chat, I feel like this would make design hiring a bit easier.", href: "https://x.com/gentlycarved/status/2058990882976645145" },
  { type: "image", src: workDesk, width: 1440, height: 1080, caption: "my desk" },

  { type: "writing", text: "Sincerely, but with a lightness of touch." },
  { type: "image", src: filmMiswak, width: 994, height: 659, caption: FILM_CAPTION },

  { type: "writing", text: "Designing for Geologists →", href: "https://x.com/gentlycarved/status/2026095227929235775" },
  { type: "image", src: workMemeticMap, width: 919, height: 1275, caption: "book design + diagram design for Luke Burgis's lecture on the \"The Three City Problem\"" },

  { type: "writing", text: "Designing for Geologists — Field Notes #2 →", href: "https://x.com/gentlycarved/status/2047497932421693589" },
  { type: "image", src: workCoretable2, width: 1706, height: 932, caption: "design for exporting logging data on an interface called \"CoreTable\"" },
  { type: "image", src: filmCeiling, width: 994, height: 659, caption: FILM_CAPTION },
  { type: "image", src: workCoretable3, width: 1301, height: 994, caption: "Logging tools for CoreTable" },
  { type: "video", src: work06, width: 3024, height: 466 },
  { type: "image", src: workPosterLuke, width: 825, height: 1275, caption: "Luke Burgis intro design in playbill." },
  { type: "image", src: filmStreetMecca, width: 994, height: 659, caption: FILM_CAPTION },
  { type: "image", src: workCrossword, width: 1007, height: 1410, caption: "Crossword design iteration for the Viaduct Season 4. by The Toronto Society." },
  { type: "video", src: work07, width: 1732, height: 1620 },
  { type: "image", src: workAlbumSingles, width: 1072, height: 1102, caption: "single cover art creative direction + design for Sam Austins" },
  { type: "image", src: filmLakeTerrace, width: 1600, height: 1060, caption: FILM_CAPTION },
  { type: "image", src: workWaxSeal, width: 968, height: 968, caption: "gentlycarved studio concept done in photoshop + logo design" },
  {
    type: "pair",
    top: { type: "image", src: workKellyEllsworth, width: 960, height: 959, caption: "Kelly Ellsworth — the inspiration behind the negative-space hover idea." },
    bottom: { type: "video", src: workNegativeSpaceButton, width: 1280, height: 720, caption: "negative-space hover interaction, inspired by the piece above." },
  },
  { type: "video", src: workSeverance, width: 1280, height: 720 },
];

function WritingCell({ text, href }: { text: string; href?: string }) {
  const color = "#5a5757";
  const content = (
    <div
      className="text-[19px] max-sm:text-[16px] leading-snug italic"
      style={{ color, fontFamily: "'Aujournuit', sans-serif" }}
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
        <img
          src={cell.src}
          alt=""
          loading="lazy"
          width={cell.width}
          height={cell.height}
          className="block w-full h-auto"
          style={{ background: cellBg, aspectRatio: cell.width && cell.height ? `${cell.width} / ${cell.height}` : undefined }}
        />
      ) : (
        <video
          src={cell.src}
          autoPlay
          muted
          loop
          playsInline
          width={cell.width}
          height={cell.height}
          className="block w-full h-auto"
          style={{ background: cellBg, aspectRatio: cell.width && cell.height ? `${cell.width} / ${cell.height}` : undefined }}
        />
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
      style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(2px)", zIndex: 95 }}
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="fixed flex items-center justify-center rounded-full"
        style={{ top: 20, right: 20, width: 36, height: 36, background: "rgba(0,0,0,0.06)", color: "#3a3a3a" }}
      >
        <X size={17} strokeWidth={2} />
      </button>
      <div className="flex flex-col items-center gap-3 max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
        {cell.type === "image" ? (
          <img
            src={cell.src}
            alt=""
            className="max-w-full max-h-full object-contain"
            style={{ borderRadius: 4, boxShadow: "0 10px 40px rgba(0,0,0,0.18)" }}
          />
        ) : (
          <video
            src={cell.src}
            controls
            autoPlay
            loop
            playsInline
            className="max-w-full max-h-full object-contain"
            style={{ borderRadius: 4, boxShadow: "0 10px 40px rgba(0,0,0,0.18)" }}
          />
        )}
        {cell.caption && (
          <div
            className="font-['Ronzino',sans-serif] text-[13px] text-center max-w-[480px]"
            style={{ color: "#5a5757" }}
          >
            {cell.caption}
          </div>
        )}
      </div>
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
  const [toolsOpen, setToolsOpen] = useState(false);

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

        <div className="grid grid-cols-[1fr_auto_1fr] items-start mb-16 px-1 gap-2 max-sm:grid-cols-1 max-sm:px-0">
          <div className="max-sm:hidden" />
          <div className="flex flex-col items-center text-center gap-2 max-w-[420px] min-w-0 max-sm:max-w-full mx-auto">
            <div className="font-['Favorit_Tumblr:Medium',sans-serif] text-[15px]" style={{ color: "#2a2a2a" }}>
              Tahreem Rehman
            </div>
            <div className="font-['Ronzino',sans-serif] text-[13px] leading-snug px-4">
              <span style={{ color: "#2a2a2a" }}>product designer who's always daydreaming on the internet.</span>
            </div>
            <div className="flex items-center justify-center gap-4 max-sm:gap-x-3 max-sm:gap-y-1 flex-wrap mt-1 px-4">
              <NavPill onClick={() => setInfoOpen(true)}>info</NavPill>
              {NAV_LINKS.map((link) => (
                <NavPill key={link.label} href={link.href}>{link.label}</NavPill>
              ))}
            </div>
          </div>
          <div className="max-sm:hidden" />
        </div>

        {infoOpen && <InfoPopover onClose={() => setInfoOpen(false)} />}

        <div className="columns-2 sm:columns-3 gap-2 max-sm:gap-1.5">
          {CELLS.map((cell, i) => (
            <div key={i} className="break-inside-avoid mb-2 max-sm:mb-1.5">
              {cell.type === "writing" ? (
                <WritingCell text={cell.text} href={cell.href} />
              ) : cell.type === "tools" ? (
                <ToolsTile onOpen={() => setToolsOpen(true)} />
              ) : cell.type === "pair" ? (
                <div className="flex flex-col gap-2 max-sm:gap-1.5">
                  <ProjectTile cell={cell.top} cellBg={cellBg} onOpen={() => setLightbox(cell.top)} />
                  <ProjectTile cell={cell.bottom} cellBg={cellBg} onOpen={() => setLightbox(cell.bottom)} />
                </div>
              ) : (
                <ProjectTile cell={cell} cellBg={cellBg} onOpen={() => setLightbox(cell)} />
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-4 max-sm:gap-x-3 max-sm:gap-y-1 flex-wrap mt-10 mb-2 px-4">
          <NavPill onClick={() => setInfoOpen(true)}>info</NavPill>
          {NAV_LINKS.map((link) => (
            <NavPill key={link.label} href={link.href}>{link.label}</NavPill>
          ))}
        </div>
      </div>

      {lightbox && <Lightbox cell={lightbox} onClose={() => setLightbox(null)} />}
      {toolsOpen && <ToolsModal onClose={() => setToolsOpen(false)} />}
    </div>
  );
}
