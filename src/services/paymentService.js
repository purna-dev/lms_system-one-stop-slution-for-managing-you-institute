import * as paymentsRepo from "../repositories/paymentsRepo";
import * as studentsRepo from "../repositories/studentsRepo";
import { inRange, todayISO } from "../utils/date";

const DUE_STATUSES = new Set(["pending", "overdue", "partial"]);

export function listPayments(filters = {}) {
  const { studentId, batchId, status, from, to } = filters;
  return paymentsRepo.getAll().filter((p) => {
    if (studentId && p.studentId !== studentId) return false;
    if (batchId && p.batchId !== batchId) return false;
    if (status && p.status !== status) return false;
    const dateKey = p.paidAt ? p.paidAt.slice(0, 10) : p.dueDate;
    if ((from || to) && !inRange(dateKey, from, to)) return false;
    return true;
  });
}

export function createPayment(payload) {
  return paymentsRepo.create(payload);
}

export function updatePayment(id, patch) {
  return paymentsRepo.update(id, patch);
}

export function markPaid(id, { method, paidAt, methodMeta, note } = {}) {
  const patch = {
    status: "paid",
    method: method || "upi",
    paidAt: paidAt || new Date().toISOString(),
  };
  if (methodMeta) patch.methodMeta = methodMeta;
  if (note != null) patch.note = note;
  return paymentsRepo.update(id, patch);
}

export function collectPayment(id, payload) {
  return markPaid(id, {
    method: payload.method,
    paidAt: payload.paidAt,
    methodMeta: payload.methodMeta,
    note: payload.note,
  });
}

export function removePayment(id) {
  paymentsRepo.remove(id);
}

export function outstandingDues(payments = paymentsRepo.getAll()) {
  return payments
    .filter((p) => DUE_STATUSES.has(p.status))
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
}

export function revenueInRange(from, to, payments = paymentsRepo.getAll()) {
  return payments
    .filter((p) => {
      if (p.status !== "paid" || !p.paidAt) return false;
      return inRange(p.paidAt.slice(0, 10), from, to);
    })
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
}

export function overdueCount(payments = paymentsRepo.getAll()) {
  const today = todayISO();
  return payments.filter(
    (p) =>
      p.status === "overdue" ||
      (p.status === "pending" && p.dueDate < today),
  ).length;
}

export function studentPaymentSummary(studentId) {
  const payments = listPayments({ studentId });
  return {
    payments,
    outstanding: outstandingDues(payments),
    paidTotal: payments
      .filter((p) => p.status === "paid")
      .reduce((s, p) => s + p.amount, 0),
    overdue: overdueCount(payments),
  };
}

export function enrichPayment(payment) {
  const student = studentsRepo.getById(payment.studentId);
  return {
    ...payment,
    studentName: student?.name || "Unknown",
  };
}
