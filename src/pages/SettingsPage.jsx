import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Database, KeyRound, Moon, Palette, RotateCcw, Sun } from "lucide-react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import { useTheme, useToast } from "../app/providers";
import { useStorageVersion } from "../hooks/useRepo";
import { getStorageInfo, resetDemoData } from "../services/settingsService";
import { THEMES } from "../services/themeService";
import { formatDisplayDateTime } from "../utils/date";

export default function SettingsPage() {
  const version = useStorageVersion();
  const toast = useToast();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const info = useMemo(() => getStorageInfo(), [version]);
  const { meta, keys } = info;

  function doReset() {
    resetDemoData({ keepSession: true });
    setConfirmOpen(false);
    toast("Demo data restored");
    navigate("/");
  }

  return (
    <div className="stack">
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p>Theme, demo credentials, and storage tools.</p>
        </div>
      </div>

      <Card
        title="Appearance"
        subtitle="Modern minimal themes"
        actions={<Palette size={18} color="var(--accent)" />}
      >
        <div className="row">
          {THEMES.map((t) => (
            <Button
              key={t.id}
              variant={theme === t.id ? "primary" : "secondary"}
              onClick={() => {
                setTheme(t.id);
                toast(`${t.label} applied`);
              }}
            >
              {t.id === "night" ? <Moon size={16} /> : <Sun size={16} />}
              {t.label}
            </Button>
          ))}
        </div>
      </Card>

      <Card
        title="Demo logins"
        actions={<KeyRound size={18} color="var(--accent)" />}
      >
        <div className="stack" style={{ gap: "0.5rem" }}>
          <div>
            <strong>Super Admin</strong> — super@lms.demo / super123
          </div>
          <div>
            <strong>Admin</strong> — admin@lms.demo / admin123
          </div>
          <div>
            <strong>Teacher</strong> — teacher@lms.demo / teacher123
          </div>
          <div>
            <strong>Parent</strong> — parent@lms.demo / parent123
          </div>
          <div className="muted">
            Passwords are stored in localStorage for this showcase only. Teacher
            enrollment is Super Admin only. Demo term runs from 1 July with
            realistic attendance, fees, exams, and homework.
          </div>
        </div>
      </Card>

      <Card
        title="Storage"
        subtitle={
          meta
            ? `Schema v${meta.version} · seeded ${formatDisplayDateTime(meta.seededAt)}`
            : "No meta"
        }
        actions={
          <Button variant="danger" onClick={() => setConfirmOpen(true)}>
            <RotateCcw size={16} />
            Reset demo data
          </Button>
        }
      >
        <div className="row" style={{ marginBottom: "0.75rem" }}>
          <Database size={16} color="var(--muted)" />
          <span className="muted">Active localStorage keys</span>
        </div>
        <ul style={{ margin: 0, paddingLeft: "1.1rem" }}>
          {keys.map((k) => (
            <li key={k} style={{ marginBottom: "0.25rem" }}>
              <code>{k}</code>
            </li>
          ))}
        </ul>
      </Card>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Reset demo data?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={doReset}>
              Yes, restore seed
            </Button>
          </>
        }
      >
        <p>
          This overwrites all <code>lms.*</code> keys with fresh demo students,
          attendance, and payments. Your current session stays signed in if still
          valid.
        </p>
      </Modal>
    </div>
  );
}
