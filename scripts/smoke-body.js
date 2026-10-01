export async function runSmoke() {
  const fails = [];
  function assert(cond, msg) {
    if (!cond) fails.push(msg);
    else console.log("OK", msg);
  }

  const { bootstrapStorage, resetDemoData } = await import(
    "../src/services/bootstrapService.js"
  );
  const auth = await import("../src/services/authService.js");
  const students = await import("../src/services/studentService.js");
  const batches = await import("../src/services/batchService.js");
  const attendance = await import("../src/services/attendanceService.js");
  const payments = await import("../src/services/paymentService.js");
  const dashboard = await import("../src/services/dashboardService.js");
  const schedule = await import("../src/services/scheduleService.js");
  const timetable = await import("../src/services/timetableService.js");
  const exams = await import("../src/services/examService.js");
  const assignments = await import("../src/services/assignmentService.js");
  const leads = await import("../src/services/leadService.js");
  const notices = await import("../src/services/announcementService.js");
  const reports = await import("../src/services/reportService.js");
  const teachers = await import("../src/services/teacherService.js");
  const parents = await import("../src/services/parentService.js");
  const audit = await import("../src/services/auditService.js");
  const { read } = await import("../src/repositories/storage.js");

  bootstrapStorage();
  const meta = read("meta");
  assert(meta?.version === 4, "schema v4 seeded");
  assert(
    typeof meta?.termStart === "string" && meta.termStart.endsWith("-07-01"),
    `term starts July (${meta?.termStart})`,
  );

  const seedKeys = [
    "users",
    "batches",
    "students",
    "attendance",
    "payments",
    "schedules",
    "exams",
    "examMarks",
    "assignments",
    "submissions",
    "leads",
    "announcements",
    "auditLog",
  ];
  for (const k of seedKeys) {
    const v = read(k, []);
    assert(Array.isArray(v) && v.length > 0, `${k} has data (${v.length})`);
  }

  let r = auth.login("bad", "bad");
  assert(!r.ok, "bad login rejected");
  r = auth.login("super@lms.demo", "super123");
  assert(r.ok && r.session.role === "super_admin", "super admin login");
  assert(auth.isSuperAdmin() && auth.isAdmin(), "super admin flags");
  auth.logout();

  r = auth.login("teacher@lms.demo", "teacher123");
  assert(r.ok && r.session.role === "teacher", "teacher login");
  assert(!auth.isAdmin(), "teacher is not admin");
  auth.logout();

  r = auth.login("parent@lms.demo", "parent123");
  assert(r.ok && r.session.role === "parent", "parent login");
  const pd = parents.getParentDashboard(r.session.userId);
  assert(pd.students.length >= 1, "parent has linked students");
  assert(Array.isArray(pd.timetable), "parent timetable");
  assert(Array.isArray(pd.announcements), "parent announcements");
  auth.logout();

  auth.login("admin@lms.demo", "admin123");
  assert(students.listStudents({}).length >= 20, "students list");
  assert(batches.listBatches().length >= 4, "batches list");

  const stats = dashboard.getDashboardStats();
  assert(stats.totalStudents > 0, "dashboard students");
  assert(typeof stats.feesCollected === "number", "dashboard fees");
  assert(dashboard.getAttendanceTrend(7).length === 7, "attendance trend");
  assert(dashboard.getRevenueByMonth(3).length === 3, "revenue months");
  assert(dashboard.getPaymentStatusBreakdown().length === 4, "payment pie");

  const bat = batches.listBatches()[0];
  const stu = attendance.getStudentsForBatch(bat.id);
  assert(stu.length > 0, "batch students for attendance");
  attendance.markAttendance({
    studentId: stu[0].id,
    batchId: bat.id,
    date: "2099-01-01",
    status: "present",
    markedBy: "usr_admin",
  });
  assert(
    attendance.listAttendance({
      studentId: stu[0].id,
      from: "2099-01-01",
      to: "2099-01-01",
    }).length === 1,
    "attendance upsert",
  );

  const pay = payments.createPayment({
    studentId: stu[0].id,
    batchId: bat.id,
    amount: 100,
    method: "card",
    status: "pending",
    dueDate: "2099-01-05",
    note: "test",
    methodMeta: { last4: "4242" },
  });
  assert(pay.id && pay.methodMeta?.last4 === "4242", "payment with methodMeta");
  payments.markPaid(pay.id, { method: "card" });
  assert(
    payments
      .listPayments({ studentId: stu[0].id })
      .some((p) => p.id === pay.id && p.status === "paid"),
    "payment marked paid",
  );

  assert(
    Array.isArray(schedule.getCalendarForDate(new Date())),
    "calendar today",
  );
  assert(timetable.getTimetableMatrix().length === 7, "timetable matrix");

  const conflictPayload = {
    batchId: bat.id,
    teacherId: "usr_teacher",
    days: [1, 2, 3, 4, 5],
    startTime: "11:00",
    endTime: "12:00",
    room: "Room 205",
    status: "active",
  };
  assert(
    timetable.detectConflicts(conflictPayload).length > 0,
    "conflict detection finds clash",
  );
  try {
    timetable.saveTimetableSlot(conflictPayload, { force: false });
    fails.push("conflict should throw without force");
  } catch (e) {
    assert(!!e.message, `conflict throws: ${e.message}`);
  }
  const saved = timetable.saveTimetableSlot(
    {
      ...conflictPayload,
      startTime: "21:00",
      endTime: "22:00",
      room: "Z-99",
    },
    { force: false },
  );
  assert(!!saved.item?.id, "timetable slot saved");

  const examList = exams.listExams();
  assert(examList.length >= 2, "exams seeded");
  const detail = exams.getExamDetail(examList[0].id);
  assert(detail && detail.rows.length > 0, "exam gradebook rows");
  exams.saveGradebook(examList[0].id, [
    { studentId: detail.rows[0].studentId, marks: 10, remark: "ok" },
  ]);
  assert(
    exams
      .listMarks(examList[0].id)
      .some((m) => m.studentId === detail.rows[0].studentId),
    "marks saved",
  );

  const asg = assignments.listAssignments();
  assert(asg.length >= 1, "assignments");
  const board = assignments.getAssignmentBoard(asg[0].id);
  assert(board && board.rows.length > 0, "assignment board");
  assignments.setSubmissionStatus({
    assignmentId: asg[0].id,
    studentId: board.rows[0].studentId,
    status: "checked",
  });
  assert(
    assignments
      .getAssignmentBoard(asg[0].id)
      .rows.find((row) => row.studentId === board.rows[0].studentId).status ===
      "checked",
    "submission updated",
  );

  const lead = leads.createLead({
    name: "Test Lead",
    phone: "9000000000",
    interestedBatchId: bat.id,
  });
  assert(lead.id, "lead created");
  const converted = leads.convertLeadToStudent(lead.id, { batchId: bat.id });
  assert(converted.id && students.getStudent(converted.id), "lead converted");

  const ann = notices.createAnnouncement({
    title: "T",
    body: "B",
    audience: "all",
  });
  assert(!!ann.id, "announcement created");
  assert(
    notices.listAnnouncements().some((a) => a.id === ann.id),
    "announcement listed",
  );

  const tsum = teachers.listTeacherSummaries();
  assert(
    tsum.length >= 2 && tsum[0].stats.activeStudentCount >= 0,
    "teacher summaries",
  );
  const enrolled = teachers.enrollTeacher({
    name: "New T",
    email: "newt@lms.demo",
    password: "teacher123",
    subjects: "Chem",
  });
  assert(enrolled.role === "teacher", "teacher enrolled");

  assert(reports.buildAttendanceReport().length > 0, "attendance report");
  assert(reports.buildFeesReport().length > 0, "fees report");
  assert(reports.buildTeacherLoadReport().length > 0, "teacher report");
  assert(reports.buildBatchHealthReport().length > 0, "batch health");
  assert(audit.listAuditLogs(5).length > 0, "audit log");

  resetDemoData({ keepSession: true });
  assert(read("meta")?.version === 4, "reset reseeds v4");
  assert(read("students", []).length > 0, "students after reset");
  const att = read("attendance", []);
  assert(
    att.length > 0 && att.every((a) => a.date >= meta.termStart),
    "attendance dates from July term",
  );
  const pays = read("payments", []);
  assert(
    pays.length > 0 && pays.every((p) => p.dueDate >= meta.termStart),
    "payment dues from July term",
  );

  console.log("\nFAILS", fails.length);
  fails.forEach((f) => console.error("FAIL:", f));
  return fails.length ? 1 : 0;
}
