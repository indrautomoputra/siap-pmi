create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  actor_user_id uuid not null,
  action text not null,
  entity_type text not null,
  entity_id uuid not null,
  metadata jsonb null,
  created_at timestamptz default now()
);

create index if not exists audit_logs_event_id_idx on public.audit_logs (event_id);
create index if not exists audit_logs_action_idx on public.audit_logs (action);
create index if not exists audit_logs_created_at_idx on public.audit_logs (created_at);
