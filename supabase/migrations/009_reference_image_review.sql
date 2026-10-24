alter table public.reference_images add column if not exists width integer;
alter table public.reference_images add column if not exists height integer;
alter table public.reference_images add column if not exists approved_by uuid references public.profiles(id);
alter table public.reference_images add column if not exists approved_at timestamptz;
