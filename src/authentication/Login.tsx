import {
  createResource,
  type Component,
  createSignal,
  Switch,
  Match,
} from "solid-js";
import supabase from "./../supabase";
async function registerUser(email?: string) {
  if (!email) {
    return;
  }
  const resp = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
    },
  });

  return resp;
}

type LoginProps = {
  onConfirm: (email: string) => void;
  onCancel: () => void;
};

const Login: Component<LoginProps> = (props: LoginProps) => {
  const [email, setEmail] = createSignal<string | undefined>();
  const [resp] = createResource(email, registerUser);

  let emailInput!: HTMLInputElement;
  return (
    <form>
      <div class="field">
        <label class="label">Email</label>
        <div class="control">
          <input
            ref={emailInput}
            type="email"
            min="2"
            placeholder="Enter email"
          />
        </div>
      </div>
      <div class="field is-grouped">
        <div class="control">
          <button
            type="button"
            class="button"
            onClick={() => {
              setEmail(emailInput.value);
              props.onConfirm(emailInput.value);
            }}
          >
            Send
          </button>
        </div>
        <div class="control">
          <button class="button" onClick={() => props.onCancel}>
            Cancel
          </button>
        </div>
      </div>
      <Switch>
        <Match when={resp.error === null}>
          <p>Check your inbox</p>
        </Match>
        <Match when={resp.error}>
          <p>Error: {`${resp.error()}`}</p>
        </Match>
      </Switch>
    </form>
  );
};

export default Login;
