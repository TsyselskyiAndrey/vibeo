import type { LogInFormState } from "./hooks/useLogInForm";
import type { SignUpFormState } from "./hooks/useSignUpForm";

export type Mode = "signUp" | "signIn";
export type AuthProps = {
  mode: Mode;
  onToggle: () => void;
  isBusy: boolean;
  logIn: LogInFormState;
  signUp: SignUpFormState;
};

export type FormProps<T> = {
  form: T;
  mode: Mode;
  variant: "large" | "small";
  isBusy: boolean;
  onSwitch: () => void;
};
