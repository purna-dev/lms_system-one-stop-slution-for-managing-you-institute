import { useEffect, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import {
  CalendarDays,
  Clock3,
  MapPin,
  UserRound,
  Users,
} from "lucide-react";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import { useStorageVersion } from "../hooks/useRepo";
import {
  getFullCalendarEvents,
  getLiveClasses,
  getUpcomingToday,
} from "../services/scheduleService";
import { formatDisplayDate } from "../utils/date";
import styles from "../features/calendar/calendar.module.css";

export default function CalendarPage() {
  const version = useStorageVersion();
  const [tick, setTick] = useState(0);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 30000);
    return () => window.clearInterval(id);
  }, []);

  const now = useMemo(() => new Date(), [version, tick]);
  const live = useMemo(() => getLiveClasses(now), [now]);
  const upcoming = useMemo(() => getUpcomingToday(now), [now]);
  const events = useMemo(() => getFullCalendarEvents(now), [now]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Class calendar</h1>
          <p>
            Professional timetable for {formatDisplayDate(
              now.toISOString().slice(0, 10),
            )}{" "}
            — month, week, day, and agenda views.
          </p>
        </div>
      </div>

      <div className={styles.liveBanner}>
        {live.length === 0 ? (
          <Card title="No class live right now">
            <p className="muted">
              {upcoming.length
                ? `Next up: ${upcoming[0].batchName} with ${upcoming[0].teacherName} at ${upcoming[0].startLabel}.`
                : "No more classes scheduled for today."}
            </p>
          </Card>
        ) : (
          live.map((c) => (
            <div key={c.id} className={styles.liveCard}>
              <div>
                <div className={styles.livePulse}>
                  <span className={styles.dot} />
                  Class in progress
                </div>
                <div className={styles.classTitle}>{c.batchName}</div>
                <div className={styles.metaRow}>
                  <span>
                    <UserRound size={14} /> {c.teacherName}
                  </span>
                  <span>
                    <Clock3 size={14} /> {c.startLabel} – {c.endLabel}
                  </span>
                  <span>
                    <MapPin size={14} /> {c.room || "—"}
                  </span>
                  <span>
                    <Users size={14} /> {c.enrolledStudents} students enrolled
                  </span>
                </div>
              </div>
              <Badge status="active">{c.subject || "Class"}</Badge>
            </div>
          ))
        )}
      </div>

      <div className={styles.layout}>
        <Card
          title="Institute calendar"
          subtitle="Powered by FullCalendar — click a class for details"
          actions={<CalendarDays size={18} color="var(--accent)" />}
          className={styles.calendarCard}
        >
          <div className={styles.fcWrap}>
            <FullCalendar
              plugins={[
                dayGridPlugin,
                timeGridPlugin,
                listPlugin,
                interactionPlugin,
              ]}
              initialView="timeGridWeek"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
              }}
              buttonText={{
                today: "Today",
                month: "Month",
                week: "Week",
                day: "Day",
                list: "Agenda",
              }}
              height="auto"
              expandRows
              stickyHeaderDates
              nowIndicator
              allDaySlot={false}
              slotMinTime="07:00:00"
              slotMaxTime="22:00:00"
              slotDuration="00:30:00"
              weekends
              firstDay={1}
              events={events}
              eventDisplay="block"
              dayMaxEvents={3}
              eventClick={(info) => {
                const p = info.event.extendedProps;
                setSelected({
                  title: info.event.title,
                  teacherName: p.teacherName,
                  room: p.room,
                  enrolledStudents: p.enrolledStudents,
                  subject: p.subject,
                  startLabel: p.startLabel,
                  endLabel: p.endLabel,
                  liveState: p.liveState,
                });
              }}
              eventTimeFormat={{
                hour: "numeric",
                minute: "2-digit",
                meridiem: "short",
              }}
            />
          </div>
        </Card>

        <Card
          title="Class details"
          subtitle={selected ? selected.subject || "Scheduled class" : "Select a slot"}
        >
          {!selected ? (
            <div className="empty-state">
              Click any class on the calendar to see teacher, room, and enrollment.
            </div>
          ) : (
            <div className={styles.detail}>
              <div className={styles.classTitle}>{selected.title}</div>
              <div className={styles.metaRow}>
                <span>
                  <UserRound size={14} /> {selected.teacherName}
                </span>
                <span>
                  <Clock3 size={14} /> {selected.startLabel} – {selected.endLabel}
                </span>
                <span>
                  <MapPin size={14} /> {selected.room || "—"}
                </span>
                <span>
                  <Users size={14} /> {selected.enrolledStudents} enrolled
                </span>
              </div>
              {selected.liveState === "live" ? (
                <span className={`${styles.state} ${styles.stateLive}`}>Live now</span>
              ) : selected.liveState === "upcoming" ? (
                <span className={`${styles.state} ${styles.stateUpcoming}`}>
                  Upcoming today
                </span>
              ) : null}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
