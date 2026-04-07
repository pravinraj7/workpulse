import { User } from "../models/User.js";
import { Project } from "../models/Project.js";
import { Task } from "../models/Task.js";

export async function getAdminStats(_req, res) {
  const [totalUsers, totalProjects, totalTasks, completedTasks] = await Promise.all([
    User.countDocuments(),
    Project.countDocuments(),
    Task.countDocuments(),
    Task.countDocuments({ status: "completed" }),
  ]);
  res.json({ totalUsers, totalProjects, totalTasks, completedTasks });
}

export async function getTaskStatusDistribution(_req, res) {
  const [todo, in_progress, completed] = await Promise.all([
    Task.countDocuments({ status: "todo" }),
    Task.countDocuments({ status: "in_progress" }),
    Task.countDocuments({ status: "completed" }),
  ]);
  res.json({ todo, in_progress, completed });
}

export async function getTasksPerProject(_req, res) {
  const rows = await Task.aggregate([
    { $group: { _id: "$project", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  const projectIds = rows.map((r) => r._id).filter(Boolean);
  const projects = await Project.find({ _id: { $in: projectIds } })
    .select("title")
    .lean();
  const titleById = Object.fromEntries(projects.map((p) => [String(p._id), p.title]));
  const data = rows.map((r) => ({
    projectId: r._id,
    title: titleById[String(r._id)] || "Unknown",
    taskCount: r.count,
  }));
  res.json(data);
}

export async function getTasksOverTime(_req, res) {
  const rows = await Task.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "UTC" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { date: "$_id", count: 1, _id: 0 } },
  ]);
  res.json(rows);
}

export async function getUserProductivity(_req, res) {
  const rows = await Task.aggregate([
    { $match: { status: "completed", assignee: { $ne: null } } },
    { $group: { _id: "$assignee", completed: { $sum: 1 } } },
    { $sort: { completed: -1 } },
    { $limit: 20 },
  ]);
  const userIds = rows.map((r) => r._id);
  const users = await User.find({ _id: { $in: userIds } }).select("name email").lean();
  const nameById = Object.fromEntries(users.map((u) => [String(u._id), u.name]));
  const data = rows.map((r) => ({
    userId: r._id,
    name: nameById[String(r._id)] || "Unknown",
    completedTasks: r.completed,
  }));
  res.json(data);
}
