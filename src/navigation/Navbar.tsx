import { A } from "@solidjs/router";
import { createSignal } from "solid-js";
import Login from "./../authentication/Login";
import { Portal } from "solid-js/web";

const Navbar = () => {
  const [isOpen, setIsOpen] = createSignal(false);

  return (
    <nav class="navbar" role="navigation" aria-label="main site navigation">
      {isOpen() && (
        <Portal mount={document.body}>
          <div class={isOpen() ? "modal is-active" : "modal"}>
            <div class="modal-background" />
            <div class="modal-content">
              <Login
                onCancel={() => setIsOpen(false)}
                onConfirm={() => setIsOpen(false)}
              />
            </div>
          </div>
        </Portal>
      )}
      <div class="navbar-brand">
        <a class="navbar-item">
          <svg
            stroke="currentColor"
            fill="currentColor"
            stroke-width="0"
            viewBox="0 0 512 512"
            height="200px"
            width="200px"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M152.6 26.32L137.2 441.9 256 486.4l118.8-44.5-15.4-415.58L256 41.09 152.6 26.32zM64 89c-36 0-36 78 0 78h9.51l13-39-13-39H64zm374.5 0l-13 39 13 39h9.5c36 0 36-78 0-78h-9.5zM192 112a16 16 0 0 1 16 16 16 16 0 0 1-16 16 16 16 0 0 1-16-16 16 16 0 0 1 16-16zm128 0a16 16 0 0 1 16 16 16 16 0 0 1-16 16 16 16 0 0 1-16-16 16 16 0 0 1 16-16zm-217.6 7l2.1 6.2 1 2.8-3 9h28l.7-18h-28.8zm278.4 0l.7 18h28.1l-2.1-6.2-1-2.8 3-9h-28.7zM60 217c-36 0-36 78 0 78h9.51l13-39-13-39H60zm382.5 0l-13 39 13 39h9.5c36 0 36-78 0-78h-9.5zM192 240a16 16 0 0 1 16 16 16 16 0 0 1-16 16 16 16 0 0 1-16-16 16 16 0 0 1 16-16zm128 0a16 16 0 0 1 16 16 16 16 0 0 1-16 16 16 16 0 0 1-16-16 16 16 0 0 1 16-16zm-221.56 7l2.06 6.2 1 2.8-3 9h27.3l.7-18H98.44zm287.06 0l.7 18h27.4l-2.1-6.2-1-2.8 3-9h-28zM56 345c-36 0-36 78 0 78h9.51l13-39-13-39H56zm390.5 0l-13 39 13 39h9.5c36 0 36-78 0-78h-9.5zM192 368a16 16 0 0 1 16 16 16 16 0 0 1-16 16 16 16 0 0 1-16-16 16 16 0 0 1 16-16zm128 0a16 16 0 0 1 16 16 16 16 0 0 1-16 16 16 16 0 0 1-16-16 16 16 0 0 1 16-16zm-225.53 7l2.07 6.2.95 2.8-3 9h26.61l.6-18H94.47zm295.83 0l.6 18h26.7l-2.1-6.2-1-2.8 3-9h-27.2z"></path>
          </svg>
        </a>

        <a
          role="button"
          class="navbar-burger"
          aria-label="menu"
          aria-expanded="false"
          data-target="navbar"
        >
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>

      <div id="navbar" class="navbar-menu">
        <div class="navbar-start">
          <A class="navbar-item" href="/" activeClass="is-selected" end={true}>
            Practice
          </A>

          <A class="navbar-item" href="/loops" activeClass="is-selected">
            Loops
          </A>

          <A class="navbar-item" href="/stats" activeClass="is-selected">
            Stats
          </A>
        </div>
      </div>

      <div class="navbar-end">
        <div class="navbar-item">
          <div class="buttons">
            <button class="button is-primary" onClick={() => setIsOpen(true)}>
              <strong>Login</strong>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
