-- Migration v22: Make chat-images bucket private + RLS
-- Run this in the Supabase SQL Editor.

-- 1. Make the bucket private
update storage.buckets
  set public = false
where id = 'chat-images';

-- 2. Drop old permissive policies
drop policy if exists "Authenticated users can upload chat images" on storage.objects;
drop policy if exists "Chat images are publicly readable" on storage.objects;
drop policy if exists "Users can delete their own chat images" on storage.objects;

-- 3. Authenticated upload — any logged-in user can upload to chat-images
create policy "Authenticated upload chat images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'chat-images');

-- 4. Participants can read images in their conversations
--    The path format is: <conversation_id>/<timestamp>.<ext>
--    A participant is either the patient or the doctor linked to the conversation.
create policy "Chat participants can read images"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'chat-images'
    and exists (
      select 1 from conversations c
      where
        c.id::text = split_part(name, '/', 1)
        and (
          c.patient_id = auth.uid()
          or c.doctor_id in (
            select d.id from doctors d where d.auth_user_id = auth.uid()
          )
        )
    )
  );

-- 5. Admin can read all chat images
create policy "Admin can read all chat images"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'chat-images'
    and public.is_admin()
  );

-- 6. Users can delete their own uploads
create policy "Users can delete own chat images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'chat-images'
    and owner = auth.uid()
  );
