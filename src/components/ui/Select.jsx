import styles from "./ui.module.css";

export default function Select({
  label,
  error,
  id,
  children,
  className = "",
  ...props
}) {
  const inputId = id || props.name;
  return (
    <div className={`field ${className}`}>
      {label ? <label htmlFor={inputId}>{label}</label> : null}
      <select id={inputId} className={styles.control} {...props}>
        {children}
      </select>
      {error ? <span className="error">{error}</span> : null}
    </div>
  );
}
