import { useMemo } from "react";
import { GraduationCap, Wallet } from "lucide-react";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Kpi from "../components/ui/Kpi";
import { useAuth } from "../app/providers";
import { useStorageVersion } from "../hooks/useRepo";
import { getParentDashboard } from "../services/parentService";
import { formatDisplayDate } from "../utils/date";
import { formatINR } from "../utils/money";

export default function ParentPortalPage() {
  const { session } = useAuth();
  const version = useStorageVersion();
  const data = useMemo(
    () => getParentDashboard(session.userId),
    [session.userId, version],
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Parent portal</h1>
          <p>Attendance, fees, exams, homework, and today’s timetable.</p>
        </div>
      </div>

      {data.announcements.length ? (
        <Card title="Notices for parents" style={{ marginBottom: "1rem" }}>
          <div className="stack" style={{ gap: "0.65rem" }}>
            {data.announcements.map((a) => (
              <div key={a.id}>
                <strong>{a.title}</strong>
                <div className="muted">{a.body}</div>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      <div className="stack">
        {data.students.length === 0 ? (
          <div className="empty-state">No linked students on this parent account.</div>
        ) : (
          data.students.map((card) => (
            <Card
              key={card.student.id}
              title={card.student.name}
              subtitle={`Joined ${formatDisplayDate(card.student.joinDate)}`}
            >
              <div className="grid-kpi">
                <Kpi
                  icon={GraduationCap}
                  label="Attendance"
                  value={
                    card.attendanceRate == null
                      ? "—"
                      : `${card.attendanceRate}%`
                  }
                />
                <Kpi
                  icon={Wallet}
                  label="Outstanding"
                  value={formatINR(card.payment.outstanding)}
                />
                <Kpi label="Paid total" value={formatINR(card.payment.paidTotal)} />
              </div>

              <div className="grid-charts">
                <div>
                  <h3 style={{ marginBottom: "0.5rem" }}>Recent exams</h3>
                  {card.exams.length === 0 ? (
                    <div className="muted">No marks yet.</div>
                  ) : (
                    card.exams.map((e) => (
                      <div key={e.id} className="row" style={{ marginBottom: 6 }}>
                        <span>{e.examTitle}</span>
                        <Badge status="active">
                          {e.marks}/{e.maxMarks} ({e.percentage}%)
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
                <div>
                  <h3 style={{ marginBottom: "0.5rem" }}>Assignments</h3>
                  {card.assignments.length === 0 ? (
                    <div className="muted">No assignments.</div>
                  ) : (
                    card.assignments.map((a) => (
                      <div key={a.id} className="row" style={{ marginBottom: 6 }}>
                        <span>
                          {a.title} · due {formatDisplayDate(a.dueDate)}
                        </span>
                        <Badge status={a.status === "checked" ? "active" : "pending"}>
                          {a.status}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <Card title="Today’s classes" style={{ marginTop: "1rem" }}>
        {data.timetable.length === 0 ? (
          <div className="muted">No classes today.</div>
        ) : (
          <div className="stack" style={{ gap: "0.45rem" }}>
            {data.timetable.map((c) => (
              <div key={c.id} className="row">
                <strong>
                  {c.startLabel}–{c.endLabel}
                </strong>
                <span>{c.batchName}</span>
                <span className="muted">{c.teacherName}</span>
                <Badge status={c.liveState === "live" ? "active" : "pending"}>
                  {c.liveState}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
