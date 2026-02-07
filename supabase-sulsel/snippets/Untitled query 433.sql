-- Enable RLS (jalankan sekali saja)
alter table events enable row level security;
alter table enrollments enable row level security;
alter table event_role_assignments enable row level security;

-- Public SELECT
create policy "events_select_public"
  on events for select
  using (true);

create policy "enrollments_select_public"
  on enrollments for select
  using (true);

create policy "event_role_assignments_select_public"
  on event_role_assignments for select
  using (true);

-- Temporary full write (INSERT/UPDATE/DELETE)
create policy "events_write_open"
  on events for all
  using (true)
  with check (true);

create policy "enrollments_write_open"
  on enrollments for all
  using (true)
  with check (true);

create policy "event_role_assignments_write_open"
  on event_role_assignments for all
  using (true)
  with check (true);