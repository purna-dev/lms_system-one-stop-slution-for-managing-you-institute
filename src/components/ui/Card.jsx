import styles from "./ui.module.css";

export default function Card({
  title,
  subtitle,
  children,
  actions,
  className = "",
  style,
}) {
  return (
    <section className={`${styles.card} ${className}`} style={style}>
      {(title || actions) && (
        <header className={styles.cardHeader}>
          <div>
            {title ? <h2>{title}</h2> : null}
            {subtitle ? <p className="muted">{subtitle}</p> : null}
          </div>
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}
