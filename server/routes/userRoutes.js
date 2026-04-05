const express = require("express");
const router  = express.Router();
const { protect } = require("./../middleware/Auth");
const {
  getCart, addToCart, updateCartItem, removeFromCart, clearCart,
  getWishlist, toggleWishlist,
} = require("../controllers/cartWishlistController");

// Cart — all private (guests can't have a server-side cart)
router.get(   "/cart",          protect, getCart);
router.post(  "/cart",          protect, addToCart);
router.put(   "/cart/:itemId",  protect, updateCartItem);
router.delete("/cart/:itemId",  protect, removeFromCart);
router.delete("/cart",          protect, clearCart);

// Wishlist — all private
router.get( "/wishlist",              protect, getWishlist);
router.post("/wishlist/:perfumeId",   protect, toggleWishlist);

module.exports = router;