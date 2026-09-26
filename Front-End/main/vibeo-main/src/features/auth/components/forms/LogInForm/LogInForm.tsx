import Image from "next/image";
import { motion } from "framer-motion";
import AuthInput from "../../ui/AuthInput/AuthInput";
import googleImage from "@/assets/images/google.png";
import { LogInFormState } from "../../../hooks/useLogInForm";
import type { FormProps } from "../../../types";
import styles from "./LogInForm.module.css";
import common from "../AuthForms.module.css";
import loadanimation from "@/assets/gifs/loadanimation.gif";
import { formAnim } from "@/features/auth/lib/formAnim";

export default function LogInForm({ form, mode, variant, isBusy, onSwitch }: FormProps<LogInFormState>) {
  const { fields, formError, isSubmitting, onChange, onSubmit, onGoogle } = form;
  const isLarge = variant === "large";
  const hidden = mode === "signUp";

  const anim = formAnim("left", isLarge, hidden);

  const base = fields.length + 1;
  const logo = anim(0);
  const error = anim(base);
  const submit = anim(base);
  const link = anim(base + 1);
  const divider = anim(base + 2);
  const google = anim(base + 3);

  return (
    <div className={isLarge ? common.formContainer : common.smallFormContainer} inert={isLarge && hidden}>
      <motion.div className={common.logo} {...logo}>
        <h2>Log In</h2>
        <div className={common.dash} />
      </motion.div>

      <form className={common.form} onSubmit={onSubmit} noValidate>
        {fields.map((f, i) => (
          <motion.div key={f.name} className={common.fieldWrap} {...anim(i + 1)}>
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
          </motion.div>
        ))}

        <div className={common.placeholder}></div>

        <motion.div className={common.formError} role="alert" {...error}>
          {formError ?? "\u00A0"}
        </motion.div>

        <motion.button type="submit" className={common.submitBtn} disabled={isBusy} aria-busy={isSubmitting} {...submit}>
          {isSubmitting ? <Image src={loadanimation} alt="" width={45} height={45} /> : "Log In"}
        </motion.button>

        {isLarge && (
          <motion.span className={common.linkText} {...link}>
            Don&apos;t have an account?{" "}
            <button type="button" className={common.link} onClick={onSwitch} disabled={hidden || isBusy}>
              Sign Up
            </button>
          </motion.span>
        )}

        <motion.div className={styles.divider} {...divider}>
          <div className={styles.line} />
          <span className={styles.or}>OR</span>
          <div className={styles.line} />
        </motion.div>

        <motion.button type="button" className={styles.googleLogin} disabled={isBusy} onClick={onGoogle} {...google}>
          <Image src={googleImage} alt="" width={37} height={37} className={styles.googleLogo} />
          <span>Continue with Google</span>
        </motion.button>
      </form>
    </div>
  );
}
