import { User } from "../models/User.js";

export async function listAdminUsers(_req, res) {
  const users = await User.find().select("-password").sort({ createdAt: -1 }).lean();
  res.json(users);
}

export async function deleteAdminUser(req, res) {
  const target = await User.findById(req.params.id);
  if (!target) {
    return res.status(404).json({ message: "User not found" });
  }
  if (String(target._id) === String(req.user._id)) {
    return res.status(400).json({ message: "You cannot delete your own account" });
  }
  if (target.role === "admin") {
    const adminCount = await User.countDocuments({ role: "admin" });
    if (adminCount <= 1) {
      return res.status(400).json({ message: "Cannot delete the last admin" });
    }
  }
  await target.deleteOne();
  res.json({ ok: true });
}
