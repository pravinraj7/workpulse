import type { Role } from "@/types";

export function homePathForRole(role: Role): string {
  return role === "admin" ? "/admin/dashboard" : "/user/dashboard";
}
