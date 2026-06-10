import { useState, useEffect, useRef, useCallback } from "react";

const INTERVAL_MS = 15_000; // time between transitions
const FADE_MS = 800;        // crossfade duration (quick)

export type SlideMode = 'auto' | 'dark' | 'light';

async function fetchArenaImages(slug: string, token?: string): Promise<string[]> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(
    `https://api.are.na/v3/channels/${slug}/contents?per=100`,
    { headers }
  );

  if (!res.ok) throw new Error(`Are.na API ${res.status}`);

  const data = await res.json();
  return (data.data ?? [])
    .filter((b: Record<string, unknown>) => {
      const img = b.image as Record<string, unknown> | undefined;
      return b.type === "Image" && img?.src;
    })
    .map((b: Record<string, unknown>) => {
      const img = b.image as Record<string, string>;
      return img.src;
    });
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

/** Samples image pixels and returns 'dark' or 'light', weighing brightness + saturation. */
export function detectImageMode(src: string): Promise<'dark' | 'light'> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const SIZE = 64;
      const canvas = document.createElement("canvas");
      canvas.width = SIZE;
      canvas.height = SIZE;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve("light");
      ctx.drawImage(img, 0, 0, SIZE, SIZE);
      try {
        const { data } = ctx.getImageData(0, 0, SIZE, SIZE);
        const pixels = data.length / 4;
        let lumTotal = 0;
        let satTotal = 0;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          lumTotal += 0.299 * r + 0.587 * g + 0.114 * b;
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const delta = max - min;
          satTotal += delta === 0 ? 0 : delta / (255 - Math.abs(max + min - 255));
        }
        const avgLum = lumTotal / pixels;
        const avgSat = satTotal / pixels;
        const threshold = 118 + avgSat * 42;
        resolve(avgLum < threshold ? "dark" : "light");
      } catch {
        resolve("light");
      }
    };
    img.onerror = () => resolve("light");
    img.src = src;
  });
}

export interface SlideshowState {
  currentSrc: string;
  nextSrc: string;
  fading: boolean;
  fadeDuration: number;
  currentMode: 'dark' | 'light'; // detected tone of the image currently shown
}

export function useArenaSlideshow(fallback: string, channelSlug: string, mode: SlideMode): SlideshowState {
  const [images, setImages] = useState<string[]>([]);
  const [curIdx, setCurIdx] = useState(0);
  const [incIdx, setIncIdx] = useState(0);
  const [fading, setFading] = useState(false);
  // bump to force re-render when async classification updates the cache
  const [, setClassifyTick] = useState(0);

  const modes = useRef<Map<string, 'dark' | 'light'>>(new Map());
  const curRef = useRef(0);
  const fadingRef = useRef(false);
  const modeRef = useRef<SlideMode>(mode);
  modeRef.current = mode;

  // Fetch + classify
  useEffect(() => {
    setImages([]);
    setCurIdx(0);
    setIncIdx(0);
    curRef.current = 0;
    modes.current = new Map();
    const token = (import.meta.env.VITE_ARENA_TOKEN as string | undefined) || undefined;
    fetchArenaImages(channelSlug, token)
      .then((imgs) => {
        if (imgs.length === 0) return;
        const shuffled = shuffle(imgs);
        setImages(shuffled);
        // classify each in the background
        shuffled.forEach((src) => {
          detectImageMode(src).then((m) => {
            modes.current.set(src, m);
            setClassifyTick((t) => t + 1);
          });
        });
      })
      .catch((err) => console.warn("[Arena slideshow]", err));
  }, [channelSlug]);

  // Is image at index i eligible to show given the active mode?
  const eligible = useCallback((i: number, imgs: string[]) => {
    const m = modeRef.current;
    if (m === 'auto') return true;
    const tone = modes.current.get(imgs[i]);
    if (tone === undefined) return false; // not classified yet — skip for now
    return tone === m;
  }, []);

  // Find the next eligible index after `from` (wraps). Falls back to from+1 if none eligible.
  const nextEligible = useCallback((from: number, imgs: string[]) => {
    const len = imgs.length;
    for (let step = 1; step <= len; step++) {
      const cand = (from + step) % len;
      if (eligible(cand, imgs)) return cand;
    }
    return (from + 1) % len; // none classified/eligible yet — keep moving
  }, [eligible]);

  const transition = useCallback((target: number) => {
    if (fadingRef.current) return;
    if (target === curRef.current) return;
    fadingRef.current = true;
    setIncIdx(target);
    setFading(true);
    setTimeout(() => {
      curRef.current = target;
      setCurIdx(target);
      setFading(false);
      fadingRef.current = false;
    }, FADE_MS);
  }, []);

  // Auto-advance timer
  useEffect(() => {
    if (images.length < 2) return;
    const timer = setInterval(() => {
      transition(nextEligible(curRef.current, images));
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [images, transition, nextEligible]);

  // When the user switches mode, if the current image doesn't match, jump to one that does
  useEffect(() => {
    if (mode === 'auto' || images.length === 0) return;
    if (eligible(curRef.current, images)) return;
    const target = nextEligible(curRef.current, images);
    if (target !== curRef.current) transition(target);
  }, [mode, images, eligible, nextEligible, transition]);

  const len = images.length;
  const currentSrc = len > 0 ? images[curIdx] : fallback;
  const nextSrc = len > 0 ? images[incIdx] : fallback;
  const currentMode = (currentSrc && modes.current.get(currentSrc)) || 'light';

  return { currentSrc, nextSrc, fading, fadeDuration: FADE_MS, currentMode };
}
