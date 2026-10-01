import * as usersRepo from "../repositories/usersRepo";
import * as batchesRepo from "../repositories/batchesRepo";
import * as studentsRepo from "../repositories/studentsRepo";
import * as attendanceRepo from "../repositories/attendanceRepo";
import * as schedulesRepo from "../repositories/schedulesRepo";
import { computeAttendanceRate } from "./attendanceService";
import { todayISO } from "../utils/date";

export function listTeachers() {
  return usersRepo
    .getAll()
    .filter((u) => u.role === "teacher")
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getTeacher(id) {
  const user = usersRepo.getById(id);
  if (!user || user.role !== "teacher") return null;
  return user;
}

export function enrollTeacher(payload) {
  if (!payload.name?.trim()) throw new Error("Name is required.");
  if (!payload.email?.trim()) throw new Error("Email is required.");
  if (!payload.password || payload.password.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }
  const existing = usersRepo.getByEmail(payload.email);
  if (existing) throw new Error("A user with this email already exists.");
  return usersRepo.create({
    name: payload.name.trim(),
    email: payload.email.trim().toLowerCase(),
    password: payload.password,
    role: "teacher",
    phone: payload.phone || "",
    subjects: payload.subjects || "",
    status: "active",
  });
}

export function updateTeacher(id, patch) {
  const teacher = getTeacher(id);
  if (!teacher) throw new Error("Teacher not found.");
  if (patch.email) {
    const other = usersRepo.getByEmail(patch.email);
    if (other && other.id !== id) {
      throw new Error("Another user already uses this email.");
    }
  }
  return usersRepo.update(id, {
    ...patch,
    role: "teacher",
    email: patch.email ? patch.email.trim().toLowerCase() : teacher.email,
  });
}

export function deactivateTeacher(id) {
  return updateTeacher(id, { status: "inactive" });
}

export function removeTeacher(id) {
  const linkedBatches = batchesRepo.getAll().filter((b) => b.teacherId === id);
  if (linkedBatches.length) {
    throw new Error(
      "Reassign this teacher's batches before deleting the account.",
    );
  }
  const linkedSchedules = schedulesRepo
    .getAll()
    .filter((s) => s.teacherId === id);
  if (linkedSchedules.length) {
    throw new Error("Remove or reassign class schedules before deleting.");
  }
  usersRepo.remove(id);
}

export function getTeacherStats(teacherId) {
  const batches = batchesRepo
    .getAll()
    .filter((b) => b.teacherId === teacherId && b.status === "active");
  const batchIds = new Set(batches.map((b) => b.id));
  const students = studentsRepo
    .getAll()
    .filter((s) => batchIds.has(s.batchId));
  const activeStudents = students.filter((s) => s.status === "active");
  const today = todayISO();
  const todayMarks = attendanceRepo
    .getAll()
    .filter((a) => batchIds.has(a.batchId) && a.date === today);
  const presentToday = todayMarks.filter(
    (a) => a.status === "present" || a.status === "late",
  ).length;
  const allMarks = attendanceRepo
    .getAll()
    .filter((a) => batchIds.has(a.batchId));
  const attendanceRate = computeAttendanceRate(allMarks);
  const schedules = schedulesRepo
    .getAll()
    .filter((s) => s.teacherId === teacherId && s.status === "active");

  return {
    batchCount: batches.length,
    batches,
    studentCount: students.length,
    activeStudentCount: activeStudents.length,
    presentToday,
    markedToday: todayMarks.length,
    attendanceRate,
    scheduleCount: schedules.length,
  };
}

export function listTeacherSummaries() {
  return listTeachers().map((teacher) => ({
    teacher,
    stats: getTeacherStats(teacher.id),
  }));
}
