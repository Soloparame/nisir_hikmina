-- Fix chat display names + image storage + auto-confirmed bookings
-- Run in Supabase SQL Editor after migration-v6

-- New bookings are confirmed immediately (no pending step)
alter table appointments alter column status set default 'confirmed';
update appointments set status = 'confirmed' where status = 'pending';

-- Doctors read patient profiles: applied in migration-v9 (uses is_linked_doctor helper)

-- NOTE: Do NOT add a doctors policy that queries conversations — it causes
-- infinite recursion with "Participants read conversations". Active doctors
-- are already public via "Anyone can read active doctors" in schema.sql.

-- Ensure chat-images bucket exists and is public for reads
insert into storage.buckets (id, name, public)
values ('chat-images', 'chat-images', true)
on conflict (id) do update set public = true;

-- Storage policies (safe to re-run)
drop policy if exists "chat images public read" on storage.objects;
create policy "chat images public read"
  on storage.objects for select
  using (bucket_id = 'chat-images');

drop policy if exists "chat images authenticated upload" on storage.objects;
create policy "chat images authenticated upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'chat-images');

drop policy if exists "chat images authenticated update" on storage.objects;
create policy "chat images authenticated update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'chat-images');
