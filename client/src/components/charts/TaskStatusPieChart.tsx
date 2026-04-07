import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { TaskStatusCounts } from "@/services/adminApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = {
  "To Do": "#94a3b8",
  "In Progress": "#3b82f6",
  Completed: "#22c55e",
};

export function TaskStatusPieChart({ data }: { data: TaskStatusCounts | null }) {
  const chartData =
    data == null
      ? []
      : [
          { name: "To Do", value: data.todo },
          { name: "In Progress", value: data.in_progress },
          { name: "Completed", value: data.completed },
        ];

  const total = chartData.reduce((s, d) => s + d.value, 0);

  return (
    <Card className="border-[#e5e7eb] shadow-md">
      <CardHeader>
        <CardTitle className="text-base text-[#111827]">Task status</CardTitle>
      </CardHeader>
      <CardContent className="h-[320px] pt-0">
        {total === 0 ? (
          <p className="py-12 text-center text-sm text-[#6b7280]">No tasks yet</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
              >
                {chartData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={COLORS[entry.name as keyof typeof COLORS]}
                    stroke="#fff"
                    strokeWidth={1}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "13px", color: "#6b7280" }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
