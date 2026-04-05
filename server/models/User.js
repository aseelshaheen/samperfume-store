const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// ── Address sub-schema (reused in user + orders) ─────────────────────────────
const addressSchema = new mongoose.Schema(
  {
    label:    { type: String, default: "الرئيسي" }, // e.g. "البيت", "العمل"
    city:     { type: String, required: true },
    area:     { type: String },                      // neighbourhood / area
    street:   { type: String },
    notes:    { type: String },                      // delivery notes
    isDefault:{ type: Boolean, default: false },
  },
  { _id: true }
);

// ── Main User schema ──────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    // ── Auth ──────────────────────────────────────────────────────────────────
    email: {
      type: String,
      required: [true, "البريد الإلكتروني مطلوب"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "صيغة البريد الإلكتروني غير صحيحة",
      ],
    },

    password: {
      type: String,
      required: [true, "كلمة المرور مطلوبة"],
      minlength: [6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"],
      select: false, // never returned in queries by default
    },

    // ── Profile ───────────────────────────────────────────────────────────────
    username: {
      type: String,
      trim: true,
      // auto-filled from email on register (first word before @), user can change
    },

    phone: {
      type: String,
      trim: true,
      // required when placing first order, not on signup
    },

    avatar: {
      type: String,
      default: null, // Cloudinary URL when user uploads one
    },

    // ── Addresses ─────────────────────────────────────────────────────────────
    addresses: {
      type: [addressSchema],
      default: [],
    },

    // ── Role ──────────────────────────────────────────────────────────────────
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },

    // ── Wishlist ──────────────────────────────────────────────────────────────
    // Stores references to Perfume documents
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Perfume",
      },
    ],

    // ── Cart ──────────────────────────────────────────────────────────────────
    // Stored server-side so it persists across devices
    cart: [
      {
        perfume:  { type: mongoose.Schema.Types.ObjectId, ref: "Perfume", required: true },
        section:  { type: String, enum: ["full", "taqseem"], required: true },
        // "full"    = full bottle purchase
        // "taqseem" = individual / split purchase
        size:     { type: Number }, // ml — relevant for taqseem (e.g. 5, 10, 15 ml)
        quantity: { type: Number, required: true, min: 1, default: 1 },
      },
    ],

    // ── Account status ────────────────────────────────────────────────────────
    isActive: {
      type: Boolean,
      default: true,
    },

    // ── Password reset (for future email service) ─────────────────────────────
    // Fields are here but unused until email service is added
    resetPasswordToken:   { type: String, select: false },
    resetPasswordExpire:  { type: Date,   select: false },
  },
  {
    timestamps: true, // adds createdAt, updatedAt automatically
  }
);

// ── HOOKS ─────────────────────────────────────────────────────────────────────

// Hash password before saving
userSchema.pre("save", async function (next) {
  // Only hash if password was modified (new user or password change)
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Auto-generate username from email if not provided
userSchema.pre("save", function (next) {
  if (!this.username && this.email) {
    // Take everything before the @ sign
    this.username = this.email.split("@")[0];
  }
  next();
});

// ── METHODS ───────────────────────────────────────────────────────────────────

// Compare entered password with hashed password in DB
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);