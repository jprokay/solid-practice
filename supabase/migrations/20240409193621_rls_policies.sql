-- migrate:up
BEGIN;

alter table v1.loops enable row level security;

create policy "Users can manage loops." on v1.loops
for all 
to authenticated
using ( auth.uid() = profile_id )
with check ( auth.uid() = profile_id );

alter table v1.profiles enable row level security;

create policy "Users can manage profiles." on v1.profiles
for all 
to authenticated
using ( auth.uid() = profile_id )
with check ( auth.uid() = profile_id );

alter view if exists public.loops set ( security_invoker = on );

COMMIT;

-- migrate:down
BEGIN;

drop policy "Users can manage profiles." on v1.profiles;
drop policy "Users can manage loops." on v1.loops;

alter table v1.loops disable row level security;
alter table v1.profiles disable row level security;

alter view if exists public.loops set ( security_invoker = off );

COMMIT;
