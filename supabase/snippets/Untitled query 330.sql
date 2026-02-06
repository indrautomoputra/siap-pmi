create table assessment_instruments (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  kind text not null,
  title text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table assessment_criteria (
  id uuid primary key default gen_random_uuid(),
  instrument_id uuid not null references assessment_instruments(id) on delete cascade,
  criterion text not null,
  weight int null,
  order_no int not null
);

create table assessment_scores (
  id uuid primary key default gen_random_uuid(),
  instrument_id uuid not null references assessment_instruments(id) on delete cascade,
  enrollment_id uuid not null references enrollments(id) on delete cascade,
  scored_by uuid not null,
  scores jsonb not null,
  submitted_at timestamptz not null default now(),
  unique (instrument_id, enrollment_id)
);

create index if not exists assessment_instruments_event_id_idx
  on assessment_instruments (event_id);
create index if not exists assessment_criteria_instrument_id_idx
  on assessment_criteria (instrument_id);
create index if not exists assessment_scores_instrument_id_idx
  on assessment_scores (instrument_id);
create index if not exists assessment_scores_enrollment_id_idx
  on assessment_scores (enrollment_id);
