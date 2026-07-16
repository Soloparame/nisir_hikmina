-- Allow linked doctors to read and update their own doctors row (profile, bio,
-- photo, availability). Admin create + welcome email flow is unchanged.
-- Run in Supabase SQL Editor after prior migrations.

-- Doctors can always read their own row (even if is_active = false)
drop policy if exists "Doctors read own profile" on doctors;
create policy "Doctors read own profile"
  on doctors for select
  to authenticated
  using (auth_user_id = auth.uid());

-- Doctors can update their own profile after account is linked
drop policy if exists "Doctors update own profile" on doctors;
create policy "Doctors update own profile"
  on doctors for update
  to authenticated
  using (auth_user_id = auth.uid())
  with check (auth_user_id = auth.uid());

-- Tighten admin policy (was open to every authenticated user)
drop policy if exists "Admins manage doctors" on doctors;
create policy "Admins manage doctors"
  on doctors for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
