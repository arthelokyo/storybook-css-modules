import React from "react";

import styles from "./Button.module.css";

/** Primary UI component for user interaction */
export const Button = ({
  primary = false,
  backgroundColor = null,
  size = "medium",
  label,
  ...props
}) => {
  const mode = primary ? styles.primary : styles.secondary;

  return (
    <button
      type="button"
      className={[styles.button, styles[size] || undefined, mode]
        .filter(Boolean)
        .join(" ")}
      style={backgroundColor ? { backgroundColor } : undefined}
      {...props}
    >
      {label}
    </button>
  );
};
