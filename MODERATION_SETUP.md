# Moderation page — setup

A private page lists every image currently live on the site so you can remove anything
inappropriate with one click:

**https://tahreem.cv/moderate.html**

It's `noindex` and unlinked, but the delete action is protected by a password so a random
visitor who found the URL still can't remove anything.

## One-time setup (~3 minutes)

The page can already **list** uploads (public info). To enable the **Remove** button you
deploy one small edge function and give it a password.

### 1. Deploy the delete function
**Edge Functions → Deploy a new function → Via Editor**
- Name it exactly **`moderate-delete`**
- Paste the contents of [`supabase/functions/moderate-delete/index.ts`](supabase/functions/moderate-delete/index.ts)
- **Deploy**

### 2. Turn off Verify JWT
Same as the notify function — the page calls it directly from the browser:
**Edge Functions → moderate-delete → Settings → Verify JWT → OFF**

### 3. Set the password
**Edge Functions → Manage secrets** (or Project Settings → Edge Functions → Secrets), add:
- `MODERATE_SECRET` → a password you choose (e.g. a long random string)

That's it — no webhook, no service-role key to copy (the function uses the platform's
built-in service key automatically).

## Using it
1. Open **https://tahreem.cv/moderate.html**
2. Type your `MODERATE_SECRET` in the password box (the browser remembers it after the first time)
3. Click **Remove** on anything that shouldn't be there → it's gone from the rotation on the
   next page load

## How it's secured
- **Listing** images is public — they're already visible on the site, so nothing is exposed.
- **Deleting** goes through the edge function, which checks your `MODERATE_SECRET` and then
  deletes using the server-side service-role key. The service key never touches the browser.
- The password is stored only in your own browser's local storage.

> If you ever want to rotate the password, just change the `MODERATE_SECRET` secret value.
