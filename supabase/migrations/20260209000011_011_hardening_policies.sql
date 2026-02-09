do $$
begin
  if to_regclass('public.evaluations') is null then
    create table if not exists public.evaluations (
      id uuid primary key default gen_random_uuid(),
      event_id uuid not null,
      enrollment_id uuid not null,
      responses jsonb not null,
      submitted_at timestamptz not null default now()
    );
  end if;
end $$;

do $$
begin
  if to_regclass('public.evaluations') is not null then
    alter table public.evaluations enable row level security;
  end if;
end $$;

do $$
begin
  if to_regclass('public.evaluations') is not null then
    if not exists (
      select 1 from pg_constraint where conname = 'evaluations_enrollment_id_unique'
    ) then
      alter table public.evaluations
        add constraint evaluations_enrollment_id_unique unique (enrollment_id);
    end if;
  end if;
end $$;

create index if not exists evaluations_event_id_idx
  on public.evaluations (event_id);

do $$
begin
  if to_regclass('public.evaluations') is not null then
    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'evaluations'
        and column_name = 'event_id'
        and data_type = 'uuid'
    ) and exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'events'
        and column_name = 'id'
        and data_type = 'uuid'
    ) then
      if not exists (
        select 1 from pg_constraint where conname = 'evaluations_event_id_fkey'
      ) then
        alter table public.evaluations
          add constraint evaluations_event_id_fkey
          foreign key (event_id) references public.events(id) on delete cascade;
      end if;
    end if;
  end if;
end $$;

do $$
begin
  if to_regclass('public.evaluations') is not null then
    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'evaluations'
        and column_name = 'enrollment_id'
        and data_type = 'uuid'
    ) and exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'enrollments'
        and column_name = 'id'
        and data_type = 'uuid'
    ) then
      if not exists (
        select 1 from pg_constraint where conname = 'evaluations_enrollment_id_fkey'
      ) then
        alter table public.evaluations
          add constraint evaluations_enrollment_id_fkey
          foreign key (enrollment_id) references public.enrollments(id) on delete cascade;
      end if;
    end if;
  end if;
end $$;

do $$
begin
  if to_regclass('public.evaluations') is not null then
    if not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = 'evaluations'
        and policyname = 'evaluations_insert_owner'
    ) then
      create policy "evaluations_insert_owner"
        on public.evaluations
        for insert
        with check (
          exists (
            select 1
            from public.enrollments e
            where e.id::text = evaluations.enrollment_id::text
              and e.user_id::text = (select auth.uid())::text
              and e.event_id::text = evaluations.event_id::text
          )
        );
    end if;
  end if;
end $$;

do $$
begin
  if to_regclass('public.evaluations') is not null then
    if not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = 'evaluations'
        and policyname = 'evaluations_select_owner_or_panitia_or_pelatih'
    ) then
      create policy "evaluations_select_owner_or_panitia_or_pelatih"
        on public.evaluations
        for select
        using (
          exists (
            select 1
            from public.enrollments e
            where e.id::text = evaluations.enrollment_id::text
              and e.user_id::text = (select auth.uid())::text
          )
          or public.has_event_role((select auth.uid()), event_id::text, 'PANITIA')
          or public.has_event_role((select auth.uid()), event_id::text, 'PELATIH')
        );
    end if;
  end if;
end $$;

do $$
begin
  if to_regclass('public.audit_logs') is not null then
    if exists (
      select 1 from pg_policies where schemaname = 'public'
        and tablename = 'audit_logs'
        and policyname = 'audit_logs_insert_actor'
    ) then
      drop policy "audit_logs_insert_actor" on public.audit_logs;
    end if;
    create policy "audit_logs_insert_actor"
      on public.audit_logs
      for insert
      with check (
        (select auth.uid())::text = actor_user_id::text
        and event_id is not null
        and public.is_event_member((select auth.uid()), event_id::text)
      );
  end if;
end $$;

do $$
begin
  if to_regclass('public.graduation_decisions') is not null then
    if exists (
      select 1 from pg_policies where schemaname = 'public'
        and tablename = 'graduation_decisions'
        and policyname = 'graduation_decisions_insert_panitia_or_pelatih'
    ) then
      drop policy "graduation_decisions_insert_panitia_or_pelatih" on public.graduation_decisions;
    end if;
    create policy "graduation_decisions_insert_panitia_or_pelatih"
      on public.graduation_decisions
      for insert
      with check (
        (select auth.uid())::text = decided_by::text
        and exists (
          select 1
          from public.enrollments e
          where e.id::text = graduation_decisions.enrollment_id::text
            and e.event_id::text = graduation_decisions.event_id::text
        )
        and (
          public.has_event_role((select auth.uid()), event_id::text, 'PANITIA')
          or public.has_event_role((select auth.uid()), event_id::text, 'PELATIH')
        )
      );
  end if;
end $$;

do $$
begin
  if to_regclass('public.kap_instruments') is not null then
    if exists (
      select 1 from pg_policies where schemaname = 'public'
        and tablename = 'kap_instruments'
        and policyname = 'kap_instruments_insert_panitia'
    ) then
      drop policy "kap_instruments_insert_panitia" on public.kap_instruments;
    end if;
    create policy "kap_instruments_insert_panitia"
      on public.kap_instruments
      for insert
      with check (public.has_event_role((select auth.uid()), event_id::text, 'PANITIA'));

    if exists (
      select 1 from pg_policies where schemaname = 'public'
        and tablename = 'kap_instruments'
        and policyname = 'kap_instruments_update_panitia'
    ) then
      drop policy "kap_instruments_update_panitia" on public.kap_instruments;
    end if;
    create policy "kap_instruments_update_panitia"
      on public.kap_instruments
      for update
      using (public.has_event_role((select auth.uid()), event_id::text, 'PANITIA'))
      with check (public.has_event_role((select auth.uid()), event_id::text, 'PANITIA'));
  end if;
end $$;

do $$
begin
  if to_regclass('public.kap_questions') is not null then
    if exists (
      select 1 from pg_policies where schemaname = 'public'
        and tablename = 'kap_questions'
        and policyname = 'kap_questions_insert_panitia'
    ) then
      drop policy "kap_questions_insert_panitia" on public.kap_questions;
    end if;
    create policy "kap_questions_insert_panitia"
      on public.kap_questions
      for insert
      with check (
        exists (
          select 1
          from public.kap_instruments ki
          where ki.id::text = kap_questions.instrument_id::text
            and public.has_event_role((select auth.uid()), ki.event_id::text, 'PANITIA')
        )
      );

    if exists (
      select 1 from pg_policies where schemaname = 'public'
        and tablename = 'kap_questions'
        and policyname = 'kap_questions_update_panitia'
    ) then
      drop policy "kap_questions_update_panitia" on public.kap_questions;
    end if;
    create policy "kap_questions_update_panitia"
      on public.kap_questions
      for update
      using (
        exists (
          select 1
          from public.kap_instruments ki
          where ki.id::text = kap_questions.instrument_id::text
            and public.has_event_role((select auth.uid()), ki.event_id::text, 'PANITIA')
        )
      )
      with check (
        exists (
          select 1
          from public.kap_instruments ki
          where ki.id::text = kap_questions.instrument_id::text
            and public.has_event_role((select auth.uid()), ki.event_id::text, 'PANITIA')
        )
      );
  end if;
end $$;

do $$
begin
  if to_regclass('public.assessment_instruments') is not null then
    if exists (
      select 1 from pg_policies where schemaname = 'public'
        and tablename = 'assessment_instruments'
        and policyname = 'assessment_instruments_insert_panitia'
    ) then
      drop policy "assessment_instruments_insert_panitia" on public.assessment_instruments;
    end if;
    create policy "assessment_instruments_insert_panitia"
      on public.assessment_instruments
      for insert
      with check (public.has_event_role((select auth.uid()), event_id::text, 'PANITIA'));

    if exists (
      select 1 from pg_policies where schemaname = 'public'
        and tablename = 'assessment_instruments'
        and policyname = 'assessment_instruments_update_panitia'
    ) then
      drop policy "assessment_instruments_update_panitia" on public.assessment_instruments;
    end if;
    create policy "assessment_instruments_update_panitia"
      on public.assessment_instruments
      for update
      using (public.has_event_role((select auth.uid()), event_id::text, 'PANITIA'))
      with check (public.has_event_role((select auth.uid()), event_id::text, 'PANITIA'));
  end if;
end $$;

do $$
begin
  if to_regclass('public.assessment_criteria') is not null then
    if exists (
      select 1 from pg_policies where schemaname = 'public'
        and tablename = 'assessment_criteria'
        and policyname = 'assessment_criteria_insert_panitia'
    ) then
      drop policy "assessment_criteria_insert_panitia" on public.assessment_criteria;
    end if;
    create policy "assessment_criteria_insert_panitia"
      on public.assessment_criteria
      for insert
      with check (
        exists (
          select 1
          from public.assessment_instruments ai
          where ai.id::text = assessment_criteria.instrument_id::text
            and public.has_event_role((select auth.uid()), ai.event_id::text, 'PANITIA')
        )
      );

    if exists (
      select 1 from pg_policies where schemaname = 'public'
        and tablename = 'assessment_criteria'
        and policyname = 'assessment_criteria_update_panitia'
    ) then
      drop policy "assessment_criteria_update_panitia" on public.assessment_criteria;
    end if;
    create policy "assessment_criteria_update_panitia"
      on public.assessment_criteria
      for update
      using (
        exists (
          select 1
          from public.assessment_instruments ai
          where ai.id::text = assessment_criteria.instrument_id::text
            and public.has_event_role((select auth.uid()), ai.event_id::text, 'PANITIA')
        )
      )
      with check (
        exists (
          select 1
          from public.assessment_instruments ai
          where ai.id::text = assessment_criteria.instrument_id::text
            and public.has_event_role((select auth.uid()), ai.event_id::text, 'PANITIA')
        )
      );
  end if;
end $$;

do $$
begin
  if to_regclass('public.enrollment_documents') is not null then
    if exists (
      select 1 from pg_policies where schemaname = 'public'
        and tablename = 'enrollment_documents'
        and policyname = 'enrollment_documents_insert_owner'
    ) then
      drop policy "enrollment_documents_insert_owner" on public.enrollment_documents;
    end if;
    create policy "enrollment_documents_insert_owner"
      on public.enrollment_documents
      for insert
      with check (
        exists (
          select 1
          from public.enrollments e
          where e.id::text = enrollment_documents.enrollment_id::text
            and e.user_id::text = (select auth.uid())::text
            and public.is_event_member((select auth.uid()), e.event_id::text)
        )
      );

    if exists (
      select 1 from pg_policies where schemaname = 'public'
        and tablename = 'enrollment_documents'
        and policyname = 'enrollment_documents_update_owner'
    ) then
      drop policy "enrollment_documents_update_owner" on public.enrollment_documents;
    end if;
    create policy "enrollment_documents_update_owner"
      on public.enrollment_documents
      for update
      using (
        exists (
          select 1
          from public.enrollments e
          where e.id::text = enrollment_documents.enrollment_id::text
            and e.user_id::text = (select auth.uid())::text
            and public.is_event_member((select auth.uid()), e.event_id::text)
        )
      )
      with check (
        exists (
          select 1
          from public.enrollments e
          where e.id::text = enrollment_documents.enrollment_id::text
            and e.user_id::text = (select auth.uid())::text
            and public.is_event_member((select auth.uid()), e.event_id::text)
        )
      );
  end if;
end $$;

do $$
begin
  if to_regclass('public.enrollment_ksr_basic_details') is not null then
    if exists (
      select 1 from pg_policies where schemaname = 'public'
        and tablename = 'enrollment_ksr_basic_details'
        and policyname = 'enrollment_ksr_basic_details_insert_owner'
    ) then
      drop policy "enrollment_ksr_basic_details_insert_owner" on public.enrollment_ksr_basic_details;
    end if;
    create policy "enrollment_ksr_basic_details_insert_owner"
      on public.enrollment_ksr_basic_details
      for insert
      with check (
        exists (
          select 1
          from public.enrollments e
          where e.id::text = enrollment_ksr_basic_details.enrollment_id::text
            and e.user_id::text = (select auth.uid())::text
            and public.is_event_member((select auth.uid()), e.event_id::text)
        )
      );

    if exists (
      select 1 from pg_policies where schemaname = 'public'
        and tablename = 'enrollment_ksr_basic_details'
        and policyname = 'enrollment_ksr_basic_details_update_owner'
    ) then
      drop policy "enrollment_ksr_basic_details_update_owner" on public.enrollment_ksr_basic_details;
    end if;
    create policy "enrollment_ksr_basic_details_update_owner"
      on public.enrollment_ksr_basic_details
      for update
      using (
        exists (
          select 1
          from public.enrollments e
          where e.id::text = enrollment_ksr_basic_details.enrollment_id::text
            and e.user_id::text = (select auth.uid())::text
            and public.is_event_member((select auth.uid()), e.event_id::text)
        )
      )
      with check (
        exists (
          select 1
          from public.enrollments e
          where e.id::text = enrollment_ksr_basic_details.enrollment_id::text
            and e.user_id::text = (select auth.uid())::text
            and public.is_event_member((select auth.uid()), e.event_id::text)
        )
      );
  end if;
end $$;

do $$
begin
  if to_regclass('public.enrollment_general_details') is not null then
    if exists (
      select 1 from pg_policies where schemaname = 'public'
        and tablename = 'enrollment_general_details'
        and policyname = 'enrollment_general_details_insert_owner'
    ) then
      drop policy "enrollment_general_details_insert_owner" on public.enrollment_general_details;
    end if;
    create policy "enrollment_general_details_insert_owner"
      on public.enrollment_general_details
      for insert
      with check (
        exists (
          select 1
          from public.enrollments e
          where e.id::text = enrollment_general_details.enrollment_id::text
            and e.user_id::text = (select auth.uid())::text
            and public.is_event_member((select auth.uid()), e.event_id::text)
        )
      );

    if exists (
      select 1 from pg_policies where schemaname = 'public'
        and tablename = 'enrollment_general_details'
        and policyname = 'enrollment_general_details_update_owner'
    ) then
      drop policy "enrollment_general_details_update_owner" on public.enrollment_general_details;
    end if;
    create policy "enrollment_general_details_update_owner"
      on public.enrollment_general_details
      for update
      using (
        exists (
          select 1
          from public.enrollments e
          where e.id::text = enrollment_general_details.enrollment_id::text
            and e.user_id::text = (select auth.uid())::text
            and public.is_event_member((select auth.uid()), e.event_id::text)
        )
      )
      with check (
        exists (
          select 1
          from public.enrollments e
          where e.id::text = enrollment_general_details.enrollment_id::text
            and e.user_id::text = (select auth.uid())::text
            and public.is_event_member((select auth.uid()), e.event_id::text)
        )
      );
  end if;
end $$;

do $$
begin
  if to_regclass('public.assessment_scores') is not null then
    if exists (
      select 1 from pg_policies where schemaname = 'public'
        and tablename = 'assessment_scores'
        and policyname = 'assessment_scores_insert_pelatih'
    ) then
      drop policy "assessment_scores_insert_pelatih" on public.assessment_scores;
    end if;
    create policy "assessment_scores_insert_pelatih"
      on public.assessment_scores
      for insert
      with check (
        exists (
          select 1
          from public.assessment_instruments ai
          join public.enrollments e on e.id::text = assessment_scores.enrollment_id::text
          where ai.id::text = assessment_scores.instrument_id::text
            and e.event_id::text = ai.event_id::text
            and public.has_event_role((select auth.uid()), ai.event_id::text, 'PELATIH')
        )
      );
  end if;
end $$;
