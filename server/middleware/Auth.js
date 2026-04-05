const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ── Protect: must be logged in ────────────────────────────────────────────────
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "يجب تسجيل الدخول أولاً" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user || !req.user.isActive) {
      return res.status(401).json({ success: false, message: "الحساب غير موجود أو معطّل" });
    }

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "الجلسة منتهية، يرجى تسجيل الدخول مجدداً" });
  }
};

// ── Admin only ────────────────────────────────────────────────────────────────
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") return next();
  return res.status(403).json({ success: false, message: "غير مصرح لك بهذا الإجراء" });
};

// ── Optional auth: attach user if token exists, but don't block guests ────────
// Used for routes guests can access but logged-in users get extra data
const optionalAuth = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
    } catch {
      req.user = null;
    }
  }
  next();
};

module.exports = { protect, adminOnly, optionalAuth };