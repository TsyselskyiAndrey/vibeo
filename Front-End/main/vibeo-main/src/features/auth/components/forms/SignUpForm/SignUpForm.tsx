import Image from "next/image";
import { motion } from "framer-motion";
import AuthInput from "../../ui/AuthInput/AuthInput";
import CodeInput from "../../ui/CodeInput/CodeInput";
import type { SignUpFormState } from "../../../hooks/useSignUpForm";
import type { FormProps } from "../../../types";
import common from "../AuthForms.module.css";
import styles from "./SignUpForm.module.css";
import loadanimation from "@/assets/gifs/loadanimation.gif";
import { formAnim } from "@/features/auth/lib/formAnim";

export default function SignUpForm({ form, mode, variant, isBusy, onSwitch }: FormProps<SignUpFormState>) {
  const { step, stepCount, isLastStep, email, fields, formError, isSubmitting, onChange, onSubmit, onBack } = form;
  const isLarge = variant === "large";
  const hidden = mode === "signIn";

  const anim = formAnim("right", isLarge, hidden);

  const offset = isLastStep ? 3 : 2;
  const logo = anim(0);
  const selector = anim(1);
  const verify = anim(2);
  const error = anim(offset + fields.length);
  const buttons = anim(offset + fields.length);
  const link = anim(offset + fields.length + 1);

  return (
    <div className={isLarge ? common.formContainer : common.smallFormContainer} inert={isLarge && hidden}>
      <motion.div className={common.logo} {...logo}>
        <h2>Sign Up</h2>
        <div className={common.dash} />
      </motion.div>

      <form className={common.form} onSubmit={onSubmit} noValidate>
        <motion.div
          className={styles.pageSelector}
          {...selector}
          role="progressbar"
          aria-label="Sign up progress"
          aria-valuemin={1}
          aria-valuemax={stepCount}
          aria-valuenow={step + 1}
        >
          {Array.from({ length: stepCount }, (_, i) => (
            <div key={i} className={i === step ? `${styles.selector} ${styles.active}` : styles.selector} />
          ))}
        </motion.div>

        {isLastStep && (
          <motion.div className={styles.verifyInfo} {...verify}>
            <h2>Verify your email!</h2>
            <p>
              We sent a code to <b className={styles.email}>{email}</b>. You may need to check your spam or junk folder. Please enter the code below.
            </p>
          </motion.div>
        )}

        {fields.map((f, i) => {
          const a = anim(offset + i);
          return (
            <motion.div key={f.name} className={common.fieldWrap} {...a}>
              {f.type === "code" ? (
                <CodeInput name={f.name} error={f.error} shake={f.shake} onChange={(value) => onChange(f.name, value)} />
              ) : (
                <AuthInput
                  type={f.type}
                  name={f.name}
                  label={f.label}
                  value={f.value}
                  error={f.error}
                  shake={f.shake}
                  autoComplete={f.autoComplete}
                  onChange={(value) => onChange(f.name, value)}
                />
              )}
            </motion.div>
          );
        })}

        <div className={common.placeholder}></div>

        <motion.div className={common.formError} role="alert" {...error}>
          {formError ?? "\u00A0"}
        </motion.div>

        <motion.div className={styles.btnContainer} {...buttons}>
          <button
            type="button"
            className={common.submitBtn + " " + styles.btnBack}
            onClick={onBack}
            disabled={step === 0 || isBusy}
            aria-label="Back"
          >
            🡐
          </button>
          <button type="submit" className={common.submitBtn + " " + styles.btnContinue} disabled={isBusy} aria-busy={isSubmitting}>
            {isSubmitting ? <Image src={loadanimation} alt="" width={45} height={45} /> : isLastStep ? "Sign Up" : "Continue"}
          </button>
        </motion.div>

        {isLarge && (
          <motion.span className={common.linkText} {...link}>
            Already have an account?{" "}
            <button type="button" className={common.link} onClick={onSwitch} disabled={hidden || isBusy}>
              Log In
            </button>
          </motion.span>
        )}
      </form>
    </div>
  );
}
