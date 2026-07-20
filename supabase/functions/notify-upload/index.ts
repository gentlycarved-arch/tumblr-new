// Supabase Edge Function: emails the site owner whenever a visitor adds an image.
//
// Triggered by a Database Webhook on INSERT into storage.objects (bucket "uploads").
// Decodes the object name (same scheme the site uses) into the image URL + comment,
// then sends an email (with the image shown inline) via Resend.
//
// Required secrets (Edge Functions → Manage secrets):
//   RESEND_API_KEY   — from https://resend.com (free)
//   NOTIFY_EMAIL     — where to send alerts, e.g. gentlycarved@gmail.com
// Optional:
//   WEBHOOK_SECRET   — if set, the webhook must send a matching `x-webhook-secret` header
//   FROM_EMAIL       — defaults to "tahreem.cv <onboarding@resend.dev>" (works with no domain setup)
//
// SUPABASE_URL is injected automatically by the platform.

const BUCKET = "uploads";
const LINK_PREFIX = "link-";
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

// Mirror of the site's decodeRow(): object name -> { url, comment, kind }
function decode(name: string, supabaseUrl: string): { url: string; comment: string; kind: "link" | "upload" } | null {
  const parseComment = (stem: string) => {
    const i = stem.indexOf(COMMENT_SEP);
    return i === -1
      ? { head: stem, comment: "" }
      : { head: stem.slice(0, i), comment: b64urlDecode(stem.slice(i + 1)) ?? "" };
  };

  if (name.startsWith(LINK_PREFIX) && name.endsWith(".txt")) {
    const { head, comment } = parseComment(name.slice(LINK_PREFIX.length, -4));
    const url = b64urlDecode(head);
    return url ? { url, comment, kind: "link" } : null;
  }
  const dot = name.lastIndexOf(".");
  const stem = dot === -1 ? name : name.slice(0, dot);
  const { comment } = parseComment(stem);
  const url = `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${encodeURIComponent(name)}`;
  return { url, comment, kind: "upload" };
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

Deno.serve(async (req) => {
  // Optional shared-secret check
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
  // Only care about new files in our bucket
  if (payload.type !== "INSERT" || !rec?.name || rec.bucket_id !== BUCKET) {
    return new Response(JSON.stringify({ skipped: true }), { headers: { "Content-Type": "application/json" } });
  }

  const supabaseUrl = (Deno.env.get("SUPABASE_URL") ?? "").replace(/\/$/, "");
  const decoded = decode(rec.name, supabaseUrl);
  if (!decoded) {
    return new Response(JSON.stringify({ skipped: "undecodable" }), { headers: { "Content-Type": "application/json" } });
  }

  const apiKey = Deno.env.get("RESEND_API_KEY");
  const to = Deno.env.get("NOTIFY_EMAIL");
  const from = Deno.env.get("FROM_EMAIL") ?? "tahreem.cv <onboarding@resend.dev>";
  if (!apiKey || !to) {
    return new Response("missing RESEND_API_KEY or NOTIFY_EMAIL", { status: 500 });
  }

  const commentLine = decoded.comment
    ? `<p style="font-size:16px;margin:0 0 12px"><em>“${esc(decoded.comment)}”</em></p>`
    : `<p style="font-size:14px;color:#888;margin:0 0 12px">(no comment)</p>`;

  const html = `
    <div style="font-family:-apple-system,Helvetica,Arial,sans-serif;max-width:520px">
      <p style="font-size:15px;margin:0 0 12px">Someone just added an image to <b>tahreem.cv</b>:</p>
      ${commentLine}
      <a href="${esc(decoded.url)}"><img src="${esc(decoded.url)}" alt="added image"
        style="max-width:100%;border-radius:10px;display:block;margin:0 0 12px" /></a>
      <p style="font-size:12px;color:#999;margin:0">
        source: ${decoded.kind === "link" ? "pasted link" : "device / camera"} ·
        <a href="${esc(decoded.url)}" style="color:#5688be">open image</a>
      </p>
    </div>`;

  const subject = decoded.comment
    ? `New image on tahreem.cv — “${decoded.comment.slice(0, 60)}”`
    : "New image on tahreem.cv";

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
});
