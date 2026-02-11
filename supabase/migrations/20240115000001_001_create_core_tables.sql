create extension if not exists pgcrypto;

do $$
begin
  create type event_program_type as enum ('ORIENTASI', 'KSR_DASAR', 'NON_KSR');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type event_status as enum ('draft', 'published', 'ongoing', 'completed', 'cancelled');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type enrollment_status as enum ('registered', 'validated', 'active', 'withdrawn');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type enrollment_review_status as enum ('pending_review', 'approved', 'rejected');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type pmi_element as enum ('PENGURUS', 'STAF', 'RELAWAN');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type event_role_type as enum ('PANITIA', 'PELATIH', 'OBSERVER');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  program_type event_program_type not null,
  status event_status not null,
  start_date date not null,
  end_date date not null
);

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null,
  user_id uuid null,
  participant_name text not null,
  display_name text null,
  pmi_element pmi_element null,
  status enrollment_status not null,
  review_status enrollment_review_status not null default 'pending_review',
  reviewed_by uuid null,
  reviewed_at timestamptz null,
  review_note text null,
  registered_at date not null,
  created_by uuid null
);

create table if not exists public.event_role_assignments (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null,
  user_id uuid null,
  role event_role_type not null,
  person_name text not null,
  display_name text null,
  assigned_at date not null,
  created_by uuid null
);

create table if not exists public.users (
  id uuid primary key,
  email text null,
  created_at timestamptz not null default now()
);

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

do $$
begin
  if to_regclass('public.enrollments') is not null then
    alter table public.enrollments
      add column if not exists user_id uuid null;
  end if;
end $$;

do $$
begin
  if to_regclass('public.event_role_assignments') is not null then
    alter table public.event_role_assignments
      add column if not exists user_id uuid null;
  end if;
end $$;

do $$
begin
  if to_regclass('public.enrollments') is not null then
    if not exists (
      select 1 from pg_constraint where conname = 'enrollments_event_id_fkey'
    ) then
      alter table public.enrollments
        add constraint enrollments_event_id_fkey
        foreign key (event_id) references public.events(id) on delete cascade;
    end if;
  end if;
end $$;

do $$
begin
  if to_regclass('public.enrollments') is not null then
    if not exists (
      select 1 from pg_constraint where conname = 'enrollments_user_id_fkey'
    ) then
      alter table public.enrollments
        add constraint enrollments_user_id_fkey
        foreign key (user_id) references auth.users(id) on delete set null;
    end if;
  end if;
end $$;

do $$
begin
  if to_regclass('public.enrollments') is not null then
    if not exists (
      select 1 from pg_constraint where conname = 'enrollments_event_user_unique'
    ) then
      alter table public.enrollments
        add constraint enrollments_event_user_unique
        unique (event_id, user_id);
    end if;
  end if;
end $$;

do $$
begin
  if to_regclass('public.event_role_assignments') is not null then
    if not exists (
      select 1 from pg_constraint where conname = 'event_role_assignments_event_id_fkey'
    ) then
      alter table public.event_role_assignments
        add constraint event_role_assignments_event_id_fkey
        foreign key (event_id) references public.events(id) on delete cascade;
    end if;
  end if;
end $$;

do $$
begin
  if to_regclass('public.event_role_assignments') is not null then
    if not exists (
      select 1 from pg_constraint where conname = 'event_role_assignments_user_id_fkey'
    ) then
      alter table public.event_role_assignments
        add constraint event_role_assignments_user_id_fkey
        foreign key (user_id) references auth.users(id) on delete set null;
    end if;
  end if;
end $$;

do $$
begin
  if to_regclass('public.event_role_assignments') is not null then
    if not exists (
      select 1 from pg_constraint where conname = 'event_role_assignments_event_user_unique'
    ) then
      alter table public.event_role_assignments
        add constraint event_role_assignments_event_user_unique
        unique (event_id, user_id);
    end if;
  end if;
end $$;

do $$
begin
  if to_regclass('public.users') is not null then
    if not exists (
      select 1 from pg_constraint where conname = 'users_auth_user_id_fkey'
    ) then
      alter table public.users
        add constraint users_auth_user_id_fkey
        foreign key (id) references auth.users(id) on delete cascade;
    end if;
  end if;
end $$;

create index if not exists enrollments_event_id_idx
  on public.enrollments (event_id);

create index if not exists enrollments_user_id_idx
  on public.enrollments (user_id);

create index if not exists event_role_assignments_event_id_idx
  on public.event_role_assignments (event_id);

create index if not exists event_role_assignments_user_id_idx
  on public.event_role_assignments (user_id);

create index if not exists event_role_assignments_role_idx
  on public.event_role_assignments (role);

do $$
declare
  admin_email text := 'admin@siap-pmi.local';
  admin_password text := 'admin123';
  admin_user_id uuid;
  auth_instance_id uuid;
begin
  if to_regclass('auth.users') is not null then
    select id into admin_user_id from auth.users where email = admin_email limit 1;
    if admin_user_id is null then
      select id into auth_instance_id from auth.instances limit 1;
      if auth_instance_id is null then
        auth_instance_id := '00000000-0000-0000-0000-000000000000';
      end if;
      admin_user_id := gen_random_uuid();
      insert into auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at
      ) values (
        auth_instance_id,
        admin_user_id,
        'authenticated',
        'authenticated',
        admin_email,
        crypt(admin_password, gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}',
        '{"role":"admin"}',
        now(),
        now()
      );
      if to_regclass('auth.identities') is not null then
        insert into auth.identities (
          id,
          user_id,
          identity_data,
          provider,
          provider_id,
          last_sign_in_at,
          created_at,
          updated_at
        ) values (
          gen_random_uuid(),
          admin_user_id,
          json_build_object('sub', admin_user_id::text, 'email', admin_email),
          'email',
          admin_user_id::text,
          now(),
          now(),
          now()
        );
      end if;
    end if;
  end if;

  if to_regclass('public.users') is not null then
    if admin_user_id is not null then
      insert into public.users (id, email)
      values (admin_user_id, admin_email)
      on conflict (id) do nothing;
    end if;
  end if;
end $$;
