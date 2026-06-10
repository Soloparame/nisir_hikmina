-- Chat images + call message types
-- Run in Supabase SQL Editor

alter table messages add column if not exists message_type text not null default 'text';
alter table messages add column if not exists attachment_url text;

alter table messages drop constraint if exists messages_type_check;
alter table messages add constraint messages_type_check
  check (message_type in ('text', 'image', 'call_audio', 'call_video'));

insert into storage.buckets (id, name, public)
values ('chat-images', 'chat-images', true)
on conflict (id) do update set public = true;

-- Storage policies for chat-images
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
