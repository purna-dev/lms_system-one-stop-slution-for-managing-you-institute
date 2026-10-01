import { useState } from "react";
import { Navigate } from "react-router-dom";
import { GraduationCap, LogIn, Moon, Sun } from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useAuth, useTheme } from "../app/providers";

export default function LoginPage() {
  const { session, login, ready } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState("super@lms.demo");
  const [password, setPassword] = useState("super123");
  const [error, setError] = useState("");

  if (ready && session) return <Navigate to="/" replace />;

  function onSubmit(e) {
    e.preventDefault();
    const result = login(email, password);
    if (!result.ok) setError(result.error);
    else setError("");
  }

  return (
    <div className="login-page">
      <div style={{ position: "fixed", top: "1rem", right: "1rem" }}>
        <Button variant="secondary" size="sm" onClick={toggleTheme}>
          {theme === "night" ? <Sun size={16} /> : <Moon size={16} />}
          Theme
        </Button>
      </div>
      <div className="login-card">
        <div className="brand">
          <GraduationCap size={22} />
          Institute LMS
        </div>
        <h1>Sign in</h1>
        <p className="muted" style={{ marginBottom: "1.25rem" }}>
          Modern demo console — data stays in your browser.
        </p>
        <form className="stack" onSubmit={onSubmit}>
          <Input
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error ? (
            <div className="error" style={{ color: "var(--danger)" }}>
              {error}
            </div>
          ) : null}
          <Button type="submit">
            <LogIn size={16} />
            Continue
          </Button>
        </form>
        <div className="demo-creds">
          <div>
            <strong>Super Admin:</strong> super@lms.demo / super123
          </div>
          <div>
            <strong>Admin:</strong> admin@lms.demo / admin123
          </div>
          <div>
            <strong>Teacher:</strong> teacher@lms.demo / teacher123
          </div>
          <div>
            <strong>Parent:</strong> parent@lms.demo / parent123
          </div>
        </div>
      </div>
    </div>
  );
}
