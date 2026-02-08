create or replace function public.is_event_member(user_id uuid, event_id text)
returns boolean
language sql
stable
set search_path = ''
as $$
  select
    exists (
      select 1
      from public.enrollments e
      where e.event_id::text = $2
        and e.user_id::text = $1::text
    )
    or exists (
      select 1
      from public.event_role_assignments r
      where r.event_id::text = $2
        and r.user_id::text = $1::text
    );
$$;

create or replace function public.has_event_role(
  user_id uuid,
  event_id text,
  role_name text
)
returns boolean
language sql
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.event_role_assignments r
    where r.event_id::text = $2
      and r.user_id::text = $1::text
      and r.role::text = $3
  );
$$;

create or replace function public.is_event_member(event_id text)
returns boolean
language sql
stable
set search_path = ''
as $$
  select public.is_event_member(auth.uid(), $1);
$$;

create or replace function public.has_event_role(event_id text, role_name text)
returns boolean
language sql
stable
set search_path = ''
as $$
  select public.has_event_role(auth.uid(), $1, $2);
$$;
