import { useMemo, useState } from "react";
import {
  Pencil,
  Trash2,
  UserPlus,
  Users,
  GraduationCap,
  CalendarCheck2,
  Percent,
} from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import Kpi from "../components/ui/Kpi";
import Card from "../components/ui/Card";
import { useToast } from "../app/providers";
import { useStorageVersion } from "../hooks/useRepo";
import {
  deactivateTeacher,
  enrollTeacher,
  listTeacherSummaries,
  removeTeacher,
  updateTeacher,
} from "../services/teacherService";

const empty = {
  name: "",
  email: "",
  password: "",
  phone: "",
  subjects: "",
  status: "active",
};

export default function TeachersPage() {
  const version = useStorageVersion();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");

  const summaries = useMemo(() => listTeacherSummaries(), [version]);
  const totals = useMemo(() => {
    return summaries.reduce(
      (acc, row) => {
        acc.teachers += 1;
        acc.students += row.stats.activeStudentCount;
        acc.present += row.stats.presentToday;
        acc.batches += row.stats.batchCount;
        return acc;
      },
      { teachers: 0, students: 0, present: 0, batches: 0 },
    );
  }, [summaries]);

  function openCreate() {
    setEditing(null);
    setForm(empty);
    setError("");
    setOpen(true);
  }

  function openEdit(teacher) {
    setEditing(teacher);
    setForm({
      name: teacher.name,
      email: teacher.email,
      password: "",
      phone: teacher.phone || "",
      subjects: teacher.subjects || "",
      status: teacher.status || "active",
    });
    setError("");
    setOpen(true);
  }

  function save(e) {
    e.preventDefault();
    try {
      if (editing) {
        updateTeacher(editing.id, {
          name: form.name,
          email: form.email,
          phone: form.phone,
          subjects: form.subjects,
          status: form.status,
          ...(form.password ? { password: form.password } : {}),
        });
        toast("Teacher updated");
      } else {
        enrollTeacher(form);
        toast("Teacher enrolled");
      }
      setOpen(false);
    } catch (err) {
      setError(err.message || "Could not save teacher");
    }
  }

  function onDeactivate(teacher) {
    deactivateTeacher(teacher.id);
    toast("Teacher deactivated");
  }

  function onDelete(teacher) {
    try {
      if (!window.confirm(`Delete ${teacher.name}?`)) return;
      removeTeacher(teacher.id);
      toast("Teacher deleted");
    } catch (err) {
      toast(err.message);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Teachers</h1>
          <p>
            Super Admin: enroll teachers and see students attending under each.
          </p>
        </div>
        <Button onClick={openCreate}>
          <UserPlus size={16} />
          Enroll teacher
        </Button>
      </div>

      <div className="grid-kpi">
        <Kpi icon={Users} label="Teachers" value={totals.teachers} />
        <Kpi
          icon={GraduationCap}
          label="Active batches"
          value={totals.batches}
        />
        <Kpi
          icon={Users}
          label="Students under teachers"
          value={totals.students}
        />
        <Kpi
          icon={CalendarCheck2}
          label="Present / late today"
          value={totals.present}
        />
      </div>

      {summaries.length === 0 ? (
        <div className="empty-state">No teachers enrolled yet.</div>
      ) : (
        <div className="stack">
          {summaries.map(({ teacher, stats }) => (
            <Card
              key={teacher.id}
              title={teacher.name}
              subtitle={teacher.subjects || teacher.email}
              actions={
                <div className="row">
                  <Badge status={teacher.status}>{teacher.status}</Badge>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => openEdit(teacher)}
                  >
                    <Pencil size={14} />
                    Edit
                  </Button>
                  {teacher.status !== "inactive" ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onDeactivate(teacher)}
                    >
                      Deactivate
                    </Button>
                  ) : null}
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => onDelete(teacher)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              }
            >
              <div className="grid-kpi" style={{ marginBottom: 0 }}>
                <Kpi
                  icon={GraduationCap}
                  label="Batches"
                  value={stats.batchCount}
                  hint={stats.batches.map((b) => b.name).join(" · ") || "None"}
                />
                <Kpi
                  icon={Users}
                  label="Students enrolled"
                  value={stats.activeStudentCount}
                  hint={`${stats.studentCount} total incl. inactive`}
                />
                <Kpi
                  icon={CalendarCheck2}
                  label="Attended today"
                  value={`${stats.presentToday}/${stats.markedToday || 0}`}
                  hint="Present + late / marks today"
                />
                <Kpi
                  icon={Percent}
                  label="Attendance rate"
                  value={
                    stats.attendanceRate == null
                      ? "—"
                      : `${stats.attendanceRate}%`
                  }
                  hint={`${stats.scheduleCount} weekly slots`}
                />
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit teacher" : "Enroll teacher"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="teacher-form">
              Save
            </Button>
          </>
        }
      >
        <form id="teacher-form" className="form-grid" onSubmit={save}>
          <Input
            className="full"
            label="Full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <Input
            label={editing ? "New password (optional)" : "Password"}
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required={!editing}
          />
          <Input
            label="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <Input
            label="Subjects"
            value={form.subjects}
            onChange={(e) => setForm({ ...form, subjects: e.target.value })}
            placeholder="Science, Physics"
          />
          <Select
            label="Status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
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
