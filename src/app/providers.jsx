import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CheckCircle2 } from "lucide-react";
import { bootstrapStorage } from "../services/bootstrapService";
import * as authService from "../services/authService";
import {
  applyTheme,
  getTheme,
  setTheme as persistTheme,
  toggleTheme as flipTheme,
} from "../services/themeService";
import { subscribe } from "../repositories/storage";

const AuthContext = createContext(null);
const ToastContext = createContext(null);
const ThemeContext = createContext(null);

export function AppProviders({ children }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState(null);
  const [toast, setToast] = useState(null);
  const [theme, setThemeState] = useState(() => getTheme());

  useEffect(() => {
    bootstrapStorage();
    applyTheme(getTheme());
    setThemeState(getTheme());
    setSession(authService.getSession());
    setReady(true);
    return subscribe(() => {
      setSession(authService.getSession());
    });
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = useCallback((message) => {
    setToast(message);
  }, []);

  const login = useCallback((email, password) => {
    const result = authService.login(email, password);
    if (result.ok) setSession(result.session);
    return result;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setSession(null);
  }, []);

  const setTheme = useCallback((id) => {
    const next = persistTheme(id);
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    const next = flipTheme();
    setThemeState(next);
    return next;
  }, []);

  const authValue = useMemo(
    () => ({
      ready,
      session,
      login,
      logout,
      isSuperAdmin: session?.role === "super_admin",
      isAdmin:
        session?.role === "admin" || session?.role === "super_admin",
    }),
    [ready, session, login, logout],
  );

  const themeValue = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={themeValue}>
      <AuthContext.Provider value={authValue}>
        <ToastContext.Provider value={showToast}>
          {children}
          {toast ? (
            <div className="toast">
              <CheckCircle2 size={16} />
              {toast}
            </div>
          ) : null}
        </ToastContext.Provider>
      </AuthContext.Provider>
    </ThemeContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AppProviders");
  return ctx;
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within AppProviders");
  return ctx;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within AppProviders");
  return ctx;
}
