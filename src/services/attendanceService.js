import * as attendanceRepo from "../repositories/attendanceRepo";
import * as studentsRepo from "../repositories/studentsRepo";
import { inRange } from "../utils/date";

export function listAttendance({ batchId, from, to, studentId } = {}) {
  return attendanceRepo.getAll().filter((a) => {
    if (batchId && a.batchId !== batchId) return false;
    if (studentId && a.studentId !== studentId) return false;
    if (!inRange(a.date, from, to)) return false;
    return true;
  });
}

export function getMarksForBatchDate(batchId, date) {
  return attendanceRepo
    .getAll()
    .filter((a) => a.batchId === batchId && a.date === date);
}

export function markAttendance({
  studentId,
  batchId,
  date,
  status,
  markedBy,
}) {
  return attendanceRepo.upsert({
    studentId,
    batchId,
    date,
    status,
    markedBy,
  });
}

export function markBatchAttendance({
  batchId,
  date,
  marks,
  markedBy,
}) {
  return marks.map((m) =>
    markAttendance({
      studentId: m.studentId,
      batchId,
      date,
      status: m.status,
      markedBy,
    }),
  );
}

export function computeAttendanceRate(records) {
  if (!records.length) return null;
  const presentish = records.filter(
    (r) => r.status === "present" || r.status === "late",
  ).length;
  return Math.round((presentish / records.length) * 1000) / 10;
}

export function getStudentAttendanceRate(studentId, { from, to } = {}) {
  const records = listAttendance({ studentId, from, to });
  return computeAttendanceRate(records);
}

export function getCohortAttendanceRate({ batchId, from, to } = {}) {
  const records = listAttendance({ batchId, from, to });
  return computeAttendanceRate(records);
}

export function getStudentsForBatch(batchId) {
  return studentsRepo
    .getAll()
    .filter((s) => s.batchId === batchId && s.status === "active");
}
