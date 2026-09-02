import { useState, useEffect, useCallback, useMemo } from "react";
import { listUploads, uploadImage, addLink, uploadsConfigured, type Upload } from "../lib/uploads";

export type UploadStatus = "idle" | "uploading" | "success" | "error";

export interface UseUploads {
  images: string[];                       // displayable URLs (for the slideshow)
  commentByUrl: Record<string, string>;   // url -> the visitor's note, when they left one
  configured: boolean;                    // false until Supabase env vars are set
  status: UploadStatus;
  error: string | null;
  upload: (file: File, comment?: string) => Promise<void>;   // device / camera roll
  addByLink: (url: string, comment?: string) => Promise<void>; // Cosmos / Are.na / any image link
}

/** Loads the shared pool of visitor additions and lets the current visitor add to it. */
export function useUploads(): UseUploads {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const configured = uploadsConfigured();

  useEffect(() => {
    if (!configured) return;
    let cancelled = false;
    listUploads()
      .then((rows) => { if (!cancelled) setUploads(rows); })
      .catch((err) => console.warn("[uploads] list failed", err));
    return () => { cancelled = true; };
  }, [configured]);

  const runAdd = useCallback(async (comment: string, fn: () => Promise<string>) => {
    setStatus("uploading");
    setError(null);
    try {
      const url = await fn();
      // Prepend so it's clearly "the new one"; also seeds it into the slideshow pool.
      setUploads((prev) => (prev.some((u) => u.url === url) ? prev : [{ url, comment }, ...prev]));
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }, []);

  const upload = useCallback((file: File, comment = "") => runAdd(comment, () => uploadImage(file, comment)), [runAdd]);
  const addByLink = useCallback((url: string, comment = "") => runAdd(comment, () => addLink(url, comment)), [runAdd]);

  const images = useMemo(() => uploads.map((u) => u.url), [uploads]);
  const commentByUrl = useMemo(() => {
    const m: Record<string, string> = {};
    for (const u of uploads) if (u.comment) m[u.url] = u.comment;
    return m;
  }, [uploads]);

  return { images, commentByUrl, configured, status, error, upload, addByLink };
}
