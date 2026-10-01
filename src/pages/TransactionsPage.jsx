import { useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  IndianRupee,
  Receipt,
  Search,
  Wallet,
} from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import Kpi from "../components/ui/Kpi";
import Modal from "../components/ui/Modal";
import { useToast } from "../app/providers";
import { useStorageVersion } from "../hooks/useRepo";
import { listBatches } from "../services/batchService";
import { listStudents } from "../services/studentService";
import {
  exportTransactionsCsv,
  getTransactionStats,
  listTransactions,
} from "../services/transactionService";
import { formatDisplayDate, formatDisplayDateTime } from "../utils/date";
import { formatINR } from "../utils/money";

export default function TransactionsPage() {
  const version = useStorageVersion();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [method, setMethod] = useState("");
  const [batchId, setBatchId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [settledOnly, setSettledOnly] = useState(false);
  const [selected, setSelected] = useState(null);

  const batches = useMemo(() => listBatches(), [version]);
  const students = useMemo(() => listStudents({}), [version]);

  const transactions = useMemo(
    () =>
      listTransactions({
        query,
        status: status || undefined,
        method: method || undefined,
        batchId: batchId || undefined,
        studentId: studentId || undefined,
        from: from || undefined,
        to: to || undefined,
        settledOnly,
      }),
    [version, query, status, method, batchId, studentId, from, to, settledOnly],
  );

  const stats = useMemo(
    () => getTransactionStats(transactions),
    [transactions],
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Transaction ledger</h1>
          <p>
            Super Admin view of every fee payment, due, and settlement record.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => {
            exportTransactionsCsv(transactions);
            toast("Transactions CSV downloaded");
          }}
        >
          <Download size={16} /> Export CSV
        </Button>
      </div>

      <div className="grid-kpi">
        <Kpi icon={Receipt} label="Records in view" value={stats.total} />
        <Kpi
          icon={IndianRupee}
          label="Collected (view)"
          value={formatINR(stats.collected)}
        />
        <Kpi
          icon={Wallet}
          label="Outstanding (all)"
          value={formatINR(stats.outstanding)}
        />
        <Kpi
          icon={ArrowUpRight}
          label="Avg paid ticket"
          value={formatINR(stats.avgTicket)}
          hint={`${stats.paidCount} paid · ${stats.pendingCount} open`}
        />
      </div>

      <div className="filters-bar">
        <Input
          label="Search"
          placeholder="Txn ID, student, UPI, card…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ minWidth: 200 }}
        />
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
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
          <option value="partial">Partial</option>
        </Select>
        <Select
          label="Method"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
        >
          <option value="">All methods</option>
          <option value="upi">UPI</option>
          <option value="card">Card</option>
          <option value="bank">Bank</option>
          <option value="cash">Cash</option>
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
        <label
          className="field"
          style={{ justifyContent: "flex-end", minWidth: 140 }}
        >
          <span>&nbsp;</span>
          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontWeight: 650,
              color: "var(--muted)",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={settledOnly}
              onChange={(e) => setSettledOnly(e.target.checked)}
            />
            Settled only
          </label>
        </label>
      </div>

      {transactions.length === 0 ? (
        <div className="empty-state">No transactions match these filters.</div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Txn ID</th>
                <th>Student</th>
                <th>Batch</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Due</th>
                <th>Settled</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td>
                    <code style={{ fontWeight: 700 }}>{t.txnId}</code>
                  </td>
                  <td>{t.studentName}</td>
                  <td>{t.batchName}</td>
                  <td>
                    <span className="row" style={{ gap: 4 }}>
                      {t.status === "paid" || t.status === "partial" ? (
                        <ArrowDownLeft size={14} color="var(--accent)" />
                      ) : (
                        <ArrowUpRight size={14} color="var(--warning)" />
                      )}
                      {formatINR(t.amount)}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 650, textTransform: "uppercase" }}>
                      {t.method}
                    </div>
                    <div className="muted" style={{ fontSize: "0.78rem" }}>
                      {t.methodDetail}
                    </div>
                  </td>
                  <td>
                    <Badge status={t.status}>{t.status}</Badge>
                  </td>
                  <td>{formatDisplayDate(t.dueDate)}</td>
                  <td>
                    {t.settledAt
                      ? formatDisplayDateTime(t.settledAt)
                      : "—"}
                  </td>
                  <td>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setSelected(t)}
                    >
                      <Search size={14} /> View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? selected.txnId : "Transaction"}
        footer={
          <Button variant="secondary" onClick={() => setSelected(null)}>
            Close
          </Button>
        }
      >
        {selected ? (
          <div className="stack" style={{ gap: "0.75rem" }}>
            <Card title="Amount">
              <div style={{ fontSize: "1.6rem", fontWeight: 800 }}>
                {formatINR(selected.amount)}
              </div>
              <Badge status={selected.status}>{selected.status}</Badge>
            </Card>
            <div className="form-grid">
              <div>
                <div className="muted">Student</div>
                <strong>{selected.studentName}</strong>
              </div>
              <div>
                <div className="muted">Batch</div>
                <strong>{selected.batchName}</strong>
              </div>
              <div>
                <div className="muted">Method</div>
                <strong style={{ textTransform: "uppercase" }}>
                  {selected.method}
                </strong>
                <div className="muted" style={{ fontSize: "0.85rem" }}>
                  {selected.methodDetail}
                </div>
              </div>
              <div>
                <div className="muted">Note</div>
                <strong>{selected.note || "—"}</strong>
              </div>
              <div>
                <div className="muted">Due date</div>
                <strong>{formatDisplayDate(selected.dueDate)}</strong>
              </div>
              <div>
                <div className="muted">Settled at</div>
                <strong>
                  {selected.settledAt
                    ? formatDisplayDateTime(selected.settledAt)
                    : "Not settled"}
                </strong>
              </div>
              <div className="full">
                <div className="muted">Internal payment id</div>
                <code>{selected.id}</code>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
