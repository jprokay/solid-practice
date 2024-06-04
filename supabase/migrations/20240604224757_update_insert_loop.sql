-- migrate:up
create or replace function public.insert_loops()
returns trigger
language plpgsql
security definer set search_path = v1 
as $$
begin
	insert into v1.youtube_videos (youtube_video_id, youtube_video_name)
	select new.video_id, new.video_name
	on conflict do nothing;

	insert into v1.loops (loop_start_minute, loop_start_second, loop_end_minute, loop_end_second, profile_id, youtube_video_id, loop_name)
	select new.loop_start_minute, new.loop_start_second, new.loop_end_minute, new.loop_end_second, auth.uid(), new.video_id, new.loop_name;
	
	return new;
end;
$$;



-- migrate:down

