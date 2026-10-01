import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { useAuth } from "../app/providers";
import { listStudents } from "../services/studentService";
import styles from "./CommandPalette.module.css";

const STAFF_ROUTES = [
  { label: "Dashboard", to: "/", keywords: "home kpi" },
  { label: "Calendar", to: "/calendar", keywords: "live class" },
  { label: "Timetable builder", to: "/timetable", keywords: "schedule conflict" },
  { label: "Students", to: "/students", keywords: "enroll" },
  { label: "Batches", to: "/batches", keywords: "course" },
  { label: "Attendance", to: "/attendance", keywords: "mark present" },
  { label: "Payments", to: "/payments", keywords: "fee checkout" },
  { label: "Exams", to: "/exams", keywords: "marks gradebook" },
  { label: "Assignments", to: "/assignments", keywords: "homework" },
  { label: "Admissions", to: "/admissions", keywords: "leads inquiry" },
  { label: "Notices", to: "/notices", keywords: "announcement" },
  { label: "Reports", to: "/reports", keywords: "export csv audit" },
  {
    label: "Transactions",
    to: "/transactions",
    keywords: "ledger fee txn payment",
    superAdmin: true,
  },
  { label: "Teachers", to: "/teachers", keywords: "staff", superAdmin: true },
  { label: "Settings", to: "/settings", keywords: "reset theme", admin: true },
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { isAdmin, isSuperAdmin, session } = useAuth();
  const isParent = session?.role === "parent";

  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    }
    function onOpen() {
      setOpen(true);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("lms:open-command", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("lms:open-command", onOpen);
    };
  }, []);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (isParent) {
      const parentRoutes = [
        { label: "Parent portal", to: "/parent", keywords: "home" },
        { label: "Notices", to: "/notices", keywords: "announcement" },
      ];
      return parentRoutes.filter(
        (r) =>
          !q ||
          r.label.toLowerCase().includes(q) ||
          r.keywords.includes(q),
      );
    }

    const routes = STAFF_ROUTES.filter((r) => {
      if (r.superAdmin && !isSuperAdmin) return false;
      if (r.admin && !isAdmin) return false;
      return true;
    }).map((r) => ({ ...r, kind: "Go to" }));

    const students = listStudents({})
      .slice(0, 40)
      .map((s) => ({
        label: s.name,
        to: `/students/${s.id}`,
        keywords: `${s.phone} ${s.email}`,
        kind: "Student",
      }));

    return [...routes, ...students].filter(
      (r) =>
        !q ||
        r.label.toLowerCase().includes(q) ||
        r.keywords.toLowerCase().includes(q),
    ).slice(0, 20);
  }, [query, isAdmin, isSuperAdmin, isParent]);

  if (!open) return null;

  return (
    <div className={styles.backdrop} onClick={() => setOpen(false)} role="presentation">
      <div
        className={styles.panel}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Command palette"
      >
        <div className={styles.searchRow}>
          <Search size={18} />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Jump to page or student… (Ctrl+K)"
          />
        </div>
        <div className={styles.list}>
          {items.length === 0 ? (
            <div className={styles.empty}>No matches</div>
          ) : (
            items.map((item) => (
              <button
                key={`${item.kind}-${item.to}-${item.label}`}
                type="button"
                className={styles.item}
                onClick={() => {
                  navigate(item.to);
                  setOpen(false);
                  setQuery("");
                }}
              >
                <span className={styles.kind}>{item.kind || "Go to"}</span>
                <span>{item.label}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
