create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  new_organization_id uuid;
  display_name text;
  organization_name text;
begin
  display_name := coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), split_part(new.email, '@', 1));
  organization_name := coalesce(nullif(new.raw_user_meta_data->>'organization_name', ''), 'Minha empresa');

  insert into public.organizations (name, slug)
  values (organization_name, lower(regexp_replace(organization_name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || left(new.id::text, 8))
  returning id into new_organization_id;

  insert into public.profiles (id, organization_id, full_name, job_title, role)
  values (new.id, new_organization_id, display_name, 'Administrador', 'admin');

  insert into public.health_score_settings (organization_id)
  values (new_organization_id);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;
