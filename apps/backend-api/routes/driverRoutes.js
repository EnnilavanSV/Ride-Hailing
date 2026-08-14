const express = require("express");
const router = express.Router();
const {
  registerDriver,
  loginDriver,
  updateVehicleDetails,
  getDriverEarnings,
  getDriverProfile,
  updateDriverProfile,
  updateDutyStatus,
  updateLocation,
} = require("../controllers/driverController");
// createDispute is shared between riders and drivers — see controllers/disputeController.js
const { createDispute } = require("../controllers/disputeController");
const { protectDriver } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const {
  registerDriverValidator,
  loginValidator,
  createDisputeValidator,
  updateLocationValidator,
  updateVehicleValidator,
} = require("../middleware/validators");

// Map the registration route
router.post("/register", validate(registerDriverValidator), registerDriver);
router.post("/login", validate(loginValidator), loginDriver);
router.put("/duty-status", protectDriver, updateDutyStatus);
router.put(
  "/vehicle",
  protectDriver,
  validate(updateVehicleValidator),
  updateVehicleDetails,
);
router.get("/earnings", protectDriver, getDriverEarnings);
router.get("/profile", protectDriver, getDriverProfile);
router.put("/profile", protectDriver, updateDriverProfile);
router.put(
  "/location",
  protectDriver,
  validate(updateLocationValidator),
  updateLocation,
);
router.post(
  "/disputes",
  protectDriver,
  validate(createDisputeValidator),
  createDispute,
);

module.exports = router;
