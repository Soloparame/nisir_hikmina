-- Allow admins to create/update conversations when confirming a paid booking
-- Run in Supabase SQL Editor after migration-v12

drop policy if exists "Admins manage conversations" on conversations;
create policy "Admins manage conversations"
  on conversations for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Ensure admins can read all appointments (some installs only have patient/doctor read)
drop policy if exists "Admins read appointments" on appointments;
create policy "Admins read appointments"
  on appointments for select
  to authenticated
  using (public.is_admin());
