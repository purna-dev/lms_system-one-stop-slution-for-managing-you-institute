import * as paymentsRepo from "../repositories/paymentsRepo";
import * as studentsRepo from "../repositories/studentsRepo";
import * as batchesRepo from "../repositories/batchesRepo";
import { enrichPayment, outstandingDues, overdueCount } from "./paymentService";
import { inRange } from "../utils/date";
import { downloadCsv, toCsv } from "../utils/csv";
import { formatINR } from "../utils/money";

function methodDetail(payment) {
  const meta = payment.methodMeta;
  if (payment.method === "card" && meta?.last4) {
    return `${meta.brand || "Card"} •••• ${meta.last4}`;
  }
  if (payment.method === "upi" && meta?.upiId) return meta.upiId;
  if (payment.method === "bank" && meta?.bankName) {
    return `${meta.bankName}${meta.accountLast4 ? ` •••• ${meta.accountLast4}` : ""}`;
  }
  if (payment.method === "cash" && meta?.cashReceipt) return meta.cashReceipt;
  return (payment.method || "—").toUpperCase();
}

export function listTransactions(filters = {}) {
  const {
    studentId,
    batchId,
    status,
    method,
    from,
    to,
    query,
    settledOnly,
  } = filters;

  return paymentsRepo
    .getAll()
    .map((p) => {
      const enriched = enrichPayment(p);
      const batch = batchesRepo.getById(p.batchId);
      return {
        ...enriched,
        txnId: p.id.replace(/^pay_/, "TXN-").toUpperCase(),
        batchName: batch?.name || "—",
        methodDetail: methodDetail(p),
        settledAt: p.paidAt || null,
        sortDate: p.paidAt || p.dueDate || p.createdAt || "",
      };
    })
    .filter((t) => {
      if (settledOnly && t.status !== "paid" && t.status !== "partial") {
        return false;
      }
      if (studentId && t.studentId !== studentId) return false;
      if (batchId && t.batchId !== batchId) return false;
      if (status && t.status !== status) return false;
      if (method && t.method !== method) return false;
      const dateKey = t.settledAt
        ? t.settledAt.slice(0, 10)
        : t.dueDate;
      if ((from || to) && !inRange(dateKey, from, to)) return false;
      if (query) {
        const q = query.toLowerCase().trim();
        const hay = `${t.txnId} ${t.studentName} ${t.batchName} ${t.methodDetail} ${t.note || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => String(b.sortDate).localeCompare(String(a.sortDate)));
}

export function getTransactionStats(transactions) {
  const paid = transactions.filter((t) => t.status === "paid");
  const partial = transactions.filter((t) => t.status === "partial");
  const pending = transactions.filter(
    (t) => t.status === "pending" || t.status === "overdue",
  );
  const collected = [...paid, ...partial].reduce(
    (s, t) => s + (Number(t.amount) || 0),
    0,
  );
  const all = paymentsRepo.getAll();
  return {
    total: transactions.length,
    collected,
    paidCount: paid.length,
    pendingCount: pending.length,
    outstanding: outstandingDues(all),
    overdue: overdueCount(all),
    avgTicket:
      paid.length === 0
        ? 0
        : Math.round(paid.reduce((s, t) => s + t.amount, 0) / paid.length),
  };
}

export function exportTransactionsCsv(transactions) {
  const csv = toCsv(transactions, [
    { label: "Txn ID", value: (r) => r.txnId },
    { label: "Student", value: (r) => r.studentName },
    { label: "Batch", value: (r) => r.batchName },
    { label: "Amount", value: (r) => r.amount },
    { label: "Status", value: (r) => r.status },
    { label: "Method", value: (r) => r.method },
    { label: "Method detail", value: (r) => r.methodDetail },
    { label: "Due date", value: (r) => r.dueDate },
    { label: "Paid at", value: (r) => r.settledAt || "" },
    { label: "Note", value: (r) => r.note || "" },
  ]);
  downloadCsv("transactions-ledger.csv", csv);
}

export function getTransactionById(id) {
  const payment = paymentsRepo.getById(id);
  if (!payment) return null;
  const list = listTransactions({});
  return list.find((t) => t.id === id) || null;
}

export function formatTxnAmount(amount) {
  return formatINR(amount);
}

export function studentLookupName(studentId) {
  return studentsRepo.getById(studentId)?.name || "Unknown";
}
