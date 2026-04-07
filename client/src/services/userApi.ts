import { api } from "@/lib/api";

export type UserStats = {
  myTasksCount: number;
  completedTasks: number;
  pendingTasks: number;
};

export const userPanelApi = {
  getStats: () => api.get<UserStats>("/api/user/stats"),
  getMyProjects: () => api.get<unknown[]>("/api/user/projects"),
  getMyTasks: () => api.get<unknown[]>("/api/user/tasks"),
  updateTaskStatus: (id: string, status: string) =>
    api.patch(`/api/user/tasks/${id}/status`, { status }),
};
