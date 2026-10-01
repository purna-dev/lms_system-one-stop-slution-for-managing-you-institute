import { LogOut, Menu, Moon, Search, Sun } from "lucide-react";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { useAuth, useTheme } from "../providers";
import { roleLabel } from "../../services/authService";
import styles from "./layout.module.css";

export default function Topbar({ onMenu }) {
  const { session, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className={styles.topbar}>
      <div className={styles.topLeft}>
        <button type="button" className={styles.menuBtn} onClick={onMenu} aria-label="Open menu">
          <Menu size={18} />
        </button>
        <div>
          <div className={styles.greeting}>Welcome, {session?.name}</div>
          <div className="muted" style={{ fontSize: "0.85rem" }}>
            All-in-one institute toolkit · Ctrl+K
          </div>
        </div>
      </div>
      <div className={styles.topRight}>
        <Button
          variant="secondary"
          size="sm"
          onClick={() =>
            window.dispatchEvent(new CustomEvent("lms:open-command"))
          }
          title="Command palette (Ctrl+K)"
        >
          <Search size={16} />
          Search
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title={theme === "night" ? "Switch to light" : "Switch to night"}
        >
          {theme === "night" ? <Sun size={16} /> : <Moon size={16} />}
          {theme === "night" ? "Light" : "Night"}
        </Button>
        <Badge status={session?.role}>{roleLabel(session?.role)}</Badge>
        <Button variant="secondary" size="sm" onClick={logout}>
          <LogOut size={16} />
          Log out
        </Button>
      </div>
    </header>
  );
}
