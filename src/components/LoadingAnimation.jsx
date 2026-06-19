'use client';

import styles from '@/app/LoadingAnimation.module.css';

/**
 * LoadingAnimation
 *
 * Brand loading animation for soap / oil / shampoo products.
 * Three minimal line icons float independently with a soft fade.
 *
 * Usage:
 *   <LoadingAnimation />                      // inline, default
 *   <LoadingAnimation variant="fullpage" />    // covers viewport, fixed
 *   <LoadingAnimation variant="inline" label="Loading products..." />
 *   <LoadingAnimation showLabel={false} />     // icons only, no text
 */
export default function LoadingAnimation({
  variant = 'inline',
  label = 'Loading',
  showLabel = true,
}) {
  const isFullpage = variant === 'fullpage';

  return (
    <div
      className={isFullpage ? styles.fullpageWrap : styles.inlineWrap}
      role="status"
      aria-live="polite"
    >
      <div className={styles.stage}>
        <div className={`${styles.iconSlot} ${styles.slotSoap}`}>
          <SoapIcon className={styles.icon} />
        </div>
        <div className={`${styles.iconSlot} ${styles.slotOil}`}>
          <OilIcon className={styles.icon} />
        </div>
        <div className={`${styles.iconSlot} ${styles.slotShampoo}`}>
          <ShampooIcon className={styles.icon} />
        </div>
      </div>

      {showLabel && (
        <p className={styles.label}>
          {label}
          <span className={styles.dots} aria-hidden="true">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        </p>
      )}

      <span className={styles.srOnly}>{label}, please wait</span>
    </div>
  );
}

/* ---------- Icons ---------- */
/* Shared stroke style: rounded line icons, 1.5px stroke, no fill except
   subtle accents, so all three read as one icon family. */

function SoapIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="7"
        y="17"
        width="34"
        height="22"
        rx="9"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M14 25c2.5-2 5-2 7 0s4.5 2 7 0 5-2 7 0"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M18 10c0-1.5 1-3 3-3s3 2 3 3-1 2-1 3.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function OilIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M21 6h6v6.5l3.5 3.5c1 1 1.5 2.3 1.5 3.7V37a4 4 0 0 1-4 4H20a4 4 0 0 1-4-4V19.7c0-1.4.5-2.7 1.5-3.7L21 12.5V6Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <rect x="20" y="3" width="8" height="3.4" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M17.5 26c2 1.4 4 1.4 6 0s4-1.4 6 0"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <circle cx="24" cy="32" r="1.4" fill="currentColor" />
    </svg>
  );
}

function ShampooIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M19 16h10v3.6c2 1 3 2.8 3 5.4v12a4 4 0 0 1-4 4h-8a4 4 0 0 1-4-4v-12c0-2.6 1-4.4 3-5.4V16Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <rect x="20.5" y="9" width="7" height="4" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M22 6.5c0-1.2.9-1.5.9-2.3 0-.6-.4-1-.4-1"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M18.5 28h11"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M18.5 32.5h11"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}
