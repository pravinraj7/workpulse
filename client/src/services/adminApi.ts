import { api } from "@/lib/api";

export type AdminStats = {
  totalUsers: number;
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
};

export type TaskStatusCounts = {
  todo: number;
  in_progress: number;
  completed: number;
};

export type TasksPerProjectRow = {
  projectId: string;
  title: string;
  taskCount: number;
};

export type TasksOverTimeRow = { date: string; count: number };

export type UserProductivityRow = {
  userId: string;
  name: string;
  completedTasks: number;
};

export const adminApi = {
  getStats: () => api.get<AdminStats>("/api/admin/stats"),
  getTaskStatus: () => api.get<TaskStatusCounts>("/api/admin/task-status"),
  getTasksPerProject: () => api.get<TasksPerProjectRow[]>("/api/admin/tasks-per-project"),
  getTasksOverTime: () => api.get<TasksOverTimeRow[]>("/api/admin/tasks-over-time"),
  getUserProductivity: () => api.get<UserProductivityRow[]>("/api/admin/user-productivity"),

  getProjects: () => api.get<unknown[]>("/api/admin/projects"),
  createProject: (body: { title: string; description?: string; members?: string[] }) =>
    api.post("/api/admin/projects", body),
  updateProject: (id: string, body: { title?: string; description?: string; members?: string[] }) =>
    api.patch(`/api/admin/projects/${id}`, body),
  deleteProject: (id: string) => api.delete(`/api/admin/projects/${id}`),

  getTasks: (projectId?: string) =>
    api.get("/api/admin/tasks", { params: projectId ? { projectId } : undefined }),
  createTask: (body: {
    projectId: string;
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    assignee?: string | null;
  }) => api.post("/api/admin/tasks", body),
  updateTask: (
    id: string,
    body: {
      title?: string;
      description?: string;
      status?: string;
      priority?: string;
      assignee?: string | null;
    }
  ) => api.patch(`/api/admin/tasks/${id}`, body),
  deleteTask: (id: string) => api.delete(`/api/admin/tasks/${id}`),

  getUsers: () => api.get<unknown[]>("/api/admin/users"),
  deleteUser: (id: string) => api.delete(`/api/admin/users/${id}`),
};
