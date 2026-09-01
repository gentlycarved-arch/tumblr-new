# Visitor image uploads — setup

The site has a **"+" button** (bottom-right) that lets anyone visiting add an image
to the rotating background slideshow, shown to everyone immediately. The menu offers
two ways to add:

- **Upload from device** — on phones this opens the camera roll / "Take Photo"; on
  desktop, the file picker. The image is compressed and stored in Supabase Storage.
- **Paste a link** — Cosmos, Are.na, or any image link. Are.na *block* links are
  auto-resolved to their image. Pasted links are stored only as a tiny pointer (the
  image stays on the other site's CDN), so they cost your Supabase account ~nothing.

The button only appears once the two Supabase env vars are set. Until then, nothing
changes and the site behaves exactly as before.

## One-time setup (~5 minutes)

### 1. Create a free Supabase project
Go to https://supabase.com → sign in → **New project**. Pick any name/password/region.

### 2. Copy your keys
Project **Settings → API**:
- **Project URL** → this is `VITE_SUPABASE_URL`
- **Project API keys → `anon` `public`** → this is `VITE_SUPABASE_ANON_KEY`

(The anon key is *designed* to be public and shipped in the browser — it's safe.)

### 3. Create the storage bucket
**Storage → New bucket**:
- Name: **`uploads`** (exactly)
- Toggle **Public bucket = ON**
- Create.

### 4. Allow anonymous upload + listing
**SQL Editor → New query**, paste this and run it:

```sql
-- Anyone can add an image to the 'uploads' bucket
create policy "Public uploads insert"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'uploads');

-- Anyone can list/read images in the 'uploads' bucket
create policy "Public uploads read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'uploads');
```

### 5. Add the keys locally
In `.env` (copy from `.env.example` if needed):

```
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-ANON-KEY
```

Restart the dev server (`pnpm dev`) — the "+" button now appears.

### 6. Add the keys to your deploy
Whatever builds the **production** site (GitHub Pages / your build step) also needs
these two env vars at build time, or the button won't show live. If you deploy via a
GitHub Action, add them under **Repo Settings → Secrets and variables → Actions** and
pass them into the build step.

## Moderating uploads
Additions appear instantly for everyone (your chosen setting). To remove one:
**Supabase → Storage → `uploads` bucket → delete the file.** It disappears from the
rotation on the next page load. (Pasted links show up as small `link-….txt` files —
deleting those removes the link.)

## Staying inside Supabase's free tier
The free tier is roughly **1 GB storage** and **5 GB egress/month**. Guardrails baked in
to keep you comfortably under it:

- **Compression** — device uploads are downscaled to ~1600 px and re-encoded as WebP
  before storing, turning multi-MB photos into ~200–400 KB. (GIFs pass through to keep
  animation.)
- **A 30-day cache header** on stored images, so repeat visitors don't re-download them.
- **Pasted links cost nothing** — Cosmos/Are.na images are served from their own CDN, not
  yours.
- **A hard cap of 300 total additions** (`MAX_IMAGES` in `src/lib/uploads.ts`). With
  compression that's well under ~120 MB of storage.

> Note: these limits are enforced in the browser, which is right for a personal site but
> not tamper-proof. If this ever gets abused, the robust fix is server-side enforcement
> (a Supabase Edge Function) — ask and it can be added. You can also watch usage any time
> under **Supabase → Reports**.

## Attaching a song to an image
When adding an image, visitors can optionally paste a **YouTube, Apple Music, or Spotify**
link (the only three with free, keyless `iframe` embeds — no paid API involved). While that
image is the current background, a small **"🎵 play this image's song"** pill appears near
the top; clicking it reveals the platform's embedded player. Browsers block autoplay with
sound, so it's always click-to-play, never automatic.

## Guardrails already in place
- Only image files (JPEG/PNG/GIF/WebP/AVIF); source files over **12 MB** are rejected.
- Each upload gets a random unique filename (no overwrites/collisions).
- Pasted links are verified to actually load as an image before being saved for everyone.
- Every addition is tone-classified (dark/light) just like the Are.na images, so the
  light/dark toggle filters them correctly.

## Want it safer later?
If instant public uploads ever feel risky, the common next step is an **approval queue**
(uploads stay hidden until you approve them). That needs a small database table and a
flag — ask and it can be added.
