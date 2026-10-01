import * as studentsRepo from "../repositories/studentsRepo";
import * as batchesRepo from "../repositories/batchesRepo";
import * as attendanceRepo from "../repositories/attendanceRepo";
import * as paymentsRepo from "../repositories/paymentsRepo";
import { listTeachers, getTeacherStats } from "./teacherService";
import { listExams, getExamDetail } from "./examService";
import { listAssignments, enrichAssignment } from "./assignmentService";
import { downloadCsv, toCsv } from "../utils/csv";
import { formatINR } from "../utils/money";
import { computeAttendanceRate } from "./attendanceService";
import { outstandingDues } from "./paymentService";

export function buildAttendanceReport() {
  const students = studentsRepo.getAll();
  const batches = Object.fromEntries(
    batchesRepo.getAll().map((b) => [b.id, b.name]),
  );
  const allMarks = attendanceRepo.getAll();
  return students.map((s) => {
    const marks = allMarks.filter((a) => a.studentId === s.id);
    return {
      name: s.name,
      batch: batches[s.batchId] || "—",
      status: s.status,
      marks: marks.length,
      rate: computeAttendanceRate(marks),
    };
  });
}

export function buildFeesReport() {
  return paymentsRepo.getAll().map((p) => {
    const student = studentsRepo.getById(p.studentId);
    return {
      student: student?.name || p.studentId,
      amount: p.amount,
      status: p.status,
      method: p.method,
      dueDate: p.dueDate,
      paidAt: p.paidAt || "",
      note: p.note || "",
    };
  });
}

export function buildTeacherLoadReport() {
  return listTeachers().map((t) => {
    const stats = getTeacherStats(t.id);
    return {
      teacher: t.name,
      batches: stats.batchCount,
      students: stats.activeStudentCount,
      presentToday: stats.presentToday,
      attendanceRate: stats.attendanceRate,
    };
  });
}

export function buildBatchHealthReport() {
  return batchesRepo.getAll().map((b) => {
    const students = studentsRepo
      .getAll()
      .filter((s) => s.batchId === b.id);
    const active = students.filter((s) => s.status === "active");
    const marks = attendanceRepo
      .getAll()
      .filter((a) => a.batchId === b.id);
    const dues = outstandingDues(
      paymentsRepo.getAll().filter((p) => p.batchId === b.id),
    );
    return {
      batch: b.name,
      students: active.length,
      attendanceRate: computeAttendanceRate(marks),
      outstanding: dues,
      teacherId: b.teacherId || "",
    };
  });
}

export function getReportsSummary() {
  return {
    students: studentsRepo.getAll().length,
    exams: listExams().length,
    assignments: listAssignments().length,
    outstanding: outstandingDues(),
  };
}

export function exportAttendanceCsv() {
  const rows = buildAttendanceReport();
  const csv = toCsv(rows, [
    { label: "Student", value: (r) => r.name },
    { label: "Batch", value: (r) => r.batch },
    { label: "Status", value: (r) => r.status },
    { label: "Marks", value: (r) => r.marks },
    { label: "Attendance %", value: (r) => r.rate ?? "" },
  ]);
  downloadCsv("attendance-report.csv", csv);
}

export function exportFeesCsv() {
  const rows = buildFeesReport();
  const csv = toCsv(rows, [
    { label: "Student", value: (r) => r.student },
    { label: "Amount", value: (r) => r.amount },
    { label: "Status", value: (r) => r.status },
    { label: "Method", value: (r) => r.method },
    { label: "Due", value: (r) => r.dueDate },
    { label: "Paid at", value: (r) => r.paidAt },
    { label: "Note", value: (r) => r.note },
  ]);
  downloadCsv("fees-report.csv", csv);
}

export function exportTeacherLoadCsv() {
  const rows = buildTeacherLoadReport();
  const csv = toCsv(rows, [
    { label: "Teacher", value: (r) => r.teacher },
    { label: "Batches", value: (r) => r.batches },
    { label: "Students", value: (r) => r.students },
    { label: "Present today", value: (r) => r.presentToday },
    { label: "Attendance %", value: (r) => r.rate ?? r.attendanceRate ?? "" },
  ]);
  downloadCsv("teacher-load.csv", csv);
}

export function exportBatchHealthCsv() {
  const rows = buildBatchHealthReport();
  const csv = toCsv(rows, [
    { label: "Batch", value: (r) => r.batch },
    { label: "Active students", value: (r) => r.students },
    { label: "Attendance %", value: (r) => r.attendanceRate ?? "" },
    { label: "Outstanding", value: (r) => formatINR(r.outstanding) },
  ]);
  downloadCsv("batch-health.csv", csv);
}

export function exportExamCsv(examId) {
  const detail = getExamDetail(examId);
  if (!detail) throw new Error("Exam not found");
  const csv = toCsv(detail.rows, [
    { label: "Student", value: (r) => r.name },
    { label: "Marks", value: (r) => r.marks ?? "" },
    { label: "%", value: (r) => r.percentage ?? "" },
    { label: "Remark", value: (r) => r.remark },
  ]);
  downloadCsv(`${detail.exam.title.replace(/\s+/g, "-")}-marks.csv`, csv);
}

export function getAssignmentReport() {
  return listAssignments().map(enrichAssignment);
}
