import { useState, useEffect, useRef } from "react";

const CHANNEL_SLUG = "gently-carved-website";
const INTERVAL_MS = 15_000; // time between transitions
const FADE_MS = 2_500;      // crossfade duration

async function fetchArenaImages(token?: string): Promise<string[]> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(
    `https://api.are.na/v3/channels/${CHANNEL_SLUG}/contents?per=100`,
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
  /** The image currently on top (visible) */
  currentSrc: string;
  /** The image preloaded beneath — becomes visible during fade */
  nextSrc: string;
  /** True during the crossfade window */
  fading: boolean;
  /** Duration of the CSS transition in ms */
  fadeDuration: number;
}

export function useArenaSlideshow(fallback: string): SlideshowState {
  const [images, setImages] = useState<string[]>([]);
  const [idx, setIdx] = useState(0);
  const [fading, setFading] = useState(false);
  const idxRef = useRef(0);
  const lenRef = useRef(0);

  // Fetch images once on mount
  useEffect(() => {
    const token = (import.meta.env.VITE_ARENA_TOKEN as string | undefined) || undefined;
    fetchArenaImages(token)
      .then((imgs) => {
        if (imgs.length === 0) return;
        const shuffled = shuffle(imgs);
        setImages(shuffled);
        lenRef.current = shuffled.length;
      })
      .catch((err) => console.warn("[Arena slideshow]", err));
  }, []);

  // Cycle on interval once images are loaded
  useEffect(() => {
    if (images.length < 2) return;
    lenRef.current = images.length;

    const timer = setInterval(() => {
      // Start fade
      setFading(true);

      // After fade completes: advance index, stop fading
      setTimeout(() => {
        idxRef.current = (idxRef.current + 1) % lenRef.current;
        setIdx(idxRef.current);
        setFading(false);
      }, FADE_MS);
    }, INTERVAL_MS);

    return () => clearInterval(timer);
  }, [images]);

  const len = images.length;
  const currentSrc = len > 0 ? images[idx] : fallback;
  const nextSrc = len > 1 ? images[(idx + 1) % len] : fallback;

  return { currentSrc, nextSrc, fading, fadeDuration: FADE_MS };
}
