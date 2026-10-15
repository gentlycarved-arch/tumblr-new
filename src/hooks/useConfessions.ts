import { useState, useEffect, useCallback } from "react";
import { listConfessions, addConfession, uploadsConfigured, type ConfessionKind, type HiringDetails } from "../lib/uploads";

export type ConfessionStatus = "idle" | "sending" | "success" | "error";
export type { ConfessionKind, HiringDetails };
export interface HiringConfession { text: string; details?: HiringDetails }

export interface UseConfessions {
  confessions: string[];      // "a free space" texts, newest first
  hiring: HiringConfession[]; // bad hiring practices in design interviews, newest first
  configured: boolean;
  status: ConfessionStatus;
  error: string | null;
  submit: (text: string, kind?: ConfessionKind, details?: HiringDetails) => Promise<void>;
}

/** Loads the shared pool of anonymous confessions and lets the visitor add one. */
export function useConfessions(): UseConfessions {
  const [confessions, setConfessions] = useState<string[]>([]);
  const [hiring, setHiring] = useState<HiringConfession[]>([]);
  const [status, setStatus] = useState<ConfessionStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const configured = uploadsConfigured();

  useEffect(() => {
    if (!configured) return;
    let cancelled = false;
    listConfessions()
      .then((rows) => {
        if (cancelled) return;
        setConfessions(rows.filter((r) => r.kind === "general").map((r) => r.text));
        setHiring(rows.filter((r) => r.kind === "hiring").map((r) => ({ text: r.text, details: r.details })));
      })
      .catch((err) => console.warn("[confessions] list failed", err));
    return () => { cancelled = true; };
  }, [configured]);

  const submit = useCallback(async (text: string, kind: ConfessionKind = "general", details?: HiringDetails) => {
    setStatus("sending");
    setError(null);
    try {
      await addConfession(text, kind, details);
      if (kind === "hiring") setHiring((prev) => [{ text: text.trim(), details }, ...prev]);
      else setConfessions((prev) => [text.trim(), ...prev]);
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }, []);

  return { confessions, hiring, configured, status, error, submit };
}
