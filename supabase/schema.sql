-- Run this in Supabase SQL Editor

create table if not exists doctors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_en text,
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

-- Storage bucket for doctor photos (create in Supabase Dashboard > Storage)
-- Bucket name: doctor-images, public: true
-- Policy: authenticated users can upload, public can read
