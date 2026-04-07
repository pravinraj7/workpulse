import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { adminApi } from "@/services/adminApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { PageLoader } from "@/components/LoadingSpinner";
import { cn } from "@/lib/utils";

type Member = { _id: string; name: string; email: string };
type ProjectDoc = {
  _id: string;
  title: string;
  description?: string;
  members?: Member[] | null;
  owner?: Member | null;
};

function projectMembers(p: ProjectDoc): Member[] {
  return Array.isArray(p.members) ? p.members : [];
}

type UserRow = { _id: string; name: string; email: string; role: string };

export function AdminProjectsPage() {
  const [projects, setProjects] = useState<ProjectDoc[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProjectDoc | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const [p, u] = await Promise.all([adminApi.getProjects(), adminApi.getUsers()]);
      setProjects(p.data as ProjectDoc[]);
      setUsers(u.data as UserRow[]);
    } catch (e) {
      const msg = isAxiosError(e) ? e.response?.data?.message : "Failed to load";
      toast.error(String(msg));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function reset() {
    setEditing(null);
    setTitle("");
    setDescription("");
    setSelectedMembers([]);
  }

  function openCreate() {
    reset();
    setOpen(true);
  }

  function openEdit(p: ProjectDoc) {
    setEditing(p);
    setTitle(p.title);
    setDescription(p.description || "");
    setSelectedMembers(projectMembers(p).map((m) => String(m._id)));
    setOpen(true);
  }

  function toggleMember(id: string) {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function save() {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        const { data } = await adminApi.updateProject(editing._id, {
          title: title.trim(),
          description: description.trim(),
          members: selectedMembers,
        });
        setProjects((prev) => prev.map((x) => (x._id === editing._id ? (data as ProjectDoc) : x)));
        toast.success("Project updated");
      } else {
        const { data } = await adminApi.createProject({
          title: title.trim(),
          description: description.trim(),
          members: selectedMembers,
        });
        setProjects((prev) => [data as ProjectDoc, ...prev]);
        toast.success("Project created");
      }
      setOpen(false);
      reset();
    } catch (e) {
      const msg = isAxiosError(e) ? e.response?.data?.message : "Save failed";
      toast.error(String(msg));
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this project and its tasks?")) return;
    try {
      await adminApi.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p._id !== id));
      toast.success("Deleted");
    } catch (e) {
      const msg = isAxiosError(e) ? e.response?.data?.message : "Delete failed";
      toast.error(String(msg));
    }
  }

  const assignableUsers = users.filter((u) => u.role === "user");

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-[#6b7280]">Manage projects and assign team members.</p>
        <Button onClick={openCreate} className="rounded-xl shadow-sm">
          <Plus className="h-4 w-4" />
          Add project
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((p) => (
          <Card key={p._id} className="border-[#e5e7eb] shadow-md">
            <CardHeader>
              <CardTitle className="text-lg text-[#111827]">{p.title}</CardTitle>
              <p className="text-sm text-[#6b7280]">{p.description || "—"}</p>
              <p className="text-xs text-[#9ca3af]">
                Owner: {p.owner?.name || "—"} · {projectMembers(p).length} member(s)
              </p>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="rounded-xl" onClick={() => openEdit(p)}>
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl text-red-600 hover:bg-red-50"
                onClick={() => void remove(p._id)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {projects.length === 0 ? (
        <Card className="border-dashed border-[#e5e7eb] py-12 text-center text-[#6b7280] shadow-sm">
          No projects yet. Create one to assign your team.
        </Card>
      ) : null}

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) reset();
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit project" : "New project"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Assigned users</Label>
              <div className="max-h-48 space-y-2 overflow-y-auto rounded-xl border border-[#e5e7eb] bg-[#f8fafc] p-3">
                {assignableUsers.length === 0 ? (
                  <p className="text-sm text-[#6b7280]">No user accounts yet (register as user).</p>
                ) : (
                  assignableUsers.map((u) => (
                    <label
                      key={u._id}
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-white",
                        selectedMembers.includes(u._id) && "bg-white shadow-sm"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(u._id)}
                        onChange={() => toggleMember(u._id)}
                        className="rounded border-[#e5e7eb] text-[#3b82f6]"
                      />
                      <span className="text-[#111827]">{u.name}</span>
                      <span className="text-xs text-[#6b7280]">{u.email}</span>
                    </label>
                  ))
                )}
              </div>
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
