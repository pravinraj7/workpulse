import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { userPanelApi } from "@/services/userApi";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageLoader } from "@/components/LoadingSpinner";
import type { TaskPriority, TaskStatus } from "@/types";

type TaskRow = {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  project: { title: string } | null;
};

const labels: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  completed: "Completed",
};

export function MyTasksPage() {
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data } = await userPanelApi.getMyTasks();
      setTasks(data as TaskRow[]);
    } catch (e) {
      const msg = isAxiosError(e) ? e.response?.data?.message : "Failed to load tasks";
      toast.error(String(msg));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onStatusChange(id: string, status: TaskStatus) {
    try {
      const { data } = await userPanelApi.updateTaskStatus(id, status);
      setTasks((prev) => prev.map((t) => (t._id === id ? (data as TaskRow) : t)));
      toast.success("Status updated");
    } catch (e) {
      const msg = isAxiosError(e) ? e.response?.data?.message : "Update failed";
      toast.error(String(msg));
    }
  }

  function priorityVariant(p: TaskPriority): "low" | "medium" | "high" {
    return p;
  }

  if (loading) return <PageLoader />;

  if (tasks.length === 0) {
    return (
      <Card className="border-dashed border-[#e5e7eb] py-16 text-center text-[#6b7280] shadow-sm">
        No tasks assigned to you yet.
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((t) => (
        <Card
          key={t._id}
          className="border-[#e5e7eb] shadow-md transition-shadow duration-200 hover:shadow-md"
        >
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-[#111827]">{t.title}</h3>
                <Badge variant={priorityVariant(t.priority)}>{t.priority}</Badge>
              </div>
              <p className="mt-1 text-sm text-[#6b7280]">
                {typeof t.project === "object" && t.project?.title ? t.project.title : "Project"}
              </p>
              {t.description ? (
                <p className="mt-2 text-sm text-[#6b7280]">{t.description}</p>
              ) : null}
            </div>
            <div className="w-full shrink-0 sm:w-48">
              <label className="mb-1 block text-xs font-medium text-[#6b7280]">Status</label>
              <Select value={t.status} onValueChange={(v) => void onStatusChange(t._id, v as TaskStatus)}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(labels) as TaskStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>
                      {labels[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
