"use client";

import styles from "./segmented.module.css";

export type SegmentedOption<T extends string> = { value: T; label: string; hint?: string };

/** Pill segmented control for 2–4 short choices (dialogs, filters). */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
  disabled = false,
}: {
  value: T;
  onChange: (value: T) => void;
  options: SegmentedOption<T>[];
  ariaLabel?: string;
  disabled?: boolean;
}) {
  return (
    <div className={styles.segmented} role="group" aria-label={ariaLabel}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={styles.option}
          aria-pressed={value === option.value}
          disabled={disabled}
          onClick={() => onChange(option.value)}
        >
          <span>{option.label}</span>
          {option.hint && <small>{option.hint}</small>}
        </button>
      ))}
    </div>
  );
}
