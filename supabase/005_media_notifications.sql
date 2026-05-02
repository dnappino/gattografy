alter table public.colonies
  add column if not exists photo_url text;

alter table public.cats
  add column if not exists photo_url text;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  type text not null,
  title text not null,
  body text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

drop policy if exists "users read own notifications" on public.notifications;
create policy "users read own notifications"
on public.notifications for select
to authenticated
using (recipient_id = auth.uid() or public.is_site_admin());

drop policy if exists "authenticated users create notifications" on public.notifications;
create policy "authenticated users create notifications"
on public.notifications for insert
to authenticated
with check (actor_id = auth.uid() or actor_id is null or public.is_site_admin());

drop policy if exists "users update own notifications" on public.notifications;
create policy "users update own notifications"
on public.notifications for update
to authenticated
using (recipient_id = auth.uid())
with check (recipient_id = auth.uid());

insert into storage.buckets (id, name, public)
values
  ('cat-photos', 'cat-photos', true),
  ('colony-photos', 'colony-photos', true)
on conflict (id) do update set public = true;

drop policy if exists "cat photos public read" on storage.objects;
create policy "cat photos public read"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'cat-photos');

drop policy if exists "cat photos authenticated upload" on storage.objects;
create policy "cat photos authenticated upload"
on storage.objects for insert
to authenticated
with check (bucket_id = 'cat-photos');

drop policy if exists "colony photos public read" on storage.objects;
create policy "colony photos public read"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'colony-photos');

drop policy if exists "colony photos authenticated upload" on storage.objects;
create policy "colony photos authenticated upload"
on storage.objects for insert
to authenticated
with check (bucket_id = 'colony-photos');

notify pgrst, 'reload schema';
