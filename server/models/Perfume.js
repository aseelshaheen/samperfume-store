const mongoose = require("mongoose");

// ── Review sub-schema ─────────────────────────────────────────────────────────
const reviewSchema = new mongoose.Schema(
  {
    user:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name:    { type: String, required: true },        // snapshot of username at review time
    rating:  { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

// ── Taqseem (individual split) size option sub-schema ─────────────────────────
// Each entry = one available size you can buy as a split
const taqseemSizeSchema = new mongoose.Schema(
  {
    ml:       { type: Number, required: true },   // e.g. 5, 10, 15, 20
    price:    { type: Number, required: true },
    stock:    { type: Number, required: true, default: 0 },
  },
  { _id: true }
);

// ── Main Perfume schema ───────────────────────────────────────────────────────
const perfumeSchema = new mongoose.Schema(
  {
    // ── Identity ──────────────────────────────────────────────────────────────
    name: {
      type: String,
      required: [true, "اسم العطر مطلوب"],
      trim: true,
    },

    brand: {
      type: String,
      required: [true, "البراند مطلوب"],
      trim: true,
    },

    // ── Classification ────────────────────────────────────────────────────────
    // Which section of the store this perfume belongs to
    perfumeType: {
      type: String,
      required: true,
      enum: [
        "arabic",     // عطور عربية  (oud-based, oriental, musk, etc.)
        "western",    // عطور أجنبية (French, Italian, American, etc.)
      ],
    },

    // Fragrance gender target
    gender: {
      type: String,
      enum: ["male", "female", "unisex"],
      required: true,
    },

    // Fragrance family / notes — for filtering
    fragranceFamily: {
      type: String,
      enum: [
        "oud", "woody", "floral", "oriental", "fresh",
        "citrus", "aquatic", "gourmand", "chypre", "fougere", "other",
      ],
    },

    description: {
      type: String,
      required: [true, "وصف العطر مطلوب"],
    },

    // ── Images ────────────────────────────────────────────────────────────────
    images: [
      {
        url:      { type: String, required: true }, // Cloudinary URL
        publicId: { type: String },                  // Cloudinary public_id (for deletion)
        isMain:   { type: Boolean, default: false }, // main display image
      },
    ],

    // ── Availability mode ─────────────────────────────────────────────────────
    // Controls which sections the perfume appears in
    availability: {
      type: String,
      required: true,
      enum: [
        "full_only",       // full bottles only  — appears only in full-bottle section
        "taqseem_only",    // taqseem only        — appears only in taqseem section
        "both",            // both sections       — cross-linked between the two
      ],
    },

    // ── Full Bottle details ───────────────────────────────────────────────────
    // Only populated when availability is "full_only" or "both"
    fullBottle: {
      price:   { type: Number },
      stock:   { type: Number, default: 0 },
      size_ml: { type: Number },     // e.g. 50, 100, 200 ml
    },

    // ── Taqseem (individual/split) details ────────────────────────────────────
    // Only populated when availability is "taqseem_only" or "both"
    // Each size is its own price + stock entry
    taqseem: {
      sizes:       { type: [taqseemSizeSchema], default: [] },
      // e.g. [{ ml: 5, price: 25, stock: 40 }, { ml: 10, price: 45, stock: 30 }]

      sourceBottle_ml: { type: Number },
      // The full bottle size being split from, for display purposes
      // e.g. "تقسيمات من قارورة 100 مل"
    },

    // ── SEO / URL slug ────────────────────────────────────────────────────────
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      // auto-generated from name+brand in pre-save hook below
    },

    // ── Ratings (aggregated) ──────────────────────────────────────────────────
    reviews:     { type: [reviewSchema], default: [] },
    rating:      { type: Number, default: 0 },       // average, recalculated on review add/edit
    reviewCount: { type: Number, default: 0 },

    // ── Visibility ────────────────────────────────────────────────────────────
    isActive: {
      type: Boolean,
      default: true, // set to false to hide without deleting
    },

    isFeatured: {
      type: Boolean,
      default: false, // shown in homepage featured section
    },

    // ── Optional promo ────────────────────────────────────────────────────────
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100, // percentage, 0 = no discount
    },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// ── VIRTUAL: final price after discount (full bottle) ─────────────────────────
perfumeSchema.virtual("fullBottle.finalPrice").get(function () {
  if (!this.fullBottle?.price) return null;
  if (!this.discount) return this.fullBottle.price;
  return +(this.fullBottle.price * (1 - this.discount / 100)).toFixed(2);
});

// ── HOOK: auto-generate slug from brand + name ────────────────────────────────
perfumeSchema.pre("save", function (next) {
  if (this.isModified("name") || this.isModified("brand") || !this.slug) {
    this.slug = `${this.brand}-${this.name}`
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\u0600-\u06FF-]/g, "") // keep Arabic chars, letters, digits, hyphens
      .replace(/--+/g, "-");
  }
  next();
});

// ── HOOK: recalculate average rating when reviews change ──────────────────────
perfumeSchema.methods.recalcRating = function () {
  if (this.reviews.length === 0) {
    this.rating = 0;
    this.reviewCount = 0;
  } else {
    const total = this.reviews.reduce((acc, r) => acc + r.rating, 0);
    this.rating = +(total / this.reviews.length).toFixed(1);
    this.reviewCount = this.reviews.length;
  }
};

// ── INDEXES for fast querying ──────────────────────────────────────────────────
perfumeSchema.index({ name: "text", brand: "text", description: "text" }); // full-text search
perfumeSchema.index({ availability: 1 });
perfumeSchema.index({ perfumeType: 1 });
perfumeSchema.index({ gender: 1 });
perfumeSchema.index({ isActive: 1, isFeatured: 1 });
perfumeSchema.index({ slug: 1 });

module.exports = mongoose.model("Perfume", perfumeSchema);