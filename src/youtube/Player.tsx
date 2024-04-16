import {
  Component,
  For,
  Show,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
} from "solid-js";

import YouTubePlayer from "youtube-player";
import { type YouTubePlayer as YTPlayer } from "youtube-player/dist/types";
import { createStore, produce } from "solid-js/store"
import supabase from "../supabase";
import { useSearchParams } from "@solidjs/router";

const Player: Component = () => {
  const [search, setSearch] = useSearchParams();
  const [player, setPlayer] = createSignal<YTPlayer>();


  const [video, setVideo] = createStore({
    start: {
      minute: 0,
      second: 0,
    },
    end: {
      minute: 0,
      second: 0,
    },
    videoId: search.videoId || "nN120kCiVyQ",
    loop: false,
    playing: false,
    playbackRate: 1.0,
    duration: 0,
    name: undefined,
  });

  createEffect(() => console.log('End.minute: ', video.end.minute))

  const playbackRates = [
    0.25, 0.35, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.05, 1.1, 1.15, 1.2,
  ];


  onMount(() => {
    const ytPlayer = YouTubePlayer("player", {
      videoId: search.videoId || video.videoId,
      playerVars: {
        autoplay: 0,
        enablejsapi: 1,
        start: 0
      },
    });


    setPlayer(ytPlayer);
  });

  const timer = setInterval(() => {
    player()?.getDuration().then((duration) => {
      if (duration > 0 && video.end.minute <= 0 && video.end.second <= 0) {

        const endMinutes = Math.floor(duration / 60);
        const endSeconds = Math.round(duration % 60);

        console.log("setting duration", duration)

        setVideo("duration", duration)
        setVideo("end", ({
          minute: endMinutes,
          second: endSeconds,
        }));
      }
    })

  }, 500)

  onCleanup(() => clearInterval(timer))

  createEffect(() => {
    player()?.loadVideoById(search.videoId || video.videoId, 0);

    const start = {
      minute: parseInt(search.startMinute || '0'),
      second: parseInt(search.startSecond || '0'),
    }
    const endo = {
      minute: parseInt(search.endMinute || '0'),
      second: parseInt(search.endSecond || '0')
    }

    setVideo(produce((v) => {
      v.end = endo
      v.start = start
      v.playing = true
      v.duration = 0
    }))

  });

  setInterval(async () => {
    const endAsSeconds = video.end.minute * 60 + video.end.second

    const startAsSeconds = video.start.minute * 60 + video.start.second;

    const currTime = await player()?.getCurrentTime();
    if (currTime && currTime > endAsSeconds) {
      if (video.loop) {
        await player()?.seekTo(startAsSeconds, true);
      } else {
        player()?.stopVideo();
      }
    }
  }, 1000);

  createEffect(() => {
    const startAsSeconds = video.start.minute * 60 + video.start.second;
    player()?.seekTo(startAsSeconds, true);
  });

  createEffect(() => {
    player()?.setPlaybackRate(video.playbackRate);
  })

  function playVideo() {
    player()?.playVideo();
    setVideo("playing", true)
  }

  function pauseVideo() {
    player()?.pauseVideo();
    setVideo("playing", false)
  }

  function parseBrowserBarUrl(url: string): string | undefined {
    const regex = /^https?:\/\/[^/]+\/(?:watch\?v=)?([^&]+)/;
    const match = url.match(regex);

    if (match) {
      return match[1];
    }
    return undefined
  }


  function parseShareUrl(url: string): string | undefined {
    const regex = /^https?:\/\/[^/]+\/([^?]+)/;

    const match = url.match(regex);

    if (match) {
      return match[1];
    } return undefined
  }

  function parseUrl(url: string): string {
    return parseBrowserBarUrl(url) || parseShareUrl(url) || url
  }

  async function submitForm(e: Event): Promise<void> {
    e.preventDefault();
    const form = e.target as HTMLFormElement;

    const formData = new FormData(form);

    await supabase.from("loops").insert({
      loop_start_second: formData.get("startSeconds"),
      loop_start_minute: formData.get("startMinutes"),
      loop_end_second: formData.get("endSeconds"),
      loop_end_minute: formData.get("endMinutes"),
      video_id: formData.get("videoId"),
      video_name: "todo"
    })
  }

  return (
    <form onSubmit={submitForm}>
      <div class="container">
        <div id="player"></div>
        <div class="field">
          <label class="label">Video URL</label>
          <div class="control">
            <input
              class="input"
              type="text"
              name="videoId"
              required={true}
              value={video.videoId}
              onInput={(e) => {
                const videoId = parseUrl(e.target.value)
                setSearch({ startMinute: undefined, startSecond: undefined, videoId, endMinute: undefined, endSecond: undefined })
                setVideo("videoId", videoId);
              }}
            />
          </div>
        </div>
        <div class="level">
          <div class="level-item ">
            <input
              type="number"
              class="input"
              name="startMinutes"
              required={true}
              value={video.start.minute}
              onInput={(e) => setVideo("start", (start) => ({ ...start, minute: Number(e.target.value) }))}
            />
            <input
              type="number"
              class="input"
              name="startSeconds"
              required={true}
              value={video.start.second}
              onInput={(e) => setVideo("start", (start) => ({ ...start, second: Number(e.target.value) }))}
            />
          </div>
          <Show
            when={video.playing}
            fallback={
              <button
                class="level-item button is-rounded"
                type="button"
                onClick={() => playVideo()}
              >
                <span class="icon">
                  <svg
                    stroke="currentColor"
                    fill="currentColor"
                    stroke-width="0"
                    viewBox="0 0 24 24"
                    height="200px"
                    width="200px"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g id="Play_1">
                      <path d="M6.562,21.94a2.5,2.5,0,0,1-2.5-2.5V4.56A2.5,2.5,0,0,1,7.978,2.5L18.855,9.939a2.5,2.5,0,0,1,0,4.12L7.977,21.5A2.5,2.5,0,0,1,6.562,21.94Zm0-18.884a1.494,1.494,0,0,0-.7.177,1.477,1.477,0,0,0-.8,1.327V19.439a1.5,1.5,0,0,0,2.35,1.235l10.877-7.44a1.5,1.5,0,0,0,0-2.471L7.413,3.326A1.491,1.491,0,0,0,6.564,3.056Z"></path>
                    </g>
                  </svg>
                </span>
              </button>
            }
          >
            <button
              class="level-item button is-rounded"
              type="button"
              onClick={() => pauseVideo()}
            >
              <span class="icon">
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  stroke-width="0"
                  viewBox="0 0 24 24"
                  height="200px"
                  width="200px"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g id="Pause_1">
                    <g>
                      <path d="M8.25,21.937H6.564a2.5,2.5,0,0,1-2.5-2.5V4.563a2.5,2.5,0,0,1,2.5-2.5H8.25a2.5,2.5,0,0,1,2.5,2.5V19.437A2.5,2.5,0,0,1,8.25,21.937ZM6.564,3.063a1.5,1.5,0,0,0-1.5,1.5V19.437a1.5,1.5,0,0,0,1.5,1.5H8.25a1.5,1.5,0,0,0,1.5-1.5V4.563a1.5,1.5,0,0,0-1.5-1.5Z"></path>
                      <path d="M17.436,21.937H15.75a2.5,2.5,0,0,1-2.5-2.5V4.563a2.5,2.5,0,0,1,2.5-2.5h1.686a2.5,2.5,0,0,1,2.5,2.5V19.437A2.5,2.5,0,0,1,17.436,21.937ZM15.75,3.063a1.5,1.5,0,0,0-1.5,1.5V19.437a1.5,1.5,0,0,0,1.5,1.5h1.686a1.5,1.5,0,0,0,1.5-1.5V4.563a1.5,1.5,0,0,0-1.5-1.5Z"></path>
                    </g>
                  </g>
                </svg>
              </span>
            </button>
          </Show>
          <div class="level-item">
            <input
              type="number"
              class="input"
              name="endMinutes"
              required={true}
              value={video.end.minute}
              onInput={(e) => setVideo("end", (end) => ({ ...end, minute: Number(e.target.value) }))}
            />
            <input
              type="number"
              class="input"
              name="endSeconds"
              required={true}
              value={video.end.second}
              onInput={(e) => setVideo("end", (end) => ({ ...end, second: Number(e.target.value) }))}
            />
          </div>
          <label class="checkbox">
            <input type="checkbox" name="loop" onClick={() => setVideo("loop", (loop) => !loop)} />
            Loop
          </label>
        </div>
        <div class="field has-addons">
          <For each={playbackRates}>
            {(rate) => (
              <div class="control">
                <button
                  type="button"
                  class={video.playbackRate == rate ? "button is-active" : "button"}
                  onClick={() => setVideo("playbackRate", rate)}
                >
                  {Math.ceil(rate * 100)}%
                </button>
              </div>
            )}
          </For>
        </div>
        <div class="control">
          <button class="button is-link" type="submit">Save</button>
        </div>
      </div>
    </form>
  );
};

export default Player;
