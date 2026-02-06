create table enrollment_documents (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references enrollments(id) on delete cascade,
  doc_type text not null,
  file_path text not null,
  uploaded_by uuid null,
  uploaded_at timestamptz not null default now()
);

create index enrollment_documents_enrollment_id_idx
  on enrollment_documents (enrollment_id);

create index enrollment_documents_doc_type_idx
  on enrollment_documents (doc_type);

create table enrollment_ksr_basic_details (
  enrollment_id uuid primary key references enrollments(id) on delete cascade,
  nik text not null,
  birth_place text not null,
  birth_date date not null,
  gender text not null,
  address text not null,
  phone_number text not null,
  email text not null,
  education text not null,
  occupation text not null,
  blood_type text not null,
  emergency_contact_name text not null,
  emergency_contact_phone text not null
);

create table enrollment_general_details (
  enrollment_id uuid primary key references enrollments(id) on delete cascade,
  unsur_pmi pmi_element not null,
  nik text not null,
  birth_place text not null,
  birth_date date not null,
  gender text not null,
  address text not null,
  phone_number text not null,
  email text not null,
  education text not null,
  occupation text not null,
  blood_type text not null,
  emergency_contact_name text not null,
  emergency_contact_phone text not null,
  organization_name text null,
  organization_role text null
);
