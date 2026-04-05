const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ── Helper: sign JWT ──────────────────────────────────────────────────────────
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  });

// ── Helper: send token response ───────────────────────────────────────────────
const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    user,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   POST /api/auth/register
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "البريد الإلكتروني وكلمة المرور مطلوبان",
      });
    }

    // Check if email already exists
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "البريد الإلكتروني مسجّل مسبقاً",
      });
    }

    // Create user — username auto-generated from email in model pre-save hook
    const user = await User.create({ email, password });

    sendToken(user, 201, res);
  } catch (err) {
    // Handle mongoose validation errors nicely
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }
    console.error(err);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   POST /api/auth/login
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "البريد الإلكتروني وكلمة المرور مطلوبان",
      });
    }

    // Find user — explicitly select password since it's hidden by default
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "هذا الحساب معطّل، تواصل مع الدعم",
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
      });
    }

    sendToken(user, 200, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   GET /api/auth/me
// @access  Private (requires token)
// ─────────────────────────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    // req.user is already attached by protect middleware
    const user = await User.findById(req.user._id).populate("wishlist", "name brand images availability");
    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   PUT /api/auth/update-profile
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const { username, phone } = req.body;

    const user = await User.findById(req.user._id);

    if (username) user.username = username.trim();
    if (phone)    user.phone    = phone.trim();

    await user.save();

    res.json({ success: true, user });
  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }
    console.error(err);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   PUT /api/auth/change-password
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "جميع الحقول مطلوبة" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل" });
    }

    const user = await User.findById(req.user._id).select("+password");
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "كلمة المرور الحالية غير صحيحة" });
    }

    user.password = newPassword; // pre-save hook will hash it
    await user.save();

    res.json({ success: true, message: "تم تغيير كلمة المرور بنجاح" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   POST /api/auth/address
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const addAddress = async (req, res) => {
  try {
    const { label, city, area, street, notes, isDefault } = req.body;

    if (!city) {
      return res.status(400).json({ success: false, message: "المدينة مطلوبة" });
    }

    const user = await User.findById(req.user._id);

    // If new address is default, unset others
    if (isDefault) {
      user.addresses.forEach((a) => (a.isDefault = false));
    }

    user.addresses.push({ label, city, area, street, notes, isDefault: !!isDefault });
    await user.save();

    res.status(201).json({ success: true, addresses: user.addresses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   DELETE /api/auth/address/:addressId
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses = user.addresses.filter(
      (a) => a._id.toString() !== req.params.addressId
    );
    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  addAddress,
  deleteAddress,
};