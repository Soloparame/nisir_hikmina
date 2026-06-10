-- Independent reaction types per user (like + love + insightful together)
-- REQUIRED if you see: duplicate key value violates unique constraint "update_reactions_pkey"
-- Run in Supabase SQL Editor after migration-v10

alter table update_reactions drop constraint if exists update_reactions_pkey;

alter table update_reactions
  add constraint update_reactions_pkey
  primary key (update_id, user_id, reaction);
