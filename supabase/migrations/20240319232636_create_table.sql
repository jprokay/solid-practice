-- migrate:up
BEGIN;

-- schema to hold v1 models
create schema v1;

grant usage on schema v1 to postgres;
grant all privileges on all tables in schema v1 to postgres;

-- create v1 profiles
create table v1.profiles (
	profile_id uuid not null references auth.users on delete cascade,
	profile_created_at timestamp default current_timestamp,
	profile_updated_at timestamp default current_timestamp,
	primary key (profile_id)
);

-- create a function and trigger for updating the updated at
create or replace function v1.update_profile_updated_at()
returns trigger
language plpgsql
security definer set search_path = v1
as $$
begin
	new.profile_updated_at = current_timestamp;
	return new;
end;
$$;

create trigger update_v1_profiles_updated_at
before update on v1.profiles
for each row
execute function v1.update_profile_updated_at();

-- inserts a row into v1.profiles
create function v1.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = v1
as $$
begin
  insert into v1.profiles (profile_id) values (new.id);
  return new;
end;
$$;

-- trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure v1.handle_new_user();

-- create a public view for profiles
create view public.profiles as
select
	p.profile_id,
	p.profile_created_at,
	p.profile_updated_at,
	u.email
from
	v1.profiles p
	JOIN auth.users u on p.profile_id = u.id;

COMMIT;

-- migrate:down
drop view if exists public.profiles;

drop trigger if exists on_auth_user_created on auth.users;

drop function if exists v1.handle_new_user;

drop table if exists v1.profiles;

drop schema if exists v1 cascade;
