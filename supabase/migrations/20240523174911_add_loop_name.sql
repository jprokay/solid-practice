-- migrate:up

alter table if exists v1.loops
add column loop_name text default('');

create or replace view public.loops
as select
	l.loop_id,

	l.loop_start_minute,
	l.loop_start_second,
	l.loop_start_in_seconds as loop_start,

	l.loop_end_minute,
	l.loop_end_second,
	l.loop_end_in_seconds as loop_end,

	l.profile_id,

	l.youtube_video_id as video_id,
	yt.youtube_video_thumbnail as video_thumbail,
	yt.youtube_video_name as video_name,	
	l.loop_name
from
	v1.loops l
	JOIN v1.youtube_videos yt on l.youtube_video_id = yt.youtube_video_id;


-- migrate:down

