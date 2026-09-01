import { useState, useEffect, useCallback } from "react";
import { listConfessions, addConfession, uploadsConfigured } from "../lib/uploads";

export type ConfessionStatus = "idle" | "sending" | "success" | "error";

export interface UseConfessions {
  confessions: string[];      // texts, newest first
  configured: boolean;
  status: ConfessionStatus;
  error: string | null;
  submit: (text: string) => Promise<void>;
}

/** Loads the shared pool of anonymous confessions and lets the visitor add one. */
export function useConfessions(): UseConfessions {
  const [confessions, setConfessions] = useState<string[]>([]);
  const [status, setStatus] = useState<ConfessionStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const configured = uploadsConfigured();

  useEffect(() => {
    if (!configured) return;
    let cancelled = false;
    listConfessions()
      .then((rows) => { if (!cancelled) setConfessions(rows.map((r) => r.text)); })
      .catch((err) => console.warn("[confessions] list failed", err));
    return () => { cancelled = true; };
  }, [configured]);

  const submit = useCallback(async (text: string) => {
    setStatus("sending");
    setError(null);
    try {
      await addConfession(text);
      setConfessions((prev) => [text.trim(), ...prev]);
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }, []);

  return { confessions, configured, status, error, submit };
}
