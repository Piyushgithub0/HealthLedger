import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import patientRoutes from "./routes/patient.js";
import pdfRoutes from "./routes/pdf.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 5000;

// Get local network IP
function getNetworkIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
}

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/patient/pdf", pdfRoutes);

// Server info (returns the network-accessible base URL)
app.get("/api/server-info", (req, res) => {
  const ip = getNetworkIP();
  res.json({ baseUrl: `http://${ip}:${PORT}` });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    app.listen(PORT, "0.0.0.0", () => {
      const ip = getNetworkIP();
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 Network: http://${ip}:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

