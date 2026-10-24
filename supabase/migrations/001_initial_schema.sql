create extension if not exists pgcrypto;

create type public.user_role as enum ('user', 'admin');
create type public.screening_outcome as enum ('reference_match', 'needs_review', 'unable_to_verify');
create type public.reference_status as enum ('draft', 'published', 'archived');
create type public.report_status as enum ('draft', 'submitted', 'reviewing', 'closed');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role public.user_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reference_products (
  id uuid primary key default gen_random_uuid(),
  product_name text not null,
  manufacturer text not null,
  registration_number text,
  package_text text[] not null default '{}',
  source_name text not null,
  source_url text,
  source_checked_at timestamptz not null,
  status public.reference_status not null default 'draft',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.scans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_name text not null,
  manufacturer text,
  batch_number text,
  expiry_date_text text,
  registration_number text,
  extracted_text text not null default '',
  outcome public.screening_outcome not null,
  rationale text not null,
  reference_id uuid references public.reference_products(id),
  image_path text,
  created_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  scan_id uuid not null references public.scans(id) on delete cascade,
  reason text not null check (reason in ('packaging_discrepancy','registration_concern','expiry_concern','other')),
  notes text check (char_length(notes) <= 1000),
  consented_at timestamptz not null,
  status public.report_status not null default 'draft',
  submitted_destination text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.reference_products enable row level security;
alter table public.scans enable row level security;
alter table public.reports enable row level security;

create function public.is_admin() returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create policy "users read own profile and admins read all" on public.profiles for select using (auth.uid() = id or public.is_admin());
create policy "published references are readable" on public.reference_products for select using (status = 'published' or public.is_admin());
create policy "admins manage references" on public.reference_products for all using (public.is_admin()) with check (public.is_admin());
create policy "users read own scans" on public.scans for select using (auth.uid() = user_id);
create policy "admins read all scans" on public.scans for select using (public.is_admin());
create policy "users insert own scans" on public.scans for insert with check (auth.uid() = user_id);
create policy "users delete own scans" on public.scans for delete using (auth.uid() = user_id);
create policy "users read own reports" on public.reports for select using (auth.uid() = user_id);
create policy "users create own reports" on public.reports for insert with check (auth.uid() = user_id and consented_at is not null);
create policy "admins read reports" on public.reports for select using (public.is_admin());

create function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin insert into public.profiles (id, display_name) values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))); return new; end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('package-images','package-images',false,10485760,array['image/jpeg','image/png','image/webp']) on conflict (id) do nothing;
create policy "users upload own package images" on storage.objects for insert to authenticated with check (bucket_id='package-images' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "users read own package images" on storage.objects for select to authenticated using (bucket_id='package-images' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "users delete own package images" on storage.objects for delete to authenticated using (bucket_id='package-images' and (storage.foldername(name))[1]=auth.uid()::text);
