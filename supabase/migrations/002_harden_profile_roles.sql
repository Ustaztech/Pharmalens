-- Apply this migration if 001_initial_schema.sql was already run.
drop policy if exists "users read own profile" on public.profiles;
drop policy if exists "users update own non-role data" on public.profiles;
drop policy if exists "published references are readable" on public.reference_products;
drop policy if exists "admins manage references" on public.reference_products;
drop policy if exists "admins read reports" on public.reports;

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create policy "users read own profile and admins read all" on public.profiles for select using (auth.uid() = id or public.is_admin());
create policy "published references are readable" on public.reference_products for select using (status = 'published' or public.is_admin());
create policy "admins manage references" on public.reference_products for all using (public.is_admin()) with check (public.is_admin());
create policy "admins read all scans" on public.scans for select using (public.is_admin());
create policy "admins read reports" on public.reports for select using (public.is_admin());
