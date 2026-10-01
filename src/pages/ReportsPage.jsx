import { useMemo } from "react";
import { Download, FileSpreadsheet } from "lucide-react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Kpi from "../components/ui/Kpi";
import { useToast } from "../app/providers";
import { useStorageVersion } from "../hooks/useRepo";
import {
  buildAttendanceReport,
  buildBatchHealthReport,
  buildTeacherLoadReport,
  exportAttendanceCsv,
  exportBatchHealthCsv,
  exportFeesCsv,
  exportTeacherLoadCsv,
  getReportsSummary,
} from "../services/reportService";
import { listAuditLogs } from "../services/auditService";
import { formatINR } from "../utils/money";
import { formatDisplayDateTime } from "../utils/date";

export default function ReportsPage() {
  const version = useStorageVersion();
  const toast = useToast();
  const summary = useMemo(() => getReportsSummary(), [version]);
  const attendance = useMemo(() => buildAttendanceReport().slice(0, 8), [version]);
  const teachers = useMemo(() => buildTeacherLoadReport(), [version]);
  const batches = useMemo(() => buildBatchHealthReport(), [version]);
  const audit = useMemo(() => listAuditLogs(12), [version]);

  function run(fn, label) {
    fn();
    toast(`${label} downloaded`);
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Reports studio</h1>
          <p>Operational exports and live snapshots for the institute.</p>
        </div>
      </div>

      <div className="grid-kpi">
        <Kpi label="Students" value={summary.students} />
        <Kpi label="Exams" value={summary.exams} />
        <Kpi label="Assignments" value={summary.assignments} />
        <Kpi label="Outstanding" value={formatINR(summary.outstanding)} />
      </div>

      <div className="grid-charts" style={{ marginBottom: "1rem" }}>
        <Card
          title="Export center"
          subtitle="CSV downloads for Excel / Sheets"
          actions={<FileSpreadsheet size={18} color="var(--accent)" />}
        >
          <div className="stack">
            <Button
              variant="secondary"
              onClick={() => run(exportAttendanceCsv, "Attendance CSV")}
            >
              <Download size={16} /> Attendance report
            </Button>
            <Button
              variant="secondary"
              onClick={() => run(exportFeesCsv, "Fees CSV")}
            >
              <Download size={16} /> Fees / receipts
            </Button>
            <Button
              variant="secondary"
              onClick={() => run(exportTeacherLoadCsv, "Teacher load CSV")}
            >
              <Download size={16} /> Teacher load
            </Button>
            <Button
              variant="secondary"
              onClick={() => run(exportBatchHealthCsv, "Batch health CSV")}
            >
              <Download size={16} /> Batch health
            </Button>
          </div>
        </Card>

        <Card title="Teacher load snapshot">
          <div className="table-wrap" style={{ boxShadow: "none" }}>
            <table className="data-table" style={{ minWidth: 360 }}>
              <thead>
                <tr>
                  <th>Teacher</th>
                  <th>Batches</th>
                  <th>Students</th>
                  <th>Att %</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((t) => (
                  <tr key={t.teacher}>
                    <td>{t.teacher}</td>
                    <td>{t.batches}</td>
                    <td>{t.students}</td>
                    <td>{t.attendanceRate ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="grid-charts">
        <Card title="Batch health">
          <div className="table-wrap" style={{ boxShadow: "none" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Batch</th>
                  <th>Students</th>
                  <th>Att %</th>
                  <th>Dues</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((b) => (
                  <tr key={b.batch}>
                    <td>{b.batch}</td>
                    <td>{b.students}</td>
                    <td>{b.attendanceRate ?? "—"}</td>
                    <td>{formatINR(b.outstanding)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Attendance sample" subtitle="First 8 students">
          <div className="table-wrap" style={{ boxShadow: "none" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Batch</th>
                  <th>%</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((r) => (
                  <tr key={r.name + r.batch}>
                    <td>{r.name}</td>
                    <td>{r.batch}</td>
                    <td>{r.rate ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Card title="Audit log" subtitle="Recent staff actions" style={{ marginTop: "1rem" }}>
        <div className="table-wrap" style={{ boxShadow: "none", marginTop: "0.5rem" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {audit.map((a) => (
                <tr key={a.id}>
                  <td>{formatDisplayDateTime(a.at)}</td>
                  <td>{a.actorName}</td>
                  <td>{a.action}</td>
                  <td>{a.entity}</td>
                  <td>{a.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
