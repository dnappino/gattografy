alter table public.colonies
  add column if not exists location_context text,
  add column if not exists registry_number text,
  add column if not exists health_last_updated date,
  add column if not exists health_record_date date,
  add column if not exists volunteer_name text,
  add column if not exists volunteer_phone text,
  add column if not exists volunteer_call_hours text,
  add column if not exists total_males integer not null default 0,
  add column if not exists sterilized_males integer not null default 0,
  add column if not exists unsterilized_males integer not null default 0,
  add column if not exists total_females integer not null default 0,
  add column if not exists sterilized_females integer not null default 0,
  add column if not exists unsterilized_females integer not null default 0,
  add column if not exists total_sterilized integer not null default 0,
  add column if not exists total_unsterilized integer not null default 0,
  add column if not exists health_notes text,
  add column if not exists source_label text,
  add column if not exists source_url text,
  add column if not exists photo_url text;

alter table public.profiles
  drop constraint if exists profiles_id_fkey;

alter table public.cats
  add column if not exists sterilized boolean,
  add column if not exists sterilization_date date,
  add column if not exists sterilization_year integer,
  add column if not exists photo_url text,
  add column if not exists ear_tip boolean not null default false,
  add column if not exists provenance text,
  add column if not exists already_present boolean,
  add column if not exists description text,
  add column if not exists approximate_birth_date date,
  add column if not exists removal_reason text,
  add column if not exists removed_at date;

delete from public.colony_members;
delete from public.participation_requests;
delete from public.cat_photos;
delete from public.cats;
delete from public.comments;
delete from public.reports;
delete from public.messages;
delete from public.colonies;

do $$
declare
  admin_id uuid;
  default_admin_id uuid := '680841be-e1e1-4f73-ba2c-ef352bc1d2c7';
begin
  insert into public.profiles (id, username, email, role)
  select
    u.id,
    coalesce(nullif(u.raw_user_meta_data ->> 'username', ''), split_part(u.email, '@', 1)),
    u.email,
    'user'
  from auth.users u
  where not exists (
    select 1
    from public.profiles p
    where p.id = u.id
  );

  select id into admin_id
  from public.profiles
  where username in ('admin', 'site_admin')
     or role = 'site_admin'
  order by created_at desc
  limit 1;

  if admin_id is null then
    select id into admin_id
    from public.profiles
    where username = 'ilaria_nappino'
    order by created_at asc
    limit 1;
  end if;

  if admin_id is null then
    insert into public.profiles (id, username, email, role)
    values (
      default_admin_id,
      'admin_default',
      'admin_default@gattografy.local',
      'site_admin'
    )
    on conflict (id) do update
      set role = 'site_admin';

    admin_id := default_admin_id;
  end if;

  insert into public.colonies (
    name,
    address,
    city,
    location_context,
    lat,
    lng,
    status,
    asl_declared,
    registry_number,
    health_notes,
    source_label,
    source_url,
    created_by,
    colony_admin_id
  )
  values
    (
      'Colonia felina della Floridiana',
      'Via Domenico Cimarosa, 77',
      'Napoli',
      'Villa Floridiana, Vomero. Presenza di storica colonia felina citata da fonti pubbliche. Dati sanitari da verificare.',
      40.8386,
      14.2305,
      'Da verificare',
      false,
      'NA-VER-001',
      'Inserita da fonti pubbliche, necessita validazione da volontari/locali e ASL.',
      'Ottopagine Napoli / Corriere Napoli',
      'https://www.ottopagine.it/na/attualita/354538/napoli-villa-floridiana-sconvolto-l-habitat-abituale-del-parco.shtml',
      admin_id,
      admin_id
    ),
    (
      'Colonia felina dei Quartieri Spagnoli',
      'Salita Trinità delle Monache',
      'Napoli',
      'Ex Ospedale Militare / Parco dei Quartieri Spagnoli. Fonti pubbliche citano sopralluogo ASL Napoli 1 Centro e spostamento dall’ex Mercatino di Sant’Anna.',
      40.8431,
      14.2444,
      'Da verificare',
      false,
      'NA-VER-002',
      'Fonte pubblica cita otto gatti e tutrice ufficiale; dati sanitari individuali da censire.',
      'Gazzetta di Napoli / Corriere Napoli / ANSA',
      'https://www.gazzettadinapoli.it/notizie/gatti-comune-salva-colonia-dei-quartieri-spagnoli-verra-spostata-nellex-ospedale-militare/',
      admin_id,
      admin_id
    ),
    (
      'Colonie feline delle Vele di Scampia',
      'Vele di Scampia',
      'Napoli',
      'Area ampia interessata da sgomberi e demolizioni; fonti pubbliche riportano interventi LAV, Comune e ASL Napoli 1 Centro per gatti liberi.',
      40.8997,
      14.2372,
      'Da verificare',
      false,
      'NA-VER-003',
      'Area da suddividere in colonie specifiche dopo sopralluogo; fonti citano gatti recuperati e operazioni di cattura, sterilizzazione e messa in sicurezza.',
      'Internapoli / LaPresse',
      'https://internapoli.it/demolizione-delle-vele-di-scampia-salvati-un-centinaio-di-animali/',
      admin_id,
      admin_id
    ),
    (
      'Colonia felina Via Jannelli - Parco Vanna',
      'Via Gabriele Jannelli, altezza Parco Vanna',
      'Napoli',
      'Vomero; fonte pubblica riporta colonia felina curata da volontaria e grave episodio doloso nel 2020.',
      40.8587,
      14.2239,
      'Da verificare',
      false,
      'NA-VER-004',
      'Colonia da verificare in loco: la fonte è storica e segnala un incendio, quindi stato attuale da confermare.',
      'Il Roma',
      'https://www.ilroma.net/news/cronaca/162664/via-jannelli-ignoti-danno-fuoco-a-una-colonia-di-gatti.html',
      admin_id,
      admin_id
    );
end $$;

notify pgrst, 'reload schema';
