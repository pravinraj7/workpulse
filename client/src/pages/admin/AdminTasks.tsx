import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { adminApi } from "@/services/adminApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageLoader } from "@/components/LoadingSpinner";
import type { TaskPriority, TaskStatus } from "@/types";

type ProjectMini = { _id: string; title: string };
type TaskRow = {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  project: ProjectMini | string;
  assignee: { _id: string; name: string } | null;
};
type UserRow = { _id: string; name: string; role: string };

const statusLabels: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  completed: "Completed",
};

export function AdminTasksPage() {
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [projects, setProjects] = useState<ProjectMini[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [filterProject, setFilterProject] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TaskRow | null>(null);
  const [form, setForm] = useState({
    projectId: "",
    title: "",
    description: "",
    status: "todo" as TaskStatus,
    priority: "medium" as TaskPriority,
    assignee: "" as string,
  });
  const [saving, setSaving] = useState(false);

  const loadTasks = useCallback(async () => {

    try {
      const { data } = await adminApi.getTasks(filterProject === "all" ? undefined : filterProject);
      setTasks(data as TaskRow[]);
    } catch (e) {
      const msg = isAxiosError(e) ? e.response?.data?.message : "Failed to load tasks";
      toast.error(String(msg));
    }
  }, [filterProject]);

  const loadMeta = useCallback(async () => {
    try {
      const [p, u] = await Promise.all([adminApi.getProjects(), adminApi.getUsers()]);
      setProjects((p.data as { _id: string; title: string }[]).map((x) => ({ _id: x._id, title: x.title })));
      setUsers(u.data as UserRow[]);
    } catch (e) {
      const msg = isAxiosError(e) ? e.response?.data?.message : "Failed to load";
      toast.error(String(msg));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMeta();
  }, [loadMeta]);

  useEffect(() => {
    if (!loading) void loadTasks();
  }, [loading, loadTasks]);

  function resetForm() {
    setEditing(null);
    setForm({
      projectId: projects[0]?._id || "",
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      assignee: "",
    });
  }

  function openCreate() {
    resetForm();
    setOpen(true);
  }

  function openEdit(t: TaskRow) {
    setEditing(t);
    const pid = typeof t.project === "object" ? t.project._id : t.project;
    setForm({
      projectId: pid,
      title: t.title,
      description: t.description || "",
      status: t.status,
      priority: t.priority,
      assignee: t.assignee?._id || "",
    });
    setOpen(true);
  }

  async function save() {
    if (!form.projectId || !form.title.trim()) {
      toast.error("Project and title are required");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        const { data } = await adminApi.updateTask(editing._id, {
          title: form.title.trim(),
          description: form.description.trim(),
          status: form.status,
          priority: form.priority,
          assignee: form.assignee || null,
        });
        setTasks((prev) => prev.map((x) => (x._id === editing._id ? (data as TaskRow) : x)));
        toast.success("Task updated");
      } else {
        const { data } = await adminApi.createTask({
          projectId: form.projectId,
          title: form.title.trim(),
          description: form.description.trim(),
          status: form.status,
          priority: form.priority,
          assignee: form.assignee || null,
        });
        setTasks((prev) => [data as TaskRow, ...prev]);
        toast.success("Task created");
      }
      setOpen(false);
    } catch (e) {
      const msg = isAxiosError(e) ? e.response?.data?.message : "Save failed";
      toast.error(String(msg));
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this task?")) return;
    try {
      await adminApi.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t._id !== id));
      toast.success("Deleted");
    } catch (e) {
      const msg = isAxiosError(e) ? e.response?.data?.message : "Delete failed";
      toast.error(String(msg));
    }
  }

  function priorityBadge(p: TaskPriority) {
    if (p === "high") return <Badge variant="high">high</Badge>;
    if (p === "low") return <Badge variant="low">low</Badge>;
    return <Badge variant="medium">medium</Badge>;
  }

  if (loading) return <PageLoader />;

  const assignable = users.filter((u) => u.role === "user");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Label className="text-[#6b7280]">Filter</Label>
          <Select value={filterProject} onValueChange={setFilterProject}>
            <SelectTrigger className="w-[220px] rounded-xl">
              <SelectValue placeholder="Project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All projects</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p._id} value={p._id}>
                  {p.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={openCreate} className="rounded-xl shadow-sm">
          <Plus className="h-4 w-4" />
          Add task
        </Button>
      </div>

      <Card className="overflow-hidden border-[#e5e7eb] shadow-md">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5e7eb] bg-[#f8fafc] text-left text-[#6b7280]">
                  <th className="px-4 py-3 font-medium">Task</th>
                  <th className="px-4 py-3 font-medium">Project</th>
                  <th className="px-4 py-3 font-medium">Assignee</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Priority</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((t) => {
                  const ptitle = typeof t.project === "object" ? t.project.title : "—";
                  return (
                    <tr key={t._id} className="border-b border-[#e5e7eb] last:border-0 hover:bg-[#fafafa]">
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          className="text-left font-medium text-[#111827] hover:text-[#3b82f6]"
                          onClick={() => openEdit(t)}
                        >
                          {t.title}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-[#6b7280]">{ptitle}</td>
                      <td className="px-4 py-3 text-[#6b7280]">{t.assignee?.name || "—"}</td>
                      <td className="px-4 py-3">{statusLabels[t.status]}</td>
                      <td className="px-4 py-3">{priorityBadge(t.priority)}</td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => void remove(t._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {tasks.length === 0 ? (
            <p className="py-10 text-center text-[#6b7280]">No tasks match this filter.</p>
          ) : null}
        </CardContent>
      </Card>

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) resetForm();
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit task" : "New task"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Project</Label>
              <Select
                value={form.projectId}
                onValueChange={(v) => setForm((f) => ({ ...f, projectId: v }))}
                disabled={!!editing}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p._id} value={p._id}>
                      {p.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm((f) => ({ ...f, status: v as TaskStatus }))}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) => setForm((f) => ({ ...f, priority: v as TaskPriority }))}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Assignee</Label>
              <Select
                value={form.assignee || "none"}
                onValueChange={(v) => setForm((f) => ({ ...f, assignee: v === "none" ? "" : v }))}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {assignable.map((u) => (
                    <SelectItem key={u._id} value={u._id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button className="rounded-xl" disabled={saving} onClick={() => void save()}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
