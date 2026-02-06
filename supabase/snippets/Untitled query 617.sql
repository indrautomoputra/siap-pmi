-- 1) Enum types
create type event_program_type as enum ('KSR_DASAR', 'NON_KSR');
create type event_status as enum ('draft', 'published', 'closed', 'cancelled');
create type enrollment_status as enum ('registered', 'validated', 'active', 'withdrawn');
create type pmi_element as enum ('PENGURUS', 'STAF', 'RELAWAN');
create type event_role_type as enum ('PANITIA', 'PELATIH', 'OBSERVER');

-- 2) events
create table events (
  id text primary key,
  name text not null,
  program_type event_program_type not null,
  status event_status not null,
  start_date date not null,
  end_date date not null
);

-- 3) enrollments
create table enrollments (
  id text primary key,
  event_id text not null references events(id),
  participant_name text not null,
  pmi_element pmi_element,
  status enrollment_status not null,
  registered_at date not null,
  unique (event_id, participant_name)
);

-- 4) event_role_assignments
create table event_role_assignments (
  id text primary key,
  event_id text not null references events(id),
  role event_role_type not null,
  person_name text not null,
  assigned_at date not null,
  unique (event_id, person_name, role)
);