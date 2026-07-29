-- Make payment-screenshots PRIVATE.
-- Admins view via signed URLs (app creates them server-side).
-- Patients can upload only into their own folder: {auth.uid()}/...
--
-- Run in Supabase → SQL Editor, then redeploy the app.

-- 1) Private bucket
update storage.buckets
set public = false
where id = 'payment-screenshots';

-- 2) Remove public read
drop policy if exists "payment screenshots public read" on storage.objects;

-- 3) Re-create upload: authenticated users, own folder only
drop policy if exists "payment screenshots authenticated upload" on storage.objects;
create policy "payment screenshots authenticated upload"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'payment-screenshots'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 4) Patients can read their own uploads (optional; admin uses signed URLs via service role)
drop policy if exists "Users read own payment screenshots" on storage.objects;
create policy "Users read own payment screenshots"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'payment-screenshots'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 5) Admins can read all payment screenshots (for createSignedUrl with user session)
drop policy if exists "Admins read payment screenshots" on storage.objects;
create policy "Admins read payment screenshots"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'payment-screenshots'
    and public.is_admin()
  );
