const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const passportRoutes = require("./routes/passport");
const adminRoutes = require("./routes/admin");
const errorHandler = require("./middleware/errorHandler");

const express = require("express");

const app = express();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection (NO SEED DATA)
mongoose
  .connect(process.env.MONGO_URI) // <- shu yerni o'zgartirish kerak
  .then(() => {
    console.log("✅ MongoDB Connected");
    console.log("📊 Database starts empty - No seed data");
  })
  .catch((err) => console.error("❌ MongoDB Error:", err));

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/passport", passportRoutes);
app.use("/api/admin", adminRoutes); // Protected by requireAdmin middleware

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("🔒 Admin routes protected by RBAC");
  console.log("📍 Empty database - waiting for real uploads");
});

module.exports = app;
