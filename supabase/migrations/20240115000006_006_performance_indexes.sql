do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'enrollments' and column_name = 'event_id'
  ) and exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'enrollments' and column_name = 'status'
  ) then
    execute 'create index if not exists enrollments_event_status_idx on public.enrollments (event_id, status)';
  end if;
end $$;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'enrollments' and column_name = 'event_id'
  ) and exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'enrollments' and column_name = 'review_status'
  ) then
    execute 'create index if not exists enrollments_event_review_status_idx on public.enrollments (event_id, review_status)';
  end if;
end $$;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'enrollments' and column_name = 'event_id'
  ) and exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'enrollments' and column_name = 'registered_at'
  ) then
    execute 'create index if not exists enrollments_event_registered_at_idx on public.enrollments (event_id, registered_at)';
  end if;
end $$;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'event_role_assignments' and column_name = 'event_id'
  ) and exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'event_role_assignments' and column_name = 'role'
  ) then
    execute 'create index if not exists event_role_assignments_event_role_idx on public.event_role_assignments (event_id, role)';
  end if;
end $$;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'assessment_instruments' and column_name = 'event_id'
  ) and exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'assessment_instruments' and column_name = 'is_active'
  ) then
    execute 'create index if not exists assessment_instruments_event_active_idx on public.assessment_instruments (event_id, is_active)';
  end if;
end $$;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'kap_instruments' and column_name = 'event_id'
  ) and exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'kap_instruments' and column_name = 'is_active'
  ) then
    execute 'create index if not exists kap_instruments_event_active_idx on public.kap_instruments (event_id, is_active)';
  end if;
end $$;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'audit_logs' and column_name = 'event_id'
  ) and exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'audit_logs' and column_name = 'created_at'
  ) then
    execute 'create index if not exists audit_logs_event_created_at_idx on public.audit_logs (event_id, created_at)';
  end if;
end $$;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'events' and column_name = 'status'
  ) then
    execute 'create index if not exists events_status_idx on public.events (status)';
  end if;
end $$;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'events' and column_name = 'program_type'
  ) then
    execute 'create index if not exists events_program_type_idx on public.events (program_type)';
  end if;
end $$;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'events' and column_name = 'start_date'
  ) then
    execute 'create index if not exists events_start_date_idx on public.events (start_date)';
  end if;
end $$;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'events' and column_name = 'end_date'
  ) then
    execute 'create index if not exists events_end_date_idx on public.events (end_date)';
  end if;
end $$;
