import { useEffect, useMemo, useState } from "react";
import { ClipboardList, Download, Plus } from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Modal from "../components/ui/Modal";
import Card from "../components/ui/Card";
import Kpi from "../components/ui/Kpi";
import { useToast } from "../app/providers";
import { useStorageVersion } from "../hooks/useRepo";
import { listBatches } from "../services/batchService";
import {
  createExam,
  getExamDetail,
  listExams,
  removeExam,
  saveGradebook,
} from "../services/examService";
import { exportExamCsv } from "../services/reportService";
import { formatDisplayDate, todayISO } from "../utils/date";

export default function ExamsPage() {
  const version = useStorageVersion();
  const toast = useToast();
  const exams = useMemo(() => listExams(), [version]);
  const batches = useMemo(() => listBatches(), [version]);
  const [selectedId, setSelectedId] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    batchId: "",
    subject: "",
    date: todayISO(),
    maxMarks: 100,
  });
  const [draftMarks, setDraftMarks] = useState({});

  useEffect(() => {
    if (!selectedId && exams[0]) setSelectedId(exams[0].id);
  }, [exams, selectedId]);

  const detail = useMemo(
    () => (selectedId ? getExamDetail(selectedId) : null),
    [selectedId, version],
  );

  useEffect(() => {
    if (!detail) return;
    const next = {};
    detail.rows.forEach((r) => {
      next[r.studentId] = {
        marks: r.marks ?? "",
        remark: r.remark || "",
      };
    });
    setDraftMarks(next);
  }, [detail?.exam?.id, version]);

  function openCreate() {
    setForm({
      title: "",
      batchId: batches[0]?.id || "",
      subject: batches[0]?.subject || "",
      date: todayISO(),
      maxMarks: 100,
    });
    setCreateOpen(true);
  }

  function saveExam(e) {
    e.preventDefault();
    try {
      const exam = createExam(form);
      setCreateOpen(false);
      setSelectedId(exam.id);
      toast("Exam created");
    } catch (err) {
      toast(err.message);
    }
  }

  function saveMarks() {
    if (!detail) return;
    const rows = detail.rows.map((r) => ({
      studentId: r.studentId,
      marks: draftMarks[r.studentId]?.marks,
      remark: draftMarks[r.studentId]?.remark,
    }));
    saveGradebook(detail.exam.id, rows);
    toast("Gradebook saved");
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Exams & gradebook</h1>
          <p>Create tests, enter marks, and export results.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} /> New exam
        </Button>
      </div>

      <div className="grid-charts">
        <Card title="Exams" subtitle={`${exams.length} total`}>
          <div className="stack" style={{ gap: "0.5rem" }}>
            {exams.map((exam) => (
              <button
                key={exam.id}
                type="button"
                onClick={() => setSelectedId(exam.id)}
                style={{
                  textAlign: "left",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  padding: "0.75rem",
                  background:
                    selectedId === exam.id
                      ? "var(--accent-soft)"
                      : "var(--surface)",
                  cursor: "pointer",
                  color: "var(--text)",
                }}
              >
                <div style={{ fontWeight: 750 }}>{exam.title}</div>
                <div className="muted" style={{ fontSize: "0.85rem" }}>
                  {formatDisplayDate(exam.date)} · max {exam.maxMarks}
                </div>
              </button>
            ))}
          </div>
        </Card>

        <div className="stack">
          {!detail ? (
            <div className="empty-state">Select an exam to grade.</div>
          ) : (
            <>
              <div className="grid-kpi">
                <Kpi
                  icon={ClipboardList}
                  label="Graded"
                  value={`${detail.gradedCount}/${detail.studentCount}`}
                />
                <Kpi
                  label="Average"
                  value={detail.average == null ? "—" : detail.average}
                />
                <Kpi label="Batch" value={detail.batch?.name || "—"} />
              </div>
              <Card
                title={detail.exam.title}
                subtitle={`${detail.exam.subject || "Subject"} · ${formatDisplayDate(detail.exam.date)}`}
                actions={
                  <div className="row">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        exportExamCsv(detail.exam.id);
                        toast("CSV downloaded");
                      }}
                    >
                      <Download size={14} /> CSV
                    </Button>
                    <Button size="sm" onClick={saveMarks}>
                      Save marks
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => {
                        if (!window.confirm("Delete exam?")) return;
                        removeExam(detail.exam.id);
                        setSelectedId("");
                        toast("Exam deleted");
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                }
              >
                <div className="table-wrap" style={{ boxShadow: "none" }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Student</th>
                        <th>Marks</th>
                        <th>%</th>
                        <th>Remark</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.rows.map((r, idx) => (
                        <tr key={r.studentId}>
                          <td>{r.marks == null ? "—" : idx + 1}</td>
                          <td>{r.name}</td>
                          <td>
                            <input
                              className="control"
                              style={{
                                width: 90,
                                padding: "0.45rem 0.55rem",
                                border: "1px solid var(--border)",
                                borderRadius: 8,
                                background: "var(--surface)",
                                color: "var(--text)",
                              }}
                              type="number"
                              min="0"
                              max={detail.exam.maxMarks}
                              value={draftMarks[r.studentId]?.marks ?? ""}
                              onChange={(e) =>
                                setDraftMarks((d) => ({
                                  ...d,
                                  [r.studentId]: {
                                    ...d[r.studentId],
                                    marks: e.target.value,
                                  },
                                }))
                              }
                            />
                          </td>
                          <td>
                            {r.percentage == null ? "—" : `${r.percentage}%`}
                          </td>
                          <td>
                            <input
                              style={{
                                minWidth: 120,
                                padding: "0.45rem 0.55rem",
                                border: "1px solid var(--border)",
                                borderRadius: 8,
                                background: "var(--surface)",
                                color: "var(--text)",
                              }}
                              value={draftMarks[r.studentId]?.remark ?? ""}
                              onChange={(e) =>
                                setDraftMarks((d) => ({
                                  ...d,
                                  [r.studentId]: {
                                    ...d[r.studentId],
                                    remark: e.target.value,
                                  },
                                }))
                              }
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}
        </div>
      </div>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create exam"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="exam-form">
              Create
            </Button>
          </>
        }
      >
        <form id="exam-form" className="form-grid" onSubmit={saveExam}>
          <Input
            className="full"
            label="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <Select
            label="Batch"
            value={form.batchId}
            onChange={(e) => {
              const batch = batches.find((b) => b.id === e.target.value);
              setForm({
                ...form,
                batchId: e.target.value,
                subject: batch?.subject || form.subject,
              });
            }}
          >
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </Select>
          <Input
            label="Subject"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
          />
          <Input
            label="Date"
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
          <Input
            label="Max marks"
            type="number"
            value={form.maxMarks}
            onChange={(e) =>
              setForm({ ...form, maxMarks: Number(e.target.value) })
            }
          />
        </form>
      </Modal>
    </div>
  );
}
