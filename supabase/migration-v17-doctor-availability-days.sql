-- Per-period weekday availability for doctors
-- Run in Supabase SQL Editor after migration-v16

alter table doctors add column if not exists morning_days text[];
alter table doctors add column if not exists afternoon_days text[];
alter table doctors add column if not exists evening_days text[];

update doctors
set
  morning_days = coalesce(morning_days, array['monday','tuesday','wednesday','thursday','friday']),
  afternoon_days = coalesce(afternoon_days, array['monday','tuesday','wednesday','thursday','friday']),
  evening_days = coalesce(evening_days, array['monday','tuesday','wednesday','thursday','friday'])
where morning_days is null
   or afternoon_days is null
   or evening_days is null;
