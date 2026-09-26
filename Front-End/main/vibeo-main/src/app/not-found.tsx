import Link from "next/link";
import styles from "./not-found.module.css";
import StaticNoise from "@/components/effects/StaticNoise/StaticNoise";

export default function NotFound() {
  return (
    <div className={`${styles.page} preventSelect`}>
      <StaticNoise />
      <div className={styles.scanlines} />
      <div className={styles.sweep} />

      <div className={styles.content}>
        <div className={styles.rec}>
          <span className={styles.recDot} />
          NO SIGNAL
        </div>

        <h1 className={styles.glitch} data-text="404">
          404
        </h1>

        <h2 className={styles.subhead}>FEED LOST</h2>

        <p className={styles.body}>This page went off-air. It may have been moved, renamed, or never recorded.</p>

        <Link href="/" className={styles.cta}>
          Back to the feed
        </Link>
      </div>
    </div>
  );
}
