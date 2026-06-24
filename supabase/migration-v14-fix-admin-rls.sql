-- Fix admin RLS: app treats non-patient/non-doctor users as admin, but is_admin() only checked role='admin'
-- Run in Supabase SQL Editor after migration-v13

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
      and coalesce(raw_user_meta_data->>'role', '') not in ('patient', 'doctor')
  );
$$;

-- Ensure admins can read all appointments (some installs lost the open read policy)
drop policy if exists "Admins read appointments" on appointments;
create policy "Admins read appointments"
  on appointments for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins manage conversations" on conversations;
create policy "Admins manage conversations"
  on conversations for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
