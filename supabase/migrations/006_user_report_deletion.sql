create or replace function public.delete_own_report(p_report_id uuid)
returns void language plpgsql security definer set search_path='' as $$
declare v_user uuid:=auth.uid();v_consent uuid;
begin
 select consent_record_id into v_consent from public.reports where id=p_report_id and user_id=v_user for update;
 if not found then raise exception 'report unavailable'; end if;
 insert into public.audit_events(actor_id,action,entity_type,entity_id,metadata) values(v_user,'report.deleted_by_owner','report',p_report_id,'{}');
 delete from public.reports where id=p_report_id and user_id=v_user;
 delete from public.consent_records where id=v_consent and user_id=v_user;
end; $$;
revoke all on function public.delete_own_report(uuid) from public;grant execute on function public.delete_own_report(uuid) to authenticated;
