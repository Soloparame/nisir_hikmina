-- Auth fix: auto-create profiles + allow doctors to link their account once
-- Run in Supabase SQL Editor after migration-v2

-- Auto-create profile when a user signs up (bypasses RLS timing issues)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  user_role text;
begin
  user_role := coalesce(new.raw_user_meta_data->>'role', 'patient');
  if user_role not in ('patient', 'doctor', 'admin') then
    user_role := 'patient';
  end if;

  insert into public.profiles (id, role, full_name, phone)
  values (
    new.id,
    user_role,
    nullif(trim(coalesce(new.raw_user_meta_data->>'full_name', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data->>'phone', '')), '')
  )
  on conflict (id) do update set
    full_name = coalesce(excluded.full_name, profiles.full_name),
    phone = coalesce(excluded.phone, profiles.phone);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Let a doctor link auth_user_id to their row (email must match admin record)
drop policy if exists "Doctor links own account" on doctors;
create policy "Doctor links own account"
  on doctors for update
  to authenticated
  using (
    auth_user_id is null
    and email is not null
    and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
  with check (auth_user_id = auth.uid());
