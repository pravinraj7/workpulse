import mongoose from "mongoose";
import { Project } from "../models/Project.js";
import { Task } from "../models/Task.js";
function toObjectIds(ids) {
  if (!Array.isArray(ids)) return [];
  return ids.filter((id) => mongoose.Types.ObjectId.isValid(id)).map((id) => new mongoose.Types.ObjectId(id));
}

export async function listAdminProjects(_req, res) {
  const projects = await Project.find()
    .populate("owner", "name email role")
    .populate("members", "name email role")
    .sort({ updatedAt: -1 })
    .lean();
  // Older documents may omit `members`; avoid clients crashing on undefined
  const safe = projects.map((p) => ({
    ...p,
    members: Array.isArray(p.members) ? p.members : [],
  }));
  res.json(safe);
}

export async function getAdminProject(req, res) {
  const project = await Project.findById(req.params.id)
    .populate("owner", "name email role")
    .populate("members", "name email role")
    .lean();
  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }
  res.json(project);
}

export async function createAdminProject(req, res) {
  const { title, description = "", members = [] } = req.body;
  if (!title || !String(title).trim()) {
    return res.status(400).json({ message: "Title is required" });
  }
  const memberIds = toObjectIds(members);
  const project = await Project.create({
    title: title.trim(),
    description: String(description || ""),
    owner: req.user._id,
    members: memberIds,
  });
  const populated = await Project.findById(project._id)
    .populate("owner", "name email role")
    .populate("members", "name email role")
    .lean();
  res.status(201).json(populated);
}

export async function updateAdminProject(req, res) {
  const project = await Project.findById(req.params.id);
  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }
  const { title, description, members } = req.body;
  if (title !== undefined) {
    if (!String(title).trim()) {
      return res.status(400).json({ message: "Title cannot be empty" });
    }
    project.title = title.trim();
  }
  if (description !== undefined) project.description = String(description);
  if (members !== undefined) {
    project.members = toObjectIds(members);
  }
  await project.save();
  const populated = await Project.findById(project._id)
    .populate("owner", "name email role")
    .populate("members", "name email role")
    .lean();
  res.json(populated);
}

export async function deleteAdminProject(req, res) {
  const project = await Project.findById(req.params.id);
  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }
  await Task.deleteMany({ project: project._id });
  await project.deleteOne();
  res.json({ ok: true });
}
