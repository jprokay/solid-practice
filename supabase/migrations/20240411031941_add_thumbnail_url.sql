-- migrate:up
BEGIN;

alter table if exists v1.youtube_videos
add column 
	youtube_video_thumbnail text generated always as ('https://img.youtube.com/vi/' || youtube_video_id || '/sddefault.jpg') stored;

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
	yt.youtube_video_name as video_name
from
	v1.loops l
	JOIN v1.youtube_videos yt on l.youtube_video_id = yt.youtube_video_id;

COMMIT;
-- migrate:down

