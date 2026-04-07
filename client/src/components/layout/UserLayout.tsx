import { Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, FolderKanban, CheckSquare } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";

const items = [
  { to: "/user/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/user/my-projects", label: "My Projects", icon: FolderKanban },
  { to: "/user/my-tasks", label: "My Tasks", icon: CheckSquare },
];

const titles: Record<string, { title: string; subtitle?: string }> = {
  "/user/dashboard": { title: "My dashboard", subtitle: "Your workload" },
  "/user/my-projects": { title: "My projects", subtitle: "Projects you’re assigned to" },
  "/user/my-tasks": { title: "My tasks", subtitle: "Update your progress" },
};

export function UserLayout() {
  const { pathname } = useLocation();
  const meta = titles[pathname] ?? { title: "WorkPulse" };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Sidebar items={items} brandSuffix="Team" />
      <div className="flex min-h-screen flex-col pl-64">
        <Navbar title={meta.title} subtitle={meta.subtitle} />
        <div className="flex-1 p-8">
          <div className="container mx-auto max-w-7xl">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
