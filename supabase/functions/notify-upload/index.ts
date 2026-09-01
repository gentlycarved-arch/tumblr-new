// Supabase Edge Function: screens + notifies on each new visitor upload.
//
// Triggered by a Database Webhook on INSERT into storage.objects (bucket "uploads").
// 1. Decodes the object name (same scheme the site uses) into the image URL + comment.
// 2. If OPENAI_API_KEY is set, runs OpenAI moderation (omni-moderation-latest, free) on the
//    image + comment. If flagged, auto-removes it (or just alerts — see MODERATION_MODE).
// 3. Emails you via Resend (normal "new image" note, or a "flagged" alert).
//
// Required secrets (Edge Functions → Manage secrets):
//   RESEND_API_KEY   — from https://resend.com (free)
//   NOTIFY_EMAIL     — where to send alerts, e.g. gentlycarved@gmail.com
// Optional:
//   OPENAI_API_KEY   — from https://platform.openai.com — enables auto-moderation (free endpoint)
//   MODERATION_MODE  — "delete" (default: remove flagged uploads) or "flag" (keep, just alert)
//   WEBHOOK_SECRET   — if set, the webhook must send a matching `x-webhook-secret` header
//   FROM_EMAIL       — defaults to "tahreem.cv <onboarding@resend.dev>" (works with no domain setup)
//
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically by the platform.

const BUCKET = "uploads";
const LINK_PREFIX = "link-";
const CONF_PREFIX = "conf-";
const COMMENT_SEP = "@";

function b64urlDecode(s: string): string | null {
  try {
    let b64 = s.replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    const bin = atob(b64);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

// Mirror of the site's decodeRow(): object name -> { url, comment, song, kind }
function decode(name: string, supabaseUrl: string): { url: string; comment: string; song: string; kind: "link" | "upload" } | null {
  const parseMeta = (stem: string) => {
    const i = stem.indexOf(COMMENT_SEP);
    if (i === -1) return { head: stem, comment: "", song: "" };
    const head = stem.slice(0, i);
    const raw = b64urlDecode(stem.slice(i + 1)) ?? "";
    if (raw.startsWith("json:")) {
      try {
        const o = JSON.parse(raw.slice(5));
        return { head, comment: o.c ?? "", song: o.s ?? "" };
      } catch {
        return { head, comment: "", song: "" };
      }
    }
    return { head, comment: raw, song: "" };
  };

  if (name.startsWith(LINK_PREFIX) && name.endsWith(".txt")) {
    const { head, comment, song } = parseMeta(name.slice(LINK_PREFIX.length, -4));
    const url = b64urlDecode(head);
    return url ? { url, comment, song, kind: "link" } : null;
  }
  const dot = name.lastIndexOf(".");
  const stem = dot === -1 ? name : name.slice(0, dot);
  const { comment, song } = parseMeta(stem);
  const url = `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${encodeURIComponent(name)}`;
  return { url, comment, song, kind: "upload" };
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Run OpenAI moderation on the image (+ comment). Returns flagged categories, or [] if clean / unavailable.
async function moderate(imageUrl: string, comment: string): Promise<{ ran: boolean; flagged: boolean; categories: string[] }> {
  const key = Deno.env.get("OPENAI_API_KEY");
  if (!key) return { ran: false, flagged: false, categories: [] };
  try {
    const input: unknown[] = [{ type: "image_url", image_url: { url: imageUrl } }];
    if (comment) input.unshift({ type: "text", text: comment });
    const res = await fetch("https://api.openai.com/v1/moderations", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "omni-moderation-latest", input }),
    });
    if (!res.ok) {
      console.error("moderation error", res.status, await res.text().catch(() => ""));
      return { ran: false, flagged: false, categories: [] };
    }
    const data = await res.json();
    const result = data?.results?.[0];
    const flagged = !!result?.flagged;
    const categories = flagged
      ? Object.entries(result.categories ?? {}).filter(([, v]) => v).map(([k]) => k)
      : [];
    return { ran: true, flagged, categories };
  } catch (e) {
    console.error("moderation call failed", e);
    return { ran: false, flagged: false, categories: [] };
  }
}

// Text-only moderation (for confessions).
async function moderateText(text: string): Promise<{ ran: boolean; flagged: boolean; categories: string[] }> {
  const key = Deno.env.get("OPENAI_API_KEY");
  if (!key || !text) return { ran: false, flagged: false, categories: [] };
  try {
    const res = await fetch("https://api.openai.com/v1/moderations", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "omni-moderation-latest", input: text }),
    });
    if (!res.ok) {
      console.error("moderation error", res.status, await res.text().catch(() => ""));
      return { ran: false, flagged: false, categories: [] };
    }
    const data = await res.json();
    const r = data?.results?.[0];
    const flagged = !!r?.flagged;
    return { ran: true, flagged, categories: flagged ? Object.entries(r.categories ?? {}).filter(([, v]) => v).map(([k]) => k) : [] };
  } catch (e) {
    console.error("moderation call failed", e);
    return { ran: false, flagged: false, categories: [] };
  }
}

function decodeConfession(name: string): string | null {
  const stem = name.slice(CONF_PREFIX.length, -4); // strip "conf-" and ".txt"
  const i = stem.indexOf(COMMENT_SEP);
  return i === -1 ? null : b64urlDecode(stem.slice(i + 1));
}

async function handleConfession(name: string, supabaseUrl: string): Promise<Response> {
  const text = decodeConfession(name);
  if (!text) return new Response(JSON.stringify({ skipped: "undecodable confession" }), { headers: { "Content-Type": "application/json" } });
  const mod = await moderateText(text);
  const quote = `<blockquote style="font-size:16px;font-style:italic;border-left:3px solid #ccc;margin:0 0 12px;padding:2px 0 2px 12px">“${esc(text)}”</blockquote>`;
  if (mod.flagged) {
    const cats = mod.categories.map(esc).join(", ") || "flagged";
    const html = `<div style="font-family:-apple-system,Helvetica,Arial,sans-serif;max-width:520px">
      <p style="font-size:15px;margin:0 0 6px">⚠️ A flagged <b>confession</b> on <b>tahreem.cv</b></p>
      <p style="font-size:13px;color:#b23;margin:0 0 12px">Moderation flagged: <b>${cats}</b>. It was <b>automatically removed</b>.</p>
      ${quote}</div>`;
    const emailRes = await sendEmail("⚠️ Auto-removed a flagged confession — tahreem.cv", html);
    await deleteObject(name, supabaseUrl);
    return emailRes;
  }
  const html = `<div style="font-family:-apple-system,Helvetica,Arial,sans-serif;max-width:520px">
    <p style="font-size:15px;margin:0 0 12px">New <b>confession</b> on <b>tahreem.cv</b>:</p>
    ${quote}
    ${mod.ran ? '<p style="font-size:12px;color:#999;margin:0">moderation: clean</p>' : ""}</div>`;
  return await sendEmail(`New confession — “${text.slice(0, 60)}”`, html);
}

async function deleteObject(name: string, supabaseUrl: string): Promise<void> {
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  await fetch(`${supabaseUrl}/storage/v1/object/${BUCKET}`, {
    method: "DELETE",
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ prefixes: [name] }),
  });
}

async function sendEmail(subject: string, html: string): Promise<Response> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const to = Deno.env.get("NOTIFY_EMAIL");
  const from = Deno.env.get("FROM_EMAIL") ?? "tahreem.cv <onboarding@resend.dev>";
  if (!apiKey || !to) return new Response("missing RESEND_API_KEY or NOTIFY_EMAIL", { status: 500 });
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject, html }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("Resend error", res.status, text);
    return new Response(`email failed: ${res.status}`, { status: 502 });
  }
  return new Response(JSON.stringify({ sent: true }), { headers: { "Content-Type": "application/json" } });
}

Deno.serve(async (req) => {
  const secret = Deno.env.get("WEBHOOK_SECRET");
  if (secret && req.headers.get("x-webhook-secret") !== secret) {
    return new Response("unauthorized", { status: 401 });
  }

  let payload: { type?: string; record?: { name?: string; bucket_id?: string } };
  try {
    payload = await req.json();
  } catch {
    return new Response("bad request", { status: 400 });
  }

  const rec = payload.record;
  if (payload.type !== "INSERT" || !rec?.name || rec.bucket_id !== BUCKET) {
    return new Response(JSON.stringify({ skipped: true }), { headers: { "Content-Type": "application/json" } });
  }

  const supabaseUrl = (Deno.env.get("SUPABASE_URL") ?? "").replace(/\/$/, "");

  // Confessions (anonymous text) get text-only moderation.
  if (rec.name.startsWith(CONF_PREFIX)) {
    return await handleConfession(rec.name, supabaseUrl);
  }

  const decoded = decode(rec.name, supabaseUrl);
  if (!decoded) {
    return new Response(JSON.stringify({ skipped: "undecodable" }), { headers: { "Content-Type": "application/json" } });
  }

  const commentLine = decoded.comment
    ? `<p style="font-size:16px;margin:0 0 12px"><em>“${esc(decoded.comment)}”</em></p>`
    : `<p style="font-size:14px;color:#888;margin:0 0 12px">(no comment)</p>`;
  const imgBlock = `<a href="${esc(decoded.url)}"><img src="${esc(decoded.url)}" alt="upload"
      style="max-width:100%;border-radius:10px;display:block;margin:0 0 12px" /></a>`;
  const songLine = decoded.song
    ? `<p style="font-size:13px;margin:0 0 12px">🎵 <a href="${esc(decoded.song)}" style="color:#5688be">${esc(decoded.song)}</a></p>`
    : "";

  // --- Moderation ---
  const mod = await moderate(decoded.url, decoded.comment);
  if (mod.flagged) {
    const mode = (Deno.env.get("MODERATION_MODE") ?? "delete").toLowerCase();
    const removed = mode !== "flag";
    // Email BEFORE deleting so the image still renders in the alert.
    const cats = mod.categories.map(esc).join(", ") || "flagged";
    const html = `
      <div style="font-family:-apple-system,Helvetica,Arial,sans-serif;max-width:520px">
        <p style="font-size:15px;margin:0 0 6px">⚠️ A flagged upload on <b>tahreem.cv</b></p>
        <p style="font-size:13px;color:#b23;margin:0 0 12px">
          Moderation flagged: <b>${cats}</b>.
          ${removed ? "It was <b>automatically removed</b>." : "It's <b>still live</b> — review it."}
        </p>
        ${commentLine}
        ${songLine}
        ${imgBlock}
        <p style="font-size:12px;color:#999;margin:0">
          <a href="https://tahreem.cv/moderate.html" style="color:#5688be">open the moderation page</a>
        </p>
      </div>`;
    const emailRes = await sendEmail(removed ? "⚠️ Auto-removed a flagged upload — tahreem.cv" : "⚠️ Flagged upload — tahreem.cv", html);
    if (removed) await deleteObject(rec.name, supabaseUrl);
    return emailRes;
  }

  // --- Clean: normal notification ---
  const html = `
    <div style="font-family:-apple-system,Helvetica,Arial,sans-serif;max-width:520px">
      <p style="font-size:15px;margin:0 0 12px">Someone just added an image to <b>tahreem.cv</b>:</p>
      ${commentLine}
      ${songLine}
      ${imgBlock}
      <p style="font-size:12px;color:#999;margin:0">
        source: ${decoded.kind === "link" ? "pasted link" : "device / camera"} ·
        ${mod.ran ? "moderation: clean · " : ""}
        <a href="${esc(decoded.url)}" style="color:#5688be">open image</a>
      </p>
    </div>`;
  const subject = decoded.comment
    ? `New image on tahreem.cv — “${decoded.comment.slice(0, 60)}”`
    : "New image on tahreem.cv";
  return await sendEmail(subject, html);
});
