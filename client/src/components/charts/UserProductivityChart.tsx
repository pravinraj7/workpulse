import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { UserProductivityRow } from "@/services/adminApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TICK_STYLE = { fill: "#6b7280", fontSize: 12 };

export function UserProductivityChart({ data }: { data: UserProductivityRow[] }) {
  const chartData = data.map((d) => ({
    name: d.name.length > 12 ? `${d.name.slice(0, 12)}…` : d.name,
    completed: d.completedTasks,
  }));

  return (
    <Card className="border-[#e5e7eb] shadow-md">
      <CardHeader>
        <CardTitle className="text-base text-[#111827]">Completed tasks by assignee</CardTitle>
      </CardHeader>
      <CardContent className="h-[320px] pt-0">
        {chartData.length === 0 ? (
          <p className="py-12 text-center text-sm text-[#6b7280]">
            No completed assigned tasks yet
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
              <XAxis type="number" tick={TICK_STYLE} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={TICK_STYLE} width={100} />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                }}
              />
              <Bar dataKey="completed" fill="#22c55e" radius={[0, 8, 8, 0]} name="Completed" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
