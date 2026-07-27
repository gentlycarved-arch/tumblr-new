// Supabase Edge Function: deletes one uploaded object, for the private moderation page.
//
// Called by https://tahreem.cv/moderate.html. Gated by a shared password so only you can
// delete. Uses the service-role key (server-side only), so no public delete policy is needed.
//
// Required secret (Edge Functions → Manage secrets):
//   MODERATE_SECRET — a password you choose; the moderation page must send the same value
//
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically by the platform.
// Remember to turn OFF "Verify JWT" for this function (it's called from the browser).

const BUCKET = "uploads";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};

function json(obj: unknown, status = 200): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  const secret = Deno.env.get("MODERATE_SECRET");
  if (!secret) return json({ error: "MODERATE_SECRET is not set on the function" }, 500);

  let body: { secret?: string; name?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "bad request" }, 400);
  }

  if (body.secret !== secret) return json({ error: "wrong password" }, 401);

  const name = (body.name ?? "").trim();
  // Guard against path traversal / folder tricks — we only ever delete a single flat object.
  if (!name || name.includes("/") || name.includes("..")) return json({ error: "invalid name" }, 400);

  const url = (Deno.env.get("SUPABASE_URL") ?? "").replace(/\/$/, "");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  // Batch-delete endpoint takes names in the body (no URL-encoding pitfalls with "@").
  const res = await fetch(`${url}/storage/v1/object/${BUCKET}`, {
    method: "DELETE",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prefixes: [name] }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("delete failed", res.status, text);
    return json({ error: `delete failed (${res.status})`, detail: text.slice(0, 140) }, 502);
  }

  return json({ deleted: name });
});
