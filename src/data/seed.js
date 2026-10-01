import { addDays, monthKey, toISODate } from "../utils/date";

const FIRST_NAMES = [
  "Aarav",
  "Vivaan",
  "Aditya",
  "Vihaan",
  "Arjun",
  "Sai",
  "Reyansh",
  "Ayaan",
  "Krishna",
  "Ishaan",
  "Ananya",
  "Diya",
  "Myra",
  "Aadhya",
  "Kiara",
  "Sara",
  "Anika",
  "Navya",
  "Ira",
  "Pari",
  "Rohan",
  "Kabir",
  "Dev",
  "Yash",
  "Neil",
  "Meera",
  "Sneha",
  "Riya",
  "Tanvi",
  "Isha",
];

const LAST_NAMES = [
  "Sharma",
  "Patel",
  "Singh",
  "Reddy",
  "Iyer",
  "Nair",
  "Gupta",
  "Mehta",
  "Joshi",
  "Das",
  "Khan",
  "Verma",
  "Rao",
  "Chopra",
  "Malhotra",
];

function pick(arr, i) {
  return arr[i % arr.length];
}

function seededRand(seed) {
  let t = seed + 0x6d2b79f5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function daysBetween(fromISO, toISO) {
  const a = new Date(`${fromISO}T00:00:00`);
  const b = new Date(`${toISO}T00:00:00`);
  return Math.round((b - a) / 86400000);
}

function eachDate(fromISO, toISO, fn) {
  const total = daysBetween(fromISO, toISO);
  for (let i = 0; i <= total; i += 1) {
    fn(addDays(fromISO, i));
  }
}

function monthList(fromISO, toISO) {
  const months = [];
  const start = new Date(`${fromISO}T00:00:00`);
  const end = new Date(`${toISO}T00:00:00`);
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  while (cursor <= end) {
    months.push(monthKey(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return months;
}

/** Academic demo term: 1 July of current (or previous) year → today */
export function getDemoTermBounds(now = new Date()) {
  const year = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
  const termStart = `${year}-07-01`;
  const today = toISODate(now);
  return { year, termStart, today };
}

export function createSeed() {
  const now = new Date();
  const seededAt = now.toISOString();
  const { year, termStart, today } = getDemoTermBounds(now);
  const holiday = `${year}-08-15`; // Independence Day — no classes

  const users = [
    {
      id: "usr_super",
      name: "Super Admin",
      email: "super@lms.demo",
      password: "super123",
      role: "super_admin",
      phone: "9876500000",
      subjects: "",
      status: "active",
      createdAt: `${year}-06-15T00:00:00.000Z`,
    },
    {
      id: "usr_admin",
      name: "Admin User",
      email: "admin@lms.demo",
      password: "admin123",
      role: "admin",
      phone: "9876500001",
      subjects: "",
      status: "active",
      createdAt: `${year}-06-15T00:00:00.000Z`,
    },
    {
      id: "usr_teacher",
      name: "Priya Sharma",
      email: "teacher@lms.demo",
      password: "teacher123",
      role: "teacher",
      phone: "9876500101",
      subjects: "Science, Physics",
      status: "active",
      createdAt: `${year}-06-20T00:00:00.000Z`,
    },
    {
      id: "usr_teacher2",
      name: "Rahul Mentor",
      email: "rahul@lms.demo",
      password: "teacher123",
      role: "teacher",
      phone: "9876500102",
      subjects: "Mathematics",
      status: "active",
      createdAt: `${year}-06-20T00:00:00.000Z`,
    },
    {
      id: "usr_teacher3",
      name: "Ananya Iyer",
      email: "ananya@lms.demo",
      password: "teacher123",
      role: "teacher",
      phone: "9876500103",
      subjects: "English, Mixed",
      status: "active",
      createdAt: `${year}-06-22T00:00:00.000Z`,
    },
    {
      id: "usr_parent",
      name: "Rakesh Sharma",
      email: "parent@lms.demo",
      password: "parent123",
      role: "parent",
      phone: "9876500201",
      studentIds: ["stu_1", "stu_2"],
      status: "active",
      createdAt: `${year}-07-05T00:00:00.000Z`,
    },
  ];

  const batches = [
    {
      id: "bat_1",
      name: "Class 10 — Science",
      subject: "Science",
      schedule: "Mon/Wed/Fri 6:00 PM",
      feeAmount: 3000,
      teacherId: "usr_teacher",
      status: "active",
      createdAt: `${year}-06-25T00:00:00.000Z`,
    },
    {
      id: "bat_2",
      name: "Class 10 — Maths",
      subject: "Mathematics",
      schedule: "Tue/Thu 5:30 PM",
      feeAmount: 2800,
      teacherId: "usr_teacher2",
      status: "active",
      createdAt: `${year}-06-25T00:00:00.000Z`,
    },
    {
      id: "bat_3",
      name: "Class 12 — Physics",
      subject: "Physics",
      schedule: "Mon/Thu 7:00 PM",
      feeAmount: 3500,
      teacherId: "usr_teacher",
      status: "active",
      createdAt: `${year}-06-28T00:00:00.000Z`,
    },
    {
      id: "bat_4",
      name: "JEE Foundation",
      subject: "Mixed",
      schedule: "Sat/Sun 10:00 AM",
      feeAmount: 4500,
      teacherId: "usr_teacher3",
      status: "active",
      createdAt: `${year}-07-01T00:00:00.000Z`,
    },
    {
      id: "bat_5",
      name: "Class 9 — English",
      subject: "English",
      schedule: "Wed/Fri 4:00 PM",
      feeAmount: 2200,
      teacherId: "usr_teacher3",
      status: "active",
      createdAt: `${year}-07-01T00:00:00.000Z`,
    },
  ];

  const schedules = [
    {
      id: "sch_1",
      batchId: "bat_1",
      teacherId: "usr_teacher",
      days: [1, 3, 5],
      startTime: "18:00",
      endTime: "19:30",
      room: "Lab A",
      status: "active",
      createdAt: `${year}-07-01T00:00:00.000Z`,
    },
    {
      id: "sch_2",
      batchId: "bat_2",
      teacherId: "usr_teacher2",
      days: [2, 4],
      startTime: "17:30",
      endTime: "19:00",
      room: "Room 204",
      status: "active",
      createdAt: `${year}-07-01T00:00:00.000Z`,
    },
    {
      id: "sch_3",
      batchId: "bat_3",
      teacherId: "usr_teacher",
      days: [1, 4],
      startTime: "19:00",
      endTime: "20:30",
      room: "Lab B",
      status: "active",
      createdAt: `${year}-07-01T00:00:00.000Z`,
    },
    {
      id: "sch_4",
      batchId: "bat_4",
      teacherId: "usr_teacher3",
      days: [6, 0],
      startTime: "10:00",
      endTime: "12:00",
      room: "Hall 1",
      status: "active",
      createdAt: `${year}-07-01T00:00:00.000Z`,
    },
    {
      id: "sch_5",
      batchId: "bat_5",
      teacherId: "usr_teacher3",
      days: [3, 5],
      startTime: "16:00",
      endTime: "17:30",
      room: "Room 101",
      status: "active",
      createdAt: `${year}-07-01T00:00:00.000Z`,
    },
    {
      id: "sch_6",
      batchId: "bat_2",
      teacherId: "usr_teacher2",
      days: [1, 2, 3, 4, 5],
      startTime: "11:00",
      endTime: "12:30",
      room: "Room 205",
      status: "active",
      createdAt: `${year}-07-05T00:00:00.000Z`,
    },
    {
      id: "sch_7",
      batchId: "bat_1",
      teacherId: "usr_teacher",
      days: [1, 2, 3, 4, 5],
      startTime: "14:00",
      endTime: "15:30",
      room: "Lab A",
      status: "active",
      createdAt: `${year}-07-05T00:00:00.000Z`,
    },
  ];

  // Staggered admissions through July–August so the term looks organic
  const students = FIRST_NAMES.map((first, i) => {
    const last = pick(LAST_NAMES, i * 3 + 1);
    const batch = batches[i % batches.length];
    const joinOffset = Math.min(i * 2, daysBetween(termStart, today));
    const joinDate = addDays(termStart, joinOffset);
    const inactive = i === 7 || i === 19;
    return {
      id: `stu_${i + 1}`,
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@demo.com`,
      phone: `98765${String(10000 + i).slice(-5)}`,
      batchId: batch.id,
      status: inactive ? "inactive" : "active",
      joinDate,
      guardianName: `${pick(["Rakesh", "Sunita", "Amit", "Kavita", "Suresh"], i)} ${last}`,
      notes:
        i % 6 === 0
          ? "Joined mid-term; catch-up worksheets shared."
          : i % 5 === 0
            ? "Needs extra practice worksheets."
            : "",
      createdAt: `${joinDate}T09:30:00.000Z`,
    };
  });

  // Attendance: every working day from term start → today
  const attendance = [];
  let attN = 1;
  eachDate(termStart, today, (date) => {
    const dow = new Date(`${date}T00:00:00`).getDay();
    if (dow === 0) return; // Sunday off
    if (date === holiday) return;
    batches.forEach((batch, bi) => {
      const batchStudents = students.filter(
        (s) =>
          s.batchId === batch.id &&
          s.status === "active" &&
          s.joinDate <= date,
      );
      batchStudents.forEach((student, si) => {
        const r = seededRand(
          daysBetween(termStart, date) * 100 + bi * 17 + si * 3,
        );
        if (r < 0.07) return; // unmarked day
        let status = "present";
        if (r > 0.93) status = "absent";
        else if (r > 0.86) status = "late";
        attendance.push({
          id: `att_${attN}`,
          studentId: student.id,
          batchId: batch.id,
          date,
          status,
          markedBy: batch.teacherId || "usr_admin",
          createdAt: `${date}T18:15:00.000Z`,
        });
        attN += 1;
      });
    });
  });

  const months = monthList(termStart, today);
  const currentMonth = monthKey(today);
  const payments = [];
  let payN = 1;
  const feePlans = [];

  students.forEach((student, si) => {
    const batch = batches.find((b) => b.id === student.batchId);
    feePlans.push({
      id: `fee_${si + 1}`,
      studentId: student.id,
      batchId: student.batchId,
      amount: batch.feeAmount,
      dueDay: 5,
      startMonth: monthKey(student.joinDate),
      status: student.status === "active" ? "active" : "inactive",
    });

    months.forEach((mk, mi) => {
      const [y, m] = mk.split("-").map(Number);
      const dueDate = `${mk}-05`;
      if (dueDate < student.joinDate) return;

      const r = seededRand(si * 31 + mi * 7 + 11);
      const isCurrent = mk === currentMonth;
      let status = "paid";
      let paidAt = `${dueDate}T10:${String((si * 3) % 50).padStart(2, "0")}:00.000Z`;
      let method = pick(["upi", "cash", "card", "bank"], si + mi);
      let methodMeta = null;

      if (isCurrent && r > 0.5) {
        status = r > 0.78 ? "overdue" : r > 0.64 ? "pending" : "partial";
        paidAt = status === "partial" ? paidAt : null;
      } else if (!isCurrent && r > 0.92) {
        status = "overdue";
        paidAt = null;
      } else if (!isCurrent && r > 0.88) {
        status = "pending";
        paidAt = null;
      }

      const amount =
        status === "partial"
          ? Math.round(batch.feeAmount * 0.5)
          : batch.feeAmount;

      if (status === "paid" || status === "partial") {
        if (method === "card") {
          methodMeta = {
            brand: pick(["Visa", "Mastercard", "RuPay"], si + mi),
            last4: String(1000 + ((si * 17 + mi * 3) % 9000)),
            cardName: student.name,
          };
        } else if (method === "upi") {
          methodMeta = {
            upiId: `${student.name.split(" ")[0].toLowerCase()}@okaxis`,
          };
        } else if (method === "bank") {
          methodMeta = {
            bankName: pick(
              ["HDFC Bank", "ICICI Bank", "SBI", "Axis Bank"],
              si + mi,
            ),
            accountLast4: String(1000 + ((si + mi) % 9000)),
            ifsc: "HDFC0001234",
          };
        } else {
          methodMeta = { cashReceipt: `CASH-${y}${m}-${si + 1}` };
        }
      }

      const monthLabel = new Date(y, m - 1, 1).toLocaleString("en-IN", {
        month: "long",
        year: "numeric",
      });

      payments.push({
        id: `pay_${payN}`,
        studentId: student.id,
        batchId: student.batchId,
        amount,
        method: paidAt ? method : "upi",
        status,
        dueDate,
        paidAt,
        methodMeta,
        note: `${monthLabel} tuition fee`,
        createdAt: `${dueDate}T00:00:00.000Z`,
      });
      payN += 1;
    });
  });

  const exams = [
    {
      id: "exam_1",
      title: "July Unit Test — Science",
      batchId: "bat_1",
      subject: "Science",
      date: `${year}-07-25`,
      maxMarks: 50,
      teacherId: "usr_teacher",
      status: "completed",
      createdAt: `${year}-07-10T00:00:00.000Z`,
    },
    {
      id: "exam_2",
      title: "July Unit Test — Maths",
      batchId: "bat_2",
      subject: "Mathematics",
      date: `${year}-07-28`,
      maxMarks: 50,
      teacherId: "usr_teacher2",
      status: "completed",
      createdAt: `${year}-07-12T00:00:00.000Z`,
    },
    {
      id: "exam_3",
      title: "August Midterm — Physics",
      batchId: "bat_3",
      subject: "Physics",
      date: `${year}-08-22`,
      maxMarks: 100,
      teacherId: "usr_teacher",
      status: "completed",
      createdAt: `${year}-08-01T00:00:00.000Z`,
    },
    {
      id: "exam_4",
      title: "August English Assessment",
      batchId: "bat_5",
      subject: "English",
      date: `${year}-08-28`,
      maxMarks: 40,
      teacherId: "usr_teacher3",
      status: "completed",
      createdAt: `${year}-08-05T00:00:00.000Z`,
    },
    {
      id: "exam_5",
      title: "September Progress Test — Science",
      batchId: "bat_1",
      subject: "Science",
      date: addDays(today, -5) < `${year}-09-01` ? `${year}-09-12` : addDays(today, -5),
      maxMarks: 60,
      teacherId: "usr_teacher",
      status: "completed",
      createdAt: `${year}-09-01T00:00:00.000Z`,
    },
    {
      id: "exam_6",
      title: "Upcoming JEE Mock",
      batchId: "bat_4",
      subject: "Mixed",
      date: addDays(today, 8),
      maxMarks: 120,
      teacherId: "usr_teacher3",
      status: "scheduled",
      createdAt: seededAt,
    },
  ].filter((e) => e.date >= termStart);

  const examMarks = [];
  let markN = 1;
  exams
    .filter((e) => e.status === "completed" && e.date <= today)
    .forEach((exam) => {
      students
        .filter(
          (s) =>
            s.batchId === exam.batchId &&
            s.status === "active" &&
            s.joinDate <= exam.date,
        )
        .forEach((s, i) => {
          const score = Math.round(
            exam.maxMarks * (0.42 + seededRand(i * 17 + markN) * 0.55),
          );
          examMarks.push({
            id: `mark_${markN}`,
            examId: exam.id,
            studentId: s.id,
            marks: Math.min(exam.maxMarks, score),
            remark:
              score / exam.maxMarks > 0.85
                ? "Excellent"
                : score / exam.maxMarks < 0.5
                  ? "Needs improvement"
                  : "",
            createdAt: `${exam.date}T16:00:00.000Z`,
          });
          markN += 1;
        });
    });

  const assignments = [
    {
      id: "asg_1",
      title: "July — Motion worksheet",
      batchId: "bat_1",
      teacherId: "usr_teacher",
      description: "NCERT Ch.1 exercises 1–15. Submit notebook photos.",
      dueDate: `${year}-07-18`,
      status: "closed",
      createdAt: `${year}-07-08T00:00:00.000Z`,
    },
    {
      id: "asg_2",
      title: "July — Algebra drill set",
      batchId: "bat_2",
      teacherId: "usr_teacher2",
      description: "Quadratic equations practice set A & B.",
      dueDate: `${year}-07-22`,
      status: "closed",
      createdAt: `${year}-07-10T00:00:00.000Z`,
    },
    {
      id: "asg_3",
      title: "August — Lab report: Optics",
      batchId: "bat_3",
      teacherId: "usr_teacher",
      description: "Write observations from ray diagram practical.",
      dueDate: `${year}-08-20`,
      status: "closed",
      createdAt: `${year}-08-05T00:00:00.000Z`,
    },
    {
      id: "asg_4",
      title: "August — Essay: Freedom",
      batchId: "bat_5",
      teacherId: "usr_teacher3",
      description: "350-word essay for Independence week.",
      dueDate: `${year}-08-14`,
      status: "closed",
      createdAt: `${year}-08-02T00:00:00.000Z`,
    },
    {
      id: "asg_5",
      title: "September — Chemical reactions sheet",
      batchId: "bat_1",
      teacherId: "usr_teacher",
      description: "Balance equations 1–20; due before unit test.",
      dueDate: addDays(today, 3),
      status: "open",
      createdAt: addDays(today, -10) + "T00:00:00.000Z",
    },
    {
      id: "asg_6",
      title: "Current — JEE mock analysis",
      batchId: "bat_4",
      teacherId: "usr_teacher3",
      description: "Submit error log for last mock paper.",
      dueDate: addDays(today, -2),
      status: "open",
      createdAt: addDays(today, -12) + "T00:00:00.000Z",
    },
  ];

  const submissions = [];
  let subN = 1;
  assignments.forEach((asg) => {
    students
      .filter(
        (s) =>
          s.batchId === asg.batchId &&
          s.status === "active" &&
          s.joinDate <= asg.dueDate,
      )
      .forEach((s, i) => {
        const r = seededRand(i * 13 + subN + asg.id.length);
        let status = "pending";
        if (asg.status === "closed") {
          status = r > 0.2 ? (r > 0.55 ? "checked" : "submitted") : "missing";
        } else if (asg.dueDate < today) {
          status = r > 0.35 ? (r > 0.7 ? "checked" : "submitted") : "missing";
        } else {
          if (r > 0.55) status = "submitted";
          if (r > 0.82) status = "checked";
          if (status === "pending") return;
        }
        submissions.push({
          id: `sub_${subN}`,
          assignmentId: asg.id,
          studentId: s.id,
          status,
          note:
            status === "checked"
              ? "Reviewed — good effort"
              : status === "missing"
                ? "Not received"
                : "",
          updatedAt: `${asg.dueDate}T12:00:00.000Z`,
          createdAt: `${asg.createdAt}`,
        });
        subN += 1;
      });
  });

  const leads = [
    {
      id: "lead_1",
      name: "Vikram Desai",
      phone: "9988776655",
      email: "vikram.desai@demo.com",
      interestedBatchId: "bat_4",
      source: "website",
      status: "follow_up",
      notes: "Enquired in July about JEE weekend batch. Visited campus once.",
      followUpDate: addDays(today, 1),
      createdAt: `${year}-07-08T00:00:00.000Z`,
    },
    {
      id: "lead_2",
      name: "Neha Kapoor",
      phone: "9988776611",
      email: "neha.k@demo.com",
      interestedBatchId: "bat_1",
      source: "walk-in",
      status: "contacted",
      notes: "Walk-in during August orientation week. Wants trial class.",
      followUpDate: addDays(today, 2),
      createdAt: `${year}-08-04T00:00:00.000Z`,
    },
    {
      id: "lead_3",
      name: "Suresh Banerjee",
      phone: "9988776622",
      email: "suresh.b@demo.com",
      interestedBatchId: "bat_2",
      source: "referral",
      status: "new",
      notes: "Referred by parent of stu_3 this month.",
      followUpDate: today,
      createdAt: addDays(today, -4) + "T00:00:00.000Z",
    },
    {
      id: "lead_4",
      name: "Pooja Nair",
      phone: "9988776633",
      email: "pooja.nair@demo.com",
      interestedBatchId: "bat_5",
      source: "social",
      status: "lost",
      notes: "Chose another institute in August.",
      followUpDate: `${year}-08-18`,
      createdAt: `${year}-07-20T00:00:00.000Z`,
    },
  ];

  const announcements = [
    {
      id: "ann_1",
      title: "New academic term begins — 1 July",
      body: "Welcome back! Batches resume from 1 July. Please complete fee enrollment by 5 July.",
      audience: "all",
      batchId: "",
      channel: "in_app",
      pinned: false,
      createdBy: "usr_admin",
      createdByName: "Admin User",
      createdAt: `${year}-06-28T09:00:00.000Z`,
    },
    {
      id: "ann_2",
      title: "Independence Day holiday",
      body: "Institute closed on 15 August. Recorded notes will be shared on the portal.",
      audience: "all",
      batchId: "",
      channel: "in_app",
      pinned: true,
      createdBy: "usr_admin",
      createdByName: "Admin User",
      createdAt: `${year}-08-10T10:00:00.000Z`,
    },
    {
      id: "ann_3",
      title: "September fee reminder",
      body: "Please clear pending September fees by the 5th to avoid late charges.",
      audience: "parents",
      batchId: "",
      channel: "whatsapp",
      pinned: false,
      createdBy: "usr_admin",
      createdByName: "Admin User",
      createdAt: `${year}-09-01T08:30:00.000Z`,
    },
    {
      id: "ann_4",
      title: "Staff meeting — syllabus sync",
      body: "All teachers: Friday 5 PM in Hall 1 for July–September syllabus review.",
      audience: "staff",
      batchId: "",
      channel: "in_app",
      pinned: false,
      createdBy: "usr_super",
      createdByName: "Super Admin",
      createdAt: addDays(today, -3) + "T11:00:00.000Z",
    },
  ];

  const auditLog = [
    {
      id: "aud_1",
      action: "seed",
      entity: "system",
      details: `Demo term ${termStart} → ${today} initialized`,
      actorId: "system",
      actorName: "System",
      at: seededAt,
      createdAt: seededAt,
    },
    {
      id: "aud_2",
      action: "create",
      entity: "batch",
      details: "Opened Class 10 — Science for July term",
      actorId: "usr_admin",
      actorName: "Admin User",
      at: `${year}-06-25T10:00:00.000Z`,
      createdAt: `${year}-06-25T10:00:00.000Z`,
    },
    {
      id: "aud_3",
      action: "create",
      entity: "exam",
      details: "July Unit Test — Science scheduled",
      actorId: "usr_teacher",
      actorName: "Priya Sharma",
      at: `${year}-07-10T12:00:00.000Z`,
      createdAt: `${year}-07-10T12:00:00.000Z`,
    },
  ];

  return {
    meta: {
      version: 4,
      termStart,
      termLabel: `July ${year} – present`,
      seededAt,
      updatedAt: seededAt,
    },
    users,
    batches,
    students,
    attendance,
    payments,
    feePlans,
    schedules,
    exams,
    examMarks,
    assignments,
    submissions,
    leads,
    announcements,
    auditLog,
  };
}
