const express   = require("express");
const mongoose  = require("mongoose");
const dotenv    = require("dotenv");
const cors      = require("cors");
const morgan    = require("morgan");
const helmet    = require("helmet");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: "محاولات كثيرة، يرجى المحاولة لاحقاً" },
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
});

app.use("/api/auth", authLimiter);
app.use("/api", apiLimiter);

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Logging ───────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth",     require("./routes/authRoutes"));
app.use("/api/users",    require("./routes/userRoutes"));   // cart + wishlist
// app.use("/api/perfumes", require("./routes/perfumeRoutes")); // uncomment when ready
// app.use("/api/orders",   require("./routes/orderRoutes"));   // uncomment when ready

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "SamPerfume API is running",
    env: process.env.NODE_ENV,
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "المسار غير موجود" });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "خطأ في الخادم",
  });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} [${process.env.NODE_ENV}]`);
});