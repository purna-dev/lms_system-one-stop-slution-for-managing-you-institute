import * as studentsRepo from "../repositories/studentsRepo";
import * as batchesRepo from "../repositories/batchesRepo";
import * as attendanceRepo from "../repositories/attendanceRepo";
import * as paymentsRepo from "../repositories/paymentsRepo";
import { filterStudents } from "../utils/filters";
import { getStudentAttendanceRate } from "./attendanceService";
import { studentPaymentSummary } from "./paymentService";

export function listStudents(filters = {}) {
  return filterStudents(studentsRepo.getAll(), filters);
}

export function getStudent(id) {
  return studentsRepo.getById(id);
}

export function createStudent(payload) {
  if (!payload.name?.trim()) throw new Error("Name is required.");
  if (!payload.batchId) throw new Error("Batch is required.");
  if (!payload.joinDate) throw new Error("Join date is required.");
  return studentsRepo.create({
    ...payload,
    name: payload.name.trim(),
  });
}

export function updateStudent(id, patch) {
  return studentsRepo.update(id, patch);
}

export function removeStudent(id) {
  studentsRepo.remove(id);
  // leave historical attendance/payments for reporting integrity
}

export function getStudentDetail(id) {
  const student = studentsRepo.getById(id);
  if (!student) return null;
  const batch = batchesRepo.getById(student.batchId);
  const attendanceRate = getStudentAttendanceRate(id);
  const paymentSummary = studentPaymentSummary(id);
  const recentAttendance = attendanceRepo
    .getAll()
    .filter((a) => a.studentId === id)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10);
  return {
    student,
    batch,
    attendanceRate,
    paymentSummary,
    recentAttendance,
    recentPayments: paymentsRepo
      .getAll()
      .filter((p) => p.studentId === id)
      .sort((a, b) => b.dueDate.localeCompare(a.dueDate))
      .slice(0, 8),
  };
}

export function enrichWithBatch(student) {
  const batch = batchesRepo.getById(student.batchId);
  return { ...student, batchName: batch?.name || "—" };
}
