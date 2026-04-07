import mongoose from "mongoose";
import { Task } from "../models/Task.js";
import { Project } from "../models/Project.js";

export async function listAdminTasks(req, res) {
  const { projectId } = req.query;
  const filter = {};
  if (projectId && mongoose.Types.ObjectId.isValid(projectId)) {
    filter.project = projectId;
  }
  const tasks = await Task.find(filter)
    .populate("project", "title")
    .populate("assignee", "name email")
    .populate("createdBy", "name email")
    .sort({ updatedAt: -1 })
    .lean();
  res.json(tasks);
}

export async function createAdminTask(req, res) {
  const { projectId, title, description = "", status, priority, assignee } = req.body;
  if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
    return res.status(400).json({ message: "Valid projectId is required" });
  }
  if (!title || !String(title).trim()) {
    return res.status(400).json({ message: "Title is required" });
  }
  const project = await Project.findById(projectId);
  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }
  const task = await Task.create({
    title: title.trim(),
    description: String(description || ""),
    project: projectId,
    createdBy: req.user._id,
    assignee: assignee && mongoose.Types.ObjectId.isValid(assignee) ? assignee : null,
    ...(status && { status }),
    ...(priority && { priority }),
  });
  const populated = await Task.findById(task._id)
    .populate("project", "title")
    .populate("assignee", "name email")
    .populate("createdBy", "name email")
    .lean();
  res.status(201).json(populated);
}

export async function updateAdminTask(req, res) {
  const task = await Task.findById(req.params.id);
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }
  const { title, description, status, priority, assignee } = req.body;
  if (title !== undefined) {
    if (!String(title).trim()) {
      return res.status(400).json({ message: "Title cannot be empty" });
    }
    task.title = title.trim();
  }
  if (description !== undefined) task.description = String(description);
  if (status !== undefined) task.status = status;
  if (priority !== undefined) task.priority = priority;
  if (assignee !== undefined) {
    task.assignee =
      assignee === null || assignee === ""
        ? null
        : mongoose.Types.ObjectId.isValid(assignee)
          ? assignee
          : task.assignee;
  }
  await task.save();
  const populated = await Task.findById(task._id)
    .populate("project", "title")
    .populate("assignee", "name email")
    .populate("createdBy", "name email")
    .lean();
  res.json(populated);
}

export async function deleteAdminTask(req, res) {
  const task = await Task.findById(req.params.id);
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }
  await task.deleteOne();
  res.json({ ok: true });
}
