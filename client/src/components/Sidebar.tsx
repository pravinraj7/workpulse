import { NavLink } from "react-router-dom";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type SidebarItem = {
  to: string;
  label: string;
  icon: LucideIcon;
};

type SidebarProps = {
  items: SidebarItem[];
  brandSuffix?: string;
};

export function Sidebar({ items, brandSuffix }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-[#e5e7eb] bg-white shadow-sm">
      <div className="border-b border-[#e5e7eb] px-6 py-6">
        <NavLink to="/" className="text-xl font-bold tracking-tight text-[#111827]">
          WorkPulse
        </NavLink>
        {brandSuffix ? (
          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-[#3b82f6]">
            {brandSuffix}
          </p>
        ) : null}
        <p className="mt-1 text-xs text-[#6b7280]">Project management</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-4">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to.endsWith("/dashboard")}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors duration-200",
                isActive
                  ? "bg-[#eff6ff] text-[#1d4ed8]"
                  : "text-[#6b7280] hover:bg-[#f8fafc] hover:text-[#111827]"
              )
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
