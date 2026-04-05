const express = require("express");
const router  = express.Router();
const { protect } = require("./../middleware/Auth");
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  addAddress,
  deleteAddress,
} = require("../controllers/authController");

// Public
router.post("/register", register);
router.post("/login",    login);

// Private (must be logged in)
router.get( "/me",              protect, getMe);
router.put( "/update-profile",  protect, updateProfile);
router.put( "/change-password", protect, changePassword);
router.post("/address",         protect, addAddress);
router.delete("/address/:addressId", protect, deleteAddress);

module.exports = router;