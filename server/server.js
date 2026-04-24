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

// ── CORS — must come BEFORE helmet and all routes ─────────────────────────────
// helmet can strip or conflict with CORS headers if it runs first
const corsOptions = {
  origin: [
    process.env.CLIENT_URL || "http://localhost:5173",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));


// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: false, // don't block cross-origin fetches
}));

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

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Logging ───────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth",     require("./routes/authRoutes"));
app.use("/api/users",    require("./routes/userRoutes"));    // cart + wishlist
app.use("/api/perfumes", require("./routes/perfumeRoutes"));
app.use("/api/admin",    require("./routes/adminRoutes"));
app.use("/api/orders",   require("./routes/orderRoutes"));

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
app.listen(5000, '0.0.0.0', () => {
  console.log('Server running on port 5000');
});