import { Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";

const items = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/projects", label: "Projects", icon: FolderKanban },
  { to: "/admin/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/admin/users", label: "Users", icon: Users },
];

const titles: Record<string, { title: string; subtitle?: string }> = {
  "/admin/dashboard": { title: "Admin dashboard", subtitle: "Analytics & overview" },
  "/admin/projects": { title: "Projects", subtitle: "Create, assign teams" },
  "/admin/tasks": { title: "Tasks", subtitle: "Manage all tasks" },
  "/admin/users": { title: "Users", subtitle: "User directory" },
};

export function AdminLayout() {
  const { pathname } = useLocation();
  const meta = titles[pathname] ?? { title: "Admin" };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Sidebar items={items} brandSuffix="Admin" />
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
