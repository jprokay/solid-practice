import { Component, JSX, createSignal, onMount } from "solid-js";
import Player from "./../youtube/Player";
import supabase from "../supabase";

const Fallback: JSX.Element = (
  <div>
    Log in to save your loop
  </div>
)

const Practice: Component = () => {
  const [loggedIn, setLoggedIn] = createSignal(false)

  onMount(async () => {
    const { data } = await supabase.auth.getSession()

    if (data.session) {
      setLoggedIn(true)
    }
  })

  return (
    <section class="section is-flex-direction-column">
      <h1 class="title">Practice</h1>
      <div class="container">
        <Player enableSave={loggedIn()} fallback={Fallback} />
      </div>
    </section >
  );
};

export default Practice;
