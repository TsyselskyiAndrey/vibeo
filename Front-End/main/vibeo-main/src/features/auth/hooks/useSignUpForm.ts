"use client";

import { useEffect, useRef, useState, type SubmitEvent } from "react";
import { AuthError, registerStep1, registerStep2, registerStep3, type FieldErrors } from "../api/mockAuth";
import { validate, type Validation } from "../../../lib/validate";

export type SignUpField = "email" | "password" | "repassword" | "firstname" | "lastname" | "birthdate" | "code";

type FieldConfig = {
  name: SignUpField;
  type: "text" | "email" | "password" | "date" | "code";
  label: string;
  title: string;
  autoComplete?: string;
  rules: Validation;
};

const NAME_RULES: Validation = {
  required: true,
  allowSpaces: false,
  allowNums: false,
  allowSymbols: false,
  maxLength: 50,
};

const STEPS: readonly (readonly FieldConfig[])[] = [
  [
    {
      name: "email",
      type: "email",
      label: "Email:",
      title: "email",
      autoComplete: "one-time-code",
      rules: { required: true, email: true, allowSpaces: false },
    },
    {
      name: "password",
      type: "password",
      label: "Password:",
      title: "password",
      autoComplete: "one-time-code",
      rules: {
        required: true,
        requireNums: true,
        requireBothCases: true,
        allowSpaces: false,
        allowSymbols: false,
        minLength: 12,
        maxLength: 100,
      },
    },
    {
      name: "repassword",
      type: "password",
      label: "Re-Password:",
      title: "password",
      autoComplete: "one-time-code",
      rules: { required: true, repassword: true },
    },
  ],
  [
    { name: "firstname", type: "text", label: "First name:", title: "first name", autoComplete: "one-time-code", rules: NAME_RULES },
    { name: "lastname", type: "text", label: "Last name:", title: "last name", autoComplete: "one-time-code", rules: NAME_RULES },
    {
      name: "birthdate",
      type: "date",
      label: "Birth date (MM / DD / YYYY):",
      title: "birth date",
      autoComplete: "one-time-code",
      rules: { required: true, date: true },
    },
  ],
  [{ name: "code", type: "code", label: "Code", title: "code", autoComplete: "one-time-code", rules: { required: true, code: true } }],
];

const INITIAL_VALUES: Record<SignUpField, string> = {
  email: "",
  password: "",
  repassword: "",
  firstname: "",
  lastname: "",
  birthdate: "",
  code: "",
};

type Flags = Partial<Record<SignUpField, boolean>>;

const flagsFor = (names: readonly SignUpField[]): Flags => {
  const flags: Flags = {};
  for (const n of names) flags[n] = true;
  return flags;
};

export function useSignUpForm({ onRegistered, resetDelayMs = 0 }: { onRegistered: () => void; resetDelayMs?: number }) {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState(INITIAL_VALUES);
  const [touched, setTouched] = useState<Flags>({});
  const [serverErrors, setServerErrors] = useState<FieldErrors>({});
  const [shaking, setShaking] = useState<Flags>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const shakeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const resetTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(
    () => () => {
      clearTimeout(shakeTimer.current);
      clearTimeout(resetTimer.current);
    },
    [],
  );

  const config = STEPS[step];
  const stepNames = config.map((f) => f.name);
  const isLastStep = step === STEPS.length - 1;

  const errors: FieldErrors<SignUpField> = {};
  for (const f of config) {
    const message = serverErrors[f.name] ?? validate(values[f.name], f.rules, f.title, f.name === "repassword" ? values.password : "");
    if (message) errors[f.name] = message;
  }

  function shake(names: readonly SignUpField[]) {
    setShaking(flagsFor(names));
    clearTimeout(shakeTimer.current);
    shakeTimer.current = setTimeout(() => setShaking({}), 300);
  }

  function reset() {
    setStep(0);
    setValues(INITIAL_VALUES);
    setTouched({});
    setServerErrors({});
    setShaking({});
    setFormError(null);
  }

  function onChange(name: SignUpField, value: string) {
    setValues((v) => ({ ...v, [name]: value }));
    setTouched((t) => ({ ...t, [name]: true }));
    setServerErrors((s) => ({ ...s, [name]: undefined }));
    setFormError(null);
  }

  function onBack() {
    if (step === 0 || isSubmitting) return;
    setStep((s) => s - 1);
    setServerErrors({});
    setFormError(null);
    setValues((v) => ({ ...v, code: "" }));
  }

  async function onSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSubmitting) return;

    const invalid = stepNames.filter((n) => errors[n]);
    if (invalid.length > 0) {
      setTouched((t) => ({ ...t, ...flagsFor(stepNames) }));
      shake(invalid);
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    try {
      if (step === 0) {
        await registerStep1({ email: values.email, password: values.password });
      } else if (step === 1) {
        await registerStep2({
          email: values.email,
          firstname: values.firstname.trim(),
          lastname: values.lastname.trim(),
          birthdate: values.birthdate.replace(/\s/g, ""),
        });
      } else {
        await registerStep3({ email: values.email, code: values.code });
      }

      setServerErrors({});
      if (isLastStep) {
        onRegistered();
        clearTimeout(resetTimer.current);
        resetTimer.current = setTimeout(reset, resetDelayMs);
      } else {
        setStep((s) => s + 1);
      }
    } catch (err) {
      if (err instanceof AuthError) {
        const failed = Object.keys(err.fieldErrors) as SignUpField[];
        setServerErrors(err.fieldErrors);
        setTouched((t) => ({ ...t, ...flagsFor(failed) }));
        shake(failed);
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    step,
    stepCount: STEPS.length,
    isLastStep,
    email: values.email,
    fields: config.map((f) => ({
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
    onBack,
  };
}

export type SignUpFormState = ReturnType<typeof useSignUpForm>;
