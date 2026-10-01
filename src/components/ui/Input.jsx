import styles from "./ui.module.css";

export default function Input({ label, error, id, className = "", ...props }) {
  const inputId = id || props.name;
  return (
    <div className={`field ${className}`}>
      {label ? <label htmlFor={inputId}>{label}</label> : null}
      <input id={inputId} className={styles.control} {...props} />
      {error ? <span className="error">{error}</span> : null}
    </div>
  );
}
