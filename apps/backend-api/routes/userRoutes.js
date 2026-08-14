const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const {
  registerUserValidator,
  loginValidator,
  addAddressValidator,
  createDisputeValidator,
} = require("../middleware/validators");
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  addAddress,
  deleteAddress,
} = require("../controllers/userController");
// createDispute is shared between riders and drivers — see controllers/disputeController.js
const { createDispute } = require("../controllers/disputeController");

// Map the POST request to the registerUser controller function
router.post("/register", validate(registerUserValidator), registerUser);

// Map the POST request to the loginUser controller function
router.post("/login", validate(loginValidator), loginUser);

router.route("/profile").get(protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);

router
  .route("/saved-addresses")
  .post(protect, validate(addAddressValidator), addAddress);
router.route("/saved-addresses/:addressId").delete(protect, deleteAddress);
router.post("/disputes", protect, validate(createDisputeValidator), createDispute);

module.exports = router;
