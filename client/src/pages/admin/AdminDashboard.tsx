import { useEffect, useState } from "react";
import { Users, FolderKanban, ListTodo, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { adminApi, type AdminStats, type TaskStatusCounts } from "@/services/adminApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLoader } from "@/components/LoadingSpinner";
import { TasksPerProjectBarChart } from "@/components/charts/TasksPerProjectBarChart";
import { TaskStatusPieChart } from "@/components/charts/TaskStatusPieChart";
import { TasksOverTimeLineChart } from "@/components/charts/TasksOverTimeLineChart";
import { UserProductivityChart } from "@/components/charts/UserProductivityChart";

export function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [status, setStatus] = useState<TaskStatusCounts | null>(null);
  const [perProject, setPerProject] = useState<Awaited<
    ReturnType<typeof adminApi.getTasksPerProject>
  >["data"]>([]);
  const [overTime, setOverTime] = useState<Awaited<
    ReturnType<typeof adminApi.getTasksOverTime>
  >["data"]>([]);
  const [productivity, setProductivity] = useState<Awaited<
    ReturnType<typeof adminApi.getUserProductivity>
  >["data"]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [s, st, pp, ot, pr] = await Promise.all([
          adminApi.getStats(),
          adminApi.getTaskStatus(),
          adminApi.getTasksPerProject(),
          adminApi.getTasksOverTime(),
          adminApi.getUserProductivity(),
        ]);
        if (!cancelled) {
          setStats(s.data);
          setStatus(st.data);
          setPerProject(pp.data);
          setOverTime(ot.data);
          setProductivity(pr.data);
        }
      } catch (e) {
        if (!cancelled) {
          const msg = isAxiosError(e) ? e.response?.data?.message : "Failed to load dashboard";
          toast.error(String(msg));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading || !stats) {
    return <PageLoader />;
  }

  const statCards = [
    { label: "Total users", value: stats.totalUsers, icon: Users, tone: "bg-[#eff6ff] text-[#1d4ed8]" },
    { label: "Total projects", value: stats.totalProjects, icon: FolderKanban, tone: "bg-[#f0fdf4] text-[#15803d]" },
    { label: "Total tasks", value: stats.totalTasks, icon: ListTodo, tone: "bg-[#fffbeb] text-[#b45309]" },
    { label: "Completed tasks", value: stats.completedTasks, icon: CheckCircle2, tone: "bg-[#faf5ff] text-[#7c3aed]" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, tone }) => (
          <Card
            key={label}
            className="border-[#e5e7eb] shadow-md transition-shadow duration-200 hover:shadow-md"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#6b7280]">{label}</CardTitle>
              <div className={`rounded-xl p-2 ${tone}`}>
                <Icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tabular-nums text-[#111827]">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TasksPerProjectBarChart data={perProject} />
        <TaskStatusPieChart data={status} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <TasksOverTimeLineChart data={overTime} />
        <UserProductivityChart data={productivity} />
      </div>
    </div>
  );
}
