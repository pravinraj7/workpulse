import dns from "node:dns";
import mongoose from "mongoose";

// Prefer IPv4; some Windows/Node combinations break mongodb+srv SRV without this.
dns.setDefaultResultOrder("ipv4first");
// If mongodb+srv still fails with querySrv ECONNREFUSED, Node may be using a bad resolver.
// Uncomment or set MONGODB_USE_PUBLIC_DNS=1 in .env to force public DNS for that process.
if (process.env.MONGODB_USE_PUBLIC_DNS === "1") {
  try {
    dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
  } catch {
    /* ignore */
  }
}

export async function connectDB() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGO_URI or MONGODB_URI is not set");
  }
  mongoose.set("strictQuery", true);
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15_000,
    });
  } catch (err) {
    if (String(err?.message ?? "").includes("querySrv")) {
      console.error(`
MongoDB SRV DNS lookup failed (querySrv ECONNREFUSED). Common fixes:

  1. Network / DNS: try another Wi‑Fi, disable VPN, or set DNS to 8.8.8.8 / 1.1.1.1
  2. Firewall / antivirus: allow Node.js DNS or try from home network
  3. Atlas: in Connect → Drivers, copy the **Standard connection string** (starts with
     mongodb://...) instead of mongodb+srv:// and set it as MONGODB_URI in server/.env

Original error: ${err.message}
`);
    }
    throw err;
  }
  console.log("MongoDB connected");
}
