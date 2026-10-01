import { createSeed } from "../data/seed";
import * as attendanceRepo from "../repositories/attendanceRepo";
import * as batchesRepo from "../repositories/batchesRepo";
import * as feePlansRepo from "../repositories/feePlansRepo";
import * as paymentsRepo from "../repositories/paymentsRepo";
import * as schedulesRepo from "../repositories/schedulesRepo";
import * as studentsRepo from "../repositories/studentsRepo";
import { examsRepo, examMarksRepo } from "../repositories/examsRepo";
import {
  assignmentsRepo,
  submissionsRepo,
} from "../repositories/assignmentsRepo";
import { leadsRepo } from "../repositories/leadsRepo";
import { announcementsRepo } from "../repositories/announcementsRepo";
import { auditRepo } from "../repositories/auditRepo";
import { clearNamespace, read, write } from "../repositories/storage";
import * as usersRepo from "../repositories/usersRepo";
import * as sessionRepo from "../repositories/sessionRepo";
import { applyTheme, getTheme } from "./themeService";

const SCHEMA_VERSION = 4;

export function applySeed(seed, { keepSession = false } = {}) {
  const session = keepSession ? sessionRepo.get() : null;
  const theme = getTheme();
  usersRepo.replaceAll(seed.users);
  batchesRepo.replaceAll(seed.batches);
  studentsRepo.replaceAll(seed.students);
  attendanceRepo.replaceAll(seed.attendance);
  paymentsRepo.replaceAll(seed.payments);
  feePlansRepo.replaceAll(seed.feePlans || []);
  schedulesRepo.replaceAll(seed.schedules || []);
  examsRepo.replaceAll(seed.exams || []);
  examMarksRepo.replaceAll(seed.examMarks || []);
  assignmentsRepo.replaceAll(seed.assignments || []);
  submissionsRepo.replaceAll(seed.submissions || []);
  leadsRepo.replaceAll(seed.leads || []);
  announcementsRepo.replaceAll(seed.announcements || []);
  auditRepo.replaceAll(seed.auditLog || []);
  write("meta", seed.meta);
  write("theme", theme);
  applyTheme(theme);
  if (keepSession && session) {
    const stillValid = seed.users.some((u) => u.id === session.userId);
    if (stillValid) sessionRepo.set(session);
    else sessionRepo.clear();
  } else if (!keepSession) {
    sessionRepo.clear();
  }
}

export function bootstrapStorage() {
  const meta = read("meta", null);
  if (!meta || meta.version !== SCHEMA_VERSION) {
    applySeed(createSeed(), { keepSession: false });
  }
}

export function resetDemoData({ keepSession = true } = {}) {
  const session = keepSession ? sessionRepo.get() : null;
  const theme = getTheme();
  clearNamespace();
  applySeed(createSeed(), { keepSession: false });
  write("theme", theme);
  applyTheme(theme);
  if (session) {
    const users = usersRepo.getAll();
    const stillValid = users.some((u) => u.id === session.userId);
    if (stillValid) sessionRepo.set(session);
  }
}
