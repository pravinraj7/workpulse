/**
 * Promote a user to admin by email.
 * Run from server/: ADMIN_EMAIL=you@example.com node scripts/promoteAdmin.mjs
 */
import "dotenv/config";
import mongoose from "mongoose";
import { User } from "../src/models/User.js";

const email = process.env.ADMIN_EMAIL;
if (!email) {
  console.error("Set ADMIN_EMAIL environment variable.");
  process.exit(1);
}

const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGO_URI or MONGODB_URI is not set in .env");
  process.exit(1);
}

await mongoose.connect(uri);
const user = await User.findOne({ email: email.toLowerCase().trim() });
if (!user) {
  console.error("No user found with that email.");
  await mongoose.disconnect();
  process.exit(1);
}
user.role = "admin";
await user.save();
console.log("User promoted to admin.");
await mongoose.disconnect();
