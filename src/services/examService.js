import { examsRepo, examMarksRepo } from "../repositories/examsRepo";
import * as studentsRepo from "../repositories/studentsRepo";
import * as batchesRepo from "../repositories/batchesRepo";
import { logAction } from "./auditService";

export function listExams() {
  return examsRepo
    .getAll()
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

export function getExam(id) {
  return examsRepo.getById(id);
}

export function createExam(payload) {
  if (!payload.title?.trim()) throw new Error("Exam title is required.");
  if (!payload.batchId) throw new Error("Batch is required.");
  if (!payload.date) throw new Error("Exam date is required.");
  const exam = examsRepo.create({
    title: payload.title.trim(),
    batchId: payload.batchId,
    subject: payload.subject || "",
    date: payload.date,
    maxMarks: Number(payload.maxMarks) || 100,
    teacherId: payload.teacherId || "",
    status: payload.status || "scheduled",
  });
  logAction("create", "exam", exam.title);
  return exam;
}

export function updateExam(id, patch) {
  const exam = examsRepo.update(id, patch);
  if (exam) logAction("update", "exam", exam.title);
  return exam;
}

export function removeExam(id) {
  const exam = examsRepo.getById(id);
  examMarksRepo
    .getAll()
    .filter((m) => m.examId === id)
    .forEach((m) => examMarksRepo.remove(m.id));
  examsRepo.remove(id);
  if (exam) logAction("delete", "exam", exam.title);
}

export function listMarks(examId) {
  return examMarksRepo.getAll().filter((m) => m.examId === examId);
}

export function upsertMark({ examId, studentId, marks, remark }) {
  const existing = examMarksRepo
    .getAll()
    .find((m) => m.examId === examId && m.studentId === studentId);
  if (existing) {
    return examMarksRepo.update(existing.id, {
      marks: Number(marks),
      remark: remark || "",
    });
  }
  return examMarksRepo.create({
    examId,
    studentId,
    marks: Number(marks),
    remark: remark || "",
  });
}

export function saveGradebook(examId, rows) {
  rows.forEach((row) => {
    if (row.marks === "" || row.marks == null) return;
    upsertMark({
      examId,
      studentId: row.studentId,
      marks: row.marks,
      remark: row.remark,
    });
  });
  logAction("grade", "exam", examId);
}

export function getExamDetail(examId) {
  const exam = examsRepo.getById(examId);
  if (!exam) return null;
  const batch = batchesRepo.getById(exam.batchId);
  const students = studentsRepo
    .getAll()
    .filter((s) => s.batchId === exam.batchId && s.status === "active");
  const marks = listMarks(examId);
  const markMap = Object.fromEntries(marks.map((m) => [m.studentId, m]));
  const rows = students
    .map((s) => {
      const mark = markMap[s.id];
      const scored = mark ? Number(mark.marks) : null;
      const pct =
        scored == null || !exam.maxMarks
          ? null
          : Math.round((scored / exam.maxMarks) * 1000) / 10;
      return {
        studentId: s.id,
        name: s.name,
        marks: scored,
        remark: mark?.remark || "",
        percentage: pct,
      };
    })
    .sort((a, b) => (b.marks ?? -1) - (a.marks ?? -1));

  const scored = rows.filter((r) => r.marks != null);
  const average =
    scored.length === 0
      ? null
      : Math.round(
          (scored.reduce((sum, r) => sum + r.marks, 0) / scored.length) * 10,
        ) / 10;

  return {
    exam,
    batch,
    rows,
    average,
    gradedCount: scored.length,
    studentCount: students.length,
  };
}

export function getStudentExamHistory(studentId) {
  const marks = examMarksRepo.getAll().filter((m) => m.studentId === studentId);
  return marks
    .map((m) => {
      const exam = examsRepo.getById(m.examId);
      if (!exam) return null;
      return {
        ...m,
        examTitle: exam.title,
        date: exam.date,
        maxMarks: exam.maxMarks,
        percentage: Math.round((m.marks / exam.maxMarks) * 1000) / 10,
      };
    })
    .filter(Boolean)
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));
}
