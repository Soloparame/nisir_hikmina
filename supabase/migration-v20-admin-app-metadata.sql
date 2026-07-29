-- Admin role must live in app_metadata (raw_app_meta_data), NOT user_metadata.
-- Clients can change user_metadata via updateUser(); they cannot change app_metadata.
--
-- Run in Supabase → SQL Editor (replace the admin email).

-- 1) Put admin on app_metadata
update auth.users
set raw_app_meta_data =
  coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
where lower(email) = lower('PUT_YOUR_ADMIN_EMAIL_HERE');

-- 2) Remove admin from user_metadata if it was there (optional but recommended)
update auth.users
set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) - 'role'
where lower(email) = lower('PUT_YOUR_ADMIN_EMAIL_HERE')
  and coalesce(raw_user_meta_data->>'role', '') = 'admin';

-- 3) Strict is_admin() — only app_metadata.role = admin
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
      and coalesce(raw_app_meta_data->>'role', '') = 'admin'
  );
$$;

-- 4) Verify
select
  email,
  raw_app_meta_data,
  raw_user_meta_data
from auth.users
where lower(email) = lower('PUT_YOUR_ADMIN_EMAIL_HERE');
