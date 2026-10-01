import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./layout/AppShell";
import ProtectedRoute from "./layout/ProtectedRoute";
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import CalendarPage from "../pages/CalendarPage";
import TimetablePage from "../pages/TimetablePage";
import StudentsPage from "../pages/StudentsPage";
import StudentDetailPage from "../pages/StudentDetailPage";
import BatchesPage from "../pages/BatchesPage";
import AttendancePage from "../pages/AttendancePage";
import PaymentsPage from "../pages/PaymentsPage";
import ExamsPage from "../pages/ExamsPage";
import AssignmentsPage from "../pages/AssignmentsPage";
import AdmissionsPage from "../pages/AdmissionsPage";
import NoticesPage from "../pages/NoticesPage";
import ReportsPage from "../pages/ReportsPage";
import TeachersPage from "../pages/TeachersPage";
import TransactionsPage from "../pages/TransactionsPage";
import SettingsPage from "../pages/SettingsPage";
import ParentPortalPage from "../pages/ParentPortalPage";
import { useAuth } from "./providers";

function HomeRedirect() {
  const { session } = useAuth();
  if (session?.role === "parent") return <Navigate to="/parent" replace />;
  return <DashboardPage />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route index element={<HomeRedirect />} />

            <Route element={<ProtectedRoute parentOnly />}>
              <Route path="parent" element={<ParentPortalPage />} />
            </Route>

            <Route element={<ProtectedRoute staffOnly />}>
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="timetable" element={<TimetablePage />} />
              <Route path="students" element={<StudentsPage />} />
              <Route path="students/:id" element={<StudentDetailPage />} />
              <Route path="batches" element={<BatchesPage />} />
              <Route path="attendance" element={<AttendancePage />} />
              <Route path="payments" element={<PaymentsPage />} />
              <Route path="exams" element={<ExamsPage />} />
              <Route path="assignments" element={<AssignmentsPage />} />
            </Route>

            {/* Notices: staff + parents */}
            <Route path="notices" element={<NoticesPage />} />

            <Route
              element={
                <ProtectedRoute roles={["admin", "super_admin"]} staffOnly />
              }
            >
              <Route path="admissions" element={<AdmissionsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            <Route element={<ProtectedRoute roles={["super_admin"]} staffOnly />}>
              <Route path="transactions" element={<TransactionsPage />} />
              <Route path="teachers" element={<TeachersPage />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
