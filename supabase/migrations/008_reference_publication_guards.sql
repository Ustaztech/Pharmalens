alter table public.scans add column if not exists decision_policy_identifier text not null default 'label-details-v2.0';
alter table public.scans add column if not exists model_identifier text;

create or replace function public.guard_reference_publication() returns trigger
language plpgsql set search_path='' as $$
begin
 if new.status='published' and (new.reviewed_at is null or new.reviewer_id is null or trim(new.provenance_notes)='') then
   raise exception 'published references require review date, reviewer and provenance';
 end if;
 return new;
end; $$;
drop trigger if exists reference_publication_guard on public.reference_versions;
create trigger reference_publication_guard before insert or update on public.reference_versions for each row execute function public.guard_reference_publication();
