import {
  Component,
  For,
  Show,
  createEffect,
  createSignal,
  onMount,
} from "solid-js";
import YouTubePlayer from "youtube-player";
import { type YouTubePlayer as YTPlayer } from "youtube-player/dist/types";

type YouTubeStateChangeEvent = CustomEvent & { data: number };
const Player: Component = () => {
  const [player, setPlayer] = createSignal<YTPlayer>();
  const [startSeconds, setStartSeconds] = createSignal(0);
  const [endSeconds, setEndSeconds] = createSignal(0);
  const [startMinutes, setStartMinutes] = createSignal(0);
  const [endMinutes, setEndMinutes] = createSignal(0);
  const [videoId, setVideoId] = createSignal("M7lc1UVf-VE");
  const [loop, setLoop] = createSignal(false);
  const [playing, setPlaying] = createSignal(false);

  const playbackRates = [
    0.25, 0.35, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.05, 1.1, 1.15, 1.2,
  ];

  const [playbackRate, setPlaybackRate] = createSignal(1.0);

  onMount(() => {
    const ytPlayer = YouTubePlayer("player", {
      videoId: videoId(),
      playerVars: {
        autoplay: 0,
        enablejsapi: 1,
      },
    });

    const readied = (event: YouTubeStateChangeEvent) => {
      console.log("player is ready");
      console.log(event.data);

      if ([-1, 0, 3, 5].includes(event.data)) {
        ytPlayer.getDuration().then((duration) => {
          console.log(" duration ", duration);
          const endMinutes = Math.floor(duration / 60);
          const endSeconds = Math.round(duration % 60);

          setEndSeconds(endSeconds);
          setEndMinutes(endMinutes);
        });
      }
    };

    ytPlayer.on("stateChange", readied);
    setPlayer(ytPlayer);
  });

  createEffect(() => {
    console.log("loading ", videoId());
    player()?.loadVideoById(videoId(), 0);
    setStartMinutes(0);
    setStartSeconds(0);
    setPlaying(false);
  });

  setInterval(async () => {
    const endAsSeconds = endMinutes() * 60 + endSeconds();

    const startAsSeconds = startMinutes() * 60 + startSeconds();

    const currTime = await player()?.getCurrentTime();
    if (currTime && currTime > endAsSeconds) {
      if (loop()) {
        await player()?.seekTo(startAsSeconds, true);
      } else {
        player()?.stopVideo();
      }
    }
  }, 1000);

  createEffect(() => {
    const startAsSeconds = startMinutes() * 60 + startSeconds();
    player()?.seekTo(startAsSeconds, true);
  });

  function playVideo() {
    player()?.playVideo();
    setPlaying(true);
  }

  function pauseVideo() {
    player()?.pauseVideo();
    setPlaying(false);
  }

  return (
    <div class="container">
      <div id="player"></div>
      <div class="field">
        <label class="label">Video URL</label>
        <div class="control">
          <input
            class="input"
            type="text"
            onInput={(e) => {
              setVideoId(e.target.value);
            }}
          />
        </div>
      </div>
      <div class="level">
        <div class="level-item ">
          <input
            type="number"
            class="input"
            value={startMinutes()}
            onInput={(e) => setStartMinutes(Number(e.target.value))}
          />
          <input
            type="number"
            class="input"
            value={startSeconds()}
            onInput={(e) => setStartSeconds(Number(e.target.value))}
          />
        </div>
        <Show
          when={playing()}
          fallback={
            <button
              class="level-item button is-rounded"
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
            value={endMinutes()}
            onInput={(e) => setEndMinutes(Number(e.target.value))}
          />
          <input
            type="number"
            class="input"
            value={endSeconds()}
            onInput={(e) => setEndSeconds(Number(e.target.value))}
          />
        </div>
        <label class="checkbox">
          <input type="checkbox" onClick={() => setLoop((val) => !val)} />
          Loop
        </label>
      </div>
      <div class="field has-addons">
        <For each={playbackRates}>
          {(rate) => (
            <p class="control">
              <button
                class={playbackRate() == rate ? "button is-active" : "button"}
                onClick={() => setPlaybackRate(rate)}
              >
                {Math.ceil(rate * 100)}%
              </button>
            </p>
          )}
        </For>
      </div>
    </div>
  );
};

export default Player;
