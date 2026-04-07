import { Project } from "../models/Project.js";
import { Task } from "../models/Task.js";

export async function getUserStats(req, res) {
  const uid = req.user._id;
  const [myTasksCount, completedTasks, pendingTasks] = await Promise.all([
    Task.countDocuments({ assignee: uid }),
    Task.countDocuments({ assignee: uid, status: "completed" }),
    Task.countDocuments({
      assignee: uid,
      status: { $in: ["todo", "in_progress"] },
    }),
  ]);
  res.json({ myTasksCount, completedTasks, pendingTasks });
}

export async function getMyProjects(req, res) {
  const uid = req.user._id;
  const projects = await Project.find({ members: uid })
    .populate("owner", "name email")
    .sort({ updatedAt: -1 })
    .lean();
  res.json(projects);
}

export async function getMyTasks(req, res) {
  const tasks = await Task.find({ assignee: req.user._id })
    .populate("project", "title")
    .sort({ updatedAt: -1 })
    .lean();
  res.json(tasks);
}

export async function updateMyTaskStatus(req, res) {
  const { status } = req.body;
  if (!["todo", "in_progress", "completed"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }
  const task = await Task.findById(req.params.id);
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }
  if (String(task.assignee) !== String(req.user._id)) {
    return res.status(403).json({ message: "Not assigned to you" });
  }
  task.status = status;
  await task.save();
  const populated = await Task.findById(task._id).populate("project", "title").lean();
  res.json(populated);
}
