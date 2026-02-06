do $$
begin
  create type enrollment_review_status as enum ('pending_review', 'approved', 'rejected');
exception
  when duplicate_object then null;
end $$;

alter table enrollments
  add column if not exists review_status enrollment_review_status not null default 'pending_review',
  add column if not exists reviewed_by uuid null,
  add column if not exists reviewed_at timestamptz null,
  add column if not exists review_note text null;

update enrollments
set review_status = 'pending_review'
where review_status is null;

create index if not exists enrollments_review_status_idx
  on enrollments (review_status);