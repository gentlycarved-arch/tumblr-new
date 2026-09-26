import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";

// Arms run up under the head and hands tuck behind the decks, so each part can move without detaching.
const HEAD_FILL = "M380 76l-16 5-8 6-15 15-11 16-9 20-9 26-4 20-5 36 1 62 8 46 5 16 11 26 0 2-4 4-26 14-20 15-18 18-15 23-5 11-20 9-14 14-11 18-5 18-2 20 3 18 9 22 16 19 16 8 12 3 12 0 4 1 23 33 21 22 4 7 6 3 18 13 32 17 34 13 28 6 20 3 36 1 24-2 24-4 34-10 34-15 16-10 6-1 4-6 10-8 25-25 20-28 3-2 12-1 12-3 16-9 7-7 7-10 7-16 4-20-1-22-3-12-7-16-9-12-16-14-8-26-14-22-27-25-32-22 1-7 8-18 6-20 6-28 4-36 0-40-1-16-6-34-9-32-14-30-14-18-11-10-14-8-22-1-12 3-10 7-10 9-12 16-10 18-9 24-6 22-6 34-1 18 1 56 10 54-5 5-32-1-4-3 0-5 7-28 4-30 1-50-5-44-9-34-9-24-9-16-8-10-9-9-17-12-10-3z";
const HEAD_INK = "M443 648l-2 4 1 4 3 3 7 3 1 2-3 2-8 4-3 2-1 2-1 4 1 3 2 2 4 1 3-1 9-4 12-6 3 1 8 6 6 3 4-1 4-2 1-3-1-3-7-9 1-1 6-4 2-3 0-4-3-3-4-2-4 1-15 7-7-5-12-5-3 0zM585 567l-5 0-6 3-2 2-3 7 0 6 3 6 8 4 6 0 7-3 4-7 0-7-4-6zM353 564l-7 4-2 1-3 7 0 6 3 6 2 2 7 3 6-1 7-4 3-6 0-7-4-7-7-3zM380 72l-3 1-3 0-3 2-2 0-8 4-6 4-17 17-13 20 0 4-3 4 0 2-3 3-5 12 0 4-2 4-1 3-1 2-4 17-4 24 0 8-3 13 0 53 1 3 1 10 2 16 6 27 2 6 2 9 3 4 0 4 3 4 0 3 6 13-3 2-18 9-28 19-24 25-8 13-4 8-2 7-4 2-4 0-16 9-12 13-4 7-2 1-5 9-5 20 0 6-1 3 0 14 1 4 0 6 2 4-1 2 3 8 6 14 2 2 1 2 1 2 2 3 12 12 17 9 3 0 2 1 4 0 4 2 9 0 3-2 3 1 2 2 5 10 3 3 4 8 6 8 3 3 3 4 15 16 3 4 16 12 11 8 15 9 20 10 18 8 20 6 20 4 17 3 33 2 31-2 33-6 24-7 20-8 23-12 1-2 8-4 12-5 1-2 0-1 0-1 9-7 27-27 15-20 4-8 2 0 11 0 12-3 9-4 9-6 8-9 9-12 4-10 3-9 0-4 2-3 0-3 1-6 0-15-1-3-2-13-5-13-1-2-9-15-9-9-10-7-1-4 0-4-2-3 0-3-5-12-5-8-3-8-2-2-3-4-19-20-4-2-5-4-18-12-13-7-2-2 2-6 8-17 7-19 1-11 3-9 0-5 2-3 0-6 1-2 0-9 2-3 0-11 1-7 0-39-1-8 0-9-2-6 0-5-1-4 0-5-2-3-1-12-7-23-6-17-5-11-7-12-12-17-8-8-14-9-13-5-16 0-11 3-9 5-6 4-9 9-13 18-9 16-8 21-6 18-2 10-1 4 0 5-2 4 0 4-1 4 0 6-2 5 0 11-1 5 0 42 1 11 0 7 2 4 0 7 1 2 0 6 3 11 0 5 2 2 3 17-1 1-33 0-2-2 4-11 2-9 2-9 0-4 3-13 0-6 2-17 1-37-3-35-4-23-3-8 0-4-1-2-2-9-12-29-7-14-9-13-17-15-12-7-11-3zM625 387l3-1 12 5 2 3 12 6 4 4 2 1 4 4 2 1 16 16 8 9 2 5 3 3 6 15 0 3 2 3-1 2-5 0-2-1-6 0-2-2-3-5-2-3-5-10-6-8-4-6-7-8-23-23-12-10-1-1zM331 381l-1 2-21 15-21 21-14 17-5 8-4 8-3 3-6 1-3-2-4 0 0-2 6-12 2-3 1-2 12-15 5-4 8-8 3-1 9-8 11-6 23-12zM376 84l9-2 6 0 6 2 11 5 7 5 6 6 8 9 7 12 4 8 6 14 8 24 6 26 3 24 1 30-1 28-3 23-5 23-5 19-6 12 1 1 29-2 23 2 15 2 1-1-2-4-5-12-6-23-3-19-3-29 0-16 0-16 2-21 4-31 6-23 6-16 6-14 7-12 10-13 7-7 11-8 7-3 8-2 7 0 8 2 12 6 6 5 12 13 7 10 11 23 7 22 8 34 3 33 0 28-3 34-3 19-5 18-7 22-11 22-4 6-7 9 1 1 17 13 13 11 8 9 14 17 8 11 7 14 9 22 3 12 3 15 1 22-1 14-1 11-3 13-5 13-6 13-7 15-14 19-16 18-13 11-10 8-22 14-18 9-10 5-27 9-29 6-14 1-23 2-26-2-14-1-30-7-21-7-19-7-17-10-14-8-12-9-16-14-10-11-15-18-10-18-9-21-5-14-3-17-1-18 1-23 3-15 3-11 8-18 4-10 7-12 11-14 7-9 22-20 12-10 14-9 1-1-8-13-8-15-8-21-5-22-3-15-3-24-2-31 2-27 3-24 4-22 5-15 11-27 4-9 7-11 11-13 10-8z";
const LEFT_ARM = "M352 644C348.5 646 338 652 331 656C324 660 317 664 310 668C303 672 295.7 676.3 289 680C282.3 683.7 274.6 687.5 269.9 690C265.1 692.5 263.2 693.5 260.5 695.2C257.8 696.9 255.2 698.3 253.5 700C251.8 701.7 250.6 703.5 250 705.5C249.4 707.5 249.8 710.9 249.8 712";
const LEFT_HAND = "M205 800C204.9 798 204.7 791.8 204.5 788C204.3 784.2 204.2 780 204 777C203.8 774 203.2 772.5 203 770C202.8 767.5 202.5 764.3 202.5 762C202.5 759.7 202.7 757.8 203 756C203.3 754.2 203.7 752.8 204.5 751C205.3 749.2 206.8 746.8 208.1 745C209.4 743.2 210.5 741.7 212.1 740C213.7 738.3 215.8 736.7 217.9 735C220 733.3 222 731.7 224.5 730C227 728.3 230.1 727 233 725C235.9 723 239.2 720.2 242 718C244.8 715.8 248.5 713 249.8 712C250.8 713.1 253.7 716.3 255.5 718.5C257.3 720.7 259.2 723.1 260.5 725C261.8 726.9 262.5 728.3 263.4 730C264.3 731.7 265.1 733.3 265.9 735C266.7 736.7 267.4 738.3 268.1 740C268.8 741.7 269.3 743.2 270 745C270.7 746.8 271.8 749.2 272.5 751C273.2 752.8 273.6 754.3 274.2 756C274.8 757.7 275.3 759.3 275.8 761C276.3 762.7 276.7 764.3 277.2 766C277.7 767.7 278.5 769.2 279 771C279.5 772.8 279.9 774.2 280.3 777C280.7 779.8 280.9 784.2 281.2 788C281.5 791.8 281.9 798 282 800";
const RIGHT_ARM = "M592 659C594.4 661.1 601.7 667.3 606.5 671.5C611.3 675.7 617.3 680.9 621 684C624.7 687.1 625.3 687.3 628.5 690C631.7 692.7 636.4 696.7 640.4 700C644.4 703.3 648.4 706.7 652.4 710C656.4 713.3 661.4 717.2 664.4 720C667.4 722.8 668.9 724.7 670.5 726.5C672.1 728.3 673.1 729.4 673.8 731C674.5 732.6 674.8 733.8 674.5 736C674.2 738.2 672.7 741.3 672 744C671.3 746.7 670.8 747.7 670.5 752C670.2 756.3 670.5 767 670.5 770";
const RIGHT_HAND = "M674.5 736C675.4 737 678.1 740.2 680 741.8C681.9 743.4 684.2 744.3 686 745.6C687.8 746.9 689.4 748.1 691 749.6C692.6 751.1 694.2 752.8 695.5 754.5C696.8 756.2 698 758.1 699 760C700 761.9 700.9 764 701.5 766C702.1 768 702.5 769.7 702.5 772C702.5 774.3 702.3 777 701.6 780C700.9 783 699.9 786.7 698.5 790C697.1 793.3 694.9 797.3 693.5 800C692.1 802.7 691 803 690 806C689 809 687.9 816 687.5 818";
const RIGHT_HAND_FILL = "M674.5 736C675.4 737 678.1 740.2 680 741.8C681.9 743.4 684.2 744.3 686 745.6C687.8 746.9 689.4 748.1 691 749.6C692.6 751.1 694.2 752.8 695.5 754.5C696.8 756.2 698 758.1 699 760C700 761.9 700.9 764 701.5 766C702.1 768 702.5 769.7 702.5 772C702.5 774.3 702.3 777 701.6 780C700.9 783 699.9 786.7 698.5 790C697.1 793.3 694.9 797.3 693.5 800C692.1 802.7 691 803 690 806C689 809 687.9 816 687.5 818L660 818L660 736Z";
const NOTES = [
  "M-18.3 21.8A11 8.5 -20 1 1 2.3 14.2A11 8.5 -20 1 1 -18.3 21.8ZM0.8 15V-30h4.5V15zM5.3 -30c1.5 8 13 11 13 22 0 4-1.5 7-3 9 1-6-1-11-10-14z",
  "M-27.3 23.8A11 8.5 -20 1 1 -6.7 16.2A11 8.5 -20 1 1 -27.3 23.8ZM2.7 17.8A11 8.5 -20 1 1 23.3 10.2A11 8.5 -20 1 1 2.7 17.8ZM-8.5 18V-24h4.5V18zM21.3 12V-30h4.5V12zM-8.5 -24L25.8 -31V-22L-8.5 -15z",
];

// Two-tone gradients from the Motherlode poster: sunset, sky, pink stone, teal meadow, amber, plum.
const NOTE_GRADIENTS = [
  ["#ee5a2b", "#f7b23e"],
  ["#2f7ee0", "#9ea9f6"],
  ["#e06aae", "#b8a4f0"],
  ["#1fa39a", "#8cbc42"],
  ["#f39a35", "#f5cf55"],
  ["#3b2a6b", "#7c6cdb"],
];
const noteFill = (i: number) => `url(#mdj-note-${i % NOTE_GRADIENTS.length})`;
const LINE = { stroke: "#000", strokeLinecap: "round", strokeLinejoin: "round" } as const;
// [x, y, drift] in drawing units: off the speakers, records, keys, laptop and ear cups.
const AMBIENT: [number, number, number][] = [
  [-609, 566, -44],
  [60, 748, -46],
  [-312, 712, -30],
  [196, 500, -52],
  [1648, 566, 44],
  [1010, 754, 46],
  [1351, 598, 30],
  [750, 506, 52],
];
const EAR_CUPS: [number, number][] = [[196, 512], [748, 518]];
// Teaser notes over the grid: [left %, delay s, duration s, sway px].
const TEASERS: [number, number, number, number][] = [
  [8, 1.5, 18, 22],
  [71, 5, 20, -26],
  [29, 8.5, 19, 18],
  [90, 12, 21, -22],
  [52, 15.5, 18.5, 26],
];
const STAGGER = 550;
const LAND = 1600;
const REVEAL = 450;

const CSS = `
  .mdj-head { animation: mdj-bop 0.55s infinite; }
  .mdj-rh { animation: mdj-press 0.55s infinite; }
  .mdj-lh { animation: mdj-scratch 1.1s ease-in-out infinite; }
  .mdj-float { animation: mdj-float 4.4s ease-in-out infinite both; }
  @keyframes mdj-bop {
    0%, 100% { transform: translateY(0); animation-timing-function: cubic-bezier(.45, 0, .75, .6); }
    38% { transform: translateY(18px); animation-timing-function: cubic-bezier(.25, .45, .45, 1); }
  }
  @keyframes mdj-press {
    0%, 100% { transform: translateY(0); animation-timing-function: cubic-bezier(.45, 0, .75, .6); }
    38% { transform: translateY(6px); animation-timing-function: cubic-bezier(.25, .45, .45, 1); }
  }
  @keyframes mdj-scratch {
    0%, 24%, 50%, 100% { transform: translateX(0); }
    12%, 36% { transform: translateX(13px); }
    75% { transform: translateX(11px); }
  }
  @keyframes mdj-float {
    0% { transform: translate(0, 0) scale(.3); opacity: 0; }
    12% { transform: translate(calc(var(--drift) * .12), -28px) scale(1) rotate(-12deg); opacity: 1; }
    40% { transform: translate(calc(var(--drift) * .5), -110px) rotate(10deg); }
    62% { opacity: .9; }
    75%, 100% { transform: translate(var(--drift), -230px) rotate(-6deg); opacity: 0; }
  }
  .mdj-rise { position: absolute; bottom: 0; animation: mdj-rise linear infinite both; }
  .mdj-sway { display: block; animation: mdj-sway 2.6s ease-in-out infinite alternate; }
  @keyframes mdj-rise {
    0% { transform: translateY(40px); opacity: 0; }
    5%, 55% { opacity: 1; }
    60%, 100% { transform: translateY(calc(-100vh - 60px)); opacity: 0; }
  }
  @keyframes mdj-sway {
    from { transform: translateX(calc(var(--sway) * -1)) rotate(-10deg); }
    to { transform: translateX(var(--sway)) rotate(10deg); }
  }
  @keyframes mdj-fly {
    0% { transform: translate(var(--dx), var(--dy)) scale(.4); opacity: 0; animation-timing-function: ease-out; }
    10% { transform: translate(calc(var(--dx) * .92), calc(var(--dy) * .9)) rotate(-10deg); opacity: 1; animation-timing-function: ease-in-out; }
    38% { transform: translate(calc(var(--dx) * .6 + 16px), calc(var(--dy) * .58)) rotate(9deg); animation-timing-function: ease-in-out; }
    64% { transform: translate(calc(var(--dx) * .25 - 12px), calc(var(--dy) * .24)) rotate(-7deg); animation-timing-function: ease-out; }
    82% { transform: none; opacity: 1; }
    100% { transform: scale(.2); opacity: 0; }
  }
  @keyframes mdj-reveal {
    from { opacity: 0; transform: scale(.6); filter: blur(4px); visibility: hidden; }
    to { opacity: 1; transform: none; filter: none; visibility: visible; }
  }
  @media (prefers-reduced-motion: reduce) {
    .mdj-head, .mdj-rh, .mdj-lh, .mdj-float { animation: none; }
  }
`;

// Gradients and the glow live in MiffyDJ's <defs>, which is always mounted alongside these.
function Note({ i, className, style }: { i: number; className: string; style?: CSSProperties }) {
  return (
    <svg viewBox="-34 -37 68 72" className={className} style={{ overflow: "visible", ...style }}>
      <path d={NOTES[i % 2]} fill={noteFill(i)} filter="url(#mdj-glow)" />
    </svg>
  );
}

function TeaserNotes({ fading, onFaded }: { fading: boolean; onFaded: () => void }) {
  return (
    <div
      aria-hidden
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 85, opacity: fading ? 0 : 1, transition: "opacity 800ms ease" }}
      onTransitionEnd={onFaded}
    >
      {TEASERS.map(([left, delay, duration, sway], i) => (
        <span key={i} className="mdj-rise" style={{ left: `${left}%`, animationDelay: `${delay}s`, animationDuration: `${duration}s` }}>
          <Note i={i} className="mdj-sway w-7 h-[30px]" style={{ "--sway": `${sway}px` } as CSSProperties} />
        </span>
      ))}
    </div>
  );
}

function MiffyDJ({ svgRef, ambientDelay }: { svgRef: RefObject<SVGSVGElement>; ambientDelay: number | null }) {
  return (
    <svg
      ref={svgRef}
      viewBox="-700 60 2439 824"
      preserveAspectRatio="xMidYMax slice"
      className="block w-full aspect-[2439/824] max-sm:aspect-[1300/824]"
      role="img"
      aria-label="Miffy DJing at a long table of turntables, keys, a laptop and speakers"
    >
      <style>{CSS}</style>
      <defs>
        {NOTE_GRADIENTS.map(([from, to], i) => (
          <linearGradient key={i} id={`mdj-note-${i}`} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor={from} />
            <stop offset="1" stopColor={to} />
          </linearGradient>
        ))}
        <filter id="mdj-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="7" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect x="-680" y="856" width="40" height="27.5" />
      <rect x="-578" y="856" width="40" height="27.5" />
      <rect x="-689.25" y="594.75" width="160.5" height="262.5" fill="#d9d9d9" stroke="#000" strokeWidth="9.5" />
      <circle cx="-609" cy="775" r="56" fill="#292929" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="9.5" />
      <circle cx="-609" cy="775" r="17" fill="#d9d9d9" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="7" />
      <circle cx="-609" cy="662" r="25" fill="#292929" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="9.5" />
      <circle cx="-609" cy="662" r="6" fill="#d9d9d9" />
      <rect x="-470" y="856" width="40" height="27.5" />
      <rect x="-194" y="856" width="40" height="27.5" />
      <rect x="-470" y="736" width="316" height="60" fill="#d9d9d9" stroke="#000" strokeWidth="9.5" />
      <rect x="-448" y="750" width="70" height="22" fill="#292929" />
      <circle cx="-342" cy="761" r="9" />
      <circle cx="-298" cy="761" r="9" />
      <circle cx="-254" cy="761" r="9" />
      <circle cx="-210" cy="761" r="9" />
      <path d="M-462 781L-162 781L-146 810L-478 810Z" fill="#fff" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="9.5" />
      <line x1="-434.7" y1="781" x2="-434.7" y2="810" stroke="#000" strokeWidth="3.5" />
      <line x1="-407.5" y1="781" x2="-407.5" y2="810" stroke="#000" strokeWidth="3.5" />
      <line x1="-380.2" y1="781" x2="-380.2" y2="810" stroke="#000" strokeWidth="3.5" />
      <line x1="-352.9" y1="781" x2="-352.9" y2="810" stroke="#000" strokeWidth="3.5" />
      <line x1="-325.6" y1="781" x2="-325.6" y2="810" stroke="#000" strokeWidth="3.5" />
      <line x1="-298.4" y1="781" x2="-298.4" y2="810" stroke="#000" strokeWidth="3.5" />
      <line x1="-271.1" y1="781" x2="-271.1" y2="810" stroke="#000" strokeWidth="3.5" />
      <line x1="-243.8" y1="781" x2="-243.8" y2="810" stroke="#000" strokeWidth="3.5" />
      <line x1="-216.5" y1="781" x2="-216.5" y2="810" stroke="#000" strokeWidth="3.5" />
      <line x1="-189.3" y1="781" x2="-189.3" y2="810" stroke="#000" strokeWidth="3.5" />
      <rect x="-441.7" y="781" width="14" height="17" />
      <rect x="-414.5" y="781" width="14" height="17" />
      <rect x="-359.9" y="781" width="14" height="17" />
      <rect x="-332.6" y="781" width="14" height="17" />
      <rect x="-305.4" y="781" width="14" height="17" />
      <rect x="-250.8" y="781" width="14" height="17" />
      <rect x="-223.5" y="781" width="14" height="17" />
      <rect x="-487.25" y="810" width="350.5" height="47" fill="#d9d9d9" stroke="#000" strokeWidth="9.5" />
      <rect x="1188" y="856" width="45" height="27.5" />
      <rect x="1469" y="856" width="45" height="27.5" />
      <rect x="1175.75" y="810" width="350.5" height="47" fill="#d9d9d9" stroke="#000" strokeWidth="9.5" />
      <rect x="1231" y="826" width="26" height="14" />
      <rect x="1445" y="826" width="26" height="14" />
      <path d="M1215 788L1487 788L1505 810L1197 810Z" fill="#d9d9d9" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="9.5" />
      <rect x="1229" y="622" width="244" height="164" fill="#292929" stroke="#000" strokeWidth="9.5" />
      <polyline points="1251 661 1258 671 1265 650 1272 682 1279 657 1286 675 1293 644 1300 688 1307 654 1314 678 1321 640 1328 692 1335 658 1342 674 1349 648 1356 684 1363 660 1370 672 1377 642 1384 690 1391 653 1398 679 1405 646 1412 686 1419 659 1426 673 1433 651 1440 681 1447 661 1454 671" fill="none" stroke="#d9d9d9" strokeWidth="4" strokeLinejoin="round" />
      <polyline points="1251 732 1258 752 1265 720 1272 764 1279 736 1286 748 1293 725 1300 759 1307 717 1314 767 1321 733 1328 751 1335 723 1342 761 1349 730 1356 754 1363 715 1370 769 1377 735 1384 749 1391 726 1398 758 1405 721 1412 763 1419 734 1426 750 1433 728 1440 756 1447 732 1454 752" fill="none" stroke="#d9d9d9" strokeWidth="4" strokeLinejoin="round" />
      <line x1="1351" y1="636" x2="1351" y2="772" stroke="#fff" strokeWidth="5" />
      <rect x="1577" y="856" width="40" height="27.5" />
      <rect x="1679" y="856" width="40" height="27.5" />
      <rect x="1567.75" y="594.75" width="160.5" height="262.5" fill="#d9d9d9" stroke="#000" strokeWidth="9.5" />
      <circle cx="1648" cy="775" r="56" fill="#292929" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="9.5" />
      <circle cx="1648" cy="775" r="17" fill="#d9d9d9" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="7" />
      <circle cx="1648" cy="662" r="25" fill="#292929" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="9.5" />
      <circle cx="1648" cy="662" r="6" fill="#d9d9d9" />
      <path d="M701 784.3L1055.5 784.3L1080 810.5L680 810.5Z" fill="#292929" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="9.5" />
      <g className="mdj-lh">
        <path d={LEFT_ARM} fill="none" strokeWidth={10.5} {...LINE} />
        <path d={LEFT_HAND} fill="#fff" strokeWidth={10.5} {...LINE} />
      </g>
      <g className="mdj-rh">
        <path d={RIGHT_ARM} fill="none" strokeWidth={10.5} {...LINE} />
        <path d={RIGHT_HAND_FILL} fill="#fff" />
        <path d={RIGHT_HAND} fill="none" strokeWidth={10.5} {...LINE} />
      </g>
      <g className="mdj-head">
        <path d={HEAD_FILL} fill="#fff" />
        <path d={HEAD_INK} fillRule="evenodd" />
      </g>
      <path d="M-70 759L131 755.8L162.5 782" fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="9" />
      <rect x="-98" y="741.5" width="50" height="36" />
      <rect x="-57.5" y="776" width="9.5" height="32" />
      <path d="M650 757.5L838 757.5L870 784.5" fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="10" />
      <rect x="624.5" y="736.5" width="51" height="37" />
      <rect x="666.5" y="772" width="10" height="36" />
      <path d="M-12.599999999999994 780.5L325.8 780.5L349.3 810L-33.099999999999994 810Z" fill="#292929" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="9.5" />
      <rect x="-78.5" y="856" width="45" height="27.5" />
      <rect x="342.5" y="856" width="45" height="27.5" />
      <rect x="644" y="856" width="44.5" height="27.5" />
      <rect x="1073" y="856" width="44.5" height="27.5" />
      <rect x="-95.2" y="810" width="505.8" height="47" fill="#d9d9d9" stroke="#000" strokeWidth="9.5" />
      <rect x="626.8" y="810.5" width="507.5" height="47" fill="#d9d9d9" stroke="#000" strokeWidth="9" />
      <rect x="450" y="860" width="35" height="23.5" />
      <rect x="562" y="860" width="34.5" height="23" />
      <rect x="436" y="800" width="170" height="64.5" />
      <rect x="442" y="759.5" width="35.5" height="37" />
      <rect x="503" y="758" width="35.5" height="38.5" />
      <rect x="564.5" y="758" width="36.5" height="38.5" />
      <rect x="424.5" y="793.5" width="193" height="12" />
      <rect x="452.5" y="770" width="13.5" height="19" fill="#d9d9d9" />
      <rect x="513" y="770" width="14" height="18" fill="#d9d9d9" />
      <rect x="575.5" y="769.5" width="14.5" height="18" fill="#d9d9d9" />
      {ambientDelay !== null &&
        AMBIENT.map(([x, y, drift], i) => (
          <g key={i} transform={`translate(${x} ${y})`}>
            <path
              d={NOTES[i % 2]}
              className="mdj-float"
              fill={noteFill(i)}
              filter="url(#mdj-glow)"
              style={{ "--drift": `${drift}px`, animationDelay: `${ambientDelay + i * 550}ms` } as CSSProperties}
            />
          </g>
        ))}
    </svg>
  );
}

/** Miffy's DJ table as the page footer. When it scrolls into view, notes float up out of her
 * headphones and turn into the footer links one by one, then keep drifting up while she plays. */
export function MiffyFooter({ links }: { links: ReactNode[] }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const slotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [flights, setFlights] = useState<{ dx: number; dy: number }[] | null>(null);
  const [instant, setInstant] = useState(false);
  const [teaserGone, setTeaserGone] = useState(() => matchMedia("(prefers-reduced-motion: reduce)").matches);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const ctm = svgRef.current?.getScreenCTM();
        if (!ctm || matchMedia("(prefers-reduced-motion: reduce)").matches) {
          setInstant(true);
          return;
        }
        setFlights(
          slotRefs.current.map((slot, i) => {
            const r = slot!.getBoundingClientRect();
            const p = new DOMPoint(...EAR_CUPS[i % 2]).matrixTransform(ctm);
            return { dx: p.x - (r.left + r.width / 2), dy: p.y - (r.top + r.height / 2) };
          }),
        );
      },
      { threshold: 0.6 },
    );
    io.observe(box);
    return () => io.disconnect();
  }, []);

  return (
    <>
      {!teaserGone && <TeaserNotes fading={flights !== null || instant} onFaded={() => setTeaserGone(true)} />}
      <footer className="px-[4%] mt-[26rem] max-sm:mt-60">
        <div ref={boxRef} className="relative">
          <nav className="absolute bottom-full mb-8 max-sm:mb-5 left-[48.3%] max-sm:left-[46.8%] -translate-x-1/2 flex items-center gap-4 max-sm:gap-3">
            {links.map((link, i) => (
              <span key={i} ref={(el) => { slotRefs.current[i] = el; }} className="relative">
                <span
                  className="inline-block"
                  style={
                    instant
                      ? undefined
                      : flights
                        ? { animation: `mdj-reveal ${REVEAL}ms ease-out ${i * STAGGER + LAND}ms both` }
                        : { visibility: "hidden" }
                  }
                >
                  {link}
                </span>
                {flights && (
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    <Note
                      i={i}
                      className="block w-[26px] h-7 max-sm:w-5 max-sm:h-[22px]"
                      style={{
                        "--dx": `${flights[i].dx}px`,
                        "--dy": `${flights[i].dy}px`,
                        animation: `mdj-fly ${LAND + 350}ms ${i * STAGGER}ms both`,
                      } as CSSProperties}
                    />
                  </span>
                )}
              </span>
            ))}
          </nav>
          <MiffyDJ svgRef={svgRef} ambientDelay={flights ? (links.length - 1) * STAGGER + LAND + REVEAL : null} />
        </div>
      </footer>
    </>
  );
}
