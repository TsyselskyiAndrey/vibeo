import type { AuthProps } from "../../types";
import LogInForm from "../forms/LogInForm/LogInForm";
import SignUpForm from "../forms/SignUpForm/SignUpForm";
import styles from "./AuthMobile.module.css";

type TabProps = {
  label: string;
  active: boolean;
  disabled: boolean;
  onSelect: () => void;
};

function Tab({ label, active, disabled, onSelect }: TabProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={`${styles.tab} ${active ? styles.active : ""}`}
      disabled={disabled}
      onClick={() => {
        if (!active) onSelect();
      }}
    >
      {label}
    </button>
  );
}

export default function AuthMobile({ mode, onToggle, isBusy, logIn, signUp }: AuthProps) {
  const isSignUp = mode === "signUp";

  return (
    <div className={styles.container}>
      <div className={styles.tabs} role="tablist">
        <Tab label="Log In" active={!isSignUp} disabled={isBusy} onSelect={onToggle} />
        <Tab label="Sign Up" active={isSignUp} disabled={isBusy} onSelect={onToggle} />
      </div>

      {isSignUp ? (
        <SignUpForm form={signUp} mode={mode} variant="small" isBusy={isBusy} onSwitch={onToggle} />
      ) : (
        <LogInForm form={logIn} mode={mode} variant="small" isBusy={isBusy} onSwitch={onToggle} />
      )}
    </div>
  );
}
