export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

/** Regular users only — admins use /admin routes. */
export function requireUserRole(req, res, next) {
  if (req.user?.role !== "user") {
    return res.status(403).json({ message: "User panel access only" });
  }
  next();
}
