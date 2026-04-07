import { useEffect, useState } from "react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { userPanelApi } from "@/services/userApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLoader } from "@/components/LoadingSpinner";

type ProjectRow = {
  _id: string;
  title: string;
  description?: string;
  owner?: { name: string; email: string };
};

export function MyProjectsPage() {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await userPanelApi.getMyProjects();
        if (!cancelled) setProjects(data as ProjectRow[]);
      } catch (e) {
        if (!cancelled) {
          const msg = isAxiosError(e) ? e.response?.data?.message : "Failed to load projects";
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

  if (loading) return <PageLoader />;

  if (projects.length === 0) {
    return (
      <Card className="border-dashed border-[#e5e7eb] py-16 text-center text-[#6b7280] shadow-sm">
        You’re not assigned to any projects yet. An admin can add you under project members.
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {projects.map((p) => (
        <Card key={p._id} className="border-[#e5e7eb] shadow-md">
          <CardHeader>
            <CardTitle className="text-lg text-[#111827]">{p.title}</CardTitle>
            <p className="text-sm text-[#6b7280]">{p.description || "No description"}</p>
            <p className="text-xs text-[#9ca3af]">Lead: {p.owner?.name || "—"}</p>
          </CardHeader>
          <CardContent />
        </Card>
      ))}
    </div>
  );
}
