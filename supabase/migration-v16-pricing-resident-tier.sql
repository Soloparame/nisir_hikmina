-- Add resident physician pricing tier
-- Run in Supabase SQL Editor after migration-v12

alter table doctors drop constraint if exists doctors_pricing_tier_check;
alter table doctors add constraint doctors_pricing_tier_check
  check (pricing_tier in ('gp', 'resident', 'specialist', 'senior'));
