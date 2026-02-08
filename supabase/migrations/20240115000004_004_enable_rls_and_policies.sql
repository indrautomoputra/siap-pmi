alter table public.events enable row level security;
alter table public.enrollments enable row level security;
alter table public.event_role_assignments enable row level security;
alter table public.assessment_instruments enable row level security;
alter table public.assessment_scores enable row level security;
alter table public.kap_responses enable row level security;
alter table public.kap_instruments enable row level security;
alter table public.kap_questions enable row level security;
alter table public.assessment_criteria enable row level security;
alter table public.enrollment_documents enable row level security;
alter table public.enrollment_ksr_basic_details enable row level security;
alter table public.enrollment_general_details enable row level security;
alter table public.graduation_decisions enable row level security;
alter table public.audit_logs enable row level security;
alter table public.evaluations enable row level security;
alter table public.users enable row level security;
alter table public.organizations enable row level security;

drop policy if exists "events_select_public" on public.events;
drop policy if exists "events_write_open" on public.events;
drop policy if exists "events_write_server_only" on public.events;
drop policy if exists "events_select_member" on public.events;
drop policy if exists "events_insert_panitia" on public.events;
drop policy if exists "events_update_panitia" on public.events;
drop policy if exists "events_delete_panitia" on public.events;

drop policy if exists "enrollments_select_public" on public.enrollments;
drop policy if exists "enrollments_write_open" on public.enrollments;
drop policy if exists "enrollments_write_server_only" on public.enrollments;
drop policy if exists "enrollments_insert_owner" on public.enrollments;
drop policy if exists "enrollments_select_owner_or_panitia_or_observer" on public.enrollments;
drop policy if exists "enrollments_update_panitia" on public.enrollments;

drop policy if exists "event_role_assignments_select_public" on public.event_role_assignments;
drop policy if exists "event_role_assignments_write_open" on public.event_role_assignments;
drop policy if exists "event_roles_write_server_only" on public.event_role_assignments;
drop policy if exists "event_roles_select_panitia_or_observer" on public.event_role_assignments;
drop policy if exists "event_roles_insert_panitia" on public.event_role_assignments;
drop policy if exists "event_roles_update_panitia" on public.event_role_assignments;
drop policy if exists "event_roles_delete_panitia" on public.event_role_assignments;

drop policy if exists "assessment_instruments_select_recap" on public.assessment_instruments;
drop policy if exists "assessment_instruments_insert_panitia" on public.assessment_instruments;
drop policy if exists "assessment_instruments_update_panitia" on public.assessment_instruments;
drop policy if exists "assessment_instruments_delete_panitia" on public.assessment_instruments;
drop policy if exists "assessment_scores_insert_pelatih" on public.assessment_scores;
drop policy if exists "assessment_scores_select_recap" on public.assessment_scores;

drop policy if exists "kap_responses_insert_authenticated" on public.kap_responses;
drop policy if exists "kap_responses_select_recap" on public.kap_responses;
drop policy if exists "kap_instruments_insert_panitia" on public.kap_instruments;
drop policy if exists "kap_instruments_update_panitia" on public.kap_instruments;
drop policy if exists "kap_instruments_delete_panitia" on public.kap_instruments;
drop policy if exists "kap_questions_insert_panitia" on public.kap_questions;
drop policy if exists "kap_questions_update_panitia" on public.kap_questions;
drop policy if exists "kap_questions_delete_panitia" on public.kap_questions;
drop policy if exists "kap_instruments_select_member" on public.kap_instruments;
drop policy if exists "kap_questions_select_member" on public.kap_questions;
drop policy if exists "assessment_criteria_select_member" on public.assessment_criteria;
drop policy if exists "assessment_criteria_insert_panitia" on public.assessment_criteria;
drop policy if exists "assessment_criteria_update_panitia" on public.assessment_criteria;
drop policy if exists "assessment_criteria_delete_panitia" on public.assessment_criteria;
drop policy if exists "enrollment_documents_insert_owner" on public.enrollment_documents;
drop policy if exists "enrollment_ksr_basic_details_insert_owner" on public.enrollment_ksr_basic_details;
drop policy if exists "enrollment_general_details_insert_owner" on public.enrollment_general_details;
drop policy if exists "enrollment_documents_select_member" on public.enrollment_documents;
drop policy if exists "enrollment_ksr_basic_details_select_member" on public.enrollment_ksr_basic_details;
drop policy if exists "enrollment_general_details_select_member" on public.enrollment_general_details;
drop policy if exists "graduation_decisions_select_view_report" on public.graduation_decisions;
drop policy if exists "graduation_decisions_insert_panitia_or_pelatih" on public.graduation_decisions;
drop policy if exists "audit_logs_select_panitia_or_observer" on public.audit_logs;
drop policy if exists "audit_logs_insert_actor" on public.audit_logs;
drop policy if exists "evaluations_insert_owner" on public.evaluations;
drop policy if exists "evaluations_select_owner_or_panitia_or_pelatih" on public.evaluations;

create policy "events_select_member"
  on public.events
  for select
  using (public.is_event_member(auth.uid(), id));

create policy "events_insert_panitia"
  on public.events
  for insert
  with check (public.has_event_role(auth.uid(), id, 'PANITIA'));

create policy "events_update_panitia"
  on public.events
  for update
  using (public.has_event_role(auth.uid(), id, 'PANITIA'))
  with check (public.has_event_role(auth.uid(), id, 'PANITIA'));

create policy "events_delete_panitia"
  on public.events
  for delete
  using (public.has_event_role(auth.uid(), id, 'PANITIA'));

create policy "enrollments_insert_owner"
  on public.enrollments
  for insert
  with check (auth.uid() = user_id);

create policy "enrollments_select_owner_or_panitia_or_observer"
  on public.enrollments
  for select
  using (
    auth.uid() = user_id
    or public.has_event_role(auth.uid(), event_id, 'PANITIA')
    or public.has_event_role(auth.uid(), event_id, 'PELATIH')
    or public.has_event_role(auth.uid(), event_id, 'OBSERVER')
  );

create policy "enrollments_update_panitia"
  on public.enrollments
  for update
  using (public.has_event_role(auth.uid(), event_id, 'PANITIA'))
  with check (public.has_event_role(auth.uid(), event_id, 'PANITIA'));

create policy "event_roles_select_panitia_or_observer"
  on public.event_role_assignments
  for select
  using (
    public.has_event_role(auth.uid(), event_id, 'PANITIA')
    or public.has_event_role(auth.uid(), event_id, 'OBSERVER')
  );

create policy "event_roles_insert_panitia"
  on public.event_role_assignments
  for insert
  with check (public.has_event_role(auth.uid(), event_id, 'PANITIA'));

create policy "event_roles_update_panitia"
  on public.event_role_assignments
  for update
  using (public.has_event_role(auth.uid(), event_id, 'PANITIA'))
  with check (public.has_event_role(auth.uid(), event_id, 'PANITIA'));

create policy "event_roles_delete_panitia"
  on public.event_role_assignments
  for delete
  using (public.has_event_role(auth.uid(), event_id, 'PANITIA'));

create policy "assessment_instruments_select_recap"
  on public.assessment_instruments
  for select
  using (
    public.has_event_role(auth.uid(), event_id, 'PANITIA')
    or public.has_event_role(auth.uid(), event_id, 'PELATIH')
    or public.has_event_role(auth.uid(), event_id, 'OBSERVER')
  );

create policy "assessment_instruments_insert_panitia"
  on public.assessment_instruments
  for insert
  with check (public.has_event_role(auth.uid(), event_id, 'PANITIA'));

create policy "assessment_instruments_update_panitia"
  on public.assessment_instruments
  for update
  using (public.has_event_role(auth.uid(), event_id, 'PANITIA'))
  with check (public.has_event_role(auth.uid(), event_id, 'PANITIA'));

create policy "assessment_instruments_delete_panitia"
  on public.assessment_instruments
  for delete
  using (public.has_event_role(auth.uid(), event_id, 'PANITIA'));

create policy "assessment_scores_insert_pelatih"
  on public.assessment_scores
  for insert
  with check (
    exists (
      select 1
      from public.assessment_instruments ai
      join public.enrollments e on e.id = assessment_scores.enrollment_id
      where ai.id = assessment_scores.instrument_id
        and e.event_id = ai.event_id
        and public.has_event_role(auth.uid(), ai.event_id, 'PELATIH')
    )
  );

create policy "assessment_scores_select_recap"
  on public.assessment_scores
  for select
  using (
    exists (
      select 1
      from public.assessment_instruments ai
      where ai.id = assessment_scores.instrument_id
        and (
          public.has_event_role(auth.uid(), ai.event_id, 'PANITIA')
          or public.has_event_role(auth.uid(), ai.event_id, 'PELATIH')
          or public.has_event_role(auth.uid(), ai.event_id, 'OBSERVER')
        )
    )
  );

create policy "kap_responses_insert_authenticated"
  on public.kap_responses
  for insert
  with check (
    exists (
      select 1
      from public.kap_instruments ki
      where ki.id = kap_responses.instrument_id
        and public.is_event_member(auth.uid(), ki.event_id)
    )
  );

create policy "kap_responses_select_recap"
  on public.kap_responses
  for select
  using (
    exists (
      select 1
      from public.kap_instruments ki
      where ki.id = kap_responses.instrument_id
        and (
          public.has_event_role(auth.uid(), ki.event_id, 'PANITIA')
          or public.has_event_role(auth.uid(), ki.event_id, 'OBSERVER')
        )
    )
  );

create policy "kap_instruments_select_member"
  on public.kap_instruments
  for select
  using (public.is_event_member(auth.uid(), event_id));

create policy "kap_instruments_insert_panitia"
  on public.kap_instruments
  for insert
  with check (public.has_event_role(auth.uid(), event_id, 'PANITIA'));

create policy "kap_instruments_update_panitia"
  on public.kap_instruments
  for update
  using (public.has_event_role(auth.uid(), event_id, 'PANITIA'))
  with check (public.has_event_role(auth.uid(), event_id, 'PANITIA'));

create policy "kap_instruments_delete_panitia"
  on public.kap_instruments
  for delete
  using (public.has_event_role(auth.uid(), event_id, 'PANITIA'));

create policy "kap_questions_select_member"
  on public.kap_questions
  for select
  using (
    exists (
      select 1
      from public.kap_instruments ki
      where ki.id = kap_questions.instrument_id
        and public.is_event_member(auth.uid(), ki.event_id)
    )
  );

create policy "kap_questions_insert_panitia"
  on public.kap_questions
  for insert
  with check (
    exists (
      select 1
      from public.kap_instruments ki
      where ki.id = kap_questions.instrument_id
        and public.has_event_role(auth.uid(), ki.event_id, 'PANITIA')
    )
  );

create policy "kap_questions_update_panitia"
  on public.kap_questions
  for update
  using (
    exists (
      select 1
      from public.kap_instruments ki
      where ki.id = kap_questions.instrument_id
        and public.has_event_role(auth.uid(), ki.event_id, 'PANITIA')
    )
  )
  with check (
    exists (
      select 1
      from public.kap_instruments ki
      where ki.id = kap_questions.instrument_id
        and public.has_event_role(auth.uid(), ki.event_id, 'PANITIA')
    )
  );

create policy "kap_questions_delete_panitia"
  on public.kap_questions
  for delete
  using (
    exists (
      select 1
      from public.kap_instruments ki
      where ki.id = kap_questions.instrument_id
        and public.has_event_role(auth.uid(), ki.event_id, 'PANITIA')
    )
  );

create policy "assessment_criteria_select_member"
  on public.assessment_criteria
  for select
  using (
    exists (
      select 1
      from public.assessment_instruments ai
      where ai.id = assessment_criteria.instrument_id
        and public.is_event_member(auth.uid(), ai.event_id)
    )
  );

create policy "assessment_criteria_insert_panitia"
  on public.assessment_criteria
  for insert
  with check (
    exists (
      select 1
      from public.assessment_instruments ai
      where ai.id = assessment_criteria.instrument_id
        and public.has_event_role(auth.uid(), ai.event_id, 'PANITIA')
    )
  );

create policy "assessment_criteria_update_panitia"
  on public.assessment_criteria
  for update
  using (
    exists (
      select 1
      from public.assessment_instruments ai
      where ai.id = assessment_criteria.instrument_id
        and public.has_event_role(auth.uid(), ai.event_id, 'PANITIA')
    )
  )
  with check (
    exists (
      select 1
      from public.assessment_instruments ai
      where ai.id = assessment_criteria.instrument_id
        and public.has_event_role(auth.uid(), ai.event_id, 'PANITIA')
    )
  );

create policy "assessment_criteria_delete_panitia"
  on public.assessment_criteria
  for delete
  using (
    exists (
      select 1
      from public.assessment_instruments ai
      where ai.id = assessment_criteria.instrument_id
        and public.has_event_role(auth.uid(), ai.event_id, 'PANITIA')
    )
  );

create policy "enrollment_documents_insert_owner"
  on public.enrollment_documents
  for insert
  with check (
    exists (
      select 1
      from public.enrollments e
      where e.id = enrollment_documents.enrollment_id
        and e.user_id = auth.uid()
    )
  );

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
          or public.has_event_role(auth.uid(), e.event_id, 'PANITIA')
          or public.has_event_role(auth.uid(), e.event_id, 'OBSERVER')
        )
    )
  );

create policy "enrollment_ksr_basic_details_insert_owner"
  on public.enrollment_ksr_basic_details
  for insert
  with check (
    exists (
      select 1
      from public.enrollments e
      where e.id = enrollment_ksr_basic_details.enrollment_id
        and e.user_id = auth.uid()
    )
  );

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
          or public.has_event_role(auth.uid(), e.event_id, 'PANITIA')
          or public.has_event_role(auth.uid(), e.event_id, 'OBSERVER')
        )
    )
  );

create policy "enrollment_general_details_insert_owner"
  on public.enrollment_general_details
  for insert
  with check (
    exists (
      select 1
      from public.enrollments e
      where e.id = enrollment_general_details.enrollment_id
        and e.user_id = auth.uid()
    )
  );

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
          or public.has_event_role(auth.uid(), e.event_id, 'PANITIA')
          or public.has_event_role(auth.uid(), e.event_id, 'OBSERVER')
        )
    )
  );

create policy "graduation_decisions_select_view_report"
  on public.graduation_decisions
  for select
  using (
    public.has_event_role(auth.uid(), event_id, 'PANITIA')
    or public.has_event_role(auth.uid(), event_id, 'OBSERVER')
  );

create policy "graduation_decisions_insert_panitia_or_pelatih"
  on public.graduation_decisions
  for insert
  with check (
    public.has_event_role(auth.uid(), event_id, 'PANITIA')
    or public.has_event_role(auth.uid(), event_id, 'PELATIH')
  );

create policy "audit_logs_select_panitia_or_observer"
  on public.audit_logs
  for select
  using (
    public.has_event_role(auth.uid(), event_id, 'PANITIA')
    or public.has_event_role(auth.uid(), event_id, 'OBSERVER')
  );

create policy "audit_logs_insert_actor"
  on public.audit_logs
  for insert
  with check (
    auth.uid() = actor_user_id
    and event_id is not null
  );

create policy "evaluations_insert_owner"
  on public.evaluations
  for insert
  with check (
    exists (
      select 1
      from public.enrollments e
      where e.id = evaluations.enrollment_id
        and e.user_id = auth.uid()
        and e.event_id = evaluations.event_id
    )
  );

create policy "evaluations_select_owner_or_panitia_or_pelatih"
  on public.evaluations
  for select
  using (
    exists (
      select 1
      from public.enrollments e
      where e.id = evaluations.enrollment_id
        and e.user_id = auth.uid()
    )
    or public.has_event_role(auth.uid(), event_id, 'PANITIA')
    or public.has_event_role(auth.uid(), event_id, 'PELATIH')
  );
