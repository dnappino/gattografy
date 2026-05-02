alter type public.report_type add value if not exists 'adoption_request';

drop policy if exists "colony members are readable" on public.colony_members;
create policy "colony members are readable"
on public.colony_members for select
to anon, authenticated
using (true);

create table if not exists public.change_log (
  id uuid primary key default gen_random_uuid(),
  colony_id uuid references public.colonies(id) on delete cascade,
  entity_type text not null,
  entity_id text,
  action text not null,
  summary text not null,
  actor_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.change_log enable row level security;

drop policy if exists "change log readable by authenticated users" on public.change_log;
create policy "change log readable by authenticated users"
on public.change_log for select
to authenticated
using (true);

drop policy if exists "authenticated users create change log" on public.change_log;
create policy "authenticated users create change log"
on public.change_log for insert
to authenticated
with check (actor_id = auth.uid() or public.is_site_admin());

drop policy if exists "participation requests visible to requester or colony responsible" on public.participation_requests;
create policy "participation requests visible to requester or colony responsible"
on public.participation_requests for select
to authenticated
using (
  profile_id = auth.uid()
  or public.is_site_admin()
  or exists (
    select 1
    from public.colonies
    where colonies.id = participation_requests.colony_id
      and colonies.colony_admin_id = auth.uid()
  )
);

drop policy if exists "users request colony collaboration" on public.participation_requests;
create policy "users request colony collaboration"
on public.participation_requests for insert
to authenticated
with check (profile_id = auth.uid());

drop policy if exists "responsible decides collaboration requests" on public.participation_requests;
create policy "responsible decides collaboration requests"
on public.participation_requests for update
to authenticated
using (
  public.is_site_admin()
  or exists (
    select 1
    from public.colonies
    where colonies.id = participation_requests.colony_id
      and colonies.colony_admin_id = auth.uid()
  )
)
with check (
  public.is_site_admin()
  or exists (
    select 1
    from public.colonies
    where colonies.id = participation_requests.colony_id
      and colonies.colony_admin_id = auth.uid()
  )
);

create index if not exists change_log_colony_created_idx
on public.change_log (colony_id, created_at desc);

notify pgrst, 'reload schema';
