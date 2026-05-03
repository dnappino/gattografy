create table if not exists public.favorite_items (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  colony_id uuid references public.colonies(id) on delete cascade,
  cat_id uuid references public.cats(id) on delete cascade,
  created_at timestamptz not null default now(),
  check (colony_id is not null or cat_id is not null),
  unique (profile_id, colony_id),
  unique (profile_id, cat_id)
);

create table if not exists public.moderation_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null,
  target_id text,
  reason text not null,
  details text,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

alter table public.favorite_items enable row level security;
alter table public.moderation_reports enable row level security;

drop policy if exists "users manage own favorites" on public.favorite_items;
create policy "users manage own favorites"
on public.favorite_items for all
to authenticated
using (profile_id = auth.uid())
with check (profile_id = auth.uid());

drop policy if exists "users create moderation reports" on public.moderation_reports;
create policy "users create moderation reports"
on public.moderation_reports for insert
to authenticated
with check (reporter_id = auth.uid());

drop policy if exists "site admin reads moderation reports" on public.moderation_reports;
create policy "site admin reads moderation reports"
on public.moderation_reports for select
to authenticated
using (public.is_site_admin() or reporter_id = auth.uid());

drop policy if exists "site admin manages moderation reports" on public.moderation_reports;
create policy "site admin manages moderation reports"
on public.moderation_reports for update
to authenticated
using (public.is_site_admin())
with check (public.is_site_admin());

drop policy if exists "site admin can delete colonies" on public.colonies;
create policy "site admin can delete colonies"
on public.colonies for delete
to authenticated
using (public.is_site_admin());

drop policy if exists "authors or site admin delete forum threads" on public.forum_threads;
create policy "authors or site admin delete forum threads"
on public.forum_threads for delete
to authenticated
using (author_id = auth.uid() or public.is_site_admin());

drop policy if exists "authors or site admin delete forum posts" on public.forum_posts;
create policy "authors or site admin delete forum posts"
on public.forum_posts for delete
to authenticated
using (author_id = auth.uid() or public.is_site_admin());

drop policy if exists "authors recipients or site admin delete messages" on public.messages;
create policy "authors recipients or site admin delete messages"
on public.messages for delete
to authenticated
using (sender_id = auth.uid() or recipient_id = auth.uid() or public.is_site_admin());

drop policy if exists "authors or site admin delete comments" on public.comments;
create policy "authors or site admin delete comments"
on public.comments for delete
to authenticated
using (created_by = auth.uid() or public.is_site_admin());
