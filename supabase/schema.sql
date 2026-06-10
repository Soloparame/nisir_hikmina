-- Run this in Supabase SQL Editor
-- After this file, also run: migration-v2-auth-chat-availability.sql

create table if not exists doctors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_en text,
  category text,
  specialization text not null,
  specialization_en text,
  bio text,
  bio_en text,
  image_url text,
  experience_years integer not null default 0,
  languages text[] not null default array['አማርኛ'],
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Existing installations: ensure the new column exists
alter table doctors add column if not exists category text;

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid references doctors(id) on delete set null,
  patient_name text not null,
  phone text not null,
  disease text not null,
  telegram text not null,
  country text,
  city text,
  consult_type text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

alter table doctors enable row level security;
alter table appointments enable row level security;

-- Policies: drop first so this script is safe to re-run
drop policy if exists "Anyone can read active doctors" on doctors;
drop policy if exists "Admins manage doctors" on doctors;
drop policy if exists "Anyone can create appointments" on appointments;
drop policy if exists "Admins read appointments" on appointments;

create policy "Anyone can read active doctors"
  on doctors for select
  using (is_active = true);

create policy "Admins manage doctors"
  on doctors for all
  to authenticated
  using (true)
  with check (true);

create policy "Anyone can create appointments"
  on appointments for insert
  with check (true);

create policy "Admins read appointments"
  on appointments for select
  to authenticated
  using (true);

-- ========== Storage: doctor-images ==========
-- Bucket only (SQL). Policies must be added in Dashboard — see supabase/STORAGE-SETUP.md
-- (SQL policies on storage.objects fail with "must be owner of table objects" on hosted Supabase.)

insert into storage.buckets (id, name, public)
values ('doctor-images', 'doctor-images', true)
on conflict (id) do update set public = true;
