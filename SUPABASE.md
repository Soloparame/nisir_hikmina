# Supabase setup for Nisir Health

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

1. Go to **Storage** → **New bucket**
2. Name: `doctor-images`
3. Enable **Public bucket**
4. Add policy: authenticated users can **INSERT**; public can **SELECT**

## 5. Admin user

1. Go to **Authentication** → **Users** → **Add user**
2. Create an email/password for yourself
3. Use those credentials at `/admin/login`

## 6. Admin panel

- Login: http://localhost:3000/admin/login
- Manage doctors: http://localhost:3000/admin/doctors

Patients book at `/book` — they pick a doctor first, then fill the form.
