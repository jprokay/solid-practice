import { Component, createSignal, onMount } from "solid-js"
import { Tables } from "../types/supabase"
import { A } from "@solidjs/router";

type LoopProps = Tables<"loops">

export const LoopCard: Component<LoopProps> = (props: LoopProps) => {
  const [url, setUrl] = createSignal<string>("/");

  onMount(() => {
    const url = new URL(window.location.origin);
    url.searchParams.append("startMinute", String(props.loop_start_minute))
    url.searchParams.append("startSecond", String(props.loop_start_second))

    url.searchParams.append("endMinute", String(props.loop_end_minute))
    url.searchParams.append("endSecond", String(props.loop_end_second))

    url.searchParams.append("videoId", String(props.video_id))
    url.searchParams.append("id", String(props.loop_id))

    url.searchParams.append("loopName", String(props.loop_name))

    setUrl(url.toString())
  })

  const pad = (num: Number | null) => String(num || "0").padStart(2, '0')


  return (
    <div class="card">
      <div class="card-image">
        <figure class="image is-4by3">
          <img src={props.video_thumbail || ""} alt={props.video_name || ""} />
        </figure>
      </div>
      <div class="card-content">
        <p class="title is-4">{props.loop_name}</p>
        <div class="content">
          {pad(props.loop_start_minute)}:{pad(props.loop_start_second)} - {pad(props.loop_end_minute)}:{pad(props.loop_end_second)}
        </div>
      </div>
      <footer class="card-footer">
        <A href={url()} class="card-footer-item">Practice!</A>
      </footer>
    </div>
  )
}

type LoopTableProps = {
  loops: Array<LoopProps>
}

export const LoopCards: Component<LoopTableProps> = (props: LoopTableProps) => {

  return (
    <div class="grid">
      {props.loops.map((loop) => <div class="cell"><LoopCard {...loop} /></div>)}
    </div>
  )
}
