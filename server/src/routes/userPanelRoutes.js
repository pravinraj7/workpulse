import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { requireUserRole } from "../middleware/roleMiddleware.js";
import {
  getUserStats,
  getMyProjects,
  getMyTasks,
  updateMyTaskStatus,
} from "../controllers/userPanelController.js";

const router = Router();
router.use(authenticate, requireUserRole);

router.get("/stats", getUserStats);
router.get("/projects", getMyProjects);
router.get("/tasks", getMyTasks);
router.patch("/tasks/:id/status", updateMyTaskStatus);

export default router;
