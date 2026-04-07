import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/roleMiddleware.js";
import {
  getAdminStats,
  getTaskStatusDistribution,
  getTasksPerProject,
  getTasksOverTime,
  getUserProductivity,
} from "../controllers/adminStatsController.js";
import {
  listAdminProjects,
  getAdminProject,
  createAdminProject,
  updateAdminProject,
  deleteAdminProject,
} from "../controllers/adminProjectsController.js";
import {
  listAdminTasks,
  createAdminTask,
  updateAdminTask,
  deleteAdminTask,
} from "../controllers/adminTasksController.js";
import { listAdminUsers, deleteAdminUser } from "../controllers/adminUsersController.js";

const router = Router();
router.use(authenticate, requireAdmin);

router.get("/stats", getAdminStats);
router.get("/task-status", getTaskStatusDistribution);
router.get("/tasks-per-project", getTasksPerProject);
router.get("/tasks-over-time", getTasksOverTime);
router.get("/user-productivity", getUserProductivity);

router.get("/projects", listAdminProjects);
router.get("/projects/:id", getAdminProject);
router.post("/projects", createAdminProject);
router.patch("/projects/:id", updateAdminProject);
router.delete("/projects/:id", deleteAdminProject);

router.get("/tasks", listAdminTasks);
router.post("/tasks", createAdminTask);
router.patch("/tasks/:id", updateAdminTask);
router.delete("/tasks/:id", deleteAdminTask);

router.get("/users", listAdminUsers);
router.delete("/users/:id", deleteAdminUser);

export default router;
