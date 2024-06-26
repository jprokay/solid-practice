import {
  Component,
  JSX,
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
import { Notification, useNotification } from "../components/Notification";
import { PostgrestError } from "@supabase/supabase-js";
import { debounce } from "@solid-primitives/scheduled";

type Props = {
  enableSave: boolean
  fallback: JSX.Element
}

function parseBrowserBarUrl(url: string): string | undefined {
  const regex = /^https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([^&]+)/;
  const match = url.match(regex);

  if (match) {
    return match[1];
  }
  return undefined
}


function parseShareUrl(url: string): string | undefined {
  const regex = /^https?:\/\/(?:www\.)?youtu\.be\/([^?]+)/;

  const match = url.match(regex);

  if (match) {
    return match[1];
  } return undefined
}

function parseUrl(url: string): string {
  return parseBrowserBarUrl(url) || parseShareUrl(url) || url
}

const DEFAULT_URL = 'https://youtube.com/watch?v=nN120kCiVyQ'

const Player: Component<Props> = (props) => {
  const [search, setSearch] = useSearchParams();
  const [player, setPlayer] = createSignal<YTPlayer>();
  const [slider, setSlider] = createSignal(1);

  const [video, setVideo] = createStore({
    start: {
      minute: Number(search.startMinute || 0),
      second: Number(search.startSecond || 0),
    },
    end: {
      minute: Number(search.endMinute || 0),
      second: Number(search.endSecond || 0),
    },
    videoId: search.videoId || parseUrl(DEFAULT_URL),
    videoUrl: search.videoUrl || DEFAULT_URL,
    loop: false,
    playing: false,
    playbackRate: 1.0,
    duration: 0,
    name: undefined,
  });

  const { show: showNotification, setShow: setShowNotification, notification, setNotification } = useNotification()

  onMount(() => {
    const startSec = Number(search.startMinute || 0) * 60 + Number(search.startSecond || 0)

    const ytPlayer = YouTubePlayer("player", {
      videoId: search.videoId || video.videoId,
      width: undefined,
      height: undefined,
      playerVars: {
        autoplay: 0,
        enablejsapi: 1,
        start: startSec
      },
    });

    setPlayer(ytPlayer);
  });

  function changeVideo(url: string) {
    const videoId = parseUrl(url)

    if (!videoId) {
      return
    }
    player()?.loadVideoById(videoId, 0);

    setVideo(produce((v) => {
      v.start = {
        second: 0,
        minute: 0
      }
      v.end = {
        second: 0,
        minute: 0
      }
      v.duration = 0
      v.videoId = videoId
      v.videoUrl = url
    }))
    setSearch({
      startMinute: undefined,
      startSecond: undefined,
      videoId,
      videoUrl: url,
      endMinute:
        undefined,
      endSecond: undefined
    })
  }

  const timer = setInterval(() => {
    player()?.getDuration().then((duration) => {
      if (duration > 0 && video.end.minute <= 0 && video.end.second <= 0) {

        const endMinutes = Math.floor(duration / 60);
        const endSeconds = Math.round(duration % 60);

        setVideo("duration", duration)
        setVideo("end", ({
          minute: endMinutes,
          second: endSeconds,
        }));
      }
    })

  }, 500)


  const loopInterval = setInterval(async () => {
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

  function changeStartMinute(e: InputEvent) {
    const input = e.target as HTMLInputElement
    const minute = Number(input.value)
    setVideo("start", (start) => ({ ...start, minute })
    )
    changeStart(minute, video.start.second)
  }

  function changeStartSecond(e: InputEvent) {
    const input = e.target as HTMLInputElement
    const second = Number(input.value)
    setVideo("start", (start) => ({ ...start, second: second })
    )
    changeStart(video.start.minute, second)
  }

  function changeEndMinute(e: InputEvent) {
    const input = e.target as HTMLInputElement
    const minute = Number(input.value)
    setVideo("end", (end) => ({ ...end, minute })
    )
  }

  function changeEndSecond(e: InputEvent) {
    const input = e.target as HTMLInputElement
    const second = Number(input.value)
    setVideo("end", (end) => ({ ...end, second })
    )
  }

  const debouncedChangeStartMinute = debounce(changeStartMinute, 500)
  const debouncedChangeStartSecond = debounce(changeStartSecond, 500)
  const debouncedChangeEndMinute = debounce(changeEndMinute, 500)
  const debouncedChangeEndSecond = debounce(changeEndSecond, 500)

  onCleanup(() => {
    clearInterval(loopInterval)
    clearInterval(timer)
    debouncedChangeStartMinute.clear()
    debouncedChangeStartSecond.clear()
    debouncedChangeEndMinute.clear()
    debouncedChangeEndSecond.clear()
  })

  createEffect(() => {
    player()?.setPlaybackRate(video.playbackRate);
  })

  function playVideo() {
    player()?.playVideo();
    setVideo("playing", true)
  }

  type TimePiece = {
    minute: number,
    second: number
  }
  async function getCurrentTime(): Promise<TimePiece | undefined> {
    const currTime = await player()?.getCurrentTime();
    if (currTime) {
      const minute = Math.floor(currTime / 60);
      const second = Math.floor(currTime - (minute * 60))

      return { minute, second }
    }
    return undefined
  }

  async function setStartToNow() {
    const currTime = await getCurrentTime()
    if (currTime) {

      setVideo("start", ({
        minute: currTime.minute,
        second: currTime.second
      }))
    }
  }

  async function setEndToNow() {
    const currTime = await getCurrentTime()
    if (currTime) {

      setVideo("end", ({
        minute: currTime.minute,
        second: currTime.second
      }))
    }
  }

  function pauseVideo() {
    player()?.pauseVideo();
    setVideo("playing", false)
  }

  function changeStart(startMinute: number, startSecond: number) {
    const startAsSeconds = startMinute * 60 + startSecond;
    player()?.seekTo(startAsSeconds, true);

    if (!video.playing) {
      player()?.pauseVideo();
    }
  }


  async function submitForm(e: Event): Promise<void> {
    e.preventDefault();
    const form = e.target as HTMLFormElement;

    const formData = new FormData(form);

    const id = formData.get("loopId")

    var error: PostgrestError | null = null
    try {
      if (id) {
        const data = await supabase.from("loops").update({
          loop_start_second: Number(formData.get("startSeconds") as string),
          loop_start_minute: Number(formData.get("startMinutes") as string),
          loop_end_second: Number(formData.get("endSeconds") as string),
          loop_end_minute: Number(formData.get("endMinutes") as string),
          video_id: formData.get("videoId") as string,
          loop_name: formData.get("loopName") as string,
          loop_id: id as string
        }).eq('loop_id', id)
        error = data.error

      } else {
        const data = await supabase.from("loops").insert({
          loop_start_second: Number(formData.get("startSeconds") as string),
          loop_start_minute: Number(formData.get("startMinutes") as string),
          loop_end_second: Number(formData.get("endSeconds") as string),
          loop_end_minute: Number(formData.get("endMinutes") as string),
          video_id: formData.get("videoId") as string,
          loop_name: formData.get("loopName") as string,
        })
        error = data.error
      }
      setNotification("content", "Saved")
    } catch {
      setNotification("content", "An error occurred")
      setNotification("type", "danger")
    } finally {
      if (error != null) {
        setNotification("content", "An error occurred")
        setNotification("type", "danger")
      }
      setShowNotification(true)
    }
  }

  return (
    <div class="container is-flex is-flex-direction-column is-justify-content-center is-align-items-center is-gap-2">
      <Notification it={notification} show={showNotification()} />
      <div id="player-container">
        <div id="player"></div>
      </div>

      <div>
        <form onSubmit={submitForm}>
          <Show when={search.id}>
            <div id="loop-id" class="field">
              <div class="control disabled">
                <input id="loop-id" class="input" type="hidden" name="loopId" value={search.id} readonly={true} />
              </div>
              <label class="label help">Loop ID</label>
            </div>
          </Show>

          <div class="field">
            <div class="control field is-grouped">
              <input
                class="input"
                type="url"
                name="videoUrl"
                inputmode="url"
                required={true}
                onInput={(e) => {
                  changeVideo(e.target.value)
                }}
                value={video.videoUrl}
              />
              <button type="button" class="button is-primary is-outlined" onClick={() => setVideo("videoUrl", "")}>Clear</button>
              <input class="input" name="videoId" value={video.videoId} readonly={true} type="hidden" />

            </div>

            <label class="label help">Video URL</label>
          </div>
          <div class="field">
            <div class="control">
              <input class="input" type="text" name="loopName" value={search.loopName || "Chorus"} />
            </div>
            <label class="label help">Loop Name</label>
          </div>
          <div class="level is-gap-4">
            <div class="level-left">
              <div class="level-item time-inputs">
                <input
                  type="number"
                  class="input time"
                  name="startMinutes"
                  required={true}
                  inputmode="numeric"
                  min={0}
                  value={video.start.minute}
                  onInput={(e) => debouncedChangeStartMinute(e)}
                />
                <input
                  type="number"
                  class="input time"
                  name="startSeconds"
                  inputmode="numeric"
                  required={true}
                  min={0}
                  max={59}
                  value={video.start.second}
                  onInput={(e) => debouncedChangeStartSecond(e)}
                />
                <button type="button" class="button is-primary is-outlined" onClick={setStartToNow}>Now</button>
              </div>
            </div>
            <div class="level-item is-gap-1">
              <Show
                when={video.playing}
                fallback={
                  <button
                    class="level-item button is-rounded play-pause"
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
                  class="level-item button is-rounded play-pause"
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

              <label id="set-loop">
                <input type="checkbox" name="loop" onClick={() => setVideo("loop", (loop) => !loop)} />
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </label>
            </div>

            <div class="level-right">
              <div class="level-item time-inputs">
                <input
                  type="number"
                  class="input time"
                  name="endMinutes"
                  inputmode="numeric"
                  min={0}
                  required={true}
                  value={video.end.minute}
                  onInput={(e) => debouncedChangeEndMinute(e)}
                />
                <input
                  type="number"
                  class="input time"
                  name="endSeconds"
                  inputmode="numeric"
                  min={0}
                  max={59}
                  required={true}
                  value={video.end.second}
                  onInput={(e) => debouncedChangeEndSecond(e)}
                />

                <button type="button" class="button is-primary is-outlined" onClick={setEndToNow}>Now</button>
              </div>
            </div>
          </div>
          <div class="field has-addons is-flex-direction-column is-align-items-center is-gap-2">
            <input type="range" name="playbackRate" min="0.3" max="1.5" step="0.10"
              onInput={(e) => setVideo("playbackRate", Number(e.target.value))}
              list="rates"
              id="rateRange" />

            <div class="field is-grouped is-align-items-center">

              <button type="button" class="button is-link is-outlined" onClick={() => setVideo("playbackRate", (rate) => Math.max(rate - 0.05, 0))}>-5%</button>
              <output id="value" class="is-size-6 has-text-grey">Speed: {video.playbackRate.toFixed(2)}x</output>
              <button type="button" class="button is-link is-outlined" onClick={() => setVideo("playbackRate", (rate) => Math.min(rate + 0.05, 1.5))}>+5%</button>
            </div>
          </div>
          <Show when={props.enableSave} fallback={props.fallback}>
            <div class="field is-grouped is-justify-content-center">
              <Show when={search.id}>
                <button class="button" type="submit">Update</button>
              </Show>
              <button class="button is-link" type="submit">Save</button>
            </div>
          </Show>
        </form>
      </div>
    </div>
  );
};

export default Player;
