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

## Weekly reminder email (Monday morning)

This emails you every Monday with a link to the moderation page and how many images are
live — reusing your existing Resend setup, so it lands right in your inbox. No new edge
function needed. Run this once in the **SQL Editor** (replace `YOUR_RESEND_API_KEY` with the
same key you used for the upload notifications):

```sql
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'weekly-review-email',
  '0 13 * * 1',   -- Mondays 13:00 UTC ≈ 9am Toronto (8am in winter)
  $$
  select net.http_post(
    url := 'https://api.resend.com/emails',
    headers := jsonb_build_object(
      'Authorization', 'Bearer YOUR_RESEND_API_KEY',
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'from', 'tahreem.cv <onboarding@resend.dev>',
      'to', 'gentlycarved@gmail.com',
      'subject', 'Weekly review — tahreem.cv',
      'html', '<p>Time for your weekly review of visitor uploads.</p>'
        || '<p>There '
        || (select case when count(*) = 1 then 'is <b>1 image</b>' else 'are <b>' || count(*) || ' images</b>' end
            from storage.objects where bucket_id = 'uploads')
        || ' currently live.</p>'
        || '<p><a href="https://tahreem.cv/moderate.html">Open the moderation page →</a></p>'
    ),
    timeout_milliseconds := 5000
  );
  $$
);
```

- To change the time, edit the cron (`0 13 * * 1` = minute hour day month weekday, UTC).
- To stop the reminder later: `select cron.unschedule('weekly-review-email');`
- To send yourself a test right now, run just the inner `select net.http_post(...)` part.

