import styles from "./ui.module.css";

const TONE = {
  active: "toneSuccess",
  inactive: "toneNeutral",
  archived: "toneNeutral",
  present: "toneSuccess",
  absent: "toneDanger",
  late: "toneWarning",
  paid: "toneSuccess",
  pending: "toneWarning",
  overdue: "toneDanger",
  partial: "toneInfo",
  admin: "toneInfo",
  super_admin: "toneSuccess",
  teacher: "toneNeutral",
  parent: "toneInfo",
  info: "toneInfo",
  checked: "toneSuccess",
  submitted: "toneInfo",
  missing: "toneDanger",
};

export default function Badge({ status, children }) {
  const tone = TONE[status] || "toneNeutral";
  return (
    <span className={`${styles.badge} ${styles[tone]}`}>
      {children || status}
    </span>
  );
}
