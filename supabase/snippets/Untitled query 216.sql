-- EVENTS
drop policy if exists "events_write_open" on events;

create policy "events_write_server_only"
  on events
  for all
  to public
  using (false)
  with check (false);

-- ENROLLMENTS
drop policy if exists "enrollments_write_open" on enrollments;

create policy "enrollments_write_server_only"
  on enrollments
  for all
  to public
  using (false)
  with check (false);

-- EVENT ROLE ASSIGNMENTS
drop policy if exists "event_role_assignments_write_open" on event_role_assignments;

create policy "event_roles_write_server_only"
  on event_role_assignments
  for all
  to public
  using (false)
  with check (false);