import { useEffect, useMemo, useState } from "react";
import Button from "../components/ui/Button";
import Select from "../components/ui/Select";
import Input from "../components/ui/Input";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import { useAuth, useToast } from "../app/providers";
import { useStorageVersion } from "../hooks/useRepo";
import { listBatches } from "../services/batchService";
import { listStudents } from "../services/studentService";
import {
  getCohortAttendanceRate,
  getMarksForBatchDate,
  getStudentsForBatch,
  listAttendance,
  markBatchAttendance,
} from "../services/attendanceService";
import { formatDisplayDate, todayISO } from "../utils/date";

const STATUSES = ["present", "absent", "late"];

export default function AttendancePage() {
  const version = useStorageVersion();
  const { session } = useAuth();
  const toast = useToast();
  const batches = useMemo(
    () => listBatches().filter((b) => b.status === "active"),
    [version],
  );

  const [batchId, setBatchId] = useState("");
  const [date, setDate] = useState(todayISO());
  const [marks, setMarks] = useState({});
  const [historyBatch, setHistoryBatch] = useState("");
  const [historyFrom, setHistoryFrom] = useState("");
  const [historyTo, setHistoryTo] = useState("");

  useEffect(() => {
    if (!batchId && batches[0]) setBatchId(batches[0].id);
  }, [batches, batchId]);

  const students = useMemo(
    () => (batchId ? getStudentsForBatch(batchId) : []),
    [batchId, version],
  );

  useEffect(() => {
    if (!batchId || !date) return;
    const existing = getMarksForBatchDate(batchId, date);
    const next = {};
    students.forEach((s) => {
      const found = existing.find((m) => m.studentId === s.id);
      next[s.id] = found?.status || "present";
    });
    setMarks(next);
  }, [batchId, date, students, version]);

  const cohortRate = useMemo(
    () => getCohortAttendanceRate({ batchId: batchId || undefined }),
    [batchId, version],
  );

  const history = useMemo(() => {
    return listAttendance({
      batchId: historyBatch || undefined,
      from: historyFrom || undefined,
      to: historyTo || undefined,
    })
      .sort((a, b) => b.date.localeCompare(a.date) || a.studentId.localeCompare(b.studentId))
      .slice(0, 80);
  }, [historyBatch, historyFrom, historyTo, version]);

  const studentMap = useMemo(
    () => Object.fromEntries(listStudents({}).map((s) => [s.id, s.name])),
    [version],
  );

  function setAll(status) {
    const next = {};
    students.forEach((s) => {
      next[s.id] = status;
    });
    setMarks(next);
  }

  function save() {
    if (!batchId || !date) {
      toast("Pick a batch and date");
      return;
    }
    markBatchAttendance({
      batchId,
      date,
      markedBy: session.userId,
      marks: students.map((s) => ({
        studentId: s.id,
        status: marks[s.id] || "present",
      })),
    });
    toast("Attendance saved");
  }

  return (
    <div className="stack">
      <div className="page-header">
        <div>
          <h1>Attendance</h1>
          <p>Mark by date and batch. One record per student per day.</p>
        </div>
        <div className="muted">
          Batch rate: {cohortRate == null ? "—" : `${cohortRate}%`}
        </div>
      </div>

      <Card title="Mark attendance">
        <div className="row" style={{ marginBottom: "1rem" }}>
          <Select
            label="Batch"
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
          >
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </Select>
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <div className="row" style={{ alignSelf: "end" }}>
            <Button size="sm" variant="secondary" onClick={() => setAll("present")}>
              All present
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setAll("absent")}>
              All absent
            </Button>
            <Button onClick={save}>Save marks</Button>
          </div>
        </div>

        {students.length === 0 ? (
          <div className="empty-state">No active students in this batch.</div>
        ) : (
          <div className="table-wrap" style={{ boxShadow: "none" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>
                      <Select
                        value={marks[s.id] || "present"}
                        onChange={(e) =>
                          setMarks((m) => ({ ...m, [s.id]: e.target.value }))
                        }
                      >
                        {STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title="History" subtitle="Latest 80 marks">
        <div className="row" style={{ marginBottom: "1rem" }}>
          <Select
            value={historyBatch}
            onChange={(e) => setHistoryBatch(e.target.value)}
          >
            <option value="">All batches</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </Select>
          <Input
            type="date"
            value={historyFrom}
            onChange={(e) => setHistoryFrom(e.target.value)}
          />
          <Input
            type="date"
            value={historyTo}
            onChange={(e) => setHistoryTo(e.target.value)}
          />
        </div>
        {history.length === 0 ? (
          <div className="empty-state">No attendance in this range.</div>
        ) : (
          <div className="table-wrap" style={{ boxShadow: "none" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Student</th>
                  <th>Batch</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((a) => (
                  <tr key={a.id}>
                    <td>{formatDisplayDate(a.date)}</td>
                    <td>{studentMap[a.studentId] || a.studentId}</td>
                    <td>
                      {batches.find((b) => b.id === a.batchId)?.name || a.batchId}
                    </td>
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
  );
}
