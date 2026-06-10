-- Fix users stuck from when "Confirm email" was ON
-- Run once in Supabase SQL Editor

-- 1) Confirm all auth users that never got confirmed
--    (Disabling "Confirm email" in settings does NOT fix old accounts.)
update auth.users
set
  email_confirmed_at = coalesce(email_confirmed_at, now()),
  confirmed_at = coalesce(confirmed_at, now())
where email_confirmed_at is null;

-- 2) Create missing profiles for existing auth users
insert into public.profiles (id, role, full_name, phone)
select
  u.id,
  case
    when coalesce(u.raw_user_meta_data->>'role', 'patient') in ('patient', 'doctor', 'admin')
      then coalesce(u.raw_user_meta_data->>'role', 'patient')
    else 'patient'
  end,
  nullif(trim(coalesce(u.raw_user_meta_data->>'full_name', '')), ''),
  nullif(trim(coalesce(u.raw_user_meta_data->>'phone', '')), '')
from auth.users u
where not exists (
  select 1 from public.profiles p where p.id = u.id
);
