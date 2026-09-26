"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import styles from "./page.module.css";
import AuthDesktop from "../../../features/auth/components/AuthDesktop/AuthDesktop";
import AuthMobile from "../../../features/auth/components/AuthMobile/AuthMobile";
import type { AuthProps, Mode } from "../../../features/auth/types";
import { useLogInForm } from "@/features/auth/hooks/useLogInForm";
import { useSignUpForm } from "@/features/auth/hooks/useSignUpForm";

const SMALL_QUERY = "(max-width: 1300px), (max-height: 600px), (max-aspect-ratio: 13/9)";

function AuthInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const mode: Mode = searchParams.get("mode") === "signUp" ? "signUp" : "signIn";
  const isSmall = useMediaQuery(SMALL_QUERY);

  const setMode = (value: Mode, options?: { replace?: boolean }) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("mode", value);
    const url = `${pathname}?${params.toString()}`;
    if (options?.replace) {
      router.replace(url, { scroll: false });
    } else {
      router.push(url, { scroll: false });
    }
  };

  const logIn = useLogInForm();
  const signUp = useSignUpForm({ onRegistered: () => setMode("signIn", { replace: true }), resetDelayMs: isSmall ? 0 : 2500 });
  const isBusy = logIn.isSubmitting || signUp.isSubmitting;

  const props: AuthProps = {
    mode,
    onToggle: () => setMode(mode === "signUp" ? "signIn" : "signUp"),
    isBusy,
    logIn,
    signUp,
  };

  return <div className={styles.window}>{isSmall === null ? null : isSmall ? <AuthMobile {...props} /> : <AuthDesktop {...props} />}</div>;
}

export default function Auth() {
  return (
    <Suspense fallback={null}>
      <AuthInner />
    </Suspense>
  );
}
