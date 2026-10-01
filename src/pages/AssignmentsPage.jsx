import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import Card from "../components/ui/Card";
import { useAuth, useToast } from "../app/providers";
import { useStorageVersion } from "../hooks/useRepo";
import { listBatches } from "../services/batchService";
import {
  createAssignment,
  enrichAssignment,
  getAssignmentBoard,
  listAssignments,
  removeAssignment,
  setSubmissionStatus,
} from "../services/assignmentService";
import { formatDisplayDate, todayISO } from "../utils/date";

export default function AssignmentsPage() {
  const version = useStorageVersion();
  const toast = useToast();
  const { session } = useAuth();
  const batches = useMemo(() => listBatches(), [version]);
  const assignments = useMemo(
    () => listAssignments().map(enrichAssignment),
    [version],
  );
  const [selectedId, setSelectedId] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    batchId: "",
    description: "",
    dueDate: todayISO(),
  });

  useEffect(() => {
    if (!selectedId && assignments[0]) setSelectedId(assignments[0].id);
  }, [assignments, selectedId]);

  const board = useMemo(
    () => (selectedId ? getAssignmentBoard(selectedId) : null),
    [selectedId, version],
  );

  function save(e) {
    e.preventDefault();
    try {
      const item = createAssignment({
        ...form,
        teacherId: session.userId,
      });
      setOpen(false);
      setSelectedId(item.id);
      toast("Assignment created");
    } catch (err) {
      toast(err.message);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Assignments</h1>
          <p>Homework board with submitted / checked / missing status.</p>
        </div>
        <Button
          onClick={() => {
            setForm({
              title: "",
              batchId: batches[0]?.id || "",
              description: "",
              dueDate: todayISO(),
            });
            setOpen(true);
          }}
        >
          <Plus size={16} /> New assignment
        </Button>
      </div>

      <div className="grid-charts">
        <Card title="All assignments">
          <div className="stack" style={{ gap: "0.5rem" }}>
            {assignments.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setSelectedId(a.id)}
                style={{
                  textAlign: "left",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  padding: "0.75rem",
                  background:
                    selectedId === a.id ? "var(--accent-soft)" : "var(--surface)",
                  cursor: "pointer",
                  color: "var(--text)",
                }}
              >
                <div style={{ fontWeight: 750 }}>{a.title}</div>
                <div className="muted" style={{ fontSize: "0.85rem" }}>
                  {a.batchName} · due {formatDisplayDate(a.dueDate)}
                </div>
                <div className="row" style={{ marginTop: 6 }}>
                  <Badge status="pending">{a.counts.pending || 0} pending</Badge>
                  <Badge status="paid">{a.counts.submitted || 0} submitted</Badge>
                  <Badge status="active">{a.counts.checked || 0} checked</Badge>
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card
          title={board?.assignment.title || "Board"}
          subtitle={board ? `Due ${formatDisplayDate(board.assignment.dueDate)}` : ""}
          actions={
            board ? (
              <Button
                size="sm"
                variant="danger"
                onClick={() => {
                  if (!window.confirm("Delete assignment?")) return;
                  removeAssignment(board.assignment.id);
                  setSelectedId("");
                  toast("Deleted");
                }}
              >
                Delete
              </Button>
            ) : null
          }
        >
          {!board ? (
            <div className="empty-state">Select an assignment.</div>
          ) : (
            <div className="table-wrap" style={{ boxShadow: "none" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Status</th>
                    <th>Update</th>
                  </tr>
                </thead>
                <tbody>
                  {board.rows.map((r) => (
                    <tr key={r.studentId}>
                      <td>{r.name}</td>
                      <td>
                        <Badge status={r.status === "checked" ? "active" : r.status === "missing" ? "overdue" : r.status === "submitted" ? "paid" : "pending"}>
                          {r.status}
                        </Badge>
                      </td>
                      <td>
                        <Select
                          value={r.status === "missing" ? "pending" : r.status}
                          onChange={(e) => {
                            setSubmissionStatus({
                              assignmentId: board.assignment.id,
                              studentId: r.studentId,
                              status: e.target.value,
                            });
                            toast("Updated");
                          }}
                        >
                          <option value="pending">Pending</option>
                          <option value="submitted">Submitted</option>
                          <option value="checked">Checked</option>
                          <option value="missing">Missing</option>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New assignment"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="asg-form">
              Create
            </Button>
          </>
        }
      >
        <form id="asg-form" className="form-grid" onSubmit={save}>
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
            onChange={(e) => setForm({ ...form, batchId: e.target.value })}
          >
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </Select>
          <Input
            label="Due date"
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          />
          <Input
            className="full"
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </form>
      </Modal>
    </div>
  );
}
