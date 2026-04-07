import { useEffect, useState } from "react";
import { CheckCircle2, ListTodo, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { userPanelApi, type UserStats } from "@/services/userApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLoader } from "@/components/LoadingSpinner";

export function UserDashboardPage() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await userPanelApi.getStats();
        if (!cancelled) setStats(data);
      } catch (e) {
        if (!cancelled) {
          const msg = isAxiosError(e) ? e.response?.data?.message : "Failed to load";
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

  if (loading || !stats) return <PageLoader />;

  const cards = [
    {
      label: "My tasks",
      value: stats.myTasksCount,
      icon: ClipboardList,
      tone: "bg-[#eff6ff] text-[#1d4ed8]",
    },
    {
      label: "Completed",
      value: stats.completedTasks,
      icon: CheckCircle2,
      tone: "bg-[#f0fdf4] text-[#15803d]",
    },
    {
      label: "Pending",
      value: stats.pendingTasks,
      icon: ListTodo,
      tone: "bg-[#fffbeb] text-[#b45309]",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {cards.map(({ label, value, icon: Icon, tone }) => (
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
            <p className="text-3xl font-semibold tabular-nums text-[#111827]">{value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
