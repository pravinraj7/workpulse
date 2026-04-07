import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TasksPerProjectRow } from "@/services/adminApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TICK_STYLE = { fill: "#6b7280", fontSize: 12 };

export function TasksPerProjectBarChart({ data }: { data: TasksPerProjectRow[] }) {
  const chartData = data.map((d) => ({
    name: d.title.length > 18 ? `${d.title.slice(0, 18)}…` : d.title,
    tasks: d.taskCount,
  }));

  return (
    <Card className="border-[#e5e7eb] shadow-md">
      <CardHeader>
        <CardTitle className="text-base text-[#111827]">Tasks per project</CardTitle>
      </CardHeader>
      <CardContent className="h-[320px] pt-0">
        {chartData.length === 0 ? (
          <p className="py-12 text-center text-sm text-[#6b7280]">No task data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 32 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="name" tick={TICK_STYLE} interval={0} angle={-25} textAnchor="end" height={60} />
              <YAxis tick={TICK_STYLE} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  boxShadow: "0 1px 3px rgb(0 0 0 / 0.06)",
                }}
                labelStyle={{ color: "#111827" }}
              />
              <Bar dataKey="tasks" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Tasks" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
