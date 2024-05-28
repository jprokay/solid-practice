import { Component, Suspense, createResource } from "solid-js";
import supabase from "../supabase";
import { Tables } from "../types/supabase"
import { LoopCards } from "../loops/Card";

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
      <LoopCards loops={loops() || []} />
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
