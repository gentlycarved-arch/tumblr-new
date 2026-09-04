import { useState, useRef, useEffect, useMemo } from 'react';
import { Color } from './ColorExtractor';
import { Upload } from 'lucide-react';

interface ColorWheelProps {
  imageSrc: string | null;
  colors: Color[];
  onCenterClick?: () => void;
  selectedIndex: number | null;
  onSelectSegment: (index: number | null) => void;
  onPickColorFromImage?: (color: Color) => void;
  onVisibleColorsChange?: (indices: number[]) => void;
}

function getHue(r: number, g: number, b: number): number {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  if (d === 0) return 0;
  let h = 0;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h = Math.round(h * 60);
  if (h < 0) h += 360;
  return h;
}

interface Segment {
  color: Color;
  startAngle: number;
  endAngle: number;
  originalIndex: number;
}

export function ColorWheel({
  imageSrc,
  colors,
  onCenterClick,
  selectedIndex,
  onSelectSegment,
  onPickColorFromImage,
  onVisibleColorsChange,
}: ColorWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [pickedPreview, setPickedPreview] = useState<{ x: number; y: number; color: string } | null>(null);
  const [activeHarmony, setActiveHarmony] = useState<string | null>(null);

  const size = 720;
  const cx = size / 2;
  const cy = size / 2;
  const imageRadius = 190;
  const segmentInnerR = imageRadius + 2;
  const segmentOuterR = size / 2 - 16;

  // Harmony label radius — clearly outside the outermost dashed orbit ring
  const harmonyR = segmentOuterR + 24;

  // Build arc path for curved text
  const buildTextArc = (centerDeg: number, spanDeg: number, flip: boolean): string => {
    const halfSpan = (spanDeg / 2) * (Math.PI / 180);
    const centerRad = (centerDeg * Math.PI) / 180;

    if (flip) {
      // Reverse direction so text reads correctly on bottom half
      const startAngle = centerRad + halfSpan;
      const endAngle = centerRad - halfSpan;
      const x1 = cx + harmonyR * Math.cos(startAngle);
      const y1 = cy + harmonyR * Math.sin(startAngle);
      const x2 = cx + harmonyR * Math.cos(endAngle);
      const y2 = cy + harmonyR * Math.sin(endAngle);
      return `M ${x1} ${y1} A ${harmonyR} ${harmonyR} 0 0 0 ${x2} ${y2}`;
    } else {
      const startAngle = centerRad - halfSpan;
      const endAngle = centerRad + halfSpan;
      const x1 = cx + harmonyR * Math.cos(startAngle);
      const y1 = cy + harmonyR * Math.sin(startAngle);
      const x2 = cx + harmonyR * Math.cos(endAngle);
      const y2 = cy + harmonyR * Math.sin(endAngle);
      return `M ${x1} ${y1} A ${harmonyR} ${harmonyR} 0 0 1 ${x2} ${y2}`;
    }
  };

  const harmonyLabels = [
    { label: 'MONO', centerDeg: -90, flip: false },
    { label: 'COMP', centerDeg: 0, flip: false },
    { label: 'ANALOG', centerDeg: 90, flip: true },
    { label: 'TRIAD', centerDeg: 180, flip: true },
  ];

  const segments: Segment[] = useMemo(() => {
    if (colors.length === 0) return [];

    const sorted = colors
      .map((c, i) => ({ color: c, originalIndex: i }))
      .sort((a, b) => {
        const hueA = getHue(a.color.r, a.color.g, a.color.b);
        const hueB = getHue(b.color.r, b.color.g, b.color.b);
        return hueA - hueB;
      });

    const anglePerSeg = (2 * Math.PI) / sorted.length;
    const segs: Segment[] = [];
    let currentAngle = -Math.PI / 2;

    for (let i = 0; i < sorted.length; i++) {
      const endAngle = currentAngle + anglePerSeg;
      segs.push({
        color: sorted[i].color,
        startAngle: currentAngle,
        endAngle,
        originalIndex: sorted[i].originalIndex,
      });
      currentAngle = endAngle;
    }

    return segs;
  }, [colors]);

  // Noise texture on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = size;
    canvas.height = size;

    const imageData = ctx.createImageData(size, size);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const noise = Math.random() * 30 - 15;
      imageData.data[i] = 128 + noise;
      imageData.data[i + 1] = 128 + noise;
      imageData.data[i + 2] = 128 + noise;
      imageData.data[i + 3] = 10;
    }
    ctx.putImageData(imageData, 0, 0);
  }, []);

  const buildSegmentPath = (seg: Segment): string => {
    const innerX1 = cx + segmentInnerR * Math.cos(seg.startAngle);
    const innerY1 = cy + segmentInnerR * Math.sin(seg.startAngle);
    const innerX2 = cx + segmentInnerR * Math.cos(seg.endAngle);
    const innerY2 = cy + segmentInnerR * Math.sin(seg.endAngle);
    const outerX1 = cx + segmentOuterR * Math.cos(seg.startAngle);
    const outerY1 = cy + segmentOuterR * Math.sin(seg.startAngle);
    const outerX2 = cx + segmentOuterR * Math.cos(seg.endAngle);
    const outerY2 = cy + segmentOuterR * Math.sin(seg.endAngle);

    const arcSpan = seg.endAngle - seg.startAngle;
    const largeArc = arcSpan > Math.PI ? 1 : 0;

    return `M ${innerX1} ${innerY1} L ${outerX1} ${outerY1} A ${segmentOuterR} ${segmentOuterR} 0 ${largeArc} 1 ${outerX2} ${outerY2} L ${innerX2} ${innerY2} A ${segmentInnerR} ${segmentInnerR} 0 ${largeArc} 0 ${innerX1} ${innerY1} Z`;
  };

  const getSegmentAtPoint = (clientX: number, clientY: number, rect: DOMRect) => {
    const scaleFactor = size / rect.width;
    const x = (clientX - rect.left) * scaleFactor - cx;
    const y = (clientY - rect.top) * scaleFactor - cy;
    const dist = Math.sqrt(x * x + y * y);

    if (dist < segmentInnerR || dist > segmentOuterR) return null;

    const angle = Math.atan2(y, x);

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      const start = seg.startAngle;
      const end = seg.endAngle;

      let a = angle;
      if (end > Math.PI) {
        if (a < start && a < end - 2 * Math.PI + 0.001) {
          a += 2 * Math.PI;
        }
      }
      if (a >= start && a < end) return i;
      if (a + 2 * Math.PI >= start && a + 2 * Math.PI < end) return i;
    }

    return null;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const idx = getSegmentAtPoint(e.clientX, e.clientY, rect);
    setHoveredIndex(idx);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleFactor = size / rect.width;
    const x = (e.clientX - rect.left) * scaleFactor - cx;
    const y = (e.clientY - rect.top) * scaleFactor - cy;
    const dist = Math.sqrt(x * x + y * y);

    if (dist < imageRadius) {
      // If we have an image and colors are extracted, sample color from click point
      if (imageSrc && colors.length > 0 && onPickColorFromImage) {
        const color = sampleColorAtPoint(e.clientX, e.clientY, rect);
        if (color) {
          onPickColorFromImage(color);
          setPickedPreview(null);
        }
        return;
      }
      // Otherwise open file upload
      onCenterClick?.();
      return;
    }

    // Check if click is in the harmony label ring
    const harmonyLabel = getHarmonyLabelAtPoint(e.clientX, e.clientY, rect);
    if (harmonyLabel) {
      setActiveHarmony((prev) => (prev === harmonyLabel ? null : harmonyLabel));
      return;
    }

    const idx = getSegmentAtPoint(e.clientX, e.clientY, rect);
    if (idx !== null) {
      const seg = segments[idx];
      if (selectedIndex === seg.originalIndex) {
        onSelectSegment(null);
      } else {
        onSelectSegment(seg.originalIndex);
      }
    } else {
      onSelectSegment(null);
    }
  };

  const handleCenterMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageSrc || colors.length === 0 || !onPickColorFromImage) {
      setPickedPreview(null);
      return;
    }
    const rect = e.currentTarget.closest('[data-wheel-root]')?.getBoundingClientRect();
    if (!rect) return;
    const color = sampleColorAtPoint(e.clientX, e.clientY, rect);
    if (color) {
      const scaleFactor = size / rect.width;
      setPickedPreview({
        x: (e.clientX - rect.left) * scaleFactor,
        y: (e.clientY - rect.top) * scaleFactor,
        color: color.hex,
      });
    }
  };

  const getTooltipPos = (segIdx: number) => {
    const seg = segments[segIdx];
    const midAngle = (seg.startAngle + seg.endAngle) / 2;
    const midR = (segmentInnerR + segmentOuterR) / 2;
    return {
      x: cx + midR * Math.cos(midAngle),
      y: cy + midR * Math.sin(midAngle),
    };
  };

  const getSelectedIndicator = () => {
    if (selectedIndex === null) return null;
    const seg = segments.find((s) => s.originalIndex === selectedIndex);
    if (!seg) return null;
    const midAngle = (seg.startAngle + seg.endAngle) / 2;
    return {
      x1: cx + (segmentOuterR + 2) * Math.cos(midAngle),
      y1: cy + (segmentOuterR + 2) * Math.sin(midAngle),
      x2: cx + (segmentOuterR + 18) * Math.cos(midAngle),
      y2: cy + (segmentOuterR + 18) * Math.sin(midAngle),
    };
  };

  const indicator = getSelectedIndicator();

  // Compute harmony-matching segment indices
  const harmonyMatchSet = useMemo((): Set<number> => {
    if (!activeHarmony || selectedIndex === null || segments.length === 0) return new Set();

    // Find the selected segment and extract its actual HSL hue (0–360°)
    const selectedSeg = segments.find((s) => s.originalIndex === selectedIndex);
    if (!selectedSeg) return new Set();
    const H = getHue(selectedSeg.color.r, selectedSeg.color.g, selectedSeg.color.b);

    // Circular hue distance on the 0–360° wheel
    const hueDist = (a: number, b: number): number => {
      const d = Math.abs(a - b) % 360;
      return d > 180 ? 360 - d : d;
    };

    // Compute target hue(s) and tolerance for each harmony type
    switch (activeHarmony) {
      case 'MONO': {
        // Monochromatic: same hue, varying saturation/lightness only.
        // Since the ring only varies hue, only the selected segment itself qualifies.
        const selectedRingIdx = segments.findIndex((s) => s.originalIndex === selectedIndex);
        if (selectedRingIdx !== -1) {
          return new Set([selectedRingIdx]);
        }
        return new Set();
      }
      case 'COMP': {
        // Complementary: selected hue + exact opposite (H + 180°) mod 360°.
        // Highlight only the selected segment and the single segment closest to the complement.
        const selectedRingIdx = segments.findIndex((s) => s.originalIndex === selectedIndex);
        if (selectedRingIdx === -1) return new Set();
        const compTarget = (H + 180) % 360;
        let closestIdx = -1;
        let closestDist = Infinity;
        for (let i = 0; i < segments.length; i++) {
          if (i === selectedRingIdx) continue;
          const segH = getHue(segments[i].color.r, segments[i].color.g, segments[i].color.b);
          const d = hueDist(segH, compTarget);
          if (d < closestDist) {
            closestDist = d;
            closestIdx = i;
          }
        }
        const result = new Set([selectedRingIdx]);
        if (closestIdx !== -1) result.add(closestIdx);
        return result;
      }
      case 'ANALOG': {
        // Analogous: base hue H, H−30°, H+30° (standard branding convention).
        // Highlight only the selected segment and the single closest segment to each target.
        const selectedRingIdx = segments.findIndex((s) => s.originalIndex === selectedIndex);
        if (selectedRingIdx === -1) return new Set();
        const analogTargets = [(H + 330) % 360, (H + 30) % 360]; // H-30° and H+30°
        const result = new Set([selectedRingIdx]);
        for (const target of analogTargets) {
          let closestIdx = -1;
          let closestDist = Infinity;
          for (let i = 0; i < segments.length; i++) {
            if (i === selectedRingIdx) continue;
            const segH = getHue(segments[i].color.r, segments[i].color.g, segments[i].color.b);
            const d = hueDist(segH, target);
            if (d < closestDist) {
              closestDist = d;
              closestIdx = i;
            }
          }
          if (closestIdx !== -1) result.add(closestIdx);
        }
        return result;
      }
      case 'TRIAD': {
        // Triadic: 3 evenly spaced hues — H, (H+120°) mod 360°, (H+240°) mod 360°.
        // Highlight only the selected segment and the single closest segment to each target.
        const selectedRingIdx = segments.findIndex((s) => s.originalIndex === selectedIndex);
        if (selectedRingIdx === -1) return new Set();
        const triadTargets = [(H + 120) % 360, (H + 240) % 360];
        const result = new Set([selectedRingIdx]);
        for (const target of triadTargets) {
          let closestIdx = -1;
          let closestDist = Infinity;
          for (let i = 0; i < segments.length; i++) {
            if (i === selectedRingIdx) continue;
            const segH = getHue(segments[i].color.r, segments[i].color.g, segments[i].color.b);
            const d = hueDist(segH, target);
            if (d < closestDist) {
              closestDist = d;
              closestIdx = i;
            }
          }
          if (closestIdx !== -1) result.add(closestIdx);
        }
        return result;
      }
    }

    return new Set();
  }, [activeHarmony, selectedIndex, segments]);

  // Detect click on harmony label zone (outer ring)
  const getHarmonyLabelAtPoint = (clientX: number, clientY: number, rect: DOMRect): string | null => {
    const scaleFactor = size / rect.width;
    const x = (clientX - rect.left) * scaleFactor - cx;
    const y = (clientY - rect.top) * scaleFactor - cy;
    const dist = Math.sqrt(x * x + y * y);

    if (dist < segmentOuterR + 14 || dist > segmentOuterR + 40) return null;

    let angle = Math.atan2(y, x) * (180 / Math.PI); // -180 to 180
    // Map to quadrants
    if (angle >= -135 && angle < -45) return 'MONO';    // top
    if (angle >= -45 && angle < 45) return 'COMP';      // right
    if (angle >= 45 && angle < 135) return 'ANALOG';    // bottom
    return 'TRIAD'; // left: 135..180 or -180..-135
  };

  // Report visible colors to parent whenever harmony filter changes
  useEffect(() => {
    if (!onVisibleColorsChange) return;
    const harmonyActive = activeHarmony !== null && selectedIndex !== null && harmonyMatchSet.size > 0;
    if (harmonyActive) {
      // Only the matched segments are "visible"
      const visibleIndices = Array.from(harmonyMatchSet).map(i => segments[i].originalIndex);
      onVisibleColorsChange(visibleIndices);
    } else {
      // All segments visible
      onVisibleColorsChange(segments.map(s => s.originalIndex));
    }
  }, [harmonyMatchSet, activeHarmony, selectedIndex, segments, onVisibleColorsChange]);

  // Keep an offscreen canvas with the image for pixel sampling
  useEffect(() => {
    if (!imageSrc) {
      imageCanvasRef.current = null;
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const offscreen = document.createElement('canvas');
      offscreen.width = img.width;
      offscreen.height = img.height;
      const ctx = offscreen.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        imageCanvasRef.current = offscreen;
      }
    };
    img.src = imageSrc;
  }, [imageSrc]);

  function rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  }

  const sampleColorAtPoint = (clientX: number, clientY: number, rect: DOMRect): Color | null => {
    const offscreen = imageCanvasRef.current;
    if (!offscreen) return null;

    const scaleFactor = size / rect.width;
    const svgX = (clientX - rect.left) * scaleFactor;
    const svgY = (clientY - rect.top) * scaleFactor;

    // Map SVG coords to image pixel coords within the circular center
    // The image is rendered at (cx - imageRadius, cy - imageRadius) with size imageRadius*2
    const imgDisplayX = svgX - (cx - imageRadius);
    const imgDisplayY = svgY - (cy - imageRadius);
    const imgDisplaySize = imageRadius * 2;

    // The image uses preserveAspectRatio="xMidYMid slice" — compute the actual mapping
    const imgW = offscreen.width;
    const imgH = offscreen.height;
    const displayAspect = 1; // square display area
    const imgAspect = imgW / imgH;

    let srcX: number, srcY: number;
    if (imgAspect > displayAspect) {
      // Image is wider: height fits, width is cropped
      const visibleW = imgH; // square
      const offsetX = (imgW - visibleW) / 2;
      srcX = offsetX + (imgDisplayX / imgDisplaySize) * visibleW;
      srcY = (imgDisplayY / imgDisplaySize) * imgH;
    } else {
      // Image is taller: width fits, height is cropped
      const visibleH = imgW; // square
      const offsetY = (imgH - visibleH) / 2;
      srcX = (imgDisplayX / imgDisplaySize) * imgW;
      srcY = offsetY + (imgDisplayY / imgDisplaySize) * visibleH;
    }

    srcX = Math.round(Math.max(0, Math.min(imgW - 1, srcX)));
    srcY = Math.round(Math.max(0, Math.min(imgH - 1, srcY)));

    const ctx = offscreen.getContext('2d');
    if (!ctx) return null;

    const pixel = ctx.getImageData(srcX, srcY, 1, 1).data;
    const r = pixel[0];
    const g = pixel[1];
    const b = pixel[2];

    return {
      r,
      g,
      b,
      hex: rgbToHex(r, g, b),
      proportion: 0,
    };
  };

  return (
    <div
      className="relative cursor-crosshair select-none"
      style={{ width: size, height: size, overflow: 'visible' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      data-wheel-root
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="block"
        overflow="visible"
        style={{ filter: 'drop-shadow(0 2px 12px rgba(0,0,0,0.06))' }}
      >
        <defs>
          <clipPath id="center-clip">
            <circle cx={cx} cy={cy} r={imageRadius} />
          </clipPath>
          <filter id="ring-shadow" x="-5%" y="-5%" width="110%" height="110%">
            <feDropShadow dx="0" dy="1" stdDeviation="3" floodColor="#000" floodOpacity="0.2" />
          </filter>
        </defs>

        {/* Outer decorative dashed rings */}
        <circle
          cx={cx}
          cy={cy}
          r={segmentOuterR + 8}
          fill="none"
          stroke="#222"
          strokeWidth={1}
          strokeDasharray="4 6"
          opacity={0.3}
        />
        <circle
          cx={cx}
          cy={cy}
          r={segmentOuterR + 14}
          fill="none"
          stroke="#222"
          strokeWidth={0.5}
          strokeDasharray="2 8"
          opacity={0.22}
        />

        {/* === SEGMENT RING === */}
        <g filter="url(#ring-shadow)">
          {segments.map((seg, i) => {
            const isHovered = hoveredIndex === i;
            const isSelected = selectedIndex === seg.originalIndex;
            const isMatched = harmonyMatchSet.has(i);
            const harmonyActive = activeHarmony !== null && selectedIndex !== null && harmonyMatchSet.size > 0;

            // Determine opacity
            let segOpacity = 1;
            if (harmonyActive) {
              // Harmony mode: matched + selected stay full, others fade
              if (!isMatched && !isSelected) segOpacity = 0.15;
            } else if (hoveredIndex !== null && !isHovered && !isSelected) {
              segOpacity = 0.45;
            } else if (selectedIndex !== null && !isSelected && hoveredIndex === null) {
              segOpacity = 0.45;
            }

            return (
              <path
                key={i}
                d={buildSegmentPath(seg)}
                fill={seg.color.hex}
                stroke={isSelected ? '#555' : isMatched && harmonyActive ? '#555' : 'rgba(0,0,0,0.45)'}
                strokeWidth={isSelected ? 2.5 : isMatched && harmonyActive ? 1.5 : 1}
                style={{
                  transition: 'opacity 0.25s ease, stroke-width 0.15s ease',
                  opacity: segOpacity,
                }}
              />
            );
          })}
        </g>

        {/* Selected segment indicator tick */}
        {indicator && (
          <line
            x1={indicator.x1}
            y1={indicator.y1}
            x2={indicator.x2}
            y2={indicator.y2}
            stroke="#222"
            strokeWidth={2.5}
            strokeLinecap="round"
            style={{ transition: 'all 0.2s ease' }}
          />
        )}

        {/* Inner ring border */}
        <circle
          cx={cx}
          cy={cy}
          r={segmentInnerR - 1}
          fill="none"
          stroke="#222"
          strokeWidth={2}
          opacity={0.3}
        />

        {/* Outer ring border */}
        <circle
          cx={cx}
          cy={cy}
          r={segmentOuterR + 1}
          fill="none"
          stroke="#222"
          strokeWidth={1.5}
          opacity={0.2}
        />

        {/* === CENTER IMAGE === */}
        {imageSrc ? (
          <image
            href={imageSrc}
            x={cx - imageRadius}
            y={cy - imageRadius}
            width={imageRadius * 2}
            height={imageRadius * 2}
            clipPath="url(#center-clip)"
            preserveAspectRatio="xMidYMid slice"
          />
        ) : (
          <>
            <circle cx={cx} cy={cy} r={imageRadius} fill="#F4F4E8" />
          </>
        )}

        {/* Thin ring around image */}
        <circle
          cx={cx}
          cy={cy}
          r={imageRadius}
          fill="none"
          stroke="rgba(0,0,0,0.25)"
          strokeWidth={2}
        />

        {/* Harmony labels */}
        {harmonyLabels.map((hl) => (
          <path
            key={`arc-${hl.label}`}
            id={`harmony-arc-${hl.label}`}
            d={buildTextArc(hl.centerDeg, 60, hl.flip)}
            fill="none"
            stroke="none"
          />
        ))}
        {harmonyLabels.map((hl) => {
          const isActive = activeHarmony === hl.label;
          const centerRad = (hl.centerDeg * Math.PI) / 180;
          // Icon sits just outside the text arc
          const iconR = harmonyR + 14;
          const iconCx = cx + iconR * Math.cos(centerRad);
          const iconCy = cy + iconR * Math.sin(centerRad);
          // Perpendicular to the radial direction (tangent along arc)
          const perpX = -Math.sin(centerRad);
          const perpY = Math.cos(centerRad);
          // Radial outward direction
          const radX = Math.cos(centerRad);
          const radY = Math.sin(centerRad);
          const dotR = 2;
          const sp = 5; // spacing between dots

          let dots: { x: number; y: number }[] = [];
          switch (hl.label) {
            case 'MONO':
              // Single dot
              dots = [{ x: iconCx, y: iconCy }];
              break;
            case 'COMP':
              // Two dots spaced apart (opposite)
              dots = [
                { x: iconCx - perpX * sp, y: iconCy - perpY * sp },
                { x: iconCx + perpX * sp, y: iconCy + perpY * sp },
              ];
              break;
            case 'ANALOG':
              // Three dots in a row, close together
              dots = [
                { x: iconCx - perpX * sp, y: iconCy - perpY * sp },
                { x: iconCx, y: iconCy },
                { x: iconCx + perpX * sp, y: iconCy + perpY * sp },
              ];
              break;
            case 'TRIAD':
              // Three dots in a triangle
              dots = [
                { x: iconCx + radX * sp * 0.55, y: iconCy + radY * sp * 0.55 },
                { x: iconCx - perpX * sp * 0.65 - radX * sp * 0.35, y: iconCy - perpY * sp * 0.65 - radY * sp * 0.35 },
                { x: iconCx + perpX * sp * 0.65 - radX * sp * 0.35, y: iconCy + perpY * sp * 0.65 - radY * sp * 0.35 },
              ];
              break;
          }

          return (
            <g key={`icon-${hl.label}`}>
              <text
                fill={isActive ? '#222' : '#444'}
                opacity={isActive ? 0.9 : 0.5}
                style={{
                  fontFamily: "'ETBembo', serif",
                  fontSize: isActive ? '13px' : '12px',
                  letterSpacing: '0.22em',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s ease',
                }}
              >
                <textPath
                  href={`#harmony-arc-${hl.label}`}
                  startOffset="50%"
                  textAnchor="middle"
                >
                  {hl.label}
                </textPath>
              </text>
              {dots.map((d, di) => (
                <circle
                  key={di}
                  cx={d.x}
                  cy={d.y}
                  r={dotR}
                  fill={isActive ? '#222' : '#444'}
                  opacity={isActive ? 0.9 : 0.45}
                  style={{ transition: 'opacity 0.2s ease' }}
                />
              ))}
            </g>
          );
        })}
      </svg>

      {/* Noise texture overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none rounded-full"
        style={{ width: size, height: size, mixBlendMode: 'overlay', opacity: 0.12 }}
      />

      {/* Hover tooltip */}
      {hoveredIndex !== null &&
        segments[hoveredIndex] &&
        selectedIndex !== segments[hoveredIndex].originalIndex &&
        (() => {
          const tip = getTooltipPos(hoveredIndex);
          const color = segments[hoveredIndex].color;
          const luminance = 0.299 * color.r + 0.587 * color.g + 0.114 * color.b;
          const textColor = luminance > 140 ? '#111' : '#fff';

          return (
            <div
              className="absolute pointer-events-none z-10 flex flex-col items-center"
              style={{
                left: tip.x,
                top: tip.y,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div
                className="px-3 py-1.5 rounded-md"
                style={{
                  background: `${color.hex}dd`,
                  border: `1px solid rgba(0,0,0,0.15)`,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
                }}
              >
                <span
                  className="text-[11px] tracking-[0.1em]"
                  style={{ color: textColor, fontFamily: "'ETBembo', serif" }}
                >
                  {color.hex.toUpperCase()}
                </span>
              </div>
            </div>
          );
        })()}

      {/* Center upload overlay */}
      <div
        className="absolute rounded-full flex items-center justify-center group"
        style={{
          left: cx - imageRadius,
          top: cy - imageRadius,
          width: imageRadius * 2,
          height: imageRadius * 2,
          cursor: imageSrc && colors.length > 0 ? 'crosshair' : 'pointer',
        }}
        onMouseMove={handleCenterMouseMove}
        onMouseLeave={() => setPickedPreview(null)}
        onClick={(e) => {
          e.stopPropagation();
          // If image loaded + colors extracted, let the parent handleClick sample the color
          if (imageSrc && colors.length > 0 && onPickColorFromImage) {
            const rect = (e.currentTarget.closest('[data-wheel-root]') as HTMLElement)?.getBoundingClientRect();
            if (rect) {
              const color = sampleColorAtPoint(e.clientX, e.clientY, rect);
              if (color) {
                onPickColorFromImage(color);
                setPickedPreview(null);
              }
            }
            return;
          }
          onCenterClick?.();
        }}
      >
        {!imageSrc ? (
          <div className="w-full h-full rounded-full flex flex-col items-center justify-center gap-3 hover:bg-black/[0.03] transition-colors duration-300">
            <Upload className="w-6 h-6" style={{ color: '#888' }} />
            <div className="flex flex-col items-center gap-1">
              <span
                className="text-xs tracking-[0.15em] uppercase"
                style={{ color: '#666', fontFamily: "'ETBembo', serif" }}
              >
                Upload Image
              </span>
              <span
                className="text-[10px] tracking-[0.1em]"
                style={{ color: '#999', fontFamily: "'ETBembo', serif" }}
              >
                or paste from clipboard
              </span>
            </div>
          </div>
        ) : colors.length > 0 ? (
          /* Eyedropper mode - transparent overlay, small upload button in corner */
          <div className="w-full h-full rounded-full relative">
            {/* Small re-upload button at bottom-right of center circle */}
            <button
              className="absolute z-30 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 transition-all duration-200 cursor-pointer"
              style={{
                width: 32,
                height: 32,
                bottom: 16,
                right: 16,
              }}
              onClick={(e) => {
                e.stopPropagation();
                onCenterClick?.();
              }}
              title="Upload new image"
            >
              <Upload className="w-4 h-4 text-white/80" />
            </button>
            {/* Crosshair cursor hint */}
            <div className="w-full h-full rounded-full flex items-center justify-end pb-4 pr-4" />
          </div>
        ) : (
          <div className="w-full h-full rounded-full bg-black/0 group-hover:bg-black/25 transition-all duration-300 flex items-center justify-center">
            <Upload className="w-7 h-7 text-white opacity-0 group-hover:opacity-90 transition-opacity duration-300 drop-shadow-lg" />
          </div>
        )}
      </div>

      {/* Color preview on center image */}
      {pickedPreview && (() => {
        // Parse hex to get luminance for adaptive text
        const hex = pickedPreview.color;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
        const textColor = luminance > 140 ? '#111' : '#fff';

        return (
          <div
            className="absolute pointer-events-none z-10"
            style={{
              left: pickedPreview.x,
              top: pickedPreview.y,
              transform: 'translate(-50%, calc(-50% - 16px))',
            }}
          >
            <div
              className="px-3 py-1.5 rounded-md flex items-center gap-2"
              style={{
                background: `${pickedPreview.color}dd`,
                border: `1px solid rgba(0,0,0,0.15)`,
                boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
              }}
            >
              <div
                className="w-3 h-3 rounded-sm border"
                style={{
                  backgroundColor: pickedPreview.color,
                  borderColor: luminance > 140 ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.25)',
                }}
              />
              <span
                className="text-[11px] tracking-[0.1em]"
                style={{ color: textColor, fontFamily: "'ETBembo', serif" }}
              >
                {pickedPreview.color.toUpperCase()}
              </span>
            </div>
          </div>
        );
      })()}
    </div>
  );
}