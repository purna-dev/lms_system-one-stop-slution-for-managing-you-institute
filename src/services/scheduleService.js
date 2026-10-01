import * as schedulesRepo from "../repositories/schedulesRepo";
import * as batchesRepo from "../repositories/batchesRepo";
import * as usersRepo from "../repositories/usersRepo";
import * as studentsRepo from "../repositories/studentsRepo";
import { toISODate } from "../utils/date";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function listSchedules() {
  return schedulesRepo.getAll();
}

export function createSchedule(payload) {
  if (!payload.batchId) throw new Error("Batch is required.");
  if (!payload.teacherId) throw new Error("Teacher is required.");
  if (!payload.startTime || !payload.endTime) {
    throw new Error("Start and end time are required.");
  }
  return schedulesRepo.create(payload);
}

export function updateSchedule(id, patch) {
  return schedulesRepo.update(id, patch);
}

export function removeSchedule(id) {
  schedulesRepo.remove(id);
}

function timeToMinutes(hhmm) {
  const [h, m] = String(hhmm || "00:00").split(":").map(Number);
  return h * 60 + m;
}

function formatTimeLabel(hhmm) {
  const [h, m] = String(hhmm || "00:00").split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function enrichSchedule(schedule, at = new Date()) {
  const batch = batchesRepo.getById(schedule.batchId);
  const teacher = usersRepo.getById(schedule.teacherId);
  const enrolled = studentsRepo
    .getAll()
    .filter((s) => s.batchId === schedule.batchId && s.status === "active").length;
  const day = at.getDay();
  const minutes = at.getHours() * 60 + at.getMinutes();
  const start = timeToMinutes(schedule.startTime);
  const end = timeToMinutes(schedule.endTime);
  const isToday = (schedule.days || []).includes(day);
  let liveState = "scheduled";
  if (isToday && minutes >= start && minutes < end) liveState = "live";
  else if (isToday && minutes < start) liveState = "upcoming";
  else if (isToday && minutes >= end) liveState = "completed";

  return {
    ...schedule,
    batchName: batch?.name || "Unknown batch",
    subject: batch?.subject || "",
    teacherName: teacher?.name || "Unassigned",
    teacherEmail: teacher?.email || "",
    enrolledStudents: enrolled,
    dayLabels: (schedule.days || []).map((d) => DAY_NAMES[d]).join(", "),
    startLabel: formatTimeLabel(schedule.startTime),
    endLabel: formatTimeLabel(schedule.endTime),
    isToday,
    liveState,
  };
}

export function getCalendarForDate(date = new Date()) {
  const day = date.getDay();
  const dateISO = toISODate(date);
  return schedulesRepo
    .getAll()
    .filter((s) => s.status === "active" && (s.days || []).includes(day))
    .map((s) => enrichSchedule(s, date))
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .map((s) => ({ ...s, date: dateISO }));
}

export function getLiveClasses(at = new Date()) {
  return getCalendarForDate(at).filter((s) => s.liveState === "live");
}

export function getUpcomingToday(at = new Date()) {
  return getCalendarForDate(at).filter((s) => s.liveState === "upcoming");
}

export function getWeekOverview(from = new Date()) {
  const start = new Date(from);
  start.setHours(12, 0, 0, 0);
  // align to Sunday of current week
  start.setDate(start.getDate() - start.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const classes = getCalendarForDate(d);
    return {
      date: toISODate(d),
      dayName: DAY_NAMES[d.getDay()],
      dayNum: d.getDate(),
      isToday: toISODate(d) === toISODate(from),
      classes,
      liveCount: classes.filter((c) => c.liveState === "live").length,
    };
  });
}

/** Recurring weekly events for FullCalendar (daysOfWeek + start/endTime). */
export function getFullCalendarEvents(at = new Date()) {
  const palette = ["#1f4068", "#e43f5a", "#0a192f", "#c99712", "#314866"];
  return schedulesRepo
    .getAll()
    .filter((s) => s.status === "active" && (s.days || []).length)
    .map((s, i) => {
      const enriched = enrichSchedule(s, at);
      const color = palette[i % palette.length];
      return {
        id: s.id,
        title: `${enriched.batchName}`,
        daysOfWeek: [...(s.days || [])],
        startTime: `${s.startTime}:00`,
        endTime: `${s.endTime}:00`,
        backgroundColor: color,
        borderColor: color,
        textColor: color === "#c99712" ? "#0a192f" : "#f5f7fa",
        extendedProps: {
          teacherName: enriched.teacherName,
          room: enriched.room || "",
          enrolledStudents: enriched.enrolledStudents,
          subject: enriched.subject,
          startLabel: enriched.startLabel,
          endLabel: enriched.endLabel,
          liveState: enriched.liveState,
        },
      };
    });
}

export { DAY_NAMES };
