import {
  createSchedule,
  enrichSchedule,
  listSchedules,
  removeSchedule,
  updateSchedule,
  DAY_NAMES,
} from "./scheduleService";
import { logAction } from "./auditService";

function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

function toMin(t) {
  const [h, m] = String(t).split(":").map(Number);
  return h * 60 + m;
}

export function detectConflicts(candidate, { ignoreId } = {}) {
  const days = candidate.days || [];
  const conflicts = [];
  listSchedules()
    .filter((s) => s.id !== ignoreId && s.status === "active")
    .forEach((existing) => {
      const sharedDays = days.filter((d) => (existing.days || []).includes(d));
      if (!sharedDays.length) return;
      if (
        !overlaps(
          toMin(candidate.startTime),
          toMin(candidate.endTime),
          toMin(existing.startTime),
          toMin(existing.endTime),
        )
      ) {
        return;
      }
      if (
        candidate.teacherId &&
        candidate.teacherId === existing.teacherId
      ) {
        conflicts.push({
          type: "teacher",
          withId: existing.id,
          message: `Teacher already booked on ${sharedDays.map((d) => DAY_NAMES[d]).join("/")} ${existing.startTime}-${existing.endTime}`,
        });
      }
      if (
        candidate.room &&
        existing.room &&
        candidate.room.toLowerCase() === existing.room.toLowerCase()
      ) {
        conflicts.push({
          type: "room",
          withId: existing.id,
          message: `Room ${candidate.room} clash on ${sharedDays.map((d) => DAY_NAMES[d]).join("/")}`,
        });
      }
    });
  return conflicts;
}

export function saveTimetableSlot(payload, { id, force = false } = {}) {
  const conflicts = detectConflicts(payload, { ignoreId: id });
  if (conflicts.length && !force) {
    const err = new Error(conflicts[0].message);
    err.conflicts = conflicts;
    throw err;
  }
  const item = id
    ? updateSchedule(id, payload)
    : createSchedule(payload);
  logAction(id ? "update" : "create", "schedule", `${item.batchId} ${item.startTime}`);
  return { item, conflicts };
}

export function deleteTimetableSlot(id) {
  removeSchedule(id);
  logAction("delete", "schedule", id);
}

export function getTimetableMatrix() {
  const slots = listSchedules()
    .filter((s) => s.status === "active")
    .map((s) => enrichSchedule(s));
  return DAY_NAMES.map((name, day) => ({
    day,
    name,
    slots: slots
      .filter((s) => (s.days || []).includes(day))
      .sort((a, b) => a.startTime.localeCompare(b.startTime)),
  }));
}

export { DAY_NAMES };
