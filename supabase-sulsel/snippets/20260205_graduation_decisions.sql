create table graduation_decisions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  enrollment_id uuid not null references enrollments(id) on delete cascade,
  decision text not null,
  decided_by uuid not null,
  decided_at timestamptz not null default now(),
  note text null,
  unique (event_id, enrollment_id)
);

create index if not exists graduation_decisions_event_id_idx
  on graduation_decisions (event_id);
create index if not exists graduation_decisions_enrollment_id_idx
  on graduation_decisions (enrollment_id);
