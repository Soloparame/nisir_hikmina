-- Daily updates / what's new (home + full feed with reactions & comments)
-- Run in Supabase SQL Editor

create table if not exists updates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  title_en text,
  content text not null,
  content_en text,
  image_url text,
  is_published boolean not null default true,
  view_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists update_comments (
  id uuid primary key default gen_random_uuid(),
  update_id uuid not null references updates(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists update_reactions (
  update_id uuid not null references updates(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reaction text not null check (reaction in ('like', 'love', 'insightful')),
  created_at timestamptz not null default now(),
  primary key (update_id, user_id, reaction)
);

create table if not exists update_reads (
  update_id uuid not null references updates(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (update_id, user_id)
);

create index if not exists updates_published_created_idx
  on updates (is_published, created_at desc);
create index if not exists update_comments_update_id_idx
  on update_comments (update_id, created_at desc);

alter table updates enable row level security;
alter table update_comments enable row level security;
alter table update_reactions enable row level security;
alter table update_reads enable row level security;

drop policy if exists "Public read published updates" on updates;
create policy "Public read published updates"
  on updates for select
  using (is_published = true);

-- Admin CRUD (app enforces admin login; matches doctors table pattern)
drop policy if exists "Admins manage updates" on updates;
create policy "Admins manage updates"
  on updates for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Anyone read update comments" on update_comments;
create policy "Anyone read update comments"
  on update_comments for select
  using (true);

drop policy if exists "Users post update comments" on update_comments;
create policy "Users post update comments"
  on update_comments for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Users delete own comments" on update_comments;
create policy "Users delete own comments"
  on update_comments for delete
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "Anyone read reactions" on update_reactions;
create policy "Anyone read reactions"
  on update_reactions for select
  using (true);

drop policy if exists "Users manage own reactions" on update_reactions;
create policy "Users manage own reactions"
  on update_reactions for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Users read own update reads" on update_reads;
create policy "Users read own update reads"
  on update_reads for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "Users mark updates read" on update_reads;
create policy "Users mark updates read"
  on update_reads for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Users update read timestamp" on update_reads;
create policy "Users update read timestamp"
  on update_reads for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Increment view_count (security definer)
create or replace function public.increment_update_views(p_update_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update updates
  set view_count = view_count + 1
  where id = p_update_id and is_published = true;
end;
$$;

grant execute on function public.increment_update_views(uuid) to anon, authenticated;
