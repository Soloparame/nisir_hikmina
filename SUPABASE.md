# Supabase setup for Eagle Medical

## 1. Create a Supabase project

Go to [supabase.com](https://supabase.com) and create a new project.

## 2. Environment variables

Copy `.env.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Find these in **Project Settings → API**.

## 3. Database

Open **SQL Editor** and run the script in `supabase/schema.sql`.

## 4. Storage (doctor photos)

If uploads fail with **“new row violates row-level security policy”**, follow **`supabase/STORAGE-SETUP.md`**.

- Run **`supabase/storage-doctor-images.sql`** only to create the bucket (SQL).
- Add **policies in the Supabase Dashboard** (Storage → `doctor-images` → Policies).  
  Policy SQL in the editor often fails with **`must be owner of table objects`** — that is expected on hosted Supabase.

## 5. Admin user

1. Go to **Authentication** → **Users** → **Add user**
2. Create an email/password for yourself
3. Use those credentials at `/admin/login`

## 6. Admin panel

- Login: http://localhost:3000/admin/login
- Manage doctors: http://localhost:3000/admin/doctors

Patients book at `/book` — they pick a doctor first, then fill the form.

## 7. Admin email / Telegram / WhatsApp when someone books

See **`NOTIFICATIONS.md`**. You need at least **`BREVO_API_KEY`** and **`BREVO_FROM_EMAIL`** for email alerts; Telegram and WhatsApp are optional (see that file for setup).

## 8. Netlify production

If admin login shows **`fetch failed`** or `/book` has no doctors, see **`NETLIFY-DEPLOY.md`** and open `/api/health/supabase` on your live site after redeploying.
