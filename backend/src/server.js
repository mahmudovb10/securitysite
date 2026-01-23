const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const express = require("express");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const passportRoutes = require("./routes/passport");
const adminRoutes = require("./routes/admin");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// 1. HELMET - Rasmlar va videolarni brauzerda ko'rsatishga ruxsat berish
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false,
  }),
);

// 2. STATIC FAYLLAR - backend/uploads manzilini ko'rsatish
// __dirname (src) dan bitta tepaga chiqamiz (backend) va uploads ga kiramiz
const uploadPath = path.join(__dirname, "../uploads");
app.use("/uploads", express.static(uploadPath));

// 3. MIDDLEWARE
app.use(
  cors({
    origin: ["https://securitysite-eight.vercel.app", "http://localhost:5173"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. DATABASE CONNECTION
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
  })
  .catch((err) => console.error("❌ MongoDB Error:", err));

// 5. ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/passport", passportRoutes);
app.use("/api/admin", adminRoutes);

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  // Terminalda bu yo'lni tekshirib oling:
  console.log("📂 Uploads manzili:", uploadPath);
});

module.exports = app;
