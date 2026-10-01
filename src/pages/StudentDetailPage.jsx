import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import Kpi from "../components/ui/Kpi";
import { useStorageVersion } from "../hooks/useRepo";
import { getStudentDetail } from "../services/studentService";
import { formatDisplayDate } from "../utils/date";
import { formatINR } from "../utils/money";

export default function StudentDetailPage() {
  const { id } = useParams();
  const version = useStorageVersion();
  const detail = useMemo(() => getStudentDetail(id), [id, version]);

  if (!detail) {
    return (
      <div className="empty-state">
        Student not found. <Link to="/students">Back to list</Link>
      </div>
    );
  }

  const { student, batch, attendanceRate, paymentSummary, recentAttendance, recentPayments } =
    detail;

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="muted">
            <Link to="/students" style={{ color: "var(--accent)" }}>
              ← Students
            </Link>
          </p>
          <h1 style={{ marginTop: "0.35rem" }}>{student.name}</h1>
          <p>
            {batch?.name || "No batch"} · {student.email || "No email"}
          </p>
        </div>
        <Badge status={student.status}>{student.status}</Badge>
      </div>

      <div className="grid-kpi">
        <Kpi
          label="Attendance rate"
          value={attendanceRate == null ? "—" : `${attendanceRate}%`}
        />
        <Kpi label="Paid total" value={formatINR(paymentSummary.paidTotal)} />
        <Kpi label="Outstanding" value={formatINR(paymentSummary.outstanding)} />
        <Kpi label="Overdue items" value={paymentSummary.overdue} />
      </div>

      <div className="grid-charts" style={{ marginBottom: "1rem" }}>
        <Card title="Profile">
          <div className="stack" style={{ gap: "0.45rem", fontSize: "0.95rem" }}>
            <div>
              <span className="muted">Phone:</span> {student.phone || "—"}
            </div>
            <div>
              <span className="muted">Guardian:</span> {student.guardianName || "—"}
            </div>
            <div>
              <span className="muted">Joined:</span> {formatDisplayDate(student.joinDate)}
            </div>
            <div>
              <span className="muted">Notes:</span> {student.notes || "—"}
            </div>
          </div>
        </Card>
        <Card title="Recent attendance">
          {recentAttendance.length === 0 ? (
            <div className="muted">No marks yet.</div>
          ) : (
            <div className="table-wrap" style={{ boxShadow: "none" }}>
              <table className="data-table" style={{ minWidth: 280 }}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAttendance.map((a) => (
                    <tr key={a.id}>
                      <td>{formatDisplayDate(a.date)}</td>
                      <td>
                        <Badge status={a.status}>{a.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <Card title="Recent payments">
        {recentPayments.length === 0 ? (
          <div className="muted">No payments yet.</div>
        ) : (
          <div className="table-wrap" style={{ boxShadow: "none", border: "none" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Due</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((p) => (
                  <tr key={p.id}>
                    <td>{formatDisplayDate(p.dueDate)}</td>
                    <td>{formatINR(p.amount)}</td>
                    <td>
                      <Badge status={p.status}>{p.status}</Badge>
                    </td>
                    <td>{p.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
