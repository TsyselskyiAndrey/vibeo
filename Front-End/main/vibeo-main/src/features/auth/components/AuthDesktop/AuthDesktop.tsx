import { motion, type Variants } from "framer-motion";
import { type Mode, type AuthProps } from "../../types";
import styles from "./AuthDesktop.module.css";
import LogInForm from "../forms/LogInForm/LogInForm";
import SignUpForm from "../forms/SignUpForm/SignUpForm";

type Side = "left" | "right";

const SLOGAN = '"Stream Freely, Watch Endlessly – Your Entertainment, Your Way!", – Vibeo';

const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

const pos = (side: Side, value: string) => (side === "left" ? { left: value } : { right: value });

function slide(o: { side: Side; shown: string; hidden: string; visibleIn: Mode; enterDelay: number; exitDelay: number; duration: number }): Variants {
  const hiddenIn: Mode = o.visibleIn === "signUp" ? "signIn" : "signUp";
  return {
    [o.visibleIn]: {
      ...pos(o.side, o.shown),
      filter: "blur(0px)",
      transition: { duration: o.duration, ease: EASE, delay: o.enterDelay },
    },
    [hiddenIn]: {
      ...pos(o.side, o.hidden),
      filter: "blur(20px)",
      transition: { duration: o.duration, ease: EASE, delay: o.exitDelay },
    },
  };
}

const descriptionLeft = slide({ side: "left", shown: "7%", hidden: "-100%", visibleIn: "signUp", enterDelay: 1, exitDelay: 0, duration: 1.8 });
const yearLeft = slide({ side: "left", shown: "8%", hidden: "-80%", visibleIn: "signUp", enterDelay: 1 + 2 / 9, exitDelay: 1 / 9, duration: 1.7 });
const descriptionRight = slide({ side: "right", shown: "1%", hidden: "-100%", visibleIn: "signIn", enterDelay: 1, exitDelay: 0, duration: 1.8 });
const yearRight = slide({ side: "right", shown: "8%", hidden: "-100%", visibleIn: "signIn", enterDelay: 1 + 2 / 9, exitDelay: 1 / 9, duration: 1.7 });

const entityTransition = { duration: 1.3, ease: EASE, delay: 0.6 };

const entityVariants: Variants = {
  signUp: {
    clipPath: "polygon(60vw 0vw, 0vw 0vw, 0vw 125vw)",
    rotate: 0,
    transition: entityTransition,
  },
  signIn: {
    clipPath: "polygon(125vw 0vw, 0vw 0vw, 0vw 60vw)",
    rotate: 90,
    transition: entityTransition,
  },
};

const backVariants: Variants = {
  signUp: { rotate: 0, transition: entityTransition },
  signIn: { rotate: -90, transition: entityTransition },
};

export default function AuthDesktop({ mode, onToggle, logIn, signUp, isBusy }: AuthProps) {
  const year = new Date().getFullYear();

  return (
    <motion.div className={styles.container} initial={false} animate={mode}>
      <LogInForm form={logIn} mode={mode} variant="large" isBusy={isBusy} onSwitch={onToggle} />
      <SignUpForm form={signUp} mode={mode} variant="large" isBusy={isBusy} onSwitch={onToggle} />
      <motion.h2 className={`${styles.description} ${styles.descriptionLeft}`} variants={descriptionLeft}>
        {SLOGAN}
      </motion.h2>

      <motion.h2 className={`${styles.year} ${styles.yearLeft}`} variants={yearLeft}>
        🚀 {year}
      </motion.h2>

      <motion.h2 className={`${styles.description} ${styles.descriptionRight}`} variants={descriptionRight}>
        {SLOGAN}
      </motion.h2>

      <motion.h2 className={`${styles.year} ${styles.yearRight}`} variants={yearRight}>
        {year} <span style={{ display: "inline-block", transform: "scaleX(-1)", textShadow: "-3px 3px var(--accent-blue)" }}>🚀</span>
      </motion.h2>

      <motion.div className={styles.entity} id="entity" variants={entityVariants}>
        <motion.div className={styles.background} variants={backVariants} />
      </motion.div>
    </motion.div>
  );
}
