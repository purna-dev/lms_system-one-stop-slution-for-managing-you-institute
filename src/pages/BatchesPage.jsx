import { useMemo, useState } from "react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import { useAuth, useToast } from "../app/providers";
import { useStorageVersion } from "../hooks/useRepo";
import {
  archiveBatch,
  createBatch,
  listBatches,
  removeBatch,
  studentCountByBatch,
  updateBatch,
} from "../services/batchService";
import { listTeachers } from "../services/teacherService";
import { formatINR } from "../utils/money";

const empty = {
  name: "",
  subject: "",
  schedule: "",
  feeAmount: 3000,
  teacherId: "",
  status: "active",
};

export default function BatchesPage() {
  const version = useStorageVersion();
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");

  const batches = useMemo(() => listBatches(), [version]);
  const teachers = useMemo(() => listTeachers(), [version]);
  const teacherMap = useMemo(
    () => Object.fromEntries(teachers.map((t) => [t.id, t.name])),
    [teachers],
  );
  const counts = useMemo(() => {
    const map = Object.fromEntries(
      studentCountByBatch().map((r) => [r.batchId, r.count]),
    );
    return map;
  }, [version]);

  function openCreate() {
    setEditing(null);
    setForm({ ...empty, teacherId: teachers[0]?.id || "" });
    setError("");
    setOpen(true);
  }

  function openEdit(batch) {
    setEditing(batch);
    setForm({
      name: batch.name,
      subject: batch.subject,
      schedule: batch.schedule,
      feeAmount: batch.feeAmount,
      teacherId: batch.teacherId || "",
      status: batch.status,
    });
    setError("");
    setOpen(true);
  }

  function save(e) {
    e.preventDefault();
    if (!isAdmin) {
      toast("Teachers have read-only access to batches");
      return;
    }
    try {
      if (editing) updateBatch(editing.id, form);
      else createBatch(form);
      setOpen(false);
      toast(editing ? "Batch updated" : "Batch created");
    } catch (err) {
      setError(err.message);
    }
  }

  function onArchive(batch) {
    if (!isAdmin) return;
    archiveBatch(batch.id);
    toast("Batch archived");
  }

  function onDelete(batch) {
    if (!isAdmin) return;
    try {
      if (!window.confirm(`Delete ${batch.name}?`)) return;
      removeBatch(batch.id);
      toast("Batch deleted");
    } catch (err) {
      toast(err.message);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Batches / Courses</h1>
          <p>Group students by class, teacher, and fee plan.</p>
        </div>
        {isAdmin ? <Button onClick={openCreate}>Add batch</Button> : null}
      </div>

      {!isAdmin ? (
        <p className="muted" style={{ marginBottom: "1rem" }}>
          Teacher view is read-only for batches.
        </p>
      ) : null}

      {batches.length === 0 ? (
        <div className="empty-state">No batches yet.</div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Teacher</th>
                <th>Subject</th>
                <th>Schedule</th>
                <th>Fee</th>
                <th>Students</th>
                <th>Status</th>
                {isAdmin ? <th>Actions</th> : null}
              </tr>
            </thead>
            <tbody>
              {batches.map((b) => (
                <tr key={b.id}>
                  <td>{b.name}</td>
                  <td>{teacherMap[b.teacherId] || "Unassigned"}</td>
                  <td>{b.subject}</td>
                  <td>{b.schedule}</td>
                  <td>{formatINR(b.feeAmount)}</td>
                  <td>{counts[b.id] || 0}</td>
                  <td>
                    <Badge status={b.status}>{b.status}</Badge>
                  </td>
                  {isAdmin ? (
                    <td>
                      <div className="row">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => openEdit(b)}
                        >
                          Edit
                        </Button>
                        {b.status !== "archived" ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => onArchive(b)}
                          >
                            Archive
                          </Button>
                        ) : null}
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => onDelete(b)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit batch" : "Add batch"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="batch-form">
              Save
            </Button>
          </>
        }
      >
        <form id="batch-form" className="form-grid" onSubmit={save}>
          <Input
            className="full"
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            label="Subject"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
          />
          <Input
            label="Monthly fee"
            type="number"
            min="0"
            value={form.feeAmount}
            onChange={(e) =>
              setForm({ ...form, feeAmount: Number(e.target.value) })
            }
          />
          <Select
            className="full"
            label="Teacher"
            value={form.teacherId}
            onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
          >
            <option value="">Unassigned</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
          <Input
            className="full"
            label="Schedule label"
            value={form.schedule}
            onChange={(e) => setForm({ ...form, schedule: e.target.value })}
          />
          <Select
            label="Status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </Select>
          {error ? (
            <div className="full" style={{ color: "var(--danger)" }}>
              {error}
            </div>
          ) : null}
        </form>
      </Modal>
    </div>
  );
}
