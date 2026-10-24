create or replace function public.delete_my_pharmalens_data()
returns void language plpgsql security definer set search_path='' as $$
declare v_user uuid:=auth.uid();
begin
 if v_user is null then raise exception 'authentication required'; end if;
 delete from public.reports where user_id=v_user;
 delete from public.scans where user_id=v_user;
 delete from public.consent_records where user_id=v_user;
 insert into public.audit_events(actor_id,action,entity_type,entity_id,metadata) values(v_user,'user.private_data_deleted','profile',v_user,'{}');
end; $$;
revoke all on function public.delete_my_pharmalens_data() from public;grant execute on function public.delete_my_pharmalens_data() to authenticated;
