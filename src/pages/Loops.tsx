import { Component, For, Suspense, createEffect, createResource, createSignal, onMount } from "solid-js";
import supabase from "../supabase";
import { Tables } from "../types/supabase"
import { useNavigate } from "@solidjs/router";

type LoopProps = Tables<"loops">

const LoopRow: Component<LoopProps> = (props: LoopProps) => {
  const [url, setUrl] = createSignal<string>("#");
  const navigate = useNavigate()
  onMount(() => {
    const url = new URL(window.location.origin);
    url.searchParams.append("startMinute", String(props.loop_start_minute))
    url.searchParams.append("startSecond", String(props.loop_start_second))

    url.searchParams.append("endMinute", String(props.loop_end_minute))
    url.searchParams.append("endSecond", String(props.loop_end_second))

    url.searchParams.append("videoId", String(props.video_id))

    setUrl(url.toString())
  })

  createEffect(() => console.log(url()))

  return (
    <tr onClick={() => navigate(url())}>
      <td>{"> FOOBAR BAZBAR BIZBUSS"}</td>
      <td>{props.loop_start_minute}:{props.loop_start_second}</td>
      <td>{props.loop_end_minute}:{props.loop_end_second}</td>
    </tr >
  )
}

type LoopTableProps = {
  loops: Array<LoopProps>
}

const LoopTable: Component<LoopTableProps> = (props: LoopTableProps) => {

  return (
    <div>
      <table class="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Start</th>
            <th>End</th>
          </tr>
        </thead>
        <tbody>
          <For each={props.loops}>
            {(loop) => <LoopRow {...loop} />}
          </For>
        </tbody>
      </table>
    </div>
  )
}

async function fetchLoops(): Promise<Tables<"loops">[]> {
  const { data } = await supabase.auth.getSession()
  const userId = data?.session?.user.id

  // TODO: Handle not-logged in case more cleanly
  if (!userId) {
    return []
  }

  const resp = await supabase.from('loops').select()
  if (resp.data) {
    return resp.data
  }
  return []
}

const AsyncLoopTable: Component = () => {
  const [loops] = createResource(fetchLoops)

  return (
    <Suspense fallback={<div class="skeleton-lines"><div /><div /><div /><div /><div /></div>}>
      <LoopTable loops={loops() || []} />
    </Suspense>
  )
}

const Page: Component = () => {
  return (
    <section class="section">
      <h1 class="title">Loops</h1>
      <div class="container">
        <AsyncLoopTable />
      </div>
    </section>
  )
}

export default Page;
