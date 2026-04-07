import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TasksOverTimeRow } from "@/services/adminApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TICK_STYLE = { fill: "#6b7280", fontSize: 12 };

export function TasksOverTimeLineChart({ data }: { data: TasksOverTimeRow[] }) {
  return (
    <Card className="border-[#e5e7eb] shadow-md">
      <CardHeader>
        <CardTitle className="text-base text-[#111827]">Tasks created over time</CardTitle>
      </CardHeader>
      <CardContent className="h-[320px] pt-0">
        {data.length === 0 ? (
          <p className="py-12 text-center text-sm text-[#6b7280]">No history yet</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={TICK_STYLE} />
              <YAxis tick={TICK_STYLE} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6 }}
                name="Tasks"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
