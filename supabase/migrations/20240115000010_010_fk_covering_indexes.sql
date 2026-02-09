do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'assessment_criteria' and column_name = 'instrument_id'
  ) then
    execute 'create index if not exists assessment_criteria_instrument_id_idx on public.assessment_criteria (instrument_id)';
  end if;
end $$;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'enrollments' and column_name = 'user_id'
  ) then
    execute 'create index if not exists enrollments_user_id_idx on public.enrollments (user_id)';
  end if;
end $$;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'event_role_assignments' and column_name = 'user_id'
  ) then
    execute 'create index if not exists event_role_assignments_user_id_idx on public.event_role_assignments (user_id)';
  end if;
end $$;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'kap_questions' and column_name = 'instrument_id'
  ) then
    execute 'create index if not exists kap_questions_instrument_id_idx on public.kap_questions (instrument_id)';
  end if;
end $$;
