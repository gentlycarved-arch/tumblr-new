import { useState, useEffect, useCallback } from "react";
import { listUploads, uploadImage, addLink, uploadsConfigured } from "../lib/uploads";

export type UploadStatus = "idle" | "uploading" | "success" | "error";

export interface UseUploads {
  images: string[];            // displayable URLs of every visitor addition
  configured: boolean;         // false until Supabase env vars are set
  status: UploadStatus;
  error: string | null;
  upload: (file: File) => Promise<void>;   // device / camera roll
  addByLink: (url: string) => Promise<void>; // Cosmos / Are.na / any image link
}

/** Loads the shared pool of visitor additions and lets the current visitor add to it. */
export function useUploads(): UseUploads {
  const [images, setImages] = useState<string[]>([]);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const configured = uploadsConfigured();

  useEffect(() => {
    if (!configured) return;
    let cancelled = false;
    listUploads()
      .then((urls) => { if (!cancelled) setImages(urls); })
      .catch((err) => console.warn("[uploads] list failed", err));
    return () => { cancelled = true; };
  }, [configured]);

  const runAdd = useCallback(async (fn: () => Promise<string>) => {
    setStatus("uploading");
    setError(null);
    try {
      const url = await fn();
      // Prepend so it's clearly "the new one"; also seeds it into the slideshow pool.
      setImages((prev) => (prev.includes(url) ? prev : [url, ...prev]));
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }, []);

  const upload = useCallback((file: File) => runAdd(() => uploadImage(file)), [runAdd]);
  const addByLink = useCallback((url: string) => runAdd(() => addLink(url)), [runAdd]);

  return { images, configured, status, error, upload, addByLink };
}
