-- Fix: patients/doctors can send messages reliably
-- Run in Supabase SQL Editor after migration-v7

-- Ensure message columns exist (safe if v6 already ran)
alter table messages add column if not exists message_type text not null default 'text';
alter table messages add column if not exists attachment_url text;

alter table messages drop constraint if exists messages_type_check;
alter table messages add constraint messages_type_check
  check (message_type in ('text', 'image', 'call_audio', 'call_video'));

-- Security definer helpers (avoid RLS edge cases during insert checks)
create or replace function public.can_read_conversation(p_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from conversations c
    where c.id = p_conversation_id
      and (
        c.patient_id = auth.uid()
        or exists (
          select 1
          from doctors d
          where d.id = c.doctor_id
            and d.auth_user_id = auth.uid()
        )
        or public.is_admin()
      )
  );
$$;

create or replace function public.can_send_message(
  p_conversation_id uuid,
  p_sender_role text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from conversations c
    where c.id = p_conversation_id
      and (
        (p_sender_role = 'patient' and c.patient_id = auth.uid())
        or (
          p_sender_role = 'doctor'
          and exists (
            select 1
            from doctors d
            where d.id = c.doctor_id
              and d.auth_user_id = auth.uid()
          )
        )
      )
  );
$$;

grant execute on function public.can_read_conversation(uuid) to authenticated;
grant execute on function public.can_send_message(uuid, text) to authenticated;

-- Replace message policies
drop policy if exists "Participants read messages" on messages;
drop policy if exists "Participants send messages" on messages;
drop policy if exists "Participants mark messages read" on messages;

create policy "Participants read messages"
  on messages for select
  to authenticated
  using (public.can_read_conversation(conversation_id));

create policy "Participants send messages"
  on messages for insert
  to authenticated
  with check (
    sender_id = auth.uid()
    and public.can_send_message(conversation_id, sender_role)
  );

create policy "Participants mark messages read"
  on messages for update
  to authenticated
  using (public.can_read_conversation(conversation_id))
  with check (public.can_read_conversation(conversation_id));
