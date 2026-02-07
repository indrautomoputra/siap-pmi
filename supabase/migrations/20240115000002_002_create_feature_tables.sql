create table if not exists public.enrollment_documents (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null,
  doc_type text not null,
  file_path text not null,
  uploaded_by uuid null,
  uploaded_at timestamptz not null default now()
);

create table if not exists public.enrollment_ksr_basic_details (
  enrollment_id uuid primary key,
  nik text not null,
  birth_place text not null,
  birth_date date not null,
  gender text not null,
  address text not null,
  phone_number text not null,
  email text not null,
  education text not null,
  occupation text not null,
  blood_type text not null,
  emergency_contact_name text not null,
  emergency_contact_phone text not null
);

create table if not exists public.enrollment_general_details (
  enrollment_id uuid primary key,
  unsur_pmi pmi_element not null,
  nik text not null,
  birth_place text not null,
  birth_date date not null,
  gender text not null,
  address text not null,
  phone_number text not null,
  email text not null,
  education text not null,
  occupation text not null,
  blood_type text not null,
  emergency_contact_name text not null,
  emergency_contact_phone text not null,
  organization_name text null,
  organization_role text null
);

create table if not exists public.assessment_instruments (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null,
  kind text not null,
  title text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.assessment_criteria (
  id uuid primary key default gen_random_uuid(),
  instrument_id uuid not null,
  criterion text not null,
  weight int null,
  order_no int not null
);

create table if not exists public.assessment_scores (
  id uuid primary key default gen_random_uuid(),
  instrument_id uuid not null,
  enrollment_id uuid not null,
  scored_by uuid not null,
  scores jsonb not null,
  submitted_at timestamptz not null default now()
);

create table if not exists public.kap_instruments (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null,
  title text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.kap_questions (
  id uuid primary key default gen_random_uuid(),
  instrument_id uuid not null,
  question_text text not null,
  question_type text not null,
  scale_min int null,
  scale_max int null,
  order_no int not null
);

create table if not exists public.kap_responses (
  id uuid primary key default gen_random_uuid(),
  instrument_id uuid not null,
  enrollment_hash text not null,
  answers jsonb not null,
  submitted_at timestamptz not null default now()
);

create table if not exists public.graduation_decisions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null,
  enrollment_id uuid not null,
  decision text not null,
  decided_by uuid not null,
  decided_at timestamptz not null default now(),
  note text null
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  event_id uuid null,
  actor_user_id uuid not null,
  action text not null,
  entity_type text not null,
  entity_id uuid not null,
  metadata jsonb null,
  created_at timestamptz not null default now()
);

do $$
begin
  if to_regclass('public.enrollment_documents') is not null then
    if not exists (
      select 1 from pg_constraint where conname = 'enrollment_documents_enrollment_id_fkey'
    ) then
      alter table public.enrollment_documents
        add constraint enrollment_documents_enrollment_id_fkey
        foreign key (enrollment_id) references public.enrollments(id) on delete cascade;
    end if;
  end if;
end $$;

do $$
begin
  if to_regclass('public.enrollment_ksr_basic_details') is not null then
    if not exists (
      select 1 from pg_constraint where conname = 'enrollment_ksr_basic_details_enrollment_id_fkey'
    ) then
      alter table public.enrollment_ksr_basic_details
        add constraint enrollment_ksr_basic_details_enrollment_id_fkey
        foreign key (enrollment_id) references public.enrollments(id) on delete cascade;
    end if;
  end if;
end $$;

do $$
begin
  if to_regclass('public.enrollment_general_details') is not null then
    if not exists (
      select 1 from pg_constraint where conname = 'enrollment_general_details_enrollment_id_fkey'
    ) then
      alter table public.enrollment_general_details
        add constraint enrollment_general_details_enrollment_id_fkey
        foreign key (enrollment_id) references public.enrollments(id) on delete cascade;
    end if;
  end if;
end $$;

do $$
begin
  if to_regclass('public.assessment_instruments') is not null then
    if not exists (
      select 1 from pg_constraint where conname = 'assessment_instruments_event_id_fkey'
    ) then
      alter table public.assessment_instruments
        add constraint assessment_instruments_event_id_fkey
        foreign key (event_id) references public.events(id) on delete cascade;
    end if;
  end if;
end $$;

do $$
begin
  if to_regclass('public.assessment_criteria') is not null then
    if not exists (
      select 1 from pg_constraint where conname = 'assessment_criteria_instrument_id_fkey'
    ) then
      alter table public.assessment_criteria
        add constraint assessment_criteria_instrument_id_fkey
        foreign key (instrument_id) references public.assessment_instruments(id) on delete cascade;
    end if;
  end if;
end $$;

do $$
begin
  if to_regclass('public.assessment_scores') is not null then
    if not exists (
      select 1 from pg_constraint where conname = 'assessment_scores_instrument_id_fkey'
    ) then
      alter table public.assessment_scores
        add constraint assessment_scores_instrument_id_fkey
        foreign key (instrument_id) references public.assessment_instruments(id) on delete cascade;
    end if;
  end if;
end $$;

do $$
begin
  if to_regclass('public.assessment_scores') is not null then
    if not exists (
      select 1 from pg_constraint where conname = 'assessment_scores_enrollment_id_fkey'
    ) then
      alter table public.assessment_scores
        add constraint assessment_scores_enrollment_id_fkey
        foreign key (enrollment_id) references public.enrollments(id) on delete cascade;
    end if;
  end if;
end $$;

do $$
begin
  if to_regclass('public.kap_instruments') is not null then
    if not exists (
      select 1 from pg_constraint where conname = 'kap_instruments_event_id_fkey'
    ) then
      alter table public.kap_instruments
        add constraint kap_instruments_event_id_fkey
        foreign key (event_id) references public.events(id) on delete cascade;
    end if;
  end if;
end $$;

do $$
begin
  if to_regclass('public.kap_questions') is not null then
    if not exists (
      select 1 from pg_constraint where conname = 'kap_questions_instrument_id_fkey'
    ) then
      alter table public.kap_questions
        add constraint kap_questions_instrument_id_fkey
        foreign key (instrument_id) references public.kap_instruments(id) on delete cascade;
    end if;
  end if;
end $$;

do $$
begin
  if to_regclass('public.kap_responses') is not null then
    if not exists (
      select 1 from pg_constraint where conname = 'kap_responses_instrument_id_fkey'
    ) then
      alter table public.kap_responses
        add constraint kap_responses_instrument_id_fkey
        foreign key (instrument_id) references public.kap_instruments(id) on delete cascade;
    end if;
  end if;
end $$;

do $$
begin
  if to_regclass('public.graduation_decisions') is not null then
    if not exists (
      select 1 from pg_constraint where conname = 'graduation_decisions_event_id_fkey'
    ) then
      alter table public.graduation_decisions
        add constraint graduation_decisions_event_id_fkey
        foreign key (event_id) references public.events(id) on delete cascade;
    end if;
  end if;
end $$;

do $$
begin
  if to_regclass('public.graduation_decisions') is not null then
    if not exists (
      select 1 from pg_constraint where conname = 'graduation_decisions_enrollment_id_fkey'
    ) then
      alter table public.graduation_decisions
        add constraint graduation_decisions_enrollment_id_fkey
        foreign key (enrollment_id) references public.enrollments(id) on delete cascade;
    end if;
  end if;
end $$;

do $$
begin
  if to_regclass('public.audit_logs') is not null then
    if not exists (
      select 1 from pg_constraint where conname = 'audit_logs_event_id_fkey'
    ) then
      alter table public.audit_logs
        add constraint audit_logs_event_id_fkey
        foreign key (event_id) references public.events(id) on delete cascade;
    end if;
  end if;
end $$;

do $$
begin
  if to_regclass('public.assessment_scores') is not null then
    if not exists (
      select 1 from pg_constraint where conname = 'assessment_scores_instrument_enrollment_unique'
    ) then
      alter table public.assessment_scores
        add constraint assessment_scores_instrument_enrollment_unique
        unique (instrument_id, enrollment_id);
    end if;
  end if;
end $$;

do $$
begin
  if to_regclass('public.kap_responses') is not null then
    if not exists (
      select 1 from pg_constraint where conname = 'kap_responses_instrument_hash_unique'
    ) then
      alter table public.kap_responses
        add constraint kap_responses_instrument_hash_unique
        unique (instrument_id, enrollment_hash);
    end if;
  end if;
end $$;

do $$
begin
  if to_regclass('public.graduation_decisions') is not null then
    if not exists (
      select 1 from pg_constraint where conname = 'graduation_decisions_event_enrollment_unique'
    ) then
      alter table public.graduation_decisions
        add constraint graduation_decisions_event_enrollment_unique
        unique (event_id, enrollment_id);
    end if;
  end if;
end $$;

create index if not exists enrollment_documents_enrollment_id_idx
  on public.enrollment_documents (enrollment_id);

create index if not exists enrollment_documents_doc_type_idx
  on public.enrollment_documents (doc_type);

create index if not exists assessment_instruments_event_id_idx
  on public.assessment_instruments (event_id);

create index if not exists assessment_criteria_instrument_id_idx
  on public.assessment_criteria (instrument_id);

create index if not exists assessment_scores_instrument_id_idx
  on public.assessment_scores (instrument_id);

create index if not exists assessment_scores_enrollment_id_idx
  on public.assessment_scores (enrollment_id);

create index if not exists kap_instruments_event_id_idx
  on public.kap_instruments (event_id);

create index if not exists kap_questions_instrument_id_idx
  on public.kap_questions (instrument_id);

create index if not exists kap_responses_instrument_id_idx
  on public.kap_responses (instrument_id);

create index if not exists graduation_decisions_event_id_idx
  on public.graduation_decisions (event_id);

create index if not exists graduation_decisions_enrollment_id_idx
  on public.graduation_decisions (enrollment_id);

create index if not exists audit_logs_event_id_idx
  on public.audit_logs (event_id);

create index if not exists audit_logs_action_idx
  on public.audit_logs (action);

create index if not exists audit_logs_created_at_idx
  on public.audit_logs (created_at);
