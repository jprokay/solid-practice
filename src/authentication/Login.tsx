import {
  createResource,
  type Component,
  createSignal,
  Switch,
  Match,
} from "solid-js";
import supabase from "./../supabase";

type UserLogin = {
  email?: string,
  otp?: string
}

async function registerUser(user: UserLogin) {
  if (!user.email) {
    return Promise.reject("Missing email");
  }
  return await supabase.auth.signInWithOtp({
    email: user.email,
    options: {
      shouldCreateUser: true,
    },
  });

}

async function confirmOtp(user: UserLogin) {
  if (!user.email || !user.otp) {
    return Promise.reject("Missing parameters");
  }

  return await supabase.auth.verifyOtp({
    email: user.email,
    token: user.otp,
    type: 'email',
  })
}


type LoginProps = {
  onConfirm: (email: string) => void;
  onCancel: () => void;
};


const Login: Component<LoginProps> = (props: LoginProps) => {
  const [user, setUser] = createSignal<UserLogin>();
  const [step, setStep] = createSignal(0);
  const [resp] = createResource(user, registerUser);
  const [otpResp] = createResource(user, confirmOtp);

  let emailInput!: HTMLInputElement;
  let otpInput!: HTMLInputElement;

  return (
    <Switch>
      <Match when={step() == 0}>
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
                  setUser((user) => ({ ...user, email: emailInput.value }));
                  //props.onConfirm(emailInput.value);
                  setStep(1)
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
        </form>
      </Match>
      <Match when={step() == 1}>
        <form>
          <div class="field">
            <label class="label">OTP</label>
            <div class="control">
              <input ref={otpInput} type="text" placeholder="Email password" />
            </div>
          </div>
          <div class="field is-grouped">
            <div class="control">
              <button type="button" class="button" onClick={() => {
                setUser((user) => ({ ...user, otp: otpInput.value }));
                setStep(2)
              }} />
            </div>
          </div>
        </form>
      </Match>
      <Match when={step() == 2}>
        <Switch>
          <Match when={otpResp.loading}>
            <p>Logging in...</p>
          </Match>
          <Match when={otpResp.error === null}>
            <p>{`User: ${otpResp()?.data.user}`}</p>
          </Match>
          <Match when={otpResp.error}>
            <p>Error: {`${resp.error()}`}</p>
          </Match>
        </Switch>
      </Match>
    </Switch>
  )

};

export default Login;
