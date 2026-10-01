import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Trash2, UserPlus } from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Badge from "../components/ui/Badge";
import StudentFormModal from "../features/students/StudentFormModal";
import { useStorageVersion } from "../hooks/useRepo";
import { useAuth, useToast } from "../app/providers";
import { listBatches } from "../services/batchService";
import {
  createStudent,
  enrichWithBatch,
  listStudents,
  removeStudent,
  updateStudent,
} from "../services/studentService";
import { formatDisplayDate } from "../utils/date";

export default function StudentsPage() {
  const version = useStorageVersion();
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [batchId, setBatchId] = useState("");
  const [status, setStatus] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const batches = useMemo(() => listBatches(), [version]);
  const students = useMemo(
    () => listStudents({ query, batchId, status }).map(enrichWithBatch),
    [version, query, batchId, status],
  );

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(student) {
    setEditing(student);
    setModalOpen(true);
  }

  function handleSubmit(form) {
    try {
      if (editing) {
        updateStudent(editing.id, form);
        toast("Student updated");
      } else {
        createStudent(form);
        toast("Student created");
      }
      setModalOpen(false);
    } catch (err) {
      toast(err.message || "Could not save student");
    }
  }

  function handleDelete(student) {
    if (!isAdmin) {
      toast("Only admin can delete students");
      return;
    }
    if (!window.confirm(`Delete ${student.name}?`)) return;
    removeStudent(student.id);
    toast("Student deleted");
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Students</h1>
          <p>Search, filter, and manage enrollments.</p>
        </div>
        <Button onClick={openCreate}>
          <UserPlus size={16} />
          Add student
        </Button>
      </div>

      <div className="filters-bar">
        <Input
          label="Search"
          placeholder="Name, phone, email"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ minWidth: 220 }}
        />
        <Select
          label="Batch"
          value={batchId}
          onChange={(e) => setBatchId(e.target.value)}
        >
          <option value="">All batches</option>
          {batches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </Select>
        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </Select>
      </div>

      {students.length === 0 ? (
        <div className="empty-state">No students match your filters.</div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Batch</th>
                <th>Phone</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id}>
                  <td>
                    <Link to={`/students/${s.id}`} style={{ color: "var(--accent)", fontWeight: 600 }}>
                      {s.name}
                    </Link>
                  </td>
                  <td>{s.batchName}</td>
                  <td>{s.phone}</td>
                  <td>{formatDisplayDate(s.joinDate)}</td>
                  <td>
                    <Badge status={s.status}>{s.status}</Badge>
                  </td>
                  <td>
                    <div className="row">
                      <Button size="sm" variant="secondary" onClick={() => openEdit(s)}>
                        <Pencil size={14} />
                        Edit
                      </Button>
                      {isAdmin ? (
                        <Button size="sm" variant="danger" onClick={() => handleDelete(s)}>
                          <Trash2 size={14} />
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <StudentFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        batches={batches.filter((b) => b.status === "active")}
        initial={editing}
      />
    </div>
  );
}
