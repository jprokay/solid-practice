import { Component } from "solid-js";
import Player from "./../youtube/Player";

const Practice: Component = () => {
  return (
    <section class="section">
      <h1 class="title">Practice</h1>
      <div class="container">
        <Player />
      </div>
    </section >
  );
};

export default Practice;
