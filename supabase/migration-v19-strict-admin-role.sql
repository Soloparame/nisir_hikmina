-- Strict admin check: ONLY users with role = 'admin' are admins.
-- Reverts the loose rule from migration-v14 (anyone who was not patient/doctor).
--
-- Run this in Supabase → SQL Editor BEFORE or when deploying the app change.
--
-- REQUIRED: Your admin Auth user must have user_metadata.role = "admin".
-- Check: Authentication → Users → your admin → User Metadata → { "role": "admin" }
-- Or run the UPDATE at the bottom of this file (edit the email first).

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from auth.users
    where id = auth.uid()
      and coalesce(raw_user_meta_data->>'role', '') = 'admin'
  );
$$;

-- Optional: set role=admin for your admin account (replace the email).
-- update auth.users
-- set raw_user_meta_data =
--   coalesce(raw_user_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
-- where email = 'your-admin@email.com';
