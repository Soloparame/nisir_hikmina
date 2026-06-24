-- Store payment screenshot on appointments (admin always reads this column)
-- + fix payment row insert policy + backfill existing payments
-- Run in Supabase SQL Editor after migration-v14

alter table appointments add column if not exists payment_screenshot_url text;
alter table appointments add column if not exists payment_method text;

-- Copy any existing payment screenshots onto the appointment row
update appointments a
set
  payment_screenshot_url = p.screenshot_url,
  payment_method = coalesce(a.payment_method, p.method)
from appointment_payments p
where p.appointment_id = a.id
  and (a.payment_screenshot_url is null or a.payment_screenshot_url = '');

-- Allow logged-in patients to attach payment rows (including if user_id was null on appointment)
drop policy if exists "Patients insert own appointment payments" on appointment_payments;
drop policy if exists "Bookers insert appointment payments" on appointment_payments;
create policy "Bookers insert appointment payments"
  on appointment_payments for insert
  to authenticated
  with check (
    exists (
      select 1 from appointments a
      where a.id = appointment_id
        and a.status in ('pending_payment', 'pending')
        and (a.user_id = auth.uid() or a.user_id is null)
    )
  );
