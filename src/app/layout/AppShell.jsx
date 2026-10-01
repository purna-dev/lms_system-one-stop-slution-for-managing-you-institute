import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import CommandPalette from "../../components/CommandPalette";
import styles from "./layout.module.css";

export default function AppShell() {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="app-shell">
      <div
        className={`sidebar-overlay ${navOpen ? "open" : ""}`}
        onClick={() => setNavOpen(false)}
        role="presentation"
      />
      <Sidebar open={navOpen} onNavigate={() => setNavOpen(false)} />
      <div className="app-main">
        <Topbar onMenu={() => setNavOpen((v) => !v)} />
        <main className={`app-content ${styles.content}`}>
          <Outlet />
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
