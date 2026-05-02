create table if not exists public.forum_threads (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  category text not null default 'Generale',
  author_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.forum_posts (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.forum_threads(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.forum_threads enable row level security;
alter table public.forum_posts enable row level security;

drop policy if exists "users read own friend requests" on public.friend_requests;
create policy "users read own friend requests"
on public.friend_requests for select
to authenticated
using (from_profile_id = auth.uid() or to_profile_id = auth.uid() or public.is_site_admin());

drop policy if exists "users create own friend requests" on public.friend_requests;
create policy "users create own friend requests"
on public.friend_requests for insert
to authenticated
with check (from_profile_id = auth.uid() and to_profile_id <> auth.uid());

drop policy if exists "friend recipients or site admin update requests" on public.friend_requests;
create policy "friend recipients or site admin update requests"
on public.friend_requests for update
to authenticated
using (to_profile_id = auth.uid() or public.is_site_admin())
with check (to_profile_id = auth.uid() or public.is_site_admin());

drop policy if exists "forum threads are readable" on public.forum_threads;
create policy "forum threads are readable"
on public.forum_threads for select
to authenticated
using (true);

drop policy if exists "authenticated users create forum threads" on public.forum_threads;
create policy "authenticated users create forum threads"
on public.forum_threads for insert
to authenticated
with check (author_id = auth.uid());

drop policy if exists "authors or site admin update forum threads" on public.forum_threads;
create policy "authors or site admin update forum threads"
on public.forum_threads for update
to authenticated
using (author_id = auth.uid() or public.is_site_admin())
with check (author_id = auth.uid() or public.is_site_admin());

drop policy if exists "forum posts are readable" on public.forum_posts;
create policy "forum posts are readable"
on public.forum_posts for select
to authenticated
using (true);

drop policy if exists "authenticated users create forum posts" on public.forum_posts;
create policy "authenticated users create forum posts"
on public.forum_posts for insert
to authenticated
with check (author_id = auth.uid());

drop policy if exists "authors or site admin update forum posts" on public.forum_posts;
create policy "authors or site admin update forum posts"
on public.forum_posts for update
to authenticated
using (author_id = auth.uid() or public.is_site_admin())
with check (author_id = auth.uid() or public.is_site_admin());

notify pgrst, 'reload schema';
