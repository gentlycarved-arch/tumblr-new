# Email me when someone adds an image — setup

Sends you an email (with the image shown inline + the comment) every time a visitor
adds an image. The code lives in [`supabase/functions/notify-upload/index.ts`](supabase/functions/notify-upload/index.ts).

How it works: Supabase fires a **webhook** whenever a new file lands in the `uploads`
bucket → a small **Edge Function** decodes the image URL + comment → emails you via
**Resend**. Three one-time setup steps (~10 min), all in dashboards.

## 1. Get a Resend API key (free)
1. Sign up at https://resend.com **using gentlycarved@gmail.com** (matters — see note below).
2. **API Keys → Create API Key** (name it anything, "Full access" is fine). Copy it.

> Resend's free tier is 100 emails/day. Using their shared `onboarding@resend.dev`
> sender, you can email **your own account address** (gentlycarved@gmail.com) with **no
> domain setup**. To send elsewhere or use a custom "from", you'd verify a domain later.

## 2. Deploy the Edge Function
**Supabase → Edge Functions → Deploy a new function** (or "Create function"):
- Name it exactly **`notify-upload`**
- Paste the entire contents of [`supabase/functions/notify-upload/index.ts`](supabase/functions/notify-upload/index.ts)
- Deploy.

(Prefer CLI? `supabase functions deploy notify-upload` from the repo root.)

Then add its secrets — **Edge Functions → (your function) → Manage secrets** (or Project
Settings → Edge Functions → Secrets):
- `RESEND_API_KEY` = the key from step 1
- `NOTIFY_EMAIL` = `gentlycarved@gmail.com`
- *(optional)* `WEBHOOK_SECRET` = any random string, for a bit of abuse protection

## 3. Fire it on every new upload
**Database → Webhooks → Create a new hook**:
- **Table:** schema `storage`, table `objects`
- **Events:** check **Insert** only
- **Webhook type:** **Supabase Edge Functions** → choose **`notify-upload`**
- **HTTP Headers:** if you set `WEBHOOK_SECRET`, add header `x-webhook-secret` = that same value
- Create.

## 4. Test it
Go to **tahreem.cv**, add an image (with a comment), submit. Within a few seconds you
should get an email showing the image + the comment. If not, check **Edge Functions →
notify-upload → Logs** for the error.

## 5. (Optional) Auto-moderation with OpenAI — screens every upload
The function can screen each upload with **OpenAI's moderation API** (the `omni-moderation`
model reads **images**, and the endpoint is **free**). Flagged uploads are removed
automatically and you get a "⚠️ flagged" alert instead of a normal notification.

1. Create a free OpenAI API key at https://platform.openai.com/api-keys
2. **Edge Functions → Manage secrets**, add:
   - `OPENAI_API_KEY` = that key
   - *(optional)* `MODERATION_MODE` = `delete` (default — auto-removes flagged uploads) or
     `flag` (keeps them live but emails you an alert to review)
3. **Re-deploy** `notify-upload` with the latest code (it already contains the moderation
   logic — just paste the current [`index.ts`](supabase/functions/notify-upload/index.ts) again).

If `OPENAI_API_KEY` isn't set, moderation is simply skipped and everything works as before.

> The moderation runs before the email, so a flagged image still shows in the alert; then
> it's deleted. Switch to `MODERATION_MODE=flag` if you'd rather review before removal.

## Notes
- The function ignores anything that isn't a new file in the `uploads` bucket, so it
  won't email on unrelated activity.
- Every clean add triggers one email — including ones you add yourself. If it gets noisy
  once the site is popular, we can batch them (e.g. a daily digest) instead.
- Deleting images from the bucket does **not** email you (only additions do).
