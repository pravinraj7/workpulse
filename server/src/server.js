import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import { ensureBootstrapAdmin } from "./utils/ensureBootstrapAdmin.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import userPanelRoutes from "./routes/userPanelRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userPanelRoutes);

app.get("/", (_req, res) => {
  res.send("API is running...");
});

app.get("/api/health", (_, res) => {
  res.json({ ok: true, name: "WorkPulse API" });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Server error",
  });
});

connectDB()
  .then(async () => {
    await ensureBootstrapAdmin();
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`WorkPulse API listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

export default app;
