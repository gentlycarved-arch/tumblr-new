import { useState, useEffect, useRef, useCallback } from "react";

const INTERVAL_MS = 15_000; // time between transitions
const FADE_MS = 800;        // crossfade duration (quick)

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

export interface SlideshowState {
  currentSrc: string;
  nextSrc: string;
  fading: boolean;
  fadeDuration: number;
  images: string[];
  jumpTo: (index: number) => void;
}

export function useArenaSlideshow(fallback: string, channelSlug: string): SlideshowState {
  const [images, setImages] = useState<string[]>([]);
  const [curIdx, setCurIdx] = useState(0);   // image currently shown (top layer)
  const [incIdx, setIncIdx] = useState(0);   // incoming image (bottom layer, revealed on fade)
  const [fading, setFading] = useState(false);
  const curRef = useRef(0);
  const fadingRef = useRef(false);

  useEffect(() => {
    setImages([]);
    setCurIdx(0);
    setIncIdx(0);
    curRef.current = 0;
    const token = (import.meta.env.VITE_ARENA_TOKEN as string | undefined) || undefined;
    fetchArenaImages(channelSlug, token)
      .then((imgs) => {
        if (imgs.length === 0) return;
        setImages(shuffle(imgs));
      })
      .catch((err) => console.warn("[Arena slideshow]", err));
  }, [channelSlug]);

  // Crossfade from the current image to a target index
  const transition = useCallback((target: number, len: number) => {
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

  // Auto-advance on a timer
  useEffect(() => {
    if (images.length < 2) return;
    const timer = setInterval(() => {
      transition((curRef.current + 1) % images.length, images.length);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [images, transition]);

  const jumpTo = useCallback((index: number) => {
    if (index < 0 || index >= images.length) return;
    transition(index, images.length);
  }, [images, transition]);

  const len = images.length;
  const currentSrc = len > 0 ? images[curIdx] : fallback;
  const nextSrc = len > 0 ? images[incIdx] : fallback;

  return { currentSrc, nextSrc, fading, fadeDuration: FADE_MS, images, jumpTo };
}
