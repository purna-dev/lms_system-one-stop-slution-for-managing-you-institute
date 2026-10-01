import styles from "./ui.module.css";

export default function Kpi({ label, value, hint, icon: Icon }) {
  return (
    <div className={styles.kpi}>
      <div className={styles.kpiTop}>
        <div className={styles.kpiLabel}>{label}</div>
        {Icon ? (
          <span className={styles.kpiIcon}>
            <Icon size={18} />
          </span>
        ) : null}
      </div>
      <div className={styles.kpiValue}>{value}</div>
      {hint ? <div className={styles.kpiHint}>{hint}</div> : null}
    </div>
  );
}
