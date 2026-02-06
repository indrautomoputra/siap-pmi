drop policy if exists "events_select_public" on public.events;
drop policy if exists "enrollments_select_public" on public.enrollments;
drop policy if exists "event_role_assignments_select_public" on public.event_role_assignments;

do $$
begin
  if to_regclass('public.kap_instruments') is not null then
    execute 'alter table public.kap_instruments enable row level security';
    execute $policy$
      create policy "kap_instruments_select_member"
        on public.kap_instruments
        for select
        using (is_event_member(event_id))
    $policy$;
  end if;
end $$;

do $$
begin
  if to_regclass('public.kap_questions') is not null then
    execute 'alter table public.kap_questions enable row level security';
    execute $policy$
      create policy "kap_questions_select_member"
        on public.kap_questions
        for select
        using (
          exists (
            select 1
            from public.kap_instruments ki
            where ki.id = kap_questions.instrument_id
              and is_event_member(ki.event_id)
          )
        )
    $policy$;
  end if;
end $$;

do $$
begin
  if to_regclass('public.assessment_criteria') is not null then
    execute 'alter table public.assessment_criteria enable row level security';
    execute $policy$
      create policy "assessment_criteria_select_member"
        on public.assessment_criteria
        for select
        using (
          exists (
            select 1
            from public.assessment_instruments ai
            where ai.id = assessment_criteria.instrument_id
              and is_event_member(ai.event_id)
          )
        )
    $policy$;
  end if;
end $$;

do $$
begin
  if to_regclass('public.enrollment_documents') is not null then
    execute 'alter table public.enrollment_documents enable row level security';
    execute $policy$
      create policy "enrollment_documents_select_member"
        on public.enrollment_documents
        for select
        using (
          exists (
            select 1
            from public.enrollments e
            where e.id = enrollment_documents.enrollment_id
              and (
                e.user_id = auth.uid()
                or has_event_role(e.event_id, 'PANITIA')
                or has_event_role(e.event_id, 'OBSERVER')
              )
          )
        )
    $policy$;
  end if;
end $$;

do $$
begin
  if to_regclass('public.enrollment_ksr_basic_details') is not null then
    execute 'alter table public.enrollment_ksr_basic_details enable row level security';
    execute $policy$
      create policy "enrollment_ksr_basic_details_select_member"
        on public.enrollment_ksr_basic_details
        for select
        using (
          exists (
            select 1
            from public.enrollments e
            where e.id = enrollment_ksr_basic_details.enrollment_id
              and (
                e.user_id = auth.uid()
                or has_event_role(e.event_id, 'PANITIA')
                or has_event_role(e.event_id, 'OBSERVER')
              )
          )
        )
    $policy$;
  end if;
end $$;

do $$
begin
  if to_regclass('public.enrollment_general_details') is not null then
    execute 'alter table public.enrollment_general_details enable row level security';
    execute $policy$
      create policy "enrollment_general_details_select_member"
        on public.enrollment_general_details
        for select
        using (
          exists (
            select 1
            from public.enrollments e
            where e.id = enrollment_general_details.enrollment_id
              and (
                e.user_id = auth.uid()
                or has_event_role(e.event_id, 'PANITIA')
                or has_event_role(e.event_id, 'OBSERVER')
              )
          )
        )
    $policy$;
  end if;
end $$;

do $$
begin
  if to_regclass('public.graduation_decisions') is not null then
    execute 'alter table public.graduation_decisions enable row level security';
    execute $policy$
      create policy "graduation_decisions_select_view_report"
        on public.graduation_decisions
        for select
        using (
          has_event_role(event_id, 'PANITIA')
          or has_event_role(event_id, 'OBSERVER')
        )
    $policy$;
  end if;
end $$;

do $$
begin
  if to_regclass('public.audit_logs') is not null then
    execute 'alter table public.audit_logs enable row level security';
    execute $policy$
      create policy "audit_logs_select_panitia_or_observer"
        on public.audit_logs
        for select
        using (
          has_event_role(event_id, 'PANITIA')
          or has_event_role(event_id, 'OBSERVER')
        )
    $policy$;
  end if;
end $$;
