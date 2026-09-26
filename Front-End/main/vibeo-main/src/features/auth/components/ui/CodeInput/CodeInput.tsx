"use client";

import { useRef, useState, type ChangeEvent, type ClipboardEvent, type KeyboardEvent } from "react";
import FieldError from "../../../../../components/ui/FieldError/FieldError";
import styles from "./CodeInput.module.css";

const LENGTH = 6;

type CodeInputProps = {
  name: string;
  onChange: (value: string) => void;
  error?: string;
  shake?: boolean;
  className?: string;
};

export default function CodeInput({ name, onChange, error, shake, className }: CodeInputProps) {
  const [code, setCode] = useState<string[]>(() => Array(LENGTH).fill(""));
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const focusAt = (i: number) => inputs.current[i]?.focus();

  function commit(next: string[]) {
    setCode(next);
    onChange(next.join(""));
  }

  function handleChange(index: number, e: ChangeEvent<HTMLInputElement>) {
    const digit = e.target.value.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[index] = digit;
    commit(next);
    if (digit && index < LENGTH - 1) focusAt(index + 1);
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && code[index] === "" && index > 0) {
      e.preventDefault();
      focusAt(index - 1);
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      focusAt(index - 1);
    } else if (e.key === "ArrowRight" && index < LENGTH - 1) {
      e.preventDefault();
      focusAt(index + 1);
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LENGTH);
    if (!digits) return;
    commit(Array.from({ length: LENGTH }, (_, i) => digits[i] ?? ""));
    focusAt(Math.min(digits.length, LENGTH - 1));
  }

  return (
    <div className={styles.wrapper}>
      <input type="hidden" name={name} value={code.join("")} readOnly />

      <div className={[styles.container, className].filter(Boolean).join(" ")}>
        {code.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            aria-label={`Digit ${index + 1}`}
            value={digit}
            className={[styles.cell, error && styles.cellError].filter(Boolean).join(" ")}
            onChange={(e) => handleChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
          />
        ))}
      </div>

      <div className={styles.errorSlot}>
        <FieldError error={error} shake={shake} />
      </div>
    </div>
  );
}
