"use client";

import { useEffect, useRef, useState, type SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import { AuthError, loginWithGoogle, loginWithPassword, type FieldErrors, type LoginField, type User } from "../api/mockAuth";
import { validate, type Validation } from "../../../lib/validate";

type FieldConfig = {
  name: LoginField;
  type: "email" | "password";
  label: string;
  autoComplete: string;
  rules: Validation;
};

const FIELDS: readonly FieldConfig[] = [
  { name: "email", type: "email", label: "Email:", autoComplete: "one-time-code", rules: { required: true, email: true } },
  { name: "password", type: "password", label: "Password:", autoComplete: "one-time-code", rules: { required: true } },
];

type Flags = Partial<Record<LoginField, boolean>>;

const flagsFor = (names: readonly LoginField[]): Flags => {
  const flags: Flags = {};
  for (const n of names) flags[n] = true;
  return flags;
};

export function useLogInForm() {
  const router = useRouter();
  const [values, setValues] = useState<Record<LoginField, string>>({ email: "", password: "" });
  const [touched, setTouched] = useState<Flags>({});
  const [serverErrors, setServerErrors] = useState<FieldErrors>({});
  const [shaking, setShaking] = useState<Flags>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const shakeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(shakeTimer.current), []);

  const errors: FieldErrors = {};
  for (const f of FIELDS) {
    const message = serverErrors[f.name] ?? validate(values[f.name], f.rules, f.name);
    if (message) errors[f.name] = message;
  }

  function shake(names: readonly LoginField[]) {
    setShaking(flagsFor(names));
    clearTimeout(shakeTimer.current);
    shakeTimer.current = setTimeout(() => setShaking({}), 300);
  }

  function onChange(name: LoginField, value: string) {
    setValues((v) => ({ ...v, [name]: value }));
    setTouched((t) => ({ ...t, [name]: true }));
    setServerErrors({});
    setFormError(null);
  }

  async function submitWith(request: () => Promise<User>) {
    setIsSubmitting(true);
    setFormError(null);
    try {
      await request();
      // TODO: положить пользователя в auth-стор (раньше был setAuth)
      router.push("/");
    } catch (err) {
      if (err instanceof AuthError) {
        setServerErrors(err.fieldErrors);
        setTouched(flagsFor(FIELDS.map((f) => f.name)));
        shake(Object.keys(err.fieldErrors) as LoginField[]);
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSubmitting) return;

    const invalid = FIELDS.map((f) => f.name).filter((n) => errors[n]);
    if (invalid.length > 0) {
      setTouched(flagsFor(FIELDS.map((f) => f.name)));
      shake(invalid);
      return;
    }
    await submitWith(() => loginWithPassword(values));
  }

  return {
    fields: FIELDS.map((f) => ({
      name: f.name,
      type: f.type,
      label: f.label,
      autoComplete: f.autoComplete,
      value: values[f.name],
      error: touched[f.name] ? errors[f.name] : undefined,
      shake: !!shaking[f.name],
    })),
    formError,
    isSubmitting,
    onChange,
    onSubmit,
    onGoogle: () => submitWith(loginWithGoogle),
  };
}

export type LogInFormState = ReturnType<typeof useLogInForm>;
