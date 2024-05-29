-- migrate:up
-- update loops
create or replace function public.update_loops()
returns trigger
language plpgsql
security definer set search_path = v1 
as $$
begin
	insert into v1.youtube_videos (youtube_video_id, youtube_video_name)
	select new.video_id, new.video_name
	on conflict do nothing;

	update v1.loops
	set
		loop_start_minute = new.loop_start_minute,
		loop_start_second = new.loop_start_second,
		loop_end_minute = new.loop_end_minute,
		loop_end_second = new.loop_end_second,
		youtube_video_id = new.video_id,
		loop_name = new.loop_name
	where loop_id = new.loop_id;

	return new;
end;
$$;

create trigger update_public_loop_trigger
instead of update on public.loops
for each row execute function public.update_loops();

-- delete loops
create or replace function public.delete_loops()
returns trigger
language plpgsql
security definer set search_path = v1 
as $$
begin
	delete from v1.loops where loop_id = new.loop_id;

	return new;
end;
$$;

create trigger delete_public_loop_trigger
instead of delete on public.loops
for each row execute function public.delete_loops();

-- migrate:down
-- drop function if exists public.update_loops cascade;
-- drop function if exists public.delete_loops cascade;

