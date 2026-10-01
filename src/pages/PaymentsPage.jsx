import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Banknote,
  Building2,
  CreditCard,
  IndianRupee,
  Plus,
  Receipt,
  Smartphone,
  Trash2,
  Wallet,
} from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Badge from "../components/ui/Badge";
import Kpi from "../components/ui/Kpi";
import PaymentCheckoutModal from "../features/payments/PaymentCheckoutModal";
import { useAuth, useToast } from "../app/providers";
import { useStorageVersion } from "../hooks/useRepo";
import { listBatches } from "../services/batchService";
import { listStudents } from "../services/studentService";
import {
  collectPayment,
  createPayment,
  enrichPayment,
  listPayments,
  outstandingDues,
  overdueCount,
  removePayment,
  updatePayment,
} from "../services/paymentService";
import { formatDisplayDate } from "../utils/date";
import { formatINR } from "../utils/money";

const METHOD_ICON = {
  card: CreditCard,
  upi: Smartphone,
  bank: Building2,
  cash: Banknote,
};

function methodLabel(payment) {
  const meta = payment.methodMeta;
  if (payment.method === "card" && meta?.last4) {
    return `${meta.brand || "Card"} •••• ${meta.last4}`;
  }
  if (payment.method === "upi" && meta?.upiId) return meta.upiId;
  if (payment.method === "bank" && meta?.bankName) return meta.bankName;
  if (payment.method === "cash" && meta?.cashReceipt) return meta.cashReceipt;
  return payment.method;
}

export default function PaymentsPage() {
  const version = useStorageVersion();
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [status, setStatus] = useState("");
  const [studentId, setStudentId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("create");
  const [selected, setSelected] = useState(null);

  const students = useMemo(() => listStudents({}), [version]);
  const batches = useMemo(() => listBatches(), [version]);
  const payments = useMemo(
    () =>
      listPayments({
        status: status || undefined,
        studentId: studentId || undefined,
        from: from || undefined,
        to: to || undefined,
      })
        .map(enrichPayment)
        .sort((a, b) => b.dueDate.localeCompare(a.dueDate)),
    [version, status, studentId, from, to],
  );

  const dues = useMemo(() => outstandingDues(), [version]);
  const overdue = useMemo(() => overdueCount(), [version]);

  function openCreate() {
    setMode("create");
    setSelected(null);
    setOpen(true);
  }

  function openCollect(payment) {
    setMode("collect");
    setSelected(payment);
    setOpen(true);
  }

  function handleCheckout(payload) {
    if (!isAdmin) {
      toast("Teachers have read-only access to payments");
      return;
    }
    if (mode === "collect" && payload.id) {
      collectPayment(payload.id, payload);
      toast("Payment collected successfully");
    } else {
      createPayment(payload);
      toast("Payment completed");
    }
    setOpen(false);
  }

  function onMarkOverdue(payment) {
    if (!isAdmin) return;
    updatePayment(payment.id, { status: "overdue", paidAt: null });
    toast("Marked overdue");
  }

  function onDelete(payment) {
    if (!isAdmin) return;
    if (!window.confirm("Delete this payment record?")) return;
    removePayment(payment.id);
    toast("Payment deleted");
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Payments</h1>
          <p>Checkout with card, UPI, bank, or cash — demo secure flow.</p>
        </div>
        {isAdmin ? (
          <Button onClick={openCreate}>
            <Plus size={16} />
            New checkout
          </Button>
        ) : null}
      </div>

      <div className="grid-kpi">
        <Kpi
          icon={Receipt}
          label="Visible receipts"
          value={payments.length}
        />
        <Kpi icon={Wallet} label="Outstanding dues" value={formatINR(dues)} />
        <Kpi
          icon={AlertTriangle}
          label="Overdue count"
          value={overdue}
        />
        <Kpi
          icon={IndianRupee}
          label="Paid in view"
          value={formatINR(
            payments
              .filter((p) => p.status === "paid")
              .reduce((s, p) => s + p.amount, 0),
          )}
        />
      </div>

      {!isAdmin ? (
        <p className="muted" style={{ marginBottom: "1rem" }}>
          Teacher view is read-only for payments.
        </p>
      ) : null}

      <div className="filters-bar">
        <Select
          label="Student"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
        >
          <option value="">All students</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
          <option value="partial">Partial</option>
        </Select>
        <Input
          label="From"
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
        <Input
          label="To"
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
      </div>

      {payments.length === 0 ? (
        <div className="empty-state">No payments match your filters.</div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Due</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Note</th>
                {isAdmin ? <th>Actions</th> : null}
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => {
                const Icon = METHOD_ICON[p.method] || Wallet;
                return (
                  <tr key={p.id}>
                    <td>{p.studentName}</td>
                    <td>{formatDisplayDate(p.dueDate)}</td>
                    <td>{formatINR(p.amount)}</td>
                    <td>
                      <span className="method-chip">
                        <Icon size={15} />
                        {methodLabel(p)}
                      </span>
                    </td>
                    <td>
                      <Badge status={p.status}>{p.status}</Badge>
                    </td>
                    <td>{p.note}</td>
                    {isAdmin ? (
                      <td>
                        <div className="row">
                          {p.status !== "paid" ? (
                            <Button size="sm" onClick={() => openCollect(p)}>
                              <CreditCard size={14} />
                              Pay now
                            </Button>
                          ) : null}
                          {p.status === "pending" ? (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => onMarkOverdue(p)}
                            >
                              Overdue
                            </Button>
                          ) : null}
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => onDelete(p)}
                            aria-label="Delete"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    ) : null}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <PaymentCheckoutModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleCheckout}
        students={students}
        batches={batches}
        initial={selected}
        mode={mode}
      />
    </div>
  );
}
