import { useMemo } from "react";
import {
  CalendarCheck2,
  IndianRupee,
  Users,
  Wallet,
} from "lucide-react";
import Card from "../components/ui/Card";
import Kpi from "../components/ui/Kpi";
import AttendanceTrendChart from "../components/charts/AttendanceTrendChart";
import RevenueByMonthChart from "../components/charts/RevenueByMonthChart";
import PaymentStatusChart from "../components/charts/PaymentStatusChart";
import StudentsPerBatchChart from "../components/charts/StudentsPerBatchChart";
import { useStorageVersion } from "../hooks/useRepo";
import {
  getAttendanceTrend,
  getDashboardStats,
  getPaymentStatusBreakdown,
  getRevenueByMonth,
  getStudentsPerBatchChart,
} from "../services/dashboardService";
import { formatINR } from "../utils/money";

export default function DashboardPage() {
  const version = useStorageVersion();
  const live = useMemo(
    () => ({
      stats: getDashboardStats(),
      trend: getAttendanceTrend(30),
      revenue: getRevenueByMonth(6),
      paymentStatus: getPaymentStatusBreakdown(),
      perBatch: getStudentsPerBatchChart(),
    }),
    [version],
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Live institute KPIs from your local workspace.</p>
        </div>
      </div>

      <div className="grid-kpi">
        <Kpi
          icon={Users}
          label="Students"
          value={live.stats.totalStudents}
          hint={`${live.stats.activeStudents} active · ${live.stats.inactiveStudents} inactive`}
        />
        <Kpi
          icon={CalendarCheck2}
          label="Attendance (MTD)"
          value={
            live.stats.attendanceRate == null
              ? "—"
              : `${live.stats.attendanceRate}%`
          }
        />
        <Kpi
          icon={IndianRupee}
          label="Fees collected (MTD)"
          value={formatINR(live.stats.feesCollected)}
        />
        <Kpi
          icon={Wallet}
          label="Outstanding dues"
          value={formatINR(live.stats.outstandingDues)}
          hint={`${live.stats.overdueCount} overdue items`}
        />
      </div>

      <div className="grid-charts">
        <Card title="Attendance trend" subtitle="Last 30 days">
          <AttendanceTrendChart data={live.trend} />
        </Card>
        <Card title="Revenue by month" subtitle="Paid fees">
          <RevenueByMonthChart data={live.revenue} />
        </Card>
        <Card title="Payment status" subtitle="All receipts">
          <PaymentStatusChart data={live.paymentStatus} />
        </Card>
        <Card title="Students per batch">
          <StudentsPerBatchChart data={live.perBatch} />
        </Card>
      </div>
    </div>
  );
}
