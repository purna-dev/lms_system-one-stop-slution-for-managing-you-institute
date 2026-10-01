import styles from "./ui.module.css";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  className = "",
  ...props
}) {
  return (
    <button
      type={type}
      className={`${styles.btn} ${styles[variant]} ${styles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
