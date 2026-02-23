-- YWAM Housing Assessment
-- PostgreSQL / Supabase relational schema foundation

create extension if not exists pgcrypto;

create type user_role as enum ('admin', 'reviewer');
create type assessment_status as enum (
  'submitted',
  'under_review',
  'approved',
  'denied',
  'waitlisted'
);

create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  full_name text not null,
  email text not null unique,
  role user_role not null default 'reviewer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists applicants (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text,
  phone text not null,
  national_id text,
  current_location text,
  household_size integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists assessment_forms (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  is_active boolean not null default true,
  created_by uuid references app_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists assessment_questions (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references assessment_forms(id) on delete cascade,
  question_key text not null,
  label text not null,
  help_text text,
  input_type text not null,
  is_required boolean not null default true,
  order_index integer not null,
  scoring_weight integer not null default 1,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (form_id, question_key)
);

create table if not exists assessment_question_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references assessment_questions(id) on delete cascade,
  option_label text not null,
  option_value text not null,
  score_value numeric(8, 2) not null default 0,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  unique (question_id, option_value)
);

create table if not exists assessments (
  id uuid primary key default gen_random_uuid(),
  applicant_id uuid not null references applicants(id) on delete restrict,
  form_id uuid not null references assessment_forms(id) on delete restrict,
  status assessment_status not null default 'submitted',
  assigned_reviewer_id uuid references app_users(id) on delete set null,
  total_score numeric(10, 2),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists assessment_answers (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references assessments(id) on delete cascade,
  question_id uuid not null references assessment_questions(id) on delete restrict,
  option_id uuid references assessment_question_options(id) on delete set null,
  answer_text text,
  answer_number numeric(12, 2),
  answer_boolean boolean,
  answered_at timestamptz not null default now(),
  unique (assessment_id, question_id)
);

create table if not exists assessment_scores (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references assessments(id) on delete cascade,
  reviewer_user_id uuid not null references app_users(id) on delete restrict,
  score numeric(10, 2) not null,
  rationale text,
  created_at timestamptz not null default now()
);

create table if not exists assessment_status_history (
  id bigserial primary key,
  assessment_id uuid not null references assessments(id) on delete cascade,
  from_status assessment_status,
  to_status assessment_status not null,
  changed_by uuid references app_users(id) on delete set null,
  notes text,
  changed_at timestamptz not null default now()
);

create index if not exists idx_assessments_status on assessments(status);
create index if not exists idx_assessments_submitted_at on assessments(submitted_at desc);
create index if not exists idx_assessment_answers_assessment_id on assessment_answers(assessment_id);
create index if not exists idx_status_history_assessment_id on assessment_status_history(assessment_id);
