import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import workGeoai from "../../assets/portfolio/work-geoai.png";
import workTrailer from "../../assets/portfolio/work-trailer.png";
import workCoretable2 from "../../assets/portfolio/work-coretable-2.png";
import workCoretable3 from "../../assets/portfolio/work-coretable-3.png";
import workCoretableDrillholes from "../../assets/portfolio/work-coretable-drillholes.png";
import workCoretableMineralMap from "../../assets/portfolio/work-coretable-mineral-map.webp";
import work06 from "../../assets/portfolio/work-06.mov";
import workMineralogy from "../../assets/portfolio/work-mineralogy.mov";
import workIris from "../../assets/portfolio/work-iris.jpg";
import workGallery from "../../assets/portfolio/work-gallery.jpg";
import workCyanometer from "../../assets/portfolio/work-cyanometer.jpeg";
import workCyanometerHistorical from "../../assets/portfolio/work-cyanometer-historical.gif";
import workNative from "../../assets/portfolio/work-native.jpg";
import workNativeMontage from "../../assets/portfolio/work-native-montage.gif";

type MediaDef = { type: "image" | "video"; src: string; width: number; height: number };

export const CASE_STUDY_MEDIA = {
  workGeoai: { type: "image", src: workGeoai, width: 1455, height: 1080 },
  workTrailer: { type: "image", src: workTrailer, width: 933, height: 419 },
  workCoretable3: { type: "image", src: workCoretable3, width: 1301, height: 994 },
  workCoretableDrillholes: { type: "image", src: workCoretableDrillholes, width: 1724, height: 1024 },
  workCoretableMineralMap: { type: "image", src: workCoretableMineralMap, width: 1782, height: 1107 },
  workMineralogy: { type: "video", src: workMineralogy, width: 1732, height: 706 },
  workCoretable2: { type: "image", src: workCoretable2, width: 1706, height: 932 },
  work06: { type: "video", src: work06, width: 3024, height: 466 },
  workCyanometer: { type: "image", src: workCyanometer, width: 1280, height: 1137 },
  workIris: { type: "image", src: workIris, width: 1871, height: 1388 },
  workCyanometerHistorical: { type: "image", src: workCyanometerHistorical, width: 1802, height: 1634 },
  workGallery: { type: "image", src: workGallery, width: 2522, height: 1391 },
  workNativeMontage: { type: "image", src: workNativeMontage, width: 1920, height: 1080 },
  workNative: { type: "image", src: workNative, width: 2522, height: 592 },
} satisfies Record<string, MediaDef>;

export type CaseStudyItemDef = { media: keyof typeof CASE_STUDY_MEDIA; caption?: string } | { link: string; text: string };
export type CaseStudySectionDef = { heading: string; items: CaseStudyItemDef[] };

// Content and order of each case study. /captions edits these and exports replacements.
export const CORETABLE_SECTIONS: CaseStudySectionDef[] = [
  {
    heading: "the platform",
    items: [
      { media: "workGeoai", caption: "Early prototype used to explore the overall layout, information hierarchy, and core-logging workflow of CoreTable Lite, helping validate how users would navigate the interface, view core data, and record geological observations." },
      { media: "workTrailer", caption: "sticker design of GeologicAI trailer/core scanner" },
    ],
  },
  { heading: "logging core", items: [{ media: "workCoretable3", caption: "Users can log geological information on the Striplog by dragging rectangles over specific depth intervals and applying attributes such as lithology, grain size, colour, alteration, mineralization, structures, and other core observations to each interval." }] },
  { heading: "drillholes", items: [{ media: "workCoretableDrillholes", caption: "Managing drillholes across projects in CoreTable while integrating with RMS, a separate software used for 3D modelling and visualizing core data." }] },
  {
    heading: "mineral mapping",
    items: [
      { media: "workCoretableMineralMap", caption: "Allows geologists to view mineral distribution directly over scanned core, making it easier to correlate mineralization with visible geological features, identify patterns across intervals, and make more informed interpretations without switching between separate datasets." },
      { media: "workMineralogy", caption: "selecting mineralization zones directly on the core scan" },
    ],
  },
  { heading: "exporting", items: [{ media: "workCoretable2", caption: "Designing the export workflow for logging data, allowing geologists to select the information they need and export it in a format that can be used for analysis and downstream geological workflows." }] },
  { heading: "what's next", items: [{ media: "work06", caption: "an early look at where the AI mining tools are headed" }] },
  {
    heading: "field notes",
    items: [
      { link: "https://x.com/gentlycarved/status/2026095227929235775", text: "Designing for Geologists →" },
      { link: "https://x.com/gentlycarved/status/2047497932421693589", text: "Designing for Geologists — Field Notes #2 →" },
    ],
  },
];

export const IRIS_SECTIONS: CaseStudySectionDef[] = [
  {
    heading: "the inspiration",
    items: [
      { media: "workCyanometer", caption: "cyanometer - the main inspiration for my color palette tool - Iris" },
      { link: "https://x.com/gentlycarved/status/2028332716291150208", text: "The Iris color tool was inspired by an 18th-century cyanometer — a device for measuring the blueness of the sky." },
    ],
  },
  { heading: "the tool", items: [{ media: "workIris", caption: "screenshot from my color palette tool - Iris" }] },
  { heading: "palettes in use", items: [{ media: "workCyanometerHistorical", caption: "Examples of Iris, a colour palette exploration tool, showing how users can create, refine, and apply colour palettes across different visual and creative projects." }] },
  { heading: "gallery", items: [{ media: "workGallery", caption: "Gallery design for Iris, a tool for exploring and generating colour palettes." }] },
  { heading: "try it", items: [{ link: "/iris", text: "open Iris →" }] },
];

export const NATIVE_SECTIONS: CaseStudySectionDef[] = [
  { heading: "the website", items: [{ media: "workNativeMontage", caption: "website design + identity for Native - native.works" }] },
  { heading: "the identity", items: [{ media: "workNative" }] },
  { heading: "visit", items: [{ link: "https://native.works", text: "native.works →" }] },
];

export const CASE_STUDIES: Record<string, { title: string; subtitle: string; tagline: string; sections: CaseStudySectionDef[] }> = {
  coretable: { title: "CoreTable", subtitle: "GeologicAI", tagline: "reinventing how geologists log core", sections: CORETABLE_SECTIONS },
  iris: { title: "Iris", subtitle: "colour palette tool", tagline: "a tool for exploring and generating colour palettes", sections: IRIS_SECTIONS },
  native: { title: "Native", subtitle: "native.works", tagline: "website design + identity", sections: NATIVE_SECTIONS },
};

type Media = MediaDef & { caption?: string };
type Link = { type: "link"; text: string; href: string };
type Item = Media | Link;

const resolve = (sections: CaseStudySectionDef[]): { heading: string; items: Item[] }[] =>
  sections.map((s) => ({
    heading: s.heading,
    items: s.items.map((it): Item =>
      "media" in it ? { ...CASE_STUDY_MEDIA[it.media], caption: it.caption } : { type: "link", text: it.text, href: it.link },
    ),
  }));

const keyOf = (item: Item) => (item.type === "link" ? item.href : item.src);

/** Where the visitor entered from: the clicked item's key (media src or link href) and where it sat on screen. */
export type CaseStudyEntry = { study: string; key: string; rect: DOMRect | null };

const EASE = "cubic-bezier(0.22, 0.8, 0.24, 1)";

/**
 * A case study as one long page layered over the portfolio. It opens already
 * scrolled to the section the visitor came from and simply fades in over the
 * blurred-back portfolio.
 */
export function CaseStudy({ entry, onClose }: { entry: CaseStudyEntry; onClose: () => void }) {
  const study = CASE_STUDIES[entry.study];
  const SECTIONS = resolve(study.sections);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  const [closing, setClosing] = useState(false);
  const reduceMotion = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Open at the entry's section, before the first paint.
  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    const target = scroller?.querySelector<HTMLElement>(`[data-cs-key="${CSS.escape(entry.key)}"]`);
    if (!scroller || !target) { setShown(true); return; }
    const r = target.getBoundingClientRect();
    scroller.scrollTop += r.top + r.height / 2 - window.innerHeight / 2;
    requestAnimationFrame(() => setShown(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function close() {
    if (closing) return;
    setClosing(true);
    setShown(false);
    setTimeout(onClose, reduceMotion ? 0 : 380);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closing]);

  const dur = reduceMotion ? 0 : 520;
  const font = "font-['Areal',sans-serif] font-medium";

  return (
    <div className="fixed inset-0" style={{ zIndex: 110 }}>
      {/* The portfolio, blurred and washed back */}
      <div
        className="absolute inset-0"
        style={{
          background: "rgba(250,250,250,0.72)",
          backdropFilter: "blur(18px) saturate(0.9)",
          WebkitBackdropFilter: "blur(18px) saturate(0.9)",
          opacity: shown ? 1 : 0,
          transition: `opacity ${dur}ms ${EASE}`,
        }}
      />

      <div
        ref={scrollerRef}
        className="absolute inset-0 overflow-y-auto"
        style={{ overscrollBehavior: "contain" }}
      >
        <div
          className="max-w-[760px] mx-auto px-6 max-sm:px-4 pt-[18vh] pb-[24vh]"
          style={{
            opacity: shown ? 1 : 0,
            transition: `opacity ${dur}ms ${EASE}`,
          }}
        >
          <header className="text-center mb-24 max-sm:mb-16">
            <div className="font-['Areal',sans-serif] text-[12px] tracking-[0.15em] uppercase" style={{ color: "#a8a4a4" }}>
              {study.subtitle}
            </div>
            <h2 className="font-['Areal',sans-serif] text-[34px] max-sm:text-[26px] leading-tight mt-2" style={{ color: "#2a2a2a" }}>
              {study.title}
            </h2>
            <p className="font-['Areal',sans-serif] text-[15px] mt-2" style={{ color: "#5a5757" }}>
              {study.tagline}
            </p>
          </header>

          {SECTIONS.map((section) => (
            <section key={section.heading} className="mb-28 max-sm:mb-20">
              <div className="font-['Areal',sans-serif] text-[12px] tracking-[0.15em] uppercase mb-5" style={{ color: "#a8a4a4" }}>
                {section.heading}
              </div>
              <div className="flex flex-col gap-12 max-sm:gap-9">
                {section.items.map((item) =>
                  item.type === "link" ? (
                    <a
                      key={item.href}
                      data-cs-key={item.href}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-['Aujournuit',sans-serif] italic text-[24px] max-sm:text-[19px] leading-snug hover:opacity-70 transition-opacity"
                      style={{ color: "#5a5757" }}
                    >
                      {item.text}
                    </a>
                  ) : (
                    <figure key={item.src} className="flex flex-col gap-3">
                      <MediaView media={item} csKey={keyOf(item)} />
                      {item.caption && (
                        <figcaption className="font-['Areal',sans-serif] text-[14px] text-center" style={{ color: "#5a5757" }}>
                          {item.caption}
                        </figcaption>
                      )}
                    </figure>
                  ),
                )}
              </div>
            </section>
          ))}

          <div className="flex justify-center">
            <button
              type="button"
              onClick={close}
              className={`${font} text-[14px] px-5 py-2.5 rounded-full`}
              style={{ background: "#2a2a2a", color: "#fff" }}
            >
              back to the portfolio
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={close}
        aria-label="Close case study"
        className="absolute flex items-center justify-center rounded-full"
        style={{
          top: 16, right: 16, width: 36, height: 36,
          background: "rgba(0,0,0,0.07)", color: "#3a3a3a",
          opacity: shown ? 1 : 0, transition: `opacity ${dur}ms ${EASE}`,
        }}
      >
        <X size={17} strokeWidth={2} />
      </button>
    </div>
  );
}

function MediaView({ media, csKey }: { media: Media; csKey: string }) {
  const common = {
    "data-cs-key": csKey,
    className: "block w-full h-auto rounded-[4px]",
    style: {
      aspectRatio: `${media.width} / ${media.height}`,
      boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
    },
  };
  return media.type === "image"
    ? <img src={media.src} alt="" width={media.width} height={media.height} {...common} />
    : <video src={media.src} autoPlay muted loop playsInline width={media.width} height={media.height} {...common} />;
}
