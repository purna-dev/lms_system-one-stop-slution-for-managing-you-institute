import { useMemo, useState } from "react";
import { Plus, UserCheck } from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Modal from "../components/ui/Modal";
import Kpi from "../components/ui/Kpi";
import { useToast } from "../app/providers";
import { useStorageVersion } from "../hooks/useRepo";
import { listBatches } from "../services/batchService";
import {
  convertLeadToStudent,
  createLead,
  leadPipelineStats,
  listLeads,
  removeLead,
  updateLead,
} from "../services/leadService";
import { formatDisplayDate, todayISO } from "../utils/date";

export default function AdmissionsPage() {
  const version = useStorageVersion();
  const toast = useToast();
  const leads = useMemo(() => listLeads(), [version]);
  const stats = useMemo(() => leadPipelineStats(), [version]);
  const batches = useMemo(() => listBatches(), [version]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    interestedBatchId: "",
    source: "walk-in",
    notes: "",
    followUpDate: todayISO(),
  });

  function save(e) {
    e.preventDefault();
    try {
      createLead(form);
      setOpen(false);
      toast("Lead added");
    } catch (err) {
      toast(err.message);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Admissions pipeline</h1>
          <p>Track inquiries and convert them into enrolled students.</p>
        </div>
        <Button
          onClick={() => {
            setForm({
              name: "",
              phone: "",
              email: "",
              interestedBatchId: batches[0]?.id || "",
              source: "walk-in",
              notes: "",
              followUpDate: todayISO(),
            });
            setOpen(true);
          }}
        >
          <Plus size={16} /> New inquiry
        </Button>
      </div>

      <div className="grid-kpi">
        {stats.map((s) => (
          <Kpi
            key={s.status}
            label={s.status.replace("_", " ")}
            value={s.count}
          />
        ))}
      </div>

      {leads.length === 0 ? (
        <div className="empty-state">No leads yet.</div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Source</th>
                <th>Follow-up</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{lead.name}</div>
                    <div className="muted" style={{ fontSize: "0.8rem" }}>
                      {lead.notes}
                    </div>
                  </td>
                  <td>{lead.phone}</td>
                  <td>{lead.source}</td>
                  <td>
                    {lead.followUpDate
                      ? formatDisplayDate(lead.followUpDate)
                      : "—"}
                  </td>
                  <td>
                    <Select
                      value={lead.status}
                      onChange={(e) => {
                        updateLead(lead.id, { status: e.target.value });
                        toast("Status updated");
                      }}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="follow_up">Follow up</option>
                      <option value="enrolled">Enrolled</option>
                      <option value="lost">Lost</option>
                    </Select>
                  </td>
                  <td>
                    <div className="row">
                      {lead.status !== "enrolled" ? (
                        <Button
                          size="sm"
                          onClick={() => {
                            try {
                              const batchId =
                                lead.interestedBatchId || batches[0]?.id;
                              convertLeadToStudent(lead.id, { batchId });
                              toast("Lead enrolled as student");
                            } catch (err) {
                              toast(err.message);
                            }
                          }}
                        >
                          <UserCheck size={14} /> Enroll
                        </Button>
                      ) : null}
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          if (!window.confirm("Delete lead?")) return;
                          removeLead(lead.id);
                          toast("Lead deleted");
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New inquiry"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="lead-form">
              Save
            </Button>
          </>
        }
      >
        <form id="lead-form" className="form-grid" onSubmit={save}>
          <Input
            className="full"
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            label="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
          />
          <Input
            label="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Select
            label="Interested batch"
            value={form.interestedBatchId}
            onChange={(e) =>
              setForm({ ...form, interestedBatchId: e.target.value })
            }
          >
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </Select>
          <Select
            label="Source"
            value={form.source}
            onChange={(e) => setForm({ ...form, source: e.target.value })}
          >
            <option value="walk-in">Walk-in</option>
            <option value="website">Website</option>
            <option value="referral">Referral</option>
            <option value="social">Social</option>
          </Select>
          <Input
            label="Follow-up"
            type="date"
            value={form.followUpDate}
            onChange={(e) => setForm({ ...form, followUpDate: e.target.value })}
          />
          <Input
            className="full"
            label="Notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </form>
      </Modal>
    </div>
  );
}
