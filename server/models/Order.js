const mongoose = require("mongoose");

// ── Order Item sub-schema ─────────────────────────────────────────────────────
const orderItemSchema = new mongoose.Schema(
  {
    perfume:  { type: mongoose.Schema.Types.ObjectId, ref: "Perfume", required: true },
    name:     { type: String, required: true },  // snapshot at time of purchase
    brand:    { type: String, required: true },
    image:    { type: String },                  // main image URL snapshot

    section:  {
      type: String,
      enum: ["full", "taqseem"],
      required: true,
    },

    // For taqseem items — which size was ordered
    size_ml:  { type: Number },                  // null for full bottle

    quantity: { type: Number, required: true, min: 1 },
    price:    { type: Number, required: true },  // unit price at time of purchase
  },
  { _id: true }
);

// ── Shipping address snapshot ─────────────────────────────────────────────────
// Copied from user's address at checkout — independent of future address changes
const shippingAddressSchema = new mongoose.Schema(
  {
    city:   { type: String, required: true },
    area:   { type: String },
    street: { type: String },
    notes:  { type: String },
  },
  { _id: false }
);

// ── Main Order schema ─────────────────────────────────────────────────────────
const orderSchema = new mongoose.Schema(
  {
    // ── Who placed it ─────────────────────────────────────────────────────────
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ── What was ordered ──────────────────────────────────────────────────────
    items: {
      type: [orderItemSchema],
      required: true,
    },

    // ── Contact for this order ────────────────────────────────────────────────
    phone: {
      type: String,
      required: true,
    },

    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },

    // ── Pricing breakdown ─────────────────────────────────────────────────────
    itemsPrice:    { type: Number, required: true },  // subtotal
    shippingPrice: { type: Number, required: true, default: 0 },
    discount:      { type: Number, default: 0 },      // promo code discount
    totalPrice:    { type: Number, required: true },  // final amount

    promoCode:     { type: String },                  // code used if any

    // ── Payment ───────────────────────────────────────────────────────────────
    paymentMethod: {
      type: String,
      enum: ["cash_on_delivery", "online"],
      default: "cash_on_delivery",
    },

    isPaid:  { type: Boolean, default: false },
    paidAt:  { type: Date },

    // ── Fulfillment status ────────────────────────────────────────────────────
    status: {
      type: String,
      enum: [
        "pending",      // just placed, awaiting confirmation
        "confirmed",    // admin confirmed
        "processing",   // being prepared
        "shipped",      // on the way
        "delivered",    // received by customer
        "cancelled",    // cancelled by user or admin
      ],
      default: "pending",
    },

    // Admin notes — internal only
    adminNotes: { type: String, select: false },

    deliveredAt: { type: Date },
    cancelledAt: { type: Date },
    cancelReason:{ type: String },
  },
  {
    timestamps: true,
  }
);

// ── VIRTUAL: human-readable order number ──────────────────────────────────────
// e.g. "SP-00042"
orderSchema.virtual("orderNumber").get(function () {
  return `SP-${String(this._id).slice(-5).toUpperCase()}`;
});

module.exports = mongoose.model("Order", orderSchema);