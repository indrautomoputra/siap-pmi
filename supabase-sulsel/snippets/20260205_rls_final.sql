create or replace function public.is_event_member(event_id uuid)
returns boolean
language sql
stable
as $$
  select
    exists (
      select 1
      from enrollments e
      where e.event_id = $1
        and e.user_id = auth.uid()
    )
    or exists (
      select 1
      from event_role_assignments r
      where r.event_id = $1
        and r.user_id = auth.uid()
    );
$$;

create or replace function public.has_event_role(event_id uuid, role text)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from event_role_assignments r
    where r.event_id = $1
      and r.user_id = auth.uid()
      and r.role = $2
  );
$$;

alter table events enable row level security;
alter table enrollments enable row level security;
alter table event_role_assignments enable row level security;
alter table assessment_instruments enable row level security;
alter table assessment_scores enable row level security;
alter table kap_responses enable row level security;

drop policy if exists "events_select_public" on events;
drop policy if exists "events_write_open" on events;
drop policy if exists "events_write_server_only" on events;

drop policy if exists "enrollments_select_public" on enrollments;
drop policy if exists "enrollments_write_open" on enrollments;
drop policy if exists "enrollments_write_server_only" on enrollments;

drop policy if exists "event_role_assignments_select_public" on event_role_assignments;
drop policy if exists "event_role_assignments_write_open" on event_role_assignments;
drop policy if exists "event_roles_write_server_only" on event_role_assignments;

create policy "events_select_member"
  on events
  for select
  using (is_event_member(id));

create policy "events_insert_panitia"
  on events
  for insert
  with check (has_event_role(id, 'PANITIA'));

create policy "events_update_panitia"
  on events
  for update
  using (has_event_role(id, 'PANITIA'))
  with check (has_event_role(id, 'PANITIA'));

create policy "events_delete_panitia"
  on events
  for delete
  using (has_event_role(id, 'PANITIA'));

create policy "enrollments_insert_owner"
  on enrollments
  for insert
  with check (auth.uid() = user_id);

create policy "enrollments_select_owner_or_panitia_or_observer"
  on enrollments
  for select
  using (
    auth.uid() = user_id
    or has_event_role(event_id, 'PANITIA')
    or has_event_role(event_id, 'OBSERVER')
  );

create policy "enrollments_update_panitia"
  on enrollments
  for update
  using (has_event_role(event_id, 'PANITIA'))
  with check (has_event_role(event_id, 'PANITIA'));

create policy "event_roles_select_panitia_or_observer"
  on event_role_assignments
  for select
  using (
    has_event_role(event_id, 'PANITIA')
    or has_event_role(event_id, 'OBSERVER')
  );

create policy "event_roles_insert_panitia"
  on event_role_assignments
  for insert
  with check (has_event_role(event_id, 'PANITIA'));

create policy "event_roles_update_panitia"
  on event_role_assignments
  for update
  using (has_event_role(event_id, 'PANITIA'))
  with check (has_event_role(event_id, 'PANITIA'));

create policy "event_roles_delete_panitia"
  on event_role_assignments
  for delete
  using (has_event_role(event_id, 'PANITIA'));

create policy "assessment_instruments_select_recap"
  on assessment_instruments
  for select
  using (
    has_event_role(event_id, 'PANITIA')
    or has_event_role(event_id, 'OBSERVER')
  );

create policy "assessment_scores_insert_pelatih"
  on assessment_scores
  for insert
  with check (
    exists (
      select 1
      from assessment_instruments ai
      where ai.id = assessment_scores.instrument_id
        and has_event_role(ai.event_id, 'PELATHI')
    )
  );

create policy "assessment_scores_select_recap"
  on assessment_scores
  for select
  using (
    exists (
      select 1
      from assessment_instruments ai
      where ai.id = assessment_scores.instrument_id
        and (
          has_event_role(ai.event_id, 'PANITIA')
          or has_event_role(ai.event_id, 'OBSERVER')
        )
    )
  );

create policy "kap_responses_insert_authenticated"
  on kap_responses
  for insert
  with check (auth.uid() is not null);

create policy "kap_responses_select_recap"
  on kap_responses
  for select
  using (
    exists (
      select 1
      from kap_instruments ki
      where ki.id = kap_responses.instrument_id
        and (
          has_event_role(ki.event_id, 'PANITIA')
          or has_event_role(ki.event_id, 'OBSERVER')
        )
    )
  );
