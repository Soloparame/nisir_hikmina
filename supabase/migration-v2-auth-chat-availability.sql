-- Run in Supabase SQL Editor after schema.sql
-- Adds doctor availability, email (admin-only), login codes, patient/doctor profiles, and chat

-- ========== Doctors: availability + email + login code ==========
alter table doctors add column if not exists email text;
alter table doctors add column if not exists login_code text unique;
alter table doctors add column if not exists auth_user_id uuid references auth.users(id) on delete set null;
alter table doctors add column if not exists morning_start time;
alter table doctors add column if not exists morning_end time;
alter table doctors add column if not exists afternoon_start time;
alter table doctors add column if not exists afternoon_end time;
alter table doctors add column if not exists evening_start time;
alter table doctors add column if not exists evening_end time;

create index if not exists doctors_login_code_idx on doctors(login_code);

-- ========== Appointments: link to user + availability slot ==========
alter table appointments add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table appointments add column if not exists availability_period text;
alter table appointments add column if not exists availability_time text;

-- ========== Profiles (patients & doctors) ==========
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('patient', 'doctor', 'admin')),
  full_name text,
  phone text,
  telegram text,
  doctor_id uuid references doctors(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists profiles_doctor_id_idx on profiles(doctor_id);
create index if not exists profiles_role_idx on profiles(role);

-- ========== Conversations & messages ==========
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references auth.users(id) on delete cascade,
  doctor_id uuid not null references doctors(id) on delete cascade,
  appointment_id uuid references appointments(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(patient_id, doctor_id)
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  sender_role text not null check (sender_role in ('patient', 'doctor')),
  content text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists messages_conversation_id_idx on messages(conversation_id);

-- ========== RLS helper (must not query profiles from within profiles policies) ==========
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

-- ========== RLS ==========
alter table profiles enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;

drop policy if exists "Users read own profile" on profiles;
drop policy if exists "Users update own profile" on profiles;
drop policy if exists "Users insert own profile" on profiles;
drop policy if exists "Admins manage profiles" on profiles;

create policy "Users read own profile"
  on profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "Users update own profile"
  on profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users insert own profile"
  on profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "Admins manage profiles"
  on profiles for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Participants read conversations" on conversations;
drop policy if exists "Patients create conversations" on conversations;

create policy "Participants read conversations"
  on conversations for select
  to authenticated
  using (
    patient_id = auth.uid()
    or exists (
      select 1 from doctors d
      where d.id = conversations.doctor_id and d.auth_user_id = auth.uid()
    )
    or public.is_admin()
  );

create policy "Patients create conversations"
  on conversations for insert
  to authenticated
  with check (patient_id = auth.uid());

drop policy if exists "Participants read messages" on messages;
drop policy if exists "Participants send messages" on messages;
drop policy if exists "Participants mark messages read" on messages;

create policy "Participants read messages"
  on messages for select
  to authenticated
  using (
    exists (
      select 1 from conversations c
      where c.id = messages.conversation_id
      and (
        c.patient_id = auth.uid()
        or exists (
          select 1 from doctors d
          where d.id = c.doctor_id and d.auth_user_id = auth.uid()
        )
      )
    )
  );

create policy "Participants send messages"
  on messages for insert
  to authenticated
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from conversations c
      where c.id = conversation_id
      and (
        (c.patient_id = auth.uid() and sender_role = 'patient')
        or exists (
          select 1 from doctors d
          where d.id = c.doctor_id and d.auth_user_id = auth.uid() and sender_role = 'doctor'
        )
      )
    )
  );

create policy "Participants mark messages read"
  on messages for update
  to authenticated
  using (
    exists (
      select 1 from conversations c
      where c.id = messages.conversation_id
      and (
        c.patient_id = auth.uid()
        or exists (
          select 1 from doctors d
          where d.id = c.doctor_id and d.auth_user_id = auth.uid()
        )
      )
    )
  );

-- Patients read their own appointments
drop policy if exists "Patients read own appointments" on appointments;
create policy "Patients read own appointments"
  on appointments for select
  to authenticated
  using (user_id = auth.uid());

-- Doctors read appointments for their patients
drop policy if exists "Doctors read their appointments" on appointments;
create policy "Doctors read their appointments"
  on appointments for select
  to authenticated
  using (
    exists (
      select 1 from doctors d
      where d.id = appointments.doctor_id and d.auth_user_id = auth.uid()
    )
  );
