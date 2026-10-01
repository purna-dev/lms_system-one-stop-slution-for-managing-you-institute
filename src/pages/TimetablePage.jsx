import { useMemo, useState } from "react";
import { AlertTriangle, Plus } from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Modal from "../components/ui/Modal";
import Card from "../components/ui/Card";
import { useToast } from "../app/providers";
import { useStorageVersion } from "../hooks/useRepo";
import { listBatches } from "../services/batchService";
import { listTeachers } from "../services/teacherService";
import {
  DAY_NAMES,
  deleteTimetableSlot,
  detectConflicts,
  getTimetableMatrix,
  saveTimetableSlot,
} from "../services/timetableService";

const empty = {
  batchId: "",
  teacherId: "",
  days: [1],
  startTime: "10:00",
  endTime: "11:00",
  room: "",
  status: "active",
};

export default function TimetablePage() {
  const version = useStorageVersion();
  const toast = useToast();
  const matrix = useMemo(() => getTimetableMatrix(), [version]);
  const batches = useMemo(() => listBatches(), [version]);
  const teachers = useMemo(() => listTeachers(), [version]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [conflicts, setConflicts] = useState([]);

  function previewConflicts(next = form) {
    setConflicts(detectConflicts(next));
  }

  function save(e, force = false) {
    e?.preventDefault?.();
    try {
      const result = saveTimetableSlot(form, { force });
      setOpen(false);
      setConflicts([]);
      if (result.conflicts?.length) {
        toast("Saved with override (conflicts ignored)");
      } else {
        toast("Timetable slot saved");
      }
    } catch (err) {
      setConflicts(err.conflicts || [{ message: err.message }]);
      toast(err.message);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Timetable builder</h1>
          <p>Weekly slots with teacher/room conflict detection.</p>
        </div>
        <Button
          onClick={() => {
            setForm({
              ...empty,
              batchId: batches[0]?.id || "",
              teacherId: teachers[0]?.id || "",
            });
            setConflicts([]);
            setOpen(true);
          }}
        >
          <Plus size={16} /> Add slot
        </Button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "0.75rem",
        }}
      >
        {matrix.map((day) => (
          <Card key={day.day} title={day.name} subtitle={`${day.slots.length} classes`}>
            <div className="stack" style={{ gap: "0.45rem" }}>
              {day.slots.length === 0 ? (
                <div className="muted" style={{ fontSize: "0.85rem" }}>
                  Free
                </div>
              ) : (
                day.slots.map((s) => (
                  <div
                    key={`${day.day}-${s.id}`}
                    style={{
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      padding: "0.55rem",
                      background: "var(--surface-2)",
                      fontSize: "0.82rem",
                    }}
                  >
                    <div style={{ fontWeight: 750 }}>
                      {s.startLabel}–{s.endLabel}
                    </div>
                    <div>{s.batchName}</div>
                    <div className="muted">{s.teacherName}</div>
                    <div className="muted">{s.room || "No room"}</div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (!window.confirm("Remove this slot?")) return;
                        deleteTimetableSlot(s.id);
                        toast("Slot removed");
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))
              )}
            </div>
          </Card>
        ))}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add timetable slot"
        wide
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            {conflicts.length ? (
              <Button variant="danger" onClick={() => save(null, true)}>
                Force save
              </Button>
            ) : null}
            <Button type="submit" form="tt-form">
              Save slot
            </Button>
          </>
        }
      >
        <form
          id="tt-form"
          className="form-grid"
          onSubmit={(e) => save(e, false)}
        >
          <Select
            label="Batch"
            value={form.batchId}
            onChange={(e) => {
              const next = { ...form, batchId: e.target.value };
              setForm(next);
              previewConflicts(next);
            }}
          >
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </Select>
          <Select
            label="Teacher"
            value={form.teacherId}
            onChange={(e) => {
              const next = { ...form, teacherId: e.target.value };
              setForm(next);
              previewConflicts(next);
            }}
          >
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
          <Input
            label="Start"
            type="time"
            value={form.startTime}
            onChange={(e) => {
              const next = { ...form, startTime: e.target.value };
              setForm(next);
              previewConflicts(next);
            }}
          />
          <Input
            label="End"
            type="time"
            value={form.endTime}
            onChange={(e) => {
              const next = { ...form, endTime: e.target.value };
              setForm(next);
              previewConflicts(next);
            }}
          />
          <Input
            className="full"
            label="Room"
            value={form.room}
            onChange={(e) => {
              const next = { ...form, room: e.target.value };
              setForm(next);
              previewConflicts(next);
            }}
          />
          <div className="full">
            <div className="muted" style={{ marginBottom: 8, fontWeight: 700 }}>
              Days
            </div>
            <div className="row">
              {DAY_NAMES.map((name, day) => (
                <Button
                  key={name}
                  type="button"
                  size="sm"
                  variant={form.days.includes(day) ? "primary" : "secondary"}
                  onClick={() => {
                    const has = form.days.includes(day);
                    const days = has
                      ? form.days.filter((d) => d !== day)
                      : [...form.days, day].sort();
                    const next = { ...form, days };
                    setForm(next);
                    previewConflicts(next);
                  }}
                >
                  {name}
                </Button>
              ))}
            </div>
          </div>
          {conflicts.length ? (
            <div
              className="full"
              style={{
                background: "var(--warning-soft)",
                borderRadius: 10,
                padding: "0.75rem",
                color: "var(--warning)",
              }}
            >
              <div className="row" style={{ marginBottom: 6 }}>
                <AlertTriangle size={16} />
                <strong>Conflicts detected</strong>
              </div>
              {conflicts.map((c, i) => (
                <div key={i}>{c.message}</div>
              ))}
            </div>
          ) : null}
        </form>
      </Modal>
    </div>
  );
}
