import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { formatDisplayDate } from "../../utils/date";

export default function AttendanceTrendChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef0f4" />
        <XAxis
          dataKey="date"
          tickFormatter={(v) => formatDisplayDate(v).split(" ").slice(0, 2).join(" ")}
          minTickGap={28}
          tick={{ fontSize: 11 }}
        />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
        <Tooltip
          formatter={(v) => [`${v}%`, "Attendance"]}
          labelFormatter={(l) => formatDisplayDate(l)}
        />
        <Line
          type="monotone"
          dataKey="rate"
          stroke="#1f4068"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
