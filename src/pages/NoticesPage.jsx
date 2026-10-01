import { useMemo, useState } from "react";
import { Megaphone, Pin, Plus, Trash2 } from "lucide-react";
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
  createAnnouncement,
  listAnnouncements,
  removeAnnouncement,
  updateAnnouncement,
} from "../services/announcementService";
import { formatDisplayDateTime } from "../utils/date";

export default function NoticesPage() {
  const version = useStorageVersion();
  const toast = useToast();
  const { isAdmin } = useAuth();
  const items = useMemo(() => listAnnouncements(), [version]);
  const batches = useMemo(() => listBatches(), [version]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    body: "",
    audience: "all",
    batchId: "",
    channel: "in_app",
    pinned: false,
  });

  function save(e) {
    e.preventDefault();
    try {
      createAnnouncement(form);
      setOpen(false);
      toast(
        form.channel === "whatsapp"
          ? "Notice posted (WhatsApp queued — demo)"
          : "Notice posted",
      );
    } catch (err) {
      toast(err.message);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Notices & reminders</h1>
          <p>In-app announcements with demo WhatsApp/SMS channels.</p>
        </div>
        {isAdmin ? (
          <Button
            onClick={() => {
              setForm({
                title: "",
                body: "",
                audience: "all",
                batchId: "",
                channel: "in_app",
                pinned: false,
              });
              setOpen(true);
            }}
          >
            <Plus size={16} /> New notice
          </Button>
        ) : null}
      </div>

      <div className="stack">
        {items.length === 0 ? (
          <div className="empty-state">No notices yet.</div>
        ) : (
          items.map((item) => (
            <Card
              key={item.id}
              title={item.title}
              subtitle={`${item.createdByName} · ${formatDisplayDateTime(item.createdAt)}`}
              actions={
                <div className="row">
                  {item.pinned ? (
                    <Badge status="active">
                      <span className="row">
                        <Pin size={12} /> Pinned
                      </span>
                    </Badge>
                  ) : null}
                  <Badge status="pending">{item.channel}</Badge>
                  <Badge status="info">{item.audience}</Badge>
                  {isAdmin ? (
                    <>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          updateAnnouncement(item.id, { pinned: !item.pinned });
                          toast(item.pinned ? "Unpinned" : "Pinned");
                        }}
                      >
                        <Pin size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          removeAnnouncement(item.id);
                          toast("Deleted");
                        }}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </>
                  ) : null}
                </div>
              }
            >
              <p style={{ whiteSpace: "pre-wrap" }}>{item.body}</p>
            </Card>
          ))
        )}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Compose notice"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="notice-form">
              <Megaphone size={14} /> Publish
            </Button>
          </>
        }
      >
        <form id="notice-form" className="form-grid" onSubmit={save}>
          <Input
            className="full"
            label="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <Input
            className="full"
            label="Message"
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            required
          />
          <Select
            label="Audience"
            value={form.audience}
            onChange={(e) => setForm({ ...form, audience: e.target.value })}
          >
            <option value="all">Everyone</option>
            <option value="staff">Staff</option>
            <option value="parents">Parents</option>
            <option value="batch">One batch</option>
          </Select>
          <Select
            label="Channel"
            value={form.channel}
            onChange={(e) => setForm({ ...form, channel: e.target.value })}
          >
            <option value="in_app">In-app</option>
            <option value="whatsapp">WhatsApp (demo)</option>
            <option value="sms">SMS (demo)</option>
          </Select>
          {form.audience === "batch" ? (
            <Select
              className="full"
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
          ) : null}
        </form>
      </Modal>
    </div>
  );
}
