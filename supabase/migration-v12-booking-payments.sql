-- Booking time slots, consultation pricing fields, and payment verification
-- Run in Supabase SQL Editor after migration-v11

-- Doctor pricing tier (GP / Specialist / Senior)
alter table doctors add column if not exists pricing_tier text not null default 'gp';
alter table doctors drop constraint if exists doctors_pricing_tier_check;
alter table doctors add constraint doctors_pricing_tier_check
  check (pricing_tier in ('gp', 'specialist', 'senior'));

-- Appointment scheduling + pricing
alter table appointments add column if not exists consult_type_key text;
alter table appointments add column if not exists scheduled_date date;
alter table appointments add column if not exists scheduled_time time;
alter table appointments add column if not exists amount_etb numeric(10, 2);

alter table appointments drop constraint if exists appointments_consult_type_key_check;
alter table appointments add constraint appointments_consult_type_key_check
  check (consult_type_key is null or consult_type_key in ('text', 'audio', 'video'));

-- New bookings await payment verification (existing rows stay confirmed)
-- Default for new inserts is set in application code; column default kept flexible.

create table if not exists appointment_payments (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references appointments(id) on delete cascade,
  method text not null check (method in ('telebirr', 'cbe')),
  amount_etb numeric(10, 2) not null,
  screenshot_url text not null,
  status text not null default 'pending_review'
    check (status in ('pending_review', 'approved', 'rejected')),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  admin_notes text,
  created_at timestamptz not null default now()
);

create index if not exists appointment_payments_appointment_id_idx
  on appointment_payments(appointment_id);
create index if not exists appointment_payments_status_idx
  on appointment_payments(status);
create index if not exists appointments_doctor_schedule_idx
  on appointments(doctor_id, scheduled_date, scheduled_time);

-- Prevent double-booking the same slot (active bookings only)
create unique index if not exists appointments_doctor_slot_unique_idx
  on appointments(doctor_id, scheduled_date, scheduled_time)
  where status in ('pending_payment', 'confirmed');

alter table appointment_payments enable row level security;

drop policy if exists "Admins manage appointment payments" on appointment_payments;
create policy "Admins manage appointment payments"
  on appointment_payments for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Patients insert own appointment payments" on appointment_payments;
create policy "Patients insert own appointment payments"
  on appointment_payments for insert
  to authenticated
  with check (
    exists (
      select 1 from appointments a
      where a.id = appointment_id
        and a.user_id = auth.uid()
    )
  );

drop policy if exists "Patients read own appointment payments" on appointment_payments;
create policy "Patients read own appointment payments"
  on appointment_payments for select
  to authenticated
  using (
    exists (
      select 1 from appointments a
      where a.id = appointment_id
        and a.user_id = auth.uid()
    )
    or public.is_admin()
  );

drop policy if exists "Doctors read payments for their appointments" on appointment_payments;
create policy "Doctors read payments for their appointments"
  on appointment_payments for select
  to authenticated
  using (
    exists (
      select 1 from appointments a
      join doctors d on d.id = a.doctor_id
      where a.id = appointment_id
        and d.auth_user_id = auth.uid()
    )
  );

-- Appointments: patients & doctors can read their rows
drop policy if exists "Patients read own appointments" on appointments;
create policy "Patients read own appointments"
  on appointments for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "Doctors read their appointments" on appointments;
create policy "Doctors read their appointments"
  on appointments for select
  to authenticated
  using (
    exists (
      select 1 from doctors d
      where d.id = appointments.doctor_id
        and d.auth_user_id = auth.uid()
    )
  );

drop policy if exists "Admins update appointments" on appointments;
create policy "Admins update appointments"
  on appointments for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Payment screenshot storage
insert into storage.buckets (id, name, public)
values ('payment-screenshots', 'payment-screenshots', true)
on conflict (id) do update set public = true;

drop policy if exists "payment screenshots public read" on storage.objects;
create policy "payment screenshots public read"
  on storage.objects for select
  using (bucket_id = 'payment-screenshots');

drop policy if exists "payment screenshots authenticated upload" on storage.objects;
create policy "payment screenshots authenticated upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'payment-screenshots');
