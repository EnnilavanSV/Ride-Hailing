const express = require("express");
const router = express.Router();
const {
  registerDriver,
  loginDriver,
  toggleAvailability,
  updateVehicleDetails,
  getDriverEarnings,
  getDriverProfile,
  updateDriverProfile,
  updateDutyStatus,
  updateLocation,
  createDispute,
} = require("../controllers/driverController");
const { protectDriver } = require("../middleware/authMiddleware");

// Map the registration route
router.post("/register", registerDriver);
router.post("/login", loginDriver);
router.put("/duty-status", protectDriver, updateDutyStatus);
router.put("/vehicle", protectDriver, updateVehicleDetails);
router.get("/earnings", protectDriver, getDriverEarnings);
router.get("/profile", protectDriver, getDriverProfile);
router.put("/profile", protectDriver, updateDriverProfile);
router.put("/location", protectDriver, updateLocation);
router.post("/disputes", protectDriver, createDispute);

module.exports = router;
