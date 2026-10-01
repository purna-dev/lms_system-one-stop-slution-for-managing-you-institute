import { NavLink } from "react-router-dom";
import {
  CalendarCheck2,
  CalendarDays,
  ClipboardList,
  BarChart3,
  GraduationCap,
  LayoutDashboard,
  Megaphone,
  NotebookPen,
  Settings,
  Table2,
  ArrowLeftRight,
  UserCog,
  UserPlus,
  Users,
  WalletCards,
} from "lucide-react";
import { useAuth } from "../providers";
import { roleLabel } from "../../services/authService";
import styles from "./layout.module.css";

const STAFF_LINKS = [
  { to: "/", label: "Dashboard", end: true, icon: LayoutDashboard },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/timetable", label: "Timetable", icon: Table2 },
  { to: "/students", label: "Students", icon: Users },
  { to: "/batches", label: "Batches", icon: GraduationCap },
  { to: "/attendance", label: "Attendance", icon: CalendarCheck2 },
  { to: "/payments", label: "Payments", icon: WalletCards },
  { to: "/exams", label: "Exams", icon: ClipboardList },
  { to: "/assignments", label: "Assignments", icon: NotebookPen },
  { to: "/admissions", label: "Admissions", icon: UserPlus, adminOnly: true },
  { to: "/notices", label: "Notices", icon: Megaphone },
  { to: "/reports", label: "Reports", icon: BarChart3, adminOnly: true },
  {
    to: "/transactions",
    label: "Transactions",
    icon: ArrowLeftRight,
    superAdminOnly: true,
  },
  { to: "/teachers", label: "Teachers", icon: UserCog, superAdminOnly: true },
  { to: "/settings", label: "Settings", icon: Settings, adminOnly: true },
];

const PARENT_LINKS = [
  { to: "/parent", label: "My children", end: true, icon: LayoutDashboard },
  { to: "/notices", label: "Notices", icon: Megaphone },
];

export default function Sidebar({ open, onNavigate }) {
  const { isAdmin, isSuperAdmin, session } = useAuth();
  const isParent = session?.role === "parent";
  const links = isParent ? PARENT_LINKS : STAFF_LINKS;

  return (
    <aside className={`${styles.sidebar} ${open ? styles.open : ""}`}>
      <div className={styles.brandBlock}>
        <div className={styles.brandMark}>
          <GraduationCap size={20} />
        </div>
        <div>
          <div className={styles.brandTitle}>Institute LMS</div>
          <div className={styles.brandSub}>{roleLabel(session?.role)}</div>
        </div>
      </div>
      <nav className={styles.nav}>
        {links
          .filter((l) => {
            if (l.superAdminOnly) return isSuperAdmin;
            if (l.adminOnly) return isAdmin;
            return true;
          })
          .map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.active : ""}`
                }
                onClick={onNavigate}
              >
                <Icon size={18} strokeWidth={2} />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
      </nav>
      <div className={styles.sidebarFoot}>Ctrl+K command palette</div>
    </aside>
  );
}
