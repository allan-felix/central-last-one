create extension if not exists "pgcrypto";

create type public.user_role as enum ('admin','manager','cs','sales','finance','viewer');
create type public.client_status as enum ('active','paused','at_risk','cancelled');
create type public.renewal_status as enum ('not_started','contact_started','negotiation','renewed','not_renewed');
create type public.payment_status as enum ('paid','pending','overdue','cancelled');
create type public.task_status as enum ('todo','in_progress','done','cancelled');
create type public.crm_stage as enum ('lead','qualified','meeting_scheduled','meeting_held','proposal_sent','follow_up','won','lost');

create table public.organizations (
  id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique,
  document text, logo_url text, timezone text not null default 'America/Sao_Paulo',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  full_name text not null, avatar_url text, job_title text, role public.user_role not null default 'viewer', active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.plans (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null, monthly_price numeric(12,2) not null default 0, active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(organization_id,name)
);
create table public.clients (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  legal_name text, name text not null, document text, owner_name text not null, phone text, whatsapp text, email text,
  city text, state char(2), segment text, plan_id uuid references public.plans(id), monthly_fee numeric(12,2) not null default 0,
  joined_at date not null, renewal_at date not null, manager_id uuid references public.profiles(id), site_url text, landing_page_url text,
  google_ads_id text, meta_ads_id text, notes text, health_score smallint not null default 0 check (health_score between 0 and 100),
  status public.client_status not null default 'active', last_meeting_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.health_score_settings (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade unique,
  campaign_performance_weight smallint not null default 30, meeting_frequency_weight smallint not null default 20,
  client_engagement_weight smallint not null default 15, payment_status_weight smallint not null default 15,
  response_time_weight smallint not null default 10, satisfaction_weight smallint not null default 10,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint weights_total_100 check (campaign_performance_weight + meeting_frequency_weight + client_engagement_weight + payment_status_weight + response_time_weight + satisfaction_weight = 100)
);
create table public.client_health_scores (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade, total_score smallint not null check(total_score between 0 and 100),
  campaign_performance smallint not null, meeting_frequency smallint not null, client_engagement smallint not null,
  payment_status smallint not null, response_time smallint not null, satisfaction smallint not null,
  notes text, calculated_by uuid references public.profiles(id), calculated_at timestamptz not null default now(),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.client_health_history (like public.client_health_scores including defaults including constraints);
alter table public.client_health_history add primary key (id);
alter table public.client_health_history add foreign key (organization_id) references public.organizations(id) on delete cascade;
alter table public.client_health_history add foreign key (client_id) references public.clients(id) on delete cascade;
create table public.contracts (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade, plan_id uuid references public.plans(id), monthly_value numeric(12,2) not null,
  starts_at date not null, ends_at date not null, payment_day smallint check(payment_day between 1 and 31), active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.renewals (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade, contract_id uuid references public.contracts(id) on delete set null,
  owner_id uuid references public.profiles(id), renewal_at date not null, status public.renewal_status not null default 'not_started',
  started_at timestamptz, completed_at timestamptz, notes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.onboarding (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade, owner_id uuid references public.profiles(id),
  current_step text not null default 'contract_signed', started_at date not null default current_date, due_at date, completed_at date, progress smallint not null default 0 check(progress between 0 and 100),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.onboarding_steps (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  onboarding_id uuid not null references public.onboarding(id) on delete cascade, step_key text not null, position smallint not null,
  sla_days smallint not null default 3, started_at timestamptz, completed_at timestamptz, pending_reason text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(onboarding_id,step_key)
);
create table public.tasks (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid references public.clients(id) on delete cascade, assignee_id uuid references public.profiles(id), title text not null,
  description text, due_at timestamptz, priority smallint not null default 2 check(priority between 1 and 4), status public.task_status not null default 'todo',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.meetings (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade, owner_id uuid references public.profiles(id), title text not null,
  scheduled_at timestamptz not null, held_at timestamptz, notes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.crm_leads (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  company_name text not null, contact_name text not null, phone text, email text, source text, seller_id uuid references public.profiles(id), segment text,
  estimated_revenue numeric(14,2), proposal_value numeric(12,2), potential_mrr numeric(12,2), probability smallint check(probability between 0 and 100),
  stage public.crm_stage not null default 'lead', next_action text, next_action_at timestamptz, loss_reason text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.crm_activities (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  lead_id uuid not null references public.crm_leads(id) on delete cascade, actor_id uuid references public.profiles(id), type text not null, description text not null,
  occurred_at timestamptz not null default now(), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.financial_transactions (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null, contract_id uuid references public.contracts(id) on delete set null,
  description text not null, kind text not null check(kind in ('income','expense')), amount numeric(12,2) not null, payment_status public.payment_status not null default 'pending',
  due_at date not null, paid_at date,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.activity_logs (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  actor_id uuid references public.profiles(id), entity_type text not null, entity_id uuid, action text not null, metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create or replace function public.current_organization_id() returns uuid language sql stable security definer set search_path = public as $$
  select organization_id from public.profiles where id = auth.uid() and active = true limit 1
$$;
revoke all on function public.current_organization_id() from public;
grant execute on function public.current_organization_id() to authenticated;

create or replace function public.set_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
do $$ declare t text; begin foreach t in array array['organizations','profiles','plans','clients','health_score_settings','client_health_scores','client_health_history','contracts','renewals','onboarding','onboarding_steps','tasks','meetings','crm_leads','crm_activities','financial_transactions','activity_logs'] loop execute format('create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()', t, t); end loop; end $$;

do $$ declare t text; begin foreach t in array array['profiles','plans','clients','health_score_settings','client_health_scores','client_health_history','contracts','renewals','onboarding','onboarding_steps','tasks','meetings','crm_leads','crm_activities','financial_transactions','activity_logs'] loop execute format('alter table public.%I enable row level security', t); execute format('create policy tenant_isolation on public.%I for all to authenticated using (organization_id = public.current_organization_id()) with check (organization_id = public.current_organization_id())', t); end loop; end $$;
alter table public.organizations enable row level security;
create policy organization_members_read on public.organizations for select to authenticated using (id = public.current_organization_id());

create index clients_org_status_idx on public.clients(organization_id,status);
create index clients_org_renewal_idx on public.clients(organization_id,renewal_at);
create index health_client_date_idx on public.client_health_history(client_id,calculated_at desc);
create index renewals_org_date_idx on public.renewals(organization_id,renewal_at);
create index tasks_org_due_idx on public.tasks(organization_id,due_at);
create index crm_org_stage_idx on public.crm_leads(organization_id,stage);
create index finance_org_due_idx on public.financial_transactions(organization_id,due_at);
