-- Evidence-preserving screening and review architecture.
alter type public.user_role add value if not exists 'reviewer';
alter type public.reference_status add value if not exists 'retired';
alter type public.reference_status add value if not exists 'withdrawn';
alter type public.report_status add value if not exists 'under_review';
alter type public.report_status add value if not exists 'more_information_requested';

create table public.products (
  id uuid primary key default gen_random_uuid(), name text not null, presentation text not null,
  strength text not null, dosage_form text not null, manufacturer text not null,
  registration_number text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index products_search_idx on public.products using gin (to_tsvector('simple', name || ' ' || manufacturer || ' ' || coalesce(registration_number,'')));

create table public.reference_versions (
  id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id),
  version integer not null check(version>0), packaging_version text not null, package_text text[] not null default '{}',
  source_name text not null, source_url text, provenance_notes text not null,
  coverage_notes text, reviewed_at timestamptz, reviewer_id uuid references public.profiles(id),
  status public.reference_status not null default 'draft', created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(product_id,version)
);
create index reference_versions_lookup_idx on public.reference_versions(product_id,status,version desc);

create table public.reference_images (
 id uuid primary key default gen_random_uuid(), reference_version_id uuid not null references public.reference_versions(id),
 storage_path text not null unique, package_side text not null check(package_side in ('front','back','side')),
 sha256 text not null, created_at timestamptz not null default now()
);
create table public.model_versions (id uuid primary key default gen_random_uuid(), identifier text not null unique, capability text not null, validated boolean not null default false, notes text not null, created_at timestamptz not null default now());
create table public.decision_policy_versions (id uuid primary key default gen_random_uuid(), identifier text not null unique, rules jsonb not null, active boolean not null default false, created_at timestamptz not null default now());

alter table public.scans add column if not exists public_scan_id text unique default ('PL-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,12)));
alter table public.scans add column if not exists reference_version_id uuid references public.reference_versions(id);
alter table public.scans add column if not exists reference_snapshot jsonb;
alter table public.scans add column if not exists model_version_id uuid references public.model_versions(id);
alter table public.scans add column if not exists decision_policy_version_id uuid references public.decision_policy_versions(id);
alter table public.scans add column if not exists reason_codes text[] not null default '{}';
alter table public.scans add column if not exists comparison_scope text not null default 'none' check(comparison_scope in ('none','label_details'));
alter table public.scans add column if not exists expiry_status text not null default 'not_detected' check(expiry_status in ('not_detected','ambiguous','valid','expired'));
alter table public.scans add column if not exists retain_images boolean not null default false;
create index scans_user_history_idx on public.scans(user_id,created_at desc);
create index scans_user_outcome_idx on public.scans(user_id,outcome,created_at desc);

create table public.scan_images (id uuid primary key default gen_random_uuid(),scan_id uuid not null references public.scans(id) on delete cascade,user_id uuid not null references public.profiles(id) on delete cascade,storage_path text not null unique,package_side text not null check(package_side in ('front','back','side')),width integer not null,height integer not null,bytes integer not null,quality_measurements jsonb not null default '{}',created_at timestamptz not null default now());
create table public.extracted_fields (id uuid primary key default gen_random_uuid(),scan_id uuid not null references public.scans(id) on delete cascade,field_name text not null,machine_value text,machine_confidence numeric,user_value text,source text not null check(source in ('machine','manual')),corrected boolean not null default false,ambiguous boolean not null default false,created_at timestamptz not null default now(),unique(scan_id,field_name));
create table public.screening_checks (id uuid primary key default gen_random_uuid(),scan_id uuid not null references public.scans(id) on delete cascade,reason_code text not null,status text not null check(status in ('consistent','different','unresolved')),observed text,expected text,evidence_source text not null,created_at timestamptz not null default now());
create table public.consent_records (id uuid primary key default gen_random_uuid(),user_id uuid references public.profiles(id) on delete cascade,guest_session_id text,purpose text not null check(purpose in ('image_upload','report_submission','image_retention')),granted boolean not null,policy_version text not null,created_at timestamptz not null default now(),constraint consent_actor check(user_id is not null or guest_session_id is not null));

alter table public.reports add column if not exists public_reference text unique default ('RPT-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,10)));
alter table public.reports add column if not exists contact_information text;
alter table public.reports add column if not exists idempotency_key uuid;
alter table public.reports add column if not exists consent_record_id uuid references public.consent_records(id);
create unique index reports_user_idempotency_idx on public.reports(user_id,idempotency_key) where idempotency_key is not null;
create index reports_owner_status_idx on public.reports(user_id,status,created_at desc);
create table public.report_events (id uuid primary key default gen_random_uuid(),report_id uuid not null references public.reports(id) on delete cascade,actor_id uuid not null references public.profiles(id),event_type text not null,from_status public.report_status,to_status public.report_status,note text,created_at timestamptz not null default now());
create table public.audit_events (id uuid primary key default gen_random_uuid(),actor_id uuid references public.profiles(id),action text not null,entity_type text not null,entity_id uuid,metadata jsonb not null default '{}',created_at timestamptz not null default now());
create index audit_events_entity_idx on public.audit_events(entity_type,entity_id,created_at desc);
create table public.verification_adapters (id uuid primary key default gen_random_uuid(),identifier text not null unique,display_name text not null,enabled boolean not null default false,configuration_status text not null default 'unconfigured' check(configuration_status in ('unconfigured','configured','unavailable')),created_at timestamptz not null default now(),updated_at timestamptz not null default now());

alter table public.products enable row level security; alter table public.reference_versions enable row level security; alter table public.reference_images enable row level security; alter table public.model_versions enable row level security; alter table public.decision_policy_versions enable row level security; alter table public.scan_images enable row level security; alter table public.extracted_fields enable row level security; alter table public.screening_checks enable row level security; alter table public.consent_records enable row level security; alter table public.report_events enable row level security; alter table public.audit_events enable row level security; alter table public.verification_adapters enable row level security;

create function public.is_reviewer() returns boolean language sql stable security definer set search_path='' as $$ select exists(select 1 from public.profiles where id=auth.uid() and role::text in ('reviewer','admin')); $$;
revoke all on function public.is_reviewer() from public; grant execute on function public.is_reviewer() to authenticated;
create policy "published product catalogue" on public.products for select using(exists(select 1 from public.reference_versions r where r.product_id=id and r.status='published') or public.is_reviewer());
create policy "reviewers manage products" on public.products for all using(public.is_reviewer()) with check(public.is_reviewer());
create policy "published reference versions" on public.reference_versions for select using(status='published' or public.is_reviewer());
create policy "reviewers manage reference versions" on public.reference_versions for all using(public.is_reviewer()) with check(public.is_reviewer());
create policy "reviewers manage reference images" on public.reference_images for all using(public.is_reviewer()) with check(public.is_reviewer());
create policy "version metadata readable" on public.model_versions for select to authenticated using(true);
create policy "policy metadata readable" on public.decision_policy_versions for select to authenticated using(true);
create policy "admins manage version metadata" on public.model_versions for all using(public.is_admin()) with check(public.is_admin());
create policy "admins manage policies" on public.decision_policy_versions for all using(public.is_admin()) with check(public.is_admin());
create policy "owners manage scan images" on public.scan_images for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
create policy "owners read extracted fields" on public.extracted_fields for select using(exists(select 1 from public.scans s where s.id=scan_id and s.user_id=auth.uid()) or public.is_reviewer());
create policy "owners insert extracted fields" on public.extracted_fields for insert with check(exists(select 1 from public.scans s where s.id=scan_id and s.user_id=auth.uid()));
create policy "owners read screening checks" on public.screening_checks for select using(exists(select 1 from public.scans s where s.id=scan_id and s.user_id=auth.uid()) or public.is_reviewer());
create policy "owners insert screening checks" on public.screening_checks for insert with check(exists(select 1 from public.scans s where s.id=scan_id and s.user_id=auth.uid()));
create policy "owners manage consent" on public.consent_records for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
create policy "owners and reviewers read report events" on public.report_events for select using(public.is_reviewer() or exists(select 1 from public.reports r where r.id=report_id and r.user_id=auth.uid()));
create policy "reviewers create report events" on public.report_events for insert with check(public.is_reviewer() and actor_id=auth.uid());
create policy "admins inspect audit" on public.audit_events for select using(public.is_admin());
create policy "reviewers create audit" on public.audit_events for insert with check(public.is_reviewer() and actor_id=auth.uid());
create policy "adapter status readable" on public.verification_adapters for select to authenticated using(true);
create policy "admins configure adapters" on public.verification_adapters for all using(public.is_admin()) with check(public.is_admin());

insert into public.model_versions(identifier,capability,validated,notes) values ('none','No trained packaging-vision model is configured.',false,'The application must not imply that a packaging model ran.') on conflict(identifier) do nothing;
insert into public.decision_policy_versions(identifier,rules,active) values ('label-details-v2.0','{"scope":"label_details","required_fields":["strength","manufacturer"],"reference_status":"published"}',true) on conflict(identifier) do nothing;
insert into public.verification_adapters(identifier,display_name,enabled,configuration_status) values ('none','No external verification adapter',false,'unconfigured') on conflict(identifier) do nothing;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('reference-images','reference-images',false,10485760,array['image/jpeg','image/png','image/webp']) on conflict(id) do nothing;
create policy "reviewers manage reference storage" on storage.objects for all to authenticated using(bucket_id='reference-images' and public.is_reviewer()) with check(bucket_id='reference-images' and public.is_reviewer());
