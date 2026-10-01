import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../providers";

export default function ProtectedRoute({ roles, staffOnly = false, parentOnly = false }) {
  const { ready, session } = useAuth();

  if (!ready) {
    return (
      <div className="empty-state" style={{ margin: "2rem" }}>
        Loading workspace…
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (parentOnly && session.role !== "parent") {
    return <Navigate to="/" replace />;
  }

  if (staffOnly && session.role === "parent") {
    return <Navigate to="/parent" replace />;
  }

  if (roles && !roles.includes(session.role)) {
    const fallback = session.role === "parent" ? "/parent" : "/";
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}
