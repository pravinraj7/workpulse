import bcrypt from "bcryptjs";
import { User } from "../models/User.js";

/**
 * If ADMIN_EMAIL + ADMIN_PASSWORD are set in .env, ensures that account exists
 * as admin. Password in the database is kept in sync with ADMIN_PASSWORD on
 * every server start (so /admin/login matches your .env).
 * Set ADMIN_SKIP_PASSWORD_SYNC=1 to create/promote once but never overwrite an
 * existing admin's password from env.
 */
export async function ensureBootstrapAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const plain = process.env.ADMIN_PASSWORD?.trim();
  if (!email || !plain) {
    return;
  }

  const hash = await bcrypt.hash(plain, 10);
  const user = await User.findOne({ email });

  if (!user) {
    await User.create({
      name: "Administrator",
      email,
      password: hash,
      role: "admin",
    });
    console.log(`[WorkPulse] Admin account created for ${email}`);
    return;
  }

  if (user.role !== "admin") {
    user.role = "admin";
    user.password = hash;
    await user.save();
    console.log(`[WorkPulse] Existing user promoted to admin: ${email}`);
    return;
  }

  const skipSync = process.env.ADMIN_SKIP_PASSWORD_SYNC === "1";
  if (!skipSync) {
    user.password = hash;
    await user.save();
    console.log(`[WorkPulse] Admin password synced from ADMIN_PASSWORD for ${email}`);
  }
}
