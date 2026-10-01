import * as studentsRepo from "../repositories/studentsRepo";
import * as paymentsRepo from "../repositories/paymentsRepo";
import * as attendanceRepo from "../repositories/attendanceRepo";
import {
  addDays,
  endOfMonth,
  monthKey,
  startOfMonth,
  todayISO,
} from "../utils/date";
import {
  computeAttendanceRate,
  listAttendance,
} from "./attendanceService";
import {
  outstandingDues,
  overdueCount,
  revenueInRange,
} from "./paymentService";
import { studentCountByBatch } from "./batchService";

export function getDashboardStats({ from, to } = {}) {
  const rangeFrom = from || startOfMonth();
  const rangeTo = to || todayISO();
  const students = studentsRepo.getAll();
  const active = students.filter((s) => s.status === "active").length;
  const inactive = students.length - active;
  const attendanceRecords = listAttendance({ from: rangeFrom, to: rangeTo });
  const attendanceRate = computeAttendanceRate(attendanceRecords);
  const payments = paymentsRepo.getAll();

  return {
    totalStudents: students.length,
    activeStudents: active,
    inactiveStudents: inactive,
    attendanceRate,
    feesCollected: revenueInRange(rangeFrom, rangeTo, payments),
    outstandingDues: outstandingDues(payments),
    overdueCount: overdueCount(payments),
    rangeFrom,
    rangeTo,
  };
}

export function getAttendanceTrend(days = 30) {
  const end = todayISO();
  const start = addDays(end, -(days - 1));
  const records = listAttendance({ from: start, to: end });
  const byDate = new Map();
  for (let i = 0; i < days; i += 1) {
    const date = addDays(start, i);
    byDate.set(date, []);
  }
  records.forEach((r) => {
    if (byDate.has(r.date)) byDate.get(r.date).push(r);
  });
  return [...byDate.entries()].map(([date, rows]) => ({
    date,
    rate: computeAttendanceRate(rows) ?? 0,
    marks: rows.length,
  }));
}

export function getRevenueByMonth(months = 6) {
  const payments = paymentsRepo
    .getAll()
    .filter((p) => p.status === "paid" && p.paidAt);
  const now = new Date();
  const keys = [];
  for (let i = months - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(monthKey(d));
  }
  return keys.map((key) => {
    const amount = payments
      .filter((p) => monthKey(p.paidAt) === key)
      .reduce((s, p) => s + p.amount, 0);
    const [y, m] = key.split("-");
    const label = new Date(Number(y), Number(m) - 1, 1).toLocaleString(
      "en-IN",
      { month: "short", year: "2-digit" },
    );
    return { month: key, label, amount };
  });
}

export function getPaymentStatusBreakdown() {
  const counts = { paid: 0, pending: 0, overdue: 0, partial: 0 };
  paymentsRepo.getAll().forEach((p) => {
    if (counts[p.status] != null) counts[p.status] += 1;
  });
  return Object.entries(counts).map(([status, value]) => ({
    status,
    value,
  }));
}

export function getStudentsPerBatchChart() {
  return studentCountByBatch().map((r) => ({
    name: r.name.replace("Class ", "C"),
    count: r.count,
  }));
}

export function getMonthBounds() {
  return { from: startOfMonth(), to: endOfMonth() };
}

export function getLiveAttendanceSample() {
  return attendanceRepo.getAll().length;
}
