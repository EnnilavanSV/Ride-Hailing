const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  addAddress,
  deleteAddress,
  createDispute,
} = require("../controllers/userController");

// Map the POST request to the registerUser controller function
router.post("/register", registerUser);

// Map the POST request to the loginUser controller function
router.post("/login", loginUser);

router.route("/profile").get(protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);

router.route("/saved-addresses").post(protect, addAddress);
router.route("/saved-addresses/:addressId").delete(protect, deleteAddress);
router.post("/disputes", protect, createDispute);

module.exports = router;
