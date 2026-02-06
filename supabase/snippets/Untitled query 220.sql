create table kap_instruments (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  title text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table kap_questions (
  id uuid primary key default gen_random_uuid(),
  instrument_id uuid not null references kap_instruments(id) on delete cascade,
  question_text text not null,
  question_type text not null,
  scale_min int null,
  scale_max int null,
  order_no int not null
);

create table kap_responses (
  id uuid primary key default gen_random_uuid(),
  instrument_id uuid not null references kap_instruments(id) on delete cascade,
  enrollment_hash text not null,
  answers jsonb not null,
  submitted_at timestamptz not null default now(),
  unique (instrument_id, enrollment_hash)
);

create index if not exists kap_instruments_event_id_idx on kap_instruments (event_id);
create index if not exists kap_questions_instrument_id_idx on kap_questions (instrument_id);
create index if not exists kap_responses_instrument_id_idx on kap_responses (instrument_id);
