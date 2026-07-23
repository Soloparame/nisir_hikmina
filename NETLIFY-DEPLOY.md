# Deploying Eagle Medical on Netlify

Admin login and `/book` doctors need Supabase. If login shows **`fetch failed`** or doctors never load, the site was usually built **without** the right environment variables.

## 1. Add environment variables (required)

In **Netlify** → your site → **Site configuration** → **Environment variables**, add the **same names** as in your local `.env.local`:

| Variable | Example |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` **or** `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | From Supabase → **Project Settings** → **API** |
| `NEXT_PUBLIC_SITE_URL` | `https://eaglemedicalcare.com` (doctor welcome emails) |
| `BREVO_API_KEY` | Brevo API key (doctor welcome, password reset, appointment alerts) |
| `BREVO_FROM_EMAIL` | Verified sender email in Brevo (e.g. `noreply@eaglemedicalcare.com`) |

**Important**

- No quotes around values in Netlify.
- No trailing spaces.
- If you set **both** anon and publishable keys, the **anon** key is used first — make sure it is valid, not a placeholder.

## 2. Redeploy after changing env vars

`NEXT_PUBLIC_*` values are baked into the client bundle at **build time**.

After adding or editing variables:

1. **Deploys** → **Trigger deploy** → **Deploy site** (clear cache if offered).
2. Wait for the build to finish.

## 3. Check Supabase is reachable from Netlify

Open in the browser (replace with your Netlify URL):

```text
https://YOUR-SITE.netlify.app/api/health/supabase
```

You want `"configured": true` and `"supabaseReachable": true`.

If `configured` is false → env vars missing or wrong names.

If `configured` is true but `supabaseReachable` is false → Supabase project paused, wrong URL, or network issue; check [Supabase dashboard](https://supabase.com/dashboard) that the project is **active**.

## 4. Admin user

Doctors in the **database** are not the same as an **admin login**:

1. Supabase → **Authentication** → **Users** → **Add user** (email + password).
2. Use that email/password at `https://YOUR-SITE.netlify.app/admin/login`.

## 5. Doctors on `/book`

- Rows must have **`is_active = true`** in the `doctors` table.
- Run `supabase/schema.sql` in the SQL editor if tables/policies are missing.

## 6. Netlify Next.js plugin

This repo includes `netlify.toml` with `@netlify/plugin-nextjs`. Netlify usually installs it automatically; if builds fail, enable **Next.js** in the Netlify UI or install the plugin on the site.

## 7. Build errors (secrets scan / OpenTelemetry)

**Secrets scanner blocks deploy** — Netlify may flag `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in the JS bundle. That is expected for public keys. This repo sets `SECRETS_SCAN_OMIT_KEYS` in `netlify.toml`. Do **not** commit `.env.local`; only set keys in Netlify → Environment variables.

**`Cannot resolve "@opentelemetry/api"`** — fixed by declaring `@opentelemetry/api` in `package.json` (required for Edge/middleware bundling on Netlify). After pulling, run `npm install` and redeploy.

If a deploy still fails after env changes: **Deploys** → **Trigger deploy** → enable **Clear cache and deploy site**.
