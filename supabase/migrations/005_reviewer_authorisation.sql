create policy "reviewers read review queue" on public.reports for select using(public.is_reviewer());
create policy "reviewers update review status" on public.reports for update using(public.is_reviewer()) with check(public.is_reviewer());
create policy "reviewers read reported scans" on public.scans for select using(public.is_reviewer() and exists(select 1 from public.reports r where r.scan_id=scans.id));
create policy "reviewers read reported image rows" on public.scan_images for select using(public.is_reviewer() and exists(select 1 from public.reports r where r.scan_id=scan_images.scan_id));
create policy "reviewers read reported private images" on storage.objects for select to authenticated using(bucket_id='package-images' and public.is_reviewer() and exists(select 1 from public.scan_images i join public.reports r on r.scan_id=i.scan_id where i.storage_path=name));

create or replace function public.update_report_status(p_report_id uuid,p_status public.report_status,p_note text)
returns void language plpgsql security definer set search_path='' as $$
declare v_actor uuid:=auth.uid();v_old public.report_status;
begin
 if not public.is_reviewer() then raise exception 'reviewer access required'; end if;
 if p_status not in ('under_review','more_information_requested','closed') then raise exception 'invalid review status'; end if;
 select status into v_old from public.reports where id=p_report_id for update;
 if not found then raise exception 'report unavailable'; end if;
 update public.reports set status=p_status where id=p_report_id;
 insert into public.report_events(report_id,actor_id,event_type,from_status,to_status,note) values(p_report_id,v_actor,'status_changed',v_old,p_status,nullif(p_note,''));
 insert into public.audit_events(actor_id,action,entity_type,entity_id,metadata) values(v_actor,'report.status_changed','report',p_report_id,jsonb_build_object('from',v_old,'to',p_status));
end; $$;
revoke all on function public.update_report_status(uuid,public.report_status,text) from public;grant execute on function public.update_report_status(uuid,public.report_status,text) to authenticated;

create or replace function public.set_user_role(p_user_id uuid,p_role public.user_role)
returns void language plpgsql security definer set search_path='' as $$
begin
 if not public.is_admin() then raise exception 'administrator access required'; end if;
 if p_user_id=auth.uid() then raise exception 'administrators cannot change their own role here'; end if;
 update public.profiles set role=p_role,updated_at=now() where id=p_user_id;
 insert into public.audit_events(actor_id,action,entity_type,entity_id,metadata) values(auth.uid(),'profile.role_changed','profile',p_user_id,jsonb_build_object('role',p_role));
end; $$;
revoke all on function public.set_user_role(uuid,public.user_role) from public;grant execute on function public.set_user_role(uuid,public.user_role) to authenticated;
