-- Step 1 only: create the bucket (usually works in SQL Editor).
-- Step 2 (policies): use the Dashboard — SQL cannot change storage.objects on hosted Supabase.
-- See: supabase/STORAGE-SETUP.md

insert into storage.buckets (id, name, public)
values ('doctor-images', 'doctor-images', true)
on conflict (id) do update set public = true;
