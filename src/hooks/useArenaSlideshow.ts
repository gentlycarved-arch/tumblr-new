import { useState, useEffect, useRef } from "react";

const INTERVAL_MS = 15_000; // time between transitions
const FADE_MS = 800;        // fade out duration (then same to fade back in)

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
  /** The src to show — only swaps after fade-out completes */
  displaySrc: string;
  /** 0 = fully visible, 1 = fully hidden */
  opacity: number;
  /** Duration of the CSS transition in ms */
  fadeDuration: number;
}

export function useArenaSlideshow(fallback: string, channelSlug: string): SlideshowState {
  const [images, setImages] = useState<string[]>([]);
  const [displaySrc, setDisplaySrc] = useState(fallback);
  const [opacity, setOpacity] = useState(1);
  const idxRef = useRef(0);
  const imagesRef = useRef<string[]>([]);

  // Fetch images when channel slug changes
  useEffect(() => {
    setImages([]);
    idxRef.current = 0;
    const token = (import.meta.env.VITE_ARENA_TOKEN as string | undefined) || undefined;
    fetchArenaImages(channelSlug, token)
      .then((imgs) => {
        if (imgs.length === 0) return;
        const shuffled = shuffle(imgs);
        setImages(shuffled);
        imagesRef.current = shuffled;
        setDisplaySrc(shuffled[0]);
      })
      .catch((err) => console.warn("[Arena slideshow]", err));
  }, [channelSlug]);

  // Cycle: fade out → swap src → fade in
  useEffect(() => {
    if (images.length < 2) return;
    imagesRef.current = images;

    const timer = setInterval(() => {
      // 1. Fade out
      setOpacity(0);

      // 2. After fade-out: swap image, start fade-in
      setTimeout(() => {
        idxRef.current = (idxRef.current + 1) % imagesRef.current.length;
        setDisplaySrc(imagesRef.current[idxRef.current]);
        setOpacity(1);
      }, FADE_MS);
    }, INTERVAL_MS);

    return () => clearInterval(timer);
  }, [images]);

  return { displaySrc, opacity, fadeDuration: FADE_MS };
}
