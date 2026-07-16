// Talks to Supabase Storage over its REST API directly (no SDK dependency).
// The anon key is safe to expose in a public site — access is gated by the
// Storage RLS policies you set up (see UPLOADS_SETUP.md).
//
// Two kinds of "additions" live in the same bucket:
//   • device uploads — the compressed image file itself (costs storage + egress)
//   • pasted links   — a tiny 0-byte pointer file whose *name* encodes the external
//                       URL (Cosmos / Are.na / anywhere). The image is served from
//                       that site's CDN, so it costs your Supabase account ~nothing.

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, "");
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const BUCKET = "uploads";

// ---- Free-tier guardrails ----------------------------------------------------
// Supabase free tier ≈ 1 GB storage + 5 GB egress/month. Keeping images small and
// capping the count keeps stored bytes tiny; pasted links don't count at all.
const MAX_IMAGES = 300;                 // hard cap on total shared additions
const MAX_DIMENSION = 1600;             // downscale longest edge to this (px)
const WEBP_QUALITY = 0.82;
const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;   // reject source files over 12 MB pre-compression
const MAX_STORED_BYTES = 2 * 1024 * 1024;    // after compression, never store over 2 MB
const CACHE_SECONDS = 2_592_000;        // 30-day CDN/browser cache → fewer repeat downloads
const LINK_PREFIX = "link-";            // pointer-file naming
const MAX_LINK_LEN = 700;
export const MAX_COMMENT_LEN = 140;     // visitor's "why do you like this image?" note
const COMMENT_SEP = "@";                // delimiter in filenames: allowed by Supabase, never in base64url

const ALLOWED = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/avif"];

export function uploadsConfigured(): boolean {
  return Boolean(SUPABASE_URL && ANON_KEY);
}

/** A visitor addition: the image URL plus the optional note about it. */
export interface Upload {
  url: string;
  comment: string;
}

function authHeaders(): Record<string, string> {
  return { apikey: ANON_KEY as string, Authorization: `Bearer ${ANON_KEY}` };
}

function publicUrl(name: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${encodeURIComponent(name)}`;
}

// filename-safe base64 (UTF-8 safe), used to stash links + comments in a file name.
function b64urlEncode(s: string): string {
  return btoa(unescape(encodeURIComponent(s)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlDecode(s: string): string | null {
  let b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4) b64 += "=";
  try {
    return decodeURIComponent(escape(atob(b64)));
  } catch {
    return null;
  }
}

// A trailing "~<base64url comment>" segment carries the note on either kind of file.
function commentSuffix(comment: string): string {
  const c = comment.trim().slice(0, MAX_COMMENT_LEN);
  return c ? `${COMMENT_SEP}${b64urlEncode(c)}` : "";
}
function parseComment(stem: string): { head: string; comment: string } {
  const i = stem.indexOf(COMMENT_SEP);
  if (i === -1) return { head: stem, comment: "" };
  return { head: stem.slice(0, i), comment: b64urlDecode(stem.slice(i + 1)) ?? "" };
}

function encodeLinkName(url: string, comment: string): string {
  return `${LINK_PREFIX}${b64urlEncode(url)}${commentSuffix(comment)}.txt`;
}

/** Decodes a stored object name back into its image URL + comment. */
function decodeRow(name: string): Upload | null {
  if (name.startsWith(LINK_PREFIX) && name.endsWith(".txt")) {
    const stem = name.slice(LINK_PREFIX.length, -4);
    const { head, comment } = parseComment(stem);
    const url = b64urlDecode(head);
    return url ? { url, comment } : null;
  }
  // A device upload: the object itself is the image; only the comment is encoded.
  const dot = name.lastIndexOf(".");
  const stem = dot === -1 ? name : name.slice(0, dot);
  const { comment } = parseComment(stem);
  return { url: publicUrl(name), comment };
}

// ---- Reading -----------------------------------------------------------------

interface StorageRow { name: string; id?: string | null }

async function listRows(): Promise<StorageRow[]> {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${BUCKET}`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ prefix: "", limit: 1000, sortBy: { column: "created_at", order: "desc" } }),
  });
  if (!res.ok) throw new Error(`Supabase list ${res.status}`);
  const rows = (await res.json()) as StorageRow[];
  // storage returns a placeholder row (id null) for empty folders — skip it
  return rows.filter((r) => r.id !== null && r.name && !r.name.endsWith("/"));
}

/** Every visitor addition (image URL + comment), newest first. */
export async function listUploads(): Promise<Upload[]> {
  if (!uploadsConfigured()) return [];
  const rows = await listRows();
  return rows
    .map((r) => decodeRow(r.name))
    .filter((u): u is Upload => u !== null);
}

async function currentCount(): Promise<number> {
  try {
    return (await listRows()).length;
  } catch {
    return 0; // if the count check fails, don't block the add
  }
}

// ---- Compression -------------------------------------------------------------

function loadImageEl(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read that image."));
    img.src = src;
  });
}

/** Downscale + re-encode to WebP. GIFs pass through untouched (to keep animation). */
async function compress(file: File): Promise<{ body: Blob; ext: string; type: string }> {
  if (file.type === "image/gif") {
    return { body: file, ext: "gif", type: "image/gif" };
  }
  const objUrl = URL.createObjectURL(file);
  try {
    const img = await loadImageEl(objUrl);
    const longest = Math.max(img.width, img.height) || 1;
    const scale = Math.min(1, MAX_DIMENSION / longest);
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return { body: file, ext: extOf(file), type: file.type };
    ctx.drawImage(img, 0, 0, w, h);
    const webp = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/webp", WEBP_QUALITY));
    // Use WebP only if the browser produced a genuine, smaller WebP.
    if (webp && webp.type === "image/webp" && webp.size < file.size) {
      return { body: webp, ext: "webp", type: "image/webp" };
    }
    return { body: file, ext: extOf(file), type: file.type };
  } finally {
    URL.revokeObjectURL(objUrl);
  }
}

function extOf(file: File): string {
  return (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
}

// ---- Writing -----------------------------------------------------------------

async function putObject(name: string, body: Blob | string, contentType: string): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${name}`, {
      method: "POST",
      headers: {
        ...authHeaders(),
        "Content-Type": contentType,
        "x-upsert": "false",
        "cache-control": String(CACHE_SECONDS),
      },
      body,
    });
  } catch {
    throw new Error("Couldn't reach the server — check your connection and try again.");
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Add failed (${res.status}). ${text.slice(0, 140)}`);
  }
}

async function assertRoom(): Promise<void> {
  if ((await currentCount()) >= MAX_IMAGES) {
    throw new Error(`The shared gallery is full (${MAX_IMAGES} images). Ask the owner to make room.`);
  }
}

/** Compress + upload one device/camera-roll image with an optional note. Returns its public URL. */
export async function uploadImage(file: File, comment = ""): Promise<string> {
  if (!uploadsConfigured()) throw new Error("Uploads are not configured.");
  if (!ALLOWED.includes(file.type)) throw new Error("Please choose a JPEG, PNG, GIF, WebP, or AVIF image.");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("That image is over 12 MB — please pick a smaller one.");
  await assertRoom();

  const { body, ext, type } = await compress(file);
  if (body.size > MAX_STORED_BYTES) {
    throw new Error("That image is too large even after compression — please pick a smaller one.");
  }
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${commentSuffix(comment)}.${ext}`;
  await putObject(name, body, type);
  return publicUrl(name);
}

/**
 * Add an image by URL (Cosmos / Are.na / any direct image link). Are.na block links
 * are auto-resolved. Stores only a tiny pointer — no image bytes. Returns the image URL.
 */
export async function addLink(rawUrl: string, comment = ""): Promise<string> {
  if (!uploadsConfigured()) throw new Error("Uploads are not configured.");
  const input = rawUrl.trim();
  if (!input) throw new Error("Please paste an image link.");

  const resolved = (await resolveArena(input)) ?? input;
  if (!/^https?:\/\//i.test(resolved)) throw new Error("That doesn't look like a valid link.");
  if (resolved.length > MAX_LINK_LEN) throw new Error("That link is too long.");

  // Verify it actually loads as an image before saving it for everyone.
  try {
    await loadImageEl(resolved);
  } catch {
    throw new Error("Couldn't load an image from that link. Try right-click → Copy image address.");
  }

  await assertRoom();
  await putObject(encodeLinkName(resolved, comment), "", "text/plain");
  return resolved;
}

/** If the URL is an Are.na block, resolve it to its image src via the Are.na API. */
async function resolveArena(url: string): Promise<string | null> {
  const m = url.match(/are\.na\/block\/(\d+)/i) || url.match(/api\.are\.na\/v2\/blocks\/(\d+)/i);
  if (!m) return null;
  try {
    const res = await fetch(`https://api.are.na/v2/blocks/${m[1]}`);
    if (!res.ok) return null;
    const data = await res.json();
    const img = data?.image;
    return img?.original?.url || img?.display?.url || img?.large?.url || null;
  } catch {
    return null;
  }
}
