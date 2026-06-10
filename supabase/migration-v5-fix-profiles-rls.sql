-- Fix: infinite recursion in profiles RLS
-- Cause: "Admins manage profiles" queried profiles inside a profiles policy.
-- Run once in Supabase SQL Editor.

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

-- profiles: replace recursive admin policy
drop policy if exists "Admins manage profiles" on profiles;

create policy "Admins manage profiles"
  on profiles for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- conversations: remove profiles subquery (same recursion risk)
drop policy if exists "Participants read conversations" on conversations;

create policy "Participants read conversations"
  on conversations for select
  to authenticated
  using (
    patient_id = auth.uid()
    or exists (
      select 1 from doctors d
      where d.id = conversations.doctor_id
        and d.auth_user_id = auth.uid()
    )
    or public.is_admin()
  );
