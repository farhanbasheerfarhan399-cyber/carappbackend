// src/server.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { AppDataSource } from "./config/db";

// Load environment variables
dotenv.config();

// Initialize database
AppDataSource.initialize()
  .then(() => console.log("✅ Database connected"))
  .catch((err) => console.error("❌ Database connection failed:", err));

const app = express();

// ----------------------
// MIDDLEWARES
// ----------------------
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(cookieParser());

// ----------------------
// ROUTES
// ----------------------
import authRoutes from "./routes/auth";
import verifyOtpRoute from "./routes/verifyOtp";
import resendOtpRoute from "./routes/resendOtp";
import loginRoute from "./routes/login";
import userRoutes from "./routes/user";
import rideRoutes from "./routes/ride";   // ✅ ADD THIS

app.use("/api", authRoutes);
app.use("/api", verifyOtpRoute);
app.use("/api", resendOtpRoute);
app.use("/api", loginRoute);
app.use("/api/user", userRoutes);
app.use("/api/ride", rideRoutes);         // ✅ ADD THIS

// ----------------------
// START SERVER
// ----------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
