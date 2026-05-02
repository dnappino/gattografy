create extension if not exists "pgcrypto";

create type public.app_role as enum ('user', 'verified_volunteer', 'moderator', 'site_admin');
create type public.colony_member_role as enum ('colony_admin', 'editor');
create type public.request_status as enum ('pending', 'approved', 'rejected');
create type public.report_status as enum ('open', 'checking', 'in_progress', 'closed');
create type public.report_type as enum ('sighting', 'birth', 'problem', 'rescue');

create table public.profiles (
  id uuid primary key,
  username text not null unique,
  email text not null,
  avatar_url text,
  role public.app_role not null default 'user',
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, email, avatar_url, role)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'username', ''), split_part(new.email, '@', 1)),
    new.email,
    nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
    'user'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create table public.colonies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  city text not null,
  location_context text,
  lat double precision not null,
  lng double precision not null,
  status text not null default 'Attiva',
  asl_declared boolean not null default false,
  registry_number text,
  health_last_updated date,
  health_record_date date,
  volunteer_name text,
  volunteer_phone text,
  volunteer_call_hours text,
  total_males integer not null default 0,
  sterilized_males integer not null default 0,
  unsterilized_males integer not null default 0,
  total_females integer not null default 0,
  sterilized_females integer not null default 0,
  unsterilized_females integer not null default 0,
  total_sterilized integer not null default 0,
  total_unsterilized integer not null default 0,
  health_notes text,
  source_label text,
  source_url text,
  created_by uuid not null references public.profiles(id),
  colony_admin_id uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.colony_members (
  colony_id uuid not null references public.colonies(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role public.colony_member_role not null default 'editor',
  approved_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  primary key (colony_id, profile_id)
);

create table public.friend_requests (
  id uuid primary key default gen_random_uuid(),
  from_profile_id uuid not null references public.profiles(id) on delete cascade,
  to_profile_id uuid not null references public.profiles(id) on delete cascade,
  status public.request_status not null default 'pending',
  created_at timestamptz not null default now(),
  unique (from_profile_id, to_profile_id)
);

create table public.participation_requests (
  id uuid primary key default gen_random_uuid(),
  colony_id uuid not null references public.colonies(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  message text,
  status public.request_status not null default 'pending',
  decided_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.cats (
  id uuid primary key default gen_random_uuid(),
  colony_id uuid not null references public.colonies(id) on delete cascade,
  name text not null,
  sex text,
  status text,
  notes text,
  sterilized boolean,
  sterilization_date date,
  sterilization_year integer,
  ear_tip boolean not null default false,
  provenance text,
  already_present boolean,
  description text,
  approximate_birth_date date,
  removal_reason text,
  removed_at date,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.cat_photos (
  id uuid primary key default gen_random_uuid(),
  cat_id uuid references public.cats(id) on delete cascade,
  colony_id uuid references public.colonies(id) on delete cascade,
  storage_path text not null,
  caption text,
  uploaded_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  check (cat_id is not null or colony_id is not null)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  colony_id uuid references public.colonies(id) on delete set null,
  cat_id uuid references public.cats(id) on delete set null,
  type public.report_type not null,
  status public.report_status not null default 'open',
  title text not null,
  description text,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  colony_id uuid references public.colonies(id) on delete cascade,
  report_id uuid references public.reports(id) on delete cascade,
  body text not null,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  check (colony_id is not null or report_id is not null)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid references public.profiles(id) on delete cascade,
  colony_id uuid references public.colonies(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  check (recipient_id is not null or colony_id is not null)
);

create or replace function public.is_site_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'site_admin'
  );
$$;

create or replace function public.can_edit_colony(target_colony_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select public.is_site_admin()
    or exists (
      select 1
      from public.colonies
      where id = target_colony_id
        and colony_admin_id = auth.uid()
    )
    or exists (
      select 1
      from public.colony_members
      where colony_id = target_colony_id
        and profile_id = auth.uid()
    );
$$;

alter table public.profiles enable row level security;
alter table public.colonies enable row level security;
alter table public.colony_members enable row level security;
alter table public.friend_requests enable row level security;
alter table public.participation_requests enable row level security;
alter table public.cats enable row level security;
alter table public.cat_photos enable row level security;
alter table public.reports enable row level security;
alter table public.comments enable row level security;
alter table public.messages enable row level security;

create policy "profiles are readable by authenticated users"
on public.profiles for select
to authenticated
using (true);

create policy "users can insert own profile"
on public.profiles for insert
to authenticated
with check (id = auth.uid());

create policy "users can update own profile or site admin can update all"
on public.profiles for update
to authenticated
using (id = auth.uid() or public.is_site_admin())
with check (id = auth.uid() or public.is_site_admin());

create policy "colonies are public"
on public.colonies for select
to anon, authenticated
using (true);

create policy "authenticated users can create colonies they administer"
on public.colonies for insert
to authenticated
with check (created_by = auth.uid() and colony_admin_id = auth.uid());

create policy "site admin or colony editors can update colonies"
on public.colonies for update
to authenticated
using (public.can_edit_colony(id))
with check (public.can_edit_colony(id));

create policy "site admin can delete colonies"
on public.colonies for delete
to authenticated
using (public.is_site_admin());

create policy "colony members are readable"
on public.colony_members for select
to authenticated
using (true);

create policy "site admin or colony admin manages members"
on public.colony_members for all
to authenticated
using (
  public.is_site_admin()
  or exists (
    select 1 from public.colonies
    where id = colony_id
      and colony_admin_id = auth.uid()
  )
)
with check (
  public.is_site_admin()
  or exists (
    select 1 from public.colonies
    where id = colony_id
      and colony_admin_id = auth.uid()
  )
);

create policy "cats are public"
on public.cats for select
to anon, authenticated
using (true);

create policy "site admin or colony editors manage cats"
on public.cats for all
to authenticated
using (public.can_edit_colony(colony_id))
with check (public.can_edit_colony(colony_id));

create policy "reports are publicly readable"
on public.reports for select
to anon, authenticated
using (true);

create policy "authenticated users can create reports"
on public.reports for insert
to authenticated
with check (created_by = auth.uid());

create policy "site admin or colony editors manage reports"
on public.reports for update
to authenticated
using (colony_id is null or public.can_edit_colony(colony_id))
with check (colony_id is null or public.can_edit_colony(colony_id));

create policy "comments are readable"
on public.comments for select
to authenticated
using (true);

create policy "authenticated users can comment"
on public.comments for insert
to authenticated
with check (created_by = auth.uid());

create policy "users read own direct messages or colony messages they can edit"
on public.messages for select
to authenticated
using (
  sender_id = auth.uid()
  or recipient_id = auth.uid()
  or (colony_id is not null and public.can_edit_colony(colony_id))
);

create policy "authenticated users send messages as themselves"
on public.messages for insert
to authenticated
with check (sender_id = auth.uid());
