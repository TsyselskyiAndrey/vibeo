import styles from "./FieldError.module.css";

type Props = { error?: string; shake?: boolean; className?: string };

export default function FieldError({ error, shake, className }: Props) {
  return (
    <span role={error ? "alert" : undefined} className={[styles.error, shake && styles.shake, className].filter(Boolean).join(" ")}>
      {error ?? "\u00A0"}
    </span>
  );
}
