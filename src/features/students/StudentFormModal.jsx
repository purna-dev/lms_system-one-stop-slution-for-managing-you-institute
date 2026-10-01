import { useEffect, useState } from "react";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import { todayISO } from "../../utils/date";

const empty = {
  name: "",
  email: "",
  phone: "",
  batchId: "",
  status: "active",
  joinDate: todayISO(),
  guardianName: "",
  notes: "",
};

export default function StudentFormModal({
  open,
  onClose,
  onSubmit,
  batches,
  initial,
}) {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              name: initial.name || "",
              email: initial.email || "",
              phone: initial.phone || "",
              batchId: initial.batchId || "",
              status: initial.status || "active",
              joinDate: initial.joinDate || todayISO(),
              guardianName: initial.guardianName || "",
              notes: initial.notes || "",
            }
          : { ...empty, batchId: batches[0]?.id || "" },
      );
      setError("");
    }
  }, [open, initial, batches]);

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!form.batchId) {
      setError("Batch is required.");
      return;
    }
    if (!form.joinDate) {
      setError("Join date is required.");
      return;
    }
    onSubmit(form);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Edit student" : "Add student"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="student-form">
            Save
          </Button>
        </>
      }
    >
      <form id="student-form" className="form-grid" onSubmit={handleSubmit}>
        <Input
          className="full"
          label="Full name"
          value={form.name}
          onChange={(e) => setField("name", e.target.value)}
          required
        />
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => setField("email", e.target.value)}
        />
        <Input
          label="Phone"
          value={form.phone}
          onChange={(e) => setField("phone", e.target.value)}
        />
        <Select
          label="Batch"
          value={form.batchId}
          onChange={(e) => setField("batchId", e.target.value)}
        >
          <option value="">Select batch</option>
          {batches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </Select>
        <Select
          label="Status"
          value={form.status}
          onChange={(e) => setField("status", e.target.value)}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </Select>
        <Input
          label="Join date"
          type="date"
          value={form.joinDate}
          onChange={(e) => setField("joinDate", e.target.value)}
        />
        <Input
          label="Guardian"
          value={form.guardianName}
          onChange={(e) => setField("guardianName", e.target.value)}
        />
        <Input
          className="full"
          label="Notes"
          value={form.notes}
          onChange={(e) => setField("notes", e.target.value)}
        />
        {error ? (
          <div className="full" style={{ color: "var(--danger)" }}>
            {error}
          </div>
        ) : null}
      </form>
    </Modal>
  );
}
