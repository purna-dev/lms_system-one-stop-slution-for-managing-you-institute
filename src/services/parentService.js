import * as usersRepo from "../repositories/usersRepo";
import * as studentsRepo from "../repositories/studentsRepo";
import * as paymentsRepo from "../repositories/paymentsRepo";
import { getStudentAttendanceRate } from "./attendanceService";
import { getStudentExamHistory } from "./examService";
import { listAssignments, getAssignmentBoard } from "./assignmentService";
import { getCalendarForDate } from "./scheduleService";
import { studentPaymentSummary } from "./paymentService";
import { getVisibleAnnouncements } from "./announcementService";

export function listParents() {
  return usersRepo.getAll().filter((u) => u.role === "parent");
}

export function getLinkedStudents(parentUserId) {
  const parent = usersRepo.getById(parentUserId);
  if (!parent) return [];
  const ids = parent.studentIds || [];
  return ids.map((id) => studentsRepo.getById(id)).filter(Boolean);
}

export function getParentDashboard(parentUserId) {
  const students = getLinkedStudents(parentUserId);
  const cards = students.map((student) => {
    const payment = studentPaymentSummary(student.id);
    const exams = getStudentExamHistory(student.id).slice(0, 5);
    const assignments = listAssignments({ batchId: student.batchId })
      .slice(0, 5)
      .map((a) => {
        const board = getAssignmentBoard(a.id);
        const row = board?.rows.find((r) => r.studentId === student.id);
        return {
          id: a.id,
          title: a.title,
          dueDate: a.dueDate,
          status: row?.status || "pending",
        };
      });
    return {
      student,
      attendanceRate: getStudentAttendanceRate(student.id),
      payment,
      exams,
      assignments,
      recentPayments: paymentsRepo
        .getAll()
        .filter((p) => p.studentId === student.id)
        .sort((a, b) => b.dueDate.localeCompare(a.dueDate))
        .slice(0, 5),
    };
  });

  return {
    students: cards,
    timetable: getCalendarForDate(new Date()),
    announcements: getVisibleAnnouncements({ role: "parent" }),
  };
}
