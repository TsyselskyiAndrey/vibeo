"use client";

import { useId, useState, type ChangeEvent } from "react";
import Image from "next/image";
import styles from "./AuthInput.module.css";
import showPassIcon from "@/assets/images/showPass.png";
import hidePassIcon from "@/assets/images/hidePass.png";
import FieldError from "../../../../../components/ui/FieldError/FieldError";

type InputProps = {
  type: "text" | "email" | "password" | "date";
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  shake?: boolean;
  autoComplete?: string;
  className?: string;
};

function formatDate(raw: string) {
  const d = raw.replace(/\D/g, "").slice(0, 8);
  return [d.slice(0, 2), d.slice(2, 4), d.slice(4)].filter(Boolean).join(" / ");
}

function caretAfterDigits(formatted: string, digitCount: number) {
  if (digitCount === 0) return 0;
  let seen = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (/\d/.test(formatted[i]) && ++seen === digitCount) return i + 1;
  }
  return formatted.length;
}

export default function AuthInput({ type, name, label, value, onChange, error, shake, autoComplete, className }: InputProps) {
  const id = useId();
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const isDate = type === "date";
  const htmlType = isDate || (isPassword && showPassword) ? "text" : type;

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (!isDate) {
      onChange(e.target.value);
      return;
    }

    const el = e.target;
    const digitsBeforeCaret = el.value.slice(0, el.selectionStart ?? el.value.length).replace(/\D/g, "").length;
    const formatted = formatDate(el.value);
    const caret = caretAfterDigits(formatted, digitsBeforeCaret);

    onChange(formatted);
    requestAnimationFrame(() => el.setSelectionRange(caret, caret));
  }

  return (
    <label htmlFor={id} className={[styles.field, className].filter(Boolean).join(" ")}>
      <input
        id={id}
        name={name}
        type={htmlType}
        inputMode={isDate ? "numeric" : undefined}
        placeholder=" "
        value={value}
        onChange={handleChange}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        className={[styles.input, isPassword && styles.withToggle].filter(Boolean).join(" ")}
      />
      <span className={styles.label}>{label}</span>

      <FieldError error={error} shake={shake} />

      {isPassword && (
        <button
          type="button"
          className={styles.toggle}
          aria-label={showPassword ? "Hide password" : "Show password"}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setShowPassword((v) => !v)}
        >
          <Image src={showPassword ? showPassIcon : hidePassIcon} alt="" width={27} height={27} />
        </button>
      )}
    </label>
  );
}
