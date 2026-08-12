// apps/backend-api/routes/rideRoutes.js
const express = require("express");
const router = express.Router();
const rideController = require("../controllers/rideController");
const {
  acceptRide,
  bookRide,
  cancelRideByRider,
  cancelRideByDriver,
  startRide,
  completeRide,
  getDriverHistory,
  getRiderHistory,
  getCurrentUserRide,
  getCurrentDriverRide,
} = require("../controllers/rideController");
const { protect, protectDriver } = require("../middleware/authMiddleware");

// Define the endpoints

router.get("/rider/history", protect, getRiderHistory);
router.get("/driver/history", protectDriver, getDriverHistory);
router.get("/current/user", protect, getCurrentUserRide);
router.get("/current/driver", protectDriver, getCurrentDriverRide);
router.post("/book", protect, bookRide);
router.put("/:rideId/cancel", protect, cancelRideByRider);
router.put("/:rideId/driver-cancel", protectDriver, cancelRideByDriver);
router.put("/:id/accept", protectDriver, acceptRide);
router.put("/:id/start", protectDriver, startRide);
router.put("/:id/complete", protectDriver, completeRide);

module.exports = router;
