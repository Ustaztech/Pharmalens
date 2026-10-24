create or replace function public.submit_review_report(
  p_scan_id uuid, p_reason text, p_notes text, p_contact text, p_idempotency_key uuid, p_policy_version text
) returns table(report_id uuid, public_reference text, status public.report_status)
language plpgsql security definer set search_path='' as $$
declare v_user uuid:=auth.uid(); v_consent uuid; v_report public.reports%rowtype;
begin
  if v_user is null then raise exception 'authentication required'; end if;
  if (select count(*) from public.reports where user_id=v_user and created_at>now()-interval '1 hour')>=5 then raise exception 'report rate limit reached'; end if;
  if not exists(select 1 from public.scans where id=p_scan_id and user_id=v_user) then raise exception 'scan unavailable'; end if;
  if p_reason not in ('packaging_discrepancy','registration_concern','expiry_concern','other') then raise exception 'invalid reason'; end if;
  if char_length(coalesce(p_notes,''))>1000 or char_length(coalesce(p_contact,''))>200 then raise exception 'input too long'; end if;
  select * into v_report from public.reports where user_id=v_user and idempotency_key=p_idempotency_key;
  if found then return query select v_report.id,v_report.public_reference,v_report.status; return; end if;
  insert into public.consent_records(user_id,purpose,granted,policy_version) values(v_user,'report_submission',true,p_policy_version) returning id into v_consent;
  insert into public.reports(user_id,scan_id,reason,notes,contact_information,consented_at,consent_record_id,idempotency_key,status)
  values(v_user,p_scan_id,p_reason,nullif(p_notes,''),nullif(p_contact,''),now(),v_consent,p_idempotency_key,'submitted') returning * into v_report;
  insert into public.report_events(report_id,actor_id,event_type,to_status,note) values(v_report.id,v_user,'submitted','submitted','Submitted by report owner');
  return query select v_report.id,v_report.public_reference,v_report.status;
end; $$;
revoke all on function public.submit_review_report(uuid,text,text,text,uuid,text) from public;
grant execute on function public.submit_review_report(uuid,text,text,text,uuid,text) to authenticated;
