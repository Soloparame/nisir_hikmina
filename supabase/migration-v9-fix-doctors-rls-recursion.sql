-- Fix: infinite recursion on doctors table
-- Cause: "Patients read conversation doctors" queries conversations, and
--        conversations policies query doctors → infinite loop.
-- Run once in Supabase SQL Editor.

-- Remove the recursive policy (public "Anyone can read active doctors" is enough for booking + chat)
drop policy if exists "Patients read conversation doctors" on doctors;

-- Safe helper: check if current user is the linked doctor (no RLS recursion)
create or replace function public.is_linked_doctor(p_doctor_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from doctors d
    where d.id = p_doctor_id
      and d.auth_user_id = auth.uid()
  );
$$;

grant execute on function public.is_linked_doctor(uuid) to authenticated;

-- Conversations: use security definer helper instead of subquery on doctors
drop policy if exists "Participants read conversations" on conversations;

create policy "Participants read conversations"
  on conversations for select
  to authenticated
  using (
    patient_id = auth.uid()
    or public.is_linked_doctor(doctor_id)
    or public.is_admin()
  );

-- Profiles: doctor reading patient — use helper to avoid doctors↔conversations loop
drop policy if exists "Doctors read conversation patient profiles" on profiles;

create policy "Doctors read conversation patient profiles"
  on profiles for select
  to authenticated
  using (
    exists (
      select 1
      from conversations c
      where c.patient_id = profiles.id
        and public.is_linked_doctor(c.doctor_id)
    )
  );

-- Keep existing "Admins manage doctors" policy from schema.sql unchanged.
-- (Admin access is enforced in the app via isAdminRole on server actions.)
