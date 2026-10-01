import {
  assignmentsRepo,
  submissionsRepo,
} from "../repositories/assignmentsRepo";
import * as studentsRepo from "../repositories/studentsRepo";
import * as batchesRepo from "../repositories/batchesRepo";
import { todayISO } from "../utils/date";
import { logAction } from "./auditService";

export function listAssignments({ batchId } = {}) {
  return assignmentsRepo
    .getAll()
    .filter((a) => !batchId || a.batchId === batchId)
    .sort((a, b) => String(b.dueDate).localeCompare(String(a.dueDate)));
}

export function createAssignment(payload) {
  if (!payload.title?.trim()) throw new Error("Title is required.");
  if (!payload.batchId) throw new Error("Batch is required.");
  if (!payload.dueDate) throw new Error("Due date is required.");
  const item = assignmentsRepo.create({
    title: payload.title.trim(),
    batchId: payload.batchId,
    teacherId: payload.teacherId || "",
    description: payload.description || "",
    dueDate: payload.dueDate,
    status: payload.status || "open",
  });
  logAction("create", "assignment", item.title);
  return item;
}

export function updateAssignment(id, patch) {
  const item = assignmentsRepo.update(id, patch);
  if (item) logAction("update", "assignment", item.title);
  return item;
}

export function removeAssignment(id) {
  const item = assignmentsRepo.getById(id);
  submissionsRepo
    .getAll()
    .filter((s) => s.assignmentId === id)
    .forEach((s) => submissionsRepo.remove(s.id));
  assignmentsRepo.remove(id);
  if (item) logAction("delete", "assignment", item.title);
}

export function listSubmissions(assignmentId) {
  return submissionsRepo.getAll().filter((s) => s.assignmentId === assignmentId);
}

export function setSubmissionStatus({
  assignmentId,
  studentId,
  status,
  note = "",
}) {
  const existing = submissionsRepo
    .getAll()
    .find((s) => s.assignmentId === assignmentId && s.studentId === studentId);
  if (existing) {
    return submissionsRepo.update(existing.id, {
      status,
      note,
      updatedAt: new Date().toISOString(),
    });
  }
  return submissionsRepo.create({
    assignmentId,
    studentId,
    status,
    note,
    updatedAt: new Date().toISOString(),
  });
}

export function getAssignmentBoard(assignmentId) {
  const assignment = assignmentsRepo.getById(assignmentId);
  if (!assignment) return null;
  const batch = batchesRepo.getById(assignment.batchId);
  const students = studentsRepo
    .getAll()
    .filter((s) => s.batchId === assignment.batchId && s.status === "active");
  const subs = listSubmissions(assignmentId);
  const map = Object.fromEntries(subs.map((s) => [s.studentId, s]));
  const today = todayISO();
  const rows = students.map((s) => {
    const sub = map[s.id];
    let status = sub?.status || "pending";
    if (!sub && assignment.dueDate < today) status = "missing";
    return {
      studentId: s.id,
      name: s.name,
      status,
      note: sub?.note || "",
    };
  });
  const counts = rows.reduce(
    (acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    },
    { pending: 0, submitted: 0, checked: 0, missing: 0 },
  );
  return { assignment, batch, rows, counts };
}

export function enrichAssignment(assignment) {
  const batch = batchesRepo.getById(assignment.batchId);
  const board = getAssignmentBoard(assignment.id);
  return {
    ...assignment,
    batchName: batch?.name || "—",
    counts: board?.counts || {},
  };
}
