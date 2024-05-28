import {
  createResource,
  type Component,
  createSignal,
  Switch,
  Match,
  createEffect,
  onMount,
} from "solid-js";
import supabase from "./../supabase";
import { User } from "@supabase/supabase-js";

type UserLogin = {
  email?: string,
  otp?: string
}

type RegisterUser = {
  email?: string,
  captcha?: string
}

async function registerUser(props: RegisterUser) {
  if (!props.email || !props.captcha) {
    return Promise.reject("Missing parameters");
  }

  return await supabase.auth.signInWithOtp({
    email: props.email,
    options: {
      shouldCreateUser: true,
      captchaToken: props.captcha
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
  onConfirm: (user: User) => void;
  onError: (error: string) => void;
  onCancel: () => void;
};


const Login: Component<LoginProps> = (props: LoginProps) => {
  const [user, setUser] = createSignal<UserLogin>();
  const [register, setRegister] = createSignal<RegisterUser>();
  const [step, setStep] = createSignal(0);
  const [resp] = createResource(register, registerUser);
  const [otpResp] = createResource(user, confirmOtp);

  let emailInput!: HTMLInputElement;
  let otpInput!: HTMLInputElement;

  async function submitEmail(e: Event): Promise<void> {
    e.preventDefault();

    const form = e.target as HTMLFormElement;

    const formData = new FormData(form);

    setRegister({ email: emailInput.value, captcha: formData.get("cf-turnstile-response") as string })
    setStep(1)
  }

  async function submitOTP(e: Event): Promise<void> {
    e.preventDefault();

    setUser({ email: emailInput.value, otp: otpInput.value });
    setStep(2)
  }

  createEffect(() => {
    if (otpResp() && otpResp()!.error != null) {
      props.onError(otpResp()!.error!.message)
    }

    if (otpResp() && otpResp()!.data.user != null) {
      props.onConfirm(otpResp()!.data.user!)
    }
  })

  onMount(() => {
    const ele = document.getElementById("captcha")
    window.turnstile.ready(function() {
      window.turnstile.render(ele, {
        sitekey: "3x00000000000000000000FF"
      })
    })
  })


  // TODO: Switch to mobile OTP
  // TODO: Add Oauth
  return (
    <Switch>
      <Match when={step() == 0}>
        <form onSubmit={submitEmail}>
          <div class="field">
            <label class="label">Email</label>
            <div class="control">
              <input
                id="emailInput"
                name="Email address"
                ref={emailInput}
                type="email"
                min="2"
                placeholder="Enter email"
                autocomplete="email"
              />
            </div>
          </div>
          <div id="captcha" class="cf-turnstile"></div>
          <div class="field is-grouped">
            <div class="control">
              <button
                type="submit"
                class="button"
              >
                Send
              </button>
            </div>
            <div class="control">
              <button type="button" class="button" onClick={() => props.onCancel()}>
                Cancel
              </button>
            </div>
          </div>
        </form>
      </Match>
      <Match when={step() == 1}>
        <form onSubmit={submitOTP}>
          <div class="field">
            <label class="label">OTP</label>
            <div class="control">
              <input id="otpInput" name="One time password" ref={otpInput} type="text" placeholder="One time password" />
            </div>
          </div>
          <div class="field is-grouped">
            <div class="control">
              <button class="button" type="submit">
                Confirm OTP
              </button>
            </div>
            <div class="control">
              <button type="button" class="button" onClick={() => props.onCancel()}>
                Cancel
              </button>
            </div>

          </div>
        </form>
      </Match>
      <Match when={step() == 2}>
        <Switch fallback={<div class="content">Success!</div>}>
          <Match when={otpResp.loading}>
            <div class="content">
              <p>Logging in...</p>
            </div>
          </Match>
          <Match when={otpResp.error === null}>
            <div class="content">
              <p>{`User: ${otpResp()?.data.user}`}</p>
            </div>
          </Match>
          <Match when={otpResp.error}>
            <div class="content">
              <p>Error: {`${resp.error}`}</p>
            </div>
          </Match>
        </Switch>
      </Match>
    </Switch>
  )

};

export default Login;
