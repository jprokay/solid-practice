-- migrate:up
BEGIN;

-- create table for videos
create table v1.youtube_videos (
	youtube_video_id varchar(16) primary key,
	youtube_video_name text
);

-- create table for loops
create table v1.loops (
	loop_id uuid primary key default uuid_generate_v4(), 

	loop_start_minute integer not null default 0 check (loop_start_minute >= 0),
	loop_start_second integer not null default 0 check (loop_start_second >= 0),

	loop_start_in_seconds integer generated always as (loop_start_minute * 60 + loop_start_second) stored,

	loop_end_minute integer not null default 0 check (loop_start_minute >= 0),
	loop_end_second integer not null check (loop_end_second >= 0),

	loop_end_in_seconds integer generated always as (loop_end_minute * 60 + loop_end_second) stored,

	loop_created_at timestamp default current_timestamp,
	
	loop_updated_at timestamp default current_timestamp,
	
	CONSTRAINT end_gt_start CHECK (loop_end_in_seconds >= loop_start_in_seconds),
	
	youtube_video_id varchar(16) not null references v1.youtube_videos,	

	profile_id uuid not null references auth.users on delete cascade
);

-- create a function and trigger for updating the loop updated at
create or replace function v1.update_loop_updated_at()
returns trigger
language plpgsql
security definer set search_path = v1
as $$
begin
	new.loop_updated_at = current_timestamp;
	return new;
end;
$$;

create trigger update_v1_loops_updated_at
before update on v1.loops
for each row
execute function v1.update_loop_updated_at();

create view public.youtube_videos as
select *
from v1.youtube_videos;

-- create public view for loops
create view public.loops as
select
	l.loop_id,

	l.loop_start_minute,
	l.loop_start_second,
	l.loop_start_in_seconds as loop_start,

	l.loop_end_minute,
	l.loop_end_second,
	l.loop_end_in_seconds as loop_end,

	l.profile_id,

	youtube_video_id as video_id
from
	v1.loops l;

COMMIT;

-- migrate:down
-- BEGIN;
--
-- drop view if exists public.loops cascade;
--
-- drop function if exists v1.update_loop_updated_at cascade;
--
-- drop table if exists v1.loops;
--
-- drop table if exists v1.youtube_videos cascade;
--
--
-- COMMIT;
