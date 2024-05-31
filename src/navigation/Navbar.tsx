import { A } from "@solidjs/router";
import { Match, Show, Switch, createSignal, onMount } from "solid-js";
import Login from "./../authentication/Login";
import { Portal } from "solid-js/web";
import "./Navbar.module.css";
import { User } from "@supabase/supabase-js";
import supabase from "./../supabase";
import { Notification, useNotification } from "../components/Notification";

const Navbar = () => {
  const [isOpen, setIsOpen] = createSignal(false);
  const { show: showNotification, setShow: setShowNotification, notification, setNotification } = useNotification()
  const [user, setUser] = createSignal<User>();

  onMount(async () => {
    const { data } = await supabase.auth.getSession()

    if (data.session) {
      setUser(data.session.user)
    }
  })

  const onLogout = async () => {
    await supabase.auth.signOut()
    setUser(undefined)
    setNotification({ type: "success", content: "Logged out" })
    setShowNotification(true)
  }

  return (
    <nav class="navbar" role="navigation" aria-label="main site navigation">
      <Portal>

        <Show when={isOpen()}>
          <div class={"modal is-active"}>
            <div class="modal-background" />
            <div class="modal-content has-background">
              <section>
                <Login
                  onCancel={() => setIsOpen(false)}
                  onConfirm={(user) => {
                    setIsOpen(false)
                    setShowNotification(true)
                    setUser(user)
                    location.reload()
                  }}
                  onError={(err) => {
                    setIsOpen(false)
                    setNotification("content", err)
                    setShowNotification(true)
                  }}
                />
              </section>
            </div>
          </div>

        </Show>
      </Portal>
      <Notification it={notification} show={showNotification()} />
      <div class="navbar-brand">
        <div class="navbar-item">
          <img src="ios/256.png"
            srcset="ios/16.png 16w,
             ios/32.png 32w,
             ios/64.png 64w,
             ios/128.png 128w,
             ios/192.png 192w,
             ios/256.png 256w,
             ios/512.png 512w,
             ios/1024.png 1024w"
            sizes="(max-width: 16px) 16px,
            (max-width: 32px) 32px,
            (max-width: 64px) 64px,
            (max-width: 128px) 128px,
            (max-width: 192px) 192px,
            (max-width: 256px) 256px,
            (max-width: 512px) 512px,
            1024px"
            alt="Cool smiley face wearing sunglasses. Playing guitar in front of a sunrise" />
        </div>

        <a
          role="button"
          class="navbar-burger"
          aria-label="menu"
          aria-expanded="false"
          data-target="navbar"
          onClick={(e) => {
            const target = e.currentTarget.dataset.target
            const $target = document.getElementById(target!)
            e.currentTarget.classList.toggle('is-active')
            $target?.classList.toggle('is-active')
          }
          }
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
        </div>

        <div class="navbar-end">
          <div class="navbar-item">
            <div class="buttons">
              <Switch fallback={
                <button class="button is-primary" onClick={() => setIsOpen(true)}>
                  <strong>Login</strong>
                </button>
              }>
                <Match when={user()}>
                  <button class="button is-primary" onClick={onLogout}><strong>Log Out</strong>
                  </button>
                </Match>
              </Switch>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
